import { NextRequest, NextResponse } from 'next/server'
import { resend } from '@/lib/resend'
import { sendTelegramMessage, formatContactMessage } from '@/lib/telegram'

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json()

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    // Fire Telegram notification in parallel — non-blocking
    sendTelegramMessage(formatContactMessage({ name, email, subject, message })).catch(() => {})

    await resend.emails.send({
      from:     process.env.RESEND_FROM_EMAIL ?? 'LeadMapper <noreply@leadmapper.pro>',
      to:       process.env.SUPPORT_EMAIL ?? 'shashanksingh67567@gmail.com',
      replyTo:  email,
      subject:  `[Contact] ${subject} — from ${name}`,
      html: `
        <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#111">
          <h2 style="font-size:18px;font-weight:700;margin:0 0 16px">New contact form submission</h2>
          <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px">
            <tr><td style="padding:8px 0;color:#666;width:100px"><strong>Name</strong></td><td style="padding:8px 0;color:#111">${name}</td></tr>
            <tr><td style="padding:8px 0;color:#666"><strong>Email</strong></td><td style="padding:8px 0;color:#111">${email}</td></tr>
            <tr><td style="padding:8px 0;color:#666"><strong>Subject</strong></td><td style="padding:8px 0;color:#111">${subject}</td></tr>
          </table>
          <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;font-size:14px;color:#374151;line-height:1.6;white-space:pre-wrap">${message}</div>
          <p style="color:#9ca3af;font-size:12px;margin-top:24px">Reply to this email to respond to ${name}.</p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[contact] email failed:', err)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
