import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { dodo, PLAN_PRODUCT_IDS } from '@/lib/dodo'

const ALLOWED_PLANS = ['starter', 'growth'] as const
type UpgradePlan = typeof ALLOWED_PLANS[number]

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const plan = request.nextUrl.searchParams.get('plan') ?? ''
    if (!(ALLOWED_PLANS as readonly string[]).includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const productId = PLAN_PRODUCT_IDS[plan as UpgradePlan]
    if (!productId) {
      return NextResponse.json({ error: 'Product not configured' }, { status: 500 })
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('dodo_subscription_id, cancel_at_period_end')
      .eq('id', user.id)
      .single()

    if (!profile?.dodo_subscription_id) {
      return NextResponse.json({ needsCheckout: true })
    }

    // If subscription is pending cancellation, we must temporarily uncancel it
    // to call previewChangePlan (DodoPayments returns 409 otherwise), then re-cancel
    // so the subscription state is unchanged until the user explicitly confirms.
    if (profile.cancel_at_period_end) {
      try {
        // Step 1: uncancel so previewChangePlan won't 409
        await dodo.subscriptions.update(profile.dodo_subscription_id, {
          cancel_at_next_billing_date: false,
        })

        let amount: number | null   = null
        let currency: string | null = null

        try {
          const preview = await dodo.subscriptions.previewChangePlan(
            profile.dodo_subscription_id,
            {
              product_id:             productId,
              proration_billing_mode: 'prorated_immediately',
              quantity:               1,
            }
          )
          amount   = preview.immediate_charge.summary.total_amount
          currency = preview.immediate_charge.summary.currency
        } finally {
          // Step 2: always re-cancel — user hasn't confirmed yet
          try {
            await dodo.subscriptions.update(profile.dodo_subscription_id, {
              cancel_at_next_billing_date: true,
              cancel_reason: 'cancelled_by_customer',
            })
          } catch (reCancelErr) {
            console.error('[preview-upgrade] re-cancel after preview failed:', reCancelErr)
          }
        }

        if (amount !== null && currency !== null) {
          return NextResponse.json({ needsReactivate: true, amount, currency })
        }
        // Couldn't get amount but that's fine — still show reactivate modal without amount
        return NextResponse.json({ needsReactivate: true })
      } catch (err) {
        console.warn('[preview-upgrade] reactivate-preview flow failed:', err)
        return NextResponse.json({ needsReactivate: true })
      }
    }

    try {
      const preview = await dodo.subscriptions.previewChangePlan(
        profile.dodo_subscription_id,
        {
          product_id:             productId,
          proration_billing_mode: 'prorated_immediately',
          quantity:               1,
        }
      )
      const summary = preview.immediate_charge.summary
      return NextResponse.json({ amount: summary.total_amount, currency: summary.currency })
    } catch (previewErr) {
      // Subscription may be in an unexpected state — fall back to fresh checkout
      console.warn('[preview-upgrade] previewChangePlan failed, falling back to checkout:', previewErr)
      return NextResponse.json({ needsCheckout: true })
    }

  } catch (err) {
    console.error('[preview-upgrade] error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to preview upgrade' },
      { status: 500 }
    )
  }
}
