import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

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
      const { data, error } = await supabase
        .from(commentTable)
        .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq(commentIdField, itemId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setComments(data || [])
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }, [itemId, commentTable, commentIdField])

  const checkInteractionStatus = useCallback(async () => {
    if (!user || !interactionTable || !interactionIdField) return

    try {
      const { data, error } = await supabase
        .from(interactionTable)
        .select('id')
        .eq(interactionIdField, itemId)
        .eq('user_id', user.id)
        .limit(1)

      if (error) {
        console.error('Error checking interaction status:', error)
        setHasInteracted(false)
        return
      }
      setHasInteracted(data && data.length > 0)
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
      if (action === 'remove') {
        const { error } = await supabase
          .from(interactionTable)
          .delete()
          .eq(interactionIdField, itemId)
          .eq('user_id', user.id)

        if (error) {
          console.error('Error removing interaction:', error)
          return
        }
        setHasInteracted(false)
      } else {
        const { error } = await supabase
          .from(interactionTable)
          .insert({
            [interactionIdField]: itemId,
            user_id: user.id,
          })

        if (error) {
          console.error('Error adding interaction:', error)
          return
        }
        setHasInteracted(true)
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
      const { error } = await supabase
        .from(commentTable)
        .insert({
          [commentIdField]: itemId,
          user_id: user.id,
          content: newComment.trim(),
        })

      if (error) throw error
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
      const { error } = await supabase
        .from('reports')
        .insert({
          reporter_id: user.id,
          [commentIdField]: itemId,
          reason: reportReason.trim(),
        })

      if (error) throw error
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
