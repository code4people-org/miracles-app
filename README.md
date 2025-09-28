# Miracles - Share the World's Small Wonders

A beautiful web and mobile app where people around the world can share their small but meaningful "miracles" or positive experiences. Built with Next.js, TypeScript, Supabase, and Three.js for an immersive 3D world map experience.

## ✨ Features

- **Interactive World Map**: Explore miracles on a beautiful Leaflet-based world map with 5 different map styles
- **Miracle Sharing**: Submit your own miracles with photos, videos, and YouTube links
- **Social Features**: Upvote, comment, and share miracles with the community
- **Privacy Controls**: Choose from public, anonymous, or blurred location options
- **Smart Filtering**: Filter by category, time range, and proximity
- **Authentication**: Secure login with email/password or Google OAuth
- **Content Moderation**: Built-in reporting system for inappropriate content
- **Multi-language Support**: Available in 10 languages (EN, ES, FR, DE, PT, IT, JA, KO, ZH, AR)
- **Map Type Selection**: Choose from OpenStreetMap, Voyager, Positron, Dark Matter, or Satellite views
- **Help System**: Built-in help and guidance for new users
- **Responsive Design**: Works beautifully on desktop and mobile devices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd miracles
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=your_google_client_id
SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=your_google_client_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set up Google OAuth (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:54321/auth/v1/callback` (for local development)
   - `https://your-project.supabase.co/auth/v1/callback` (for production)

### 4. Run Database Migrations

```bash
# Start Supabase locally (optional, for development)
npx supabase start

# Or apply migrations to your hosted Supabase project
npx supabase db push
```

### 5. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your app!

## 🗄️ Database Schema

The app uses the following main tables:

- **profiles**: User profiles extending Supabase auth
- **miracles**: Main miracle posts with location data
- **upvotes**: User upvotes for miracles
- **comments**: Comments on miracles
- **reports**: Content moderation reports

## 🎨 Design System

The app uses a warm, inspirational color palette:

- **Gold** (#FFD700): Primary accent color
- **Teal** (#20B2AA): Secondary accent
- **Sky Blue** (#87CEEB): Supporting color
- **Soft Green** (#98FB98): Nature/health themes
- **Coral** (#FF7F50): Warm highlights

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Maps**: Leaflet (2D Interactive Map) with multiple tile providers
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **State Management**: React Context, Zustand
- **Internationalization**: next-intl
- **Performance**: Turbo (Next.js 15), Optimized re-rendering

## 📱 Mobile Support

The app is fully responsive and works great on mobile devices with:
- Touch-friendly map controls
- Mobile-optimized forms
- Responsive design patterns
- PWA-ready architecture

## 🔒 Privacy & Security

- Row Level Security (RLS) enabled on all tables
- Secure file uploads with size limits
- Content moderation system
- Privacy controls for location sharing
- GDPR-compliant data handling

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 📋 Recent Updates

### v1.1.0 - Map Refactoring & Performance
- 🗺️ Added 5 different map styles (OSM, Voyager, Positron, Dark Matter, Satellite)
- ⚡ Complete refactoring of map components with DRY principles
- 🚀 Performance optimizations with useMemo/useCallback
- 🌍 Enhanced internationalization (10 languages)
- 🎨 Improved UI/UX with help system and better mobile support
- 🔧 Upgraded to Next.js 15 with Turbo support

### v1.0.0 - Initial Release
- 🎉 Core miracle sharing functionality
- 🗺️ Interactive world map with Leaflet
- 🔐 Authentication with Supabase
- 📱 Responsive design for mobile and desktop
- 🎨 Beautiful UI with Tailwind CSS and Framer Motion

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the power of small, positive moments
- Built with love for the global community
- Thanks to all the open-source libraries that made this possible

---

**Share the miracles happening all around the world! 🌍✨**
