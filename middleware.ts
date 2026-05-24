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

  const { data: { user } } = await supabase.auth.getUser()

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
