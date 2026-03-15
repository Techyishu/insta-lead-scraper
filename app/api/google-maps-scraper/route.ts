import { NextRequest, NextResponse } from 'next/server'

// Allow up to 5 minutes for the Apify run to complete
export const maxDuration = 300

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { locationQuery, searchStringsArray, maxCrawledPlacesPerSearch, websiteFilter } = body

    if (!locationQuery || !searchStringsArray || !Array.isArray(searchStringsArray)) {
      return NextResponse.json(
        { error: 'Missing required parameters: locationQuery and searchStringsArray' },
        { status: 400 }
      )
    }

    const token = process.env.APIFY_API_TOKEN
    if (!token) {
      return NextResponse.json({ error: 'APIFY_API_TOKEN is not configured' }, { status: 500 })
    }

    // Map frontend filter value to Apify website parameter
    const websiteParam =
      websiteFilter === 'with' ? 'withWebsite' :
      websiteFilter === 'without' ? 'withoutWebsite' :
      'allPlaces'

    const apifyInput = {
      includeWebResults: false,
      language: "en",
      locationQuery: locationQuery,
      maxCrawledPlacesPerSearch: maxCrawledPlacesPerSearch || 50,
      maxImages: 0,
      maximumLeadsEnrichmentRecords: 0,
      scrapeContacts: true,
      scrapeDirectories: false,
      scrapeImageAuthors: false,
      scrapePlaceDetailPage: true,
      scrapeReviewsPersonalData: false,
      scrapeTableReservationProvider: false,
      searchMatching: "all",
      searchStringsArray: searchStringsArray,
      skipClosedPlaces: false,
      website: websiteParam,
    }

    const apifyUrl = `https://api.apify.com/v2/acts/compass~crawler-google-places/run-sync-get-dataset-items?token=${token}`

    const response = await fetch(apifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(apifyInput),
      // @ts-ignore — Node fetch signal for timeout
      signal: AbortSignal.timeout(280_000), // 280 seconds
    })

    if (!response.ok) {
      const errText = await response.text().catch(() => '')
      throw new Error(`Apify API error: ${response.status} ${response.statusText} — ${errText}`)
    }

    const raw = await response.json()

    // Apify returns a plain array from run-sync-get-dataset-items
    // but guard against unexpected shapes
    let items: any[] = []
    if (Array.isArray(raw)) {
      items = raw
    } else if (Array.isArray(raw?.items)) {
      items = raw.items
    } else if (Array.isArray(raw?.data)) {
      items = raw.data
    }

    if (items.length > 0) {
      // Log the first item so you can inspect actual field names in server logs
      console.log('[google-maps-scraper] sample item keys:', Object.keys(items[0]))
      console.log('[google-maps-scraper] sample item:', JSON.stringify(items[0], null, 2))
    } else {
      console.warn('[google-maps-scraper] Apify returned 0 items. Raw response type:', typeof raw, Array.isArray(raw) ? 'array' : 'not-array')
    }

    const leads = items.map((item: any) => ({
      title:
        item.title ?? item.name ?? item.placeName ?? 'N/A',
      address:
        item.address ?? item.fullAddress ?? item.street ?? item.location?.address ?? 'N/A',
      phone:
        item.phone ?? item.phoneUnformatted ?? item.phoneNumber ?? item.contact?.phone ?? null,
      website:
        item.website ?? item.url ?? null,
      rating:
        item.totalScore ?? item.rating ?? item.score ?? null,
      reviewsCount:
        item.reviewsCount ?? item.totalReviews ?? item.numberOfReviews ?? null,
      category:
        item.categoryName ?? item.category ?? item.categories?.[0] ?? searchStringsArray[0] ?? null,
    }))

    return NextResponse.json({
      success: true,
      leads,
      total: leads.length,
      location: locationQuery,
      category: searchStringsArray[0],
    })

  } catch (error) {
    console.error('[google-maps-scraper] error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to scrape Google Maps data',
        success: false,
      },
      { status: 500 }
    )
  }
}
