export type PrayerCategory = 
  | 'health'
  | 'family'
  | 'work'
  | 'relationships'
  | 'spiritual_growth'
  | 'financial'
  | 'education'
  | 'peace'
  | 'grief'
  | 'other'

export type PrayerUrgency = 'low' | 'medium' | 'high' | 'urgent'

export interface PrayerCategoryInfo {
  value: PrayerCategory
  label: string
  icon: string
  color: string
  emoji: string
}

export interface PrayerUrgencyInfo {
  value: PrayerUrgency
  label: string
  color: string
  emoji: string
  description: string
}

export const prayerCategories: PrayerCategoryInfo[] = [
  {
    value: 'health',
    label: 'Health & Healing',
    icon: '🏥',
    color: '#10B981', // Green
    emoji: '🏥'
  },
  {
    value: 'family',
    label: 'Family & Relationships',
    icon: '👨‍👩‍👧‍👦',
    color: '#F59E0B', // Amber
    emoji: '👨‍👩‍👧‍👦'
  },
  {
    value: 'work',
    label: 'Work & Career',
    icon: '💼',
    color: '#3B82F6', // Blue
    emoji: '💼'
  },
  {
    value: 'relationships',
    label: 'Relationships',
    icon: '💕',
    color: '#EC4899', // Pink
    emoji: '💕'
  },
  {
    value: 'spiritual_growth',
    label: 'Spiritual Growth',
    icon: '🙏',
    color: '#8B5CF6', // Purple
    emoji: '🙏'
  },
  {
    value: 'financial',
    label: 'Financial Needs',
    icon: '💰',
    color: '#F59E0B', // Amber
    emoji: '💰'
  },
  {
    value: 'education',
    label: 'Education',
    icon: '📚',
    color: '#06B6D4', // Cyan
    emoji: '📚'
  },
  {
    value: 'peace',
    label: 'Peace & Comfort',
    icon: '🕊️',
    color: '#84CC16', // Lime
    emoji: '🕊️'
  },
  {
    value: 'grief',
    label: 'Grief & Loss',
    icon: '💔',
    color: '#6B7280', // Gray
    emoji: '💔'
  },
  {
    value: 'other',
    label: 'Other',
    icon: '✨',
    color: '#D3D3D3', // Light Gray
    emoji: '✨'
  }
]

export const prayerUrgencies: PrayerUrgencyInfo[] = [
  {
    value: 'low',
    label: 'Low',
    color: '#10B981', // Green
    emoji: '🟢',
    description: 'General prayer request'
  },
  {
    value: 'medium',
    label: 'Medium',
    color: '#F59E0B', // Amber
    emoji: '🟡',
    description: 'Important but not urgent'
  },
  {
    value: 'high',
    label: 'High',
    color: '#F97316', // Orange
    emoji: '🟠',
    description: 'Urgent prayer needed'
  },
  {
    value: 'urgent',
    label: 'Urgent',
    color: '#EF4444', // Red
    emoji: '🔴',
    description: 'Immediate prayer needed'
  }
]

// Utility functions
export const getPrayerCategoryInfo = (category: PrayerCategory): PrayerCategoryInfo | undefined => {
  return prayerCategories.find(cat => cat.value === category)
}

export const getPrayerCategoryColor = (category: PrayerCategory): string => {
  return getPrayerCategoryInfo(category)?.color || '#D3D3D3'
}

export const getPrayerCategoryEmoji = (category: PrayerCategory): string => {
  return getPrayerCategoryInfo(category)?.emoji || '✨'
}

export const getPrayerCategoryIcon = (category: PrayerCategory): string => {
  return getPrayerCategoryInfo(category)?.icon || '✨'
}

export const getPrayerCategoryLabel = (category: PrayerCategory): string => {
  return getPrayerCategoryInfo(category)?.label || 'Other'
}

export const getPrayerUrgencyInfo = (urgency: PrayerUrgency): PrayerUrgencyInfo | undefined => {
  return prayerUrgencies.find(urg => urg.value === urgency)
}

export const getPrayerUrgencyColor = (urgency: PrayerUrgency): string => {
  return getPrayerUrgencyInfo(urgency)?.color || '#F59E0B'
}

export const getPrayerUrgencyEmoji = (urgency: PrayerUrgency): string => {
  return getPrayerUrgencyInfo(urgency)?.emoji || '🟡'
}

export const getPrayerUrgencyLabel = (urgency: PrayerUrgency): string => {
  return getPrayerUrgencyInfo(urgency)?.label || 'Medium'
}

export const getPrayerUrgencyDescription = (urgency: PrayerUrgency): string => {
  return getPrayerUrgencyInfo(urgency)?.description || 'Important but not urgent'
}
