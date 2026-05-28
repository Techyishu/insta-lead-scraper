"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface Stats {
  creditsRemaining:    number
  creditsLimit:        number
  b2bCreditsRemaining: number
  b2bCreditsLimit:     number
  totalLeadsExported:  number
  searchesThisMonth:   number
  plan:        string
  hasSearched: boolean
  hasExported: boolean
}

function greeting(name: string | null) {
  const hour = new Date().getHours()
  const time = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening"
  return name ? `Good ${time}, ${name.split(" ")[0]} 👋` : `Good ${time} 👋`
}


export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    creditsRemaining:    50,
    creditsLimit:        50,
    b2bCreditsRemaining: 10,
    b2bCreditsLimit:     10,
    totalLeadsExported:  0,
    searchesThisMonth:   0,
    plan:        "free",
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

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("credits_used, credits_limit, b2b_credits_used, b2b_credits_limit, plan, full_name")
        .eq("id", user.id)
        .single()

      const monthStart = new Date()
      monthStart.setDate(1)
      monthStart.setHours(0, 0, 0, 0)

      const { count: searchCount } = await supabase
        .from("searches")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", monthStart.toISOString())

      const { data: exportData } = await supabase
        .from("exports")
        .select("lead_count")
        .eq("user_id", user.id)

      const totalExported = (exportData ?? []).reduce((sum, e) => sum + (e.lead_count ?? 0), 0)

      const { count: totalSearchCount } = await supabase
        .from("searches")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)

      if (profile) {
        const used          = profile.credits_used     ?? 0
        const limit         = profile.credits_limit    ?? 50
        const b2bUsed       = profile.b2b_credits_used  ?? 0
        const b2bLimit      = profile.b2b_credits_limit ?? 10
        if (profile.full_name) setUserName(profile.full_name)
        setStats({
          creditsRemaining:    limit    - used,
          creditsLimit:        limit,
          b2bCreditsRemaining: b2bLimit - b2bUsed,
          b2bCreditsLimit:     b2bLimit,
          totalLeadsExported:  totalExported,
          searchesThisMonth:   searchCount ?? 0,
          plan:        profile.plan ?? "free",
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
    ? Math.min(((stats.creditsLimit - stats.creditsRemaining) / stats.creditsLimit) * 100, 100)
    : 0
  const lowCredits = stats.creditsRemaining <= Math.ceil(stats.creditsLimit * 0.15)
  const approxSearches = Math.floor(stats.creditsRemaining / 5)

  const gettingStarted = [
    { label: "Create your account", done: true },
    { label: "Run your first search", done: stats.hasSearched, href: "/dashboard/new-search" },
    { label: "Export your first CSV", done: stats.hasExported },
    { label: "Upgrade to a paid plan", done: stats.plan !== "free", href: "/dashboard/billing" },
  ]

  const doneCount = gettingStarted.filter((g) => g.done).length

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-kalam font-bold text-2xl text-[#1A1A1A] mb-1">
            {loading ? "Good morning 👋" : greeting(userName)}
          </h2>
          <p className="font-jetbrains text-[11px] text-[#6B6B6B]">
            <span className="sm:hidden">{stats.creditsRemaining} credits · ~{approxSearches} searches</span>
            <span className="hidden sm:inline">{stats.creditsRemaining} free credits ready to spend · ~{approxSearches} searches</span>
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
          <div className="font-jetbrains text-[11px] font-bold text-[#1A1A1A] bg-[#EFEBE0] border-2 border-[#1A1A1A] px-3 py-1.5 rounded-[8px] flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#6FCF97]" />
            {planLabel} Plan
          </div>
        </div>
      </div>

      {/* Low credits warning */}
      {!loading && lowCredits && stats.creditsRemaining > 0 && (
        <div className="bg-[#FFE45E] border-2 border-[#1A1A1A] rounded-[10px] shadow-brutal px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="font-kalam font-bold text-sm text-[#1A1A1A]">
            ⚡ Only <strong>{stats.creditsRemaining} credits</strong> left — upgrade to keep searching.
          </p>
          <Link
            href="/dashboard/billing"
            className="font-kalam font-bold text-[13px] text-[#F7F4EC] bg-[#1A1A1A] border-2 border-[#1A1A1A] rounded-[8px] px-3 py-2 btn-press whitespace-nowrap self-start sm:self-auto"
          >
            Upgrade →
          </Link>
        </div>
      )}

      {/* No credits */}
      {!loading && stats.creditsRemaining === 0 && (
        <div className="bg-[#FF6B5C] border-2 border-[#1A1A1A] rounded-[10px] shadow-brutal px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="font-kalam font-bold text-sm text-[#F7F4EC]">
            No credits remaining — upgrade to continue finding leads.
          </p>
          <Link
            href="/dashboard/billing"
            className="font-kalam font-bold text-[13px] text-[#1A1A1A] bg-[#FFE45E] border-2 border-[#1A1A1A] rounded-[8px] px-3 py-2 btn-press whitespace-nowrap self-start sm:self-auto"
          >
            Upgrade now →
          </Link>
        </div>
      )}

      {/* New search CTA */}
      <div className="bg-[#EFEBE0] border-2 border-[#1A1A1A] rounded-[14px] shadow-brutal-lg px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-2 right-4 font-kalam text-[#B8B5AA] text-4xl select-none pointer-events-none">✦</div>
        <div>
          <h3 className="font-kalam font-bold text-lg text-[#1A1A1A] mb-0.5">Ready to find leads?</h3>
          <p className="font-jetbrains text-[11px] text-[#6B6B6B]">Up to 200 verified businesses per search · export CSV instantly.</p>
        </div>
        <Link
          href="/dashboard/new-search"
          className="font-kalam font-bold text-[#F7F4EC] bg-[#1A1A1A] border-2 border-[#1A1A1A] rounded-[10px] px-5 py-3 text-sm btn-press shadow-brutal whitespace-nowrap self-start sm:self-auto sm:flex-shrink-0"
        >
          New search →
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Local Credits */}
        <div className="bg-[#F7F4EC] border-2 border-[#1A1A1A] rounded-[12px] shadow-brutal p-4">
          <div className="font-jetbrains text-[10px] text-[#6B6B6B] uppercase tracking-wider mb-2">Local credits</div>
          <div className="font-kalam font-bold text-3xl text-[#1A1A1A] mb-1">
            {loading ? "—" : stats.creditsRemaining}
          </div>
          <div className="font-jetbrains text-[10px] text-[#B8B5AA] mb-2">of {stats.creditsLimit}</div>
          <div className="h-1.5 bg-[#EFEBE0] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${lowCredits ? "bg-[#FF6B5C]" : "bg-[#1A1A1A]"}`}
              style={{ width: `${100 - creditPct}%` }}
            />
          </div>
        </div>

        {/* B2B Credits */}
        <div className="bg-[#F7F4EC] border-2 border-[#1A1A1A] rounded-[12px] shadow-brutal p-4">
          <div className="font-jetbrains text-[10px] text-[#6B6B6B] uppercase tracking-wider mb-2">B2B credits</div>
          <div className="font-kalam font-bold text-3xl text-[#1A1A1A] mb-1">
            {loading ? "—" : stats.b2bCreditsRemaining}
          </div>
          <div className="font-jetbrains text-[10px] text-[#B8B5AA] mb-2">of {stats.b2bCreditsLimit}</div>
          <div className="h-1.5 bg-[#EFEBE0] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all bg-[#0A66C2]"
              style={{ width: `${stats.b2bCreditsLimit > 0 ? Math.min(((stats.b2bCreditsLimit - stats.b2bCreditsRemaining) / stats.b2bCreditsLimit) * 100, 100) : 0}%` }}
            />
          </div>
        </div>

        {/* Leads exported */}
        <div className="bg-[#F7F4EC] border-2 border-[#1A1A1A] rounded-[12px] shadow-brutal p-4">
          <div className="font-jetbrains text-[10px] text-[#6B6B6B] uppercase tracking-wider mb-2">Leads exported</div>
          <div className="font-kalam font-bold text-3xl text-[#1A1A1A] mb-1">
            {loading ? "—" : stats.totalLeadsExported.toLocaleString()}
          </div>
          <div className="font-jetbrains text-[10px] text-[#B8B5AA]">lifetime total</div>
        </div>

        {/* Searches */}
        <div className="bg-[#F7F4EC] border-2 border-[#1A1A1A] rounded-[12px] shadow-brutal p-4">
          <div className="font-jetbrains text-[10px] text-[#6B6B6B] uppercase tracking-wider mb-2">Searches</div>
          <div className="font-kalam font-bold text-3xl text-[#1A1A1A] mb-1">
            {loading ? "—" : stats.searchesThisMonth}
          </div>
          <div className="font-jetbrains text-[10px] text-[#B8B5AA]">this month</div>
        </div>

        {/* Plan */}
        <div className="bg-[#FFE45E] border-2 border-[#1A1A1A] rounded-[12px] shadow-brutal p-4">
          <div className="font-jetbrains text-[10px] text-[#3A3A3A] uppercase tracking-wider mb-2">Active plan</div>
          <div className="font-kalam font-bold text-3xl text-[#1A1A1A] mb-1">
            {loading ? "—" : planLabel}
          </div>
          <div className="font-jetbrains text-[10px] text-[#3A3A3A]">
            {stats.plan === "free" ? "50 credits lifetime" : `${stats.creditsLimit.toLocaleString()}/mo`}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Getting started */}
        <div className="bg-[#F7F4EC] border-2 border-[#1A1A1A] rounded-[12px] shadow-brutal p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-kalam font-bold text-[#1A1A1A] text-base">Getting started</h3>
            <span className="font-jetbrains text-[11px] text-[#6B6B6B] bg-[#EFEBE0] border border-[#1A1A1A] rounded-[6px] px-2 py-0.5">
              {doneCount} / {gettingStarted.length}
            </span>
          </div>
          <div className="space-y-2">
            {gettingStarted.map((item, i) => (
              <div key={i} className={`flex items-center gap-3 py-2 px-3 rounded-[8px] border-2 ${item.done ? "border-[#6FCF97] bg-[#6FCF97]/10" : "border-[#EFEBE0] bg-[#EFEBE0]"}`}>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${
                    item.done
                      ? "bg-[#6FCF97] border-[#1A1A1A] text-[#1A1A1A]"
                      : "bg-[#F7F4EC] border-[#B8B5AA] text-[#B8B5AA]"
                  }`}
                >
                  {item.done ? "✓" : i + 1}
                </div>
                {item.href && !item.done ? (
                  <Link
                    href={item.href}
                    className="font-kalam text-sm text-[#1A1A1A] hover:underline underline-offset-2 flex-1"
                  >
                    {item.label} →
                  </Link>
                ) : (
                  <span className={`font-kalam text-sm flex-1 ${item.done ? "text-[#6B6B6B] line-through" : "text-[#3A3A3A]"}`}>
                    {item.label}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Upgrade CTA or recent searches */}
        {stats.plan === "free" ? (
          <div className="bg-[#1A1A1A] border-2 border-[#1A1A1A] rounded-[12px] shadow-brutal p-5 flex flex-col">
            <div className="font-kalam font-bold text-[#FFE45E] text-xl mb-2">Upgrade to Starter</div>
            <p className="font-jetbrains text-[11px] text-[#B8B5AA] mb-4 leading-relaxed">
              5,000 credits/month for $49. Export unlimited leads, priority support, and never run out mid-campaign.
            </p>
            <div className="space-y-2 mb-5">
              {["5,000 leads/month", "Faster export speed", "Priority support", "Cancel anytime"].map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <span className="text-[#6FCF97] text-sm">✓</span>
                  <span className="font-kalam text-[13px] text-[#EFEBE0]">{f}</span>
                </div>
              ))}
            </div>
            <Link
              href="/dashboard/billing"
              className="mt-auto font-kalam font-bold text-[#1A1A1A] bg-[#FFE45E] border-2 border-[#FFE45E] rounded-[10px] px-5 py-3 text-sm text-center btn-press shadow-[2px_2px_0px_0px_#FFE45E] hover:shadow-[1px_1px_0px_0px_#FFE45E]"
            >
              View Plans →
            </Link>
          </div>
        ) : (
          <div className="bg-[#F7F4EC] border-2 border-[#1A1A1A] rounded-[12px] shadow-brutal p-5">
            <h3 className="font-kalam font-bold text-[#1A1A1A] text-base mb-3">Recent activity</h3>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-10 h-10 bg-[#EFEBE0] border-2 border-[#1A1A1A] rounded-[10px] flex items-center justify-center mb-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B8B5AA" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="6"/><path d="M16 16 L21 21"/></svg>
              </div>
              <p className="font-kalam font-bold text-[#3A3A3A] text-sm mb-1">
                {stats.hasSearched ? "Your searches live in History" : "No searches yet"}
              </p>
              <p className="font-jetbrains text-[11px] text-[#B8B5AA] mb-4">
                {stats.hasSearched ? "View and export all your past results." : "Start a search to generate leads."}
              </p>
              <Link
                href={stats.hasSearched ? "/dashboard/search-history" : "/dashboard/new-search"}
                className="font-kalam font-bold text-[#F7F4EC] bg-[#1A1A1A] border-2 border-[#1A1A1A] rounded-[10px] px-5 py-2.5 text-sm btn-press shadow-brutal inline-flex items-center gap-1.5"
              >
                {stats.hasSearched ? "View History →" : "New Search →"}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
