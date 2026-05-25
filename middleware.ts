import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // getUser() validates the session against the server and refreshes the access
  // token when needed. If the stored refresh token is expired or revoked it
  // throws AuthApiError ("Refresh Token Not Found"). In that case we treat the
  // visitor as unauthenticated AND sign them out locally so the stale cookie is
  // cleared from the response before it reaches the browser.
  let user: Awaited<ReturnType<typeof supabase.auth.getUser>>['data']['user'] = null
  try {
    const { data, error } = await supabase.auth.getUser()
    if (error) {
      // Purge the stale session so the browser stops sending the bad token.
      await supabase.auth.signOut({ scope: 'local' })
    } else {
      user = data.user
    }
  } catch {
    // Network or unexpected error — treat as unauthenticated, don't crash.
  }

  const { pathname } = request.nextUrl
  const isDashboard = pathname.startsWith('/dashboard')
  const isAuthPage = pathname === '/login' || pathname === '/signup'
  const isVerifyPage = pathname === '/verify-email'
  const isConfirmed = !!user?.email_confirmed_at

  // No session → must log in
  if (!user && isDashboard) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Signed in but email not confirmed → must verify
  if (user && !isConfirmed && isDashboard) {
    return NextResponse.redirect(new URL('/verify-email', request.url))
  }

  // Confirmed user has no business on auth or verify pages
  if (user && isConfirmed && (isAuthPage || isVerifyPage)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Unconfirmed user trying to reach login/signup → let them (they may want to resend)
  // but redirect away from verify page only if they have no session at all
  if (!user && isVerifyPage) {
    // Allow — they may have arrived from a direct link; page handles missing email gracefully
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup', '/verify-email'],
}
