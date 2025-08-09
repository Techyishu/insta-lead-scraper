function extractToken(raw?: string | null) {
  if (!raw) return undefined
  const trimmed = String(raw).trim()
  const urlMatch = trimmed.match(/[?&]token=([^&]+)/i)
  if (urlMatch) return decodeURIComponent(urlMatch[1])
  if (trimmed.toLowerCase().startsWith("token=")) {
    return trimmed.slice(6)
  }
  return trimmed
}

function firstNonEmpty(obj: any, keys: string[], fallback = ""): string {
  for (const k of keys) {
    const v = obj?.[k]
    if (typeof v === "string" && v.trim()) return v
  }
  return fallback
}

export async function POST(req: Request) {
  try {
    const { who, location, token } = (await req.json()) as {
      who?: string
      location?: string
      token?: string
    }

    if (!who || !location) {
      return new Response("Missing required fields: who, location", { status: 400 })
    }

    const provided = extractToken(token)
    const apiToken = provided || extractToken(process.env.APIFY_API_TOKEN || "")
    if (!apiToken) {
      return new Response(
        "Missing API token. Provide a token in the request or set APIFY_API_TOKEN as an environment variable.",
        { status: 400 },
      )
    }

    const searchQuery = `site:instagram.com ${String(who).trim()} ${String(location).trim()}`

    // Use the dataset-items endpoint
    const endpoint =
      "https://api.apify.com/v2/acts/apify~google-search-scraper/run-sync-get-dataset-items?token=" +
      encodeURIComponent(apiToken)

    const payload = {
      focusOnPaidAds: false,
      forceExactMatch: false,
      includeIcons: false,
      includeUnfilteredResults: false,
      maxPagesPerQuery: 1,
      mobileResults: false,
      queries: searchQuery, // actor expects a string
      resultsPerPage: 100,
      saveHtml: false,
      saveHtmlToKeyValueStore: true,
    }

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Apify-Token": apiToken,
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => "")
      if (res.status === 401) {
        return new Response("Apify request failed (401). Token missing or invalid. Verify your token and try again.", {
          status: 401,
        })
      }
      if (res.status === 400) {
        return new Response(errText || "Apify request failed (400). Invalid input.", { status: 400 })
      }
      return new Response(`Apify request failed (${res.status}). ${errText || "See Apify actor logs for details."}`, {
        status: 502,
      })
    }

    // Robust parsing: JSON array, object wrapper, or NDJSON
    const contentType = res.headers.get("content-type") || ""
    let parsed: any = null
    let text: string | null = null
    try {
      if (contentType.includes("application/json")) {
        parsed = await res.json()
      } else {
        text = await res.text()
      }
    } catch {
      text = await res.text().catch(() => null)
    }

    if (text && !parsed) {
      // Try JSON, then NDJSON
      try {
        parsed = JSON.parse(text)
      } catch {
        const lines = text
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter((l) => l.length > 0)
        try {
          parsed = lines.map((l) => JSON.parse(l))
        } catch {
          parsed = []
        }
      }
    }

    let items: any[] = []
    if (Array.isArray(parsed)) {
      items = parsed
    } else if (Array.isArray(parsed?.items)) {
      items = parsed.items
    } else if (Array.isArray(parsed?.data?.items)) {
      items = parsed.data.items
    } else if (Array.isArray(parsed?.organicResults)) {
      items = parsed.organicResults
    } else if (parsed && typeof parsed === "object") {
      // Sometimes the actor returns an array under an unknown key, or a single object whose organicResults we need
      const maybeArrayKey = Object.keys(parsed).find((k) => Array.isArray((parsed as any)[k]))
      if (maybeArrayKey) items = (parsed as any)[maybeArrayKey]
    }

    // Some variants return an array with one object that has organicResults
    if (items.length === 1 && Array.isArray(items[0]?.organicResults)) {
      items = items[0].organicResults
    }

    const results = (items as any[])
      .map((it) => {
        const title = firstNonEmpty(it, ["title", "pageTitle", "heading", "name"])
        const url = firstNonEmpty(it, ["url", "link", "finalUrl", "pageUrl", "resultUrl", "destinationUrl"])
        const description = firstNonEmpty(it, ["snippet", "description", "text", "content", "metaDescription"])
        return { title, url, description }
      })
      .filter((r) => r.title && r.url)

    return Response.json({ query: searchQuery, results })
  } catch (err: any) {
    return new Response("Unexpected error: " + (err?.message || "Unknown error"), { status: 500 })
  }
}
