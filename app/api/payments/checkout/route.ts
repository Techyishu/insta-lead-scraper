import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { dodo, PLAN_PRODUCT_IDS, PLAN_CONFIGS } from '@/lib/dodo'

const ALLOWED_PLANS = ['starter', 'growth', 'scale'] as const
type UpgradePlan = typeof ALLOWED_PLANS[number]
const PLAN_ORDER  = ['free', 'starter', 'growth', 'scale']

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    // ── 1. Auth ───────────────────────────────────────────────────────────────
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ── 2. Validate plan ──────────────────────────────────────────────────────
    const body = await request.json().catch(() => ({}))
    const plan = typeof body.plan === 'string' ? body.plan.toLowerCase() : ''

    if (!(ALLOWED_PLANS as readonly string[]).includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const productId = PLAN_PRODUCT_IDS[plan as UpgradePlan]
    if (!productId) {
      return NextResponse.json(
        { error: `Product ID for plan "${plan}" is not configured` },
        { status: 500 }
      )
    }

    // ── 3. Get user profile ───────────────────────────────────────────────────
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('full_name, dodo_customer_id, dodo_subscription_id, plan, cancel_at_period_end')
      .eq('id', user.id)
      .single()

    console.log('[checkout] user:', user.id, 'currentPlan:', profile?.plan, 'targetPlan:', plan)
    console.log('[checkout] subscriptionId:', profile?.dodo_subscription_id ?? 'none')

    // Prevent downgrade via direct API call
    const currentIdx = PLAN_ORDER.indexOf(profile?.plan ?? 'free')
    const newIdx     = PLAN_ORDER.indexOf(plan)
    if (newIdx <= currentIdx) {
      return NextResponse.json(
        { error: 'Cannot downgrade or re-purchase current plan' },
        { status: 400 }
      )
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    // ── 4a. Upgrade existing subscription (e.g. Starter → Growth) ────────────
    if (profile?.dodo_subscription_id) {
      console.log('[checkout] upgrading existing subscription via changePlan')

      // If subscription is scheduled for cancellation, uncancel it first.
      // DodoPayments returns 409 on changePlan/previewChangePlan for such subscriptions.
      if (profile.cancel_at_period_end) {
        console.log('[checkout] subscription is pending cancellation — uncancelling first')
        try {
          await dodo.subscriptions.update(profile.dodo_subscription_id, {
            cancel_at_next_billing_date: false,
          })
        } catch (err) {
          console.error('[checkout] uncancel FAILED:', err)
          return NextResponse.json(
            { error: err instanceof Error ? err.message : 'Failed to reactivate subscription before upgrade' },
            { status: 500 }
          )
        }
        // Clear the DB flag immediately so UI reflects reactivation
        await supabaseAdmin
          .from('user_profiles')
          .update({ cancel_at_period_end: false, updated_at: new Date().toISOString() })
          .eq('id', user.id)
        console.log('[checkout] uncancel succeeded')
      }

      // Patch metadata BEFORE changePlan so that when the subscription.plan_changed
      // webhook fires it already sees the correct plan in metadata. If we patch after,
      // the webhook arrives with stale metadata (old plan) and overwrites the DB.
      try {
        await dodo.subscriptions.update(profile.dodo_subscription_id, {
          metadata: { user_id: user.id, plan },
        })
        console.log('[checkout] metadata patched to', plan)
      } catch (err) {
        // Non-fatal but log it — webhook will fall back to product_id lookup
        console.warn('[checkout] metadata patch failed (non-fatal):', err)
      }

      try {
        await dodo.subscriptions.changePlan(profile.dodo_subscription_id, {
          product_id:             productId,
          proration_billing_mode: 'prorated_immediately',
          quantity:               1,
          effective_at:           'immediately',
        })
        console.log('[checkout] changePlan succeeded')
      } catch (err) {
        console.error('[checkout] changePlan FAILED:', err)
        return NextResponse.json(
          { error: err instanceof Error ? err.message : 'Plan change failed' },
          { status: 500 }
        )
      }

      // Update Supabase immediately — don't rely on webhook for this path
      const config = PLAN_CONFIGS[plan]
      const { error: dbError } = await supabaseAdmin
        .from('user_profiles')
        .update({
          plan,
          credits_limit:        config.credits_limit,
          credits_used:         0,
          b2b_credits_limit:    config.b2b_credits_limit,
          b2b_credits_used:     0,
          cancel_at_period_end: false,
          updated_at:           new Date().toISOString(),
        })
        .eq('id', user.id)

      if (dbError) {
        console.error('[checkout] Supabase update FAILED:', dbError.message)
        return NextResponse.json(
          { error: 'Plan changed but failed to update your profile. Contact support.' },
          { status: 500 }
        )
      }

      console.log('[checkout] ✅ upgraded to', plan, 'for user', user.id)
      return NextResponse.json({ upgraded: true, plan })
    }

    // ── 4b. New subscription — use checkoutSessions (docs-recommended approach) ─
    // checkoutSessions.create creates a fresh checkout independent of any existing
    // customer state, preventing stale payment_link issues from prior subscriptions.
    console.log('[checkout] creating new checkout session for plan:', plan)

    const session = await dodo.checkoutSessions.create({
      product_cart: [{ product_id: productId, quantity: 1 }],
      customer: {
        email: user.email!,
        name:  (profile?.full_name as string) || user.email!.split('@')[0],
        ...(profile?.dodo_customer_id
          ? { customer_id: profile.dodo_customer_id }
          : {}),
      },
      // metadata goes on the payment/session; webhook also gets product_id for plan lookup
      metadata:   { user_id: user.id, plan },
      return_url: `${appUrl}/dashboard/billing?payment=success&plan=${plan}`,
    })

    const checkoutUrl = session.checkout_url
    if (!checkoutUrl) {
      throw new Error('DodoPayments did not return a checkout_url')
    }

    console.log('[checkout] checkout session created for plan:', plan)
    return NextResponse.json({ url: checkoutUrl })

  } catch (error) {
    console.error('[dodo] checkout error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create checkout' },
      { status: 500 }
    )
  }
}
