"use client"

import React, { useState, useEffect, useRef, KeyboardEvent } from "react"
import Link from "next/link"
import { Loader2, ExternalLink, Linkedin } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface B2BLead {
  fullName:        string
  firstName:       string | null
  lastName:        string | null
  jobTitle:        string | null
  headline:        string | null
  seniority:       string | null
  email:           string | null
  personalEmail:   string | null
  phone:           string | null
  linkedin:        string | null
  city:            string | null
  state:           string | null
  country:         string | null
  companyName:     string | null
  companyDomain:   string | null
  companyWebsite:  string | null
  companyLinkedin: string | null
  companySize:     string | null
  industry:        string | null
  companyRevenue:  string | null
}

interface Credits { used: number; limit: number; remaining: number }

const PLAN_MAX: Record<string, number> = { free: 10, starter: 300, growth: 1000, scale: 3000 }

// Only countries supported by the boneswill~leads-generator actor
const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "India",
  "China",
]

const SENIORITY_OPTIONS = ["Owner", "Founder", "C-Suite", "Partner", "VP", "Head", "Director", "Manager", "Senior", "Entry", "Intern"]

// ── Tag input ─────────────────────────────────────────────────────────────────
function TagInput({
  tags, onChange, placeholder,
}: { tags: string[]; onChange: (t: string[]) => void; placeholder: string }) {
  const [input, setInput] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const add = () => {
    const val = input.trim().replace(/,+$/, "")
    if (val && !tags.includes(val)) onChange([...tags, val])
    setInput("")
  }

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add() }
    if (e.key === "Backspace" && !input && tags.length) onChange(tags.slice(0, -1))
  }

  return (
    <div
      className="flex flex-wrap gap-1.5 items-center bg-[#F7F4EC] border-2 border-[#1A1A1A] rounded-[10px] px-3 py-2.5 focus-within:shadow-brutal transition-all cursor-text min-h-[46px]"
      onClick={() => inputRef.current?.focus()}
    >
      {tags.map((t) => (
        <span key={t} className="flex items-center gap-1 bg-[#1A1A1A] text-[#FFE45E] font-jetbrains text-[11px] font-bold rounded-[6px] px-2 py-0.5">
          {t}
          <button type="button" onClick={(e) => { e.stopPropagation(); onChange(tags.filter((x) => x !== t)) }} className="hover:opacity-60 leading-none">×</button>
        </span>
      ))}
      <input
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKey}
        onBlur={add}
        placeholder={tags.length === 0 ? placeholder : ""}
        className="font-kalam text-sm text-[#1A1A1A] placeholder:text-[#B8B5AA] bg-transparent outline-none flex-1 min-w-[120px]"
      />
    </div>
  )
}

// ── Multi-select pill group ───────────────────────────────────────────────────
function PillSelect({
  options, selected, onChange,
}: { options: string[]; selected: string[]; onChange: (v: string[]) => void }) {
  const toggle = (v: string) =>
    onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v])

  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => toggle(o)}
          className={`font-jetbrains text-[11px] font-bold border-2 rounded-[6px] px-2.5 py-1 transition-all ${
            selected.includes(o)
              ? "bg-[#1A1A1A] border-[#1A1A1A] text-[#FFE45E]"
              : "bg-[#EFEBE0] border-[#1A1A1A] text-[#6B6B6B] hover:text-[#1A1A1A]"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  )
}

function SkeletonRow() {
  return (
    <tr className="border-b border-[#EFEBE0]">
      {Array.from({ length: 6 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-3.5 bg-[#EFEBE0] rounded animate-pulse" style={{ width: `${50 + (i % 3) * 20}%` }} />
        </td>
      ))}
    </tr>
  )
}

export default function B2BLeadsFinder() {
  // ── Contact filters ────────────────────────────────────────────────────────
  const [jobTitles, setJobTitles]       = useState<string[]>([])
  const [seniorityLevel, setSeniority]  = useState<string[]>([])
  const [functional, setFunctional]     = useState<string[]>([])
  const [firstName, setFirstName]       = useState("")
  const [lastName, setLastName]         = useState("")

  // ── Location filters ───────────────────────────────────────────────────────
  const [personCountry, setPersonCountry]   = useState("")
  const [companyCountry, setCompanyCountry] = useState("")

  // ── Company filters ────────────────────────────────────────────────────────
  const [industries, setIndustries]           = useState<string[]>([])
  const [industryKeywords, setIndustryKeywords] = useState<string[]>([])
  const [companyDomain, setCompanyDomain]     = useState<string[]>([])
  const [companySize, setCompanySize]         = useState<string[]>([])
  const [revenue, setRevenue]                 = useState<string[]>([])
  const [businessModel, setBusinessModel]     = useState<string[]>([])
  const [funding, setFunding]                 = useState<string[]>([])
  const [fundingFromDate, setFundingFromDate] = useState("")
  const [fundingToDate, setFundingToDate]     = useState("")

  // ── Search settings ────────────────────────────────────────────────────────
  const [emailStatus, setEmailStatus] = useState("")
  const [maxResults, setMaxResults]   = useState("50")

  // ── App state ──────────────────────────────────────────────────────────────
  const [leads, setLeads]                   = useState<B2BLead[]>([])
  const [selectedRows, setSelectedRows]     = useState<Set<number>>(new Set())
  const [isLoading, setIsLoading]           = useState(false)
  const [error, setError]                   = useState("")
  const [noCredits, setNoCredits]           = useState(false)
  const [credits, setCredits]               = useState<Credits>({ used: 0, limit: 10, remaining: 10 })
  const [creditsLoading, setCreditsLoading] = useState(true)
  const [plan, setPlan]                     = useState("free")

  const planMax      = PLAN_MAX[plan] ?? 50
  const ALL_OPTIONS  = [10, 20, 50, 100, 200, 500, 1000, 2000]
  const resultOptions = ALL_OPTIONS.filter((n) => n <= planMax)
  const creditPct    = credits.limit > 0 ? Math.min((credits.used / credits.limit) * 100, 100) : 0
  const outOfCredits = credits.remaining === 0
  const lowCredits   = credits.remaining <= Math.ceil(credits.limit * 0.15) && credits.remaining > 0
  const canSearch    = !isLoading && credits.remaining > 0 &&
    (jobTitles.length > 0 || industries.length > 0 || personCountry || companyCountry ||
     seniorityLevel.length > 0 || firstName.trim() || lastName.trim() || companyDomain.length > 0)

  // ── Load profile ───────────────────────────────────────────────────────────
  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("b2b_credits_used, b2b_credits_limit, plan")
        .eq("id", user.id)
        .single()
      if (profile) {
        const used  = profile.b2b_credits_used  ?? 0
        const limit = profile.b2b_credits_limit ?? 10
        setCredits({ used, limit, remaining: limit - used })
        setPlan(profile.plan ?? "free")
        const pMax = PLAN_MAX[profile.plan ?? "free"] ?? 10
        setMaxResults((prev) => String(Math.min(parseInt(prev, 10) || 10, pMax)))
      }
      setCreditsLoading(false)
    }
    loadProfile()
  }, [])

  // ── Search ─────────────────────────────────────────────────────────────────
  const handleSearch = async () => {
    setIsLoading(true)
    setError("")
    setNoCredits(false)
    setLeads([])
    setSelectedRows(new Set())

    try {
      const response = await fetch("/api/b2b-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitles,
          seniorityLevel,
          functional,
          firstName:      firstName.trim(),
          lastName:       lastName.trim(),
          personCountry:  personCountry ? [personCountry] : [],
          companyCountry: companyCountry ? [companyCountry] : [],
          industries,
          industryKeywords,
          companyDomain,
          companySize,
          revenue,
          businessModel,
          funding,
          fundingFromDate: fundingFromDate || undefined,
          fundingToDate:   fundingToDate   || undefined,
          emailStatus,
          maxResults:  parseInt(maxResults, 10),
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
      if (data.creditsUsed !== undefined) {
        setCredits({ used: data.creditsUsed, limit: data.creditsLimit, remaining: data.creditsRemaining })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // ── CSV export ─────────────────────────────────────────────────────────────
  const buildCSV = (rows: B2BLead[]) => {
    const headers = ["Full Name", "Job Title", "Seniority", "Email", "Personal Email", "Phone", "LinkedIn", "Company", "Company Website", "Industry", "Company Size", "City", "State", "Country"]
    const csvRows = rows.map((l) => [
      `"${(l.fullName       || '').replace(/"/g, '""')}"`,
      `"${(l.jobTitle       || '').replace(/"/g, '""')}"`,
      `"${(l.seniority      || '').replace(/"/g, '""')}"`,
      `"${(l.email          || '')}"`,
      `"${(l.personalEmail  || '')}"`,
      `"${(l.phone          || '')}"`,
      `"${(l.linkedin       || '')}"`,
      `"${(l.companyName    || '').replace(/"/g, '""')}"`,
      `"${(l.companyWebsite || '')}"`,
      `"${(l.industry       || '').replace(/"/g, '""')}"`,
      `"${(l.companySize    || '')}"`,
      `"${(l.city           || '')}"`,
      `"${(l.state          || '')}"`,
      `"${(l.country        || '')}"`,
    ].join(","))
    return [headers.join(","), ...csvRows].join("\n")
  }

  const exportRows = (rows: B2BLead[], suffix = "") => {
    if (!rows.length) return
    const label = [jobTitles[0], personCountry || companyCountry].filter(Boolean).join("-").replace(/[^a-zA-Z0-9]/g, "-") || "b2b-leads"
    const blob = new Blob([buildCSV(rows)], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `leadmapper-b2b-${label}${suffix}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const toggleRow     = (i: number) => setSelectedRows((s) => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n })
  const toggleAll     = () => setSelectedRows(selectedRows.size === leads.length ? new Set() : new Set(leads.map((_, i) => i)))
  const selectedLeads = leads.filter((_, i) => selectedRows.has(i))

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">

      {/* Credits bar */}
      {!creditsLoading && (
        <div className={`border-2 border-[#1A1A1A] rounded-[10px] shadow-brutal px-4 py-3 flex flex-wrap items-center justify-between gap-3 ${
          outOfCredits ? "bg-[#FF6B5C]/10" : lowCredits ? "bg-[#FFE45E]" : "bg-[#EFEBE0]"
        }`}>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span>⚡</span>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mb-1">
                <span className="font-kalam font-bold text-sm text-[#1A1A1A] whitespace-nowrap">{credits.remaining} credits remaining</span>
                <span className="font-jetbrains text-[10px] text-[#6B6B6B] hidden xs:inline whitespace-nowrap">({credits.used} / {credits.limit} used)</span>
              </div>
              <div className="h-1.5 bg-[#1A1A1A]/20 rounded-full overflow-hidden max-w-[128px]">
                <div className="h-full bg-[#1A1A1A] rounded-full transition-all" style={{ width: `${100 - creditPct}%` }} />
              </div>
            </div>
          </div>
          {(outOfCredits || lowCredits) && (
            <Link href="/dashboard/billing" className="font-kalam font-bold text-[13px] text-[#F7F4EC] bg-[#1A1A1A] border-2 border-[#1A1A1A] rounded-[8px] px-3 py-1.5 btn-press whitespace-nowrap flex-shrink-0">
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
            You&apos;ve used all your credits. Upgrade to keep finding leads.
          </p>
          <Link href="/dashboard/billing" className="inline-flex items-center gap-2 font-kalam font-bold text-[#F7F4EC] bg-[#1A1A1A] border-2 border-[#1A1A1A] rounded-[10px] px-6 py-3 text-sm btn-press shadow-brutal">
            View upgrade plans →
          </Link>
        </div>
      )}

      {/* Search form */}
      <div className={`bg-[#F7F4EC] border-2 border-[#1A1A1A] rounded-[14px] shadow-brutal-lg p-6 ${outOfCredits ? "opacity-50 pointer-events-none select-none" : ""}`}>
        <div className="space-y-6">

          {/* ── CONTACT ──────────────────────────────────────────────────── */}
          <div>
            <p className="font-jetbrains text-[9px] font-bold text-[#B8B5AA] uppercase tracking-widest mb-4">Contact</p>
            <div className="space-y-4">

              <div className="space-y-2">
                <label className="font-jetbrains text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wider">JOB TITLE</label>
                <TagInput tags={jobTitles} onChange={setJobTitles} placeholder='e.g. "Marketing Manager", "CTO", "Sales Rep"' />
                <p className="font-jetbrains text-[10px] text-[#B8B5AA]">Press Enter or comma to add multiple</p>
              </div>

              <div className="space-y-2">
                <label className="font-jetbrains text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wider">SENIORITY</label>
                <PillSelect options={SENIORITY_OPTIONS} selected={seniorityLevel} onChange={setSeniority} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="font-jetbrains text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wider">DEPARTMENT / FUNCTION</label>
                  <TagInput tags={functional} onChange={setFunctional} placeholder='e.g. "Sales", "Marketing", "Engineering"' />
                  <p className="font-jetbrains text-[10px] text-[#B8B5AA]">Press Enter or comma to add</p>
                </div>
                <div className="space-y-2">
                  <label className="font-jetbrains text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wider">INDIVIDUAL SEARCH</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="First name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="flex-1 font-kalam text-sm text-[#1A1A1A] placeholder:text-[#B8B5AA] bg-[#F7F4EC] border-2 border-[#1A1A1A] rounded-[10px] px-3 py-2.5 outline-none focus:shadow-brutal transition-all"
                    />
                    <input
                      type="text"
                      placeholder="Last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="flex-1 font-kalam text-sm text-[#1A1A1A] placeholder:text-[#B8B5AA] bg-[#F7F4EC] border-2 border-[#1A1A1A] rounded-[10px] px-3 py-2.5 outline-none focus:shadow-brutal transition-all"
                    />
                  </div>
                  <p className="font-jetbrains text-[10px] text-[#B8B5AA]">Search for a specific person</p>
                </div>
              </div>

            </div>
          </div>

          <div className="border-t-2 border-[#EFEBE0]" />

          {/* ── LOCATION ─────────────────────────────────────────────────── */}
          <div>
            <p className="font-jetbrains text-[9px] font-bold text-[#B8B5AA] uppercase tracking-widest mb-4">Location</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div className="space-y-2">
                <label className="font-jetbrains text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wider">PERSON COUNTRY</label>
                <select
                  value={personCountry}
                  onChange={(e) => setPersonCountry(e.target.value)}
                  className="w-full font-kalam text-sm text-[#1A1A1A] bg-[#F7F4EC] border-2 border-[#1A1A1A] rounded-[10px] px-3 py-3 outline-none focus:shadow-brutal transition-all"
                >
                  <option value="">All countries</option>
                  {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <p className="font-jetbrains text-[10px] text-[#B8B5AA]">Where the person is located</p>
              </div>

              <div className="space-y-2">
                <label className="font-jetbrains text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wider">COMPANY COUNTRY</label>
                <select
                  value={companyCountry}
                  onChange={(e) => setCompanyCountry(e.target.value)}
                  className="w-full font-kalam text-sm text-[#1A1A1A] bg-[#F7F4EC] border-2 border-[#1A1A1A] rounded-[10px] px-3 py-3 outline-none focus:shadow-brutal transition-all"
                >
                  <option value="">All countries</option>
                  {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <p className="font-jetbrains text-[10px] text-[#B8B5AA]">Where the company is headquartered</p>
              </div>

            </div>
          </div>

          <div className="border-t-2 border-[#EFEBE0]" />

          {/* ── COMPANY ──────────────────────────────────────────────────── */}
          <div>
            <p className="font-jetbrains text-[9px] font-bold text-[#B8B5AA] uppercase tracking-widest mb-4">Company</p>
            <div className="space-y-4">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="font-jetbrains text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wider">INDUSTRY</label>
                  <TagInput tags={industries} onChange={setIndustries} placeholder='e.g. "SaaS", "FinTech", "Healthcare"' />
                  <p className="font-jetbrains text-[10px] text-[#B8B5AA]">Press Enter or comma to add</p>
                </div>
                <div className="space-y-2">
                  <label className="font-jetbrains text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wider">INDUSTRY KEYWORDS</label>
                  <TagInput tags={industryKeywords} onChange={setIndustryKeywords} placeholder='e.g. "AI", "cloud", "cybersecurity"' />
                  <p className="font-jetbrains text-[10px] text-[#B8B5AA]">Press Enter or comma to add</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-jetbrains text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wider">COMPANY DOMAIN</label>
                <TagInput tags={companyDomain} onChange={setCompanyDomain} placeholder='e.g. "stripe.com", "github.com" (without www or https)' />
                <p className="font-jetbrains text-[10px] text-[#B8B5AA]">Max 10 domains. Press Enter or comma to add.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="font-jetbrains text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wider">EMPLOYEE SIZE</label>
                  <TagInput tags={companySize} onChange={setCompanySize} placeholder='e.g. "1-10", "51-200"' />
                </div>
                <div className="space-y-2">
                  <label className="font-jetbrains text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wider">REVENUE RANGE</label>
                  <TagInput tags={revenue} onChange={setRevenue} placeholder='e.g. "1M-10M", "10M-50M"' />
                </div>
                <div className="space-y-2">
                  <label className="font-jetbrains text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wider">BUSINESS MODEL</label>
                  <TagInput tags={businessModel} onChange={setBusinessModel} placeholder='e.g. "B2B", "SaaS", "B2C"' />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="font-jetbrains text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wider">FUNDING TYPE</label>
                  <TagInput tags={funding} onChange={setFunding} placeholder='e.g. "Seed", "Series A"' />
                </div>
                <div className="space-y-2">
                  <label className="font-jetbrains text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wider">FUNDING FROM</label>
                  <input
                    type="date"
                    value={fundingFromDate}
                    onChange={(e) => setFundingFromDate(e.target.value)}
                    className="w-full font-kalam text-sm text-[#1A1A1A] bg-[#F7F4EC] border-2 border-[#1A1A1A] rounded-[10px] px-3 py-2.5 outline-none focus:shadow-brutal transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-jetbrains text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wider">FUNDING TO</label>
                  <input
                    type="date"
                    value={fundingToDate}
                    onChange={(e) => setFundingToDate(e.target.value)}
                    className="w-full font-kalam text-sm text-[#1A1A1A] bg-[#F7F4EC] border-2 border-[#1A1A1A] rounded-[10px] px-3 py-2.5 outline-none focus:shadow-brutal transition-all"
                  />
                </div>
              </div>

            </div>
          </div>

          <div className="border-t-2 border-[#EFEBE0]" />

          {/* ── SEARCH SETTINGS ──────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-5">
            <div className="space-y-2">
              <label className="font-jetbrains text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wider">EMAIL STATUS</label>
              <select
                value={emailStatus}
                onChange={(e) => setEmailStatus(e.target.value)}
                className="font-jetbrains text-[12px] text-[#1A1A1A] bg-[#EFEBE0] border-2 border-[#1A1A1A] rounded-[8px] px-3 py-2 outline-none"
              >
                <option value="">All contacts</option>
                <option value="verified">Verified emails only</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="font-jetbrains text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wider">MAX LEADS</label>
              <select
                value={maxResults}
                onChange={(e) => setMaxResults(e.target.value)}
                className="font-jetbrains text-[12px] text-[#1A1A1A] bg-[#EFEBE0] border-2 border-[#1A1A1A] rounded-[8px] px-3 py-2 outline-none"
              >
                {resultOptions.map((n) => (
                  <option key={n} value={String(n)}>{n}</option>
                ))}
              </select>
              <p className="font-jetbrains text-[10px] text-[#B8B5AA]">max {planMax} on {plan} plan</p>
            </div>
            <div className="flex-1 sm:text-right space-y-2">
              <div className="font-jetbrains text-[11px] text-[#6B6B6B]">
                Est. cost: <span className="font-bold text-[#1A1A1A]">{maxResults} credits</span>
                {credits.remaining < parseInt(maxResults) && credits.remaining > 0 && (
                  <span className="text-[#FF6B5C] ml-2">(only {credits.remaining} available)</span>
                )}
              </div>
              <button
                onClick={handleSearch}
                disabled={!canSearch}
                className="w-full sm:w-auto font-kalam font-bold text-[#F7F4EC] bg-[#1A1A1A] border-2 border-[#1A1A1A] rounded-[10px] px-7 py-3 text-sm inline-flex items-center justify-center gap-2 btn-press shadow-brutal disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-brutal"
              >
                {isLoading ? (
                  <><Loader2 size={15} className="animate-spin" />Finding contacts…</>
                ) : (
                  "Find contacts →"
                )}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-[#FF6B5C]/10 border-2 border-[#FF6B5C] rounded-[10px] px-4 py-3">
          <p className="font-jetbrains text-[12px] text-[#FF6B5C] font-bold">{error}</p>
        </div>
      )}

      {/* Results */}
      {(isLoading || leads.length > 0) && (
        <div className="bg-[#F7F4EC] border-2 border-[#1A1A1A] rounded-[14px] shadow-brutal-lg overflow-hidden">

          {/* Table toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b-2 border-[#1A1A1A]">
            <div>
              <span className="font-kalam font-bold text-[#1A1A1A] text-base">
                {isLoading ? "Searching…" : `${leads.length} contact${leads.length !== 1 ? "s" : ""} found`}
              </span>
              {selectedRows.size > 0 && (
                <span className="ml-2 font-jetbrains text-[11px] text-[#6B6B6B]">({selectedRows.size} selected)</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {selectedRows.size > 0 && (
                <button
                  onClick={() => exportRows(selectedLeads, "-selected")}
                  className="font-kalam font-bold text-[12px] text-[#1A1A1A] bg-[#FFE45E] border-2 border-[#1A1A1A] rounded-[8px] px-3 py-1.5 btn-press shadow-brutal whitespace-nowrap"
                >
                  Export {selectedRows.size} selected
                </button>
              )}
              {leads.length > 0 && (
                <button
                  onClick={() => exportRows(leads)}
                  className="font-kalam font-bold text-[12px] text-[#F7F4EC] bg-[#1A1A1A] border-2 border-[#1A1A1A] rounded-[8px] px-3 py-1.5 btn-press shadow-brutal whitespace-nowrap"
                >
                  Export all CSV
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[860px]">
              <thead>
                <tr className="border-b-2 border-[#1A1A1A] bg-[#EFEBE0]">
                  <th className="px-4 py-3 text-left w-10">
                    <input
                      type="checkbox"
                      checked={leads.length > 0 && selectedRows.size === leads.length}
                      onChange={toggleAll}
                      className="accent-[#1A1A1A] w-3.5 h-3.5"
                    />
                  </th>
                  {["Contact", "Email", "Phone", "LinkedIn", "Company", "Location"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-jetbrains text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                  : leads.map((l, i) => {
                      const loc = [l.city, l.state, l.country].filter(Boolean).join(", ")
                      return (
                        <tr
                          key={i}
                          className={`border-b border-[#EFEBE0] transition-colors cursor-pointer ${selectedRows.has(i) ? "bg-[#FFE45E]/20" : "hover:bg-[#EFEBE0]/50"}`}
                          onClick={() => toggleRow(i)}
                        >
                          <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                            <input type="checkbox" checked={selectedRows.has(i)} onChange={() => toggleRow(i)} className="accent-[#1A1A1A] w-3.5 h-3.5" />
                          </td>

                          {/* Contact */}
                          <td className="px-4 py-3 max-w-[200px]">
                            <p className="font-kalam font-bold text-[#1A1A1A] text-sm truncate">{l.fullName}</p>
                            {l.jobTitle  && <p className="font-jetbrains text-[10px] text-[#6B6B6B] truncate">{l.jobTitle}</p>}
                            {l.seniority && <p className="font-jetbrains text-[10px] text-[#B8B5AA] truncate">{l.seniority}</p>}
                          </td>

                          {/* Email */}
                          <td className="px-4 py-3 max-w-[200px]">
                            {l.email
                              ? <a href={`mailto:${l.email}`} onClick={(e) => e.stopPropagation()} className="font-jetbrains text-[11px] text-[#1A1A1A] hover:underline truncate block">{l.email}</a>
                              : <span className="font-jetbrains text-[10px] text-[#B8B5AA]">—</span>
                            }
                            {l.personalEmail && l.personalEmail !== l.email && (
                              <a href={`mailto:${l.personalEmail}`} onClick={(e) => e.stopPropagation()} className="font-jetbrains text-[10px] text-[#6B6B6B] hover:underline truncate block mt-0.5">{l.personalEmail}</a>
                            )}
                          </td>

                          {/* Phone */}
                          <td className="px-4 py-3">
                            {l.phone
                              ? <a href={`tel:${l.phone}`} onClick={(e) => e.stopPropagation()} className="font-jetbrains text-[11px] text-[#1A1A1A] hover:underline whitespace-nowrap">{l.phone}</a>
                              : <span className="font-jetbrains text-[10px] text-[#B8B5AA]">—</span>
                            }
                          </td>

                          {/* LinkedIn */}
                          <td className="px-4 py-3">
                            {l.linkedin
                              ? (
                                <a href={l.linkedin} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center gap-1 font-jetbrains text-[11px] text-[#0A66C2] hover:underline"
                                >
                                  <Linkedin size={12} />View
                                </a>
                              )
                              : <span className="font-jetbrains text-[10px] text-[#B8B5AA]">—</span>
                            }
                          </td>

                          {/* Company */}
                          <td className="px-4 py-3 max-w-[180px]">
                            <p className="font-kalam font-bold text-[#1A1A1A] text-sm truncate">{l.companyName || "—"}</p>
                            {l.industry    && <p className="font-jetbrains text-[10px] text-[#6B6B6B] truncate">{l.industry}</p>}
                            {l.companySize && <p className="font-jetbrains text-[10px] text-[#B8B5AA] truncate">{l.companySize} employees</p>}
                            {l.companyWebsite && (
                              <a href={l.companyWebsite} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 font-jetbrains text-[10px] text-[#6B6B6B] hover:text-[#1A1A1A] mt-0.5"
                              >
                                <ExternalLink size={10} />Website
                              </a>
                            )}
                          </td>

                          {/* Location */}
                          <td className="px-4 py-3">
                            <span className="font-jetbrains text-[11px] text-[#6B6B6B] whitespace-nowrap">
                              {loc || "—"}
                            </span>
                          </td>
                        </tr>
                      )
                    })
                }
              </tbody>
            </table>
          </div>

          {/* Bottom export */}
          {leads.length > 0 && (
            <div className="px-5 py-4 border-t-2 border-[#1A1A1A] flex items-center justify-between gap-3 flex-wrap">
              <span className="font-jetbrains text-[11px] text-[#6B6B6B]">
                {leads.length} contact{leads.length !== 1 ? "s" : ""} · {leads.filter((l) => l.email).length} with email
              </span>
              <button
                onClick={() => exportRows(leads)}
                className="font-kalam font-bold text-[13px] text-[#F7F4EC] bg-[#1A1A1A] border-2 border-[#1A1A1A] rounded-[10px] px-5 py-2.5 btn-press shadow-brutal"
              >
                Download CSV →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
