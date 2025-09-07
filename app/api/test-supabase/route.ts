import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Test connection and get sample data
    const { data: instagramLeads, error: igError } = await supabase
      .from('instagram_leads')
      .select('*')
      .limit(5)
    
    const { data: googleMapsLeads, error: gmError } = await supabase
      .from('google_maps_leads')
      .select('*')
      .limit(5)
    
    // Get counts
    const { count: igCount, error: igCountError } = await supabase
      .from('instagram_leads')
      .select('*', { count: 'exact', head: true })
    
    const { count: gmCount, error: gmCountError } = await supabase
      .from('google_maps_leads')
      .select('*', { count: 'exact', head: true })
    
    return NextResponse.json({
      success: true,
      instagram: {
        count: igCount,
        error: igError?.message,
        countError: igCountError?.message,
        sampleData: instagramLeads
      },
      googleMaps: {
        count: gmCount,
        error: gmError?.message,
        countError: gmCountError?.message,
        sampleData: googleMapsLeads
      }
    })
    
  } catch (error) {
    console.error('Error testing Supabase:', error)
    return NextResponse.json({ 
      error: 'Failed to test Supabase connection',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
