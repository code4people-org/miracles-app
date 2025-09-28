'use client'

import React, { useState, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, MapPin, Cross, Camera, Eye, EyeOff } from 'lucide-react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { prayerCategories, prayerUrgencies } from '@/lib/prayerCategories'

interface PrayerRequestFormProps {
  onClose: () => void
  onSubmit: () => void
  getTranslation: (key: string, fallback: string) => string
}

export default function PrayerRequestForm({ onClose, onSubmit, getTranslation }: PrayerRequestFormProps) {
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
    urgency: 'medium',
    privacy_level: 'public',
    location_name: '',
    is_anonymous: false,
  })
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)
  
  const photoInputRef = useRef<HTMLInputElement>(null)

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

  const uploadFile = async (file: File, path: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase.storage
        .from('miracle-media')
        .upload(`${user?.id}/${path}`, file)

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('miracle-media')
        .getPublicUrl(data.path)

      return publicUrl
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
      // Upload photo if any
      let photoUrl = null
      if (photoFile) {
        photoUrl = await uploadFile(photoFile, `prayer-photos/${Date.now()}-${photoFile.name}`)
      }

      // Create PostGIS POINT from lat/lng (longitude first, then latitude)
      const locationString = `(${location.lng},${location.lat})`

      // Insert prayer request into database
      const { error } = await supabase
        .from('prayer_requests')
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          urgency: formData.urgency,
          location: locationString,
          location_name: formData.location_name,
          privacy_level: formData.privacy_level,
          photo_url: photoUrl,
          is_anonymous: formData.is_anonymous,
        })

      if (error) throw error

      onSubmit()
    } catch (error: any) {
      setError(error.message || getTranslation('prayers.form.submitError', 'Failed to submit prayer request'))
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
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-800 rounded-full flex items-center justify-center">
                <Cross className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Request Prayer</h2>
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
                    step >= stepNum ? 'bg-purple-600' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {getTranslation('common.step', 'Step')} {step} {getTranslation('common.of', 'of')} 3: {step === 1 ? getTranslation('prayers.form.step1', 'Prayer Details') : step === 2 ? getTranslation('prayers.form.step2', 'Location & Privacy') : getTranslation('prayers.form.step3', 'Review & Submit')}
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

          {/* Step 1: Prayer Details */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Prayer Request Title *
                </label>
                <input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  maxLength={100}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-200"
                  placeholder={getTranslation('prayers.form.titlePlaceholder', 'Brief description of your prayer need...')}
                />
                <p className="text-xs text-gray-500 mt-1">{formData.title.length}/100 characters</p>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Prayer Details *
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  maxLength={1000}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder={getTranslation('prayers.form.descriptionPlaceholder', 'Share more details about your situation and what you\'re praying for...')}
                />
                <p className="text-xs text-gray-500 mt-1">{formData.description.length}/1000 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {getTranslation('prayers.form.categoryLabel', 'What category best describes your prayer need?')} *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {prayerCategories.map((category) => (
                    <motion.button
                      key={category.value}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setFormData({ ...formData, category: category.value })}
                      className={`p-2 rounded-lg border-2 transition-all duration-200 flex flex-col items-center ${
                        formData.category === category.value
                          ? 'border-purple-600 bg-purple-100'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="text-base mb-1">{category.icon}</div>
                      <div className="text-xs font-normal text-center leading-tight px-1 text-gray-700">{getTranslation(`prayers.categories.${category.value}`, category.label)}</div>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {getTranslation('prayers.form.urgencyLabel', 'How urgent is this prayer request?')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {prayerUrgencies.map((urgency) => (
                    <motion.button
                      key={urgency.value}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setFormData({ ...formData, urgency: urgency.value })}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 flex items-center space-x-2 ${
                        formData.urgency === urgency.value
                          ? 'border-purple-600 bg-purple-100'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <span className="text-lg">{urgency.emoji}</span>
                      <div className="text-left">
                        <div className="font-medium text-sm">{getTranslation(`prayers.urgency.${urgency.value}`, urgency.label)}</div>
                        <div className="text-xs text-gray-600">{urgency.description}</div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Location & Privacy */}
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
                    className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-600 transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <Camera className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">Upload a photo</span>
                  </button>
                  
                  {photoPreview && (
                    <div className="relative">
                      <Image
                        src={photoPreview}
                        alt={getTranslation('prayers.form.previewAlt', 'Preview')}
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
                    className="w-full p-4 border border-gray-300 rounded-lg hover:border-purple-600 transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-200"
                    placeholder={getTranslation('miracles.form.locationPlaceholder', 'Add a location name (e.g., Central Park, New York)')}
                  />
                </div>
              </div>

              {/* Privacy Settings */}
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
                          ? 'border-purple-600 bg-purple-100'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="font-medium text-gray-800">{option.label}</div>
                      <div className="text-sm text-gray-600">{option.description}</div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Anonymous Option */}
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="is_anonymous"
                  checked={formData.is_anonymous}
                  onChange={(e) => setFormData({ ...formData, is_anonymous: e.target.checked })}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <div>
                  <label htmlFor="is_anonymous" className="text-sm font-medium text-gray-700">
                    {getTranslation('prayers.form.anonymousLabel', 'Make this request anonymous')}
                  </label>
                  <p className="text-xs text-gray-600">
                    {getTranslation('prayers.form.anonymousDesc', 'Hide your name but show your location')}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Review & Submit */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">{getTranslation('prayers.form.reviewTitle', 'Review Your Prayer Request')}</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>Title:</strong> {formData.title}</p>
                  <p><strong>Category:</strong> {getTranslation(`prayers.categories.${formData.category}`, prayerCategories.find(c => c.value === formData.category)?.label || '')}</p>
                  <p><strong>Urgency:</strong> {getTranslation(`prayers.urgency.${formData.urgency}`, prayerUrgencies.find(u => u.value === formData.urgency)?.label || '')}</p>
                  <p><strong>Privacy:</strong> {privacyOptions.find(p => p.value === formData.privacy_level)?.label}</p>
                  {formData.is_anonymous && <p><strong>Anonymous:</strong> Yes</p>}
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
              {step === 1 ? getTranslation('prayers.form.cancel', 'Cancel') : getTranslation('prayers.form.back', 'Back')}
            </button>
            
            {step < 3 ? (
              <motion.button
                type="button"
                onClick={nextStep}
                disabled={step === 1 && (!formData.title || !formData.description || !formData.category)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700 transition-colors duration-200"
              >
                Next
              </motion.button>
            ) : (
              <motion.button
                type="submit"
                disabled={loading || !location}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700 transition-colors duration-200"
              >
                {loading ? getTranslation('prayers.form.sharing', 'Sharing...') : getTranslation('prayers.form.sharePrayer', 'Share Prayer Request')}
              </motion.button>
            )}
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
