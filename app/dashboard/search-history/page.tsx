"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Loader2, AlertCircle, ChevronDown, ChevronUp, ExternalLink } from "lucide-react"
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
  id: string
  title: string
  address: string | null
  phone: string | null
  website: string | null
  rating: number | null
  reviews_count: number | null
  category: string | null
  maps_url: string | null
  emails: string[] | null
  social_media: SocialMedia | null
}

interface SearchRecord {
  id: string
  keyword: string
  location: string
  result_count: number
  created_at: string
  leads?: Lead[]
  leadsLoaded?: boolean
  leadsLoading?: boolean
  expanded?: boolean
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function buildCSV(leads: Lead[]) {
  const headers = [
    "Business Name", "Address", "Phone", "Website",
    "Rating", "Reviews", "Category", "Google Maps",
    "Emails", "Facebook", "Instagram", "LinkedIn", "Twitter", "YouTube", "TikTok",
  ]
  const rows = leads.map((l) => [
    `"${(l.title || "").replace(/"/g, '""')}"`,
    `"${(l.address || "").replace(/"/g, '""')}"`,
    `"${l.phone || ""}"`,
    `"${l.website || ""}"`,
    l.rating ?? "",
    l.reviews_count ?? "",
    `"${(l.category || "").replace(/"/g, '""')}"`,
    `"${l.maps_url || ""}"`,
    `"${(l.emails || []).join("; ")}"`,
    `"${l.social_media?.facebook || ""}"`,
    `"${l.social_media?.instagram || ""}"`,
    `"${l.social_media?.linkedin || ""}"`,
    `"${l.social_media?.twitter || ""}"`,
    `"${l.social_media?.youtube || ""}"`,
    `"${l.social_media?.tiktok || ""}"`,
  ].join(","))
  return [headers.join(","), ...rows].join("\n")
}

function downloadCSV(leads: Lead[], keyword: string, location: string) {
  const filename = `leadmapper-${keyword.replace(/\s+/g, "-")}-${location.replace(/[^a-zA-Z0-9]/g, "-")}.csv`
  const blob = new Blob([buildCSV(leads)], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

type FilterTab = "all" | "exported" | "not_exported" | "favorites"

export default function SearchHistoryPage() {
  const [searches, setSearches] = useState<SearchRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filter, setFilter] = useState<FilterTab>("all")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error: err } = await supabase
        .from("searches")
        .select("id, keyword, location, result_count, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100)

      if (err) {
        setError("Failed to load search history.")
      } else {
        setSearches((data ?? []).map((s) => ({ ...s, expanded: false, leadsLoaded: false })))
      }
      setLoading(false)
    }
    load()
  }, [])

  const toggleSearch = useCallback(async (searchId: string) => {
    setSearches((prev) =>
      prev.map((s) => s.id === searchId ? { ...s, expanded: !s.expanded } : s)
    )

    const search = searches.find((s) => s.id === searchId)
    if (!search || search.leadsLoaded || search.leadsLoading) return

    setSearches((prev) =>
      prev.map((s) => s.id === searchId ? { ...s, leadsLoading: true } : s)
    )

    const supabase = createClient()
    const { data, error: err } = await supabase
      .from("leads")
      .select("id, title, address, phone, website, rating, reviews_count, category, maps_url, emails, social_media")
      .eq("search_id", searchId)
      .order("created_at", { ascending: true })

    setSearches((prev) =>
      prev.map((s) =>
        s.id === searchId
          ? { ...s, leads: data ?? [], leadsLoaded: true, leadsLoading: false }
          : s
      )
    )
    if (err) console.error("Failed to load leads:", err.message)
  }, [searches])

  const filtered = searches.filter((s) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      if (!s.keyword.toLowerCase().includes(q) && !s.location.toLowerCase().includes(q)) return false
    }
    return true
  })

  const filterTabs: { id: FilterTab; label: string }[] = [
    { id: "all", label: "All" },
    { id: "exported", label: "Exported" },
    { id: "not_exported", label: "Not exported" },
    { id: "favorites", label: "★ Favorites" },
  ]

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-3">
        <div className="mb-7">
          <div className="h-7 w-44 bg-[#EFEBE0] rounded-[8px] animate-pulse mb-2 border-2 border-[#1A1A1A]" />
          <div className="h-4 w-72 bg-[#EFEBE0] rounded animate-pulse" />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-[#F7F4EC] border-2 border-[#1A1A1A] rounded-[12px] p-5 animate-pulse shadow-brutal">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 w-32 bg-[#EFEBE0] rounded" />
                <div className="h-3 w-48 bg-[#EFEBE0] rounded" />
              </div>
              <div className="h-8 w-24 bg-[#EFEBE0] rounded-[8px]" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="font-kalam font-bold text-2xl text-[#1A1A1A] mb-1">Search history</h2>
        <p className="font-jetbrains text-[12px] text-[#6B6B6B]">
          Every search you&apos;ve run · rerun any of them in one click
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-[#FF6B5C]/10 border-2 border-[#FF6B5C] text-[#FF6B5C] rounded-[10px] px-4 py-3 flex items-center gap-3 font-kalam text-sm mb-4">
          <AlertCircle size={15} className="flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5">
        {/* Search input */}
        <div className="flex items-center gap-2 bg-[#F7F4EC] border-2 border-[#1A1A1A] rounded-[10px] px-4 py-2.5 flex-1 min-w-[200px]">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6B6B6B" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="6"/><path d="M16 16 L21 21"/>
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by keyword or city…"
            className="font-kalam text-sm text-[#1A1A1A] placeholder:text-[#B8B5AA] bg-transparent outline-none flex-1"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`font-kalam font-bold text-[13px] px-3 py-1.5 rounded-[8px] border-2 transition-all ${
                filter === tab.id
                  ? "bg-[#FFE45E] border-[#1A1A1A] text-[#1A1A1A] shadow-brutal"
                  : "bg-[#F7F4EC] border-[#1A1A1A] text-[#6B6B6B] hover:bg-[#EFEBE0]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && !error && (
        <div className="bg-[#F7F4EC] border-2 border-[#1A1A1A] rounded-[14px] shadow-brutal p-16 text-center">
          <div className="w-12 h-12 bg-[#EFEBE0] border-2 border-[#1A1A1A] rounded-[10px] flex items-center justify-center mx-auto mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B8B5AA" strokeWidth="2" strokeLinecap="round">
              <path d="M5 5 L17 5 L19 7 L19 19 L5 19 Z"/>
              <path d="M8 5 L8 11 L16 11 L16 5"/>
            </svg>
          </div>
          <p className="font-kalam font-bold text-[#3A3A3A] text-base mb-1">No searches yet</p>
          <p className="font-jetbrains text-[11px] text-[#B8B5AA] mb-5">Run your first search to see results here.</p>
          <Link
            href="/dashboard/new-search"
            className="inline-flex items-center gap-2 font-kalam font-bold text-[#F7F4EC] bg-[#1A1A1A] border-2 border-[#1A1A1A] rounded-[10px] px-5 py-3 text-sm btn-press shadow-brutal"
          >
            Start searching →
          </Link>
        </div>
      )}

      {/* Search rows */}
      <div className="space-y-3">
        {filtered.map((s) => (
          <div
            key={s.id}
            className="bg-[#F7F4EC] border-2 border-[#1A1A1A] rounded-[12px] overflow-hidden shadow-brutal"
          >
            {/* Row header */}
            <div className="px-5 py-4 flex items-center justify-between gap-4">
              <button
                onClick={() => toggleSearch(s.id)}
                className="flex items-start gap-4 min-w-0 flex-1 text-left"
              >
                <div className="w-9 h-9 bg-[#EFEBE0] border-2 border-[#1A1A1A] rounded-[8px] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round">
                    <circle cx="11" cy="11" r="6"/><path d="M16 16 L21 21"/>
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-kalam font-bold text-[#1A1A1A] text-sm capitalize">{s.keyword}</span>
                    <span className="text-[#B8B5AA]">·</span>
                    <span className="font-jetbrains text-[11px] text-[#6B6B6B] flex items-center gap-1">
                      📍 {s.location}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-jetbrains text-[10px] text-[#B8B5AA]">
                      📦 {s.result_count} lead{s.result_count !== 1 ? "s" : ""}
                    </span>
                    <span className="font-jetbrains text-[10px] text-[#B8B5AA]">
                      🕐 {formatDate(s.created_at)}
                    </span>
                  </div>
                </div>
              </button>

              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                {s.leadsLoaded && s.leads && s.leads.length > 0 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); downloadCSV(s.leads!, s.keyword, s.location) }}
                    className="font-kalam font-bold text-[12px] text-[#1A1A1A] bg-[#FFE45E] border-2 border-[#1A1A1A] rounded-[8px] px-2.5 py-1.5 shadow-brutal btn-press flex items-center gap-1"
                  >
                    ↓ <span className="hidden sm:inline">CSV</span>
                  </button>
                )}
                <button
                  onClick={() => toggleSearch(s.id)}
                  className="text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors p-1"
                >
                  {s.expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>
            </div>

            {/* Expanded leads */}
            {s.expanded && (
              <div className="border-t-2 border-[#1A1A1A]">
                {s.leadsLoading && (
                  <div className="flex items-center justify-center gap-2 py-10 font-kalam text-sm text-[#6B6B6B]">
                    <Loader2 size={16} className="animate-spin" />
                    Loading leads…
                  </div>
                )}

                {s.leadsLoaded && s.leads?.length === 0 && (
                  <div className="py-10 text-center font-kalam text-sm text-[#B8B5AA]">
                    No leads saved for this search.
                  </div>
                )}

                {s.leadsLoaded && s.leads && s.leads.length > 0 && (
                  <>
                    {/* Export bar */}
                    <div className="px-5 py-3 bg-[#EFEBE0] border-b-2 border-[#1A1A1A] flex items-center justify-between">
                      <span className="font-jetbrains text-[11px] text-[#6B6B6B]">
                        {s.leads.length} lead{s.leads.length !== 1 ? "s" : ""} saved
                      </span>
                      <button
                        onClick={() => downloadCSV(s.leads!, s.keyword, s.location)}
                        className="font-kalam font-bold text-[12px] text-[#1A1A1A] bg-[#FFE45E] border-2 border-[#1A1A1A] rounded-[8px] px-3 py-1.5 shadow-brutal btn-press flex items-center gap-1.5"
                      >
                        ↓ Download all CSV
                      </button>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-[#F7F4EC] border-b-2 border-[#EFEBE0]">
                            {["Business Name", "Phone", "Website", "Rating", "Category", "Maps", "Contact"].map((h) => (
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
                          {s.leads.map((lead) => (
                            <tr key={lead.id} className="border-b border-[#EFEBE0] hover:bg-[#EFEBE0] transition-colors">
                              {/* Name + address */}
                              <td className="px-4 py-3">
                                <div className="font-kalam font-bold text-[#1A1A1A] text-[0.8125rem] max-w-[180px] truncate">{lead.title}</div>
                                {lead.address && (
                                  <div className="font-jetbrains text-[10px] text-[#B8B5AA] max-w-[180px] truncate mt-0.5">{lead.address}</div>
                                )}
                              </td>

                              {/* Phone */}
                              <td className="px-4 py-3 whitespace-nowrap">
                                {lead.phone ? (
                                  <span className="font-jetbrains text-[11px] text-[#3A3A3A]">{lead.phone}</span>
                                ) : (
                                  <span className="text-[#B8B5AA] text-xs">—</span>
                                )}
                              </td>

                              {/* Website */}
                              <td className="px-4 py-3">
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

                              {/* Rating */}
                              <td className="px-4 py-3 whitespace-nowrap">
                                {lead.rating ? (
                                  <div className="flex items-center gap-1">
                                    <span className="text-[#FFE45E]">★</span>
                                    <span className="font-kalam font-bold text-[#1A1A1A] text-xs">{lead.rating}</span>
                                    {lead.reviews_count && (
                                      <span className="font-jetbrains text-[10px] text-[#B8B5AA]">({lead.reviews_count})</span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-[#B8B5AA] text-xs">—</span>
                                )}
                              </td>

                              {/* Category */}
                              <td className="px-4 py-3">
                                {lead.category ? (
                                  <span className="font-jetbrains text-[10px] bg-[#EFEBE0] border border-[#1A1A1A] text-[#3A3A3A] px-2 py-0.5 rounded-[6px] truncate max-w-[110px] block">
                                    {lead.category}
                                  </span>
                                ) : (
                                  <span className="text-[#B8B5AA] text-xs">—</span>
                                )}
                              </td>

                              {/* Maps */}
                              <td className="px-4 py-3">
                                {lead.maps_url ? (
                                  <a
                                    href={lead.maps_url}
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

                              {/* Contact */}
                              <td className="px-4 py-3">
                                <div className="space-y-1">
                                  {lead.emails?.map((email, j) => (
                                    <a
                                      key={j}
                                      href={`mailto:${email}`}
                                      className="font-jetbrains text-[10px] text-[#1A1A1A] underline underline-offset-2 hover:opacity-70 max-w-[150px] truncate block"
                                    >
                                      ✉ {email}
                                    </a>
                                  ))}
                                  {lead.social_media && Object.values(lead.social_media).some(Boolean) && (
                                    <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                                      {lead.social_media.facebook  && <a href={lead.social_media.facebook}  target="_blank" rel="noopener noreferrer" className="font-jetbrains text-[10px] font-bold text-[#1877F2] hover:opacity-70 bg-[#EFEBE0] border border-[#B8B5AA] rounded px-1">fb</a>}
                                      {lead.social_media.instagram && <a href={lead.social_media.instagram} target="_blank" rel="noopener noreferrer" className="font-jetbrains text-[10px] font-bold text-[#E1306C] hover:opacity-70 bg-[#EFEBE0] border border-[#B8B5AA] rounded px-1">ig</a>}
                                      {lead.social_media.linkedin  && <a href={lead.social_media.linkedin}  target="_blank" rel="noopener noreferrer" className="font-jetbrains text-[10px] font-bold text-[#0A66C2] hover:opacity-70 bg-[#EFEBE0] border border-[#B8B5AA] rounded px-1">in</a>}
                                      {lead.social_media.twitter   && <a href={lead.social_media.twitter}   target="_blank" rel="noopener noreferrer" className="font-jetbrains text-[10px] font-bold text-[#1A1A1A] hover:opacity-70 bg-[#EFEBE0] border border-[#B8B5AA] rounded px-1">𝕏</a>}
                                      {lead.social_media.youtube   && <a href={lead.social_media.youtube}   target="_blank" rel="noopener noreferrer" className="font-jetbrains text-[10px] font-bold text-[#FF0000] hover:opacity-70 bg-[#EFEBE0] border border-[#B8B5AA] rounded px-1">yt</a>}
                                      {lead.social_media.tiktok    && <a href={lead.social_media.tiktok}    target="_blank" rel="noopener noreferrer" className="font-jetbrains text-[10px] font-bold text-[#1A1A1A] hover:opacity-70 bg-[#EFEBE0] border border-[#B8B5AA] rounded px-1">tt</a>}
                                    </div>
                                  )}
                                  {!lead.emails?.length && !Object.values(lead.social_media ?? {}).some(Boolean) && (
                                    <span className="text-[#B8B5AA] text-xs">—</span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom summary */}
      {searches.length > 0 && (
        <div className="mt-6 pt-4 border-t-2 border-[#EFEBE0] flex items-center justify-between">
          <span className="font-jetbrains text-[11px] text-[#B8B5AA]">
            {searches.length} total search{searches.length !== 1 ? "es" : ""} · {filtered.length} shown
          </span>
          <Link
            href="/dashboard/new-search"
            className="font-kalam font-bold text-[13px] text-[#1A1A1A] bg-[#FFE45E] border-2 border-[#1A1A1A] rounded-[8px] px-4 py-2 shadow-brutal btn-press"
          >
            + New search
          </Link>
        </div>
      )}
    </div>
  )
}
