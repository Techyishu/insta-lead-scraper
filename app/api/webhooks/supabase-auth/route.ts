/**
 * Supabase Database Webhook — auth.users INSERT
 *
 * Supabase fires this endpoint whenever a new row is inserted into auth.users
 * (i.e., whenever a new user signs up).
 *
 * Setup in Supabase Dashboard:
 *   Database → Webhooks → Create a new hook
 *     Table:  auth.users
 *     Events: INSERT
 *     URL:    https://<your-domain>/api/webhooks/supabase-auth
 *     HTTP Headers:
 *       Authorization: Bearer <SUPABASE_WEBHOOK_SECRET>
 *
 * Required env vars:
 *   SUPABASE_WEBHOOK_SECRET   — any strong random string you generate
 *   TELEGRAM_BOT_TOKEN        — from @BotFather
 *   TELEGRAM_CHAT_ID          — your Telegram chat ID
 */

import { NextRequest, NextResponse } from 'next/server'
import { sendTelegramMessage, formatSignupMessage } from '@/lib/telegram'

// Supabase Database Webhook payload shape for auth.users INSERT
interface SupabaseAuthWebhookPayload {
  type:       'INSERT' | 'UPDATE' | 'DELETE'
  table:      string
  schema:     string
  record:     AuthUserRecord | null
  old_record: AuthUserRecord | null
}

interface AuthUserRecord {
  id:                  string
  email:               string
  created_at:          string
  raw_user_meta_data?: {
    full_name?: string
    name?:      string
    plan?:      string
  }
}

export async function POST(request: NextRequest) {
  // ── 1. Verify bearer token ────────────────────────────────────────────────
  const secret = process.env.SUPABASE_WEBHOOK_SECRET
  if (!secret) {
    console.error('[supabase-auth-webhook] SUPABASE_WEBHOOK_SECRET not set')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  const authHeader = request.headers.get('authorization') ?? ''
  const token      = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''

  if (token !== secret) {
    console.warn('[supabase-auth-webhook] unauthorized request')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── 2. Parse payload ──────────────────────────────────────────────────────
  let payload: SupabaseAuthWebhookPayload
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Only care about INSERT events on auth.users
  if (payload.type !== 'INSERT' || !payload.record) {
    return NextResponse.json({ received: true, skipped: true })
  }

  const user = payload.record
  const meta = user.raw_user_meta_data ?? {}

  const name  = meta.full_name ?? meta.name ?? 'Unknown'
  const email = user.email
  const plan  = meta.plan ?? 'free'

  console.log('[supabase-auth-webhook] new signup:', { email, plan })

  // ── 3. Send Telegram notification ────────────────────────────────────────
  try {
    const message = formatSignupMessage({
      name,
      email,
      plan,
      createdAt: user.created_at,
    })

    await sendTelegramMessage(message)
    console.log('[supabase-auth-webhook] ✅ Telegram notification sent for', email)
  } catch (err) {
    // Non-fatal — log but don't fail the webhook
    console.error('[supabase-auth-webhook] Failed to send Telegram notification:', err)
  }

  return NextResponse.json({ received: true })
}
