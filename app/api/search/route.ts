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

function extractInstagramUsername(url: string): string | null {
  const patterns = [
    /instagram\.com\/([^\/\?]+)/,
    /instagram\.com\/p\/([^\/]+)/,
    /instagram\.com\/reel\/([^\/]+)/,
    /instagram\.com\/stories\/([^\/]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      // For posts/reels, we need to get the username differently
      if (url.includes('/p/') || url.includes('/reel/')) {
        return null; // We'll handle this with post scraper
      }
      return match[1];
    }
  }
  return null;
}



async function scrapeInstagramProfiles(usernames: string[], postUrls: string[], apiToken: string) {
  const profiles: any[] = [];
  
  // First, scrape profiles for direct username links
  if (usernames.length > 0) {
    const profileEndpoint = "https://api.apify.com/v2/acts/apify~instagram-profile-scraper/run-sync-get-dataset-items";
    
    const profilePayload = {
      usernames: usernames,
      resultsLimit: usernames.length,
      addParentData: false
    };
    
    try {
      const profileRes = await fetch(`${profileEndpoint}?token=${encodeURIComponent(apiToken)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profilePayload)
      });
      
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        profiles.push(...profileData);
      }
    } catch (error) {
      console.error('Profile scraping error:', error);
    }
  }
  
  // Then, scrape posts/reels to get usernames and profile info
  if (postUrls.length > 0) {
    const postEndpoint = "https://api.apify.com/v2/acts/apify~instagram-post-scraper/run-sync-get-dataset-items";
    
    const postPayload = {
      directUrls: postUrls.slice(0, 50), // Limit to avoid timeouts
      resultsType: "posts",
      resultsLimit: 50,
      addParentData: true
    };
    
    try {
      const postRes = await fetch(`${postEndpoint}?token=${encodeURIComponent(apiToken)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postPayload)
      });
      
      if (postRes.ok) {
        const postData = await postRes.json();
        
        // Extract unique usernames from posts
        const postUsernames = [...new Set(postData.map((post: any) => post.ownerUsername).filter(Boolean))];
        
        // Now get full profile data for these usernames
        if (postUsernames.length > 0) {
          const profileEndpoint = "https://api.apify.com/v2/acts/apify~instagram-profile-scraper/run-sync-get-dataset-items";
          const additionalProfileRes = await fetch(`${profileEndpoint}?token=${encodeURIComponent(apiToken)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              usernames: postUsernames,
              resultsLimit: postUsernames.length,
              addParentData: false
            })
          });
          
          if (additionalProfileRes.ok) {
            const additionalProfiles = await additionalProfileRes.json();
            profiles.push(...additionalProfiles);
          }
        }
      }
    } catch (error) {
      console.error('Post scraping error:', error);
    }
  }
  
  return profiles;
}



export async function POST(req: Request) {
  try {
    const { who, location, limit = 50, enrichProfiles = false, page = 1, pagesToScrape = 1 } = (await req.json()) as {
      who?: string
      location?: string
      limit?: number
      enrichProfiles?: boolean
      page?: number
      pagesToScrape?: number
    }

    if (!who || !location) {
      return new Response("Missing required fields: who, location", { status: 400 })
    }

    // Validate and clamp limit between 100 and 300
    const validatedLimit = Math.min(Math.max(parseInt(String(limit)) || 300, 100), 300)
    const validatedPage = Math.max(parseInt(String(page)) || 1, 1)
    const validatedPagesToScrape = Math.min(Math.max(parseInt(String(pagesToScrape)) || 1, 1), 3)

    const apiToken = process.env.APIFY_TOKEN_INSTAGRAM
    if (!apiToken) {
      return new Response(
        "APIFY_TOKEN_INSTAGRAM is not configured.",
        { status: 500 },
      )
    }

    const searchQuery = `site:instagram.com ${String(who).trim()} ${String(location).trim()}`

    const googleSearchToken = process.env.APIFY_TOKEN_GOOGLE_SEARCH
    if (!googleSearchToken) {
      return new Response("APIFY_TOKEN_GOOGLE_SEARCH is not configured.", { status: 500 })
    }
    // Use the dataset-items endpoint with API key
    const endpoint = `https://api.apify.com/v2/acts/apify~google-search-scraper/run-sync-get-dataset-items?token=${googleSearchToken}`

    // Calculate pagination parameters for Google Search
    const maxResultsPerPage = 100
    
    // For multi-page scraping, we fetch multiple pages to get more results
    const maxPages = Math.min(10, validatedPagesToScrape)
    const resultsPerGooglePage = 100 // Always get max results per Google page

    console.log('Multi-page scraping calculation:', {
      validatedPage,
      validatedLimit,
      validatedPagesToScrape,
      maxPages,
      resultsPerGooglePage
    })

    const payload = {
      focusOnPaidAds: false,
      forceExactMatch: false,
      includeIcons: false,
      includeUnfilteredResults: false,
      maxPagesPerQuery: maxPages, // Scrape multiple pages for more results
      mobileResults: false,
      queries: searchQuery, // actor expects a string
      resultsPerPage: resultsPerGooglePage, // Always get max results per Google page
      saveHtml: false,
      saveHtmlToKeyValueStore: true,
      // Add custom data to prevent caching and ensure fresh results
      customData: `pages-${validatedPagesToScrape}-limit-${validatedLimit}-${Date.now()}`,
    }

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => "")
      console.error('Apify request failed:', {
        status: res.status,
        statusText: res.statusText,
        error: errText,
        payload: JSON.stringify(payload),
        limit: validatedLimit
      })
      
      if (res.status === 401) {
        return new Response("Apify request failed (401). Token missing or invalid. Verify your token and try again.", {
          status: 401,
        })
      }
      if (res.status === 400) {
        return new Response(errText || "Apify request failed (400). Invalid input.", { status: 400 })
      }
      if (res.status === 408 || res.status === 504) {
        return new Response(`Request timeout. Try with a smaller limit (current: ${validatedLimit}). Large requests may take too long to process.`, {
          status: 408,
        })
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

    // Extract organicResults from each page response
    let allOrganicResults: any[] = []
    if (Array.isArray(items)) {
      items.forEach(pageResult => {
        if (Array.isArray(pageResult?.organicResults)) {
          allOrganicResults = allOrganicResults.concat(pageResult.organicResults)
        }
      })
    }
    
    // Use the extracted organic results
    items = allOrganicResults

    console.log('Data parsing debug:', {
      itemsLength: items.length,
      validatedLimit,
      validatedPage,
      maxPages,
      payloadSent: JSON.stringify(payload),
      sampleItem: items[0]
    })

    // Process all results from multiple pages
    const mappedResults = (items as any[])
      .map((it) => {
        const title = firstNonEmpty(it, ["title", "pageTitle", "heading", "name"])
        const url = firstNonEmpty(it, ["url", "link", "finalUrl", "pageUrl", "resultUrl", "destinationUrl"])
        return { title, url, originalItem: it }
      })
    
    console.log('URL filtering debug:', {
      totalMappedResults: mappedResults.length,
      sampleUrls: mappedResults.slice(0, 10).map(r => ({ title: r.title, url: r.url })),
      instagramUrls: mappedResults.filter(r => r.url && r.url.includes('instagram.com')).length,
      withTitleAndUrl: mappedResults.filter(r => r.title && r.url).length,
      allFilters: mappedResults.filter(r => r.title && r.url && r.url.includes('instagram.com')).length
    })
    
    const allResults = mappedResults
      .filter((r) => r.title && r.url && r.url.includes('instagram.com'))
      .map(r => ({ title: r.title, url: r.url }))

    // Remove duplicates based on URL
    const uniqueResults = allResults.filter((result, index, self) => 
      index === self.findIndex(r => r.url === result.url)
    )
    
    console.log('Duplicate filtering debug:', {
      beforeDedup: allResults.length,
      afterDedup: uniqueResults.length,
      duplicatesRemoved: allResults.length - uniqueResults.length
    })
    
    // For multi-page scraping: return up to the requested limit from all scraped pages
    const results = uniqueResults.slice(0, validatedLimit);

    console.log('Results processing:', {
      totalResults: allResults.length,
      returnedResults: results.length,
      validatedLimit,
      page: validatedPage,
      maxPages,
      sampleUrls: results.slice(0, 3).map(r => r.url)
    })

    // Determine if there might be more pages available
    // For multi-page scraping, we consider there are more pages if we got a good amount of results
    const hasMorePages = (
      results.length > 0 && // We got some results
      validatedPagesToScrape < 10 && // Haven't hit max page limit
      allResults.length >= (validatedPagesToScrape * resultsPerGooglePage * 0.7) // Got decent results (70% of expected)
    )

    // Simple response without Instagram profile enrichment

    return Response.json({ 
      query: searchQuery, 
      results,
      limit: validatedLimit,
      page: validatedPage,
      hasMorePages,
      totalBeforeLimit: allResults.length
    })
  } catch (err: any) {
    return new Response("Unexpected error: " + (err?.message || "Unknown error"), { status: 500 })
  }
}
