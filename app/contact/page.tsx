"use client"

import Link from "next/link"
import { useState } from "react"
import { Search, ArrowRight, Mail, Clock, CheckCircle, Loader2 } from "lucide-react"

export default function ContactPage() {
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

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="LeadMapper" className="w-8 h-8 object-contain" />
            <span className="font-display font-bold text-neutral-900 text-[1.1rem] tracking-tight">LeadMapper</span>
          </Link>
          <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors flex items-center gap-1">
            ← Back to home
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-16">
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-widest mb-3">Support</p>
          <h1 className="font-display font-bold text-4xl text-neutral-900 mb-3 tracking-tight">Contact Us</h1>
          <p className="text-neutral-500 text-base">Have a question, issue, or feedback? We're here to help.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {[
            { icon: Mail,  label: "Support channel", value: "Contact form" },
            { icon: Clock, label: "Response time",   value: "< 24 hours"  },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-white border border-neutral-200 rounded-xl p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Icon size={16} className="text-blue-700" strokeWidth={2} />
              </div>
              <div>
                <div className="text-sm font-semibold text-neutral-900">{value}</div>
                <div className="text-xs text-neutral-400">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="bg-white border border-neutral-200 rounded-xl p-7 shadow-sm">
          {!sent ? (
            <>
              <h2 className="text-sm font-semibold text-neutral-900 mb-5">Send us a message</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Your name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full name"
                      className="w-full bg-white border border-neutral-200 rounded-lg px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Email address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full bg-white border border-neutral-200 rounded-lg px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Subject</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    className="w-full bg-white border border-neutral-200 rounded-lg px-4 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
                  >
                    <option value="" disabled>Select a topic…</option>
                    <option value="billing">Billing & Payments</option>
                    <option value="credits">Credits & Usage</option>
                    <option value="technical">Technical Issue</option>
                    <option value="data">Data Quality</option>
                    <option value="feature">Feature Request</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Message</label>
                  <textarea
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your issue or question in detail…"
                    rows={5}
                    className="w-full bg-white border border-neutral-200 rounded-lg px-4 py-3 text-sm text-neutral-900 placeholder-neutral-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all resize-none"
                  />
                </div>

                {error && (
                  <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm w-full"
                >
                  {loading
                    ? <><Loader2 size={14} className="animate-spin" /> Sending…</>
                    : <><ArrowRight size={14} strokeWidth={2.5} /> Send message</>
                  }
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={24} className="text-emerald-500" strokeWidth={2} />
              </div>
              <h2 className="text-lg font-semibold text-neutral-900 mb-2">Message sent!</h2>
              <p className="text-sm text-neutral-500 mb-5">
                Thanks for reaching out. We'll reply to <span className="font-semibold text-neutral-900">{email}</span> within 24 hours.
              </p>
              <button
                onClick={() => { setSent(false); setName(""); setEmail(""); setSubject(""); setMessage("") }}
                className="text-xs text-blue-700 hover:text-blue-800 transition-colors font-medium"
              >
                Send another message
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
