import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wrwnmpzyonpikuqupepq.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indyd25tcHp5b25waWt1cXVwZXBxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyMjEzMDQsImV4cCI6MjA3Mjc5NzMwNH0.1E3y_lp233mPgTr_vX41s3vdl_DuZENEF1hcgd1fDkw'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Type definitions for our database tables
export interface InstagramLead {
  id?: string
  username: string
  full_name?: string
  bio?: string
  followers_count?: number
  following_count?: number
  posts_count?: number
  is_verified?: boolean
  is_private?: boolean
  profile_pic_url?: string
  external_url?: string
  scraped_at?: string
  created_at?: string
  updated_at?: string
}

export interface GoogleMapsLead {
  id?: string
  business_name: string
  address?: string
  phone?: string
  website?: string
  rating?: number
  reviews_count?: number
  category?: string
  location_searched?: string
  latitude?: number
  longitude?: number
  place_id?: string
  is_open?: boolean
  opening_hours?: string
  scraped_at?: string
  created_at?: string
  updated_at?: string
}
