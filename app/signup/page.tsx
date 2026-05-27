"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    credits: "50 credits total",
    emoji: "🌱",
    desc: "Perfect to try it out",
    popular: false,
  },
  {
    id: "starter",
    name: "Starter",
    price: "$49/mo",
    credits: "5,000 credits/mo",
    emoji: "🚀",
    desc: "For active prospectors",
    popular: false,
  },
  {
    id: "growth",
    name: "Growth",
    price: "$89/mo",
    credits: "10,000 credits/mo",
    emoji: "⚡",
    desc: "For agencies & teams",
    popular: true,
  },
]

const perks = [
  { icon: "🗺️", text: "Google Maps data, verified in real-time" },
  { icon: "📞", text: "Phone, website, ratings & categories" },
  { icon: "📤", text: "One-click CSV export — your CRM ready" },
  { icon: "🔒", text: "No credit card needed to start" },
]

export default function SignupPage() {
  const [step, setStep]             = useState(1)
  const [name, setName]             = useState("")
  const [email, setEmail]           = useState("")
  const [password, setPassword]     = useState("")
  const [showPass, setShowPass]     = useState(false)
  const [selectedPlan, setSelectedPlan] = useState("free")
  const [agreed, setAgreed]         = useState(false)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState("")
  const router = useRouter()

  const handleGoogleLogin = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault()
    setStep(2)
  }

  const handleSignup = async () => {
    setError("")
    setLoading(true)
    const supabase = createClient()
    const siteUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name, plan: selectedPlan },
        emailRedirectTo: `${siteUrl}/auth/callback`,
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    setLoading(false)
    router.push(`/verify-email?email=${encodeURIComponent(email)}`)
  }

  const inputCls = "w-full font-kalam text-sm text-[#1A1A1A] placeholder:text-[#B8B5AA] bg-[#EFEBE0] border-2 border-[#1A1A1A] rounded-[10px] px-4 py-3 outline-none focus:shadow-brutal transition-all"

  return (
    <div className="min-h-screen bg-[#F7F4EC] flex flex-col lg:flex-row">

      {/* ── Left panel ── */}
      <div className="hidden lg:flex flex-col justify-between w-[460px] flex-shrink-0 bg-[#1A1A1A] border-r-2 border-[#1A1A1A] p-10 relative overflow-hidden">
        <div className="absolute top-[-60px] right-[-60px] w-48 h-48 bg-[#FFE45E]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-40px] left-[-40px] w-36 h-36 bg-[#6FCF97]/10 rounded-full blur-2xl pointer-events-none" />

        <Link href="/" className="relative z-10">
          <span className="font-kalam font-bold text-[#FFE45E] text-xl">LeadMapper</span>
        </Link>

        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="font-kalam font-bold text-4xl text-[#F7F4EC] leading-tight mb-3">
              Start finding leads<br />
              <span className="text-[#FFE45E]">for free today.</span>
            </h2>
            <p className="font-jetbrains text-[12px] text-[#6B6B6B] leading-relaxed">
              50 free credits, no card needed. Upgrade when you&apos;re ready.
            </p>
          </div>

          {/* Perks */}
          <div className="space-y-3">
            {perks.map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#F7F4EC] border-2 border-[#FFE45E] rounded-[8px] flex items-center justify-center text-lg flex-shrink-0">
                  {p.icon}
                </div>
                <span className="font-kalam text-[14px] text-[#EFEBE0]">{p.text}</span>
              </div>
            ))}
          </div>

          {/* Social proof */}
          <div className="bg-[#F7F4EC]/5 border-2 border-[#FFE45E]/30 rounded-[10px] p-4">
            <p className="font-kalam text-[14px] text-[#EFEBE0] leading-relaxed mb-2">
              &ldquo;Found 200 plumber leads in Chicago in under a minute. Booked 3 demos the same day.&rdquo;
            </p>
            <p className="font-jetbrains text-[10px] text-[#6B6B6B]">— SDR at a B2B SaaS company</p>
          </div>
        </div>

        <p className="font-jetbrains text-[10px] text-[#3A3A3A] relative z-10">
          © {new Date().getFullYear()} LeadMapper. All rights reserved.
        </p>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-12 min-h-screen lg:min-h-0">
        {/* Mobile logo */}
        <Link href="/" className="mb-8 lg:hidden">
          <span className="font-kalam font-bold text-[#1A1A1A] text-xl">LeadMapper</span>
        </Link>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-7">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-7 h-7 rounded-full border-2 font-kalam font-bold text-[13px] transition-all ${
                s === step
                  ? "bg-[#1A1A1A] border-[#1A1A1A] text-[#FFE45E]"
                  : s < step
                  ? "bg-[#6FCF97] border-[#1A1A1A] text-[#1A1A1A]"
                  : "bg-[#EFEBE0] border-[#B8B5AA] text-[#B8B5AA]"
              }`}>
                {s < step ? "✓" : s}
              </div>
              <span className={`font-jetbrains text-[11px] hidden sm:block ${s === step ? "text-[#1A1A1A] font-bold" : "text-[#B8B5AA]"}`}>
                {s === 1 ? "Your details" : "Choose plan"}
              </span>
              {s < 2 && <div className={`w-8 h-0.5 rounded-full ${step > 1 ? "bg-[#6FCF97]" : "bg-[#EFEBE0]"}`} />}
            </div>
          ))}
        </div>

        <div className="w-full max-w-[420px]">
          <div className="bg-[#F7F4EC] border-2 border-[#1A1A1A] rounded-[14px] shadow-brutal-lg p-8">

            {step === 1 ? (
              <>
                <div className="mb-7">
                  <h1 className="font-kalam font-bold text-3xl text-[#1A1A1A] mb-1">Create account 🎉</h1>
                  <p className="font-jetbrains text-[12px] text-[#6B6B6B]">Start with 50 free leads — no credit card required.</p>
                </div>

                {error && (
                  <div className="bg-[#FF6B5C]/10 border-2 border-[#FF6B5C] rounded-[8px] px-4 py-3 font-kalam text-sm text-[#FF6B5C] mb-5">
                    ⚠ {error}
                  </div>
                )}

                {/* Google */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-3 font-kalam font-bold text-[#1A1A1A] bg-white border-2 border-[#1A1A1A] rounded-[10px] py-3.5 text-base btn-press shadow-brutal hover:bg-[#EFEBE0] transition-all mb-5"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>

                {/* Divider */}
                <div className="relative mb-5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t-2 border-[#EFEBE0]" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-[#F7F4EC] px-3 font-jetbrains text-[10px] text-[#B8B5AA] uppercase tracking-wider">or sign up with email</span>
                  </div>
                </div>

                <form onSubmit={handleStep1} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="font-jetbrains text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider">Full name</label>
                    <input type="text" required placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-jetbrains text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider">Work email</label>
                    <input type="email" required placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-jetbrains text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider">Password</label>
                    <div className="relative">
                      <input
                        type={showPass ? "text" : "password"}
                        required
                        minLength={8}
                        placeholder="Min. 8 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={inputCls + " pr-11"}
                      />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <div
                      onClick={() => setAgreed(!agreed)}
                      className={`w-5 h-5 mt-0.5 rounded-[4px] border-2 border-[#1A1A1A] flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer ${agreed ? "bg-[#1A1A1A]" : "bg-[#EFEBE0]"}`}
                    >
                      {agreed && <span className="text-[#FFE45E] text-[11px] font-bold leading-none">✓</span>}
                    </div>
                    <input type="checkbox" required checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="sr-only" />
                    <span className="font-kalam text-[13px] text-[#6B6B6B] leading-relaxed">
                      I agree to the{" "}
                      <Link href="/terms" className="text-[#1A1A1A] font-bold underline underline-offset-2 hover:opacity-70">Terms</Link>
                      {" "}and{" "}
                      <Link href="/privacy" className="text-[#1A1A1A] font-bold underline underline-offset-2 hover:opacity-70">Privacy Policy</Link>.
                    </span>
                  </label>

                  <button
                    type="submit"
                    className="w-full font-kalam font-bold text-[#F7F4EC] bg-[#1A1A1A] border-2 border-[#1A1A1A] rounded-[10px] py-3.5 text-base btn-press shadow-brutal mt-2"
                  >
                    Continue →
                  </button>
                </form>

                <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
                  {["✓ No credit card", "✓ 50 free leads", "✓ Cancel anytime"].map((item) => (
                    <span key={item} className="font-kalam text-[12px] text-[#6B6B6B]">{item}</span>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="mb-6">
                  <h1 className="font-kalam font-bold text-3xl text-[#1A1A1A] mb-1">Pick your plan 📋</h1>
                  <p className="font-jetbrains text-[12px] text-[#6B6B6B]">Start free or pick a plan that fits your needs.</p>
                </div>

                {error && (
                  <div className="bg-[#FF6B5C]/10 border-2 border-[#FF6B5C] rounded-[8px] px-4 py-3 font-kalam text-sm text-[#FF6B5C] mb-5">
                    ⚠ {error}
                  </div>
                )}

                <div className="space-y-2.5 mb-6">
                  {plans.map((plan) => (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`w-full flex items-center justify-between p-4 rounded-[10px] border-2 transition-all text-left relative ${
                        selectedPlan === plan.id
                          ? "bg-[#FFE45E] border-[#1A1A1A] shadow-brutal"
                          : "bg-[#EFEBE0] border-[#1A1A1A] hover:bg-[#F7F4EC]"
                      }`}
                    >
                      {plan.popular && selectedPlan !== plan.id && (
                        <div className="absolute -top-2.5 right-3 font-jetbrains text-[9px] font-bold bg-[#FF6B5C] text-[#F7F4EC] border border-[#1A1A1A] rounded-full px-2 py-0.5">
                          Popular
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          selectedPlan === plan.id ? "bg-[#1A1A1A] border-[#1A1A1A]" : "bg-[#F7F4EC] border-[#B8B5AA]"
                        }`}>
                          {selectedPlan === plan.id && <div className="w-2 h-2 rounded-full bg-[#FFE45E]" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-kalam font-bold text-[#1A1A1A] text-sm">{plan.emoji} {plan.name}</span>
                          </div>
                          <div className="font-jetbrains text-[10px] text-[#6B6B6B]">{plan.credits} · {plan.desc}</div>
                        </div>
                      </div>
                      <span className="font-kalam font-bold text-[#1A1A1A] text-sm">{plan.price}</span>
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleSignup}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 font-kalam font-bold text-[#F7F4EC] bg-[#1A1A1A] border-2 border-[#1A1A1A] rounded-[10px] py-3.5 text-base btn-press shadow-brutal disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading
                    ? <><Loader2 size={15} className="animate-spin" /> Creating account…</>
                    : selectedPlan === "free" ? "🎉 Get 50 Free Leads →" : "⚡ Start My Plan →"
                  }
                </button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full text-center font-kalam text-sm text-[#6B6B6B] hover:text-[#1A1A1A] mt-3 transition-colors"
                >
                  ← Back
                </button>
              </>
            )}

            <div className="mt-6 pt-6 border-t-2 border-[#EFEBE0] text-center">
              <p className="font-kalam text-sm text-[#6B6B6B]">
                Already have an account?{" "}
                <Link href="/login" className="font-bold text-[#1A1A1A] underline underline-offset-2 hover:opacity-70 transition-opacity">
                  Sign in →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
