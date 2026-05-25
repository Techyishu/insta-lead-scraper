"use client"

import Link from "next/link"
import { useState } from "react"
import { Loader2 } from "lucide-react"

const SUBJECTS = [
  { value: "billing",   label: "💳 Billing & Payments" },
  { value: "credits",   label: "⚡ Credits & Usage" },
  { value: "technical", label: "🔧 Technical Issue" },
  { value: "data",      label: "📊 Data Quality" },
  { value: "feature",   label: "✨ Feature Request" },
  { value: "other",     label: "💬 Other" },
]

const INFO_CARDS = [
  { emoji: "✉️", label: "Support channel", value: "Contact form" },
  { emoji: "⏱", label: "Response time",   value: "< 24 hours"  },
  { emoji: "🔒", label: "Data privacy",    value: "GDPR & DPDPA" },
  { emoji: "🌏", label: "Coverage",        value: "Worldwide"   },
]

export default function ContactPageClient() {
  const [name, setName]       = useState("")
  const [email, setEmail]     = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [sent, setSent]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      })
      if (!res.ok) throw new Error("Failed to send")
      setSent(true)
    } catch {
      setError("Something went wrong. Please email us directly at shashanksingh67567@gmail.com")
    } finally {
      setLoading(false)
    }
  }

  const inputCls = "w-full font-kalam text-sm text-[#1A1A1A] placeholder:text-[#B8B5AA] bg-[#EFEBE0] border-2 border-[#1A1A1A] rounded-[10px] px-4 py-3 outline-none focus:shadow-brutal transition-all"

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

      <div className="max-w-5xl mx-auto px-5 py-12">
        {/* Page header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 font-jetbrains text-[10px] font-bold text-[#1A1A1A] bg-[#FFE45E] border-2 border-[#1A1A1A] rounded-full px-3 py-1 mb-4 shadow-brutal">
            💬 Support
          </div>
          <h1 className="font-kalam font-bold text-5xl text-[#1A1A1A] mb-3">Get in touch</h1>
          <p className="font-kalam text-base text-[#6B6B6B] max-w-md mx-auto">
            Have a question, issue, or feedback? We typically respond within a few hours.
          </p>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          {INFO_CARDS.map((c) => (
            <div key={c.label} className="bg-[#F7F4EC] border-2 border-[#1A1A1A] rounded-[10px] shadow-brutal p-4 text-center">
              <div className="text-2xl mb-1">{c.emoji}</div>
              <div className="font-kalam font-bold text-[#1A1A1A] text-sm">{c.value}</div>
              <div className="font-jetbrains text-[10px] text-[#6B6B6B] mt-0.5">{c.label}</div>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid md:grid-cols-5 gap-6">

          {/* Left — contact details */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-[#1A1A1A] border-2 border-[#1A1A1A] rounded-[12px] shadow-brutal-lg p-6">
              <h2 className="font-kalam font-bold text-[#FFE45E] text-xl mb-4">Direct contact</h2>
              <div className="space-y-4">
                <div>
                  <div className="font-jetbrains text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider mb-1">Email</div>
                  <a
                    href="mailto:shashanksingh67567@gmail.com"
                    className="font-kalam font-bold text-[#EFEBE0] text-sm underline underline-offset-2 hover:text-[#FFE45E] transition-colors break-all"
                  >
                    shashanksingh67567@gmail.com
                  </a>
                </div>
                <div>
                  <div className="font-jetbrains text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider mb-1">Response SLA</div>
                  <div className="font-kalam text-[#EFEBE0] text-sm">Within 24 hours on weekdays</div>
                </div>
                <div>
                  <div className="font-jetbrains text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider mb-1">Urgent issues</div>
                  <div className="font-kalam text-[#EFEBE0] text-sm">Security & billing within 4 hours</div>
                </div>
              </div>
            </div>

            {/* FAQ links */}
            <div className="bg-[#EFEBE0] border-2 border-[#1A1A1A] rounded-[12px] shadow-brutal p-5">
              <h3 className="font-kalam font-bold text-[#1A1A1A] text-base mb-3">Quick answers</h3>
              <div className="space-y-2">
                {[
                  { q: "How do credits work?",         href: "/#pricing" },
                  { q: "Can I cancel anytime?",        href: "/terms#section-7" },
                  { q: "Is my data secure?",           href: "/privacy#section-9" },
                  { q: "What's your refund policy?",   href: "/terms#section-8" },
                ].map((item) => (
                  <Link
                    key={item.q}
                    href={item.href}
                    className="flex items-center justify-between gap-2 font-kalam text-[13px] text-[#3A3A3A] hover:text-[#1A1A1A] hover:font-bold py-1.5 px-3 rounded-[6px] hover:bg-[#FFE45E] transition-all group"
                  >
                    {item.q}
                    <span className="text-[#B8B5AA] group-hover:text-[#1A1A1A]">→</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Legal links */}
            <div className="flex gap-2">
              <Link href="/privacy" className="flex-1 text-center font-kalam font-bold text-[12px] text-[#1A1A1A] bg-[#F7F4EC] border-2 border-[#1A1A1A] rounded-[8px] px-3 py-2 shadow-brutal btn-press hover:bg-[#FFE45E] transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="flex-1 text-center font-kalam font-bold text-[12px] text-[#1A1A1A] bg-[#F7F4EC] border-2 border-[#1A1A1A] rounded-[8px] px-3 py-2 shadow-brutal btn-press hover:bg-[#FFE45E] transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>

          {/* Right — form */}
          <div className="md:col-span-3">
            <div className="bg-[#F7F4EC] border-2 border-[#1A1A1A] rounded-[14px] shadow-brutal-lg p-7">
              {!sent ? (
                <>
                  <h2 className="font-kalam font-bold text-[#1A1A1A] text-xl mb-5">Send us a message</h2>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="font-jetbrains text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider">Your name</label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Full name"
                          className={inputCls}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="font-jetbrains text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider">Email address</label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@company.com"
                          className={inputCls}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-jetbrains text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider">Topic</label>
                      <div className="flex flex-wrap gap-2">
                        {SUBJECTS.map((s) => (
                          <button
                            key={s.value}
                            type="button"
                            onClick={() => setSubject(s.value)}
                            className={`font-kalam font-bold text-[12px] px-3 py-1.5 rounded-[8px] border-2 transition-all ${
                              subject === s.value
                                ? "bg-[#FFE45E] border-[#1A1A1A] text-[#1A1A1A] shadow-brutal"
                                : "bg-[#EFEBE0] border-[#1A1A1A] text-[#3A3A3A] hover:bg-[#F7F4EC]"
                            }`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                      {/* Hidden required input to enforce subject selection */}
                      <input type="text" required value={subject} readOnly className="sr-only" />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-jetbrains text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider">Message</label>
                      <textarea
                        required
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Describe your issue or question in detail…"
                        rows={5}
                        className={inputCls + " resize-none"}
                      />
                    </div>

                    {error && (
                      <div className="bg-[#FF6B5C]/10 border-2 border-[#FF6B5C] rounded-[8px] px-4 py-3 font-kalam text-sm text-[#FF6B5C]">
                        ⚠ {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading || !subject}
                      className="w-full flex items-center justify-center gap-2 font-kalam font-bold text-[#F7F4EC] bg-[#1A1A1A] border-2 border-[#1A1A1A] rounded-[10px] py-3.5 text-base btn-press shadow-brutal disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading
                        ? <><Loader2 size={15} className="animate-spin" /> Sending…</>
                        : "Send message →"
                      }
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-[#6FCF97]/20 border-2 border-[#6FCF97] rounded-[12px] flex items-center justify-center mx-auto mb-5 text-3xl shadow-[3px_3px_0px_0px_#6FCF97]">
                    ✅
                  </div>
                  <h2 className="font-kalam font-bold text-2xl text-[#1A1A1A] mb-2">Message sent!</h2>
                  <p className="font-kalam text-sm text-[#6B6B6B] mb-1">
                    Thanks for reaching out. We&apos;ll reply to
                  </p>
                  <div className="inline-block bg-[#FFE45E] border-2 border-[#1A1A1A] rounded-[8px] px-4 py-1.5 mb-5 shadow-brutal">
                    <span className="font-kalam font-bold text-[#1A1A1A] text-sm">{email}</span>
                  </div>
                  <p className="font-kalam text-sm text-[#6B6B6B] mb-6">within 24 hours.</p>
                  <button
                    onClick={() => { setSent(false); setName(""); setEmail(""); setSubject(""); setMessage("") }}
                    className="font-kalam font-bold text-[13px] text-[#1A1A1A] bg-[#EFEBE0] border-2 border-[#1A1A1A] rounded-[8px] px-4 py-2 shadow-brutal btn-press hover:bg-[#FFE45E] transition-colors"
                  >
                    ← Send another message
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
