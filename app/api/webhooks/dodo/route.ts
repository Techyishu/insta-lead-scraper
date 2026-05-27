import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { createClient } from '@supabase/supabase-js'
import { PLAN_CONFIGS, PRODUCT_ID_TO_PLAN } from '@/lib/dodo'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  // ── 1. Read raw body ──────────────────────────────────────────────────────
  const body = await request.text()

  // ── 2. Verify signature ───────────────────────────────────────────────────
  const secret = process.env.DODO_WEBHOOK_SECRET
  if (!secret) {
    console.error('[dodo-webhook] DODO_WEBHOOK_SECRET not set')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  let event: Record<string, unknown>
  try {
    const wh = new Webhook(secret)
    event = wh.verify(body, {
      'webhook-id':        request.headers.get('webhook-id') ?? '',
      'webhook-timestamp': request.headers.get('webhook-timestamp') ?? '',
      'webhook-signature': request.headers.get('webhook-signature') ?? '',
    }) as Record<string, unknown>
  } catch (err) {
    console.error('[dodo-webhook] signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const eventType = event.type as string
  const data      = (event.data ?? event) as Record<string, unknown>

  console.log('[dodo-webhook] received:', eventType)
  if (process.env.NODE_ENV === 'development') {
    console.log('[dodo-webhook] payload:', JSON.stringify(event, null, 2))
  }

  // ── 3. Route events ───────────────────────────────────────────────────────
  try {
    switch (eventType) {
      // New subscription activated after first payment
      case 'subscription.active':
      case 'subscription.created':
        await handleActivation(data)
        break

      // ✅ Plan changed via changePlan API — docs say this fires after changePlan
      case 'subscription.plan_changed':
        await handleActivation(data)
        break

      // subscription.updated: fires on any subscription record change.
      // Only act when status becomes "active" and we can identify the plan.
      case 'subscription.updated':
        await handleSubscriptionUpdated(data)
        break

      // Renewal — reset credits_used to 0
      case 'subscription.renewed':
        await handleRenewal(data)
        break

      // payment.succeeded: fires alongside subscription.active on first payment
      // and on renewals. Activate if plan found; otherwise just reset credits.
      case 'payment.succeeded':
        await handlePaymentSucceeded(data)
        break

      case 'subscription.cancelled':
      case 'subscription.expired':
        await handleCancellation(data)
        break

      default:
        console.log('[dodo-webhook] unhandled event (ignored):', eventType)
    }
  } catch (err) {
    console.error('[dodo-webhook] handler error:', err)
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

// ── Handlers ──────────────────────────────────────────────────────────────────

async function handleActivation(data: Record<string, unknown>) {
  const userId         = await resolveUserId(data)
  const plan           = resolvePlan(data)
  const customerId     = extractString(data, 'customer_id')
  const subscriptionId = extractString(data, 'subscription_id') ?? extractString(data, 'id')

  if (!userId || !plan) {
    console.error('[dodo-webhook] activation: missing user_id or plan', {
      userId, plan,
      metadataKeys: Object.keys((data.metadata as object | undefined) ?? {}),
      productId: data.product_id,
    })
    return
  }

  const config = PLAN_CONFIGS[plan]
  if (!config) {
    console.error('[dodo-webhook] unknown plan:', plan)
    return
  }

  const { error } = await supabaseAdmin
    .from('user_profiles')
    .update({
      plan,
      credits_limit:           config.credits_limit,
      credits_used:            0,
      enrichment_emails_used:  0,
      dodo_customer_id:        customerId     ?? null,
      dodo_subscription_id:    subscriptionId ?? null,
      updated_at:              new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) console.error('[dodo-webhook] activation update failed:', error.message)
  else       console.log('[dodo-webhook] ✅ activated plan', plan, 'for user', userId)
}

async function handleRenewal(data: Record<string, unknown>) {
  const userId = await resolveUserId(data)
  if (!userId) { console.error('[dodo-webhook] renewal: missing user_id'); return }

  const { error } = await supabaseAdmin
    .from('user_profiles')
    .update({ credits_used: 0, enrichment_emails_used: 0, updated_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) console.error('[dodo-webhook] renewal reset failed:', error.message)
  else       console.log('[dodo-webhook] ✅ credits reset for user', userId)
}

async function handlePaymentSucceeded(data: Record<string, unknown>) {
  const userId = await resolveUserId(data)
  const plan   = resolvePlan(data)

  if (!userId) { console.error('[dodo-webhook] payment.succeeded: missing user_id'); return }

  if (plan && PLAN_CONFIGS[plan]) {
    await handleActivation(data)
  } else {
    await handleRenewal(data)
  }
}

async function handleSubscriptionUpdated(data: Record<string, unknown>) {
  const status = data.status as string | undefined
  if (status === 'active') {
    const plan = resolvePlan(data)
    if (plan && PLAN_CONFIGS[plan]) {
      await handleActivation(data)
    }
  } else if (status === 'cancelled' || status === 'expired') {
    await handleCancellation(data)
  }
}

async function handleCancellation(data: Record<string, unknown>) {
  const userId = await resolveUserId(data)
  if (!userId) { console.error('[dodo-webhook] cancellation: missing user_id'); return }

  const { error } = await supabaseAdmin
    .from('user_profiles')
    .update({
      plan:                 'free',
      credits_limit:        50,
      dodo_subscription_id: null,
      cancel_at_period_end: false,
      updated_at:           new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) console.error('[dodo-webhook] cancellation failed:', error.message)
  else       console.log('[dodo-webhook] ✅ downgraded to free for user', userId)
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Resolve user_id from:
 *   1. metadata.user_id  (set by subscriptions.create / changePlan)
 *   2. data.user_id
 *   3. customer email → look up in auth.users (fallback for checkoutSessions flow)
 */
async function resolveUserId(data: Record<string, unknown>): Promise<string | null> {
  const meta = data.metadata as Record<string, unknown> | undefined
  const fromMeta = (meta?.user_id ?? data.user_id ?? null) as string | null
  if (fromMeta) return fromMeta

  // Fallback: look up by customer email
  const customer = data.customer as Record<string, unknown> | undefined
  const email    = customer?.email as string | undefined
  if (!email) return null

  const { data: rows } = await supabaseAdmin
    .rpc('get_user_id_by_email', { p_email: email })
    .single() as { data: string | null }

  if (rows) return rows

  console.warn('[dodo-webhook] could not resolve user_id for email:', email)
  return null
}

/**
 * Resolve plan from:
 *   1. metadata.plan     (set by subscriptions.create / changePlan)
 *   2. data.plan
 *   3. product_id        (reverse lookup — used when checkoutSessions sets no sub metadata)
 */
function resolvePlan(data: Record<string, unknown>): string | null {
  const meta = data.metadata as Record<string, unknown> | undefined
  const fromMeta = (meta?.plan ?? data.plan ?? null) as string | null
  if (fromMeta) return fromMeta

  const productId = data.product_id as string | undefined
  return productId ? (PRODUCT_ID_TO_PLAN[productId] ?? null) : null
}

function extractString(data: Record<string, unknown>, key: string): string | null {
  return typeof data[key] === 'string' ? data[key] as string : null
}
