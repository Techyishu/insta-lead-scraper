"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Loader2, ExternalLink } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface SocialMedia {
  facebook?: string | null
  instagram?: string | null
  linkedin?: string | null
  twitter?: string | null
  youtube?: string | null
  tiktok?: string | null
}

interface Lead {
  title: string
  address: string
  phone?: string | null
  website?: string | null
  rating?: number | null
  reviewsCount?: number | null
  category?: string | null
  mapsUrl?: string | null
  emails?: string[] | null
  socialMedia?: SocialMedia | null
}

interface Credits {
  used: number
  limit: number
  remaining: number
}

// ── Country list ──────────────────────────────────────────────────────────────
const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Argentina","Armenia","Australia",
  "Austria","Azerbaijan","Bahrain","Bangladesh","Belarus","Belgium","Belize","Benin",
  "Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso",
  "Cambodia","Cameroon","Canada","Chile","China","Colombia","Costa Rica","Croatia","Cuba",
  "Cyprus","Czech Republic","Denmark","Dominican Republic","Ecuador","Egypt","El Salvador",
  "Estonia","Ethiopia","Finland","France","Georgia","Germany","Ghana","Greece","Guatemala",
  "Honduras","Hong Kong","Hungary","India","Indonesia","Iran","Iraq","Ireland","Israel",
  "Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kuwait","Kyrgyzstan","Latvia",
  "Lebanon","Libya","Lithuania","Luxembourg","Malaysia","Maldives","Mali","Malta","Mexico",
  "Moldova","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nepal",
  "Netherlands","New Zealand","Nicaragua","Nigeria","Norway","Oman","Pakistan","Palestine",
  "Panama","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia",
  "Rwanda","Saudi Arabia","Senegal","Serbia","Singapore","Slovakia","Slovenia","Somalia",
  "South Africa","South Korea","Spain","Sri Lanka","Sudan","Sweden","Switzerland","Syria",
  "Taiwan","Tajikistan","Tanzania","Thailand","Tunisia","Turkey","Turkmenistan","Uganda",
  "Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan",
  "Venezuela","Vietnam","Yemen","Zambia","Zimbabwe",
]

function SkeletonRow() {
  return (
    <tr className="border-b border-[#EFEBE0]">
      {Array.from({ length: 6 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div
            className="h-3.5 bg-[#EFEBE0] rounded animate-pulse"
            style={{ width: `${50 + (i % 3) * 20}%` }}
          />
        </td>
      ))}
    </tr>
  )
}

export default function GoogleMapsScraper() {
  const searchParams = useSearchParams()
  const [country, setCountry]     = useState(() => searchParams.get("country") ?? "United States")
  const [cityState, setCityState] = useState(() => searchParams.get("location") ?? "")
  const [keyword, setKeyword]     = useState(() => searchParams.get("keyword") ?? "")
  const [maxResults, setMaxResults] = useState("50")
  const [phoneFilter, setPhoneFilter] = useState("any")
  const [websiteFilter, setWebsiteFilter] = useState("any")
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [noCredits, setNoCredits] = useState(false)
  const [searchId, setSearchId] = useState<string | null>(null)
  const [credits, setCredits] = useState<Credits>({ used: 0, limit: 50, remaining: 50 })
  const [creditsLoading, setCreditsLoading] = useState(true)
  const [plan, setPlan] = useState<string>("free")

  const PLAN_MAX: Record<string, number> = { free: 50, starter: 1000, growth: 2000 }
  const FILTER_PLANS = ["starter", "growth"]
  const planMax    = PLAN_MAX[plan] ?? 50
  const canFilter  = FILTER_PLANS.includes(plan)

  const ALL_OPTIONS = [10, 25, 50, 100, 200, 500, 1000, 2000]
  const resultOptions = ALL_OPTIONS.filter((n) => n <= planMax)

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("credits_used, credits_limit, plan")
        .eq("id", user.id)
        .single()
      if (profile) {
        const used  = profile.credits_used  ?? 0
        const limit = profile.credits_limit ?? 50
        const p     = profile.plan ?? "free"
        setCredits({ used, limit, remaining: limit - used })
        setPlan(p)
        const pMax = PLAN_MAX[p] ?? 50
        setMaxResults((prev) => String(Math.min(parseInt(prev, 10) || 50, pMax)))
      }
      setCreditsLoading(false)
    }
    loadProfile()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSearch = async () => {
    if (!keyword.trim() || !country) {
      setError("Please enter a keyword and select a country.")
      return
    }
    if (credits.remaining <= 0) {
      setNoCredits(true)
      return
    }
    setIsLoading(true)
    setError("")
    setNoCredits(false)
    setLeads([])
    setSelectedRows(new Set())
    setSearchId(null)

    try {
      const location = cityState.trim()
        ? `${cityState.trim()}, ${country}`
        : country

      const response = await fetch("/api/google-maps-scraper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location,
          keyword: keyword.trim(),
          maxResults: parseInt(maxResults),
          phoneFilter,
          websiteFilter,
        }),
      })

      const data = await response.json()

      if (response.status === 402 || data.noCredits) {
        setNoCredits(true)
        setCredits({ used: data.creditsUsed ?? credits.used, limit: data.creditsLimit ?? credits.limit, remaining: 0 })
        return
      }
      if (response.status === 401 || data.unauthorized) {
        setError("Your session expired. Please sign in again.")
        return
      }
      if (!response.ok || data.error) {
        throw new Error(data.error || `HTTP error: ${response.status}`)
      }

      setLeads(data.leads || [])
      setSearchId(data.searchId ?? null)

      if (data.creditsUsed !== undefined) {
        setCredits({
          used: data.creditsUsed,
          limit: data.creditsLimit,
          remaining: data.creditsRemaining,
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const buildCSV = (rows: Lead[]) => {
    const headers = ["Business Name", "Address", "Phone", "Website", "Rating", "Reviews", "Category", "Google Maps"]
    const csvRows = rows.map((l) => [
      `"${(l.title || '').replace(/"/g, '""')}"`,
      `"${(l.address || '').replace(/"/g, '""')}"`,
      `"${l.phone || ''}"`,
      `"${l.website || ''}"`,
      l.rating ?? "",
      l.reviewsCount ?? "",
      `"${(l.category || '').replace(/"/g, '""')}"`,
      `"${l.mapsUrl || ''}"`,
    ].join(","))
    return [headers.join(","), ...csvRows].join("\n")
  }

  const exportRows = async (rows: Lead[], suffix = "") => {
    if (rows.length === 0) return
    const locationSlug = (cityState.trim() ? `${cityState.trim()}, ${country}` : country)
      .replace(/[^a-zA-Z0-9]/g, "-")
    const filename = `leadmapper-${keyword.replace(/\s+/g, "-")}-${locationSlug}${suffix}.csv`
    const blob = new Blob([buildCSV(rows)], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from("exports").insert({
          user_id: user.id,
          search_id: searchId ?? undefined,
          filename,
          lead_count: rows.length,
        })
      }
    } catch { /* intentionally silent */ }

    fetch("/api/notifications/send-export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        keyword,
        location: cityState.trim() ? `${cityState.trim()}, ${country}` : country,
        count: rows.length,
      }),
    }).catch(() => {/* intentionally silent */})
  }

  const toggleRow = (i: number) => {
    const s = new Set(selectedRows)
    s.has(i) ? s.delete(i) : s.add(i)
    setSelectedRows(s)
  }

  const toggleAll = () => {
    if (selectedRows.size === leads.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(leads.map((_, i) => i)))
    }
  }

  const selectedLeads = leads.filter((_, i) => selectedRows.has(i))
  const canSearch = !isLoading && country && keyword.trim() && credits.remaining > 0
  const creditPct = credits.limit > 0 ? Math.min((credits.used / credits.limit) * 100, 100) : 0
  const lowCredits = credits.remaining <= Math.ceil(credits.limit * 0.15) && credits.remaining > 0
  const outOfCredits = credits.remaining === 0
  const estCost = parseInt(maxResults, 10)

  return (
    <div className="space-y-4">

      {/* Credits bar */}
      {!creditsLoading && (
        <div className={`border-2 border-[#1A1A1A] rounded-[10px] shadow-brutal px-4 py-3 flex items-center justify-between gap-4 ${
          outOfCredits ? "bg-[#FF6B5C]/10"
          : lowCredits  ? "bg-[#FFE45E]"
          : "bg-[#EFEBE0]"
        }`}>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="text-[#1A1A1A]">⚡</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-kalam font-bold text-sm text-[#1A1A1A]">
                  {credits.remaining} credits remaining
                </span>
                <span className="font-jetbrains text-[10px] text-[#6B6B6B]">
                  ({credits.used} / {credits.limit} used)
                </span>
              </div>
              <div className="h-1.5 bg-[#1A1A1A]/20 rounded-full overflow-hidden w-32">
                <div
                  className="h-full bg-[#1A1A1A] rounded-full transition-all"
                  style={{ width: `${100 - creditPct}%` }}
                />
              </div>
            </div>
          </div>
          {(outOfCredits || lowCredits) && (
            <Link
              href="/dashboard/billing"
              className="font-kalam font-bold text-[13px] text-[#F7F4EC] bg-[#1A1A1A] border-2 border-[#1A1A1A] rounded-[8px] px-3 py-1.5 btn-press whitespace-nowrap"
            >
              Upgrade →
            </Link>
          )}
        </div>
      )}

      {/* No-credits gate */}
      {(noCredits || outOfCredits) && (
        <div className="bg-[#F7F4EC] border-2 border-[#FF6B5C] rounded-[12px] shadow-brutal p-10 text-center">
          <div className="w-12 h-12 bg-[#FF6B5C]/10 border-2 border-[#FF6B5C] rounded-[10px] flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚡</span>
          </div>
          <h3 className="font-kalam font-bold text-[#1A1A1A] text-lg mb-2">No credits remaining</h3>
          <p className="font-jetbrains text-[11px] text-[#6B6B6B] mb-5 max-w-xs mx-auto leading-relaxed">
            You&apos;ve used all your credits. Upgrade your plan to continue finding leads.
          </p>
          <Link
            href="/dashboard/billing"
            className="inline-flex items-center gap-2 font-kalam font-bold text-[#F7F4EC] bg-[#1A1A1A] border-2 border-[#1A1A1A] rounded-[10px] px-6 py-3 text-sm btn-press shadow-brutal"
          >
            View upgrade plans →
          </Link>
        </div>
      )}

      {/* Search form */}
      <div className={`bg-[#F7F4EC] border-2 border-[#1A1A1A] rounded-[14px] shadow-brutal-lg p-6 ${outOfCredits ? "opacity-50 pointer-events-none select-none" : ""}`}>

        {/* Form fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          {/* Keyword */}
          <div className="space-y-2">
            <label className="font-jetbrains text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wider">
              KEYWORD <span className="text-[#FF6B5C]">*</span>
            </label>
            <div className="flex items-center gap-2 bg-[#F7F4EC] border-2 border-[#1A1A1A] rounded-[10px] px-4 py-3 focus-within:border-[#1A1A1A] focus-within:shadow-brutal transition-all">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B6B6B" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="6"/><path d="M16 16 L21 21"/>
              </svg>
              <input
                type="text"
                placeholder="dentists"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && canSearch && handleSearch()}
                className="font-kalam text-sm text-[#1A1A1A] placeholder:text-[#B8B5AA] bg-transparent outline-none flex-1"
              />
            </div>
            <p className="font-jetbrains text-[10px] text-[#B8B5AA]">
              Try &quot;Italian restaurants&quot; not just &quot;restaurants&quot; for better results.
            </p>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="font-jetbrains text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wider">
              LOCATION <span className="text-[#FF6B5C]">*</span>
            </label>
            <div className="flex gap-2">
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-40 flex-shrink-0 font-kalam text-sm text-[#1A1A1A] bg-[#F7F4EC] border-2 border-[#1A1A1A] rounded-[10px] px-3 py-3 outline-none focus:shadow-brutal transition-all"
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <div className="flex items-center gap-2 flex-1 bg-[#F7F4EC] border-2 border-[#1A1A1A] rounded-[10px] px-4 py-3 focus-within:shadow-brutal transition-all">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6B6B6B" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="8"/><path d="M2 12 L22 12"/>
                  <path d="M12 2 Q17 7 17 12 Q17 17 12 22"/><path d="M12 2 Q7 7 7 12 Q7 17 12 22"/>
                </svg>
                <input
                  type="text"
                  placeholder="e.g. Mumbai, California"
                  value={cityState}
                  onChange={(e) => setCityState(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && canSearch && handleSearch()}
                  className="font-kalam text-sm text-[#1A1A1A] placeholder:text-[#B8B5AA] bg-transparent outline-none flex-1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap items-center gap-3 pb-5 border-b-2 border-[#EFEBE0] mb-5">
          {/* Max results */}
          <div className="flex items-center gap-2">
            <label className="font-jetbrains text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider">
              MAX RESULTS
            </label>
            <select
              value={maxResults}
              onChange={(e) => setMaxResults(e.target.value)}
              className="font-jetbrains text-[12px] text-[#1A1A1A] bg-[#EFEBE0] border-2 border-[#1A1A1A] rounded-[8px] px-3 py-1.5 outline-none"
            >
              {resultOptions.map((n) => (
                <option key={n} value={String(n)}>{n}</option>
              ))}
            </select>
            <span className="font-jetbrains text-[10px] text-[#B8B5AA]">
              max {planMax.toLocaleString()} on {plan} plan
            </span>
          </div>

          {/* Phone/website filters */}
          {canFilter ? (
            <>
              <div className="flex items-center gap-2">
                <label className="font-jetbrains text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider">PHONE</label>
                <select
                  value={phoneFilter}
                  onChange={(e) => setPhoneFilter(e.target.value)}
                  className="font-jetbrains text-[12px] text-[#1A1A1A] bg-[#EFEBE0] border-2 border-[#1A1A1A] rounded-[8px] px-3 py-1.5 outline-none"
                >
                  <option value="any">Any</option>
                  <option value="with">With phone only</option>
                  <option value="without">Without phone only</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="font-jetbrains text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider">WEBSITE</label>
                <select
                  value={websiteFilter}
                  onChange={(e) => setWebsiteFilter(e.target.value)}
                  className="font-jetbrains text-[12px] text-[#1A1A1A] bg-[#EFEBE0] border-2 border-[#1A1A1A] rounded-[8px] px-3 py-1.5 outline-none"
                >
                  <option value="any">Any</option>
                  <option value="with">With website only</option>
                  <option value="without">Without website only</option>
                </select>
              </div>
            </>
          ) : (
            <Link
              href="/dashboard/billing"
              className="font-kalam font-bold text-[12px] text-[#6B6B6B] border-2 border-dashed border-[#B8B5AA] rounded-[8px] px-3 py-1.5 hover:border-[#1A1A1A] hover:text-[#1A1A1A] transition-all flex items-center gap-2"
            >
              🔒 Phone &amp; website filters
              <span className="font-jetbrains text-[10px] font-bold bg-[#FFE45E] text-[#1A1A1A] border border-[#1A1A1A] rounded-[4px] px-1.5 py-0.5">Starter+</span>
            </Link>
          )}
        </div>

        {/* Estimated cost */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="font-jetbrains text-[11px] text-[#6B6B6B]">
              Est. cost:{" "}
              <span className="font-bold text-[#1A1A1A]">{estCost} credits</span>
              {credits.remaining < estCost && credits.remaining > 0 && (
                <span className="text-[#FF6B5C] ml-2">
                  (only {credits.remaining} available)
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleSearch}
            disabled={!canSearch}
            className="font-kalam font-bold text-[#F7F4EC] bg-[#1A1A1A] border-2 border-[#1A1A1A] rounded-[10px] px-7 py-3 text-sm inline-flex items-center gap-2 btn-press shadow-brutal disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-brutal"
          >
            {isLoading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Finding businesses…
              </>
            ) : (
              "Search leads →"
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-[#FF6B5C]/10 border-2 border-[#FF6B5C] rounded-[10px] px-4 py-3 flex items-start gap-3 font-kalam text-sm text-[#FF6B5C]">
          <span className="flex-shrink-0 mt-0.5">⚠</span>
          {error}
        </div>
      )}

      {/* Skeleton */}
      {isLoading && (
        <div className="bg-[#F7F4EC] border-2 border-[#1A1A1A] rounded-[12px] overflow-hidden shadow-brutal">
          <div className="px-5 py-4 border-b-2 border-[#1A1A1A] bg-[#EFEBE0] flex items-center gap-3">
            <Loader2 size={14} className="animate-spin text-[#6B6B6B]" />
            <span className="font-kalam text-sm text-[#6B6B6B]">Searching businesses…</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-[#EFEBE0] bg-[#EFEBE0]">
                  {["Business Name", "Phone", "Rating", "Website", "Category", "Maps"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left">
                      <div className="h-2.5 w-16 bg-[#1A1A1A]/10 rounded animate-pulse" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonRow key={i} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Results */}
      {!isLoading && leads.length > 0 && (
        <div className="bg-[#F7F4EC] border-2 border-[#1A1A1A] rounded-[12px] overflow-hidden shadow-brutal">
          {/* Results header */}
          <div className="px-5 py-4 border-b-2 border-[#1A1A1A] bg-[#EFEBE0] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#6FCF97]" />
                <span className="font-kalam font-bold text-sm text-[#1A1A1A]">
                  {leads.length} business{leads.length !== 1 ? "es" : ""} found
                </span>
              </div>
              {selectedRows.size > 0 && (
                <span className="font-jetbrains text-[11px] font-bold bg-[#FFE45E] text-[#1A1A1A] border-2 border-[#1A1A1A] px-2.5 py-0.5 rounded-[6px]">
                  {selectedRows.size} selected
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {selectedRows.size > 0 && (
                <button
                  onClick={() => exportRows(selectedLeads, "-selected")}
                  className="font-kalam font-bold text-[12px] text-[#1A1A1A] bg-[#EFEBE0] border-2 border-[#1A1A1A] rounded-[8px] px-3 py-1.5 btn-press shadow-brutal flex items-center gap-1.5"
                >
                  ↓ Export selected ({selectedRows.size})
                </button>
              )}
              <button
                onClick={() => exportRows(leads)}
                className="font-kalam font-bold text-[12px] text-[#F7F4EC] bg-[#1A1A1A] border-2 border-[#1A1A1A] rounded-[8px] px-3 py-1.5 btn-press shadow-brutal flex items-center gap-1.5"
              >
                ↓ Export all CSV
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-[#EFEBE0] bg-[#F7F4EC]">
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedRows.size === leads.length && leads.length > 0}
                      onChange={toggleAll}
                      className="rounded border-2 border-[#1A1A1A] accent-[#1A1A1A]"
                    />
                  </th>
                  {["Business Name", "Category", "Phone", "Rating", "Website", "Maps"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left font-jetbrains text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.map((lead, i) => (
                  <tr
                    key={i}
                    className={`border-b border-[#EFEBE0] transition-colors cursor-pointer ${
                      selectedRows.has(i) ? "bg-[#FFE45E]/20" : "hover:bg-[#EFEBE0]"
                    }`}
                    onClick={() => toggleRow(i)}
                  >
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedRows.has(i)}
                        onChange={() => toggleRow(i)}
                        className="rounded border-2 border-[#1A1A1A] accent-[#1A1A1A]"
                      />
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-kalam font-bold text-[#1A1A1A] max-w-[180px] truncate text-[0.8125rem]">
                        {lead.title || "N/A"}
                      </div>
                      <div className="font-jetbrains text-[10px] text-[#B8B5AA] max-w-[180px] truncate mt-0.5">
                        {lead.address}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      {lead.category ? (
                        <span className="font-jetbrains text-[10px] bg-[#EFEBE0] border border-[#1A1A1A] text-[#3A3A3A] px-2 py-0.5 rounded-[6px] truncate max-w-[110px] block">
                          {lead.category}
                        </span>
                      ) : (
                        <span className="text-[#B8B5AA] text-xs">—</span>
                      )}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      {lead.phone ? (
                        <span className="font-jetbrains text-[11px] text-[#3A3A3A]">{lead.phone}</span>
                      ) : (
                        <span className="text-[#B8B5AA] text-xs">—</span>
                      )}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      {lead.rating ? (
                        <div className="flex items-center gap-1">
                          <span className="text-[#FFE45E]">★</span>
                          <span className="font-kalam font-bold text-[#1A1A1A] text-xs">{lead.rating}</span>
                          {lead.reviewsCount && (
                            <span className="font-jetbrains text-[10px] text-[#B8B5AA]">({lead.reviewsCount})</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[#B8B5AA] text-xs">—</span>
                      )}
                    </td>

                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      {lead.website ? (
                        <a
                          href={lead.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-kalam font-bold text-[12px] text-[#1A1A1A] bg-[#EFEBE0] border border-[#1A1A1A] rounded-[6px] px-2 py-0.5 hover:bg-[#FFE45E] transition-colors inline-flex items-center gap-1"
                        >
                          Visit <ExternalLink size={10} />
                        </a>
                      ) : (
                        <span className="text-[#B8B5AA] text-xs">—</span>
                      )}
                    </td>

                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      {lead.mapsUrl ? (
                        <a
                          href={lead.mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-kalam font-bold text-[12px] text-[#1A1A1A] bg-[#6FCF97]/20 border border-[#1A1A1A] rounded-[6px] px-2 py-0.5 hover:bg-[#6FCF97]/40 transition-colors inline-flex items-center gap-1"
                        >
                          Maps <ExternalLink size={10} />
                        </a>
                      ) : (
                        <span className="text-[#B8B5AA] text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          <div className="px-5 py-3 bg-[#EFEBE0] border-t-2 border-[#1A1A1A] flex items-center justify-between">
            <span className="font-jetbrains text-[11px] text-[#6B6B6B]">
              {leads.length} result{leads.length !== 1 ? "s" : ""}
              {selectedRows.size > 0 && ` · ${selectedRows.size} selected`}
            </span>
            <button
              onClick={() => exportRows(leads)}
              className="font-kalam font-bold text-[12px] text-[#1A1A1A] hover:opacity-70 transition-opacity flex items-center gap-1.5"
            >
              ↓ Download CSV
            </button>
          </div>
        </div>
      )}

      {/* Empty state (after search with no results) */}
      {!isLoading && leads.length === 0 && !error && keyword && (
        <div className="bg-[#F7F4EC] border-2 border-[#1A1A1A] rounded-[12px] shadow-brutal p-14 text-center">
          <div className="w-11 h-11 bg-[#EFEBE0] border-2 border-[#1A1A1A] rounded-[10px] flex items-center justify-center mx-auto mb-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B8B5AA" strokeWidth="2" strokeLinecap="round">
              <rect x="2" y="7" width="20" height="14" rx="2"/>
              <path d="M16 21 L16 5 Q16 3 14 3 L10 3 Q8 3 8 5 L8 21"/>
            </svg>
          </div>
          <p className="font-kalam font-bold text-[#3A3A3A] text-sm mb-1">No results yet</p>
          <p className="font-jetbrains text-[11px] text-[#B8B5AA]">Enter a keyword and location above, then click &quot;Search leads&quot;.</p>
        </div>
      )}
    </div>
  )
}
