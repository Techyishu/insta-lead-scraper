"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Eye, EyeOff, ArrowRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

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
    <div className="min-h-screen bg-[#FAFAF9] flex flex-col items-center justify-center px-5 py-12">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 mb-10">
        <img src="/logo.png" alt="LeadMapper" className="w-8 h-8 object-contain" />
        <span className="font-display font-bold text-neutral-900 text-xl tracking-tight">LeadMapper</span>
      </Link>

      {/* Card */}
      <div className="w-full max-w-[400px] bg-white border border-neutral-200 rounded-xl p-8 shadow-sm">
        <h1 className="font-display font-bold text-2xl text-neutral-900 mb-1">Welcome back</h1>
        <p className="text-neutral-400 text-sm mb-7">Sign in to your LeadMapper account.</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Email</label>
            <input
              type="email"
              autoComplete="email"
              required
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-neutral-200 rounded-lg px-4 py-3 text-sm text-neutral-900 placeholder-neutral-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Password</label>
              <Link href="/forgot-password" className="text-xs text-blue-700 hover:text-blue-800 transition-colors">
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

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors text-sm mt-2"
          >
            {loading ? "Signing in…" : (
              <>Sign in <ArrowRight size={14} strokeWidth={2.5} /></>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-neutral-100 text-center">
          <p className="text-sm text-neutral-400">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-blue-700 hover:text-blue-800 font-semibold transition-colors">
              Sign up free
            </Link>
          </p>
        </div>
      </div>

      <p className="text-xs text-neutral-400 mt-8 text-center max-w-xs">
        By signing in, you agree to our{" "}
        <Link href="/terms" className="hover:text-neutral-600 transition-colors">Terms</Link>
        {" "}and{" "}
        <Link href="/privacy" className="hover:text-neutral-600 transition-colors">Privacy Policy</Link>.
      </p>
    </div>
  )
}
