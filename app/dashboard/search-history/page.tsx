"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import {
  MapPin,
  Phone,
  Globe,
  Star,
  Download,
  Calendar,
  Package,
  EnvelopeSimple,
  MagnifyingGlass,
} from "@phosphor-icons/react/dist/ssr"
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Loader2,
  AlertCircle,
  Search,
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

function buildCSV(leads: Lead[], keyword: string) {
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
  const blob = new Blob([buildCSV(leads, keyword)], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export default function SearchHistoryPage() {
  const [searches, setSearches] = useState<SearchRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Load searches on mount
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

    // Load leads if not yet loaded
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

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-3">
        <div className="mb-7">
          <div className="h-7 w-44 bg-neutral-100 rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-72 bg-neutral-100 rounded animate-pulse" />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white border border-neutral-200 rounded-xl p-5 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 w-32 bg-neutral-100 rounded" />
                <div className="h-3 w-48 bg-neutral-100 rounded" />
              </div>
              <div className="h-8 w-24 bg-neutral-100 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-7">
        <h1 className="font-display font-bold text-2xl text-neutral-900 mb-1">Search History</h1>
        <p className="text-neutral-400 text-sm">All your past searches and their scraped leads.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 flex items-center gap-3 text-sm mb-4">
          <AlertCircle size={15} className="text-red-500 flex-shrink-0" />
          {error}
        </div>
      )}

      {searches.length === 0 && !error && (
        <div className="bg-white border border-neutral-200 rounded-xl p-16 text-center">
          <div className="w-12 h-12 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center mx-auto mb-4">
            <MagnifyingGlass size={22} className="text-neutral-300" />
          </div>
          <p className="text-sm font-semibold text-neutral-700 mb-1">No searches yet</p>
          <p className="text-xs text-neutral-400 mb-5">Run your first search to see results here.</p>
          <Link
            href="/dashboard/new-search"
            className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            <MagnifyingGlass size={14} weight="bold" />
            Start searching
          </Link>
        </div>
      )}

      <div className="space-y-3">
        {searches.map((s) => (
          <div
            key={s.id}
            className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm"
          >
            {/* Search header row */}
            <button
              onClick={() => toggleSearch(s.id)}
              className="w-full px-5 py-4 flex items-center justify-between gap-4 hover:bg-neutral-50 transition-colors text-left"
            >
              <div className="flex items-start gap-4 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MagnifyingGlass size={15} className="text-blue-700" weight="bold" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-neutral-900 capitalize">{s.keyword}</span>
                    <span className="text-neutral-300">·</span>
                    <span className="flex items-center gap-1 text-xs text-neutral-500">
                      <MapPin size={11} weight="fill" className="text-neutral-400" />
                      {s.location}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="flex items-center gap-1 text-[11px] text-neutral-400">
                      <Package size={11} weight="fill" />
                      {s.result_count} lead{s.result_count !== 1 ? "s" : ""}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-neutral-400">
                      <Calendar size={11} weight="fill" />
                      {formatDate(s.created_at)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {s.leadsLoaded && s.leads && s.leads.length > 0 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); downloadCSV(s.leads!, s.keyword, s.location) }}
                    className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-blue-700 bg-neutral-100 hover:bg-blue-50 border border-neutral-200 hover:border-blue-200 px-3 py-1.5 rounded-lg transition-all"
                  >
                    <Download size={12} weight="bold" />
                    Export CSV
                  </button>
                )}
                <div className="text-neutral-400">
                  {s.expanded
                    ? <ChevronUp size={16} />
                    : <ChevronDown size={16} />
                  }
                </div>
              </div>
            </button>

            {/* Expanded leads table */}
            {s.expanded && (
              <div className="border-t border-neutral-100">
                {s.leadsLoading && (
                  <div className="flex items-center justify-center gap-2 py-10 text-sm text-neutral-400">
                    <Loader2 size={16} className="animate-spin" />
                    Loading leads…
                  </div>
                )}

                {s.leadsLoaded && s.leads?.length === 0 && (
                  <div className="py-10 text-center text-sm text-neutral-400">
                    No leads saved for this search.
                  </div>
                )}

                {s.leadsLoaded && s.leads && s.leads.length > 0 && (
                  <>
                    {/* Export bar */}
                    <div className="px-5 py-3 bg-neutral-50 border-b border-neutral-100 flex items-center justify-between">
                      <span className="text-xs text-neutral-500 font-medium">
                        {s.leads.length} lead{s.leads.length !== 1 ? "s" : ""} saved
                      </span>
                      <button
                        onClick={() => downloadCSV(s.leads!, s.keyword, s.location)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-800 transition-colors"
                      >
                        <Download size={12} weight="bold" />
                        Download all CSV
                      </button>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-neutral-100 bg-white">
                            {["Business Name", "Phone", "Website", "Rating", "Category", "Maps", "Emails / Social"].map((h) => (
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
                          {s.leads.map((lead) => (
                            <tr key={lead.id} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">

                              {/* Name + address */}
                              <td className="px-4 py-3">
                                <div className="font-medium text-neutral-900 text-[0.8125rem] max-w-[180px] truncate">{lead.title}</div>
                                {lead.address && (
                                  <div className="text-[11px] text-neutral-400 max-w-[180px] truncate mt-0.5">{lead.address}</div>
                                )}
                              </td>

                              {/* Phone */}
                              <td className="px-4 py-3 whitespace-nowrap">
                                {lead.phone ? (
                                  <div className="flex items-center gap-1.5 text-xs text-neutral-700">
                                    <Phone size={11} weight="fill" className="text-neutral-400" />
                                    {lead.phone}
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
                                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs font-medium"
                                  >
                                    <Globe size={11} weight="fill" />
                                    Visit
                                  </a>
                                ) : (
                                  <span className="text-neutral-300 text-xs">—</span>
                                )}
                              </td>

                              {/* Rating */}
                              <td className="px-4 py-3 whitespace-nowrap">
                                {lead.rating ? (
                                  <div className="flex items-center gap-1">
                                    <Star size={11} weight="fill" className="text-amber-400" />
                                    <span className="text-xs font-semibold text-neutral-800">{lead.rating}</span>
                                    {lead.reviews_count && (
                                      <span className="text-[11px] text-neutral-400">({lead.reviews_count})</span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-neutral-300 text-xs">—</span>
                                )}
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

                              {/* Maps */}
                              <td className="px-4 py-3">
                                {lead.maps_url ? (
                                  <a
                                    href={lead.maps_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 text-xs font-medium"
                                  >
                                    <ExternalLink size={11} />
                                    Maps
                                  </a>
                                ) : (
                                  <span className="text-neutral-300 text-xs">—</span>
                                )}
                              </td>

                              {/* Emails + social */}
                              <td className="px-4 py-3">
                                <div className="space-y-1">
                                  {lead.emails?.map((email, j) => (
                                    <a
                                      key={j}
                                      href={`mailto:${email}`}
                                      className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700 max-w-[150px] truncate"
                                    >
                                      <EnvelopeSimple size={10} weight="fill" />
                                      {email}
                                    </a>
                                  ))}
                                  {lead.social_media && Object.values(lead.social_media).some(Boolean) && (
                                    <div className="flex items-center gap-2 flex-wrap mt-0.5">
                                      {lead.social_media.facebook  && <a href={lead.social_media.facebook}  target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold text-[#1877F2] hover:opacity-70">fb</a>}
                                      {lead.social_media.instagram && <a href={lead.social_media.instagram} target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold text-[#E1306C] hover:opacity-70">ig</a>}
                                      {lead.social_media.linkedin  && <a href={lead.social_media.linkedin}  target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold text-[#0A66C2] hover:opacity-70">in</a>}
                                      {lead.social_media.twitter   && <a href={lead.social_media.twitter}   target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold text-neutral-700 hover:opacity-70">𝕏</a>}
                                      {lead.social_media.youtube   && <a href={lead.social_media.youtube}   target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold text-[#FF0000] hover:opacity-70">yt</a>}
                                      {lead.social_media.tiktok    && <a href={lead.social_media.tiktok}    target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold text-neutral-900 hover:opacity-70">tt</a>}
                                    </div>
                                  )}
                                  {!lead.emails?.length && !Object.values(lead.social_media ?? {}).some(Boolean) && (
                                    <span className="text-neutral-300 text-xs">—</span>
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
    </div>
  )
}
