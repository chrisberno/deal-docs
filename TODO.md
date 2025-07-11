# Deal Docs TODO List

## Setup & Configuration
- [ ] Set up Vercel Postgres database
- [ ] Initialize database with Prisma migrations
- [ ] Configure Vercel Blob storage for file uploads
- [ ] Set up Resend for email functionality
- [ ] Configure Tinybird for analytics
- [ ] Set up Google OAuth for authentication

## Local Development
- [x] Node.js installed (v20.19.2)
- [x] Dependencies installed
- [x] Environment variables configured
- [x] Development server running (http://localhost:3000)
- [ ] Database connection working
- [ ] File upload functionality working
- [ ] Email sending working

## Deployment
- [ ] Deploy to Vercel
- [ ] Configure custom domain
- [ ] Set up production environment variables
- [ ] Test all functionality in production

## Feature Exploration
- [ ] Create test documents
- [ ] Test document sharing
- [ ] Explore datarooms functionality
- [ ] Test analytics features
- [ ] Try team collaboration features
- [ ] Test custom branding options

## Performance & Optimization
- [ ] Review bundle size
- [ ] Optimize images
- [ ] Test loading performance
- [ ] Review database queries
- [ ] **TECH DEBT**: Fix Vercel edge function size limit for YIR OG image generation
  - Current workaround: disabled edge runtime in `app/api/og/yir/route.tsx`
  - Need to optimize font loading or refactor image generation

## Security & Compliance
- [ ] Review authentication flow
- [ ] Test document access controls
- [ ] Verify email verification process
- [ ] Test password protection features

## Notes
- Deal Docs is based on Papermark - an open-source DocSend alternative
- Built with Next.js 14, TypeScript, Prisma, PostgreSQL
- Designed for secure document sharing with analytics
- Author-recommended stack: Vercel (hosting), Vercel Postgres (DB), Vercel Blob (storage)