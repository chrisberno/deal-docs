# NPM Scripts Documentation

Comprehensive guide to all available npm scripts in Deal Docs and their purposes.

## 🚀 Core Development Scripts

### `npm run dev`
**Purpose:** Start the Next.js development server with hot reload  
**Command:** `next dev`  
**Usage:** Primary command for local development  
**Port:** http://localhost:3000  
**Features:**
- Hot module replacement (HMR)
- TypeScript compilation
- CSS/Tailwind processing
- API routes available
- Database connection active

**When to use:** Daily development work, testing features locally

---

### `npm run build` 
**Purpose:** Build optimized production bundle  
**Command:** `next build`  
**Output:** `.next/` directory with static assets  
**Includes:**
- Code minification and bundling
- Image optimization
- Static generation for eligible pages
- TypeScript compilation check
- ESLint validation

**When to use:** Before deployment, testing production builds locally

---

### `npm run start`
**Purpose:** Start production server using built assets  
**Command:** `next start`  
**Prerequisites:** Must run `npm run build` first  
**Port:** http://localhost:3000  

**When to use:** Testing production build locally, self-hosted production deployment

---

## 🗃️ Database Management Scripts

### `npm run dev:prisma`
**Purpose:** Initialize database for development  
**Command:** `npx prisma generate && npx prisma migrate deploy`  
**What it does:**
1. **Generate Prisma Client** - Creates typed database client
2. **Run Migrations** - Applies all pending schema changes
3. **Creates 72+ tables** - Full enterprise dataroom schema

**When to use:** 
- First time setup after cloning
- After pulling database schema changes
- When Prisma client is out of sync

**⚠️ Important:** Requires valid `POSTGRES_PRISMA_URL` in `.env`

---

### `npm run vercel-build`
**Purpose:** Production build for Vercel deployment  
**Command:** `prisma migrate deploy && next build`  
**Deployment-specific:** 
- Runs database migrations first
- Then builds application
- Used automatically by Vercel

**When to use:** Automatically triggered by Vercel, don't run manually

---

## 🎨 Code Quality Scripts

### `npm run lint`
**Purpose:** Run ESLint to check code quality  
**Command:** `next lint`  
**Checks:**
- TypeScript errors
- React best practices
- Accessibility issues
- Unused variables
- Code style consistency

**When to use:** Before committing code, fixing code quality issues

---

### `npm run format`
**Purpose:** Auto-format code with Prettier  
**Command:** `prettier --write "**/*.{js,jsx,ts,tsx,mdx}"`  
**Formats:**
- JavaScript/TypeScript files
- React components (JSX/TSX)
- Markdown documentation
- Enforces consistent style

**When to use:** Before committing, cleaning up code formatting

---

## 📧 Email Development Scripts

### `npm run email`
**Purpose:** Start email template development server  
**Command:** `email dev --dir ./components/emails --port 3001`  
**Features:**
- Preview email templates at http://localhost:3001
- Hot reload for email components
- Test different email clients
- Preview with sample data

**When to use:** Developing/testing transactional emails (welcome, notifications, etc.)

---

## ⚡ Background Jobs & Automation

### `npm run trigger:v3:dev`
**Purpose:** Start Trigger.dev development server  
**Command:** `npx trigger.dev@latest dev`  
**What it enables:**
- Background job processing
- Scheduled tasks
- Webhook handling
- Queue management

**Requirements:** `TRIGGER_SECRET_KEY` in environment  
**When to use:** Testing background jobs, scheduled operations

---

### `npm run trigger:v3:deploy`
**Purpose:** Deploy background jobs to Trigger.dev  
**Command:** `npx trigger.dev@latest deploy`  
**Deploys:**
- Job definitions
- Scheduled tasks
- Workflow configurations

**When to use:** Pushing job changes to production

---

## 💳 Payment & Webhook Scripts

### `npm run stripe:webhook`
**Purpose:** Listen for Stripe webhooks locally  
**Command:** `pkgx stripe listen --forward-to localhost:3000/api/stripe/webhook`  
**Features:**
- Forwards Stripe events to local API
- Tests payment flows
- Subscription management testing

**Requirements:** 
- Stripe CLI installed (`pkgx stripe`)
- Stripe account configured

**When to use:** Testing payment integration, subscription changes

---

## 🔧 Automatic Scripts

### `postinstall`
**Purpose:** Auto-run after `npm install`  
**Command:** `prisma generate`  
**What it does:**
- Regenerates Prisma client after dependency changes
- Ensures database client is up-to-date
- Prevents "Prisma client not found" errors

**When it runs:** Automatically after `npm install`

---

## 💡 Recommended Workflow

### Daily Development
```bash
# Start development
npm run dev

# In separate terminal for emails (if needed)
npm run email

# Check code quality
npm run lint
npm run format
```

### Before Deployment
```bash
# Test production build
npm run build
npm run start

# Format and lint
npm run format
npm run lint

# Test database
npm run dev:prisma
```

### First Time Setup
```bash
# Install dependencies and setup database
npm install          # Runs postinstall automatically
npm run dev:prisma   # Setup database
npm run dev          # Start development
```

## 🚨 Troubleshooting Common Script Issues

### `npm run dev` fails
**Common causes:**
- Port 3000 already in use: `lsof -ti:3000 | xargs kill -9`
- Database connection issue: Check `POSTGRES_PRISMA_URL` in `.env`
- Node version: Ensure Node.js >= 18.18.0

### `npm run dev:prisma` fails  
**Common causes:**
- Invalid database URL: Verify Neon connection string
- Network issues: Check internet connection
- Prisma version mismatch: `npm install @prisma/client@latest`

### `npm run build` fails
**Common causes:**
- TypeScript errors: Fix type issues first
- Missing environment variables: Check required env vars
- ESLint errors: Run `npm run lint` and fix issues

### Email script not working
**Common causes:**
- Port conflict: Change port in command
- Missing email components: Check `./components/emails` directory
- Dependencies: Ensure email packages are installed

---

## 📊 Script Performance Tips

**Speed up builds:**
- Use `npm run dev` for development (faster than rebuilding)
- Run `npm run format` before `npm run lint` (fewer lint errors)
- Use `npm run build` only when testing production

**Database efficiency:**
- Run `npm run dev:prisma` only when schema changes
- Keep database connection open during development
- Use database connection pooling in production

**Development workflow:**
- Keep `npm run dev` running continuously
- Use `npm run format` before committing
- Run `npm run build` before deploying