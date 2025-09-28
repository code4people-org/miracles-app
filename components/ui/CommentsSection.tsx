'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, User } from 'lucide-react'
import { formatDate } from '@/lib/detailsUtils'

interface Comment {
  id: string
  content: string
  created_at: string
  profiles?: {
    full_name: string | null
    avatar_url: string | null
  }
}

interface CommentsSectionProps {
  comments: Comment[]
  newComment: string
  onCommentChange: (comment: string) => void
  onSubmitComment: (e: React.FormEvent) => void
  commentLoading: boolean
  user: any
  placeholder?: string
  submitText?: string
  themeColor?: string
}

export default function CommentsSection({
  comments,
  newComment,
  onCommentChange,
  onSubmitComment,
  commentLoading,
  user,
  placeholder = "Share your thoughts...",
  submitText = "Post Comment",
  themeColor = "miracle-gold"
}: CommentsSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-800">Comments</h3>
      
      {comments.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No comments yet. Be the first to share your thoughts!</p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  themeColor === 'miracle-gold' 
                    ? 'bg-gradient-to-br from-miracle-teal to-miracle-sky' 
                    : 'bg-gradient-to-br from-purple-500 to-purple-600'
                }`}>
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
        <form onSubmit={onSubmitComment} className="space-y-3">
          <textarea
            value={newComment}
            onChange={(e) => onCommentChange(e.target.value)}
            placeholder={placeholder}
            rows={3}
            maxLength={500}
            className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 resize-none ${
              themeColor === 'miracle-gold' 
                ? 'focus:ring-miracle-gold' 
                : 'focus:ring-purple-500'
            }`}
          />
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500">{newComment.length}/500 characters</p>
            <motion.button
              type="submit"
              disabled={commentLoading || !newComment.trim()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`px-4 py-2 rounded-lg font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 ${
                themeColor === 'miracle-gold' 
                  ? 'bg-miracle-gold hover:bg-miracle-gold/90' 
                  : 'bg-purple-500 hover:bg-purple-600'
              }`}
            >
              {commentLoading ? 'Posting...' : submitText}
            </motion.button>
          </div>
        </form>
      )}

      {!user && (
        <div className="text-center py-4">
          <p className="text-gray-500 mb-2">Sign in to comment</p>
        </div>
      )}
    </div>
  )
}
