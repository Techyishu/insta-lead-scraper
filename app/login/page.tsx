"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const DEMO_LEADS = [
  { name: "Sunrise Dental Care",   phone: "(312) 555-0182", rating: "4.9", city: "Chicago, IL"    },
  { name: "Peak Plumbing & Heat",  phone: "(415) 555-0247", rating: "4.8", city: "San Francisco"  },
  { name: "Luxe Hair Studio",      phone: "(213) 555-0391", rating: "5.0", city: "Los Angeles"    },
  { name: "Bella Vista Ristorante",phone: "(212) 555-0158", rating: "4.7", city: "New York, NY"   },
  { name: "Summit Law Group",      phone: "(512) 555-0263", rating: "4.9", city: "Austin, TX"     },
]

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState("")

  const handleGoogleLogin = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      if (error.message.toLowerCase().includes("email not confirmed")) {
        router.push(`/verify-email?email=${encodeURIComponent(email)}`)
        return
      }
      setError(error.message)
      setLoading(false)
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#F7F4EC] flex flex-col lg:flex-row">

      {/* ── Left panel — brand & preview ── */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] flex-shrink-0 bg-[#1A1A1A] border-r-2 border-[#1A1A1A] p-10 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-[-60px] right-[-60px] w-48 h-48 bg-[#FFE45E]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-40px] left-[-40px] w-36 h-36 bg-[#FF6B5C]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Logo */}
        <Link href="/" className="relative z-10">
          <span className="font-kalam font-bold text-[#FFE45E] text-xl">LeadMapper</span>
        </Link>

        {/* Hero copy */}
        <div className="relative z-10 space-y-6">
          <div>
            <h2 className="font-kalam font-bold text-4xl text-[#F7F4EC] leading-tight mb-3">
              Find local leads<br />
              <span className="text-[#FFE45E]">in 30 seconds.</span>
            </h2>
            <p className="font-jetbrains text-[12px] text-[#6B6B6B] leading-relaxed">
              Search any business type by location. Export verified names, phones, websites & ratings to CSV.
            </p>
          </div>

          {/* Mini lead table */}
          <div className="bg-[#F7F4EC] border-2 border-[#FFE45E] rounded-[12px] shadow-[4px_4px_0px_0px_#FFE45E] overflow-hidden">
            <div className="bg-[#FFE45E] px-4 py-2 flex items-center justify-between">
              <span className="font-jetbrains text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wider">Live results — dentists, Chicago</span>
              <span className="font-jetbrains text-[10px] text-[#3A3A3A]">5 of 184</span>
            </div>
            <div className="divide-y divide-[#EFEBE0]">
              {DEMO_LEADS.map((lead, i) => (
                <div key={i} className="px-4 py-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-kalam font-bold text-[#1A1A1A] text-[12px] truncate">{lead.name}</div>
                    <div className="font-jetbrains text-[10px] text-[#B8B5AA]">{lead.city}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-jetbrains text-[10px] text-[#6B6B6B]">{lead.phone}</span>
                    <span className="font-kalam font-bold text-[11px] text-[#1A1A1A] bg-[#FFE45E] border border-[#1A1A1A] rounded-[4px] px-1.5 py-0.5">★{lead.rating}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-[#EFEBE0] px-4 py-2 text-center">
              <span className="font-jetbrains text-[10px] text-[#6B6B6B]">↓ Export all 184 leads as CSV</span>
            </div>
          </div>

          {/* Trust pills */}
          <div className="flex flex-wrap gap-2">
            {["✓ No credit card", "✓ 50 free leads", "✓ Cancel anytime"].map((t) => (
              <span key={t} className="font-kalam font-bold text-[12px] text-[#1A1A1A] bg-[#FFE45E] border-2 border-[#FFE45E] rounded-[6px] px-3 py-1">
                {t}
              </span>
            ))}
          </div>
        </div>

        <p className="font-jetbrains text-[10px] text-[#3A3A3A] relative z-10">
          © {new Date().getFullYear()} LeadMapper. All rights reserved.
        </p>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-12 min-h-screen lg:min-h-0">
        {/* Mobile logo */}
        <Link href="/" className="mb-10 lg:hidden">
          <span className="font-kalam font-bold text-[#1A1A1A] text-xl">LeadMapper</span>
        </Link>

        <div className="w-full max-w-[400px]">
          {/* Card */}
          <div className="bg-[#F7F4EC] border-2 border-[#1A1A1A] rounded-[14px] shadow-brutal-lg p-8">
            {/* Header */}
            <div className="mb-7">
              <h1 className="font-kalam font-bold text-3xl text-[#1A1A1A] mb-1">Welcome back 👋</h1>
              <p className="font-jetbrains text-[12px] text-[#6B6B6B]">Sign in to your LeadMapper account.</p>
            </div>

            {/* Error */}
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
                <span className="bg-[#F7F4EC] px-3 font-jetbrains text-[10px] text-[#B8B5AA] uppercase tracking-wider">or sign in with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="font-jetbrains text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider">
                  Email
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full font-kalam text-sm text-[#1A1A1A] placeholder:text-[#B8B5AA] bg-[#EFEBE0] border-2 border-[#1A1A1A] rounded-[10px] px-4 py-3 outline-none focus:shadow-brutal transition-all"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-jetbrains text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider">
                    Password
                  </label>
                  <Link href="/forgot-password" className="font-kalam text-[12px] text-[#1A1A1A] underline underline-offset-2 hover:opacity-70 transition-opacity">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full font-kalam text-sm text-[#1A1A1A] placeholder:text-[#B8B5AA] bg-[#EFEBE0] border-2 border-[#1A1A1A] rounded-[10px] px-4 py-3 pr-11 outline-none focus:shadow-brutal transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 font-kalam font-bold text-[#F7F4EC] bg-[#1A1A1A] border-2 border-[#1A1A1A] rounded-[10px] py-3.5 text-base btn-press shadow-brutal disabled:opacity-50 disabled:cursor-not-allowed mt-2 transition-all"
              >
                {loading
                  ? <><Loader2 size={15} className="animate-spin" /> Signing in…</>
                  : "Sign in →"
                }
              </button>
            </form>

            <div className="mt-6 pt-6 border-t-2 border-[#EFEBE0] text-center">
              <p className="font-kalam text-sm text-[#6B6B6B]">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="font-bold text-[#1A1A1A] underline underline-offset-2 hover:opacity-70 transition-opacity">
                  Sign up free →
                </Link>
              </p>
            </div>
          </div>

          <p className="font-jetbrains text-[10px] text-[#B8B5AA] mt-5 text-center leading-relaxed">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="text-[#6B6B6B] hover:text-[#1A1A1A] underline underline-offset-2">Terms</Link>
            {" "}and{" "}
            <Link href="/privacy" className="text-[#6B6B6B] hover:text-[#1A1A1A] underline underline-offset-2">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
