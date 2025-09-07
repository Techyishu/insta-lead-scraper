import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    console.log('Fetching Instagram leads with limit:', limit, 'offset:', offset)
    
    const { data: leads, error } = await supabase
      .from('instagram_leads')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (error) {
      console.error('Error fetching Instagram leads:', error)
      return NextResponse.json({ error: 'Failed to fetch leads', details: error.message }, { status: 500 })
    }
    
    console.log('Fetched leads:', leads?.length || 0, 'leads')
    
    // Get total count
    const { count, error: countError } = await supabase
      .from('instagram_leads')
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      console.error('Error counting Instagram leads:', countError)
    }
    
    return NextResponse.json({
      leads: leads || [],
      total: count || 0,
      hasMore: (offset + limit) < (count || 0)
    })
    
  } catch (error) {
    console.error('Error in get-instagram-leads API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
