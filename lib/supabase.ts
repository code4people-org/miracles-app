import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database types
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          location: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      miracles: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          category: 'kindness' | 'nature' | 'health' | 'family' | 'friendship' | 'achievement' | 'recovery' | 'discovery' | 'gratitude' | 'other'
          location: string // PostGIS POINT
          location_name: string | null
          privacy_level: 'public' | 'anonymous' | 'blurred_location'
          photo_url: string | null
          video_url: string | null
          youtube_url: string | null
          upvotes_count: number
          comments_count: number
          is_approved: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          category: 'kindness' | 'nature' | 'health' | 'family' | 'friendship' | 'achievement' | 'recovery' | 'discovery' | 'gratitude' | 'other'
          location: string
          location_name?: string | null
          privacy_level?: 'public' | 'anonymous' | 'blurred_location'
          photo_url?: string | null
          video_url?: string | null
          youtube_url?: string | null
          upvotes_count?: number
          comments_count?: number
          is_approved?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          category?: 'kindness' | 'nature' | 'health' | 'family' | 'friendship' | 'achievement' | 'recovery' | 'discovery' | 'gratitude' | 'other'
          location?: string
          location_name?: string | null
          privacy_level?: 'public' | 'anonymous' | 'blurred_location'
          photo_url?: string | null
          video_url?: string | null
          youtube_url?: string | null
          upvotes_count?: number
          comments_count?: number
          is_approved?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      upvotes: {
        Row: {
          id: string
          user_id: string
          miracle_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          miracle_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          miracle_id?: string
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          user_id: string
          miracle_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          miracle_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          miracle_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          reporter_id: string
          miracle_id: string | null
          comment_id: string | null
          reason: string
          description: string | null
          status: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          reporter_id: string
          miracle_id?: string | null
          comment_id?: string | null
          reason: string
          description?: string | null
          status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          reporter_id?: string
          miracle_id?: string | null
          comment_id?: string | null
          reason?: string
          description?: string | null
          status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
