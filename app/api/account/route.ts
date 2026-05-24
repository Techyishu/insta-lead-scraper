import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { dodo } from '@/lib/dodo'

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function DELETE() {
  try {
    // ── 1. Auth ───────────────────────────────────────────────────────────────
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id
    console.log('[delete-account] starting deletion for user', userId)

    // ── 2. Cancel active DodoPayments subscription ────────────────────────────
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('dodo_subscription_id, plan')
      .eq('id', userId)
      .single()

    if (profile?.dodo_subscription_id && profile.plan !== 'free') {
      try {
        await dodo.subscriptions.update(profile.dodo_subscription_id, {
          cancel_at_next_billing_date: true,
          cancel_reason: 'cancelled_by_customer',
        })
        console.log('[delete-account] subscription cancelled:', profile.dodo_subscription_id)
      } catch (err) {
        // Non-fatal — don't block account deletion if DodoPayments fails
        console.warn('[delete-account] subscription cancel failed (continuing):', err)
      }
    }

    // ── 3. Delete all user data from Supabase ─────────────────────────────────
    // Order matters: leads reference searches (FK), searches reference user_profiles
    const { error: leadsErr } = await supabaseAdmin
      .from('leads')
      .delete()
      .eq('user_id', userId)

    if (leadsErr) console.warn('[delete-account] leads delete error:', leadsErr.message)

    const { error: searchesErr } = await supabaseAdmin
      .from('searches')
      .delete()
      .eq('user_id', userId)

    if (searchesErr) console.warn('[delete-account] searches delete error:', searchesErr.message)

    const { error: profileErr } = await supabaseAdmin
      .from('user_profiles')
      .delete()
      .eq('id', userId)

    if (profileErr) console.warn('[delete-account] profile delete error:', profileErr.message)

    // ── 4. Delete auth user (point of no return) ──────────────────────────────
    const { error: authDeleteErr } = await supabaseAdmin.auth.admin.deleteUser(userId)
    if (authDeleteErr) {
      console.error('[delete-account] auth user delete FAILED:', authDeleteErr.message)
      return NextResponse.json(
        { error: 'Failed to delete auth user. Contact support.' },
        { status: 500 }
      )
    }

    console.log('[delete-account] ✅ account fully deleted for user', userId)
    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('[delete-account] unexpected error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to delete account' },
      { status: 500 }
    )
  }
}
