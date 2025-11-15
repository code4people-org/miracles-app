import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/apiClient'

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
        const stats = await apiClient.get<{ miracles_shared: number; countries_visited: number }>(`/api/v1/users/${userId}/stats`)
        setStats({
          miraclesShared: stats.miracles_shared,
          countriesVisited: stats.countries_visited,
          loading: false
        })
      } catch (error) {
        console.error('Error fetching user stats:', error)
        setStats({ miraclesShared: 0, countriesVisited: 0, loading: false })
      }
    }

    fetchUserStats()
  }, [userId])

  return stats
}
