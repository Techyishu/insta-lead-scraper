"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Eye, EyeOff, ArrowRight, Check, Zap } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const plans = [
  { id: "free", name: "Free", price: "$0", credits: "50 credits total", popular: false },
  { id: "starter", name: "Starter", price: "$49/mo", credits: "5,000 credits/mo", popular: false },
  { id: "growth", name: "Growth", price: "$89/mo", credits: "10,000 credits/mo", popular: true },
]

export default function SignupPage() {
  const [step, setStep] = useState(1)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState("free")
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault()
    setStep(2)
  }

  const handleSignup = async () => {
    setError("")
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name, plan: selectedPlan },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
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

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex flex-col items-center justify-center px-5 py-12">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 mb-10">
        <img src="/logo.png" alt="LeadMapper" className="w-8 h-8 object-contain" />
        <span className="font-display font-bold text-neutral-900 text-xl tracking-tight">LeadMapper</span>
      </Link>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2].map((s) => (
          <div
            key={s}
            className={`h-1.5 rounded-full transition-all ${
              s === step ? "w-8 bg-blue-700" : s < step ? "w-4 bg-emerald-500" : "w-4 bg-neutral-200"
            }`}
          />
        ))}
      </div>

      <div className="w-full max-w-[420px] bg-white border border-neutral-200 rounded-xl p-8 shadow-sm">
        {step === 1 ? (
          <>
            <h1 className="font-display font-bold text-2xl text-neutral-900 mb-1">Create your account</h1>
            <p className="text-neutral-400 text-sm mb-7">Start with 50 free leads — no credit card required.</p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-5">
                {error}
              </div>
            )}

            <form onSubmit={handleStep1} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Full name</label>
                <input
                  type="text"
                  required
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-neutral-200 rounded-lg px-4 py-3 text-sm text-neutral-900 placeholder-neutral-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Work email</label>
                <input
                  type="email"
                  required
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-neutral-200 rounded-lg px-4 py-3 text-sm text-neutral-900 placeholder-neutral-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    required
                    minLength={8}
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border border-neutral-200 rounded-lg px-4 py-3 pr-11 text-sm text-neutral-900 placeholder-neutral-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 accent-blue-700"
                />
                <span className="text-xs text-neutral-400 leading-relaxed">
                  I agree to the{" "}
                  <Link href="/terms" className="text-blue-700 hover:text-blue-800">Terms of Service</Link>
                  {" "}and{" "}
                  <Link href="/privacy" className="text-blue-700 hover:text-blue-800">Privacy Policy</Link>.
                </span>
              </label>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 rounded-lg transition-colors text-sm mt-1"
              >
                Continue <ArrowRight size={14} strokeWidth={2.5} />
              </button>
            </form>

            <div className="flex flex-wrap items-center justify-center gap-4 mt-5">
              {["No credit card", "50 free leads", "Cancel anytime"].map((item) => (
                <div key={item} className="flex items-center gap-1 text-xs text-neutral-400">
                  <Check size={11} strokeWidth={2.5} className="text-emerald-500" />
                  {item}
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <h1 className="font-display font-bold text-2xl text-neutral-900 mb-1">Choose your plan</h1>
            <p className="text-neutral-400 text-sm mb-6">Start free or pick a plan that fits your needs.</p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-5">
                {error}
              </div>
            )}

            <div className="space-y-2.5 mb-6">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left ${
                    selectedPlan === plan.id
                      ? "border-blue-700 bg-blue-50 ring-1 ring-blue-700"
                      : "border-neutral-200 bg-white hover:border-neutral-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      selectedPlan === plan.id ? "border-blue-700" : "border-neutral-300"
                    }`}>
                      {selectedPlan === plan.id && <div className="w-2 h-2 rounded-full bg-blue-700" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-neutral-900">{plan.name}</span>
                        {plan.popular && (
                          <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded font-semibold">Popular</span>
                        )}
                      </div>
                      <div className="text-xs text-neutral-400">{plan.credits}</div>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-neutral-900">{plan.price}</span>
                </button>
              ))}
            </div>

            <button
              onClick={handleSignup}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors text-sm"
            >
              {loading ? "Creating account…" : (
                <>
                  <Zap size={14} strokeWidth={2} />
                  {selectedPlan === "free" ? "Get 50 Free Leads" : "Start My Plan"}
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-center text-xs text-neutral-400 hover:text-neutral-600 mt-3 transition-colors"
            >
              ← Back
            </button>
          </>
        )}

        <div className="mt-6 pt-6 border-t border-neutral-100 text-center">
          <p className="text-sm text-neutral-400">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-700 hover:text-blue-800 font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
