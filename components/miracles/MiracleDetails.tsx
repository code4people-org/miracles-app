'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Heart, MessageCircle, Share2, Flag, MapPin, Calendar, User, ThumbsUp } from 'lucide-react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type Miracle = Database['public']['Tables']['miracles']['Row']
type Comment = Database['public']['Tables']['comments']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row']
}

interface MiracleDetailsProps {
  miracle: Miracle
  onClose: () => void
  onUpdate: () => void
}

const categoryEmojis = {
  kindness: '🤝',
  nature: '🌱',
  health: '💚',
  family: '👨‍👩‍👧‍👦',
  friendship: '👫',
  achievement: '🏆',
  recovery: '🌅',
  discovery: '🔍',
  gratitude: '🙏',
  other: '✨',
}

export default function MiracleDetails({ miracle, onClose, onUpdate }: MiracleDetailsProps) {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [commentLoading, setCommentLoading] = useState(false)
  const [hasUpvoted, setHasUpvoted] = useState(false)
  const [showReportForm, setShowReportForm] = useState(false)
  const [reportReason, setReportReason] = useState('')

  const fetchComments = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('miracle_id', miracle.id)
        .order('created_at', { ascending: true })

      if (error) throw error
      setComments(data || [])
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }, [miracle.id])

  const checkUpvoteStatus = useCallback(async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('upvotes')
        .select('id')
        .eq('miracle_id', miracle.id)
        .eq('user_id', user.id)
        .limit(1)

      if (error) {
        console.error('Error checking upvote status:', error)
        setHasUpvoted(false)
        return
      }
      setHasUpvoted(data && data.length > 0)
    } catch (error) {
      console.error('Error checking upvote status:', error)
      setHasUpvoted(false)
    }
  }, [user, miracle.id])

  useEffect(() => {
    fetchComments()
    checkUpvoteStatus()
  }, [fetchComments, checkUpvoteStatus])

  const handleUpvote = async () => {
    if (!user) return

    setLoading(true)
    try {
      if (hasUpvoted) {
        // Remove upvote
        const { error } = await supabase
          .from('upvotes')
          .delete()
          .eq('miracle_id', miracle.id)
          .eq('user_id', user.id)

        if (error) {
          console.error('Error removing upvote:', error)
          return
        }
        setHasUpvoted(false)
      } else {
        // Add upvote
        const { error } = await supabase
          .from('upvotes')
          .insert({
            miracle_id: miracle.id,
            user_id: user.id,
          })

        if (error) {
          console.error('Error adding upvote:', error)
          return
        }
        setHasUpvoted(true)
      }
      onUpdate() // Refresh the miracle data
    } catch (error) {
      console.error('Error toggling upvote:', error)
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
        .from('comments')
        .insert({
          miracle_id: miracle.id,
          user_id: user.id,
          content: newComment.trim(),
        })

      if (error) throw error
      setNewComment('')
      fetchComments()
      onUpdate() // Refresh the miracle data
    } catch (error) {
      console.error('Error adding comment:', error)
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
          miracle_id: miracle.id,
          reason: reportReason.trim(),
        })

      if (error) throw error
      setShowReportForm(false)
      setReportReason('')
      alert('Thank you for reporting. We will review this content.')
    } catch (error) {
      console.error('Error submitting report:', error)
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: miracle.title,
      text: miracle.description,
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const parseLocation = (location: string) => {
    const match = location.match(/POINT\(([^)]+)\)/)
    if (match) {
      const [lng, lat] = match[1].split(' ').map(Number)
      return { lat, lng }
    }
    return { lat: 0, lng: 0 }
  }

  const { lat, lng } = parseLocation(miracle.location)

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-miracle-gold/20 max-h-[calc(100vh-6rem)] overflow-hidden flex flex-col"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">
              {categoryEmojis[miracle.category as keyof typeof categoryEmojis]}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{miracle.title}</h2>
              <p className="text-sm text-gray-600 capitalize">{miracle.category}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Meta information */}
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(miracle.created_at)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <MapPin className="w-4 h-4" />
            <span>{miracle.location_name || `${lat.toFixed(2)}, ${lng.toFixed(2)}`}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Description */}
        <div>
          <p className="text-gray-700 leading-relaxed">{miracle.description}</p>
        </div>

        {/* Media */}
        {(miracle.photo_url || miracle.video_url || miracle.youtube_url) && (
          <div className="space-y-4">
            {miracle.photo_url && (
              <div className="relative w-full h-64">
                <Image
                  src={miracle.photo_url}
                  alt={miracle.title}
                  fill
                  className="object-cover rounded-lg"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            )}
            
            {miracle.video_url && (
              <div>
                <video
                  src={miracle.video_url}
                  controls
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            )}
            
            {miracle.youtube_url && (
              <div>
                <iframe
                  src={miracle.youtube_url.replace('watch?v=', 'embed/')}
                  className="w-full h-64 rounded-lg"
                  allowFullScreen
                />
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-4">
            <motion.button
              onClick={handleUpvote}
              disabled={loading || !user}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                hasUpvoted
                  ? 'bg-miracle-gold text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-miracle-gold/10'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <ThumbsUp className="w-4 h-4" />
              <span>{miracle.upvotes_count}</span>
            </motion.button>

            <div className="flex items-center space-x-2 text-gray-600">
              <MessageCircle className="w-4 h-4" />
              <span>{miracle.comments_count}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <motion.button
              onClick={handleShare}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-gray-600 hover:text-miracle-gold transition-colors duration-200"
            >
              <Share2 className="w-4 h-4" />
            </motion.button>

            <motion.button
              onClick={() => setShowReportForm(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-gray-600 hover:text-red-500 transition-colors duration-200"
            >
              <Flag className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Comments */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800">Comments</h3>
          
          {comments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No comments yet. Be the first to share your thoughts!</p>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-miracle-teal to-miracle-sky rounded-full flex items-center justify-center">
                      <User className="w-3 h-3 text-white" />
                    </div>
                    <span className="font-medium text-sm text-gray-800">
                      {comment.profiles?.full_name || 'Anonymous'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm">{comment.content}</p>
                </div>
              ))}
            </div>
          )}

          {/* Add comment form */}
          {user && (
            <form onSubmit={handleComment} className="space-y-3">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts about this miracle..."
                rows={3}
                maxLength={500}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-miracle-gold focus:border-transparent transition-all duration-200 resize-none"
              />
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500">{newComment.length}/500 characters</p>
                <motion.button
                  type="submit"
                  disabled={commentLoading || !newComment.trim()}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-miracle text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {commentLoading ? 'Posting...' : 'Post Comment'}
                </motion.button>
              </div>
            </form>
          )}

          {!user && (
            <div className="text-center py-4">
              <p className="text-gray-500 mb-2">Sign in to comment on this miracle</p>
            </div>
          )}
        </div>
      </div>

      {/* Report Form Modal */}
      <AnimatePresence>
        {showReportForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md"
            >
              <h3 className="text-lg font-bold text-gray-800 mb-4">Report Content</h3>
              <form onSubmit={handleReport} className="space-y-4">
                <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for reporting
                  </label>
                  <select
                    id="reason"
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-miracle-gold focus:border-transparent"
                  >
                    <option value="">Select a reason</option>
                    <option value="inappropriate">Inappropriate content</option>
                    <option value="spam">Spam or misleading</option>
                    <option value="harassment">Harassment or bullying</option>
                    <option value="violence">Violence or harmful content</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowReportForm(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors duration-200"
                  >
                    Submit Report
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
