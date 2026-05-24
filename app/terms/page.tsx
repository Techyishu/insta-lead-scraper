import type { Metadata } from 'next'
import Link from "next/link"
import { Search } from "lucide-react"

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Read the LeadMapper Terms of Service. Understand your rights and responsibilities when using our lead generation platform.',
  alternates: { canonical: 'https://leadmapper.pro/terms' },
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

export default function TermsPage() {
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
          <h1 className="font-display font-bold text-4xl text-neutral-900 mb-3 tracking-tight">Terms of Service</h1>
          <p className="text-sm text-neutral-400">
            Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-8 shadow-sm space-y-8">
          <Section title="1. Acceptance of Terms">
            By accessing or using LeadMapper ("Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the Service.
          </Section>

          <Section title="2. Description of Service">
            LeadMapper is a SaaS platform that enables users to search for publicly available local business data (from Google Maps via third-party APIs), filter results, and export them in CSV format for sales, marketing, and outreach activities.
          </Section>

          <Section title="3. Account Registration">
            <p>You must create an account to use the Service. You agree to provide accurate, current, and complete information and to keep your account credentials secure. You are responsible for all activity that occurs under your account.</p>
            <p>Accounts are for individual use only. Sharing accounts between multiple users is prohibited.</p>
          </Section>

          <Section title="4. Credits System">
            <p>The Service operates on a credit-based system. Each business lead retrieved costs 1 credit. Credits are allocated per billing cycle based on your subscription plan.</p>
            <p>Unused credits do not roll over. Credits are non-refundable once consumed. Free plan credits are lifetime-limited (50 total), not monthly.</p>
          </Section>

          <Section title="5. Acceptable Use">
            <p>You agree NOT to use the Service to:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Send unsolicited spam or violate anti-spam laws (CAN-SPAM, GDPR, etc.)</li>
              <li>Resell or redistribute data for commercial data resale purposes</li>
              <li>Harass, stalk, or threaten individuals or businesses</li>
              <li>Violate any applicable local, national, or international law</li>
              <li>Attempt to reverse engineer or exploit the Service's security</li>
              <li>Create multiple accounts to circumvent credit limits</li>
            </ul>
            <p>Violation of these terms may result in immediate account termination without refund.</p>
          </Section>

          <Section title="6. Data Ownership">
            The business data you export is publicly available information. You own your exported files. We retain the right to log and audit usage for abuse prevention.
          </Section>

          <Section title="7. Subscriptions and Payments">
            <p>Paid plans are billed monthly or annually in advance. Billing is handled by DodoPayments. By subscribing, you authorize recurring charges to your payment method.</p>
            <p>Plan prices are as listed on the Pricing page. We reserve the right to change pricing with 30 days notice to existing subscribers.</p>
            <p>You may cancel your subscription at any time from the billing page. Your plan remains active until the end of the current billing period.</p>
          </Section>

          <Section title="8. Refunds">
            All sales are final. We do not offer refunds for consumed credits or partial billing periods. If you believe a charge was made in error, contact us within 7 days through our{" "}
            <Link href="/contact" className="text-blue-700 hover:text-blue-800">Contact page</Link>.
          </Section>

          <Section title="9. Fair Usage">
            Searches are subject to rate limits to ensure service quality for all users. Automated bulk scraping via scripts or bots is prohibited. The Service is intended for manual, human-operated use.
          </Section>

          <Section title="10. Disclaimer of Warranties">
            The Service is provided "as is" without warranties of any kind. We do not guarantee that all business data retrieved will be accurate, complete, or up to date.
          </Section>

          <Section title="11. Limitation of Liability">
            To the fullest extent permitted by law, LeadMapper shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service.
          </Section>

          <Section title="12. Termination">
            We reserve the right to suspend or terminate your account for violation of these terms. You may cancel your account at any time from the settings page.
          </Section>

          <Section title="13. Governing Law">
            These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in India.
          </Section>

          <Section title="14. Contact">
            Questions about these Terms? Reach us through our{" "}
            <Link href="/contact" className="text-blue-700 hover:text-blue-800">Contact page</Link>.
          </Section>
        </div>
      </main>
    </div>
  )
}
