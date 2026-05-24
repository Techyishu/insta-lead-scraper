"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useState, useEffect, Suspense } from "react"
import { Search, Mail, RefreshCw, CheckCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email") ?? ""

  const [resent, setResent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (countdown <= 0) return
    const t = setInterval(() => setCountdown((c) => c - 1), 1000)
    return () => clearInterval(t)
  }, [countdown])

  const handleResend = async () => {
    if (!email || countdown > 0) return
    setError("")
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    setResent(true)
    setCountdown(60)
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex flex-col items-center justify-center px-5 py-12">
      <Link href="/" className="flex items-center gap-2.5 mb-10">
        <img src="/logo.png" alt="LeadMapper" className="w-8 h-8 object-contain" />
        <span className="font-display font-bold text-neutral-900 text-xl tracking-tight">LeadMapper</span>
      </Link>

      <div className="w-full max-w-[420px] bg-white border border-neutral-200 rounded-xl p-10 shadow-sm text-center">
        <div className="w-14 h-14 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-5">
          <Mail size={26} className="text-blue-700" strokeWidth={1.75} />
        </div>

        <h1 className="font-display font-bold text-2xl text-neutral-900 mb-2">Confirm your email</h1>
        <p className="text-sm text-neutral-400 mb-1">We sent a confirmation link to</p>
        <p className="text-sm font-semibold text-neutral-900 mb-6">
          {email || "your email address"}
        </p>

        <div className="bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3 mb-6 text-left">
          <p className="text-xs text-neutral-500 leading-relaxed">
            Click the link in the email to activate your account. Check your spam folder if you don't see it.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {resent && (
          <div className="flex items-center justify-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 mb-4">
            <CheckCircle size={14} strokeWidth={2.5} />
            Confirmation email resent.
          </div>
        )}

        {email && (
          <button
            onClick={handleResend}
            disabled={loading || countdown > 0}
            className="w-full flex items-center justify-center gap-2 bg-neutral-100 hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed text-neutral-700 font-medium text-sm py-2.5 rounded-lg transition-colors mb-4"
          >
            <RefreshCw size={14} strokeWidth={2} className={loading ? "animate-spin" : ""} />
            {loading
              ? "Sending…"
              : countdown > 0
              ? `Resend in ${countdown}s`
              : "Resend confirmation email"}
          </button>
        )}

        <Link
          href="/login"
          className="text-sm text-neutral-400 hover:text-neutral-700 transition-colors"
        >
          ← Back to sign in
        </Link>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  )
}
