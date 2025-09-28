import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type Miracle = Database['public']['Tables']['miracles']['Row']

interface UserStats {
  miraclesShared: number
  countriesVisited: number
  loading: boolean
}

export function useUserStats(userId: string | undefined) {
  const [stats, setStats] = useState<UserStats>({
    miraclesShared: 0,
    countriesVisited: 0,
    loading: true
  })

  useEffect(() => {
    if (!userId) {
      setStats({ miraclesShared: 0, countriesVisited: 0, loading: false })
      return
    }

    const fetchUserStats = async () => {
      try {
        // Fetch user's miracles
        const { data: miracles, error } = await supabase
          .from('miracles')
          .select('id, location_name, created_at')
          .eq('user_id', userId)
          .eq('is_approved', true)

        if (error) {
          console.error('Error fetching user miracles:', error)
          setStats({ miraclesShared: 0, countriesVisited: 0, loading: false })
          return
        }

        const miraclesCount = miracles?.length || 0
        
        // Calculate unique countries from location names
        const countries = new Set<string>()
        miracles?.forEach((miracle: { location_name: string | null }) => {
          if (miracle.location_name) {
            // Extract country from location name (assuming format like "City, Country" or "City, State")
            const parts = miracle.location_name.split(',').map((part: string) => part.trim())
            if (parts.length > 1) {
              const lastPart = parts[parts.length - 1]
              // Check if it's a US state abbreviation (2 letters)
              const usStates = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY']
              
              if (usStates.includes(lastPart)) {
                countries.add('United States')
              } else {
                // Assume it's a country name
                countries.add(lastPart)
              }
            } else {
              // If only one part, it might be a country name
              countries.add(parts[0])
            }
          }
        })

        setStats({
          miraclesShared: miraclesCount,
          countriesVisited: countries.size,
          loading: false
        })
      } catch (error) {
        console.error('Error calculating user stats:', error)
        setStats({ miraclesShared: 0, countriesVisited: 0, loading: false })
      }
    }

    fetchUserStats()
  }, [userId])

  return stats
}
