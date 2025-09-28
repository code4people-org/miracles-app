import type { Database } from '@/lib/supabase'

type Miracle = Database['public']['Tables']['miracles']['Row']

export const sampleMiracles: Omit<Miracle, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'upvotes_count' | 'comments_count' | 'is_approved'>[] = [
  {
    title: "A Stranger's Kindness",
    description: "Today a stranger paid for my coffee when I was short on change. It completely made my day and reminded me that kindness is everywhere.",
    category: "kindness",
    location: "(-74.0060,40.7128)" as any, // New York City
    location_name: "New York City, NY",
    privacy_level: "public",
    photo_url: null,
    video_url: null,
    youtube_url: null,
  },
  {
    title: "Beautiful Sunset",
    description: "Witnessed the most incredible sunset over the mountains today. Nature never fails to amaze me with its beauty.",
    category: "nature",
    location: "(-105.2705,40.0150)" as any, // Colorado
    location_name: "Rocky Mountains, CO",
    privacy_level: "public",
    photo_url: null,
    video_url: null,
    youtube_url: null,
  },
  {
    title: "Recovery Milestone",
    description: "After months of physical therapy, I finally walked without assistance today. Every small step is a victory!",
    category: "recovery",
    location: "(-87.6298,41.8781)" as any, // Chicago
    location_name: "Chicago, IL",
    privacy_level: "public",
    photo_url: null,
    video_url: null,
    youtube_url: null,
  },
  {
    title: "Family Reunion",
    description: "Got to see my grandparents after two years. Their hugs are the best medicine in the world.",
    category: "family",
    location: "(-122.4194,37.7749)" as any, // San Francisco
    location_name: "San Francisco, CA",
    privacy_level: "public",
    photo_url: null,
    video_url: null,
    youtube_url: null,
  },
  {
    title: "New Friendship",
    description: "Met someone at the park today who shares my love for photography. We spent hours talking and taking pictures together.",
    category: "friendship",
    location: "(-80.1918,25.7617)" as any, // Miami
    location_name: "Miami, FL",
    privacy_level: "public",
    photo_url: null,
    video_url: null,
    youtube_url: null,
  },
  {
    title: "Gratitude Practice",
    description: "Started a gratitude journal this week and already feel more positive. Taking time to appreciate the small things makes such a difference.",
    category: "gratitude",
    location: "(-97.5164,35.4676)" as any, // Oklahoma City
    location_name: "Oklahoma City, OK",
    privacy_level: "public",
    photo_url: null,
    video_url: null,
    youtube_url: null,
  },
  {
    title: "Health Breakthrough",
    description: "My doctor said my test results are the best they've been in years. All the lifestyle changes are finally paying off!",
    category: "health",
    location: "(-95.3698,29.7604)" as any, // Houston
    location_name: "Houston, TX",
    privacy_level: "public",
    photo_url: null,
    video_url: null,
    youtube_url: null,
  },
  {
    title: "Academic Achievement",
    description: "Finally passed my certification exam on the third try! Persistence and hard work really do pay off.",
    category: "achievement",
    location: "(-84.3880,33.7490)" as any, // Atlanta
    location_name: "Atlanta, GA",
    privacy_level: "public",
    photo_url: null,
    video_url: null,
    youtube_url: null,
  },
  {
    title: "Scientific Discovery",
    description: "My research team made a breakthrough that could help thousands of people. Science is amazing!",
    category: "discovery",
    location: "(-71.0589,42.3601)" as any, // Boston
    location_name: "Boston, MA",
    privacy_level: "public",
    photo_url: null,
    video_url: null,
    youtube_url: null,
  },
  {
    title: "Random Act of Kindness",
    description: "Helped an elderly person carry their groceries to their car today. Their smile was worth more than gold.",
    category: "kindness",
    location: "(-112.0740,33.4484)" as any, // Phoenix
    location_name: "Phoenix, AZ",
    privacy_level: "public",
    photo_url: null,
    video_url: null,
    youtube_url: null,
  },
  {
    title: "London Kindness",
    description: "A stranger helped me find my way when I was lost in the tube. Londoners are so helpful!",
    category: "kindness",
    location: "(-0.1276,51.5074)" as any, // London
    location_name: "London, UK",
    privacy_level: "public",
    photo_url: null,
    video_url: null,
    youtube_url: null,
  },
  {
    title: "Tokyo Discovery",
    description: "Found the most beautiful cherry blossom tree hidden in a small park. Sometimes the best discoveries are unexpected.",
    category: "discovery",
    location: "POINT(139.6917 35.6895)", // Tokyo
    location_name: "Tokyo, Japan",
    privacy_level: "public",
    photo_url: null,
    video_url: null,
    youtube_url: null,
  },
  {
    title: "Paris Friendship",
    description: "Met a fellow traveler at a café and we spent the whole afternoon sharing stories. Travel brings people together.",
    category: "friendship",
    location: "POINT(2.3522 48.8566)", // Paris
    location_name: "Paris, France",
    privacy_level: "public",
    photo_url: null,
    video_url: null,
    youtube_url: null,
  },
  {
    title: "Sydney Nature",
    description: "Watched the sunrise over the harbor this morning. Nature's beauty never gets old.",
    category: "nature",
    location: "POINT(151.2093 -33.8688)", // Sydney
    location_name: "Sydney, Australia",
    privacy_level: "public",
    photo_url: null,
    video_url: null,
    youtube_url: null,
  },
  {
    title: "Berlin Recovery",
    description: "Completed my first 5K run after months of training. Every step forward is a victory worth celebrating.",
    category: "recovery",
    location: "POINT(13.4050 52.5200)", // Berlin
    location_name: "Berlin, Germany",
    privacy_level: "public",
    photo_url: null,
    video_url: null,
    youtube_url: null,
  },
  {
    title: "Mumbai Gratitude",
    description: "Grateful for the simple joy of sharing a meal with my family. These moments are what life is about.",
    category: "gratitude",
    location: "POINT(72.8777 19.0760)", // Mumbai
    location_name: "Mumbai, India",
    privacy_level: "public",
    photo_url: null,
    video_url: null,
    youtube_url: null,
  },
  {
    title: "São Paulo Achievement",
    description: "Finally learned to speak Portuguese fluently! Language learning opens so many doors.",
    category: "achievement",
    location: "POINT(-46.6333 -23.5505)", // São Paulo
    location_name: "São Paulo, Brazil",
    privacy_level: "public",
    photo_url: null,
    video_url: null,
    youtube_url: null,
  }
]

// Convert sample data to full Miracle objects for display
export const getSampleMiracles = (): Miracle[] => {
  return sampleMiracles.map((miracle, index) => ({
    ...miracle,
    id: `sample-${index}`,
    user_id: 'sample-user',
    created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(), // Random date within last week
    updated_at: new Date().toISOString(),
    upvotes_count: Math.floor(Math.random() * 50) + 1,
    comments_count: Math.floor(Math.random() * 20),
    is_approved: true,
  }))
}
