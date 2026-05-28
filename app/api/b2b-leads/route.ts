import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendLowCreditsEmail } from '@/lib/resend'

export const maxDuration = 300

const PLAN_MAX_RESULTS: Record<string, number> = {
  free:    10,
  starter: 300,
  growth:  1_000,
  scale:   3_000,
}

const ABSOLUTE_MAX = 3_000
const ACTOR_MIN    = 100   // boneswill~leads-generator minimum

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // ── 1. Auth ───────────────────────────────────────────────────────────────
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

    const toStringArray = (v: unknown): string[] =>
      Array.isArray(v)
        ? v.filter((x): x is string => typeof x === 'string' && x.trim().length > 0).map((s) => s.trim())
        : []

    const personTitle        = toStringArray(body.jobTitles)
    const seniority          = toStringArray(body.seniorityLevel)
    const functional         = toStringArray(body.functional)
    const firstName          = typeof body.firstName === 'string' ? body.firstName.trim() : ''
    const lastName           = typeof body.lastName  === 'string' ? body.lastName.trim()  : ''
    const personCountry      = toStringArray(body.personCountry)
    const companyCountry     = toStringArray(body.companyCountry)
    const industry           = toStringArray(body.industries)
    const industryKeywords   = toStringArray(body.industryKeywords)
    const companyDomain      = toStringArray(body.companyDomain)
    const companyEmployeeSize = toStringArray(body.companySize)
    const revenue            = toStringArray(body.revenue)
    const businessModel      = toStringArray(body.businessModel)
    const fundingType        = toStringArray(body.funding)
    const fundingFromDate    = typeof body.fundingFromDate === 'string' ? body.fundingFromDate.trim() : ''
    const fundingToDate      = typeof body.fundingToDate   === 'string' ? body.fundingToDate.trim()   : ''
    const rawEmailStatus     = Array.isArray(body.emailStatus) ? (body.emailStatus[0] ?? '') : (body.emailStatus ?? '')
    const contactEmailStatus = typeof rawEmailStatus === 'string' ? rawEmailStatus.trim() : ''

    const rawMax    = parseInt(String(body.maxResults ?? '50'), 10)
    const clientMax = Number.isFinite(rawMax) && rawMax > 0 ? rawMax : 50

    const hasFilter =
      personTitle.length > 0 || industry.length > 0 ||
      personCountry.length > 0 || companyCountry.length > 0 ||
      seniority.length > 0 || firstName || lastName || companyDomain.length > 0

    if (!hasFilter) {
      return NextResponse.json(
        { error: 'Please provide at least one filter to search.' },
        { status: 400 }
      )
    }

    // ── 3. Load or create user profile ────────────────────────────────────────
    let { data: profile } = await supabase
      .from('user_profiles')
      .select('b2b_credits_used, b2b_credits_limit, plan')
      .eq('id', user.id)
      .single()

    if (!profile) {
      await supabase.from('user_profiles').upsert(
        {
          id:               user.id,
          full_name:        (user.user_metadata?.full_name as string) ?? null,
          credits_used:     0,
          credits_limit:    50,
          b2b_credits_used: 0,
          b2b_credits_limit: 10,
          plan:             'free',
        },
        { onConflict: 'id' }
      )
      const { data: fresh } = await supabase
        .from('user_profiles')
        .select('b2b_credits_used, b2b_credits_limit, plan')
        .eq('id', user.id)
        .single()
      profile = fresh
    }

    const creditsUsed      = profile?.b2b_credits_used  ?? 0
    const creditsLimit     = profile?.b2b_credits_limit ?? 10
    const rawPlan          = (profile?.plan ?? 'free').toLowerCase()
    const plan             = rawPlan in PLAN_MAX_RESULTS ? rawPlan : 'free'
    const creditsRemaining = Math.max(creditsLimit - creditsUsed, 0)
    const planMaxResults   = PLAN_MAX_RESULTS[plan]

    // ── 4. Credit gate ────────────────────────────────────────────────────────
    if (creditsRemaining <= 0) {
      return NextResponse.json(
        { error: 'No B2B credits remaining. Upgrade your plan to keep searching.', noCredits: true, creditsUsed, creditsLimit, creditsRemaining: 0 },
        { status: 402 }
      )
    }

    const effectiveMax  = Math.min(clientMax, planMaxResults, ABSOLUTE_MAX, creditsRemaining)
    const actorFetch    = Math.max(effectiveMax, ACTOR_MIN)   // actor requires min 100

    // ── 5. Apify token ────────────────────────────────────────────────────────
    const token = process.env.APIFY_API_TOKEN
    if (!token) {
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
    }

    // ── 6. Build actor input ──────────────────────────────────────────────────
    const apifyInput: Record<string, unknown> = {
      totalResults:  actorFetch,
      includeEmails: true,
    }

    if (personTitle.length > 0)         apifyInput.personTitle         = personTitle
    if (seniority.length > 0)           apifyInput.seniority           = seniority
    if (functional.length > 0)          apifyInput.functional          = functional
    if (firstName)                      apifyInput.firstName           = firstName
    if (lastName)                       apifyInput.lastName            = lastName
    if (personCountry.length > 0)       apifyInput.personCountry       = personCountry
    if (companyCountry.length > 0)      apifyInput.companyCountry      = companyCountry
    if (industry.length > 0)            apifyInput.industry            = industry
    if (industryKeywords.length > 0)    apifyInput.industryKeywords    = industryKeywords
    if (companyDomain.length > 0)       apifyInput.companyDomain       = companyDomain
    if (companyEmployeeSize.length > 0) apifyInput.companyEmployeeSize = companyEmployeeSize
    if (revenue.length > 0)             apifyInput.revenue             = revenue
    if (businessModel.length > 0)       apifyInput.businessModel       = businessModel
    if (fundingType.length > 0)         apifyInput.fundingType         = fundingType
    if (fundingFromDate)                apifyInput.fundingFromDate     = fundingFromDate
    if (fundingToDate)                  apifyInput.fundingToDate       = fundingToDate
    if (contactEmailStatus)             apifyInput.contactEmailStatus  = contactEmailStatus

    console.log('[b2b-leads] plan=%s max=%d input=%s', plan, effectiveMax, JSON.stringify(apifyInput))

    const apifyUrl = `https://api.apify.com/v2/acts/boneswill~leads-generator/run-sync-get-dataset-items?token=${token}`

    const apifyRes = await fetch(apifyUrl, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(apifyInput),
      // @ts-ignore
      signal:  AbortSignal.timeout(280_000),
    })

    if (!apifyRes.ok) {
      const errText = await apifyRes.text().catch(() => '')
      throw new Error(`Apify error ${apifyRes.status}: ${errText.slice(0, 600)}`)
    }

    const raw = await apifyRes.json()
    if (!Array.isArray(raw)) throw new Error('Unexpected response from Apify')

    // ── 7. Map to lead shape ──────────────────────────────────────────────────
    const leads = (raw as Record<string, unknown>[]).slice(0, effectiveMax).map((it) => ({
      fullName:        ((it.fullName as string) ?? (it.full_name as string) ?? [(it.firstName ?? it.first_name), (it.lastName ?? it.last_name)].filter(Boolean).join(' ')) || 'N/A',
      firstName:       (it.firstName as string)       ?? (it.first_name as string)       ?? null,
      lastName:        (it.lastName as string)        ?? (it.last_name as string)        ?? null,
      jobTitle:        (it.title as string)           ?? (it.jobTitle as string)         ?? (it.job_title as string)        ?? (it.personTitle as string)  ?? null,
      headline:        (it.headline as string)        ?? null,
      seniority:       (it.seniority as string)       ?? (it.seniority_level as string)  ?? null,
      email:           (it.email as string)           ?? (it.workEmail as string)        ?? (it.work_email as string)       ?? null,
      personalEmail:   (it.personalEmail as string)   ?? (it.personal_email as string)   ?? null,
      phone:           (it.phone as string)           ?? (it.mobilePhone as string)      ?? (it.mobile_phone as string)     ?? (it.mobile as string) ?? null,
      linkedin:        (it.linkedinUrl as string)     ?? (it.linkedin_url as string)     ?? (it.linkedin as string)         ?? null,
      city:            (it.city as string)            ?? null,
      state:           (it.state as string)           ?? null,
      country:         (it.country as string)         ?? null,
      companyName:     (it.companyName as string)     ?? (it.company_name as string)     ?? (it.company as string)          ?? null,
      companyDomain:   (it.companyDomain as string)   ?? (it.company_domain as string)   ?? null,
      companyWebsite:  (it.companyWebsite as string)  ?? (it.company_website as string)  ?? null,
      companyLinkedin: (it.companyLinkedin as string) ?? (it.company_linkedin as string) ?? null,
      companySize:     (it.companySize as string)     ?? (it.company_size as string)     ?? (it.employees as string)        ?? null,
      industry:        (it.industry as string)        ?? (it.companyIndustry as string)  ?? null,
      companyRevenue:  (it.revenue as string)         ?? (it.companyRevenue as string)   ?? (it.company_revenue as string)  ?? null,
    }))

    // ── 8. Deduct credits ─────────────────────────────────────────────────────
    const consumed       = leads.length
    const newCreditsUsed = Math.min(creditsUsed + consumed, creditsLimit)
    const newRemaining   = creditsLimit - newCreditsUsed

    try {
      await supabase.from('user_profiles').update({ b2b_credits_used: newCreditsUsed }).eq('id', user.id)
    } catch (e) {
      console.error('[b2b-leads] credit deduction failed (non-fatal):', e)
    }

    // ── Low-credits email ─────────────────────────────────────────────────────
    if (newRemaining <= 10 && creditsRemaining > 10) {
      try {
        const { data: np } = await supabase
          .from('user_profiles').select('notify_credits, full_name').eq('id', user.id).single()
        if (np?.notify_credits && user.email) {
          sendLowCreditsEmail({ to: user.email, name: np.full_name ?? '', remaining: newRemaining })
            .catch((e) => console.warn('[b2b-leads] low-credits email failed:', e))
        }
      } catch {}
    }

    // ── 9. Log search + save leads ────────────────────────────────────────────
    let searchId: string | null = null
    try {
      const searchLabel = [
        personTitle.length ? personTitle.slice(0, 2).join(', ') : (seniority[0] ?? null),
        personCountry[0] || companyCountry[0] || null,
      ].filter(Boolean).join(' in ') || 'B2B Search'

      const { data: searchRecord } = await supabase
        .from('searches')
        .insert({ user_id: user.id, keyword: searchLabel, location: personCountry[0] || companyCountry[0] || 'Global', result_count: leads.length })
        .select('id').single()
      searchId = searchRecord?.id ?? null

      if (searchId && leads.length > 0) {
        const rows = leads.map((l) => ({
          user_id:       user.id,
          search_id:     searchId,
          title:         l.fullName,
          address:       [l.jobTitle, l.companyName].filter(Boolean).join(' at ') || null,
          phone:         l.phone        ?? null,
          website:       l.companyWebsite ?? null,
          rating:        null,
          reviews_count: null,
          category:      l.industry     ?? l.jobTitle ?? null,
          maps_url:      l.linkedin     ?? null,
          emails:        l.email ? [l.email] : null,
          social_media:  null,
        }))
        const { error: leadsErr } = await supabase.from('leads').insert(rows)
        if (leadsErr) console.error('[b2b-leads] leads insert error (non-fatal):', leadsErr.message)
      }
    } catch (e) {
      console.error('[b2b-leads] search log failed (non-fatal):', e)
    }

    return NextResponse.json({
      success: true,
      leads,
      total:            leads.length,
      searchId,
      creditsUsed:      newCreditsUsed,
      creditsLimit,
      creditsRemaining: creditsLimit - newCreditsUsed,
      planMaxResults,
    })

  } catch (error) {
    console.error('[b2b-leads] unhandled error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch B2B leads', success: false },
      { status: 500 }
    )
  }
}
