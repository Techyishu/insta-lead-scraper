/**
 * Telegram Bot notification utility
 * Uses the Telegram Bot API to send messages to a specific chat/channel.
 *
 * Required env vars:
 *   TELEGRAM_BOT_TOKEN  — from @BotFather
 *   TELEGRAM_CHAT_ID    — your personal chat ID or channel ID (e.g. -100xxxxxxxxxx)
 */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const CHAT_ID   = process.env.TELEGRAM_CHAT_ID

export async function sendTelegramMessage(message: string): Promise<void> {
  if (!BOT_TOKEN || !CHAT_ID) {
    console.warn('[telegram] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set — skipping notification')
    return
  }

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`

  const res = await fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id:    CHAT_ID,
      text:       message,
      parse_mode: 'HTML',
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    console.error('[telegram] API error:', res.status, body)
    // Don't throw — a failed notification should never break the main flow
  }
}

/** Formats a new-signup notification message */
export function formatSignupMessage(opts: {
  name:      string
  email:     string
  plan:      string
  createdAt: string
}): string {
  const { name, email, plan, createdAt } = opts

  const planEmoji: Record<string, string> = {
    free:    '🆓',
    starter: '⚡',
    growth:  '🚀',
  }

  const emoji     = planEmoji[plan.toLowerCase()] ?? '📋'
  const timestamp = new Date(createdAt).toLocaleString('en-US', {
    timeZone:     'UTC',
    dateStyle:    'medium',
    timeStyle:    'short',
  })

  return [
    `🎉 <b>New Signup on LeadMapper!</b>`,
    ``,
    `👤 <b>Name:</b>  ${escapeHtml(name || 'Unknown')}`,
    `📧 <b>Email:</b> ${escapeHtml(email)}`,
    `${emoji} <b>Plan:</b>  ${capitalize(plan)}`,
    `🕐 <b>Time:</b>  ${timestamp} UTC`,
  ].join('\n')
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function escapeHtml(str: string): string {
  return str
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
