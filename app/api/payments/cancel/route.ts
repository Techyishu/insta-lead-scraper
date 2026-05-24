import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { dodo } from '@/lib/dodo'

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST() {
  try {
    // ── Auth ──────────────────────────────────────────────────────────────────
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ── Get subscription ──────────────────────────────────────────────────────
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('dodo_subscription_id, plan')
      .eq('id', user.id)
      .single()

    if (!profile?.dodo_subscription_id) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 400 })
    }
    if (profile.plan === 'free') {
      return NextResponse.json({ error: 'No paid subscription to cancel' }, { status: 400 })
    }

    // ── Schedule cancellation at end of billing period ────────────────────────
    await dodo.subscriptions.update(profile.dodo_subscription_id, {
      cancel_at_next_billing_date: true,
      cancel_reason: 'cancelled_by_customer',
    })

    // ── Persist the pending-cancel flag so UI reflects it immediately ─────────
    await supabaseAdmin
      .from('user_profiles')
      .update({ cancel_at_period_end: true, updated_at: new Date().toISOString() })
      .eq('id', user.id)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[cancel-subscription] error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}
