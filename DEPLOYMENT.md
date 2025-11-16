# Vercel Deployment Guide

## Prerequisites

1. **Supabase Project**: Ensure you have a Supabase project set up with the required database schema
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com) if you haven't already
3. **Git Repository**: Your code should be in a Git repository (GitHub, GitLab, or Bitbucket)

## Environment Variables

Before deploying, you need to set up the following environment variables in Vercel:

### Required Variables:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

### Optional Variables:
- `NEXT_PUBLIC_APP_URL`: Your production domain (for redirects)

## Deployment Steps

### 1. Connect Repository to Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your Git repository
4. Vercel will automatically detect this as a Next.js project

### 2. Configure Environment Variables

1. In your Vercel project dashboard, go to "Settings" → "Environment Variables"
2. Add the following variables:
   - `NEXT_PUBLIC_SUPABASE_URL`: `https://your-project-ref.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key

### 3. Configure Supabase for Production

1. In your Supabase dashboard, go to "Settings" → "API"
2. Add your Vercel domain to the "Site URL" and "Redirect URLs":
   - Site URL: `https://miracleshappen.app`
   - Redirect URLs: `https://miracleshappen.app/auth/callback`

### 4. Deploy

1. Push your code to your Git repository
2. Vercel will automatically trigger a deployment
3. Your app will be available at `https://miracleshappen.app`

## Database Setup

Make sure your Supabase database has the required tables:
- `profiles`
- `miracles`
- `upvotes`
- `comments`
- `reports`

Run the migration in `supabase/migrations/20251201000001_initial_schema.sql` on your production database.

## Post-Deployment Checklist

- [ ] Verify environment variables are set correctly
- [ ] Test authentication flow (signup/login)
- [ ] Test miracle creation and display
- [ ] Verify internationalization is working
- [ ] Check that maps are loading correctly
- [ ] Test responsive design on mobile devices

## Troubleshooting

### Common Issues:

1. **Authentication not working**: Check that Supabase URLs are correctly configured
2. **Maps not loading**: Verify Leaflet CSS is being loaded
3. **Build failures**: Check that all dependencies are in `package.json`
4. **Environment variables**: Ensure all required variables are set in Vercel
5. **Function Runtime Error**: If you see "Function Runtimes must have a valid version", remove the `functions` section from `vercel.json` - Vercel auto-detects Next.js functions
6. **Build Command Issues**: Vercel automatically detects Next.js projects, so custom build commands are usually unnecessary

### Build Logs:
Check the build logs in Vercel dashboard if deployment fails.

## Performance Optimization

- Images are automatically optimized by Next.js
- Static assets are served from Vercel's CDN
- Consider enabling Vercel Analytics for performance monitoring
