"use client"

import Link from "next/link"
import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Loader2, ExternalLink } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    credits: "50 total credits",
    features: ["50 credits total (lifetime)", "Phone & website filter", "CSV export", "Basic search"],
    cta: "Current plan",
  },
  {
    id: "starter",
    name: "Starter",
    price: 39,
    credits: "2,500 credits/month",
    features: ["2,500 credits/month", "Phone & website filter", "500 email enrichments/mo", "CSV export", "Email support"],
    cta: "Upgrade to Starter",
  },
  {
    id: "growth",
    name: "Growth",
    price: 79,
    credits: "5,000 credits/month",
    popular: true,
    features: [
      "5,000 credits/month",
      "2,000 email enrichments/mo",
      "Bulk processing",
      "Priority support",
      "Unlimited saved searches",
    ],
    cta: "Upgrade to Growth",
  },
  {
    id: "scale",
    name: "Scale",
    price: 129,
    credits: "12,000 credits/month",
    features: [
      "12,000 credits/month",
      "5,000 email enrichments/mo",
      "Bulk processing",
      "Dedicated support",
      "Early access to new features",
    ],
    cta: "Upgrade to Scale",
  },
]

export default function BillingPage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto py-12 text-center font-kalam text-[#6B6B6B]">
        Loading billing…
      </div>
    }>
      <BillingPageInner />
    </Suspense>
  )
}

function BillingPageInner() {
  const searchParams  = useSearchParams()
  const router        = useRouter()
  const paymentStatus = searchParams.get("payment")
  const paymentPlan   = searchParams.get("plan")

  const [currentPlan, setCurrentPlan]         = useState("free")
  const [creditsUsed, setCreditsUsed]         = useState(0)
  const [creditsLimit, setCreditsLimit]       = useState(50)
  const [loading, setLoading]                 = useState(true)
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const [checkoutError, setCheckoutError]     = useState("")
  const [polling, setPolling]                 = useState(false)
  const [upgradeSuccess, setUpgradeSuccess]   = useState("")
  const [confirmUpgrade, setConfirmUpgrade]   = useState<{ planId: string; amount: number; currency: string } | null>(null)
  const [previewLoading, setPreviewLoading]   = useState<string | null>(null)
  const [confirmReactivate, setConfirmReactivate] = useState<{ planId: string; amount: number | null; currency: string | null } | null>(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelLoading, setCancelLoading]     = useState(false)
  const [cancelError, setCancelError]         = useState("")
  const [cancelledSuccessfully, setCancelledSuccessfully] = useState(false)

  const fetchProfile = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("credits_used, credits_limit, plan, cancel_at_period_end")
      .eq("id", user.id)
      .single()
    return profile
  }

  useEffect(() => {
    fetchProfile().then((profile) => {
      if (profile) {
        setCurrentPlan(profile.plan ?? "free")
        setCreditsUsed(profile.credits_used ?? 0)
        setCreditsLimit(profile.credits_limit ?? 50)
        setCancelAtPeriodEnd(profile.cancel_at_period_end ?? false)
      }
      setLoading(false)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (paymentStatus !== "success" || !paymentPlan) return
    if (currentPlan === paymentPlan) {
      const timer = setTimeout(() => router.replace("/dashboard/billing"), 3000)
      return () => clearTimeout(timer)
    }
    setPolling(true)
    let attempts = 0
    const MAX_ATTEMPTS = 15
    const interval = setInterval(async () => {
      attempts++
      const profile = await fetchProfile()
      if (profile && profile.plan === paymentPlan) {
        setCurrentPlan(profile.plan)
        setCreditsUsed(profile.credits_used ?? 0)
        setCreditsLimit(profile.credits_limit ?? 50)
        setCancelAtPeriodEnd(profile.cancel_at_period_end ?? false)
        setPolling(false)
        clearInterval(interval)
        setTimeout(() => router.replace("/dashboard/billing"), 3000)
      } else if (attempts >= MAX_ATTEMPTS) {
        setPolling(false)
        clearInterval(interval)
        router.replace("/dashboard/billing")
      }
    }, 2000)
    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentStatus, paymentPlan])

  const handleUpgradeClick = async (planId: string) => {
    setCheckoutError("")
    setPreviewLoading(planId)
    try {
      const res  = await fetch(`/api/payments/preview-upgrade?plan=${planId}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to preview upgrade")
      if (data.needsCheckout) {
        await handleUpgradeConfirm(planId)
      } else if (data.needsReactivate) {
        setConfirmReactivate({ planId, amount: data.amount ?? null, currency: data.currency ?? null })
        setPreviewLoading(null)
      } else {
        setConfirmUpgrade({ planId, amount: data.amount, currency: data.currency })
        setPreviewLoading(null)
      }
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : "Something went wrong.")
      setPreviewLoading(null)
    }
  }

  const handleUpgradeConfirm = async (planId: string) => {
    setConfirmUpgrade(null)
    setCheckoutError("")
    setCheckoutLoading(planId)
    try {
      const res  = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to create checkout session")
      if (data.upgraded) {
        const updated = await fetchProfile()
        if (updated) {
          setCurrentPlan(updated.plan ?? planId)
          setCreditsUsed(updated.credits_used ?? 0)
          setCreditsLimit(updated.credits_limit ?? 50)
          setCancelAtPeriodEnd(updated.cancel_at_period_end ?? false)
        }
        setCancelledSuccessfully(false)
        setUpgradeSuccess(planId)
        setCheckoutLoading(null)
      } else if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error("Unexpected response from checkout")
      }
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : "Something went wrong.")
      setCheckoutLoading(null)
    }
  }

  const handleCancelConfirm = async () => {
    setCancelLoading(true)
    setCancelError("")
    try {
      const res  = await fetch("/api/payments/cancel", { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to cancel subscription")
      setCancelledSuccessfully(true)
      setCancelAtPeriodEnd(true)
      setShowCancelModal(false)
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setCancelLoading(false)
    }
  }

  const creditsRemaining = creditsLimit - creditsUsed
  const creditPct   = creditsLimit > 0 ? Math.min((creditsUsed / creditsLimit) * 100, 100) : 0
  const lowCredits  = creditsRemaining <= Math.ceil(creditsLimit * 0.15)
  const planLabel   = currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)
  const isPaidPlan  = currentPlan !== "free"

  const formatAmount = (amount: number, currency: string) => {
    const divisor = ["jpy", "krw"].includes(currency.toLowerCase()) ? 1 : 100
    const value   = amount / divisor
    try {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: currency.toUpperCase(),
        minimumFractionDigits: 0,
      }).format(value)
    } catch {
      return `${currency.toUpperCase()} ${value.toFixed(2)}`
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-kalam font-bold text-2xl text-[#1A1A1A] mb-1">Billing & Plans</h2>
        <p className="font-jetbrains text-[12px] text-[#6B6B6B]">Manage your subscription and upgrade to get more credits.</p>
      </div>

      {/* Banners */}
      {paymentStatus === "success" && (
        <div className="bg-[#6FCF97]/20 border-2 border-[#6FCF97] rounded-[10px] px-5 py-4 flex items-start gap-3">
          {polling ? <Loader2 size={18} className="text-[#6FCF97] mt-0.5 flex-shrink-0 animate-spin" /> : <span className="text-xl">✓</span>}
          <div>
            <p className="font-kalam font-bold text-[#1A1A1A]">Payment successful!</p>
            <p className="font-jetbrains text-[11px] text-[#3A3A3A] mt-0.5">
              {polling ? "Activating your plan… this usually takes a few seconds." : `Your ${(paymentPlan ?? currentPlan).charAt(0).toUpperCase() + (paymentPlan ?? currentPlan).slice(1)} plan is now active.`}
            </p>
          </div>
        </div>
      )}

      {upgradeSuccess && (
        <div className="bg-[#6FCF97]/20 border-2 border-[#6FCF97] rounded-[10px] px-5 py-4 flex items-start gap-3">
          <span className="text-xl">🎉</span>
          <div>
            <p className="font-kalam font-bold text-[#1A1A1A]">Plan upgraded!</p>
            <p className="font-jetbrains text-[11px] text-[#3A3A3A] mt-0.5">
              You&apos;re now on the <strong>{upgradeSuccess.charAt(0).toUpperCase() + upgradeSuccess.slice(1)}</strong> plan. Your credits have been refreshed.
            </p>
          </div>
        </div>
      )}

      {cancelledSuccessfully && (
        <div className="bg-[#FFE45E] border-2 border-[#1A1A1A] rounded-[10px] px-5 py-4 flex items-start gap-3">
          <span className="text-xl">👋</span>
          <div>
            <p className="font-kalam font-bold text-[#1A1A1A]">Subscription cancelled</p>
            <p className="font-jetbrains text-[11px] text-[#3A3A3A] mt-0.5">
              Your plan stays active until the end of your billing period. After that, you&apos;ll move to the Free plan.
            </p>
          </div>
        </div>
      )}

      {checkoutError && (
        <div className="bg-[#FF6B5C]/10 border-2 border-[#FF6B5C] rounded-[10px] px-5 py-4 flex items-start gap-3">
          <span className="text-[#FF6B5C]">⚠</span>
          <p className="font-kalam text-sm text-[#FF6B5C]">{checkoutError}</p>
        </div>
      )}

      {/* Current plan overview */}
      <div className="bg-[#F7F4EC] border-2 border-[#1A1A1A] rounded-[12px] shadow-brutal p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <div className="font-jetbrains text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider mb-1">Current Plan</div>
            <div className="flex items-center gap-3">
              {loading ? (
                <div className="h-8 w-20 bg-[#EFEBE0] rounded-[8px] animate-pulse" />
              ) : (
                <>
                  <span className="font-kalam font-bold text-3xl text-[#1A1A1A]">{planLabel}</span>
                  <span className="font-kalam font-bold text-[12px] text-[#F7F4EC] bg-[#6FCF97] border-2 border-[#1A1A1A] px-2 py-0.5 rounded-[6px]">
                    Active
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="font-jetbrains text-[10px] text-[#6B6B6B] mb-0.5">Credits remaining</div>
            {loading ? (
              <div className="h-9 w-24 bg-[#EFEBE0] rounded-[8px] animate-pulse ml-auto" />
            ) : (
              <div className={`font-kalam font-bold text-3xl ${lowCredits ? "text-[#FF6B5C]" : "text-[#1A1A1A]"}`}>
                {creditsRemaining} / {creditsLimit}
              </div>
            )}
          </div>
        </div>

        {!loading && (
          <>
            <div className="mb-4">
              <div className="flex items-center justify-between font-jetbrains text-[10px] text-[#6B6B6B] mb-1.5">
                <span>Credit usage</span>
                <span>{Math.round(creditPct)}% used</span>
              </div>
              <div className="h-2 bg-[#EFEBE0] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${lowCredits ? "bg-[#FF6B5C]" : "bg-[#1A1A1A]"}`}
                  style={{ width: `${creditPct}%` }}
                />
              </div>
            </div>

            {creditsRemaining === 0 ? (
              <div className="bg-[#FF6B5C]/10 border-2 border-[#FF6B5C] rounded-[8px] px-4 py-3">
                <p className="font-kalam text-sm text-[#FF6B5C]">⚡ You&apos;ve used all your credits. Upgrade now to continue finding leads.</p>
              </div>
            ) : lowCredits ? (
              <div className="bg-[#FFE45E] border-2 border-[#1A1A1A] rounded-[8px] px-4 py-3">
                <p className="font-kalam text-sm text-[#1A1A1A]">
                  ⚠ Running low — <strong>{creditsRemaining} credits left</strong>. Upgrade to keep prospecting.
                </p>
              </div>
            ) : (
              <div className="bg-[#EFEBE0] border border-[#1A1A1A]/20 rounded-[8px] px-4 py-3">
                <p className="font-kalam text-sm text-[#6B6B6B]">
                  {currentPlan === "free"
                    ? "Free plan includes 50 lifetime credits. Upgrade for monthly credit allowances."
                    : `Your ${planLabel} plan renews monthly with ${creditsLimit.toLocaleString()} credits.`}
                </p>
              </div>
            )}

            {isPaidPlan && (
              <div className="mt-4 pt-4 border-t-2 border-[#EFEBE0]">
                {cancelAtPeriodEnd || cancelledSuccessfully ? (
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FFE45E] mt-1.5 flex-shrink-0" />
                    <p className="font-kalam text-sm text-[#6B6B6B]">
                      <span className="font-bold text-[#1A1A1A]">Cancellation scheduled.</span>{" "}
                      Your plan stays active until the end of your billing period, then moves to Free.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <p className="font-kalam text-sm text-[#6B6B6B]">
                      Want to cancel?{" "}
                      <button
                        onClick={() => { setShowCancelModal(true); setCancelError("") }}
                        className="text-[#FF6B5C] hover:opacity-70 underline underline-offset-2 font-bold transition-opacity"
                      >
                        Cancel subscription
                      </button>
                    </p>
                    <p className="font-jetbrains text-[10px] text-[#B8B5AA]">You&apos;ll keep access until your billing period ends.</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Plan cards */}
      <div>
        <h3 className="font-kalam font-bold text-[#1A1A1A] text-lg mb-4">Choose a plan</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLANS.map((plan) => {
            const isCurrent   = plan.id === currentPlan
            const isDowngrade = PLANS.findIndex(p => p.id === plan.id) < PLANS.findIndex(p => p.id === currentPlan)
            const isPlanLoading = checkoutLoading === plan.id || previewLoading === plan.id

            return (
              <div
                key={plan.id}
                className={`relative rounded-[12px] p-5 flex flex-col border-2 transition-all ${
                  isCurrent
                    ? "bg-[#FFE45E] border-[#1A1A1A] shadow-brutal-lg"
                    : plan.popular
                    ? "bg-[#1A1A1A] border-[#1A1A1A] shadow-brutal-lg"
                    : "bg-[#F7F4EC] border-[#1A1A1A] shadow-brutal"
                }`}
              >
                {isCurrent && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#6FCF97] border-2 border-[#1A1A1A] font-jetbrains text-[10px] font-bold text-[#1A1A1A] px-3 py-0.5 rounded-full whitespace-nowrap">
                    ✓ Current
                  </div>
                )}
                {plan.popular && !isCurrent && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#FFE45E] border-2 border-[#1A1A1A] font-jetbrains text-[10px] font-bold text-[#1A1A1A] px-3 py-0.5 rounded-full whitespace-nowrap">
                    ★ Most Popular
                  </div>
                )}

                <div className="mb-4">
                  <div className={`font-jetbrains text-[11px] font-bold uppercase tracking-wider mb-1 ${plan.popular && !isCurrent ? "text-[#B8B5AA]" : "text-[#6B6B6B]"}`}>
                    {plan.name}
                  </div>
                  <div className="flex items-end gap-1 mb-1">
                    <span className={`font-kalam font-bold text-3xl leading-none ${plan.popular && !isCurrent ? "text-[#FFE45E]" : "text-[#1A1A1A]"}`}>
                      ${plan.price}
                    </span>
                    {plan.price > 0 && (
                      <span className={`text-xs mb-0.5 font-jetbrains ${plan.popular && !isCurrent ? "text-[#B8B5AA]" : "text-[#B8B5AA]"}`}>/mo</span>
                    )}
                  </div>
                  <div className={`font-jetbrains text-[11px] ${plan.popular && !isCurrent ? "text-[#6B6B6B]" : "text-[#6B6B6B]"}`}>
                    {plan.credits}
                  </div>
                </div>

                <ul className="space-y-2 flex-1 mb-5">
                  {plan.features.map((f) => (
                    <li key={f} className={`flex items-start gap-1.5 font-kalam text-[13px] ${plan.popular && !isCurrent ? "text-[#EFEBE0]" : "text-[#3A3A3A]"}`}>
                      <span className={`mt-0.5 flex-shrink-0 font-bold ${plan.popular && !isCurrent ? "text-[#6FCF97]" : "text-[#6FCF97]"}`}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <div className={`w-full text-center py-2.5 rounded-[8px] font-kalam font-bold text-sm border-2 border-[#1A1A1A] bg-[#1A1A1A] text-[#FFE45E]`}>
                    Current plan
                  </div>
                ) : isDowngrade ? (
                  <div className="w-full text-center py-2.5 rounded-[8px] font-kalam font-bold text-sm bg-[#EFEBE0] text-[#B8B5AA] border-2 border-[#B8B5AA] cursor-not-allowed">
                    Downgrade
                  </div>
                ) : plan.price === 0 ? null : (
                  <button
                    onClick={() => handleUpgradeClick(plan.id)}
                    disabled={isPlanLoading || !!checkoutLoading || !!previewLoading}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-[8px] font-kalam font-bold text-sm border-2 transition-all btn-press disabled:opacity-60 disabled:cursor-not-allowed ${
                      plan.popular
                        ? "bg-[#FFE45E] border-[#FFE45E] text-[#1A1A1A] shadow-[2px_2px_0px_0px_#FFE45E]"
                        : "bg-[#1A1A1A] border-[#1A1A1A] text-[#F7F4EC] shadow-brutal"
                    }`}
                  >
                    {isPlanLoading ? (
                      <>
                        <Loader2 size={12} className="animate-spin" />
                        Redirecting…
                      </>
                    ) : (
                      <>
                        {plan.cta}
                        <ExternalLink size={11} strokeWidth={2} />
                      </>
                    )}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <p className="font-kalam text-sm text-[#6B6B6B] text-center">
        Questions about billing?{" "}
        <Link href="/contact" className="text-[#1A1A1A] font-bold underline underline-offset-2 hover:opacity-70 transition-opacity">
          Contact support
        </Link>.
      </p>

      {/* Reactivate modal */}
      {confirmReactivate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A1A]/60 backdrop-blur-sm">
          <div className="bg-[#F7F4EC] border-2 border-[#1A1A1A] rounded-[14px] shadow-brutal-lg w-full max-w-md p-6 relative">
            <button onClick={() => setConfirmReactivate(null)} className="absolute top-4 right-4 text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors font-bold text-lg">✕</button>
            <div className="w-10 h-10 bg-[#FFE45E] border-2 border-[#1A1A1A] rounded-[8px] flex items-center justify-center mb-4 text-xl">⚡</div>
            <h3 className="font-kalam font-bold text-xl text-[#1A1A1A] mb-1">
              Reactivate & upgrade to {confirmReactivate.planId.charAt(0).toUpperCase() + confirmReactivate.planId.slice(1)}?
            </h3>
            <p className="font-kalam text-sm text-[#6B6B6B] mb-3 leading-relaxed">
              Your subscription is scheduled for cancellation. Upgrading will <strong className="text-[#1A1A1A]">reactivate it</strong> and switch you to the {confirmReactivate.planId.charAt(0).toUpperCase() + confirmReactivate.planId.slice(1)} plan immediately.
            </p>
            {confirmReactivate.amount !== null && confirmReactivate.currency !== null ? (
              <div className="bg-[#FFE45E] border-2 border-[#1A1A1A] rounded-[8px] px-4 py-3 mb-4 flex items-center justify-between">
                <span className="font-kalam font-bold text-sm text-[#1A1A1A]">Amount due now</span>
                <span className="font-kalam font-bold text-xl text-[#1A1A1A]">
                  {formatAmount(confirmReactivate.amount!, confirmReactivate.currency!)}
                </span>
              </div>
            ) : (
              <div className="bg-[#FFE45E] border-2 border-[#1A1A1A] rounded-[8px] px-4 py-3 mb-4">
                <p className="font-kalam text-sm text-[#3A3A3A]">⚠ A prorated charge for the remaining days will be applied immediately.</p>
              </div>
            )}
            <p className="font-jetbrains text-[10px] text-[#B8B5AA] mb-5">Your stored payment method will be charged immediately.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmReactivate(null)} className="flex-1 py-2.5 rounded-[8px] font-kalam font-bold text-sm bg-[#EFEBE0] border-2 border-[#1A1A1A] text-[#1A1A1A] btn-press">
                Keep cancelled
              </button>
              <button
                onClick={() => { const p = confirmReactivate.planId; setConfirmReactivate(null); handleUpgradeConfirm(p) }}
                className="flex-1 py-2.5 rounded-[8px] font-kalam font-bold text-sm bg-[#1A1A1A] border-2 border-[#1A1A1A] text-[#FFE45E] btn-press shadow-brutal flex items-center justify-center gap-2"
              >
                Confirm & pay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade confirm modal */}
      {confirmUpgrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A1A]/60 backdrop-blur-sm">
          <div className="bg-[#F7F4EC] border-2 border-[#1A1A1A] rounded-[14px] shadow-brutal-lg w-full max-w-md p-6 relative">
            <button onClick={() => setConfirmUpgrade(null)} className="absolute top-4 right-4 text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors font-bold text-lg">✕</button>
            <div className="w-10 h-10 bg-[#FFE45E] border-2 border-[#1A1A1A] rounded-[8px] flex items-center justify-center mb-4 text-xl">⚡</div>
            <h3 className="font-kalam font-bold text-xl text-[#1A1A1A] mb-1">
              Upgrade to {confirmUpgrade.planId.charAt(0).toUpperCase() + confirmUpgrade.planId.slice(1)}?
            </h3>
            <p className="font-kalam text-sm text-[#6B6B6B] mb-3 leading-relaxed">
              You&apos;ll be charged a prorated amount for the remaining days in your current billing period.
            </p>
            <div className="bg-[#FFE45E] border-2 border-[#1A1A1A] rounded-[8px] px-4 py-3 mb-6 flex items-center justify-between">
              <span className="font-kalam font-bold text-sm text-[#1A1A1A]">Amount due now</span>
              <span className="font-kalam font-bold text-xl text-[#1A1A1A]">
                {formatAmount(confirmUpgrade.amount, confirmUpgrade.currency)}
              </span>
            </div>
            <p className="font-jetbrains text-[10px] text-[#B8B5AA] mb-5">Your stored payment method will be charged immediately.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmUpgrade(null)} className="flex-1 py-2.5 rounded-[8px] font-kalam font-bold text-sm bg-[#EFEBE0] border-2 border-[#1A1A1A] text-[#1A1A1A] btn-press">
                Cancel
              </button>
              <button
                onClick={() => handleUpgradeConfirm(confirmUpgrade.planId)}
                className="flex-1 py-2.5 rounded-[8px] font-kalam font-bold text-sm bg-[#1A1A1A] border-2 border-[#1A1A1A] text-[#FFE45E] btn-press shadow-brutal flex items-center justify-center gap-2"
              >
                Confirm & pay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A1A]/60 backdrop-blur-sm">
          <div className="bg-[#F7F4EC] border-2 border-[#1A1A1A] rounded-[14px] shadow-brutal-lg w-full max-w-md p-6 relative">
            <button onClick={() => setShowCancelModal(false)} className="absolute top-4 right-4 text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors font-bold text-lg">✕</button>
            <div className="w-10 h-10 bg-[#FF6B5C]/20 border-2 border-[#FF6B5C] rounded-[8px] flex items-center justify-center mb-4 text-xl">😢</div>
            <h3 className="font-kalam font-bold text-xl text-[#1A1A1A] mb-1">Cancel subscription?</h3>
            <p className="font-kalam text-sm text-[#6B6B6B] mb-6 leading-relaxed">
              Your <strong className="text-[#1A1A1A]">{planLabel}</strong> plan will remain active until the end of your current billing period. After that, you&apos;ll be moved to the <strong className="text-[#1A1A1A]">Free plan</strong> with 50 lifetime credits.
            </p>
            {cancelError && (
              <div className="bg-[#FF6B5C]/10 border-2 border-[#FF6B5C] rounded-[8px] px-4 py-3 mb-4">
                <p className="font-kalam text-sm text-[#FF6B5C]">{cancelError}</p>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setShowCancelModal(false)} className="flex-1 py-2.5 rounded-[8px] font-kalam font-bold text-sm bg-[#EFEBE0] border-2 border-[#1A1A1A] text-[#1A1A1A] btn-press">
                Keep my plan
              </button>
              <button
                onClick={handleCancelConfirm}
                disabled={cancelLoading}
                className="flex-1 py-2.5 rounded-[8px] font-kalam font-bold text-sm bg-[#FF6B5C] border-2 border-[#1A1A1A] text-[#F7F4EC] btn-press shadow-brutal disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {cancelLoading ? <><Loader2 size={13} className="animate-spin" /> Cancelling…</> : "Yes, cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
