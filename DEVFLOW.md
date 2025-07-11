# Development Flow: Clone to Vercel Deployment

This document outlines the complete process to get Deal Docs (based on Papermark) from initial clone to successful Vercel deployment. Follow these steps for a clean setup.

## Prerequisites

- Node.js >= 18.17.0
- Git
- GitHub account
- Vercel account
- Neon account (for PostgreSQL database)

## Step 1: Initial Setup

### Clone and Install
```bash
git clone https://github.com/your-username/deal-docs.git
cd deal-docs
npm install
```

### Verify Node Version
```bash
node --version  # Should be >= 18.17.0
```

## Step 2: Environment Configuration

### Copy Environment Template
```bash
cp .env.example .env
```

### Update Basic Environment Variables
Edit `.env` and set these minimum required values:
```env
NEXTAUTH_SECRET=your-strong-secret-here-min-32-chars
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_MARKETING_URL=http://localhost:3000
NEXT_PUBLIC_APP_BASE_HOST=localhost
```

## Step 3: Database Setup (Neon PostgreSQL)

### Create Neon Database
1. Go to https://neon.tech
2. Sign up/login
3. Create new project
4. Choose default settings (no advanced options needed)
5. Copy the connection strings provided

### Update Environment with Database URLs
Add to your `.env`:
```env
POSTGRES_PRISMA_URL=postgresql://user:pass@host.neon.tech/db?connect_timeout=15&sslmode=require
POSTGRES_PRISMA_URL_NON_POOLING=postgresql://user:pass@host.neon.tech/db?sslmode=require
```

### Initialize Database
```bash
npm run dev:prisma
```
This runs Prisma generate + migrate deploy and creates all 72+ database tables.

## Step 4: Local Development Test

### Start Development Server
```bash
npm run dev
```
Visit http://localhost:3000 to verify the app works locally.

## Step 5: Vercel Deployment Setup

### Prepare for Deployment
```bash
# Test build locally first
npm run build

# Commit your changes
git add .
git commit -m "Initial setup for deployment"
git push origin main
```

### Deploy to Vercel
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Framework: Next.js (auto-detected)
4. Keep default build settings
5. **DO NOT** deploy yet - add database first

### Add Database to Vercel Project
1. In Vercel dashboard → your project → Storage tab
2. Browse Marketplace → select "Neon"
3. Connect your existing Neon database
4. Vercel will auto-configure the environment variables

### Deploy
Click "Deploy" - it should now succeed with database connected.

## Step 6: Known Issues & Fixes Applied

### Issue 1: Edge Function Size Limit
**Problem**: `app/api/og/yir/route.tsx` exceeded Vercel's 1MB edge function limit

**Solution**: Deleted the problematic endpoint entirely
```bash
rm app/api/og/yir/route.tsx
git commit -m "Remove problematic YIR OG image endpoint"
git push origin main
```

**Impact**: Removed non-essential "Year in Review" social sharing feature. Core functionality unaffected.

### Issue 2: Font Loading in OG Generation
**Problem**: Font path resolution failing in production builds

**Root Cause**: Using `@/` aliases in `new URL()` calls doesn't work properly in edge runtime

**Solution**: Removed the endpoint (see Issue 1). If rebuilding OG images later:
- Use absolute paths for fonts
- Consider external font CDNs
- Or move to Node.js runtime instead of edge

## Step 7: Verification

### Confirm Successful Deployment
1. Check Vercel deployment status shows "Ready"
2. Visit your production URL
3. Test basic functionality:
   - User registration/login
   - Document upload (may need file storage setup)
   - Link generation
   - Document viewing

## Optional: Additional Services

These are configured in environment variables but not required for basic functionality:

### File Storage (Vercel Blob)
- Add `BLOB_READ_WRITE_TOKEN` for document uploads
- Configure in Vercel dashboard → Storage → Blob

### Email Service (Resend)
- Add `RESEND_API_KEY` for email notifications
- Sign up at https://resend.com

### Analytics (Tinybird)
- Add `TINYBIRD_TOKEN` for detailed analytics
- Sign up at https://tinybird.co

### Authentication (Google OAuth)
- Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- Configure in Google Cloud Console

## Troubleshooting

### Deployment Fails
1. Check Vercel deployment logs
2. Test `npm run build` locally first
3. Verify all required environment variables are set
4. Ensure database connection strings are correct

### Database Connection Issues
1. Verify Neon database is running
2. Check connection strings in `.env`
3. Run `npm run dev:prisma` to test connection
4. Ensure IP allowlisting if required by Neon

### Edge Function Errors
1. Check for large imports in API routes
2. Verify edge runtime compatibility
3. Consider moving to Node.js runtime if needed
4. Remove or simplify problematic endpoints

## Project Structure Notes

- `/app` - Next.js App Router routes and API endpoints
- `/components` - React components (uses shadcn/ui)
- `/lib` - Core business logic and utilities
- `/prisma` - Database schema and migrations
- `/ee` - Enterprise edition features

## Environment Variables Summary

**Required for deployment:**
- `NEXTAUTH_SECRET` - Authentication secret
- `POSTGRES_PRISMA_URL` - Database connection (pooled)
- `POSTGRES_PRISMA_URL_NON_POOLING` - Database connection (direct)

**Optional but recommended:**
- `BLOB_READ_WRITE_TOKEN` - File storage
- `RESEND_API_KEY` - Email service
- `TINYBIRD_TOKEN` - Analytics
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - OAuth

## Success Criteria

✅ Local development server runs on http://localhost:3000
✅ Database migrations complete (72+ tables created)
✅ Vercel deployment shows "Ready" status
✅ Production app loads and basic navigation works
✅ No edge function size limit errors

---

*This devflow was created during initial setup on 2025-07-11. Update as needed for future deployments.*