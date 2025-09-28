'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import IconButton from './IconButton'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  position?: 'center' | 'bottom' | 'right'
  className?: string
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  position = 'center',
  className = ''
}: ModalProps) {
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md", 
    lg: "max-w-lg"
  }
  
  const positionClasses = {
    center: "flex items-center justify-center p-4",
    bottom: "flex items-end justify-center p-4",
    right: "flex items-center justify-end p-4"
  }
  
  const modalPositionClasses = {
    center: "relative",
    bottom: "absolute bottom-6 left-6 right-6",
    right: "absolute right-0 top-0 h-full w-80 max-w-[85vw]"
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 modal-overlay bg-black/20 backdrop-blur-sm z-30 ${positionClasses[position]}`}
          onClick={onClose}
        >
          <motion.div
            initial={position === 'center' ? { y: 50, opacity: 0 } : position === 'bottom' ? { opacity: 0, scale: 0.9, y: 20 } : { x: '100%' }}
            animate={position === 'center' ? { y: 0, opacity: 1 } : position === 'bottom' ? { opacity: 1, scale: 1, y: 0 } : { x: 0 }}
            exit={position === 'center' ? { y: 50, opacity: 0 } : position === 'bottom' ? { opacity: 0, scale: 0.9, y: 20 } : { x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`${modalPositionClasses[position]} ${sizeClasses[size]} w-full bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-miracle-gold/20 modal-content ${className}`}
            onClick={(e) => e.stopPropagation()}
          >
            {title && (
              <div className="flex items-center justify-between p-6 pb-0">
                <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                <IconButton
                  icon={X}
                  onClick={onClose}
                  variant="ghost"
                  size="sm"
                  title="Close"
                />
              </div>
            )}
            <div className={title ? "p-6 pt-4" : "p-6"}>
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
