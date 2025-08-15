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
    const { who, location, limit = 50, enrichProfiles = false, page = 1 } = (await req.json()) as {
      who?: string
      location?: string
      limit?: number
      enrichProfiles?: boolean
      page?: number
    }

    if (!who || !location) {
      return new Response("Missing required fields: who, location", { status: 400 })
    }

    // Validate and clamp limit between 1 and 200
    const validatedLimit = Math.min(Math.max(parseInt(String(limit)) || 50, 1), 200)
    const validatedPage = Math.max(parseInt(String(page)) || 1, 1)

    const apiToken = extractToken(process.env.APIFY_API_TOKEN || "")
    if (!apiToken) {
      return new Response(
        "API token not configured. Please set APIFY_API_TOKEN environment variable.",
        { status: 500 },
      )
    }

    const searchQuery = `site:instagram.com ${String(who).trim()} ${String(location).trim()}`

    // Use the dataset-items endpoint
    const endpoint =
      "https://api.apify.com/v2/acts/apify~google-search-scraper/run-sync-get-dataset-items?token=" +
      encodeURIComponent(apiToken)

    // Calculate pagination parameters for Google Search
    const maxResultsPerPage = 100
    const effectiveResultsPerPage = Math.min(validatedLimit, maxResultsPerPage)
    
    // For proper pagination, we need to fetch enough pages to cover the requested page
    // Google returns 10-100 results per page, so we calculate how many pages we need
    const totalResultsNeeded = validatedPage * effectiveResultsPerPage
    const googlePagesNeeded = Math.ceil(totalResultsNeeded / 100)
    const maxPages = Math.min(10, googlePagesNeeded)

    console.log('Pagination calculation:', {
      validatedPage,
      effectiveResultsPerPage,
      totalResultsNeeded,
      googlePagesNeeded,
      maxPages
    })

    const payload = {
      focusOnPaidAds: false,
      forceExactMatch: false,
      includeIcons: false,
      includeUnfilteredResults: false,
      maxPagesPerQuery: maxPages, // Get enough Google pages to support our pagination
      mobileResults: false,
      queries: searchQuery, // actor expects a string
      resultsPerPage: 100, // Always get max results per Google page
      saveHtml: false,
      saveHtmlToKeyValueStore: true,
      // Add custom data to prevent caching and ensure fresh results
      customData: `page-${validatedPage}-${Date.now()}`,
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

    // Some variants return an array with one object that has organicResults
    if (items.length === 1 && Array.isArray(items[0]?.organicResults)) {
      items = items[0].organicResults
    }

    console.log('Data parsing debug:', {
      itemsLength: items.length,
      validatedLimit,
      validatedPage,
      maxPages,
      payloadSent: JSON.stringify(payload),
      sampleItem: items[0]
    })

    // Process all results - for pagination, we return fresh results each time
    const allResults = (items as any[])
      .map((it) => {
        const title = firstNonEmpty(it, ["title", "pageTitle", "heading", "name"])
        const url = firstNonEmpty(it, ["url", "link", "finalUrl", "pageUrl", "resultUrl", "destinationUrl"])
        return { title, url }
      })
      .filter((r) => r.title && r.url)

    // For pagination: return the latest batch of results (not sliced from a larger set)
    // This ensures each page gets fresh results from Apify
    const results = allResults.slice(0, effectiveResultsPerPage)

    console.log('Results processing:', {
      totalResults: allResults.length,
      returnedResults: results.length,
      validatedLimit,
      page: validatedPage,
      maxPages,
      sampleUrls: results.slice(0, 3).map(r => r.url)
    })

    // Determine if there might be more pages
    // If we got results and haven't hit the page limit, there might be more
    const hasMorePages = (
      results.length > 0 && // We got some results
      validatedPage < 10 && // Limit to 10 pages max
      allResults.length >= effectiveResultsPerPage * 0.8 // We got a decent amount of results (80% of requested)
    )

    // Extract Instagram usernames and enrich with profile data
    if (enrichProfiles && results.length > 0) {
      const usernames: string[] = [];
      const postUrls: string[] = [];
      
      results.forEach(result => {
        if (result.url.includes('instagram.com')) {
          const username = extractInstagramUsername(result.url);
          if (username) {
            usernames.push(username);
          } else if (result.url.includes('/p/') || result.url.includes('/reel/')) {
            postUrls.push(result.url);
          }
        }
      });
      
      // Get profile data from Instagram
      const profiles = await scrapeInstagramProfiles(usernames, postUrls, apiToken);
      
      // Merge profile data with existing results
      const enrichedResults = results.map(result => {
        const username = extractInstagramUsername(result.url);
        const profile = profiles.find(p => p.username === username);
        
        if (profile) {
          return {
            ...result,
            username: profile.username,
            fullName: profile.fullName,
            bio: profile.biography,
            followers: profile.followersCount,
            following: profile.followsCount,
            posts: profile.postsCount,
            verified: profile.verified,
            businessAccount: profile.businessCategoryName ? true : false,
            profilePicUrl: profile.profilePicUrl,
            externalUrl: profile.externalUrl,
            contactInfo: {
              email: profile.businessEmail,
              phone: profile.businessPhoneNumber,
              address: profile.businessContactMethod
            }
          };
        }
        return result;
      });
      
      return Response.json({ 
        query: searchQuery, 
        results: enrichedResults,
        profilesFound: profiles.length,
        enriched: true,
        limit: validatedLimit,
        page: validatedPage,
        hasMorePages,
        totalBeforeLimit: allResults.length
      });
    }

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
