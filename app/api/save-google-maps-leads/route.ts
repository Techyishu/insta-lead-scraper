import { NextRequest, NextResponse } from 'next/server'
import { supabase, GoogleMapsLead } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { leads, location, category }: { leads: GoogleMapsLead[], location: string, category: string } = await request.json()

    if (!leads || !Array.isArray(leads) || leads.length === 0) {
      return NextResponse.json(
        { error: 'Invalid leads data. Expected an array of leads.' },
        { status: 400 }
      )
    }

    // Prepare leads data for insertion
    const leadsToInsert = leads.map(lead => ({
      business_name: lead.business_name,
      address: lead.address || null,
      phone: lead.phone || null,
      website: lead.website || null,
      rating: lead.rating || null,
      reviews_count: lead.reviews_count || null,
      category: category || lead.category || null,
      location_searched: location || lead.location_searched || null,
      latitude: lead.latitude || null,
      longitude: lead.longitude || null,
      place_id: lead.place_id || null,
      is_open: lead.is_open || null,
      opening_hours: lead.opening_hours || null,
      scraped_at: new Date().toISOString()
    }))

    // Insert leads into Supabase
    const { data, error } = await supabase
      .from('google_maps_leads')
      .insert(leadsToInsert)
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to save leads to database', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Successfully saved ${data.length} Google Maps leads`,
      savedLeads: data.length
    })

  } catch (error) {
    console.error('Error saving Google Maps leads:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
