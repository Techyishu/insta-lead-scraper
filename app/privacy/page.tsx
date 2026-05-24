import type { Metadata } from 'next'
import Link from "next/link"
import { Search, Mail } from "lucide-react"

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Learn how LeadMapper collects, uses, and protects your data. We take privacy seriously and are fully GDPR compliant.',
  alternates: { canonical: 'https://leadmapper.pro/privacy' },
  robots: { index: true, follow: true },
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-semibold text-neutral-900 mb-3">{title}</h2>
      <div className="space-y-3 text-sm text-neutral-500 leading-relaxed">{children}</div>
    </section>
  )
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="LeadMapper" className="w-8 h-8 object-contain" />
            <span className="font-display font-bold text-neutral-900 text-[1.1rem] tracking-tight">LeadMapper</span>
          </Link>
          <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
            ← Back to home
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-16">
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-widest mb-3">Legal</p>
          <h1 className="font-display font-bold text-4xl text-neutral-900 mb-3 tracking-tight">Privacy Policy</h1>
          <p className="text-sm text-neutral-400">
            Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>

        {/* Contact email callout */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 flex items-center gap-3 mb-8">
          <Mail size={16} className="text-blue-700 flex-shrink-0" strokeWidth={2} />
          <p className="text-sm text-blue-800">
            Privacy questions?{" "}
            <a href="mailto:shashanksingh67567@gmail.com" className="font-semibold underline underline-offset-2 hover:text-blue-900">
              shashanksingh67567@gmail.com
            </a>
            {" "}— we respond within 24 hours.
          </p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-8 shadow-sm space-y-8">
          <Section title="1. Introduction">
            LeadMapper ("we", "our", or "us") is committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, store, and share information when you use our platform at leadmapper.pro (the "Service"). By using LeadMapper, you agree to the collection and use of information in accordance with this policy.
          </Section>

          <Section title="2. Information We Collect">
            <p><strong className="text-neutral-700">Account Information:</strong> When you register, we collect your name, email address, and password (stored as a secure hash).</p>
            <p><strong className="text-neutral-700">Usage Data:</strong> We collect information about how you use the Service, including search queries (keywords and locations), export activity, pages visited, and features used. This data helps us improve the product.</p>
            <p><strong className="text-neutral-700">Payment Information:</strong> Payment processing is handled by DodoPayments. We do not store full card numbers. We receive and retain billing address and transaction history for invoicing purposes.</p>
            <p><strong className="text-neutral-700">Business Lead Data:</strong> When you run searches, we process your query to retrieve public business data from third-party sources (Google Maps via Apify). This data is logged to track credit usage.</p>
            <p><strong className="text-neutral-700">Device and Technical Data:</strong> We automatically collect IP addresses, browser type, device type, and operating system for security and analytics purposes.</p>
          </Section>

          <Section title="3. How We Use Your Information">
            <ul className="list-disc list-inside space-y-1">
              <li>To provide, operate, and improve the LeadMapper Service</li>
              <li>To process payments and manage subscriptions via DodoPayments</li>
              <li>To track credit usage and enforce fair usage limits</li>
              <li>To send transactional emails (password resets, billing receipts, export confirmations)</li>
              <li>To send product update emails (only if you've opted in)</li>
              <li>To prevent fraud, abuse, and unauthorized access</li>
              <li>To comply with legal obligations under the DPDPA 2023 and applicable laws</li>
            </ul>
          </Section>

          <Section title="4. Third-Party Services">
            <p>We use the following third-party services which may process your data:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong className="text-neutral-700">Supabase</strong> — Authentication and database hosting</li>
              <li><strong className="text-neutral-700">DodoPayments</strong> — Payment processing</li>
              <li><strong className="text-neutral-700">Apify</strong> — Business data retrieval from Google Maps</li>
              <li><strong className="text-neutral-700">Resend</strong> — Transactional email delivery</li>
              <li><strong className="text-neutral-700">Vercel</strong> — Hosting and CDN infrastructure</li>
            </ul>
            <p>Each third party operates under their own privacy policy. We only share data necessary for the service to function.</p>
          </Section>

          <Section title="5. Data Retention">
            We retain your account data for as long as your account is active. Search logs are retained for 90 days. Billing records are retained for 7 years as required by financial regulations. You may request earlier deletion by contacting us at{" "}
            <a href="mailto:shashanksingh67567@gmail.com" className="text-blue-700 hover:text-blue-800">shashanksingh67567@gmail.com</a>.
          </Section>

          <Section title="6. Data Breach Notification (DPDPA 2023)">
            In the event of a personal data breach that is likely to result in risk to your rights and freedoms, we will:
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Notify the Data Protection Board of India as required under the DPDPA 2023</li>
              <li>Inform affected users via email at the address associated with their account without undue delay</li>
              <li>Describe the nature of the breach, data categories affected, likely consequences, and measures taken</li>
            </ul>
            To report a suspected security issue, email us immediately at{" "}
            <a href="mailto:shashanksingh67567@gmail.com" className="text-blue-700 hover:text-blue-800">shashanksingh67567@gmail.com</a>.
          </Section>

          <Section title="7. Your Rights">
            Under the DPDPA 2023 and applicable laws, you have the right to:
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Access your personal data we hold</li>
              <li>Correct inaccurate or incomplete data</li>
              <li>Request deletion ("right to erasure") — use the account deletion feature in Settings</li>
              <li>Withdraw consent for processing at any time</li>
              <li>Nominate a person to exercise rights on your behalf</li>
              <li>File a complaint with the Data Protection Board of India</li>
            </ul>
            To exercise any of these rights, contact us at{" "}
            <a href="mailto:shashanksingh67567@gmail.com" className="text-blue-700 hover:text-blue-800">shashanksingh67567@gmail.com</a>{" "}
            or use our <Link href="/contact" className="text-blue-700 hover:text-blue-800">Contact page</Link>.
          </Section>

          <Section title="8. Cookies">
            We use essential cookies for authentication and session management. We display a cookie consent notice on first visit. You may decline non-essential cookies at any time.
          </Section>

          <Section title="9. Data Security">
            We implement industry-standard security measures including HTTPS encryption, hashed passwords, and role-based access controls. However, no system is 100% secure. Please report any vulnerabilities to{" "}
            <a href="mailto:shashanksingh67567@gmail.com" className="text-blue-700 hover:text-blue-800">shashanksingh67567@gmail.com</a>.
          </Section>

          <Section title="10. Children's Privacy">
            LeadMapper is not intended for users under 18 years of age. We do not knowingly collect personal information from minors.
          </Section>

          <Section title="11. Changes to This Policy">
            We may update this Privacy Policy from time to time. We will notify you of significant changes via email or a notice on the platform. Continued use of the Service after changes constitutes acceptance.
          </Section>

          <Section title="12. Contact & Grievance Officer">
            <p>For privacy-related questions or grievances (as required under DPDPA 2023):</p>
            <p>
              <strong className="text-neutral-700">Email:</strong>{" "}
              <a href="mailto:shashanksingh67567@gmail.com" className="text-blue-700 hover:text-blue-800">shashanksingh67567@gmail.com</a>
            </p>
            <p>
              <strong className="text-neutral-700">Response time:</strong> Within 72 hours for data requests, 24 hours for urgent security matters.
            </p>
            <p>You may also use our <Link href="/contact" className="text-blue-700 hover:text-blue-800">Contact page</Link> to reach us.</p>
          </Section>
        </div>
      </main>
    </div>
  )
}
