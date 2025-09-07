import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    const { data: leads, error } = await supabase
      .from('google_maps_leads')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (error) {
      console.error('Error fetching Google Maps leads:', error)
      return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
    }
    
    // Get total count
    const { count, error: countError } = await supabase
      .from('google_maps_leads')
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      console.error('Error counting Google Maps leads:', countError)
    }
    
    return NextResponse.json({
      leads: leads || [],
      total: count || 0,
      hasMore: (offset + limit) < (count || 0)
    })
    
  } catch (error) {
    console.error('Error in get-google-maps-leads API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
