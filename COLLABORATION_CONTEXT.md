# Deal Docs - Strategic Collaboration Context

**🎯 For AI agents and team members**: This document provides strategic context for the Deal Docs project. Read this first, then refer to `CLAUDE.md` for technical implementation details.

---

## 🚀 Project Vision

**Deal Docs** is a self-hosted enterprise dataroom platform that replaces $50k+/year solutions like Ansarada, Firmex, and Intralinks.

**Core Value Proposition:**
- Enterprise-grade document sharing with advanced analytics
- OKTA OIDC authentication for enterprise SSO
- Self-hosted deployment = unlimited features without subscription costs
- Team-based multi-tenancy with granular permissions

---

## 👤 User Profile & Preferences

**Technical Approach:**
- Prefers technical documentation over marketing content
- Values quantified decision-making with scoring frameworks
- Wants clean commits without AI branding
- Emphasizes developer-friendly onboarding

**Strategic Thinking:**
- Big picture orientation with implementation focus
- Interested in revenue models and infrastructure scaling
- Values systematic planning with measurable outcomes

---

## 🏗️ Technical Architecture Overview

**Current Stack:**
- Next.js 14 with App Router + TypeScript
- Prisma ORM with PostgreSQL (Neon for development)
- NextAuth.js with OKTA OIDC provider
- Vercel deployment with environment-based feature flags

**Key Technical Decisions:**
1. **Authentication**: Chose OKTA over Hanko for enterprise compatibility
2. **Self-Hosted Mode**: Environment flags bypass all subscription limitations
3. **Multi-tenancy**: 80% ready - team-based data isolation already implemented
4. **Storage**: Flexible architecture supports Vercel Blob, AWS S3, MinIO

---

## 📊 Strategic Scoring Framework

All major decisions are evaluated using:
- **Difficulty Score** (1-10): Implementation complexity
- **Market Impact Score** (1-10): Customer value potential  
- **Revenue Impact Score** (1-10): Business growth potential

**Example Applications:**
- Hybrid Storage Strategy: Difficulty 7, Market 8, Revenue 9
- Multi-tenancy Enhancement: Difficulty 3, Market 9, Revenue 10
- AI/ML Integration: Difficulty 8, Market 7, Revenue 8

---

## 🎯 Strategic Opportunities Identified

### 1. **Multi-Tenancy SaaS Transformation**
- **Current State**: 80% ready (team-based isolation exists)
- **Gap**: Billing integration + tenant management UI
- **Opportunity**: $50-500/month per tenant recurring revenue

### 2. **AWS Infrastructure Scaling**
- **Vision**: ECS + RDS + S3 + CloudFront architecture
- **Benefits**: Enterprise scalability + compliance readiness
- **Timeline**: 3-6 months for full implementation

### 3. **AI/ML Enhancement Features**
- **Document Classification**: Auto-organize uploads
- **Smart Analytics**: Behavioral insights from viewing patterns
- **RAG System**: Q&A over document collections
- **Revenue Model**: $10-50/month premium tiers

### 4. **Hybrid Storage Strategy**
- **Differentiator**: "Bring your own storage" dataroom platform
- **Markets**: Government, finance, healthcare (data sovereignty requirements)
- **Implementation**: Storage abstraction layer + compliance frameworks

---

## 🔄 Development Workflow

**Established Patterns:**
1. Use todo lists for task management and progress tracking
2. Follow existing code conventions and patterns
3. Run linting/typechecking before commits
4. Create comprehensive documentation for future developers

**Testing Strategy:**
- Check README or search codebase for testing commands
- Never assume test frameworks - always verify first

**Deployment Process:**
- Environment variables drive feature flags
- Self-hosted mode unlocks all enterprise features
- OKTA integration handles enterprise authentication

---

## 🤝 Collaboration Guidelines

**For AI Agents:**
1. Read this document first for strategic context
2. Review `CLAUDE.md` for implementation history
3. Use todo lists to track progress and communicate status
4. Follow established coding patterns and conventions

**For Team Members:**
- All strategic decisions include difficulty/market/revenue scoring
- Technical changes should align with self-hosted enterprise vision
- Documentation is critical for project continuity

---

## 📈 Future Roadmap Priorities

**Phase 1**: Multi-tenancy SaaS features (3-6 months)
**Phase 2**: AWS infrastructure migration (6-12 months)  
**Phase 3**: AI/ML feature integration (12-18 months)
**Phase 4**: Advanced compliance & hybrid storage (18+ months)

Each phase builds toward the vision of becoming the definitive self-hosted alternative to expensive enterprise dataroom solutions.

---

*This document captures strategic context from extensive planning sessions. For sensitive details and private notes, see `PRIVATE_NOTES.md` (local only).*