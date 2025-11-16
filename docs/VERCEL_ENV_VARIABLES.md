# Vercel Environment Variables

Set in **Vercel Dashboard** → **Settings** → **Environment Variables**:

## Required

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `NEXT_PUBLIC_BACKEND_URL` - Backend API URL

## Optional

- `NEXT_PUBLIC_APP_URL` - Frontend URL (for OAuth redirects)
  - Production: `https://miracleshappen.app`
  - Preview: `https://your-app-git-dev-release.vercel.app`

## Environments

- **Production** → `main` branch → `miracleshappen.app`
- **Preview** → `dev-release` branch

Use different values for each environment (production vs staging Supabase/backend).

