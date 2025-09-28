# Vercel Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Code Preparation
- [x] Build test successful (`npm run build`)
- [x] All dependencies in `package.json`
- [x] TypeScript compilation successful
- [x] No linting errors
- [x] `vercel.json` configuration created

### 2. Environment Variables Setup
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- [ ] `NEXT_PUBLIC_APP_URL` (optional) - Your production domain

### 3. Supabase Configuration
- [ ] Production Supabase project created
- [ ] Database schema applied (run migration: `supabase/migrations/20251201000001_initial_schema.sql`)
- [ ] PostGIS extension enabled
- [ ] Storage bucket `miracle-media` created
- [ ] Authentication providers configured
- [ ] Site URL set to your Vercel domain
- [ ] Redirect URLs configured: `https://your-app.vercel.app/auth/callback`

### 4. Vercel Configuration
- [ ] Repository connected to Vercel
- [ ] Environment variables added in Vercel dashboard
- [ ] Build settings verified (Next.js auto-detected)
- [ ] Domain configured (if using custom domain)

## 🚀 Deployment Steps

1. **Push to Git Repository**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your repository
   - Add environment variables
   - Deploy

3. **Configure Supabase**
   - Update Site URL in Supabase Auth settings
   - Add redirect URLs
   - Test authentication flow

## 🧪 Post-Deployment Testing

- [ ] Homepage loads correctly
- [ ] Authentication (signup/login) works
- [ ] Map displays properly
- [ ] Miracle creation works
- [ ] File uploads work
- [ ] Internationalization works
- [ ] Mobile responsiveness
- [ ] Performance (Core Web Vitals)

## 🔧 Troubleshooting

### Common Issues:
1. **Build fails**: Check environment variables are set
2. **Auth not working**: Verify Supabase URLs and redirect URLs
3. **Maps not loading**: Check Leaflet CSS imports
4. **Database errors**: Ensure migration was applied

### Useful Commands:
```bash
# Test build locally
npm run build

# Check environment variables
vercel env ls

# View deployment logs
vercel logs
```

## 📊 Performance Monitoring

Consider enabling:
- Vercel Analytics
- Supabase Analytics
- Error tracking (Sentry, etc.)

## 🔒 Security Checklist

- [ ] Environment variables are secure
- [ ] RLS policies are properly configured
- [ ] CORS settings are correct
- [ ] File upload restrictions are in place
- [ ] Rate limiting is configured (if needed)
