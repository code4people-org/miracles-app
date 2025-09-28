'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { X, Calendar, MapPin, User } from 'lucide-react'
import Image from 'next/image'
import { formatDate, parseLocation } from '@/lib/detailsUtils'

interface DetailsModalProps {
  title: string
  description: string
  category: string
  categoryEmoji: string
  location: string
  locationName?: string | null
  createdAt: string
  photoUrl?: string | null
  videoUrl?: string | null
  youtubeUrl?: string | null
  isAnonymous?: boolean
  onClose: () => void
  children: React.ReactNode
  borderColor?: string
  additionalMeta?: React.ReactNode
}

export default function DetailsModal({
  title,
  description,
  category,
  categoryEmoji,
  location,
  locationName,
  createdAt,
  photoUrl,
  videoUrl,
  youtubeUrl,
  isAnonymous,
  onClose,
  children,
  borderColor = "border-miracle-gold/20",
  additionalMeta
}: DetailsModalProps) {
  const { lat, lng } = parseLocation(location)

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className={`bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border ${borderColor} max-h-[calc(100vh-6rem)] overflow-hidden flex flex-col`}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">
              {categoryEmoji}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{title}</h2>
              <p className="text-sm text-gray-600 capitalize">{category}</p>
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
            <span>{formatDate(createdAt)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <MapPin className="w-4 h-4" />
            <span>{locationName || `${lat.toFixed(2)}, ${lng.toFixed(2)}`}</span>
          </div>
          {isAnonymous && (
            <div className="flex items-center space-x-1">
              <User className="w-4 h-4" />
              <span>Anonymous</span>
            </div>
          )}
          {additionalMeta}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Description */}
        <div>
          <p className="text-gray-700 leading-relaxed">{description}</p>
        </div>

        {/* Media */}
        {(photoUrl || videoUrl || youtubeUrl) && (
          <div className="space-y-4">
            {photoUrl && (
              <div className="relative w-full h-64">
                <Image
                  src={photoUrl}
                  alt={title}
                  fill
                  className="object-cover rounded-lg"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            )}
            
            {videoUrl && (
              <div>
                <video
                  src={videoUrl}
                  controls
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            )}
            
            {youtubeUrl && (
              <div>
                <iframe
                  src={youtubeUrl.replace('watch?v=', 'embed/')}
                  className="w-full h-64 rounded-lg"
                  allowFullScreen
                />
              </div>
            )}
          </div>
        )}

        {/* Children (Actions, Comments, etc.) */}
        {children}
      </div>
    </motion.div>
  )
}
