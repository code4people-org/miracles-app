'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Calendar, LogOut, Settings, Heart, MapPin, Globe } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslation } from '@/hooks/useTranslation'
import { useUserStats } from '@/hooks/useUserStats'

interface UserModalProps {
  isOpen: boolean
  onClose: () => void
}

const DetailItem = ({ icon: Icon, label, value, color = "text-gray-600" }: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  color?: string
}) => (
  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-miracle-teal flex-shrink-0" />
    <div className="min-w-0 flex-1">
      <p className="text-xs sm:text-sm font-medium text-gray-700">{label}</p>
      <p className={`text-xs sm:text-sm ${color} truncate`}>{value}</p>
    </div>
  </div>
)

const StatCard = ({ icon: Icon, label, value, color, bgColor }: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  color: string
  bgColor: string
}) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className={`p-3 sm:p-4 bg-gradient-to-br ${bgColor} rounded-lg border ${color.replace('text-', 'border-')}/20`}
  >
    <div className="flex items-center space-x-2 mb-1 sm:mb-2">
      <Icon className={`w-3 h-3 sm:w-4 sm:h-4 ${color}`} />
      <span className="text-xs sm:text-sm font-medium text-gray-700">{label}</span>
    </div>
    <p className={`text-xl sm:text-2xl font-bold ${color} ${value === "..." ? "animate-pulse" : ""}`}>
      {value}
    </p>
  </motion.div>
)

const ActionButton = ({ icon: Icon, label, onClick, variant = "default" }: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  onClick?: () => void
  variant?: "default" | "danger"
}) => {
  const baseClasses = "w-full flex items-center space-x-3 p-3 sm:p-3 text-left rounded-lg transition-colors duration-200 touch-manipulation"
  const variantClasses = variant === "danger" 
    ? "bg-red-50 hover:bg-red-100 active:bg-red-200" 
    : "bg-gray-50 hover:bg-gray-100 active:bg-gray-200"
  const iconColor = variant === "danger" ? "text-red-600" : "text-gray-600"
  const textColor = variant === "danger" ? "text-red-700" : "text-gray-700"

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses}`}
    >
      <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${iconColor} flex-shrink-0`} />
      <span className={`text-sm sm:text-base font-medium ${textColor}`}>{label}</span>
    </motion.button>
  )
}

export default function UserModal({ isOpen, onClose }: UserModalProps) {
  const { user, signOut } = useAuth()
  const { getTranslation } = useTranslation()
  const { miraclesShared, countriesVisited, loading: statsLoading } = useUserStats(user?.id)
  
  if (!user) return null

  const formatDate = (dateString: string) => 
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

  const handleSignOut = async () => {
    await signOut()
    onClose()
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
      style={{ 
        zIndex: 10000,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh'
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-sm sm:max-w-md bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-miracle-gold/20"
        style={{ 
          position: 'relative',
          zIndex: 10001,
          maxHeight: '95vh',
          overflow: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 pb-0">
          <h3 className="text-lg font-semibold text-gray-800">
            {getTranslation('navigation.profile', 'Profile')}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 bg-white shadow-sm border border-gray-200"
            title="Close"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 pt-4">
          <div className="flex flex-col space-y-4 sm:space-y-6">
            {/* User Info Header */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mb-3 sm:mb-4 bg-gradient-to-br from-miracle-gold to-miracle-teal rounded-full flex items-center justify-center">
                <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-1">
                {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
              </h2>
              <p className="text-gray-500 text-xs sm:text-sm">
                {getTranslation('user.memberSince', 'Member since')} {formatDate(user.created_at)}
              </p>
            </div>

            {/* User Details */}
            <div className="flex flex-col space-y-3 sm:space-y-4">
              <DetailItem
                icon={Mail}
                label={getTranslation('user.email', 'Email')}
                value={user.email || ''}
              />
              <DetailItem
                icon={Calendar}
                label={getTranslation('user.joined', 'Joined')}
                value={formatDate(user.created_at)}
              />
              {user.user_metadata?.avatar_url && (
                <DetailItem
                  icon={Globe}
                  label={getTranslation('user.avatar', 'Avatar')}
                  value={getTranslation('user.googleAccount', 'Google Account')}
                />
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                icon={Heart}
                label={getTranslation('user.miraclesShared', 'Miracles Shared')}
                value={statsLoading ? "..." : miraclesShared}
                color="text-miracle-gold"
                bgColor="from-miracle-gold/20 to-miracle-gold/10"
              />
              <StatCard
                icon={MapPin}
                label={getTranslation('user.countriesVisited', 'Countries')}
                value={statsLoading ? "..." : countriesVisited}
                color="text-miracle-teal"
                bgColor="from-miracle-teal/20 to-miracle-teal/10"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-2 sm:space-y-3 pt-3 sm:pt-4 border-t border-gray-200">
              <ActionButton
                icon={Settings}
                label={getTranslation('user.settings', 'Account Settings')}
              />
              <ActionButton
                icon={LogOut}
                label={getTranslation('navigation.signOut', 'Sign Out')}
                onClick={handleSignOut}
                variant="danger"
              />
            </div>

            {/* Footer */}
            <div className="flex justify-center pt-3 sm:pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center px-2">
                {getTranslation('user.madeWithLove', 'Made with ❤️ for the global community')}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
