'use client'

import React from 'react'
import { LucideIcon } from 'lucide-react'

interface GradientIconProps {
  icon: LucideIcon
  gradient: 'gold' | 'teal' | 'sky'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function GradientIcon({
  icon: Icon,
  gradient,
  size = 'md',
  className = ''
}: GradientIconProps) {
  const gradientClasses = {
    gold: "bg-gradient-to-br from-miracle-gold to-miracle-coral",
    teal: "bg-gradient-to-br from-miracle-teal to-miracle-sky", 
    sky: "bg-gradient-to-br from-miracle-sky to-miracle-teal"
  }
  
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-6 h-6 sm:w-8 sm:h-8",
    lg: "w-8 h-8 sm:w-10 sm:h-10"
  }
  
  const iconSizeClasses = {
    sm: "w-3 h-3",
    md: "w-3 h-3 sm:w-4 sm:h-4",
    lg: "w-4 h-4 sm:w-5 sm:h-5"
  }

  return (
    <div className={`${sizeClasses[size]} ${gradientClasses[gradient]} rounded-full flex items-center justify-center ${className}`}>
      <Icon className={`${iconSizeClasses[size]} text-white`} />
    </div>
  )
}
