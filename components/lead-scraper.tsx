"use client"

import type React from "react"

import { useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Search, Upload, Download } from "lucide-react"

// Countries & Cities with High Potential for $500 Website Clients
const COUNTRIES_CITIES = {
  "United States": [
    "Boise, Idaho",
    "Des Moines, Iowa", 
    "Tulsa, Oklahoma",
    "Chattanooga, Tennessee",
    "Spokane, Washington",
    "Little Rock, Arkansas"
  ],
  "United Kingdom": [
    "Leicester",
    "Nottingham",
    "Plymouth", 
    "Sunderland",
    "Wolverhampton",
    "Derby"
  ],
  "Australia": [
    "Hobart, Tasmania",
    "Townsville, Queensland",
    "Cairns, Queensland",
    "Launceston, Tasmania", 
    "Darwin, Northern Territory",
    "Rockhampton, Queensland"
  ],
  "Canada": [
    "Saskatoon, Saskatchewan",
    "Regina, Saskatchewan",
    "Kelowna, British Columbia",
    "Moncton, New Brunswick",
    "St. John's, Newfoundland and Labrador",
    "Kamloops, British Columbia"
  ],
  "New Zealand": [
    "Hamilton",
    "Tauranga",
    "Napier",
    "Hastings",
    "Nelson", 
    "Palmerston North"
  ],
  "Ireland": [
    "Limerick",
    "Galway",
    "Waterford",
    "Kilkenny",
    "Sligo",
    "Dundalk"
  ]
} as const

type ResultItem = {
  title: string
  url: string
  username?: string
  fullName?: string
  bio?: string
  followers?: number
  following?: number
  posts?: number
  verified?: boolean
  businessAccount?: boolean
  profilePicUrl?: string
  externalUrl?: string
  contactInfo?: {
    email?: string
    phone?: string
    address?: string
  }
}

export default function LeadScraper() {
  const [who, setWho] = useState("")
  const [selectedCountry, setSelectedCountry] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [searchStrategy, setSearchStrategy] = useState<"google" | "instagram">("google")
  const [limit, setLimit] = useState(50)
  const [results, setResults] = useState<ResultItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [enrichProfiles, setEnrichProfiles] = useState(false)

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const composedQuery = useMemo(() => {
    const w = who.trim()
    const l = selectedCity.trim()
    if (!w || !l) return ""
    
    if (searchStrategy === "google") {
      return `site:instagram.com ${w} ${l}`
    } else {
      return `${w} ${l}`
    }
  }, [who, selectedCity, searchStrategy])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    setResults([])

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 120000) // 2 minute timeout

      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          who,
          location: selectedCity,
          limit,
          enrichProfiles,
          strategy: searchStrategy,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!res.ok) {
        const text = await res.text()
        if (res.status === 408) {
          throw new Error(`Request timeout. Large result sets (${limit} leads) can take too long to process. Try with a smaller limit or check your network connection.`)
        }
        throw new Error(text || "Failed to fetch results")
      }

      const data = (await res.json()) as { results: ResultItem[]; query: string }
      console.log('Frontend received data:', { 
        resultsLength: data.results?.length, 
        limit,
        data: data 
      })
      setResults(data.results || [])
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError(`Request timeout after 2 minutes. Large result sets (${limit} leads) may take too long. Try with a smaller limit.`)
      } else {
        setError(err?.message || "Something went wrong while fetching results.")
      }
    } finally {
      setLoading(false)
    }
  }



  function handleImportClick() {
    fileInputRef.current?.click()
  }

  function handleDownloadCSV() {
    if (results.length === 0) return

    // Create CSV content
    const headers = enrichProfiles 
      ? ['Name/Title', 'URL', 'Username', 'Full Name', 'Followers', 'Email', 'Phone', 'Website']
      : ['Name/Title', 'URL'];
      
    const csvContent = [
      headers.join(','),
      ...results.map(result => {
        const basicData = [
          `"${result.title.replace(/"/g, '""')}"`,
          `"${result.url}"`
        ];
        
        if (enrichProfiles) {
          return [
            ...basicData,
            `"${result.username || ''}"`,
            `"${result.fullName || ''}"`,
            `"${result.followers || ''}"`,
            `"${result.contactInfo?.email || ''}"`,
            `"${result.contactInfo?.phone || ''}"`,
            `"${result.externalUrl || ''}"`
          ].join(',');
        }
        
        return basicData.join(',');
      })
    ].join('\n')

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `instagram-leads-${who.replace(/[^a-z0-9]/gi, '-')}-${selectedCity.replace(/[^a-z0-9]/gi, '-')}-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  function normalizeItems(items: any[]): ResultItem[] {
    return (items || [])
      .map((it) => {
        const title = it?.title ?? it?.pageTitle ?? it?.heading ?? it?.name ?? ""
        const url = it?.url ?? it?.link ?? it?.finalUrl ?? it?.pageUrl ?? it?.resultUrl ?? it?.destinationUrl ?? ""
        return { title, url } as ResultItem
      })
      .filter((r) => r.title && r.url)
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    try {
      const text = await file.text()
      let json: any
      try {
        json = JSON.parse(text)
      } catch {
        // attempt NDJSON
        const lines = text
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter(Boolean)
        json = lines.map((l) => JSON.parse(l))
      }
      let items: any[] = Array.isArray(json?.items)
        ? json.items
        : Array.isArray(json?.data?.items)
          ? json.data.items
          : Array.isArray(json)
            ? json
            : Array.isArray(json?.organicResults)
              ? json.organicResults
              : []

      if (items.length === 1 && Array.isArray(items[0]?.organicResults)) {
        items = items[0].organicResults
      }

      const normalized = normalizeItems(items)
      setResults(normalized)
    } catch (err: any) {
      setError("Invalid JSON file. Please provide a valid Apify dataset JSON.")
    } finally {
      // reset input so the same file can be re-selected
      e.target.value = ""
    }
  }

  const searchDisabled = !who.trim() || !selectedCity.trim()

  // Get available cities for selected country
  const availableCities = selectedCountry ? COUNTRIES_CITIES[selectedCountry as keyof typeof COUNTRIES_CITIES] || [] : []

  // Handle country change and reset city selection
  const handleCountryChange = (country: string) => {
    setSelectedCountry(country)
    setSelectedCity("") // Reset city when country changes
  }

  return (
    <div className="grid gap-4 sm:gap-6">
      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="who">Who are you looking for?</Label>
            <Input
              id="who"
              placeholder="e.g., wedding photographers"
              value={who}
              onChange={(e) => setWho(e.target.value)}
              required
              className="text-base"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="country">Country</Label>
            <Select value={selectedCountry} onValueChange={handleCountryChange}>
              <SelectTrigger id="country" className="text-base">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(COUNTRIES_CITIES).map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="city">City</Label>
            <Select 
              value={selectedCity} 
              onValueChange={setSelectedCity}
              disabled={!selectedCountry}
            >
              <SelectTrigger id="city" className="text-base">
                <SelectValue placeholder={selectedCountry ? "Select city" : "Select country first"} />
              </SelectTrigger>
              <SelectContent>
                {availableCities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="limit">Max Results</Label>
            <Input
              id="limit"
              type="number"
              min="1"
              max="200"
              placeholder="50"
              value={limit}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 1
                setLimit(Math.min(Math.max(value, 1), 200))
              }}
              className="text-base"
            />
            <p className="text-xs text-muted-foreground">
              Maximum 200 results
              {limit > 100 && (
                <span className="block text-orange-600 mt-1">
                  ⚠️ Large limits (100+) may take longer and could timeout
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="grid gap-3">
            <Label className="text-sm font-medium">Search Strategy</Label>
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <input
                  id="google-strategy"
                  type="radio"
                  name="searchStrategy"
                  value="google"
                  checked={searchStrategy === "google"}
                  onChange={(e) => setSearchStrategy(e.target.value as "google" | "instagram")}
                  className="h-4 w-4"
                />
                <Label htmlFor="google-strategy" className="text-sm cursor-pointer">
                  Google Search (site:instagram.com)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  id="instagram-strategy"
                  type="radio"
                  name="searchStrategy"
                  value="instagram"
                  checked={searchStrategy === "instagram"}
                  onChange={(e) => setSearchStrategy(e.target.value as "google" | "instagram")}
                  className="h-4 w-4"
                />
                <Label htmlFor="instagram-strategy" className="text-sm cursor-pointer">
                  Direct Instagram Search
                </Label>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {searchStrategy === "google" 
                ? "Search Google for Instagram profiles (more comprehensive but may include older results)"
                : "Search directly for Instagram users by keywords (faster, more recent profiles)"
              }
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-2 p-3 bg-muted/30 rounded-lg border">
          <input
            id="enrichProfiles"
            type="checkbox"
            checked={enrichProfiles}
            onChange={(e) => setEnrichProfiles(e.target.checked)}
            className="h-4 w-4 mt-0.5 flex-shrink-0"
          />
          <div className="space-y-1">
            <Label htmlFor="enrichProfiles" className="text-sm font-medium cursor-pointer">
              Enrich with Instagram profile data
            </Label>
            <p className="text-xs text-muted-foreground">
              Get detailed profiles including follower counts, contact info, and websites
            </p>
          </div>
        </div>

        {composedQuery && (
          <div className="text-xs sm:text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg border">
            <div className="font-medium mb-1">
              {searchStrategy === "google" ? "Google Search Query:" : "Instagram Keywords:"}
            </div>
            <code className="text-xs break-all">{composedQuery}</code>
            <div className="text-xs mt-1 opacity-75">
              {searchStrategy === "google" 
                ? "Searching Google for Instagram profiles"
                : "Searching for Instagram users"
              }
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:gap-3 sm:items-center">
          <Button type="submit" disabled={loading || searchDisabled} className="w-full sm:w-auto flex-shrink-0">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
            {loading ? 'Searching...' : 'Search Leads'}
          </Button>

          <div className="flex flex-col gap-2 sm:flex-row sm:gap-2 w-full sm:w-auto">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleImportClick}
              className="w-full sm:w-auto bg-transparent"
              title="Import Apify results JSON"
            >
              <Upload className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Import Results JSON</span>
              <span className="sm:hidden">Import JSON</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleDownloadCSV}
              disabled={results.length === 0}
              className="w-full sm:w-auto bg-transparent"
              title="Download leads as CSV"
            >
              <Download className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Download CSV</span>
              <span className="sm:hidden">Download</span>
            </Button>
          </div>
        </div>
      </form>

      {loading && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertTitle>Loading...</AlertTitle>
          <AlertDescription>Fetching results from Apify. This may take a few seconds.</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" role="alert">
          <AlertTitle>Request failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="border-border/60">
        <CardContent className="p-0">
          <div className="p-3 sm:p-4 border-b">
            <h2 className="text-base sm:text-lg font-medium">Results</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {searchStrategy === "google" 
                ? "Showing Google results filtered to Instagram." 
                : "Showing Instagram users found by keyword search."
              }
              {enrichProfiles && " Profile data enriched when available."}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                Total: {results.length}
              </span>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                Limit: {limit}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                searchStrategy === "google" 
                  ? "text-blue-600 bg-blue-50" 
                  : "text-purple-600 bg-purple-50"
              }`}>
                {searchStrategy === "google" ? "🔍 Google Search" : "📸 Instagram Search"}
              </span>
              {enrichProfiles && (
                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  ✓ Profile enrichment enabled
                </span>
              )}
            </div>
          </div>
          
          {/* Mobile/Tablet Card Layout */}
          <div className="block xl:hidden">
            <div className="max-h-[70vh] overflow-y-auto">
              {results.length === 0 && !loading ? (
                <div className="p-6 text-center text-muted-foreground">
                  <div className="text-sm">No results yet.</div>
                  <div className="text-xs mt-1">Try a search above or import a results JSON file.</div>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {results.map((r, idx) => (
                    <div key={`${r.url}-${idx}`} className="p-3 sm:p-4 space-y-3">
                      <div className="space-y-1">
                        <div className="font-medium text-sm leading-tight break-words">
                          {r.title}
                        </div>
                        {r.fullName && r.fullName !== r.title && (
                          <div className="text-xs text-muted-foreground">{r.fullName}</div>
                        )}
                        <div className="text-xs">
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground underline underline-offset-2 break-all hover:text-foreground"
                          >
                            {r.url}
                          </a>
                        </div>
                      </div>
                      {enrichProfiles && (
                        <div className="space-y-2 pt-2 border-t border-muted">
                          {r.username && (
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <span className="font-medium">@{r.username}</span>
                              {r.verified && <span className="text-blue-500">✓</span>}
                              {r.followers && (
                                <span className="text-muted-foreground bg-muted px-2 py-1 rounded-full">
                                  {r.followers.toLocaleString()} followers
                                </span>
                              )}
                            </div>
                          )}
                          
                          {(r.contactInfo?.email || r.contactInfo?.phone) && (
                            <div className="space-y-1">
                              <div className="text-xs font-medium text-muted-foreground">Contact:</div>
                              <div className="text-xs space-y-1 pl-2">
                                {r.contactInfo.email && (
                                  <div className="flex items-center gap-1">
                                    <span>📧</span>
                                    <a href={`mailto:${r.contactInfo.email}`} className="underline break-all">
                                      {r.contactInfo.email}
                                    </a>
                                  </div>
                                )}
                                {r.contactInfo.phone && (
                                  <div className="flex items-center gap-1">
                                    <span>📞</span>
                                    <a href={`tel:${r.contactInfo.phone}`} className="underline">
                                      {r.contactInfo.phone}
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {r.externalUrl && (
                            <div className="space-y-1">
                              <div className="text-xs font-medium text-muted-foreground">Website:</div>
                              <div className="text-xs pl-2">
                                <div className="flex items-center gap-1">
                                  <span>🌐</span>
                                  <a href={r.externalUrl} target="_blank" className="underline break-all hover:text-foreground">
                                    {r.externalUrl}
                                  </a>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Desktop Table Layout */}
          <div className="hidden xl:block">
            <div className="max-h-[70vh] overflow-y-auto">
              <Table className="relative w-full table-fixed">
                  <TableHeader className="sticky top-0 bg-background z-10">
                    <TableRow>
                      <TableHead className="w-1/4">Name/Title</TableHead>
                      <TableHead className="w-1/4">URL</TableHead>
                      {enrichProfiles && (
                        <>
                          <TableHead className="w-1/8">Username</TableHead>
                          <TableHead className="w-1/12 text-center">Followers</TableHead>
                          <TableHead className="w-1/6">Contact</TableHead>
                          <TableHead className="w-1/6">Website</TableHead>
                        </>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.length === 0 && !loading ? (
                      <TableRow>
                        <TableCell colSpan={enrichProfiles ? 6 : 2} className="text-center text-muted-foreground py-8">
                          <div className="text-sm">No results yet.</div>
                          <div className="text-xs mt-1">Try a search above or import a results JSON file.</div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      results.map((r, idx) => (
                        <TableRow key={`${r.url}-${idx}`} className="hover:bg-muted/50">
                          <TableCell className="align-top py-3">
                            <div className="space-y-1 overflow-hidden">
                              <div className="font-medium text-sm leading-tight truncate" title={r.title}>{r.title}</div>
                              {r.fullName && r.fullName !== r.title && (
                                <div className="text-xs text-muted-foreground truncate" title={r.fullName}>{r.fullName}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="align-top py-3">
                            <a
                              href={r.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-foreground underline underline-offset-2 hover:text-primary block truncate"
                              title={r.url}
                            >
                              {r.url}
                            </a>
                          </TableCell>
                          {enrichProfiles && (
                            <>
                              <TableCell className="align-top py-3">
                                {r.username && (
                                  <div className="flex items-center gap-1 text-sm overflow-hidden">
                                    <span className="font-medium truncate" title={`@${r.username}`}>@{r.username}</span>
                                    {r.verified && <span className="text-blue-500 text-xs flex-shrink-0">✓</span>}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell className="align-top py-3 text-center">
                                {r.followers && (
                                  <div className="text-xs font-medium">
                                    {r.followers >= 1000000 ? 
                                      `${(r.followers / 1000000).toFixed(1)}M` :
                                      r.followers >= 1000 ?
                                      `${(r.followers / 1000).toFixed(1)}K` :
                                      r.followers.toLocaleString()
                                    }
                                  </div>
                                )}
                              </TableCell>
                              <TableCell className="align-top py-3">
                                {r.contactInfo && (
                                  <div className="text-xs space-y-1 overflow-hidden">
                                    {r.contactInfo.email && (
                                      <div className="flex items-center gap-1 min-w-0">
                                        <span className="flex-shrink-0">📧</span>
                                        <a href={`mailto:${r.contactInfo.email}`} className="underline hover:text-primary truncate" title={r.contactInfo.email}>
                                          {r.contactInfo.email}
                                        </a>
                                      </div>
                                    )}
                                    {r.contactInfo.phone && (
                                      <div className="flex items-center gap-1">
                                        <span className="flex-shrink-0">📞</span>
                                        <a href={`tel:${r.contactInfo.phone}`} className="underline hover:text-primary" title={r.contactInfo.phone}>
                                          {r.contactInfo.phone}
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell className="align-top py-3">
                                {r.externalUrl && (
                                  <a href={r.externalUrl} target="_blank" className="text-xs underline hover:text-primary block truncate" title={r.externalUrl}>
                                    {r.externalUrl}
                                  </a>
                                )}
                              </TableCell>
                            </>
                          )}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
