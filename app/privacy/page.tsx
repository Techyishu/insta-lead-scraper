import type { Metadata } from 'next'
import Link from "next/link"

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Learn how LeadMapper collects, uses, and protects your data. We take privacy seriously and are fully GDPR compliant.',
  alternates: { canonical: 'https://leadmapper.pro/privacy' },
  robots: { index: true, follow: true },
}

const SECTIONS = [
  "Introduction",
  "Information We Collect",
  "How We Use Your Information",
  "Third-Party Services",
  "Data Retention",
  "Data Breach Notification",
  "Your Rights",
  "Cookies",
  "Data Security",
  "Children's Privacy",
  "Changes to This Policy",
  "Contact & Grievance Officer",
]

function Section({ num, title, children }: { num: number; title: string; children: React.ReactNode }) {
  const id = `section-${num}`
  return (
    <section id={id} className="scroll-mt-24">
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

export default function PrivacyPage() {
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
          <Link href="/" className="font-kalam font-bold text-sm text-[#1A1A1A] hover:opacity-70 transition-opacity flex items-center gap-1">
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

            {/* Email card */}
            <div className="mt-4 bg-[#FFE45E] border-2 border-[#1A1A1A] rounded-[10px] shadow-brutal p-3">
              <p className="font-jetbrains text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wider mb-1">Privacy questions?</p>
              <a href="mailto:shashanksingh67567@gmail.com" className="font-kalam font-bold text-[12px] text-[#1A1A1A] underline underline-offset-2 hover:opacity-70 break-all">
                shashanksingh67567@gmail.com
              </a>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {/* Page header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 font-jetbrains text-[10px] font-bold text-[#1A1A1A] bg-[#FFE45E] border-2 border-[#1A1A1A] rounded-full px-3 py-1 mb-4 shadow-brutal">
              🔒 Legal
            </div>
            <h1 className="font-kalam font-bold text-5xl text-[#1A1A1A] mb-3">Privacy Policy</h1>
            <p className="font-jetbrains text-[12px] text-[#6B6B6B]">Last updated: {lastUpdated}</p>
          </div>

          {/* Mobile email callout */}
          <div className="lg:hidden bg-[#FFE45E] border-2 border-[#1A1A1A] rounded-[10px] shadow-brutal px-4 py-3 flex items-center gap-3 mb-6">
            <span className="text-xl">✉️</span>
            <p className="font-kalam text-sm text-[#1A1A1A]">
              Questions?{" "}
              <a href="mailto:shashanksingh67567@gmail.com" className="font-bold underline underline-offset-2">
                shashanksingh67567@gmail.com
              </a>
            </p>
          </div>

          {/* Sections */}
          <div className="bg-[#F7F4EC] border-2 border-[#1A1A1A] rounded-[14px] shadow-brutal-lg p-8 space-y-10">
            <Section num={1} title="Introduction">
              LeadMapper (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, store, and share information when you use our platform at leadmapper.pro (the &ldquo;Service&rdquo;). By using LeadMapper, you agree to the collection and use of information in accordance with this policy.
            </Section>

            <div className="border-t-2 border-[#EFEBE0]" />

            <Section num={2} title="Information We Collect">
              <p><strong className="text-[#1A1A1A]">Account Information:</strong> When you register, we collect your name, email address, and password (stored as a secure hash).</p>
              <p><strong className="text-[#1A1A1A]">Usage Data:</strong> We collect information about how you use the Service, including search queries, export activity, pages visited, and features used.</p>
              <p><strong className="text-[#1A1A1A]">Payment Information:</strong> Payment processing is handled by DodoPayments. We do not store full card numbers. We receive and retain billing address and transaction history for invoicing.</p>
              <p><strong className="text-[#1A1A1A]">Business Lead Data:</strong> When you run searches, we process your query to retrieve public business data from third-party sources (Google Maps via Apify). This data is logged to track credit usage.</p>
              <p><strong className="text-[#1A1A1A]">Device and Technical Data:</strong> We automatically collect IP addresses, browser type, device type, and operating system for security and analytics purposes.</p>
            </Section>

            <div className="border-t-2 border-[#EFEBE0]" />

            <Section num={3} title="How We Use Your Information">
              <ul className="space-y-1.5">
                {[
                  "To provide, operate, and improve the LeadMapper Service",
                  "To process payments and manage subscriptions via DodoPayments",
                  "To track credit usage and enforce fair usage limits",
                  "To send transactional emails (password resets, billing receipts, export confirmations)",
                  "To send product update emails (only if you've opted in)",
                  "To prevent fraud, abuse, and unauthorized access",
                  "To comply with legal obligations under the DPDPA 2023 and applicable laws",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#6FCF97] font-bold mt-0.5 flex-shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </Section>

            <div className="border-t-2 border-[#EFEBE0]" />

            <Section num={4} title="Third-Party Services">
              <p>We use the following third-party services which may process your data:</p>
              <div className="grid sm:grid-cols-2 gap-2 mt-2">
                {[
                  { name: "Supabase",       desc: "Authentication and database hosting" },
                  { name: "DodoPayments",   desc: "Payment processing" },
                  { name: "Apify",          desc: "Business data from Google Maps" },
                  { name: "Resend",         desc: "Transactional email delivery" },
                  { name: "Vercel",         desc: "Hosting and CDN infrastructure" },
                ].map((s) => (
                  <div key={s.name} className="bg-[#EFEBE0] border-2 border-[#1A1A1A] rounded-[8px] px-3 py-2">
                    <div className="font-kalam font-bold text-[#1A1A1A] text-[13px]">{s.name}</div>
                    <div className="font-jetbrains text-[10px] text-[#6B6B6B]">{s.desc}</div>
                  </div>
                ))}
              </div>
              <p className="mt-2">Each third party operates under their own privacy policy. We only share data necessary for the service to function.</p>
            </Section>

            <div className="border-t-2 border-[#EFEBE0]" />

            <Section num={5} title="Data Retention">
              We retain your account data for as long as your account is active. Search logs are retained for 90 days. Billing records are retained for 7 years as required by financial regulations. You may request earlier deletion by contacting us at{" "}
              <a href="mailto:shashanksingh67567@gmail.com" className="font-bold text-[#1A1A1A] underline underline-offset-2 hover:opacity-70">
                shashanksingh67567@gmail.com
              </a>.
            </Section>

            <div className="border-t-2 border-[#EFEBE0]" />

            <Section num={6} title="Data Breach Notification (DPDPA 2023)">
              <p>In the event of a personal data breach, we will:</p>
              <ul className="space-y-1.5 mt-2">
                {[
                  "Notify the Data Protection Board of India as required under the DPDPA 2023",
                  "Inform affected users via email without undue delay",
                  "Describe the nature of the breach, data categories affected, likely consequences, and measures taken",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#FF6B5C] font-bold mt-0.5 flex-shrink-0">!</span>
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-2">To report a security issue, email us immediately at{" "}
                <a href="mailto:shashanksingh67567@gmail.com" className="font-bold text-[#1A1A1A] underline underline-offset-2 hover:opacity-70">
                  shashanksingh67567@gmail.com
                </a>.
              </p>
            </Section>

            <div className="border-t-2 border-[#EFEBE0]" />

            <Section num={7} title="Your Rights">
              <p>Under the DPDPA 2023 and applicable laws, you have the right to:</p>
              <ul className="space-y-1.5 mt-2">
                {[
                  "Access your personal data we hold",
                  "Correct inaccurate or incomplete data",
                  "Request deletion (“right to erasure”) — use the account deletion feature in Settings",
                  "Withdraw consent for processing at any time",
                  "Nominate a person to exercise rights on your behalf",
                  "File a complaint with the Data Protection Board of India",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#6FCF97] font-bold mt-0.5 flex-shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-2">To exercise any of these rights, contact us at{" "}
                <a href="mailto:shashanksingh67567@gmail.com" className="font-bold text-[#1A1A1A] underline underline-offset-2 hover:opacity-70">
                  shashanksingh67567@gmail.com
                </a>{" "}or use our{" "}
                <Link href="/contact" className="font-bold text-[#1A1A1A] underline underline-offset-2 hover:opacity-70">Contact page</Link>.
              </p>
            </Section>

            <div className="border-t-2 border-[#EFEBE0]" />

            <Section num={8} title="Cookies">
              We use essential cookies for authentication and session management. We display a cookie consent notice on first visit. You may decline non-essential cookies at any time.
            </Section>

            <div className="border-t-2 border-[#EFEBE0]" />

            <Section num={9} title="Data Security">
              We implement industry-standard security measures including HTTPS encryption, hashed passwords, and role-based access controls. However, no system is 100% secure. Please report any vulnerabilities to{" "}
              <a href="mailto:shashanksingh67567@gmail.com" className="font-bold text-[#1A1A1A] underline underline-offset-2 hover:opacity-70">
                shashanksingh67567@gmail.com
              </a>.
            </Section>

            <div className="border-t-2 border-[#EFEBE0]" />

            <Section num={10} title="Children's Privacy">
              LeadMapper is not intended for users under 18 years of age. We do not knowingly collect personal information from minors.
            </Section>

            <div className="border-t-2 border-[#EFEBE0]" />

            <Section num={11} title="Changes to This Policy">
              We may update this Privacy Policy from time to time. We will notify you of significant changes via email or a notice on the platform. Continued use of the Service after changes constitutes acceptance.
            </Section>

            <div className="border-t-2 border-[#EFEBE0]" />

            <Section num={12} title="Contact & Grievance Officer">
              <p>For privacy-related questions or grievances (as required under DPDPA 2023):</p>
              <div className="bg-[#FFE45E] border-2 border-[#1A1A1A] rounded-[10px] shadow-brutal px-4 py-3 mt-2 space-y-1">
                <p><strong className="text-[#1A1A1A]">Email:</strong>{" "}
                  <a href="mailto:shashanksingh67567@gmail.com" className="text-[#1A1A1A] underline underline-offset-2 hover:opacity-70">
                    shashanksingh67567@gmail.com
                  </a>
                </p>
                <p><strong className="text-[#1A1A1A]">Response time:</strong> Within 72 hours for data requests, 24 hours for urgent security matters.</p>
              </div>
              <p className="mt-3">You may also use our{" "}
                <Link href="/contact" className="font-bold text-[#1A1A1A] underline underline-offset-2 hover:opacity-70">Contact page</Link>{" "}
                to reach us.
              </p>
            </Section>
          </div>

          {/* Footer links */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link href="/terms" className="font-kalam font-bold text-[13px] text-[#1A1A1A] bg-[#EFEBE0] border-2 border-[#1A1A1A] rounded-[8px] px-4 py-2 shadow-brutal btn-press hover:bg-[#FFE45E] transition-colors">
              Terms of Service →
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
