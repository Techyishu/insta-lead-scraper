import { NextRequest, NextResponse } from 'next/server'
import { supabase, InstagramLead } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const leads: InstagramLead[] = await request.json()

    if (!leads || !Array.isArray(leads) || leads.length === 0) {
      return NextResponse.json(
        { error: 'Invalid leads data. Expected an array of leads.' },
        { status: 400 }
      )
    }

    // Prepare leads data for insertion
    const leadsToInsert = leads.map(lead => ({
      username: lead.username,
      full_name: lead.full_name || null,
      bio: lead.bio || null,
      followers_count: lead.followers_count || null,
      following_count: lead.following_count || null,
      posts_count: lead.posts_count || null,
      is_verified: lead.is_verified || false,
      is_private: lead.is_private || false,
      profile_pic_url: lead.profile_pic_url || null,
      external_url: lead.external_url || null,
      scraped_at: new Date().toISOString()
    }))

    // Insert leads into Supabase
    const { data, error } = await supabase
      .from('instagram_leads')
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
      message: `Successfully saved ${data.length} Instagram leads`,
      savedLeads: data.length
    })

  } catch (error) {
    console.error('Error saving Instagram leads:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
