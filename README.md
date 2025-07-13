<div align="center">
  <h1 align="center">Deal Docs</h1>
  <h3>Enterprise dataroom platform with OKTA SSO - Self-hosted with unlimited features.</h3>
</div>

<div align="center">
  <strong>🏢 Enterprise Dataroom • 🔐 OKTA OIDC • 🚀 Self-Hosted • 💰 $50k+ Value</strong>
</div>

<br/>

<div align="center">
  <a href="https://github.com/mfts/papermark/stargazers"><img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/mfts/papermark"></a>
  <a href="https://twitter.com/papermarkio"><img alt="Twitter Follow" src="https://img.shields.io/twitter/follow/papermarkio"></a>
  <a href="https://github.com/mfts/papermark/blob/main/LICENSE"><img alt="License" src="https://img.shields.io/badge/license-AGPLv3-purple"></a>
</div>

<br/>

Deal Docs is a self-hosted enterprise dataroom platform based on Papermark, featuring OKTA OIDC authentication and unlimited access to all premium features through our subscription bypass implementation.

## 🎯 Enterprise Value Unlocked

**💰 Replaces $50,000+/year solutions like:**
- Ansarada ($1000+/month)
- Firmex ($500+/month) 
- Intralinks ($1500+/month)
- DealRoom ($400+/month)

**🔓 All Premium Features Included:**
- ✅ **Unlimited Datarooms** (normally $400+/month)
- ✅ **OKTA OIDC Integration** (enterprise SSO)
- ✅ **Custom Branding & Domains** (normally pro tier)
- ✅ **Advanced Analytics & Audit Trails** (normally business tier)
- ✅ **Granular Permissions & User Groups** (enterprise tier)
- ✅ **NDA Integration & Watermarking** (premium tier)
- ✅ **Real-time Collaboration & Chat** (business tier)

## 🚀 Key Features

### 🔐 Enterprise Authentication
- **OKTA OIDC Integration** - Single sign-on for your organization
- **Multi-provider Auth** - Google, LinkedIn, email, and passkey support
- **User Management** - Team-based access control

### 📁 Advanced Dataroom Management  
- **Hierarchical Folder Structure** - Unlimited nesting and organization
- **Granular Permissions** - Document and folder-level access control
- **Bulk Operations** - Upload, download, and manage multiple files
- **Version Control** - Track document revisions and changes

### 📊 Enterprise Analytics
- **Real-time View Tracking** - See who accessed what and when
- **Detailed Audit Trails** - Complete access history and logs
- **Custom Analytics** - Page-by-page engagement metrics
- **Export Capabilities** - Download reports and usage data

### 🎨 Professional Branding
- **Custom Domains** - Use your own branded URLs
- **White-label Interface** - Remove all third-party branding  
- **Custom Logos & Colors** - Match your corporate identity
- **Dynamic Watermarking** - Protect sensitive documents

## Demo

![Papermark Welcome GIF](.github/images/papermark-welcome.gif)

## Tech Stack

- [Next.js](https://nextjs.org/) – Framework
- [TypeScript](https://www.typescriptlang.org/) – Language
- [Tailwind](https://tailwindcss.com/) – CSS
- [shadcn/ui](https://ui.shadcn.com) - UI Components
- [Prisma](https://prisma.io) - ORM [![Made with Prisma](https://made-with.prisma.io/dark.svg)](https://prisma.io)
- [PostgreSQL](https://www.postgresql.org/) - Database
- [NextAuth.js](https://next-auth.js.org/) – Authentication
- [Tinybird](https://tinybird.co) – Analytics
- [Resend](https://resend.com) – Email
- [Stripe](https://stripe.com) – Payments
- [Vercel](https://vercel.com/) – Hosting

## ⚡ Quick Start Guide

### Prerequisites

**Required:**
- Node.js (version >= 18.18.0)
- PostgreSQL Database ([Neon](https://neon.tech) recommended)
- OKTA account for SSO authentication

**Optional but Recommended:**
- [Vercel Blob](https://vercel.com/storage/blob) or [AWS S3](https://aws.amazon.com/s3/) for file storage
- [Resend](https://resend.com) for email notifications
- [Vercel](https://vercel.com) for hosting

### 1. Clone and Setup

```shell
git clone https://github.com/your-username/deal-docs.git
cd deal-docs
npm install
```

### 2. Environment Configuration

```shell
cp .env.example .env
```

**Essential Environment Variables:**
```env
# Database (Neon PostgreSQL)
POSTGRES_PRISMA_URL=postgresql://user:pass@host.neon.tech/db
POSTGRES_PRISMA_URL_NON_POOLING=postgresql://user:pass@host.neon.tech/db

# Authentication
NEXTAUTH_SECRET=your-strong-secret-min-32-chars
NEXTAUTH_URL=http://localhost:3000

# OKTA OIDC (Enterprise SSO)
OKTA_CLIENT_ID=your_okta_client_id
OKTA_CLIENT_SECRET=your_okta_client_secret  
OKTA_ISSUER=https://your-domain.okta.com/oauth2/default

# Enterprise Feature Unlock
SELF_HOSTED=true
NEXT_PUBLIC_SELF_HOSTED=true
```

### 3. Database Setup

```shell
# Initialize database with all 72+ tables
npm run dev:prisma
```

### 4. Start Development

```shell
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) - you'll have access to:
- ✅ **Unlimited datarooms** (no trial restrictions)
- ✅ **All enterprise features** unlocked
- ✅ **OKTA SSO login** ready to use

### 5. OKTA OIDC Setup

1. **Create OKTA Application:**
   - Go to OKTA Admin Console
   - Applications → Create App Integration  
   - Choose "OIDC - OpenID Connect"
   - Application type: "Web Application"

2. **Configure Redirect URIs:**
   ```
   http://localhost:3000/api/auth/callback/okta    # Development
   https://your-domain.vercel.app/api/auth/callback/okta  # Production
   ```

3. **Copy Credentials to .env:**
   - Client ID → `OKTA_CLIENT_ID`
   - Client Secret → `OKTA_CLIENT_SECRET`
   - Issuer URI → `OKTA_ISSUER`

## 🚀 Deployment to Vercel

### Production Deployment

1. **Push to GitHub:**
   ```shell
   git add .
   git commit -m "Initial setup for deployment"
   git push origin main
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Framework: Next.js (auto-detected)
   - **Add all environment variables before deploying**

3. **Essential Production Environment Variables:**
   ```env
   NEXTAUTH_URL=https://your-project.vercel.app
   OKTA_CLIENT_ID=your_okta_client_id
   OKTA_CLIENT_SECRET=your_okta_client_secret
   SELF_HOSTED=true
   NEXT_PUBLIC_SELF_HOSTED=true
   POSTGRES_PRISMA_URL=your_neon_connection_string
   POSTGRES_PRISMA_URL_NON_POOLING=your_neon_direct_connection
   ```

### 🎯 Verification Checklist

After deployment, verify these enterprise features work:

- ✅ **OKTA SSO Login** - Sign in with your organization account
- ✅ **Unlimited Datarooms** - Navigate to `/datarooms` (no upgrade prompts)
- ✅ **Document Upload** - Test file sharing functionality  
- ✅ **Analytics Dashboard** - View document tracking data
- ✅ **Custom Branding** - No subscription restrictions

## 📊 Optional Integrations

### Analytics (Tinybird)
For advanced analytics, configure Tinybird:

```shell
# Install Tinybird CLI
pip install tinybird-cli

# Navigate to analytics config
cd lib/tinybird

# Deploy data sources
tb push datasources/*
tb push endpoints/get_*
```

Add to `.env`:
```env
TINYBIRD_TOKEN=your_tinybird_token
```

## 📚 Additional Documentation

- **[DEVFLOW.md](./DEVFLOW.md)** - Complete deployment guide from clone to production
- **[CLAUDE.md](./CLAUDE.md)** - Technical implementation details and project history

## 🔧 Development Scripts

```shell
npm run dev              # Start development server
npm run build            # Build for production
npm run dev:prisma       # Generate Prisma client + run migrations
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
npm run email            # Start email development server (port 3001)
```

## 🛠️ Troubleshooting

### Common Issues

**Build fails with Hanko errors:**
```env
# Add dummy values to .env
HANKO_API_KEY=dummy-not-used
NEXT_PUBLIC_HANKO_TENANT_ID=dummy-not-used
```

**Database connection issues:**
```shell
# Test connection
npm run dev:prisma
```

**OKTA authentication not working:**
- Verify redirect URIs in OKTA console
- Check `OKTA_ISSUER` format: `https://domain.okta.com/oauth2/default`
- Ensure client credentials are correct

## Contributing

Deal Docs is based on the open-source Papermark project. We welcome contributions to improve the platform.

If you'd like to contribute, please fork the repository and make any changes you'd like. Pull requests are warmly welcome.

### Our Contributors ✨

<a href="https://github.com/mfts/papermark/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=mfts/papermark" />
</a>
