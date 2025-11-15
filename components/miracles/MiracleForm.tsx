'use client'

import React, { useState, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, MapPin, Heart, Camera, Video, Link, Eye, EyeOff } from 'lucide-react'
import Image from 'next/image'
import { apiClient } from '@/lib/apiClient'
import { miracleCategories } from '@/lib/miracleCategories'

interface MiracleFormProps {
  onClose: () => void
  onSubmit: () => void
  getTranslation: (key: string, fallback: string) => string
}


export default function MiracleForm({ onClose, onSubmit, getTranslation }: MiracleFormProps) {
  const privacyOptions = [
    { value: 'public', label: getTranslation('miracles.privacy.public', 'Public'), description: getTranslation('miracles.privacy.publicDesc', 'Share your location and name') },
    { value: 'anonymous', label: getTranslation('miracles.privacy.anonymous', 'Anonymous'), description: getTranslation('miracles.privacy.anonymousDesc', 'Share your location but hide your name') },
    { value: 'blurred_location', label: getTranslation('miracles.privacy.blurred', 'Blurred Location'), description: getTranslation('miracles.privacy.blurredDesc', 'Show approximate location only') },
  ]
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    privacy_level: 'public',
    location_name: '',
    youtube_url: '',
  })
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)
  const [showLocationPicker, setShowLocationPicker] = useState(false)
  
  const photoInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError(getTranslation('miracles.form.geolocationError', 'Geolocation is not supported by this browser'))
      return
    }

    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
        setLoading(false)
      },
      (error) => {
        setError(getTranslation('miracles.form.locationError', 'Unable to get your location: {error}').replace('{error}', error.message))
        setLoading(false)
      }
    )
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError(getTranslation('miracles.form.photoSizeError', 'Photo must be smaller than 10MB'))
        return
      }
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onload = (e) => setPhotoPreview(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        setError(getTranslation('miracles.form.videoSizeError', 'Video must be smaller than 50MB'))
        return
      }
      setVideoFile(file)
      const reader = new FileReader()
      reader.onload = (e) => setVideoPreview(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const uploadFile = async (file: File, path: string): Promise<string | null> => {
    try {
      const folder = path.includes('photos') ? 'photos' : 'videos'
      const result = await apiClient.uploadFile('/api/v1/storage/upload', file, folder)
      return result.url
    } catch (error) {
      console.error('Error uploading file:', error)
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !location) return

    setLoading(true)
    setError('')

    try {
      // Upload files if any
      let photoUrl = null
      let videoUrl = null

      if (photoFile) {
        photoUrl = await uploadFile(photoFile, `photos/${Date.now()}-${photoFile.name}`)
      }

      if (videoFile) {
        videoUrl = await uploadFile(videoFile, `videos/${Date.now()}-${videoFile.name}`)
      }

      // Create PostGIS POINT from lat/lng (longitude first, then latitude)
      const locationString = `(${location.lng},${location.lat})`

      // Create miracle via backend API
      // Backend will validate content and set is_approved
      await apiClient.post('/api/v1/miracles', {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: locationString,
        location_name: formData.location_name,
        privacy_level: formData.privacy_level,
        photo_url: photoUrl,
        video_url: videoUrl,
        youtube_url: formData.youtube_url || null,
      })

      onSubmit()
    } catch (error: any) {
      setError(error.message || getTranslation('miracles.form.submitError', 'Failed to submit miracle'))
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    if (step === 1 && formData.title && formData.description && formData.category) {
      setStep(2)
    } else if (step === 2) {
      setStep(3)
    }
  }

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 modal-overlay flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.5)' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-miracle-gold to-miracle-coral rounded-full flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Share Your Miracle</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex items-center space-x-2">
              {[1, 2, 3].map((stepNum) => (
                <div
                  key={stepNum}
                  className={`flex-1 h-2 rounded-full ${
                    step >= stepNum ? 'bg-miracle-gold' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {getTranslation('common.step', 'Step')} {step} {getTranslation('common.of', 'of')} 3: {step === 1 ? getTranslation('miracles.form.step1', 'Basic Info') : step === 2 ? getTranslation('miracles.form.step2', 'Media & Location') : getTranslation('miracles.form.step3', 'Privacy & Submit')}
            </p>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
            >
              {error}
            </motion.div>
          )}

          {/* Step 1: Basic Information */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Miracle Title *
                </label>
                <input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  maxLength={100}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-miracle-gold focus:border-transparent transition-all duration-200"
                  placeholder={getTranslation('miracles.form.titlePlaceholder', 'Give your miracle a meaningful title...')}
                />
                <p className="text-xs text-gray-500 mt-1">{formData.title.length}/100 characters</p>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  maxLength={1000}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-miracle-gold focus:border-transparent transition-all duration-200 resize-none"
                  placeholder={getTranslation('miracles.form.descriptionPlaceholder', 'Tell us about your miracle... What happened? How did it make you feel?')}
                />
                <p className="text-xs text-gray-500 mt-1">{formData.description.length}/1000 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {miracleCategories.map((category) => (
                    <motion.button
                      key={category.value}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setFormData({ ...formData, category: category.value })}
                      className={`p-2 rounded-lg border-2 transition-all duration-200 flex flex-col items-center ${
                        formData.category === category.value
                          ? 'border-miracle-gold bg-miracle-gold/10'
                          : 'border-gray-200 hover:border-miracle-gold/50'
                      }`}
                    >
                      <div className="text-base mb-1">{category.icon}</div>
                      <div className="text-xs font-normal text-center leading-tight px-1 text-gray-700">{getTranslation(`miracles.categories.${category.value}`, category.label)}</div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Media & Location */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photo (Optional)
                </label>
                <div className="space-y-3">
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-miracle-gold transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <Camera className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">Upload a photo</span>
                  </button>
                  
                  {photoPreview && (
                    <div className="relative">
                      <Image
                        src={photoPreview}
                        alt={getTranslation('miracles.form.previewAlt', 'Preview')}
                        width={600}
                        height={192}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoPreview(null)
                          setPhotoFile(null)
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Video Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video (Optional)
                </label>
                <div className="space-y-3">
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-miracle-gold transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <Video className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">Upload a video</span>
                  </button>
                  
                  {videoPreview && (
                    <div className="relative">
                      <video
                        src={videoPreview}
                        controls
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setVideoPreview(null)
                          setVideoFile(null)
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* YouTube URL */}
              <div>
                <label htmlFor="youtube_url" className="block text-sm font-medium text-gray-700 mb-2">
                  YouTube Link (Optional)
                </label>
                <div className="relative">
                  <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="youtube_url"
                    type="url"
                    value={formData.youtube_url}
                    onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-miracle-gold focus:border-transparent transition-all duration-200"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={loading}
                    className="w-full p-4 border border-gray-300 rounded-lg hover:border-miracle-gold transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">
                      {loading ? getTranslation('miracles.form.gettingLocation', 'Getting location...') : getTranslation('miracles.form.useCurrentLocation', 'Use my current location')}
                    </span>
                  </button>
                  
                  {location && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-700">
                        Location found: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                      </p>
                    </div>
                  )}
                  
                  <input
                    type="text"
                    value={formData.location_name}
                    onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-miracle-gold focus:border-transparent transition-all duration-200"
                    placeholder={getTranslation('miracles.form.locationPlaceholder', 'Add a location name (e.g., Central Park, New York)')}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Privacy & Submit */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Privacy Settings
                </label>
                <div className="space-y-3">
                  {privacyOptions.map((option) => (
                    <motion.button
                      key={option.value}
                      type="button"
                      whileHover={{ scale: 1.01 }}
                      onClick={() => setFormData({ ...formData, privacy_level: option.value })}
                      className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                        formData.privacy_level === option.value
                          ? 'border-miracle-gold bg-miracle-gold/10'
                          : 'border-gray-200 hover:border-miracle-gold/50'
                      }`}
                    >
                      <div className="font-medium text-gray-800">{option.label}</div>
                      <div className="text-sm text-gray-600">{option.description}</div>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="bg-miracle-warm/50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Review Your Miracle</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>Title:</strong> {formData.title}</p>
                  <p><strong>Category:</strong> {getTranslation(`miracles.categories.${formData.category}`, miracleCategories.find(c => c.value === formData.category)?.label || '')}</p>
                  <p><strong>Privacy:</strong> {privacyOptions.find(p => p.value === formData.privacy_level)?.label}</p>
                  {location && <p><strong>Location:</strong> {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p>}
                </div>
              </div>
            </motion.div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={step === 1 ? onClose : prevStep}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              {step === 1 ? getTranslation('miracles.form.cancel', 'Cancel') : getTranslation('miracles.form.back', 'Back')}
            </button>
            
            {step < 3 ? (
              <motion.button
                type="button"
                onClick={nextStep}
                disabled={step === 1 && (!formData.title || !formData.description || !formData.category)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-miracle text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </motion.button>
            ) : (
              <motion.button
                type="submit"
                disabled={loading || !location}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-miracle text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? getTranslation('miracles.form.sharing', 'Sharing...') : getTranslation('miracles.form.shareMiracle', 'Share Miracle')}
              </motion.button>
            )}
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
