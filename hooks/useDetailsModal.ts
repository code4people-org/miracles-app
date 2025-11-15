import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/apiClient'

interface UseDetailsModalProps {
  itemId: string
  commentTable: string
  commentIdField: string
  interactionTable?: string
  interactionIdField?: string
}

export function useDetailsModal({
  itemId,
  commentTable,
  commentIdField,
  interactionTable,
  interactionIdField
}: UseDetailsModalProps) {
  const { user } = useAuth()
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [commentLoading, setCommentLoading] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [showReportForm, setShowReportForm] = useState(false)
  const [reportReason, setReportReason] = useState('')

  const fetchComments = useCallback(async () => {
    try {
      const type = commentTable === 'comments' ? 'miracle' : 'prayer'
      const data = await apiClient.get<any[]>(`/api/v1/comments?type=${type}&id=${itemId}`)
      setComments(data || [])
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }, [itemId, commentTable, commentIdField])

  const checkInteractionStatus = useCallback(async () => {
    if (!user || !interactionTable || !interactionIdField) return

    try {
      const type = interactionTable === 'upvotes' ? 'miracle' : 'prayer'
      const response = await apiClient.get<{ has_interacted: boolean }>(`/api/v1/interactions/status?type=${type}&id=${itemId}`)
      setHasInteracted(response.has_interacted)
    } catch (error) {
      console.error('Error checking interaction status:', error)
      setHasInteracted(false)
    }
  }, [user, itemId, interactionTable, interactionIdField])

  useEffect(() => {
    fetchComments()
    checkInteractionStatus()
  }, [fetchComments, checkInteractionStatus])

  const handleInteraction = async (action: 'add' | 'remove') => {
    if (!user || !interactionTable || !interactionIdField) return

    setLoading(true)
    try {
      if (interactionTable === 'upvotes') {
        // Handle upvote toggle
        const response = await apiClient.post<{ upvoted: boolean }>('/api/v1/interactions/upvote', {
          miracle_id: itemId
        })
        setHasInteracted(response.upvoted)
      } else if (interactionTable === 'prayers_offered') {
        // Handle prayer toggle
        if (action === 'add') {
          await apiClient.post(`/api/v1/prayer-requests/${itemId}/pray`)
          setHasInteracted(true)
        } else {
          // Note: Backend doesn't support removing prayers, so we'll just refresh status
          const response = await apiClient.get<{ has_interacted: boolean }>(`/api/v1/interactions/status?type=prayer&id=${itemId}`)
          setHasInteracted(response.has_interacted)
        }
      }
      return true // Success
    } catch (error) {
      console.error('Error toggling interaction:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newComment.trim()) return

    setCommentLoading(true)
    try {
      const type = commentTable === 'comments' ? 'miracle' : 'prayer'
      await apiClient.post('/api/v1/comments', {
        type,
        item_id: itemId,
        content: newComment.trim(),
      })
      setNewComment('')
      fetchComments()
      return true // Success
    } catch (error) {
      console.error('Error adding comment:', error)
      return false
    } finally {
      setCommentLoading(false)
    }
  }

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !reportReason.trim()) return

    try {
      // Determine content type based on commentIdField
      const content_type = commentIdField === 'miracle_id' ? 'miracle' : 
                          commentIdField === 'prayer_request_id' ? 'prayer_request' : 'comment'
      
      await apiClient.post('/api/v1/reports', {
        content_type,
        content_id: itemId,
        reason: reportReason.trim(),
      })
      setShowReportForm(false)
      setReportReason('')
      alert('Thank you for reporting. We will review this content.')
      return true
    } catch (error) {
      console.error('Error submitting report:', error)
      return false
    }
  }

  const handleShare = async (title: string, description: string) => {
    const shareData = {
      title,
      text: description,
      url: window.location.href,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href)
        alert('Link copied to clipboard!')
      } catch (error) {
        console.log('Error copying to clipboard:', error)
      }
    }
  }

  return {
    // State
    comments,
    newComment,
    setNewComment,
    loading,
    commentLoading,
    hasInteracted,
    showReportForm,
    setShowReportForm,
    reportReason,
    setReportReason,
    
    // Actions
    handleInteraction,
    handleComment,
    handleReport,
    handleShare,
    fetchComments
  }
}
