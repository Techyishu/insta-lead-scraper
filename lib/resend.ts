import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = process.env.RESEND_FROM_EMAIL ?? 'LeadMapper <noreply@leadmapper.co>'

// ── Email: export completed ───────────────────────────────────────────────────

export async function sendExportCompletedEmail({
  to,
  name,
  keyword,
  location,
  count,
}: {
  to: string
  name: string
  keyword: string
  location: string
  count: number
}) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `Your export is ready — ${count} leads`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#111">
        <h2 style="font-size:20px;font-weight:700;margin:0 0 8px">Your export is ready ✅</h2>
        <p style="color:#555;font-size:14px;margin:0 0 24px">
          Hi ${name || 'there'}, your CSV export has been downloaded successfully.
        </p>
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:16px 20px;margin-bottom:24px">
          <p style="margin:0 0 6px;font-size:13px;color:#666"><strong style="color:#111">Keyword:</strong> ${keyword}</p>
          <p style="margin:0 0 6px;font-size:13px;color:#666"><strong style="color:#111">Location:</strong> ${location}</p>
          <p style="margin:0;font-size:13px;color:#666"><strong style="color:#111">Leads exported:</strong> ${count}</p>
        </div>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display:inline-block;background:#1d4ed8;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:10px 20px;border-radius:8px">
          Go to Dashboard →
        </a>
        <p style="color:#999;font-size:12px;margin-top:32px">
          You're receiving this because export notifications are enabled.<br/>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings" style="color:#6b7280">Manage notification preferences</a>
        </p>
      </div>
    `,
  })
}

// ── Email: low credits warning ────────────────────────────────────────────────

export async function sendLowCreditsEmail({
  to,
  name,
  remaining,
}: {
  to: string
  name: string
  remaining: number
}) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `⚠️ You only have ${remaining} credits left`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#111">
        <h2 style="font-size:20px;font-weight:700;margin:0 0 8px">Running low on credits ⚡</h2>
        <p style="color:#555;font-size:14px;margin:0 0 24px">
          Hi ${name || 'there'}, you only have <strong>${remaining} credits</strong> remaining on your LeadMapper account.
          Upgrade now to keep finding leads without interruption.
        </p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing" style="display:inline-block;background:#1d4ed8;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:10px 20px;border-radius:8px">
          Upgrade my plan →
        </a>
        <p style="color:#999;font-size:12px;margin-top:32px">
          You're receiving this because low credits warnings are enabled.<br/>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings" style="color:#6b7280">Manage notification preferences</a>
        </p>
      </div>
    `,
  })
}
