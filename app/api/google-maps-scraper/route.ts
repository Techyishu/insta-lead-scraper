import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendLowCreditsEmail } from '@/lib/resend'

export const maxDuration = 300

// ── Plan-level hard limits (server-side only — never trust the client) ────────
const PLAN_MAX_RESULTS: Record<string, number> = {
  free:    50,
  starter: 1000,
  growth:  2000,
}
const PLAN_CAN_ENRICH: Record<string, boolean> = {
  free:    false,
  starter: true,
  growth:  true,
}
// Max enriched email addresses per billing cycle (Infinity = unlimited)
const PLAN_ENRICH_EMAIL_LIMIT: Record<string, number> = {
  free:    0,
  starter: 100,
  growth:  Infinity,
}
// Absolute ceiling regardless of plan (Apify cost/timeout guard)
const ABSOLUTE_MAX = 2000

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // ── 1. Auth ───────────────────────────────────────────────────────────────
    // supabase.auth.getUser() validates the JWT with Supabase's auth server —
    // it cannot be spoofed by manipulating cookies or headers.
    const { data: authData, error: authError } = await supabase.auth.getUser()
    const user = authData?.user

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.', unauthorized: true },
        { status: 401 }
      )
    }

    // ── 2. Parse & sanitise body ──────────────────────────────────────────────
    let body: Record<string, unknown>
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    // Strip + coerce every field — never pass raw client values downstream
    const keyword        = typeof body.keyword  === 'string' ? body.keyword.trim().slice(0, 200)  : ''
    const location       = typeof body.location === 'string' ? body.location.trim().slice(0, 200) : ''
    const rawMax         = parseInt(String(body.maxResults ?? '50'), 10)
    const clientMax      = Number.isFinite(rawMax) && rawMax > 0 ? rawMax : 50
    const enrichContacts = body.enrichContacts === true  // must be exactly boolean true

    // Whitelist filter values — reject anything outside the allowed set
    const ALLOWED_FILTERS = ['any', 'with', 'without'] as const
    type FilterVal = typeof ALLOWED_FILTERS[number]
    const parseFilter = (v: unknown): FilterVal =>
      (ALLOWED_FILTERS as readonly string[]).includes(v as string) ? v as FilterVal : 'any'
    const phoneFilter   = parseFilter(body.phoneFilter)
    const websiteFilter = parseFilter(body.websiteFilter)

    if (!keyword || !location) {
      return NextResponse.json(
        { error: 'Missing required parameters: location and keyword' },
        { status: 400 }
      )
    }

    // ── 3. Load or create user profile ────────────────────────────────────────
    let { data: profile } = await supabase
      .from('user_profiles')
      .select('credits_used, credits_limit, plan, enrichment_emails_used')
      .eq('id', user.id)
      .single()

    if (!profile) {
      console.warn('[leadmapper] profile not found for', user.id, '— creating default')
      await supabase.from('user_profiles').upsert(
        {
          id: user.id,
          full_name: (user.user_metadata?.full_name as string) ?? null,
          credits_used: 0,
          credits_limit: 50,
          plan: 'free',
        },
        { onConflict: 'id' }
      )
      const { data: fresh } = await supabase
        .from('user_profiles')
        .select('credits_used, credits_limit, plan, enrichment_emails_used')
        .eq('id', user.id)
        .single()
      profile = fresh
    }

    const creditsUsed  = profile?.credits_used  ?? 0
    const creditsLimit = profile?.credits_limit ?? 50
    // Normalise plan to a known key — unknown plans fall back to 'free' limits
    const rawPlan = (profile?.plan ?? 'free').toLowerCase()
    const plan    = rawPlan in PLAN_MAX_RESULTS ? rawPlan : 'free'

    const creditsRemaining = Math.max(creditsLimit - creditsUsed, 0)

    // ── 4. Plan-based limits (server-enforced, un-bypassable) ────────────────
    // All limits come entirely from the DB — client values are only hints.
    const planMaxResults = PLAN_MAX_RESULTS[plan]
    const canEnrich      = PLAN_CAN_ENRICH[plan]
    // Phone + website filters: Starter & Growth only; free always gets 'any'
    const FILTER_PLANS      = ['starter', 'growth']
    const canFilter         = FILTER_PLANS.includes(plan)
    const effectivePhone    = canFilter ? phoneFilter    : 'any'
    const effectiveWebsite  = canFilter ? websiteFilter  : 'any'
    if ((phoneFilter !== 'any' || websiteFilter !== 'any') && !canFilter) {
      console.warn('[leadmapper] filters blocked — plan:', plan)
    }

    // ── 5. Credit gate ────────────────────────────────────────────────────────
    if (creditsRemaining <= 0) {
      return NextResponse.json(
        {
          error: 'No credits remaining. Upgrade your plan to keep searching.',
          noCredits: true,
          creditsUsed,
          creditsLimit,
          creditsRemaining: 0,
          planMaxResults,
        },
        { status: 402 }
      )
    }

    // Final cap: min(clientRequest, planMax, absoluteMax, creditsRemaining)
    const effectiveMax = Math.min(clientMax, planMaxResults, ABSOLUTE_MAX, creditsRemaining)

    // ── 6. Enrichment gate (server-enforced) ──────────────────────────────────
    const enrichEmailLimit     = PLAN_ENRICH_EMAIL_LIMIT[plan] ?? 0
    const enrichEmailsUsed     = profile?.enrichment_emails_used ?? 0
    const enrichEmailRemaining = enrichEmailLimit === Infinity
      ? Infinity
      : Math.max(enrichEmailLimit - enrichEmailsUsed, 0)

    const effectiveEnrich = enrichContacts && canEnrich && enrichEmailRemaining > 0
    if (enrichContacts && !canEnrich) {
      console.warn('[leadmapper] enrichContacts blocked — plan:', plan)
    }
    if (enrichContacts && canEnrich && enrichEmailRemaining <= 0) {
      console.warn('[leadmapper] enrichment email quota exhausted — plan:', plan, 'used:', enrichEmailsUsed)
    }

    // ── 7. Apify ──────────────────────────────────────────────────────────────
    const token = process.env.APIFY_API_TOKEN
    if (!token) {
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
    }

    // ── Apify input — compass~crawler-google-places correct schema ───────────
    // searchStringsArray = keyword only; locationQuery = location separately
    // website field: actor-native filter (applied before counting results)
    const websiteParam =
      effectiveWebsite === 'with'    ? 'withWebsite'    :
      effectiveWebsite === 'without' ? 'withoutWebsite' :
      'allPlaces'

    const apifyInput: Record<string, unknown> = {
      searchStringsArray:              [keyword],
      locationQuery:                   location,
      maxCrawledPlacesPerSearch:       effectiveMax,
      language:                        'en',
      maxImages:                       0,
      website:                         websiteParam,
      skipClosedPlaces:                true,
      includeWebResults:               false,
      scrapeContacts:                  effectiveEnrich,
      scrapeDirectories:               false,
      scrapeImageAuthors:              false,
      scrapeOrderOnline:               false,
      scrapePlaceDetailPage:           false,
      scrapeReviewsPersonalData:       false,
      scrapeTableReservationProvider:  false,
      // Leads Enrichment add-on: looks up emails from Apify's database.
      // Set to effectiveMax when enrichment is on so all results are enriched.
      maximumLeadsEnrichmentRecords:   effectiveEnrich ? effectiveMax : 0,
      verifyLeadsEnrichmentEmails:     effectiveEnrich,
    }

    console.log(
      '[leadmapper] plan=%s max=%d enrich=%s enrichRemaining=%s phone=%s website=%s(%s)',
      plan, effectiveMax, effectiveEnrich,
      enrichEmailRemaining === Infinity ? '∞' : enrichEmailRemaining,
      effectivePhone, effectiveWebsite, websiteParam
    )

    const apifyUrl =
      `https://api.apify.com/v2/acts/compass~crawler-google-places/run-sync-get-dataset-items?token=${token}`

    const apifyRes = await fetch(apifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(apifyInput),
      // @ts-ignore
      signal: AbortSignal.timeout(280_000),
    })

    if (!apifyRes.ok) {
      const errText = await apifyRes.text().catch(() => '')
      throw new Error(`Apify error ${apifyRes.status}: ${errText}`)
    }

    const raw = await apifyRes.json()
    let items: unknown[] = []
    if (Array.isArray(raw))                                          items = raw
    else if (Array.isArray((raw as Record<string, unknown>)?.items)) items = (raw as Record<string, unknown>).items as unknown[]
    else if (Array.isArray((raw as Record<string, unknown>)?.data))  items = (raw as Record<string, unknown>).data  as unknown[]

    if (items.length > 0) {
      console.log('[leadmapper] got', items.length, 'items, sample keys:', Object.keys(items[0] as object))
    } else {
      console.warn('[leadmapper] Apify returned 0 items')
    }

    const leads = items.map((item: unknown) => {
      const it = item as Record<string, unknown>

      // ── Social media ─────────────────────────────────────────────────────────
      // compass actor stores social links as TOP-LEVEL arrays (instagrams, facebooks, etc.)
      // populated when scrapeContacts / company-contacts enrichment is enabled
      const firstOf = (val: unknown) =>
        Array.isArray(val) ? ((val as string[])[0] ?? null) : (typeof val === 'string' ? val || null : null)

      const socialMedia = {
        facebook:  firstOf(it.facebooks)  ?? firstOf(it.facebook),
        instagram: firstOf(it.instagrams) ?? firstOf(it.instagram),
        linkedin:  firstOf(it.linkedIns)  ?? firstOf(it.linkedin),
        twitter:   firstOf(it.twitters)   ?? firstOf(it.twitter),
        youtube:   firstOf(it.youtubes)   ?? firstOf(it.youtube),
        tiktok:    firstOf(it.tiktoks)    ?? firstOf(it.tiktok) ?? null,
      }
      const hasSocial = Object.values(socialMedia).some(Boolean)

      // ── Emails ───────────────────────────────────────────────────────────────
      // can be plain strings or objects with {email, type} from enrichment
      const rawEmails = it.emails ?? it.email ?? null
      const emails: string[] = Array.isArray(rawEmails)
        ? (rawEmails as Array<string | Record<string, unknown>>)
            .map((e) => (typeof e === 'string' ? e.trim() : String((e as Record<string, unknown>).email ?? '').trim()))
            .filter(Boolean)
        : typeof rawEmails === 'string' && rawEmails
          ? rawEmails.split(',').map((e) => e.trim()).filter(Boolean)
          : []

      // ── Category ─────────────────────────────────────────────────────────────
      // categoryName is a single string; categories is an array — prefer categoryName
      const categoryVal = (it.categoryName as string | null)
        ?? (Array.isArray(it.categories) ? (it.categories as string[])[0] : null)
        ?? (it.category as string | null)
        ?? keyword
        ?? null

      // ── Assemble lead ─────────────────────────────────────────────────────────
      return {
        title:        (it.title as string)    ?? (it.name as string) ?? 'N/A',
        address:      (it.address as string)  ?? (it.full_address as string) ?? 'N/A',
        phone:        (it.phone as string)    ?? (it.phoneUnformatted as string) ?? null,
        website:      (it.website as string)  ?? null,
        rating:       it.totalScore  ?? it.total_score  ?? null,
        reviewsCount: it.reviewsCount ?? it.reviews_count ?? null,
        category:     categoryVal,
        // `url` in compass output is the Google Maps URL
        mapsUrl:      (it.url as string) ?? null,
        emails:       emails.length ? emails : null,
        socialMedia:  hasSocial ? socialMedia : null,
      }
    })

    // Post-scrape filter for phone (actor handles website natively via `website` param).
    // Website "with/without" is already enforced by Apify; we re-check as a safety net.
    const filteredLeads = leads.filter((l) => {
      if (effectivePhone   === 'with'    && !l.phone)   return false
      if (effectivePhone   === 'without' &&  l.phone)   return false
      if (effectiveWebsite === 'with'    && !l.website) return false
      if (effectiveWebsite === 'without' &&  l.website) return false
      return true
    })

    // ── Cap enrichment emails for plans with a finite quota (e.g. Starter: 100) ──
    let emailsConsumedThisRun = 0
    const finalLeads = filteredLeads.map((l) => {
      if (!l.emails || !effectiveEnrich) return l
      if (enrichEmailRemaining === Infinity) {
        emailsConsumedThisRun += l.emails.length
        return l
      }
      const budget = Math.max(enrichEmailRemaining - emailsConsumedThisRun, 0)
      if (budget === 0) return { ...l, emails: null }
      const trimmed = l.emails.slice(0, budget)
      emailsConsumedThisRun += trimmed.length
      return { ...l, emails: trimmed }
    })

    // ── 6. Deduct credits (non-fatal) ─────────────────────────────────────────
    const consumed         = finalLeads.length
    const newCreditsUsed   = Math.min(creditsUsed + consumed, creditsLimit)
    const newRemaining     = creditsLimit - newCreditsUsed
    let searchId: string | null = null

    try {
      const updatePayload: Record<string, unknown> = { credits_used: newCreditsUsed }
      if (effectiveEnrich && emailsConsumedThisRun > 0) {
        updatePayload.enrichment_emails_used = Math.min(
          enrichEmailsUsed + emailsConsumedThisRun,
          enrichEmailLimit === Infinity ? Number.MAX_SAFE_INTEGER : enrichEmailLimit
        )
      }
      await supabase
        .from('user_profiles')
        .update(updatePayload)
        .eq('id', user.id)
    } catch (e) {
      console.error('[leadmapper] credit deduction failed (non-fatal):', e)
    }

    // ── Low-credits email (fire-and-forget, non-fatal) ────────────────────────
    // Send when remaining drops to 10 or below (and was above 10 before this search)
    if (newRemaining <= 10 && creditsRemaining > 10) {
      try {
        const { data: notifProfile } = await supabase
          .from('user_profiles')
          .select('notify_credits, full_name')
          .eq('id', user.id)
          .single()

        if (notifProfile?.notify_credits && user.email) {
          sendLowCreditsEmail({
            to:        user.email,
            name:      notifProfile.full_name ?? '',
            remaining: newRemaining,
          }).catch((e) => console.warn('[leadmapper] low-credits email failed (non-fatal):', e))
        }
      } catch (e) {
        console.warn('[leadmapper] low-credits check failed (non-fatal):', e)
      }
    }

    // ── 7. Log search, then bulk-save leads (non-fatal) ───────────────────────
    try {
      const { data: searchRecord } = await supabase
        .from('searches')
        .insert({
          user_id:      user.id,
          keyword,
          location,
          result_count: finalLeads.length,
        })
        .select('id')
        .single()
      searchId = searchRecord?.id ?? null

      // Bulk-insert all leads linked to this search
      if (searchId && finalLeads.length > 0) {
        const rows = finalLeads.map((l) => ({
          user_id:       user.id,
          search_id:     searchId,
          title:         l.title,
          address:       l.address,
          phone:         l.phone    ?? null,
          website:       l.website  ?? null,
          rating:        l.rating   ?? null,
          reviews_count: l.reviewsCount ?? null,
          category:      l.category ?? null,
          maps_url:      l.mapsUrl  ?? null,
          emails:        l.emails   ?? null,
          social_media:  l.socialMedia ?? null,
        }))
        const { error: leadsErr } = await supabase.from('leads').insert(rows)
        if (leadsErr) console.error('[leadmapper] leads insert error (non-fatal):', leadsErr.message)
        else console.log('[leadmapper] saved', rows.length, 'leads to DB')
      }
    } catch (e) {
      console.error('[leadmapper] search/leads log failed (non-fatal):', e)
    }

    const newEnrichEmailsUsed = effectiveEnrich && emailsConsumedThisRun > 0
      ? Math.min(enrichEmailsUsed + emailsConsumedThisRun, enrichEmailLimit === Infinity ? Number.MAX_SAFE_INTEGER : enrichEmailLimit)
      : enrichEmailsUsed

    return NextResponse.json({
      success: true,
      leads: finalLeads,
      total: finalLeads.length,
      location,
      keyword,
      searchId,
      creditsUsed:           newCreditsUsed,
      creditsLimit,
      creditsRemaining:      creditsLimit - newCreditsUsed,
      planMaxResults,
      enrichEmailsUsed:      newEnrichEmailsUsed,
      enrichEmailLimit:      enrichEmailLimit === Infinity ? null : enrichEmailLimit,
      enrichEmailRemaining:  enrichEmailLimit === Infinity ? null : Math.max(enrichEmailLimit - newEnrichEmailsUsed, 0),
    })

  } catch (error) {
    console.error('[leadmapper] unhandled error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch business data',
        success: false,
      },
      { status: 500 }
    )
  }
}
