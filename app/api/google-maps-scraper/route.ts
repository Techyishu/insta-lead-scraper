import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { locationQuery, searchStringsArray, maxCrawledPlacesPerSearch } = body

    if (!locationQuery || !searchStringsArray || !Array.isArray(searchStringsArray)) {
      return NextResponse.json(
        { error: 'Missing required parameters: locationQuery and searchStringsArray' },
        { status: 400 }
      )
    }

    // Prepare the input for Apify API based on your provided example
    const apifyInput = {
      includeWebResults: false,
      language: "en",
      locationQuery: locationQuery,
      maxCrawledPlacesPerSearch: maxCrawledPlacesPerSearch || 50,
      maxImages: 0,
      maximumLeadsEnrichmentRecords: 0,
      scrapeContacts: true, // Enable to get phone numbers
      scrapeDirectories: false,
      scrapeImageAuthors: false,
      scrapePlaceDetailPage: true, // Enable to get more details
      scrapeReviewsPersonalData: false,
      scrapeTableReservationProvider: false,
      searchMatching: "only_includes",
      searchStringsArray: searchStringsArray,
      skipClosedPlaces: false,
      website: "withoutWebsite"
    }

    // Make request to Apify API
    const token = process.env.APIFY_TOKEN_GOOGLE_MAPS
    if (!token) {
      return NextResponse.json({ error: 'APIFY_TOKEN_GOOGLE_MAPS is not configured' }, { status: 500 })
    }
    const apifyUrl = `https://api.apify.com/v2/acts/compass~crawler-google-places/run-sync-get-dataset-items?token=${token}`
    const response = await fetch(apifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apifyInput),
    })

    if (!response.ok) {
      throw new Error(`Apify API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // Transform the data to match our component's expected format
    const leads = data.map((item: any) => ({
      title: item.title || item.name || 'N/A',
      address: item.address || item.location?.address || 'N/A',
      phone: item.phone || item.phoneNumber || item.contact?.phone || null,
      website: item.website || item.url || null,
      rating: item.rating || item.totalScore || null,
      reviewsCount: item.reviewsCount || item.totalReviews || null,
      category: item.category || item.categoryName || searchStringsArray[0] || null
    }))

    return NextResponse.json({
      success: true,
      leads: leads,
      total: leads.length,
      location: locationQuery,
      category: searchStringsArray[0]
    })

  } catch (error) {
    console.error('Google Maps scraper error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to scrape Google Maps data',
        success: false 
      },
      { status: 500 }
    )
  }
}
