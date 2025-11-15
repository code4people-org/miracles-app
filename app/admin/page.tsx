'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import ContentModerationDashboard from '@/components/admin/ContentModerationDashboard'

export default function AdminPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
      return
    }

    if (user) {
      // Check if user has admin role in metadata
      const adminStatus = user.user_metadata?.is_admin === true
      setIsAdmin(adminStatus)
      setChecking(false)

      if (!adminStatus) {
        // Redirect non-admin users
        router.push('/')
      }
    }
  }, [user, loading, router])

  if (loading || checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-miracle-gold"></div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Content moderation and management</p>
        </div>
        <ContentModerationDashboard />
      </div>
    </div>
  )
}

