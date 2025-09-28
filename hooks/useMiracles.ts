import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { getSampleMiracles } from '@/lib/sampleData'
import type { Database } from '@/lib/supabase'

type Miracle = Database['public']['Tables']['miracles']['Row']

interface Filters {
  category: string
  timeRange: string
  proximity: number
}

export function useMiracles() {
  const [miracles, setMiracles] = useState<Miracle[]>([])
  const [filteredMiracles, setFilteredMiracles] = useState<Miracle[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<Filters>({
    category: '',
    timeRange: '',
    proximity: 0,
  })

  const fetchMiracles = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('miracles')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // If no real miracles, use sample data for demonstration
      if (!data || data.length === 0) {
        setMiracles(getSampleMiracles())
      } else {
        setMiracles(data)
      }
    } catch (error) {
      console.error('Error fetching miracles:', error)
      // Fallback to sample data if there's an error
      setMiracles(getSampleMiracles())
    } finally {
      setLoading(false)
    }
  }, [])

  const applyFilters = useCallback(() => {
    let filtered = [...miracles]

    if (filters.category) {
      filtered = filtered.filter(miracle => miracle.category === filters.category)
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
        filtered = filtered.filter(miracle => {
          const miracleDate = new Date(miracle.created_at)
          return now.getTime() - miracleDate.getTime() <= timeLimit
        })
      }
    }

    setFilteredMiracles(filtered)
  }, [miracles, filters])

  useEffect(() => {
    fetchMiracles()
  }, [fetchMiracles])

  useEffect(() => {
    applyFilters()
  }, [applyFilters])

  return {
    miracles,
    filteredMiracles,
    loading,
    filters,
    setFilters,
    fetchMiracles
  }
}
