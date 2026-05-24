"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  Search,
  Download,
  SlidersHorizontal,
  Zap,
  Users,
  Bookmark,
  Globe,
  ChevronDown,
  Building2,
  Star,
  ArrowRight,
  Check,
  CreditCard,
  Menu,
  X,
  Plus,
  ChevronRight,
} from "lucide-react"

// ─── Navbar ──────────────────────────────────────────────────────────────────

function Navbar() {
  const [open, setOpen]         = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setLoggedIn(!!user)
    })
  }, [])

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="LeadMapper" className="w-8 h-8 object-contain" />
          <span className="font-display font-bold text-neutral-900 text-[1.1rem] tracking-tight">LeadMapper</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-500">
          <a href="#features" className="hover:text-neutral-900 transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-neutral-900 transition-colors">How it works</a>
          <a href="#pricing" className="hover:text-neutral-900 transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-neutral-900 transition-colors">FAQ</a>
        </nav>

        <div className="flex items-center gap-3">
          {loggedIn ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Dashboard
              <ArrowRight size={14} strokeWidth={2.5} />
            </Link>
          ) : (
            <>
              <Link href="/login" className="hidden md:block text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors">
                Log in
              </Link>
              <Link
                href="/signup"
                className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                Get started
                <ArrowRight size={14} strokeWidth={2.5} />
              </Link>
            </>
          )}
          <button
            className="md:hidden text-neutral-500 hover:text-neutral-900 p-1"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t border-neutral-100 px-5 py-4 space-y-1">
          {["Features", "How it works", "Pricing", "FAQ"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/ /g, "-")}`}
              className="block text-sm text-neutral-600 hover:text-neutral-900 py-2"
              onClick={() => setOpen(false)}
            >
              {item}
            </a>
          ))}
          <div className="pt-3 space-y-2 border-t border-neutral-100">
            {loggedIn ? (
              <Link href="/dashboard" className="block text-sm font-semibold text-white bg-blue-700 px-4 py-2.5 rounded-lg text-center">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="block text-sm text-neutral-600 hover:text-neutral-900 py-2">Log in</Link>
                <Link href="/signup" className="block text-sm font-semibold text-white bg-blue-700 px-4 py-2.5 rounded-lg text-center">
                  Get started free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

// ─── Hero ────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="bg-[#FAFAF9] pt-16 pb-20 px-5">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        {/* Left */}
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-700 border border-blue-200 bg-blue-50 px-3 py-1.5 rounded-full mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            Now with contact enrichment
          </div>

          <h1 className="font-display font-bold text-neutral-900 text-[3.25rem] md:text-[3.75rem] leading-[1.05] tracking-tight mb-5">
            Find local<br />business leads<br />
            <span className="text-blue-700">that convert.</span>
          </h1>

          <p className="text-neutral-500 text-lg leading-relaxed mb-8 max-w-[460px]">
            Enter a keyword and location. Get verified business data — names, phones, websites, ratings — exported to CSV in under 30 seconds.
          </p>

          <div className="flex flex-wrap gap-3 mb-8">
            <Link
              href="/signup"
              className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold px-6 py-3 rounded-lg transition-colors text-sm"
            >
              Get 50 free leads
              <ArrowRight size={15} strokeWidth={2.5} />
            </Link>
            <a
              href="#how-it-works"
              className="flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 px-6 py-3 rounded-lg border border-neutral-200 hover:border-neutral-300 bg-white transition-colors"
            >
              See how it works
            </a>
          </div>

          <div className="flex flex-wrap gap-5">
            {["No credit card required", "50 free credits", "Export to CSV"].map((item) => (
              <div key={item} className="flex items-center gap-1.5 text-sm text-neutral-400">
                <Check size={14} strokeWidth={2.5} className="text-emerald-500" />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Right — product mockup */}
        <div className="relative">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-xl shadow-neutral-200/80 overflow-hidden">
            {/* Search bar */}
            <div className="p-4 border-b border-neutral-100">
              <div className="flex gap-2">
                <div className="flex-1 border border-neutral-200 rounded-lg px-3 py-2.5 text-sm text-neutral-700 bg-neutral-50">
                  dentists
                </div>
                <div className="flex-1 border border-neutral-200 rounded-lg px-3 py-2.5 text-sm text-neutral-700 bg-neutral-50">
                  Austin, TX, USA
                </div>
                <button className="flex items-center gap-1.5 bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg whitespace-nowrap">
                  <Search size={13} strokeWidth={2.5} />
                  Search
                </button>
              </div>
            </div>

            {/* Results header */}
            <div className="px-4 py-2.5 bg-neutral-50 border-b border-neutral-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-medium text-emerald-600">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                47 businesses found
              </div>
              <button className="text-xs text-blue-700 font-medium flex items-center gap-1">
                <Download size={12} strokeWidth={2.5} />
                Export CSV
              </button>
            </div>

            {/* Table header */}
            <div className="grid grid-cols-[1fr_90px_56px_36px] gap-2 px-4 py-2 border-b border-neutral-100 bg-neutral-50">
              {["Business", "Phone", "Rating", "Web"].map((h) => (
                <div key={h} className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">{h}</div>
              ))}
            </div>

            {/* Table rows */}
            {[
              { name: "Austin Dental Care", phone: "512-340-…", rating: "4.8", web: true },
              { name: "Downtown Smiles", phone: "512-442-…", rating: "4.6", web: true },
              { name: "Bright Teeth Studio", phone: "512-891-…", rating: "4.5", web: false },
              { name: "Capitol City Dental", phone: "512-223-…", rating: "4.7", web: true },
            ].map((row, i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_90px_56px_36px] gap-2 px-4 py-2.5 border-b border-neutral-50 last:border-0 hover:bg-neutral-50/80 transition-colors"
              >
                <div className="text-sm font-medium text-neutral-800 truncate">{row.name}</div>
                <div className="text-xs text-neutral-400 font-mono self-center">{row.phone}</div>
                <div className="text-xs font-semibold text-amber-500 self-center">★ {row.rating}</div>
                <div className="self-center">
                  <Globe size={12} className={row.web ? "text-emerald-500" : "text-neutral-200"} />
                </div>
              </div>
            ))}

            <div className="px-4 py-2.5 bg-neutral-50 border-t border-neutral-100">
              <span className="text-xs text-neutral-400">Showing 4 of 47 results</span>
            </div>
          </div>

          {/* Floating badges */}
          <div
            className="absolute -left-6 top-[28%] bg-white border border-neutral-200 rounded-xl p-3 shadow-md hidden lg:block"
            style={{ animation: "float 4s ease-in-out infinite" }}
          >
            <div className="font-display font-bold text-xl text-neutral-900">Try free</div>
            <div className="text-xs text-neutral-400">50 credits included</div>
          </div>
          <div
            className="absolute -right-4 bottom-[22%] bg-white border border-emerald-200 rounded-xl p-3 shadow-md hidden lg:block"
            style={{ animation: "float 4s ease-in-out infinite", animationDelay: "1.5s" }}
          >
            <div className="font-display font-bold text-base text-emerald-600">&lt; 30s</div>
            <div className="text-xs text-neutral-400">Search time</div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </section>
  )
}

// ─── Stats ───────────────────────────────────────────────────────────────────

function Stats() {
  const items = [
    { value: "99%+", label: "Data Accuracy" },
    { value: "200+", label: "Business Categories" },
    { value: "50+", label: "Countries Supported" },
    { value: "< 30s", label: "Avg. Search Time" },
  ]

  return (
    <section className="bg-white border-y border-neutral-200">
      <div className="max-w-7xl mx-auto px-5 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-neutral-100">
          {items.map((s) => (
            <div key={s.label} className="text-center px-8 first:pl-0 last:pr-0">
              <div className="font-display font-bold text-3xl text-neutral-900 mb-1">{s.value}</div>
              <div className="text-sm text-neutral-400">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Features ────────────────────────────────────────────────────────────────

function Features() {
  const features = [
    {
      n: "01",
      icon: Search,
      title: "Instant Business Search",
      desc: "Enter any keyword + location and get verified business listings in seconds. Any industry, any city worldwide.",
    },
    {
      n: "02",
      icon: Download,
      title: "CSV & Excel Exports",
      desc: "One-click export of your full lead list. Compatible with every CRM, outreach tool, and spreadsheet.",
    },
    {
      n: "03",
      icon: SlidersHorizontal,
      title: "Advanced Filtering",
      desc: "Filter by rating, review count, phone presence, and website availability to surface quality leads.",
    },
    {
      n: "04",
      icon: Zap,
      title: "Fast Lead Discovery",
      desc: "Powered by real-time data. Get up to 200 verified business listings in under 30 seconds.",
    },
    {
      n: "05",
      icon: Users,
      title: "Agency-Friendly Workflows",
      desc: "Built for high-volume prospecting. Search multiple industries, save searches, and batch-export leads.",
    },
    {
      n: "06",
      icon: Bookmark,
      title: "Saved Searches",
      desc: "Save your best searches and rerun them instantly. Never repeat the same research twice.",
    },
  ]

  return (
    <section id="features" className="bg-[#FAFAF9] py-24 px-5">
      <div className="max-w-5xl mx-auto">
        <div className="mb-14">
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-widest mb-3">Features</p>
          <h2 className="font-display font-bold text-neutral-900 text-[2.5rem] md:text-[3rem] leading-tight tracking-tight">
            Built for serious<br />lead generation.
          </h2>
        </div>

        <div className="border-t border-neutral-200">
          {features.map((f) => (
            <div
              key={f.n}
              className="grid grid-cols-[72px_1fr] md:grid-cols-[72px_1fr_200px] gap-4 py-8 border-b border-neutral-100 group hover:bg-white transition-colors -mx-5 px-5 rounded-lg"
            >
              <span className="text-sm font-mono font-medium text-neutral-300 pt-0.5">{f.n}</span>
              <div>
                <h3 className="font-semibold text-neutral-900 text-[1.0625rem] mb-1.5">{f.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed max-w-lg">{f.desc}</p>
              </div>
              <div className="hidden md:flex items-start justify-end pt-0.5">
                <div className="w-9 h-9 rounded-lg bg-neutral-100 group-hover:bg-blue-50 flex items-center justify-center transition-colors">
                  <f.icon size={17} className="text-neutral-400 group-hover:text-blue-600 transition-colors" strokeWidth={1.75} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── How It Works ─────────────────────────────────────────────────────────────

function HowItWorks() {
  const steps = [
    {
      n: "1",
      title: "Enter keyword + location",
      desc: 'Type what you\'re looking for and where — e.g. "dentists" in "Austin, TX, USA". Be specific for better results.',
      icon: Search,
    },
    {
      n: "2",
      title: "Get matching businesses",
      desc: "LeadMapper pulls verified business data including names, addresses, phone numbers, ratings, and website URLs.",
      icon: Building2,
    },
    {
      n: "3",
      title: "Export leads as CSV",
      desc: "Filter, select, and download a clean CSV — ready to import into your CRM or outreach sequence instantly.",
      icon: Download,
    },
  ]

  return (
    <section id="how-it-works" className="bg-white py-24 px-5 border-y border-neutral-200">
      <div className="max-w-5xl mx-auto">
        <div className="mb-14">
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-widest mb-3">How it works</p>
          <h2 className="font-display font-bold text-neutral-900 text-[2.5rem] md:text-[3rem] leading-tight tracking-tight">
            Three steps to your<br />next 100 leads.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {steps.map((step) => (
            <div key={step.n} className="flex flex-col">
              <div className="w-10 h-10 rounded-lg border-2 border-neutral-200 flex items-center justify-center mb-5">
                <span className="font-display font-bold text-neutral-400 text-sm">{step.n}</span>
              </div>
              <h3 className="font-semibold text-neutral-900 text-[1.0625rem] mb-2">{step.title}</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Perfect For ─────────────────────────────────────────────────────────────

function PerfectFor() {
  const audiences = [
    { title: "Marketing Agencies", desc: "Prospect clients in any city or niche at scale without manual research." },
    { title: "SDR Teams", desc: "Build targeted lists with contact info. Fill your CRM for cold outreach sequences." },
    { title: "Cold Emailers", desc: "Find businesses with verified contacts. Filter for high-quality leads with phone and website." },
    { title: "Local SEO Agencies", desc: "Identify businesses without websites — easy targets for your services." },
    { title: "Freelancers", desc: "Find your next client fast. Search by industry and location to build a steady pipeline." },
    { title: "B2B Sales Teams", desc: "Fill your pipeline with verified local business prospects across multiple regions." },
  ]

  return (
    <section className="bg-[#FAFAF9] py-24 px-5">
      <div className="max-w-5xl mx-auto">
        <div className="mb-14">
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-widest mb-3">Who it's for</p>
          <h2 className="font-display font-bold text-neutral-900 text-[2.5rem] md:text-[3rem] leading-tight tracking-tight">
            Who uses LeadMapper?
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-neutral-200 border border-neutral-200 rounded-xl overflow-hidden">
          {audiences.map((a) => (
            <div key={a.title} className="bg-[#FAFAF9] p-6 hover:bg-white transition-colors">
              <h3 className="font-semibold text-neutral-900 text-[0.9375rem] mb-2">{a.title}</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">{a.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Pricing ─────────────────────────────────────────────────────────────────

function Pricing() {
  const plans = [
    {
      name: "Free",
      price: 0,
      credits: "50 lifetime credits",
      popular: false,
      features: ["50 credits (lifetime)", "Phone & website filter", "CSV export", "Basic search"],
      cta: "Get Started Free",
      href: "/signup",
    },
    {
      name: "Starter",
      price: 49,
      credits: "5,000 credits/month",
      popular: false,
      features: ["5,000 credits/month", "Phone & website filter", "CSV export", "Email support"],
      cta: "Start Starter Plan",
      href: "/signup?plan=starter",
    },
    {
      name: "Growth",
      price: 89,
      credits: "10,000 credits/month",
      popular: true,
      features: ["10,000 credits/month", "Phone & website filter", "Bulk processing", "Priority support", "CSV export", "Unlimited saved searches"],
      cta: "Start Growth Plan",
      href: "/signup?plan=growth",
    },
  ]

  return (
    <section id="pricing" className="bg-white py-24 px-5 border-t border-neutral-200">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-widest mb-3">Pricing</p>
          <h2 className="font-display font-bold text-neutral-900 text-[2.5rem] md:text-[3rem] leading-tight tracking-tight">
            Simple, transparent<br />pricing.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-xl p-6 flex flex-col border transition-all ${
                plan.popular
                  ? "border-blue-700 ring-1 ring-blue-700 bg-white shadow-lg shadow-blue-100/60"
                  : "border-neutral-200 bg-white hover:border-neutral-300"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-700 text-white text-[11px] font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                  Most Popular
                </div>
              )}

              <div className="mb-5">
                <div className="text-sm font-medium text-neutral-500 mb-2">{plan.name}</div>
                <div className="flex items-end gap-1 mb-1">
                  <span className="font-display font-bold text-[2.25rem] text-neutral-900 leading-none">
                    ${plan.price}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-neutral-400 text-sm mb-1">/mo</span>
                  )}
                </div>
                <div className="text-xs text-neutral-400">{plan.credits}</div>
              </div>

              <ul className="space-y-2.5 flex-1 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-neutral-600">
                    <Check
                      size={14}
                      strokeWidth={2.5}
                      className={`mt-0.5 flex-shrink-0 ${plan.popular ? "text-blue-700" : "text-emerald-500"}`}
                    />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`w-full text-center py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  plan.popular
                    ? "bg-blue-700 hover:bg-blue-800 text-white"
                    : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

function Testimonials() {
  const testimonials = [
    {
      quote: "LeadMapper cut our agency's prospecting time by 80%. We used to spend hours manually researching businesses. Now we have 200 verified leads in under 5 minutes.",
      name: "Sarah Mitchell",
      role: "Founder, BrightSpark Digital Agency",
      initials: "SM",
    },
    {
      quote: "As an SDR, having instant access to verified local business data with phone numbers is a game changer. I hit my monthly quota every single week since using LeadMapper.",
      name: "James Rodriguez",
      role: "Senior SDR, TechVentures Sales",
      initials: "JR",
    },
    {
      quote: "I use LeadMapper to find restaurants without websites — perfect targets for my local SEO services. The CSV export goes directly into my CRM every morning.",
      name: "Priya Sharma",
      role: "Marketing Consultant, Freelance",
      initials: "PS",
    },
  ]

  return (
    <section className="bg-[#FAFAF9] py-24 px-5 border-t border-neutral-200">
      <div className="max-w-6xl mx-auto">
        <div className="mb-14">
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-widest mb-3">Testimonials</p>
          <h2 className="font-display font-bold text-neutral-900 text-[2.5rem] md:text-[3rem] leading-tight tracking-tight">
            Trusted by lead<br />generation pros.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-white border border-neutral-200 rounded-xl p-6 flex flex-col">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={13} fill="currentColor" className="text-amber-400" />
                ))}
              </div>
              <p className="text-neutral-600 text-sm leading-relaxed flex-1 mb-6">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-700 flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">
                  {t.initials}
                </div>
                <div>
                  <div className="text-sm font-semibold text-neutral-900">{t.name}</div>
                  <div className="text-xs text-neutral-400">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────

function FAQ() {
  const [open, setOpen] = useState<string | null>(null)

  const faqs = [
    {
      q: "What data does LeadMapper provide?",
      a: "LeadMapper provides business name, address, phone number, website URL, Google Maps link, star rating, and review count. Contact enrichment also adds email addresses and social profiles scraped from each business website.",
    },
    {
      q: "How do credits work?",
      a: "Each business lead you retrieve costs 1 credit. Searching for 50 dentists in Austin uses 50 credits. Credits are consumed when results are returned. Exporting does not consume additional credits.",
    },
    {
      q: "Can I export leads?",
      a: "Yes. LeadMapper supports CSV and Excel exports. You can export all results or select specific rows. Export history is saved in your dashboard for easy re-download.",
    },
    {
      q: "Do unused credits roll over?",
      a: "Credits reset at the start of each billing cycle. We recommend choosing a plan that matches your monthly usage. Upgrading is easy from the billing page.",
    },
    {
      q: "What countries are supported?",
      a: "LeadMapper works in 50+ countries including USA, UK, Canada, Australia, India, UAE, Germany, France, Spain, Brazil, and more. If a business is on Google Maps, we can find it.",
    },
    {
      q: "Is there a free plan?",
      a: "Yes. The free plan includes 50 credits — enough to test the product and find your first leads. No credit card required to sign up.",
    },
    {
      q: "Is the data verified?",
      a: "Data is sourced from Google Maps in real-time. Phone numbers and websites match what businesses have listed publicly on Google Maps.",
    },
    {
      q: "How quickly are exports generated?",
      a: "Exports are generated instantly once your search completes. Click 'Export CSV' and your file downloads immediately.",
    },
  ]

  return (
    <section id="faq" className="bg-white py-24 px-5 border-t border-neutral-200">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12">
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-widest mb-3">FAQ</p>
          <h2 className="font-display font-bold text-neutral-900 text-[2.5rem] md:text-[3rem] leading-tight tracking-tight">
            Common questions.
          </h2>
        </div>

        <div>
          {faqs.map((faq, i) => (
            <div key={i} className="border-b border-neutral-100">
              <button
                onClick={() => setOpen(open === String(i) ? null : String(i))}
                className="w-full flex items-center justify-between py-5 text-left gap-4"
              >
                <span className="text-[0.9375rem] font-medium text-neutral-800">{faq.q}</span>
                <ChevronDown
                  size={16}
                  strokeWidth={2}
                  className={`text-neutral-400 transition-transform flex-shrink-0 ${open === String(i) ? "rotate-180 text-blue-700" : ""}`}
                />
              </button>
              {open === String(i) && (
                <div className="pb-5">
                  <p className="text-sm text-neutral-500 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── CTA ─────────────────────────────────────────────────────────────────────

function CTASection() {
  return (
    <section className="bg-blue-700 py-24 px-5">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="font-display font-bold text-white text-[2.75rem] md:text-[3.5rem] leading-tight tracking-tight mb-5">
          Ready to fill<br />your pipeline?
        </h2>
        <p className="text-blue-200 text-lg mb-8 max-w-xl mx-auto">
          Join thousands of agencies, SDRs, and freelancers using LeadMapper to source verified local business leads — in seconds.
        </p>

        <Link
          href="/signup"
          className="inline-flex items-center gap-2 bg-white hover:bg-blue-50 text-blue-700 font-semibold px-8 py-4 rounded-lg transition-colors text-sm"
        >
          Get 50 free leads — no card required
          <ArrowRight size={15} strokeWidth={2.5} />
        </Link>

        <p className="text-xs text-blue-300/70 mt-5">50 free credits · No credit card · Cancel anytime</p>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="bg-white border-t border-neutral-200 py-14 px-5">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-5 gap-10 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg bg-blue-700 flex items-center justify-center">
                <Search size={13} color="white" strokeWidth={2.5} />
              </div>
              <span className="font-display font-bold text-neutral-900 text-[1.0625rem]">LeadMapper</span>
            </div>
            <p className="text-sm text-neutral-400 leading-relaxed max-w-xs">
              The fastest way to find verified local business leads. Built for agencies, SDRs, and growth teams.
            </p>
          </div>

          <div>
            <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-4">Product</div>
            <ul className="space-y-2.5">
              {[
                { label: "Features", href: "#features" },
                { label: "Pricing", href: "#pricing" },
                { label: "FAQ", href: "#faq" },
                { label: "Dashboard", href: "/dashboard" },
              ].map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">{l.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-4">Account</div>
            <ul className="space-y-2.5">
              {[
                { label: "Log in", href: "/login" },
                { label: "Sign up", href: "/signup" },
                { label: "Billing", href: "/dashboard/billing" },
                { label: "Settings", href: "/dashboard/settings" },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-4">Legal</div>
            <ul className="space-y-2.5">
              {[
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms of Service", href: "/terms" },
                { label: "Contact", href: "/contact" },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-neutral-400">© {new Date().getFullYear()} LeadMapper. All rights reserved.</p>
          <p className="text-xs text-neutral-300">Find local business leads instantly.</p>
        </div>
      </div>
    </footer>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <PerfectFor />
      <Pricing />
      <Testimonials />
      <FAQ />
      <CTASection />
      <Footer />
    </div>
  )
}
