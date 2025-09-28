import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Miracles - Share the World\'s Small Wonders',
  description: 'Discover and share the small but meaningful miracles happening all around the world. Join our community of positivity and inspiration.',
  keywords: 'miracles, positivity, inspiration, community, kindness, nature, health, gratitude',
  authors: [{ name: 'Miracles Team' }],
  openGraph: {
    title: 'Miracles - Share the World\'s Small Wonders',
    description: 'Discover and share the small but meaningful miracles happening all around the world.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Miracles - Share the World\'s Small Wonders',
    description: 'Discover and share the small but meaningful miracles happening all around the world.',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#FFD700',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
