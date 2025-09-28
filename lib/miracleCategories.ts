export type MiracleCategory = 
  | 'kindness'
  | 'nature' 
  | 'health'
  | 'family'
  | 'friendship'
  | 'achievement'
  | 'recovery'
  | 'discovery'
  | 'gratitude'
  | 'other'

export interface MiracleCategoryInfo {
  value: MiracleCategory
  label: string
  icon: string
  color: string
  emoji: string
}

export const miracleCategories: MiracleCategoryInfo[] = [
  {
    value: 'kindness',
    label: 'Kindness',
    icon: '🤝',
    color: '#FFD700',
    emoji: '🤝'
  },
  {
    value: 'nature',
    label: 'Nature',
    icon: '🌱',
    color: '#98FB98',
    emoji: '🌱'
  },
  {
    value: 'health',
    label: 'Health',
    icon: '💚',
    color: '#87CEEB',
    emoji: '💚'
  },
  {
    value: 'family',
    label: 'Family',
    icon: '👨‍👩‍👧‍👦',
    color: '#FF7F50',
    emoji: '👨‍👩‍👧‍👦'
  },
  {
    value: 'friendship',
    label: 'Friendship',
    icon: '👫',
    color: '#20B2AA',
    emoji: '👫'
  },
  {
    value: 'achievement',
    label: 'Achievement',
    icon: '🏆',
    color: '#DDA0DD',
    emoji: '🏆'
  },
  {
    value: 'recovery',
    label: 'Recovery',
    icon: '🌅',
    color: '#F0E68C',
    emoji: '🌅'
  },
  {
    value: 'discovery',
    label: 'Discovery',
    icon: '🔍',
    color: '#FFB6C1',
    emoji: '🔍'
  },
  {
    value: 'gratitude',
    label: 'Gratitude',
    icon: '🙏',
    color: '#FFA07A',
    emoji: '🙏'
  },
  {
    value: 'other',
    label: 'Other',
    icon: '✨',
    color: '#D3D3D3',
    emoji: '✨'
  }
]

// Utility functions
export const getCategoryInfo = (category: MiracleCategory): MiracleCategoryInfo | undefined => {
  return miracleCategories.find(cat => cat.value === category)
}

export const getCategoryColor = (category: MiracleCategory): string => {
  return getCategoryInfo(category)?.color || '#D3D3D3'
}

export const getCategoryEmoji = (category: MiracleCategory): string => {
  return getCategoryInfo(category)?.emoji || '✨'
}

export const getCategoryIcon = (category: MiracleCategory): string => {
  return getCategoryInfo(category)?.icon || '✨'
}

export const getCategoryLabel = (category: MiracleCategory): string => {
  return getCategoryInfo(category)?.label || 'Other'
}
