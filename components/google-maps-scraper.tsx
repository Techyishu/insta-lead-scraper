"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import {
  MagnifyingGlass,
  DownloadSimple,
  MapPin,
  Phone,
  Globe,
  Buildings,
  Star,
  Export,
} from "@phosphor-icons/react/dist/ssr"
import {
  Loader2,
  Zap,
  ArrowRight,
  Search,
  AlertCircle,
  Download,
} from "lucide-react"
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


function SkeletonRow() {
  return (
    <tr className="border-b border-neutral-100">
      {Array.from({ length: 6 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div
            className="h-3.5 bg-neutral-100 rounded animate-pulse"
            style={{ width: `${50 + (i % 3) * 20}%` }}
          />
        </td>
      ))}
    </tr>
  )
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

export default function GoogleMapsScraper() {
  const [country, setCountry]     = useState("United States")
  const [cityState, setCityState] = useState("")
  const [keyword, setKeyword]     = useState("")
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

  // Plan-based limits (mirrors server constants — UI only; server always re-enforces)
  const PLAN_MAX: Record<string, number> = { free: 50, starter: 1000, growth: 2000 }
  const FILTER_PLANS = ["starter", "growth"]
  const planMax    = PLAN_MAX[plan] ?? 50
  const canFilter  = FILTER_PLANS.includes(plan)

  // Max-results options visible to this plan
  const ALL_OPTIONS = [10, 25, 50, 100, 200, 500, 1000, 2000]
  const resultOptions = ALL_OPTIONS.filter((n) => n <= planMax)

  // Load credits + plan on mount
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
        // Clamp existing maxResults to the plan limit
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

    // Log export + send notification email (both non-blocking)
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
    } catch {
      // intentionally silent
    }

    // Send export-completed email (fire-and-forget)
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

  return (
    <div className="space-y-4">

      {/* ── Credits bar ────────────────────────────────────────────────────── */}
      {!creditsLoading && (
        <div className={`bg-white border rounded-xl px-4 py-3 flex items-center justify-between gap-4 ${
          outOfCredits ? "border-red-200 bg-red-50"
          : lowCredits  ? "border-amber-200 bg-amber-50"
          : "border-neutral-200"
        }`}>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Zap
              size={14}
              strokeWidth={2}
              className={outOfCredits ? "text-red-500" : lowCredits ? "text-amber-500" : "text-blue-600"}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-semibold ${
                  outOfCredits ? "text-red-700" : lowCredits ? "text-amber-700" : "text-neutral-700"
                }`}>
                  {credits.remaining} credits remaining
                </span>
                <span className="text-[11px] text-neutral-400">
                  ({credits.used} / {credits.limit} used)
                </span>
              </div>
              <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden w-36">
                <div
                  className={`h-full rounded-full transition-all ${
                    outOfCredits ? "bg-red-400" : lowCredits ? "bg-amber-400" : "bg-blue-600"
                  }`}
                  style={{ width: `${creditPct}%` }}
                />
              </div>
            </div>
          </div>
          {(outOfCredits || lowCredits) && (
            <Link
              href="/dashboard/billing"
              className="flex items-center gap-1 text-xs font-semibold bg-blue-700 hover:bg-blue-800 text-white px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors"
            >
              Upgrade <ArrowRight size={11} strokeWidth={2.5} />
            </Link>
          )}
        </div>
      )}

      {/* ── No-credits gate ─────────────────────────────────────────────────── */}
      {(noCredits || outOfCredits) && (
        <div className="bg-white border border-red-200 rounded-xl p-10 text-center">
          <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4">
            <Zap size={22} className="text-red-400" strokeWidth={2} />
          </div>
          <h3 className="text-base font-semibold text-neutral-900 mb-2">No credits remaining</h3>
          <p className="text-sm text-neutral-400 mb-5 max-w-xs mx-auto leading-relaxed">
            You've used all your credits. Upgrade your plan to continue finding leads.
          </p>
          <Link
            href="/dashboard/billing"
            className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors"
          >
            View upgrade plans
            <ArrowRight size={14} strokeWidth={2.5} />
          </Link>
        </div>
      )}

      {/* ── Search card ─────────────────────────────────────────────────────── */}
      <div className={`bg-white border border-neutral-200 rounded-xl p-6 shadow-sm ${outOfCredits ? "opacity-50 pointer-events-none select-none" : ""}`}>
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
            <Search size={16} className="text-blue-700" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-[0.9375rem] font-semibold text-neutral-900">Local Business Finder</h2>
            <p className="text-xs text-neutral-400">Search and export verified business leads</p>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Business keyword <span className="text-blue-600">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. dentists, Italian restaurants, gyms"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && canSearch && handleSearch()}
              className="w-full bg-white border border-neutral-200 rounded-lg px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
            />
            <p className="text-[11px] text-neutral-400">Try "Italian restaurants" not just "restaurants" for better results.</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Location <span className="text-blue-600">*</span>
            </label>
            <div className="flex gap-2">
              {/* Country dropdown */}
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-44 flex-shrink-0 bg-white border border-neutral-200 rounded-lg px-3 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {/* City / state text input */}
              <input
                type="text"
                placeholder="e.g. Mumbai, California"
                value={cityState}
                onChange={(e) => setCityState(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && canSearch && handleSearch()}
                className="flex-1 min-w-0 bg-white border border-neutral-200 rounded-lg px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-5 pb-5 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-neutral-500">Max results:</label>
            <select
              value={maxResults}
              onChange={(e) => setMaxResults(e.target.value)}
              className="bg-white border border-neutral-200 rounded-lg px-3 py-1.5 text-sm text-neutral-900 focus:outline-none focus:border-blue-500 transition-all"
            >
              {resultOptions.map((n) => (
                <option key={n} value={String(n)}>{n}</option>
              ))}
            </select>
            <span className="text-[11px] text-neutral-400">
              max {planMax.toLocaleString()} on {plan} plan
            </span>
          </div>

          {/* Phone + Website filters — paid plans only */}
          {canFilter ? (
            <>
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-neutral-500">Phone:</label>
                <select
                  value={phoneFilter}
                  onChange={(e) => setPhoneFilter(e.target.value)}
                  className="bg-white border border-neutral-200 rounded-lg px-3 py-1.5 text-sm text-neutral-900 focus:outline-none focus:border-blue-500 transition-all"
                >
                  <option value="any">Any</option>
                  <option value="with">With phone only</option>
                  <option value="without">Without phone only</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-neutral-500">Website:</label>
                <select
                  value={websiteFilter}
                  onChange={(e) => setWebsiteFilter(e.target.value)}
                  className="bg-white border border-neutral-200 rounded-lg px-3 py-1.5 text-sm text-neutral-900 focus:outline-none focus:border-blue-500 transition-all"
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
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border border-dashed border-neutral-200 text-neutral-400 bg-neutral-50 hover:border-blue-300 hover:text-blue-600 transition-all group"
            >
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none" className="flex-shrink-0">
                <rect x="1.5" y="5" width="8" height="6" rx="1" fill="currentColor" opacity=".4"/>
                <path d="M3 5V3.5a2.5 2.5 0 1 1 5 0V5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              Phone &amp; website filters
              <span className="text-[10px] font-semibold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Starter+</span>
            </Link>
          )}

        </div>

        {/* Submit */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSearch}
            disabled={!canSearch}
            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm"
          >
            {isLoading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Finding businesses…
              </>
            ) : (
              <>
                <MagnifyingGlass weight="bold" size={15} />
                Find Leads
              </>
            )}
          </button>

        </div>
      </div>

{/* ── Error ────────────────────────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 flex items-start gap-3 text-sm">
          <AlertCircle size={15} className="flex-shrink-0 mt-0.5 text-red-500" strokeWidth={2} />
          <span>{error}</span>
        </div>
      )}

      {/* ── Skeleton loader ──────────────────────────────────────────────────── */}
      {isLoading && (
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-neutral-100 flex items-center gap-2">
            <div className="h-3.5 w-32 bg-neutral-100 rounded animate-pulse" />
            <div className="h-3.5 w-24 bg-neutral-100 rounded animate-pulse ml-2" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50">
                  {["Business Name", "Phone", "Rating", "Website", "Address", "Maps"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left">
                      <div className="h-2.5 w-16 bg-neutral-200 rounded" />
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

      {/* ── Results table ────────────────────────────────────────────────────── */}
      {!isLoading && leads.length > 0 && (
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
          {/* Results header */}
          <div className="px-5 py-4 border-b border-neutral-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-sm font-semibold text-neutral-900">
                  {leads.length} business{leads.length !== 1 ? "es" : ""} found
                </span>
              </div>
              {selectedRows.size > 0 && (
                <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full font-medium">
                  {selectedRows.size} selected
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {selectedRows.size > 0 && (
                <button
                  onClick={() => exportRows(selectedLeads, "-selected")}
                  className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-semibold px-3.5 py-2 rounded-lg transition-all"
                >
                  <Export weight="bold" size={13} />
                  Export selected ({selectedRows.size})
                </button>
              )}
              <button
                onClick={() => exportRows(leads)}
                className="flex items-center gap-1.5 bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-700 text-xs font-semibold px-3.5 py-2 rounded-lg transition-all"
              >
                <Download size={13} strokeWidth={2.5} />
                Export all CSV
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50">
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedRows.size === leads.length && leads.length > 0}
                      onChange={toggleAll}
                      className="rounded accent-blue-700"
                    />
                  </th>
                  {["Business Name", "Category", "Phone", "Rating", "Website", "Maps"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[11px] font-semibold text-neutral-400 uppercase tracking-wider whitespace-nowrap"
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
                    className={`border-b border-neutral-50 transition-colors ${
                      selectedRows.has(i) ? "bg-blue-50" : "hover:bg-neutral-50"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(i)}
                        onChange={() => toggleRow(i)}
                        className="rounded accent-blue-700"
                      />
                    </td>

                    {/* Business name + address */}
                    <td className="px-4 py-3">
                      <div className="font-medium text-neutral-900 max-w-[200px] truncate text-[0.8125rem]">
                        {lead.title || "N/A"}
                      </div>
                      <div className="text-[11px] text-neutral-400 max-w-[200px] truncate mt-0.5">
                        {lead.address}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3">
                      {lead.category ? (
                        <span className="text-xs bg-neutral-100 border border-neutral-200 text-neutral-500 px-2 py-0.5 rounded-md truncate max-w-[110px] block">
                          {lead.category}
                        </span>
                      ) : (
                        <span className="text-neutral-300 text-xs">—</span>
                      )}
                    </td>

                    {/* Phone */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {lead.phone ? (
                        <div className="flex items-center gap-1.5 text-xs text-neutral-700">
                          <Phone weight="fill" size={11} className="text-neutral-400 flex-shrink-0" />
                          {lead.phone}
                        </div>
                      ) : (
                        <span className="text-neutral-300 text-xs">—</span>
                      )}
                    </td>

                    {/* Rating */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {lead.rating ? (
                        <div className="flex items-center gap-1">
                          <Star weight="fill" size={11} className="text-amber-400" />
                          <span className="text-xs font-semibold text-neutral-800">{lead.rating}</span>
                          {lead.reviewsCount && (
                            <span className="text-[11px] text-neutral-400">({lead.reviewsCount})</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-neutral-300 text-xs">—</span>
                      )}
                    </td>

                    {/* Website */}
                    <td className="px-4 py-3">
                      {lead.website ? (
                        <a
                          href={lead.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs font-medium transition-colors"
                        >
                          <Globe weight="fill" size={11} />
                          Visit
                        </a>
                      ) : (
                        <span className="text-neutral-300 text-xs">—</span>
                      )}
                    </td>

                    {/* Maps */}
                    <td className="px-4 py-3">
                      {lead.mapsUrl ? (
                        <a
                          href={lead.mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 text-xs font-medium transition-colors"
                        >
                          <MapPin weight="fill" size={11} />
                          Maps
                        </a>
                      ) : (
                        <span className="text-neutral-300 text-xs">—</span>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          <div className="px-5 py-3 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between">
            <span className="text-xs text-neutral-400">
              {leads.length} result{leads.length !== 1 ? "s" : ""}
              {selectedRows.size > 0 && ` · ${selectedRows.size} selected`}
            </span>
            <button
              onClick={() => exportRows(leads)}
              className="flex items-center gap-1.5 text-xs font-medium text-blue-700 hover:text-blue-800 transition-colors"
            >
              <DownloadSimple weight="bold" size={12} />
              Download CSV
            </button>
          </div>
        </div>
      )}

      {/* ── Empty state ──────────────────────────────────────────────────────── */}
      {!isLoading && leads.length === 0 && !error && keyword && (
        <div className="bg-white border border-neutral-200 rounded-xl p-14 text-center shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center mx-auto mb-3">
            <Buildings size={20} className="text-neutral-300" />
          </div>
          <p className="text-sm font-semibold text-neutral-700 mb-1">No results yet</p>
          <p className="text-xs text-neutral-400">Enter a keyword and location above, then click "Find Leads".</p>
        </div>
      )}
    </div>
  )
}
