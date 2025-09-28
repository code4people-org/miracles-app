'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ThumbsUp, MessageCircle, Share2, Flag } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import type { Database } from '@/lib/supabase'
import { getCategoryEmoji } from '@/lib/miracleCategories'
import { useDetailsModal } from '@/hooks/useDetailsModal'
import DetailsModal from '@/components/ui/DetailsModal'
import CommentsSection from '@/components/ui/CommentsSection'
import ReportModal from '@/components/ui/ReportModal'

type Miracle = Database['public']['Tables']['miracles']['Row']
type Comment = Database['public']['Tables']['comments']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row']
}

interface MiracleDetailsProps {
  miracle: Miracle
  onClose: () => void
  onUpdate: () => void
}

export default function MiracleDetails({ miracle, onClose, onUpdate }: MiracleDetailsProps) {
  const { user } = useAuth()
  const {
    comments,
    newComment,
    setNewComment,
    loading,
    commentLoading,
    hasInteracted: hasUpvoted,
    showReportForm,
    setShowReportForm,
    reportReason,
    setReportReason,
    handleInteraction,
    handleComment,
    handleReport,
    handleShare,
    fetchComments
  } = useDetailsModal({
    itemId: miracle.id,
    commentTable: 'comments',
    commentIdField: 'miracle_id',
    interactionTable: 'upvotes',
    interactionIdField: 'miracle_id'
  })

  const handleUpvote = async () => {
    const success = await handleInteraction(hasUpvoted ? 'remove' : 'add')
    if (success) {
      onUpdate()
    }
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    const success = await handleComment(e)
    if (success) {
      onUpdate()
    }
  }

  const handleReportSubmit = async (e: React.FormEvent) => {
    await handleReport(e)
  }

  const handleShareClick = async () => {
    await handleShare(miracle.title, miracle.description)
  }

  const categoryEmoji = getCategoryEmoji(miracle.category)

  return (
    <DetailsModal
      title={miracle.title}
      description={miracle.description}
      category={miracle.category}
      categoryEmoji={categoryEmoji}
      location={miracle.location}
      locationName={miracle.location_name}
      createdAt={miracle.created_at}
      photoUrl={miracle.photo_url}
      videoUrl={miracle.video_url}
      youtubeUrl={miracle.youtube_url}
      onClose={onClose}
      borderColor="border-miracle-gold/20"
    >
        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-4">
            <motion.button
              onClick={handleUpvote}
            disabled={loading}
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
            onClick={handleShareClick}
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
      <CommentsSection
        comments={comments}
        newComment={newComment}
        onCommentChange={setNewComment}
        onSubmitComment={handleCommentSubmit}
        commentLoading={commentLoading}
        user={user}
                placeholder="Share your thoughts about this miracle..."
        submitText="Post Comment"
        themeColor="miracle-gold"
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportForm}
        onClose={() => setShowReportForm(false)}
        onSubmit={handleReportSubmit}
        reportReason={reportReason}
        onReasonChange={setReportReason}
      />
    </DetailsModal>
  )
}
