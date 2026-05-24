"use client"

import Link from "next/link"
import { useState } from "react"
import { Search, ArrowRight, Mail } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/dashboard/settings`,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setLoading(false)
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex flex-col items-center justify-center px-5 py-12">
      <Link href="/" className="flex items-center gap-2.5 mb-10">
        <img src="/logo.png" alt="LeadMapper" className="w-8 h-8 object-contain" />
        <span className="font-display font-bold text-neutral-900 text-xl tracking-tight">LeadMapper</span>
      </Link>

      <div className="w-full max-w-[400px] bg-white border border-neutral-200 rounded-xl p-8 shadow-sm">
        {!sent ? (
          <>
            <h1 className="font-display font-bold text-2xl text-neutral-900 mb-1">Reset your password</h1>
            <p className="text-neutral-400 text-sm mb-7">
              Enter your email and we'll send you a link to reset your password.
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-5">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Email address</label>
                <input
                  type="email"
                  required
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-neutral-200 rounded-lg px-4 py-3 text-sm text-neutral-900 placeholder-neutral-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors text-sm"
              >
                {loading ? "Sending…" : (
                  <>Send reset link <ArrowRight size={14} strokeWidth={2.5} /></>
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-5">
              <Mail size={26} className="text-emerald-600" strokeWidth={1.75} />
            </div>
            <h2 className="font-display font-bold text-xl text-neutral-900 mb-2">Check your email</h2>
            <p className="text-sm text-neutral-400 mb-1">We sent a reset link to</p>
            <p className="text-sm font-semibold text-neutral-900 mb-6">{email}</p>
            <p className="text-xs text-neutral-400">
              Didn't receive it? Check spam or{" "}
              <button onClick={() => setSent(false)} className="text-blue-700 hover:text-blue-800">
                try again
              </button>.
            </p>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-neutral-100 text-center">
          <Link href="/login" className="text-sm text-neutral-400 hover:text-neutral-700 transition-colors">
            ← Back to sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
