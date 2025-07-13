# Development Flow: Clone to Vercel Deployment

This document outlines the complete process to get Deal Docs (based on Papermark) from initial clone to successful Vercel deployment. Follow these steps for a clean setup.

## 🎯 What You'll Build

**💰 Enterprise Value: $50,000+/year**
- **OKTA SSO Integration** - Enterprise authentication
- **Unlimited Datarooms** - No subscription limits  
- **Full Feature Access** - Everything unlocked
- **Self-Hosted Control** - Your data, your rules

**🏢 Enterprise Features:**
- **Hierarchical folder structure** with unlimited nesting
- **Granular permissions** (user groups, document-level access)  
- **Custom branding** (logos, colors, domains)
- **Analytics & audit trails** (who viewed what, when)
- **NDA integration** & dynamic watermarking
- **Real-time collaboration** with built-in chat
- **Bulk downloads** & document management

**🔐 Security & Access:**
- **OKTA OIDC** single sign-on for your team
- **Screenshot protection** & email verification
- **Domain allow/deny lists** & webhook integrations

**This Replaces Solutions Like:**
- **Ansarada** ($1000+/month)
- **Firmex** ($500+/month)  
- **Intralinks** ($1500+/month)
- **DealRoom** ($400+/month)

**For FREE with your self-hosted deployment!**

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
4. Vercel will auto-configure most environment variables

### CRITICAL: Add Missing Environment Variables
⚠️ **Neon integration doesn't set all required variables**

Go to Vercel Dashboard → Project → Settings → Environment Variables and add:

```env
POSTGRES_PRISMA_URL_NON_POOLING = postgresql://user:pass@host.neon.tech/db?sslmode=require
NEXTAUTH_SECRET = your-strong-secret-min-32-characters
NEXTAUTH_URL = https://your-project-url.vercel.app

# OKTA OIDC Authentication (Enterprise SSO)
OKTA_CLIENT_ID = your_okta_client_id
OKTA_CLIENT_SECRET = your_okta_client_secret

# Self-Hosted Feature Unlock (Unlimited Datarooms)
SELF_HOSTED = true
NEXT_PUBLIC_SELF_HOSTED = true

# Optional: Dummy values to prevent Hanko build errors
HANKO_API_KEY = dummy-not-used
NEXT_PUBLIC_HANKO_TENANT_ID = dummy-not-used
```

**Important Notes:**
- Use the **non-pooling** connection string from Neon for `POSTGRES_PRISMA_URL_NON_POOLING`
- Set each variable for: Production, Preview, Development
- Generate a strong random string for `NEXTAUTH_SECRET` (min 32 chars)
- Use your actual Vercel deployment URL for `NEXTAUTH_URL`

### Deploy
Click "Deploy" - should now succeed with all environment variables configured.

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

## Step 7: Enterprise Feature Unlock (Subscription Bypass)

### Self-Hosted Deployment Benefits
When you set `SELF_HOSTED=true` and `NEXT_PUBLIC_SELF_HOSTED=true`, you unlock ALL enterprise features without subscription limits:

**Technical Implementation:**
- **Backend Bypass**: Modified `ee/limits/server.ts` to return unlimited limits for self-hosted deployments
- **Frontend Bypass**: Updated `lib/swr/use-billing.ts` to return "datarooms-plus" plan automatically
- **Route Bypass**: Modified `pages/datarooms/index.tsx` to skip paywall redirects

**Features Unlocked:**
- **Unlimited Datarooms** (normally $400+/month)
- **Unlimited Users** (normally restricted)
- **Unlimited Documents & Links** (normally capped)
- **Custom Domains** (normally pro feature)
- **Advanced Analytics** (normally business feature)
- **Watermarking** (normally business feature)
- **Bulk Downloads** (normally premium)

**Code Changes Made:**
```typescript
// In ee/limits/server.ts
if (process.env.SELF_HOSTED === 'true') {
  return {
    users: 999,
    links: null, // unlimited
    documents: null, // unlimited
    datarooms: 999, // unlimited datarooms!
    // ... all enterprise features enabled
  };
}

// In lib/swr/use-billing.ts  
if (process.env.NEXT_PUBLIC_SELF_HOSTED === 'true') {
  return {
    plan: "datarooms-plus" as BasePlan,
    isDataroomsPlus: true,
    // ... unlimited plan returned
  };
}

// In pages/datarooms/index.tsx
useEffect(() => {
  // Skip redirect if self-hosted
  if (process.env.NEXT_PUBLIC_SELF_HOSTED === 'true') return;
  if (!isTrial && (isFree || isPro)) router.push("/documents");
}, [isTrial, isFree, isPro]);
```

## Step 8: Verification

### Confirm Successful Deployment
1. Check Vercel deployment status shows "Ready"
2. Visit your production URL
3. Test basic functionality:
   - User registration/login with OKTA
   - Document upload (may need file storage setup)
   - Link generation
   - Document viewing
4. **Test Enterprise Features:**
   - Navigate to `/datarooms` - should NOT redirect to upgrade
   - Create new datarooms without limits
   - Access all premium features without subscription prompts

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

### "Environment variable not found: POSTGRES_PRISMA_URL_NON_POOLING"
**Common Issue**: Neon integration only sets `POSTGRES_URL_NON_POOLING` but Prisma schema expects `POSTGRES_PRISMA_URL_NON_POOLING`

**Solution**:
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add `POSTGRES_PRISMA_URL_NON_POOLING` with the same value as `POSTGRES_URL_NON_POOLING`
3. Set for all environments (Production, Preview, Development)
4. Redeploy

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