"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import {
  Zap, Check, AlertTriangle, Loader2,
  CheckCircle2, ExternalLink, XCircle, X,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

// ── Plan definitions ──────────────────────────────────────────────────────────

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: { monthly: 0, annual: 0 },
    credits: "50 total credits",
    features: ["50 credits total (lifetime)", "Phone & website filter", "CSV export", "Basic search"],
    cta: "Current plan",
  },
  {
    id: "starter",
    name: "Starter",
    price: { monthly: 49, annual: 39 },
    credits: "5,000 credits/month",
    features: ["5,000 credits/month", "Phone & website filter", "CSV export", "Email support"],
    cta: "Upgrade to Starter",
  },
  {
    id: "growth",
    name: "Growth",
    price: { monthly: 89, annual: 71 },
    credits: "10,000 credits/month",
    popular: true,
    features: [
      "10,000 credits/month",
      "Contact enrichment (emails + socials)",
      "Bulk processing",
      "Priority support",
      "Unlimited saved searches",
    ],
    cta: "Upgrade to Growth",
  },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BillingPage() {
  const searchParams  = useSearchParams()
  const router        = useRouter()
  const paymentStatus = searchParams.get("payment")   // "success"
  const paymentPlan   = searchParams.get("plan")

  const [annual, setAnnual]               = useState(false)
  const [currentPlan, setCurrentPlan]     = useState("free")
  const [creditsUsed, setCreditsUsed]     = useState(0)
  const [creditsLimit, setCreditsLimit]   = useState(50)
  const [loading, setLoading]               = useState(true)
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const [checkoutError, setCheckoutError] = useState("")
  const [polling, setPolling]             = useState(false)

  // Upgrade success (for changePlan path — no redirect)
  const [upgradeSuccess, setUpgradeSuccess] = useState("")   // plan name if upgraded

  // Upgrade confirm modal (existing subscription — shows prorated charge)
  const [confirmUpgrade, setConfirmUpgrade] = useState<{
    planId: string
    amount: number
    currency: string
  } | null>(null)
  const [previewLoading, setPreviewLoading] = useState<string | null>(null)

  // Reactivate + upgrade modal (subscription was pending cancellation)
  const [confirmReactivate, setConfirmReactivate] = useState<{
    planId: string
    amount: number | null
    currency: string | null
  } | null>(null)

  // Cancel flow
  const [showCancelModal, setShowCancelModal]             = useState(false)
  const [cancelLoading, setCancelLoading]                 = useState(false)
  const [cancelError, setCancelError]                     = useState("")
  const [cancelledSuccessfully, setCancelledSuccessfully] = useState(false)

  // ── Profile fetcher ─────────────────────────────────────────────────────────

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

  // ── Initial load ────────────────────────────────────────────────────────────

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

  // ── Payment success polling ─────────────────────────────────────────────────

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

  // ── Checkout ────────────────────────────────────────────────────────────────

  // Step 1: clicked "Upgrade" — preview charge if they have an existing subscription
  const handleUpgradeClick = async (planId: string) => {
    setCheckoutError("")
    setPreviewLoading(planId)
    try {
      const res  = await fetch(`/api/payments/preview-upgrade?plan=${planId}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to preview upgrade")

      if (data.needsCheckout) {
        // Free plan user — go straight to DodoPayments checkout (no existing subscription)
        await handleUpgradeConfirm(planId)
      } else if (data.needsReactivate) {
        // Subscription is pending cancellation — confirm reactivation before upgrading.
        // amount/currency may be present (preview succeeded after temp-uncancel).
        setConfirmReactivate({
          planId,
          amount:   data.amount   ?? null,
          currency: data.currency ?? null,
        })
        setPreviewLoading(null)
      } else {
        // Has existing active subscription — show confirmation modal with prorated charge
        setConfirmUpgrade({ planId, amount: data.amount, currency: data.currency })
        setPreviewLoading(null)
      }
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : "Something went wrong.")
      setPreviewLoading(null)
    }
  }

  // Step 2: confirmed in modal (or no modal needed) — execute the upgrade
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
        // changePlan + Supabase already updated server-side — refresh state directly
        const updated = await fetchProfile()
        if (updated) {
          setCurrentPlan(updated.plan ?? planId)
          setCreditsUsed(updated.credits_used ?? 0)
          setCreditsLimit(updated.credits_limit ?? 50)
          setCancelAtPeriodEnd(updated.cancel_at_period_end ?? false)
        }
        setCancelledSuccessfully(false)   // clear any pending-cancel banner
        setUpgradeSuccess(planId)
        setCheckoutLoading(null)
      } else if (data.url) {
        // New subscription — redirect to DodoPayments checkout page
        window.location.href = data.url
      } else {
        throw new Error("Unexpected response from checkout")
      }
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : "Something went wrong.")
      setCheckoutLoading(null)
    }
  }

  // ── Cancel subscription ─────────────────────────────────────────────────────

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

  // ── Derived values ──────────────────────────────────────────────────────────

  const creditsRemaining = creditsLimit - creditsUsed
  const creditPct   = creditsLimit > 0 ? Math.min((creditsUsed / creditsLimit) * 100, 100) : 0
  const lowCredits  = creditsRemaining <= Math.ceil(creditsLimit * 0.15)
  const planLabel   = currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)
  const isPaidPlan  = currentPlan !== "free"

  const formatAmount = (amount: number, currency: string) => {
    // amounts in smallest unit (paise/cents → rupees/dollars)
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

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl text-neutral-900 mb-1">Billing & Plans</h1>
        <p className="text-neutral-400 text-sm">Manage your subscription and upgrade to get more credits.</p>
      </div>

      {/* Payment success banner */}
      {paymentStatus === "success" && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4 flex items-start gap-3">
          {polling
            ? <Loader2 size={18} className="text-emerald-600 mt-0.5 flex-shrink-0 animate-spin" />
            : <CheckCircle2 size={18} className="text-emerald-600 mt-0.5 flex-shrink-0" strokeWidth={2} />
          }
          <div>
            <p className="text-sm font-semibold text-emerald-800">Payment successful!</p>
            <p className="text-xs text-emerald-700 mt-0.5">
              {polling
                ? "Activating your plan… this usually takes a few seconds."
                : `Your ${(paymentPlan ?? currentPlan).charAt(0).toUpperCase() + (paymentPlan ?? currentPlan).slice(1)} plan is now active. Start searching now.`
              }
            </p>
          </div>
        </div>
      )}

      {/* Upgrade success banner (changePlan path) */}
      {upgradeSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4 flex items-start gap-3">
          <CheckCircle2 size={18} className="text-emerald-600 mt-0.5 flex-shrink-0" strokeWidth={2} />
          <div>
            <p className="text-sm font-semibold text-emerald-800">Plan upgraded!</p>
            <p className="text-xs text-emerald-700 mt-0.5">
              You&apos;re now on the <strong>{upgradeSuccess.charAt(0).toUpperCase() + upgradeSuccess.slice(1)}</strong> plan. Your credits have been refreshed.
            </p>
          </div>
        </div>
      )}

      {/* Cancellation success banner */}
      {cancelledSuccessfully && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex items-start gap-3">
          <CheckCircle2 size={18} className="text-amber-600 mt-0.5 flex-shrink-0" strokeWidth={2} />
          <div>
            <p className="text-sm font-semibold text-amber-800">Subscription cancelled</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Your plan stays active until the end of your billing period. After that, you'll move to the Free plan.
            </p>
          </div>
        </div>
      )}

      {/* Checkout error */}
      {checkoutError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 flex items-start gap-3">
          <AlertTriangle size={16} className="text-red-500 mt-0.5 flex-shrink-0" strokeWidth={2} />
          <p className="text-sm text-red-700">{checkoutError}</p>
        </div>
      )}

      {/* Current plan overview */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">Current Plan</div>
            <div className="flex items-center gap-3">
              {loading ? (
                <div className="h-8 w-20 bg-neutral-100 rounded animate-pulse" />
              ) : (
                <>
                  <span className="font-display font-bold text-2xl text-neutral-900">{planLabel}</span>
                  <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
                    Active
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-neutral-400 mb-0.5">Credits remaining</div>
            {loading ? (
              <div className="h-9 w-24 bg-neutral-100 rounded animate-pulse ml-auto" />
            ) : (
              <div className={`font-display font-bold text-3xl ${lowCredits ? "text-amber-500" : "text-neutral-900"}`}>
                {creditsRemaining} / {creditsLimit}
              </div>
            )}
          </div>
        </div>

        {!loading && (
          <>
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-neutral-400 mb-1.5">
                <span>Credit usage</span>
                <span>{Math.round(creditPct)}% used</span>
              </div>
              <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${lowCredits ? "bg-amber-400" : "bg-blue-600"}`}
                  style={{ width: `${creditPct}%` }}
                />
              </div>
            </div>

            {creditsRemaining === 0 ? (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-start gap-3">
                <AlertTriangle size={14} className="text-red-500 mt-0.5 flex-shrink-0" strokeWidth={2} />
                <p className="text-xs text-red-700">You've used all your credits. Upgrade now to continue finding leads.</p>
              </div>
            ) : lowCredits ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-start gap-3">
                <Zap size={14} className="text-amber-500 mt-0.5 flex-shrink-0" strokeWidth={2} />
                <p className="text-xs text-amber-700">
                  Running low — <strong>{creditsRemaining} credits left</strong>. Upgrade to keep prospecting.
                </p>
              </div>
            ) : (
              <div className="bg-neutral-50 border border-neutral-100 rounded-lg px-4 py-3">
                <p className="text-xs text-neutral-500">
                  {currentPlan === "free"
                    ? "Free plan includes 50 lifetime credits. Upgrade for monthly credit allowances."
                    : `Your ${planLabel} plan renews monthly with ${creditsLimit.toLocaleString()} credits.`}
                </p>
              </div>
            )}

            {/* Cancel subscription / pending cancellation */}
            {isPaidPlan && (
              <div className="mt-4 pt-4 border-t border-neutral-100">
                {cancelAtPeriodEnd || cancelledSuccessfully ? (
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                    <p className="text-xs text-amber-700">
                      <span className="font-semibold">Cancellation scheduled.</span>{" "}
                      Your plan stays active until the end of your billing period, then moves to Free.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <p className="text-xs text-neutral-400">
                      Want to cancel?{" "}
                      <button
                        onClick={() => { setShowCancelModal(true); setCancelError("") }}
                        className="text-red-500 hover:text-red-600 underline underline-offset-2 transition-colors font-medium"
                      >
                        Cancel subscription
                      </button>
                    </p>
                    <p className="text-xs text-neutral-400">You'll keep access until your billing period ends.</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Billing toggle */}
      <div className="flex items-center gap-4">
        <h2 className="text-sm font-semibold text-neutral-900">Choose a plan</h2>
        <div className="flex items-center gap-1 bg-neutral-100 rounded-lg p-1">
          <button
            onClick={() => setAnnual(false)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              !annual ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
              annual ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            Annual
            <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.5 rounded font-bold">−20%</span>
          </button>
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        {PLANS.map((plan) => {
          const isCurrent   = plan.id === currentPlan
          const isDowngrade = PLANS.findIndex(p => p.id === plan.id) < PLANS.findIndex(p => p.id === currentPlan)
          const isLoading   = checkoutLoading === plan.id || previewLoading === plan.id

          return (
            <div
              key={plan.id}
              className={`relative rounded-xl p-5 flex flex-col border transition-all ${
                isCurrent
                  ? "bg-white border-emerald-300 ring-1 ring-emerald-200"
                  : plan.popular
                  ? "bg-white border-blue-700 ring-1 ring-blue-700 shadow-lg shadow-blue-100/60"
                  : "bg-white border-neutral-200 hover:border-neutral-300"
              }`}
            >
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-semibold px-3 py-0.5 rounded-full whitespace-nowrap">
                  Current
                </div>
              )}
              {plan.popular && !isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-700 text-white text-[10px] font-semibold px-3 py-0.5 rounded-full whitespace-nowrap">
                  Most Popular
                </div>
              )}

              <div className="mb-4">
                <div className="text-xs font-medium text-neutral-500 mb-1">{plan.name}</div>
                <div className="flex items-end gap-1 mb-1">
                  <span className="font-display font-bold text-2xl text-neutral-900 leading-none">
                    ${annual ? plan.price.annual : plan.price.monthly}
                  </span>
                  {plan.price.monthly > 0 && (
                    <span className="text-neutral-400 text-xs mb-0.5">/mo</span>
                  )}
                </div>
                <div className="text-[11px] text-neutral-400">{plan.credits}</div>
              </div>

              <ul className="space-y-2 flex-1 mb-5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-1.5 text-xs text-neutral-600">
                    <Check
                      size={12}
                      strokeWidth={2.5}
                      className={`mt-0.5 flex-shrink-0 ${plan.popular ? "text-blue-700" : "text-emerald-500"}`}
                    />
                    {f}
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <div className="w-full text-center py-2.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Current plan
                </div>
              ) : isDowngrade ? (
                <div className="w-full text-center py-2.5 rounded-lg text-xs font-semibold bg-neutral-50 text-neutral-300 border border-neutral-100 cursor-not-allowed">
                  Downgrade
                </div>
              ) : plan.price.monthly === 0 ? null : (
                <button
                  onClick={() => handleUpgradeClick(plan.id)}
                  disabled={isLoading || !!checkoutLoading || !!previewLoading}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                    plan.popular
                      ? "bg-blue-700 hover:bg-blue-800 text-white"
                      : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                  }`}
                >
                  {isLoading ? (
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

      <p className="text-xs text-neutral-400 text-center">
        Questions about billing?{" "}
        <Link href="/contact" className="text-blue-700 hover:text-blue-800 transition-colors">Contact support</Link>.
      </p>

      {/* ── Reactivate + upgrade modal (subscription was pending cancellation) ── */}
      {confirmReactivate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setConfirmReactivate(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <X size={16} strokeWidth={2} />
            </button>

            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center mb-4">
              <Zap size={20} className="text-amber-500" strokeWidth={2} />
            </div>

            <h3 className="font-display font-bold text-lg text-neutral-900 mb-1">
              Reactivate & upgrade to {confirmReactivate.planId.charAt(0).toUpperCase() + confirmReactivate.planId.slice(1)}?
            </h3>
            <p className="text-sm text-neutral-500 mb-3 leading-relaxed">
              Your subscription is currently scheduled for cancellation. Upgrading will{" "}
              <strong>reactivate your subscription</strong> and switch you to the{" "}
              <strong>{confirmReactivate.planId.charAt(0).toUpperCase() + confirmReactivate.planId.slice(1)}</strong> plan immediately.
            </p>

            {/* Show exact prorated charge if we have it */}
            {confirmReactivate.amount !== null && confirmReactivate.currency !== null ? (
              <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-4 flex items-center justify-between">
                <span className="text-sm text-amber-700 font-medium">Amount due now</span>
                <span className="font-display font-bold text-xl text-amber-600">
                  {(() => {
                    const divisor = ["jpy", "krw"].includes(confirmReactivate.currency!.toLowerCase()) ? 1 : 100
                    try {
                      return new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: confirmReactivate.currency!.toUpperCase(),
                        minimumFractionDigits: 0,
                      }).format(confirmReactivate.amount! / divisor)
                    } catch {
                      return `${confirmReactivate.currency!.toUpperCase()} ${(confirmReactivate.amount! / 100).toFixed(2)}`
                    }
                  })()}
                </span>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-4 flex items-start gap-2">
                <AlertTriangle size={14} className="text-amber-500 mt-0.5 flex-shrink-0" strokeWidth={2} />
                <p className="text-xs text-amber-700 leading-relaxed">
                  A prorated charge for the remaining days in your billing period will be applied immediately.
                </p>
              </div>
            )}

            <p className="text-xs text-neutral-400 mb-5">
              Your stored payment method will be charged immediately. Future billing will be at the full{" "}
              {confirmReactivate.planId.charAt(0).toUpperCase() + confirmReactivate.planId.slice(1)} plan price.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmReactivate(null)}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors"
              >
                Keep cancelled
              </button>
              <button
                onClick={() => { const p = confirmReactivate.planId; setConfirmReactivate(null); handleUpgradeConfirm(p) }}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-white transition-colors flex items-center justify-center gap-2"
              >
                Confirm & pay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Upgrade confirmation modal ───────────────────────────────────────── */}
      {confirmUpgrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setConfirmUpgrade(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <X size={16} strokeWidth={2} />
            </button>

            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-4">
              <Zap size={20} className="text-blue-600" strokeWidth={2} />
            </div>

            <h3 className="font-display font-bold text-lg text-neutral-900 mb-1">
              Upgrade to {confirmUpgrade.planId.charAt(0).toUpperCase() + confirmUpgrade.planId.slice(1)}?
            </h3>
            <p className="text-sm text-neutral-500 mb-3 leading-relaxed">
              You&apos;ll be charged a prorated amount for the remaining days in your current billing period.
            </p>

            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-6 flex items-center justify-between">
              <span className="text-sm text-blue-700 font-medium">Amount due now</span>
              <span className="font-display font-bold text-xl text-blue-700">
                {(() => {
                  const divisor = ["jpy","krw"].includes(confirmUpgrade.currency.toLowerCase()) ? 1 : 100
                  try {
                    return new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: confirmUpgrade.currency.toUpperCase(),
                      minimumFractionDigits: 0,
                    }).format(confirmUpgrade.amount / divisor)
                  } catch {
                    return `${confirmUpgrade.currency.toUpperCase()} ${(confirmUpgrade.amount / 100).toFixed(2)}`
                  }
                })()}
              </span>
            </div>

            <p className="text-xs text-neutral-400 mb-5">
              Your stored payment method will be charged immediately. Future billing will be at the full{" "}
              {confirmUpgrade.planId.charAt(0).toUpperCase() + confirmUpgrade.planId.slice(1)} plan price.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmUpgrade(null)}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpgradeConfirm(confirmUpgrade.planId)}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-blue-700 hover:bg-blue-800 text-white transition-colors flex items-center justify-center gap-2"
              >
                Confirm & pay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Cancel confirmation modal ─────────────────────────────────────────── */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowCancelModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <X size={16} strokeWidth={2} />
            </button>

            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <XCircle size={20} className="text-red-500" strokeWidth={2} />
            </div>

            <h3 className="font-display font-bold text-lg text-neutral-900 mb-1">Cancel subscription?</h3>
            <p className="text-sm text-neutral-500 mb-6 leading-relaxed">
              Your <strong>{planLabel}</strong> plan will remain active until the end of your current billing period.
              After that, you'll be moved to the <strong>Free plan</strong> with 50 lifetime credits.
            </p>

            {cancelError && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4 flex items-start gap-2">
                <AlertTriangle size={13} className="text-red-500 mt-0.5 flex-shrink-0" strokeWidth={2} />
                <p className="text-xs text-red-700">{cancelError}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors"
              >
                Keep my plan
              </button>
              <button
                onClick={handleCancelConfirm}
                disabled={cancelLoading}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {cancelLoading
                  ? <><Loader2 size={13} className="animate-spin" /> Cancelling…</>
                  : "Yes, cancel"
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
