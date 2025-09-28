'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface IconButtonProps {
  icon: LucideIcon
  onClick: () => void
  title?: string
  variant?: 'default' | 'primary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function IconButton({
  icon: Icon,
  onClick,
  title,
  variant = 'default',
  size = 'md',
  className = ''
}: IconButtonProps) {
  const baseClasses = "rounded-lg transition-colors duration-200 touch-manipulation"
  
  const variantClasses = {
    default: "bg-gray-100 hover:bg-gray-200 text-gray-700",
    primary: "bg-miracle-gold hover:bg-miracle-coral text-white",
    ghost: "hover:bg-gray-100 text-gray-600"
  }
  
  const sizeClasses = {
    sm: "p-1.5",
    md: "p-1.5 sm:p-2", 
    lg: "p-2 sm:p-3"
  }
  
  const iconSizeClasses = {
    sm: "w-3 h-3 sm:w-4 sm:h-4",
    md: "w-4 h-4 sm:w-5 sm:h-5",
    lg: "w-5 h-5 sm:w-6 sm:h-6"
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      title={title}
    >
      <Icon className={iconSizeClasses[size]} />
    </motion.button>
  )
}
