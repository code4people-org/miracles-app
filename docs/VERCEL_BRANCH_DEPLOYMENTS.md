# Vercel Branch-Based Deployments

## Automatic Branch Deployments

Vercel automatically deploys all branches. Configure as follows:

### Production Branch: `main`
- **URL**: `https://miracleshappen.app` (production domain)
- **Auto-deploys**: On every push to `main`
- **Environment**: Production

### Preview/Staging Branch: `dev-release`
- **URL**: `https://your-app-git-dev-release.vercel.app` (preview URL)
- **Auto-deploys**: On every push to `dev-release`
- **Environment**: Preview/Staging

## Setup in Vercel Dashboard

1. **Go to Project Settings** → **Git**
   - Set **Production Branch** to `main`
   - Enable **Automatic deployments from Git**

2. **Configure Environment Variables** (Settings → Environment Variables)
   - Add variables for each environment:
     - **Production** (applies to `main` branch)
     - **Preview** (applies to `dev-release` and other branches)
     - **Development** (optional, for local dev)

3. **Recommended Environment Variables per Environment**

   **Production (`main`):**
   ```
   NEXT_PUBLIC_SUPABASE_URL=<production-supabase-url>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<production-anon-key>
   NEXT_PUBLIC_APP_URL=https://miracleshappen.app
   ```

   **Preview/Staging (`dev-release`):**
   ```
   NEXT_PUBLIC_SUPABASE_URL=<staging-supabase-url>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<staging-anon-key>
   NEXT_PUBLIC_APP_URL=https://your-app-git-dev-release.vercel.app
   ```

## Workflow

1. **Development**: Work on `dev` branch locally
2. **Testing**: Merge `dev` → `dev-release` → Auto-deploys to preview URL
3. **Production**: Merge `dev-release` → `main` → Auto-deploys to production

## Branch Protection (Optional)

In Vercel Settings → Git, you can:
- Require approval for production deployments
- Ignore specific branches
- Configure deployment hooks

## Notes

- All branches automatically get preview deployments
- Production branch (`main`) gets the production domain
- Preview branches get unique URLs: `your-app-git-<branch-name>.vercel.app`
- Environment variables can be scoped to specific branches/environments

