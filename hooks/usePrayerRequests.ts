'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

// Temporary type definition until we regenerate Supabase types
type PrayerRequest = {
  id: string
  user_id: string
  title: string
  description: string
  category: 'health' | 'family' | 'work' | 'relationships' | 'spiritual_growth' | 'financial' | 'education' | 'peace' | 'grief' | 'other'
  urgency: 'low' | 'medium' | 'high' | 'urgent'
  location: string
  location_name: string | null
  privacy_level: 'public' | 'anonymous' | 'blurred_location'
  photo_url: string | null
  is_anonymous: boolean
  is_answered: boolean
  answered_at: string | null
  prayers_count: number
  comments_count: number
  is_approved: boolean
  created_at: string
  updated_at: string
}

interface PrayerRequestFilters {
  category: string
  urgency: string
  answered: boolean | null // null means show all, true means answered only, false means unanswered only
  timeRange: string
  proximity: number
}

export function usePrayerRequests() {
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>([])
  const [filteredPrayerRequests, setFilteredPrayerRequests] = useState<PrayerRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<PrayerRequestFilters>({
    category: '',
    urgency: '',
    answered: null,
    timeRange: '',
    proximity: 0,
  })

  const fetchPrayerRequests = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('prayer_requests')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      setPrayerRequests(data || [])
    } catch (error) {
      console.error('Error fetching prayer requests:', error)
      setPrayerRequests([])
    } finally {
      setLoading(false)
    }
  }, [])

  const applyFilters = useCallback(() => {
    let filtered = [...prayerRequests]

    if (filters.category) {
      filtered = filtered.filter(request => request.category === filters.category)
    }

    if (filters.urgency) {
      filtered = filtered.filter(request => request.urgency === filters.urgency)
    }

    if (filters.answered !== null) {
      filtered = filtered.filter(request => request.is_answered === filters.answered)
    }

    if (filters.timeRange) {
      const now = new Date()
      const timeRanges = {
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000,
        '1y': 365 * 24 * 60 * 60 * 1000,
      }
      
      const timeLimit = timeRanges[filters.timeRange as keyof typeof timeRanges]
      if (timeLimit) {
        filtered = filtered.filter(request => {
          const requestDate = new Date(request.created_at)
          return now.getTime() - requestDate.getTime() <= timeLimit
        })
      }
    }

    setFilteredPrayerRequests(filtered)
  }, [prayerRequests, filters])

  useEffect(() => {
    fetchPrayerRequests()
  }, [fetchPrayerRequests])

  useEffect(() => {
    applyFilters()
  }, [applyFilters])

  const offerPrayer = useCallback(async (prayerRequestId: string, message?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('prayers_offered')
        .insert({
          user_id: user.id,
          prayer_request_id: prayerRequestId,
          message: message || null,
        })

      if (error) throw error

      // Refresh prayer requests to update counts
      await fetchPrayerRequests()
      return { success: true }
    } catch (error) {
      console.error('Error offering prayer:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Failed to offer prayer' }
    }
  }, [fetchPrayerRequests])

  const markAsAnswered = useCallback(async (prayerRequestId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('prayer_requests')
        .update({ 
          is_answered: true,
          answered_at: new Date().toISOString()
        })
        .eq('id', prayerRequestId)
        .eq('user_id', user.id) // Only the creator can mark as answered

      if (error) throw error

      // Refresh prayer requests
      await fetchPrayerRequests()
      return { success: true }
    } catch (error) {
      console.error('Error marking prayer as answered:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Failed to mark as answered' }
    }
  }, [fetchPrayerRequests])

  const checkPrayerStatus = useCallback(async (prayerRequestId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { hasPrayed: false }

      const { data, error } = await supabase
        .from('prayers_offered')
        .select('id')
        .eq('prayer_request_id', prayerRequestId)
        .eq('user_id', user.id)
        .limit(1)

      if (error) throw error

      return { hasPrayed: data && data.length > 0 }
    } catch (error) {
      console.error('Error checking prayer status:', error)
      return { hasPrayed: false }
    }
  }, [])

  return {
    prayerRequests,
    filteredPrayerRequests,
    loading,
    filters,
    setFilters,
    fetchPrayerRequests,
    offerPrayer,
    markAsAnswered,
    checkPrayerStatus,
  }
}
