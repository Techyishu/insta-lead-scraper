"use client"

import type React from "react"

import { useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Search, Upload, ShieldCheck, ShieldAlert, Info } from "lucide-react"

type ResultItem = {
  title: string
  url: string
  description: string
}

type Props = {
  envHasToken?: boolean
}

function extractToken(raw?: string): string | undefined {
  if (!raw) return undefined
  const trimmed = raw.trim()
  const urlMatch = trimmed.match(/[?&]token=([^&]+)/i)
  if (urlMatch) return decodeURIComponent(urlMatch[1])
  if (trimmed.toLowerCase().startsWith("token=")) {
    return trimmed.slice(6)
  }
  return trimmed
}

export default function LeadScraper({ envHasToken = false }: Props) {
  const [who, setWho] = useState("")
  const [location, setLocation] = useState("")
  const [token, setToken] = useState("")
  const [results, setResults] = useState<ResultItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [verifying, setVerifying] = useState(false)
  const [tokenValid, setTokenValid] = useState<null | boolean>(null)
  const [tokenMessage, setTokenMessage] = useState<string>("")

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const composedQuery = useMemo(() => {
    const w = who.trim()
    const l = location.trim()
    if (!w || !l) return ""
    return `site:instagram.com ${w} ${l}`
  }, [who, location])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    setResults([])

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          who,
          location,
          token: extractToken(token),
        }),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || "Failed to fetch results")
      }

      const data = (await res.json()) as { results: ResultItem[]; query: string }
      setResults(data.results || [])
    } catch (err: any) {
      setError(err?.message || "Something went wrong while fetching results.")
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyToken() {
    setVerifying(true)
    setTokenValid(null)
    setTokenMessage("")
    setError(null)
    try {
      const res = await fetch("/api/verify-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: extractToken(token) }),
      })
      const data = await res.json()
      if (!res.ok || !data.valid) {
        setTokenValid(false)
        setTokenMessage(data.message || "Token is invalid.")
      } else {
        setTokenValid(true)
        setTokenMessage(`Token is valid${data.username ? ` (user: ${data.username})` : ""}.`)
      }
    } catch (e: any) {
      setTokenValid(false)
      setTokenMessage("Failed to verify token. Please try again.")
    } finally {
      setVerifying(false)
    }
  }

  function handleImportClick() {
    fileInputRef.current?.click()
  }

  function normalizeItems(items: any[]): ResultItem[] {
    return (items || [])
      .map((it) => {
        const title = it?.title ?? it?.pageTitle ?? it?.heading ?? it?.name ?? ""
        const url = it?.url ?? it?.link ?? it?.finalUrl ?? it?.pageUrl ?? it?.resultUrl ?? it?.destinationUrl ?? ""
        const description = it?.snippet ?? it?.description ?? it?.text ?? it?.content ?? it?.metaDescription ?? ""
        return { title, url, description } as ResultItem
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

  const searchDisabled = !who.trim() || !location.trim()

  return (
    <div className="grid gap-6">
      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="who">Who are you looking for?</Label>
            <Input
              id="who"
              placeholder="e.g., wedding photographers"
              value={who}
              onChange={(e) => setWho(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="e.g., Austin, TX"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="token">Apify API Token (optional)</Label>
          <Input
            id="token"
            type="password"
            placeholder="Paste token or URL with token=..."
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          <div className="flex gap-2 items-center">
            <Button type="button" variant="outline" onClick={handleVerifyToken} disabled={verifying}>
              {verifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Verify Token
            </Button>
            {tokenValid === true && (
              <span className="inline-flex items-center text-green-700 text-sm">
                <ShieldCheck className="mr-1 h-4 w-4" /> {tokenMessage || "Token is valid."}
              </span>
            )}
            {tokenValid === false && (
              <span className="inline-flex items-center text-red-700 text-sm">
                <ShieldAlert className="mr-1 h-4 w-4" /> {tokenMessage || "Token is invalid."}
              </span>
            )}
            {tokenValid === null && !verifying && (
              <span className="inline-flex items-center text-muted-foreground text-sm">
                <Info className="mr-1 h-4 w-4" /> Paste a token or use your server token.
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {envHasToken
              ? "A server-side APIFY_API_TOKEN is configured. If you paste a token here (or a URL with token=...), it will override the server token for this request."
              : "No server token detected. Paste your token here or set APIFY_API_TOKEN in your deployment settings."}
          </p>
        </div>

        {composedQuery && (
          <div className="text-sm text-muted-foreground">
            Query to run:
            <code className="ml-2 rounded bg-muted px-2 py-1">{composedQuery}</code>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <Button type="submit" disabled={loading || searchDisabled} className="w-full sm:w-auto">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
            Search Leads
          </Button>

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
            Import Results JSON
          </Button>
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
          <div className="p-4 border-b">
            <h2 className="text-lg font-medium">Results</h2>
            <p className="text-sm text-muted-foreground">
              Showing Google results filtered to Instagram. Each row includes the title, URL, and description.
            </p>
            <p className="text-xs text-muted-foreground mt-1">Total: {results.length}</p>
          </div>
          <div className="overflow-x-auto">
            <div className="max-h-[60vh] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    <TableHead className="min-w-[220px]">Name/Title</TableHead>
                    <TableHead className="min-w-[260px]">URL</TableHead>
                    <TableHead className="min-w-[320px]">Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.length === 0 && !loading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        No results yet. Try a search above or import a results JSON file.
                      </TableCell>
                    </TableRow>
                  ) : (
                    results.map((r, idx) => (
                      <TableRow key={`${r.url}-${idx}`}>
                        <TableCell className="align-top">
                          <span className="font-medium">{r.title}</span>
                        </TableCell>
                        <TableCell className="align-top">
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-foreground underline underline-offset-2 break-words"
                          >
                            {r.url}
                          </a>
                        </TableCell>
                        <TableCell className="align-top">
                          <p className="text-sm text-muted-foreground">{r.description}</p>
                        </TableCell>
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
