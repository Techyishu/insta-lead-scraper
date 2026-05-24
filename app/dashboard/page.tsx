"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import {
  Search,
  Download,
  Zap,
  CreditCard,
  Plus,
  ChevronRight,
  Check,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Profile {
  full_name: string | null
  credits_used: number
  credits_limit: number
  plan: string
}

interface Stats {
  creditsRemaining: number
  creditsLimit: number
  totalLeadsExported: number
  searchesThisMonth: number
  plan: string
  hasSearched: boolean
  hasExported: boolean
}

const quickActions = [
  {
    label: "New Search",
    desc: "Search businesses by keyword + location",
    href: "/dashboard/new-search",
    icon: Search,
    primary: true,
  },
  {
    label: "Upgrade Plan",
    desc: "Get more credits and faster exports",
    href: "/dashboard/billing",
    icon: Zap,
    primary: false,
  },
]

function greeting(name: string | null) {
  const hour = new Date().getHours()
  const time = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening"
  return name ? `Good ${time}, ${name.split(" ")[0]}` : `Good ${time}`
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    creditsRemaining: 50,
    creditsLimit: 50,
    totalLeadsExported: 0,
    searchesThisMonth: 0,
    plan: "free",
    hasSearched: false,
    hasExported: false,
  })
  const [userName, setUserName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const name = user.user_metadata?.full_name as string | null
      setUserName(name)

      // Fetch profile
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("credits_used, credits_limit, plan, full_name")
        .eq("id", user.id)
        .single()

      // Searches this month
      const monthStart = new Date()
      monthStart.setDate(1)
      monthStart.setHours(0, 0, 0, 0)

      const { count: searchCount } = await supabase
        .from("searches")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", monthStart.toISOString())

      // Lifetime exports: sum of lead_count
      const { data: exportData } = await supabase
        .from("exports")
        .select("lead_count")
        .eq("user_id", user.id)

      const totalExported = (exportData ?? []).reduce((sum, e) => sum + (e.lead_count ?? 0), 0)

      // Has ever searched?
      const { count: totalSearchCount } = await supabase
        .from("searches")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)

      if (profile) {
        const used = profile.credits_used ?? 0
        const limit = profile.credits_limit ?? 50

        if (profile.full_name) setUserName(profile.full_name)

        setStats({
          creditsRemaining: limit - used,
          creditsLimit: limit,
          totalLeadsExported: totalExported,
          searchesThisMonth: searchCount ?? 0,
          plan: profile.plan ?? "free",
          hasSearched: (totalSearchCount ?? 0) > 0,
          hasExported: totalExported > 0,
        })
      }
      setLoading(false)
    }
    load()
  }, [])

  const planLabel = stats.plan.charAt(0).toUpperCase() + stats.plan.slice(1)
  const creditPct = stats.creditsLimit > 0
    ? Math.min((( stats.creditsLimit - stats.creditsRemaining) / stats.creditsLimit) * 100, 100)
    : 0
  const lowCredits = stats.creditsRemaining <= Math.ceil(stats.creditsLimit * 0.15)

  const statCards = [
    {
      label: "Credits Remaining",
      value: loading ? "—" : String(stats.creditsRemaining),
      sub: `of ${stats.creditsLimit} ${stats.plan === "free" ? "lifetime" : "monthly"} credits`,
      icon: Zap,
      accent: lowCredits ? "text-amber-500" : "text-blue-600",
      progress: creditPct,
      progressColor: lowCredits ? "bg-amber-400" : "bg-blue-600",
    },
    {
      label: "Total Leads Exported",
      value: loading ? "—" : String(stats.totalLeadsExported),
      sub: "Lifetime exports",
      icon: Download,
      accent: "text-emerald-600",
    },
    {
      label: "Searches This Month",
      value: loading ? "—" : String(stats.searchesThisMonth),
      sub: "Current billing cycle",
      icon: Search,
      accent: "text-violet-600",
    },
    {
      label: "Active Plan",
      value: loading ? "—" : planLabel,
      sub: stats.plan === "free" ? "50 credits lifetime" : `${stats.creditsLimit.toLocaleString()} credits/month`,
      icon: CreditCard,
      accent: "text-amber-500",
    },
  ]

  const gettingStarted = [
    { label: "Create your account", done: true },
    { label: "Run your first search", done: stats.hasSearched, href: "/dashboard/new-search" },
    { label: "Export your first CSV", done: stats.hasExported },
    { label: "Upgrade to a paid plan", done: stats.plan !== "free", href: "/dashboard/billing" },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl text-neutral-900 mb-1">
          {loading ? "Welcome back" : greeting(userName)}
        </h1>
        <p className="text-neutral-400 text-sm">
          {stats.plan === "free"
            ? `You're on the Free plan — ${stats.creditsRemaining} credits remaining.`
            : `${planLabel} plan — ${stats.creditsRemaining} credits left this month.`}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-neutral-200 rounded-xl overflow-hidden border border-neutral-200">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white p-5">
            <div className={`text-xs font-medium mb-3 flex items-center gap-1.5 ${s.accent}`}>
              <s.icon size={13} strokeWidth={2} />
              {s.label}
            </div>
            <div className="font-display font-bold text-2xl text-neutral-900 mb-0.5">{s.value}</div>
            <div className="text-xs text-neutral-400">{s.sub}</div>
            {s.progress !== undefined && (
              <div className="mt-3 h-1 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${s.progressColor}`}
                  style={{ width: `${s.progress}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Low credits warning */}
      {!loading && lowCredits && stats.creditsRemaining > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-amber-700">
            <Zap size={14} strokeWidth={2} className="flex-shrink-0" />
            <span>Only <strong>{stats.creditsRemaining} credits</strong> left. Upgrade to keep searching without interruption.</span>
          </div>
          <Link
            href="/dashboard/billing"
            className="flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-900 whitespace-nowrap"
          >
            Upgrade <ChevronRight size={12} strokeWidth={2.5} />
          </Link>
        </div>
      )}

      {/* No credits banner */}
      {!loading && stats.creditsRemaining === 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-red-700">
            <Zap size={14} strokeWidth={2} className="flex-shrink-0" />
            <span><strong>No credits remaining.</strong> Upgrade your plan to continue finding leads.</span>
          </div>
          <Link
            href="/dashboard/billing"
            className="flex items-center gap-1 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg whitespace-nowrap"
          >
            Upgrade now <ChevronRight size={12} strokeWidth={2.5} />
          </Link>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-5">
        {/* Left: quick actions + recent searches */}
        <div className="md:col-span-2 space-y-5">
          <div>
            <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-3">Quick Actions</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {quickActions.map((a) => (
                <Link
                  key={a.label}
                  href={a.href}
                  className={`flex items-start gap-3 p-4 rounded-xl border transition-all group ${
                    a.primary
                      ? "bg-blue-700 border-blue-700 hover:bg-blue-800 hover:border-blue-800"
                      : "bg-white border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                      a.primary ? "bg-white/20" : "bg-neutral-100 group-hover:bg-neutral-200"
                    }`}
                  >
                    <a.icon size={15} strokeWidth={2} className={a.primary ? "text-white" : "text-neutral-500"} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-semibold mb-0.5 ${a.primary ? "text-white" : "text-neutral-900"}`}>
                      {a.label}
                    </div>
                    <div className={`text-xs ${a.primary ? "text-blue-200" : "text-neutral-400"}`}>{a.desc}</div>
                  </div>
                  <ChevronRight
                    size={14}
                    strokeWidth={2}
                    className={`mt-0.5 flex-shrink-0 ${a.primary ? "text-blue-300" : "text-neutral-300"}`}
                  />
                </Link>
              ))}
            </div>
          </div>

          {/* Recent searches empty state */}
          <div>
            <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-3">Recent Searches</h2>
            <div className="bg-white border border-neutral-200 rounded-xl p-10 text-center">
              <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center mx-auto mb-3">
                <Search size={18} className="text-neutral-300" strokeWidth={2} />
              </div>
              {stats.hasSearched ? (
                <>
                  <p className="text-sm font-medium text-neutral-700 mb-1">You've run searches!</p>
                  <p className="text-xs text-neutral-400 mb-4">Search history will appear here in a future update.</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-neutral-700 mb-1">No searches yet</p>
                  <p className="text-xs text-neutral-400 mb-4">Run your first search to start generating leads.</p>
                </>
              )}
              <Link
                href="/dashboard/new-search"
                className="inline-flex items-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                <Plus size={12} strokeWidth={2.5} />
                New Search
              </Link>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Getting started */}
          <div>
            <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-3">Getting Started</h2>
            <div className="bg-white border border-neutral-200 rounded-xl p-4 space-y-1">
              {gettingStarted.map((item, i) => (
                <div key={i} className="flex items-center gap-3 py-2">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                      item.done ? "bg-emerald-100" : "bg-neutral-100 border border-neutral-200"
                    }`}
                  >
                    {item.done ? (
                      <Check size={11} strokeWidth={2.5} className="text-emerald-600" />
                    ) : (
                      <span className="text-[9px] font-bold text-neutral-400">{i + 1}</span>
                    )}
                  </div>
                  {item.href && !item.done ? (
                    <Link
                      href={item.href}
                      className="text-xs flex-1 text-neutral-600 hover:text-neutral-900"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span className={`text-xs flex-1 ${item.done ? "text-neutral-300 line-through" : "text-neutral-500"}`}>
                      {item.label}
                    </span>
                  )}
                  {!item.done && item.href && (
                    <ChevronRight size={12} strokeWidth={2} className="text-neutral-300" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Upgrade CTA (only on free plan) */}
          {stats.plan === "free" && (
            <div className="bg-white border border-neutral-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-neutral-900 mb-1.5">Upgrade to Starter</p>
              <p className="text-xs text-neutral-400 mb-3 leading-relaxed">
                5,000 credits/month for $49. Ideal for active prospecting teams.
              </p>
              <Link
                href="/dashboard/billing"
                className="w-full flex items-center justify-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold py-2.5 px-3 rounded-lg transition-colors"
              >
                View Plans
                <ChevronRight size={12} strokeWidth={2.5} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
