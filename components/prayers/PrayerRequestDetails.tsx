'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Hand, MessageCircle, Share2, Flag, CheckCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getPrayerCategoryEmoji, getPrayerUrgencyEmoji, getPrayerUrgencyColor } from '@/lib/prayerCategories'
import { type PrayerRequest } from '@/lib/mapUtils'
import { useDetailsModal } from '@/hooks/useDetailsModal'
import DetailsModal from '@/components/ui/DetailsModal'
import CommentsSection from '@/components/ui/CommentsSection'
import ReportModal from '@/components/ui/ReportModal'

interface PrayerRequestDetailsProps {
  prayerRequest: PrayerRequest
  onClose: () => void
  onUpdate: () => void
}

export default function PrayerRequestDetails({ prayerRequest, onClose, onUpdate }: PrayerRequestDetailsProps) {
  const { user } = useAuth()
  const {
    comments,
    newComment,
    setNewComment,
    loading,
    commentLoading,
    hasInteracted: hasOfferedPrayer,
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
    itemId: prayerRequest.id,
    commentTable: 'prayer_comments',
    commentIdField: 'prayer_request_id',
    interactionTable: 'prayers_offered',
    interactionIdField: 'prayer_request_id'
  })

  const handleOfferPrayer = async () => {
    const success = await handleInteraction(hasOfferedPrayer ? 'remove' : 'add')
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
    await handleShare(prayerRequest.title, prayerRequest.description)
  }

  const categoryEmoji = getPrayerCategoryEmoji(prayerRequest.category)
  const urgencyEmoji = getPrayerUrgencyEmoji(prayerRequest.urgency)
  const urgencyColor = getPrayerUrgencyColor(prayerRequest.urgency)
  const isOwner = user?.id === prayerRequest.user_id

  return (
    <DetailsModal
      title={prayerRequest.title}
      description={prayerRequest.description}
      category={prayerRequest.category}
      categoryEmoji={prayerRequest.is_answered ? '✅' : categoryEmoji}
      location={prayerRequest.location}
      locationName={prayerRequest.location_name}
      createdAt={prayerRequest.created_at}
      photoUrl={prayerRequest.photo_url}
      isAnonymous={prayerRequest.is_anonymous}
      onClose={onClose}
      borderColor="border-purple-200"
      additionalMeta={
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <span style={{ color: urgencyColor }}>{urgencyEmoji}</span>
            <span className="text-sm text-gray-600 capitalize">{prayerRequest.urgency}</span>
          </div>
          {prayerRequest.is_answered && (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              Answered
            </span>
          )}
        </div>
      }
    >
      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-4">
          <motion.button
            onClick={handleOfferPrayer}
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              hasOfferedPrayer
                ? 'bg-purple-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-purple-500/10'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Hand className="w-4 h-4" />
            <span>{prayerRequest.prayers_count}</span>
          </motion.button>

          <div className="flex items-center space-x-2 text-gray-600">
            <MessageCircle className="w-4 h-4" />
            <span>{prayerRequest.comments_count}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isOwner && !prayerRequest.is_answered && (
            <motion.button
              onClick={async () => {
                // TODO: Implement mark as answered functionality
                console.log('Mark as answered clicked')
              }}
              disabled={loading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Mark Answered</span>
            </motion.button>
          )}

          <motion.button
            onClick={handleShareClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 text-gray-600 hover:text-purple-500 transition-colors duration-200"
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
        placeholder="Share words of encouragement or support..."
        submitText="Post Comment"
        themeColor="purple-500"
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
