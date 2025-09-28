'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  reportReason: string
  onReasonChange: (reason: string) => void
}

export default function ReportModal({
  isOpen,
  onClose,
  onSubmit,
  reportReason,
  onReasonChange
}: ReportModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
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
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for reporting
                </label>
                <select
                  id="reason"
                  value={reportReason}
                  onChange={(e) => onReasonChange(e.target.value)}
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
                  onClick={onClose}
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
  )
}
