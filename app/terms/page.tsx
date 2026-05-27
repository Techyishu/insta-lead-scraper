import type { Metadata } from 'next'
import Link from "next/link"

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Read the LeadMapper Terms of Service. Understand your rights and responsibilities when using our lead generation platform.',
  alternates: { canonical: 'https://leadmapper.pro/terms' },
  robots: { index: true, follow: true },
}

const SECTIONS = [
  "Acceptance of Terms",
  "Description of Service",
  "Account Registration",
  "Credits System",
  "Acceptable Use",
  "Data Ownership",
  "Subscriptions and Payments",
  "Refunds",
  "Fair Usage",
  "Disclaimer of Warranties",
  "Limitation of Liability",
  "Termination",
  "Governing Law",
  "Contact",
]

function Section({ num, title, children }: { num: number; title: string; children: React.ReactNode }) {
  return (
    <section id={`section-${num}`} className="scroll-mt-24">
      <div className="flex items-start gap-4 mb-4">
        <span className="font-jetbrains text-[11px] font-bold text-[#F7F4EC] bg-[#1A1A1A] border-2 border-[#1A1A1A] rounded-[6px] px-2 py-1 flex-shrink-0 mt-0.5">
          {String(num).padStart(2, "0")}
        </span>
        <h2 className="font-kalam font-bold text-[#1A1A1A] text-lg">{title}</h2>
      </div>
      <div className="pl-10 space-y-3 font-kalam text-[14px] text-[#3A3A3A] leading-relaxed">
        {children}
      </div>
    </section>
  )
}

export default function TermsPage() {
  const lastUpdated = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })

  return (
    <div className="min-h-screen bg-[#F7F4EC]">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-[#F7F4EC] border-b-2 border-[#1A1A1A]">
        <div className="max-w-7xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="LeadMapper" className="w-7 h-7 object-contain" />
            <span className="font-kalam font-bold text-[#1A1A1A] text-lg">LeadMapper</span>
          </Link>
          <Link href="/" className="font-kalam font-bold text-sm text-[#1A1A1A] hover:opacity-70 transition-opacity">
            ← Back to home
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-5 py-12 flex gap-10">

        {/* Sticky sidebar TOC */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <div className="sticky top-24">
            <div className="bg-[#EFEBE0] border-2 border-[#1A1A1A] rounded-[12px] shadow-brutal p-4">
              <div className="font-jetbrains text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider mb-3">Contents</div>
              <nav className="space-y-1">
                {SECTIONS.map((s, i) => (
                  <a
                    key={i}
                    href={`#section-${i + 1}`}
                    className="block font-kalam text-[12px] text-[#3A3A3A] hover:text-[#1A1A1A] hover:font-bold py-1 px-2 rounded-[6px] hover:bg-[#FFE45E] transition-all"
                  >
                    <span className="font-jetbrains text-[10px] text-[#B8B5AA] mr-1">{String(i + 1).padStart(2, "0")}.</span>
                    {s}
                  </a>
                ))}
              </nav>
            </div>

            <div className="mt-4 bg-[#1A1A1A] border-2 border-[#1A1A1A] rounded-[10px] shadow-brutal p-3">
              <p className="font-jetbrains text-[10px] font-bold text-[#FFE45E] uppercase tracking-wider mb-1">Questions?</p>
              <Link href="/contact" className="font-kalam font-bold text-[12px] text-[#EFEBE0] underline underline-offset-2 hover:opacity-70">
                Contact us →
              </Link>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 font-jetbrains text-[10px] font-bold text-[#1A1A1A] bg-[#FFE45E] border-2 border-[#1A1A1A] rounded-full px-3 py-1 mb-4 shadow-brutal">
              📋 Legal
            </div>
            <h1 className="font-kalam font-bold text-5xl text-[#1A1A1A] mb-3">Terms of Service</h1>
            <p className="font-jetbrains text-[12px] text-[#6B6B6B]">Last updated: {lastUpdated}</p>
          </div>

          <div className="bg-[#F7F4EC] border-2 border-[#1A1A1A] rounded-[14px] shadow-brutal-lg p-8 space-y-10">

            <Section num={1} title="Acceptance of Terms">
              By accessing or using LeadMapper (&ldquo;Service&rdquo;), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the Service.
            </Section>

            <div className="border-t-2 border-[#EFEBE0]" />

            <Section num={2} title="Description of Service">
              LeadMapper is a SaaS platform that enables users to search for publicly available local business data (from Google Maps via third-party APIs), filter results, and export them in CSV format for sales, marketing, and outreach activities.
            </Section>

            <div className="border-t-2 border-[#EFEBE0]" />

            <Section num={3} title="Account Registration">
              <p>You must create an account to use the Service. You agree to provide accurate, current, and complete information and to keep your account credentials secure. You are responsible for all activity that occurs under your account.</p>
              <p>Accounts are for individual use only. Sharing accounts between multiple users is prohibited.</p>
            </Section>

            <div className="border-t-2 border-[#EFEBE0]" />

            <Section num={4} title="Credits System">
              <p>The Service operates on a credit-based system. Each business lead retrieved costs 1 credit. Credits are allocated per billing cycle based on your subscription plan.</p>
              <div className="bg-[#FFE45E] border-2 border-[#1A1A1A] rounded-[8px] shadow-brutal px-4 py-3 mt-2 space-y-1">
                {[
                  "Unused credits do not roll over",
                  "Credits are non-refundable once consumed",
                  "Free plan credits are lifetime-limited (50 total), not monthly",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 font-kalam text-[13px] text-[#1A1A1A]">
                    <span className="font-bold">!</span> {item}
                  </div>
                ))}
              </div>
            </Section>

            <div className="border-t-2 border-[#EFEBE0]" />

            <Section num={5} title="Acceptable Use">
              <p>You agree <strong className="text-[#FF6B5C]">NOT</strong> to use the Service to:</p>
              <ul className="space-y-1.5 mt-2">
                {[
                  "Send unsolicited spam or violate anti-spam laws (CAN-SPAM, GDPR, etc.)",
                  "Resell or redistribute data for commercial data resale purposes",
                  "Harass, stalk, or threaten individuals or businesses",
                  "Violate any applicable local, national, or international law",
                  "Attempt to reverse engineer or exploit the Service's security",
                  "Create multiple accounts to circumvent credit limits",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#FF6B5C] font-bold mt-0.5 flex-shrink-0">✕</span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="bg-[#FF6B5C]/10 border-2 border-[#FF6B5C] rounded-[8px] px-4 py-3 mt-3">
                <p className="font-kalam font-bold text-[13px] text-[#FF6B5C]">
                  ⚠ Violation of these terms may result in immediate account termination without refund.
                </p>
              </div>
            </Section>

            <div className="border-t-2 border-[#EFEBE0]" />

            <Section num={6} title="Data Ownership">
              The business data you export is publicly available information. You own your exported files. We retain the right to log and audit usage for abuse prevention.
            </Section>

            <div className="border-t-2 border-[#EFEBE0]" />

            <Section num={7} title="Subscriptions and Payments">
              <p>Paid plans are billed monthly in advance. Billing is handled by DodoPayments. By subscribing, you authorize recurring charges to your payment method.</p>
              <p>Plan prices are as listed on the Pricing page. We reserve the right to change pricing with 30 days notice to existing subscribers.</p>
              <p>You may cancel your subscription at any time from the billing page. Your plan remains active until the end of the current billing period.</p>
            </Section>

            <div className="border-t-2 border-[#EFEBE0]" />

            <Section num={8} title="Refunds">
              All sales are final. We do not offer refunds for consumed credits or partial billing periods. If you believe a charge was made in error, contact us within 7 days through our{" "}
              <Link href="/contact" className="font-bold text-[#1A1A1A] underline underline-offset-2 hover:opacity-70">Contact page</Link>.
            </Section>

            <div className="border-t-2 border-[#EFEBE0]" />

            <Section num={9} title="Fair Usage">
              Searches are subject to rate limits to ensure service quality for all users. Automated bulk scraping via scripts or bots is prohibited. The Service is intended for manual, human-operated use.
            </Section>

            <div className="border-t-2 border-[#EFEBE0]" />

            <Section num={10} title="Disclaimer of Warranties">
              The Service is provided &ldquo;as is&rdquo; without warranties of any kind. We do not guarantee that all business data retrieved will be accurate, complete, or up to date.
            </Section>

            <div className="border-t-2 border-[#EFEBE0]" />

            <Section num={11} title="Limitation of Liability">
              To the fullest extent permitted by law, LeadMapper shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service.
            </Section>

            <div className="border-t-2 border-[#EFEBE0]" />

            <Section num={12} title="Termination">
              We reserve the right to suspend or terminate your account for violation of these terms. You may cancel your account at any time from the settings page.
            </Section>

            <div className="border-t-2 border-[#EFEBE0]" />

            <Section num={13} title="Governing Law">
              These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in India.
            </Section>

            <div className="border-t-2 border-[#EFEBE0]" />

            <Section num={14} title="Contact">
              Questions about these Terms? Reach us through our{" "}
              <Link href="/contact" className="font-bold text-[#1A1A1A] underline underline-offset-2 hover:opacity-70">Contact page</Link>{" "}
              or email{" "}
              <a href="mailto:shashanksingh67567@gmail.com" className="font-bold text-[#1A1A1A] underline underline-offset-2 hover:opacity-70">
                shashanksingh67567@gmail.com
              </a>.
            </Section>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link href="/privacy" className="font-kalam font-bold text-[13px] text-[#1A1A1A] bg-[#EFEBE0] border-2 border-[#1A1A1A] rounded-[8px] px-4 py-2 shadow-brutal btn-press hover:bg-[#FFE45E] transition-colors">
              Privacy Policy →
            </Link>
            <Link href="/contact" className="font-kalam font-bold text-[13px] text-[#1A1A1A] bg-[#EFEBE0] border-2 border-[#1A1A1A] rounded-[8px] px-4 py-2 shadow-brutal btn-press hover:bg-[#FFE45E] transition-colors">
              Contact Us →
            </Link>
            <Link href="/" className="font-kalam text-sm text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors ml-auto">
              ← Back to home
            </Link>
          </div>
        </main>
      </div>
    </div>
  )
}
