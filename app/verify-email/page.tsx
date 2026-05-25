"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useState, useEffect, Suspense } from "react"
import { Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email") ?? ""

  const [resent, setResent]       = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState("")
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
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
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
    <div className="min-h-screen bg-[#F7F4EC] flex flex-col items-center justify-center px-5 py-12">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 mb-10">
        <img src="/logo.png" alt="LeadMapper" className="w-8 h-8 object-contain" />
        <span className="font-kalam font-bold text-[#1A1A1A] text-xl">LeadMapper</span>
      </Link>

      <div className="w-full max-w-[420px]">
        <div className="bg-[#F7F4EC] border-2 border-[#1A1A1A] rounded-[14px] shadow-brutal-lg p-10 text-center">
          {/* Icon */}
          <div className="w-16 h-16 bg-[#FFE45E] border-2 border-[#1A1A1A] rounded-[12px] flex items-center justify-center mx-auto mb-5 text-3xl shadow-brutal">
            ✉️
          </div>

          <h1 className="font-kalam font-bold text-3xl text-[#1A1A1A] mb-2">Confirm your email</h1>
          <p className="font-kalam text-sm text-[#6B6B6B] mb-1">We sent a confirmation link to</p>

          {email && (
            <div className="inline-block bg-[#FFE45E] border-2 border-[#1A1A1A] rounded-[8px] px-4 py-1.5 mb-5 shadow-brutal">
              <span className="font-kalam font-bold text-[#1A1A1A] text-sm">{email}</span>
            </div>
          )}
          {!email && <p className="font-kalam font-bold text-[#1A1A1A] mb-5">your email address</p>}

          {/* Instructions */}
          <div className="bg-[#EFEBE0] border-2 border-[#1A1A1A] rounded-[10px] px-4 py-3 mb-6 text-left">
            <p className="font-kalam text-[13px] text-[#3A3A3A] leading-relaxed">
              Click the link in the email to activate your account. Check your spam folder if you don&apos;t see it within a minute.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-[#FF6B5C]/10 border-2 border-[#FF6B5C] rounded-[8px] px-4 py-3 mb-4 font-kalam text-sm text-[#FF6B5C]">
              ⚠ {error}
            </div>
          )}

          {/* Resent success */}
          {resent && (
            <div className="bg-[#6FCF97]/20 border-2 border-[#6FCF97] rounded-[8px] px-4 py-3 mb-4 font-kalam text-sm text-[#1A1A1A] flex items-center justify-center gap-2">
              ✓ Confirmation email resent!
            </div>
          )}

          {/* Resend button */}
          {email && (
            <button
              onClick={handleResend}
              disabled={loading || countdown > 0}
              className="w-full flex items-center justify-center gap-2 font-kalam font-bold text-[#1A1A1A] bg-[#EFEBE0] border-2 border-[#1A1A1A] rounded-[10px] py-3 text-sm btn-press shadow-brutal disabled:opacity-50 disabled:cursor-not-allowed mb-4 transition-all"
            >
              {loading
                ? <><Loader2 size={14} className="animate-spin" /> Sending…</>
                : countdown > 0
                ? `Resend in ${countdown}s`
                : "↻ Resend confirmation email"
              }
            </button>
          )}

          <Link href="/login" className="font-kalam text-sm text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">
            ← Back to sign in
          </Link>
        </div>

        {/* Helper note */}
        <div className="mt-4 bg-[#EFEBE0] border-2 border-[#1A1A1A] rounded-[10px] shadow-brutal px-4 py-3">
          <p className="font-jetbrains text-[11px] text-[#6B6B6B] text-center">
            Wrong email?{" "}
            <Link href="/signup" className="text-[#1A1A1A] font-bold underline underline-offset-2 hover:opacity-70">
              Sign up again
            </Link>
            {" "}with the correct address.
          </p>
        </div>
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
