import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendExportCompletedEmail } from '@/lib/resend'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { keyword, location, count } = await request.json()

    // Check user's notification preference
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('notify_export, full_name')
      .eq('id', user.id)
      .single()

    if (!profile?.notify_export) {
      return NextResponse.json({ skipped: true })
    }

    await sendExportCompletedEmail({
      to:       user.email!,
      name:     profile.full_name ?? '',
      keyword:  keyword ?? '',
      location: location ?? '',
      count:    count ?? 0,
    })

    return NextResponse.json({ sent: true })
  } catch (err) {
    // Non-fatal — log and return ok so the export itself isn't affected
    console.error('[send-export] email failed:', err)
    return NextResponse.json({ error: 'Email failed' }, { status: 500 })
  }
}
