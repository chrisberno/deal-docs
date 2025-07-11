# Claude AI Assistant Guide for Deal Docs

This file contains essential information for Claude AI assistants working on this Deal Docs project.

## Project Overview

**Deal Docs** is based on Papermark - an open-source alternative to DocSend for secure document sharing with analytics.

- **Repository**: Deal Docs document sharing platform (based on Papermark)
- **Tech Stack**: Next.js 14, TypeScript, Prisma, PostgreSQL, Tailwind CSS
- **Purpose**: Secure document sharing with detailed analytics and tracking

## Key Information

### Architecture
- **Frontend**: Next.js 14 with App Router
- **Backend**: Next.js API routes 
- **Database**: PostgreSQL with Prisma ORM
- **Storage**: Vercel Blob or AWS S3
- **Analytics**: Tinybird for real-time analytics
- **Authentication**: NextAuth.js with passkey support
- **Payments**: Stripe integration
- **Email**: Resend for transactional emails

### Important Files & Directories
- `/prisma/schema/` - Database schema files (split across multiple .prisma files)
- `/app/` - Next.js app directory with routes and components
- `/lib/` - Core business logic and utilities
- `/components/` - Reusable UI components using shadcn/ui
- `/ee/` - Enterprise edition features
- `.env.example` - Environment variable template

### Database Schema
The database uses a sophisticated schema with key models:
- **User/Team/UserTeam** - User management and team collaboration
- **Document/DocumentVersion/DocumentPage** - Document storage and versioning
- **Link/View** - Shareable links and view tracking
- **Dataroom** - Collections of documents for deals
- **Viewer/ViewerGroup** - External viewer management
- **Agreement/Feedback** - Viewer interactions

### Environment Setup
Key environment variables (see `.env.example`):
- `POSTGRES_PRISMA_URL` - Database connection (Vercel Postgres recommended)
- `BLOB_READ_WRITE_TOKEN` - File storage (Vercel Blob)
- `RESEND_API_KEY` - Email service
- `TINYBIRD_TOKEN` - Analytics
- `NEXTAUTH_SECRET` - Authentication

### Commands
- `npm run dev` - Start development server
- `npm run dev:prisma` - Generate Prisma client and run migrations
- `npm run build` - Build for production
- `npm run lint` - Run ESLint

## Current Status

### ✅ Completed Setup
- Node.js v20.19.2 installed
- Dependencies installed via npm
- Environment variables configured
- Development server running on http://localhost:3000

### ⏳ Pending Setup
- Vercel Postgres database connection
- Prisma database migration
- File upload storage configuration
- Email service configuration

## Common Tasks

### Setting Up Database
1. Create Vercel Postgres database at https://vercel.com
2. Update `.env` with connection strings:
   ```
   POSTGRES_PRISMA_URL=postgresql://...
   POSTGRES_PRISMA_URL_NON_POOLING=postgresql://...
   ```
3. Run `npm run dev:prisma` to initialize

### Adding Features
- Follow existing patterns in `/app/` for routes
- Use shadcn/ui components from `/components/ui/`
- Add database changes via Prisma migrations
- Follow TypeScript strict mode conventions

### Debugging
- Check `npm run dev` console for errors
- Verify environment variables are set
- Check database connection with Prisma
- Review Next.js and Prisma documentation

## Security Notes
- Never expose secrets in commits
- Use environment variables for all sensitive data
- Follow NextAuth.js security practices
- Validate all user inputs
- Use Prisma for database queries to prevent SQL injection

## Deployment
- Designed for Vercel deployment
- Uses Vercel Postgres, Blob, and hosting
- Configure production environment variables in Vercel dashboard
- Run database migrations in production

## Tips for Claude Assistants
1. **Always read existing code patterns** before implementing new features
2. **Use existing components** from `/components/` rather than creating new ones
3. **Follow the database schema** - don't modify without understanding relationships
4. **Test locally** before suggesting production changes
5. **Check TODO.md** for current project priorities
6. **Reference `.env.example`** for required environment variables

## Resources
- [Papermark Documentation](https://docs.papermark.io) - if available
- [Next.js 14 Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Vercel Platform](https://vercel.com/docs)

---

*Last updated: 2025-07-11*
*Project status: Local development setup complete, database setup pending*