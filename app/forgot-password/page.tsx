"use client"

import Link from "next/link"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function ForgotPasswordPage() {
  const [email, setEmail]   = useState("")
  const [sent, setSent]     = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState("")

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
    <div className="min-h-screen bg-[#F7F4EC] flex flex-col items-center justify-center px-5 py-12">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 mb-10">
        <img src="/logo.png" alt="LeadMapper" className="w-8 h-8 object-contain" />
        <span className="font-kalam font-bold text-[#1A1A1A] text-xl">LeadMapper</span>
      </Link>

      <div className="w-full max-w-[400px]">
        <div className="bg-[#F7F4EC] border-2 border-[#1A1A1A] rounded-[14px] shadow-brutal-lg p-8">
          {!sent ? (
            <>
              <div className="mb-7">
                <div className="w-12 h-12 bg-[#FFE45E] border-2 border-[#1A1A1A] rounded-[10px] flex items-center justify-center mb-4 text-2xl shadow-brutal">
                  🔑
                </div>
                <h1 className="font-kalam font-bold text-3xl text-[#1A1A1A] mb-1">Reset password</h1>
                <p className="font-jetbrains text-[12px] text-[#6B6B6B]">
                  Enter your email and we&apos;ll send you a reset link.
                </p>
              </div>

              {error && (
                <div className="bg-[#FF6B5C]/10 border-2 border-[#FF6B5C] rounded-[8px] px-4 py-3 font-kalam text-sm text-[#FF6B5C] mb-5">
                  ⚠ {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="font-jetbrains text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider">
                    Email address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full font-kalam text-sm text-[#1A1A1A] placeholder:text-[#B8B5AA] bg-[#EFEBE0] border-2 border-[#1A1A1A] rounded-[10px] px-4 py-3 outline-none focus:shadow-brutal transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 font-kalam font-bold text-[#F7F4EC] bg-[#1A1A1A] border-2 border-[#1A1A1A] rounded-[10px] py-3.5 text-base btn-press shadow-brutal disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading
                    ? <><Loader2 size={15} className="animate-spin" /> Sending…</>
                    : "Send reset link →"
                  }
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-2">
              <div className="w-16 h-16 bg-[#6FCF97]/20 border-2 border-[#6FCF97] rounded-[12px] flex items-center justify-center mx-auto mb-5 text-3xl shadow-[3px_3px_0px_0px_#6FCF97]">
                ✉️
              </div>
              <h2 className="font-kalam font-bold text-2xl text-[#1A1A1A] mb-2">Check your email</h2>
              <p className="font-kalam text-sm text-[#6B6B6B] mb-1">We sent a reset link to</p>
              <p className="font-kalam font-bold text-[#1A1A1A] mb-6 bg-[#FFE45E] border-2 border-[#1A1A1A] rounded-[8px] px-3 py-1.5 inline-block">
                {email}
              </p>
              <p className="font-kalam text-sm text-[#6B6B6B]">
                Didn&apos;t receive it? Check spam or{" "}
                <button onClick={() => setSent(false)} className="text-[#1A1A1A] font-bold underline underline-offset-2 hover:opacity-70">
                  try again
                </button>.
              </p>
            </div>
          )}

          <div className="mt-6 pt-6 border-t-2 border-[#EFEBE0] text-center">
            <Link href="/login" className="font-kalam text-sm text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">
              ← Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
