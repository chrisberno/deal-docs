# Security & Production Readiness Guide

Enterprise-grade security implementation and production deployment checklist for Deal Docs.

## 🛡️ Security Architecture Overview

### Multi-Layer Security Model
```
┌─────────────────────────────────────────────────────────┐
│                    Application Layer                   │
│  ┌─────────────────┐ ┌─────────────────┐ ┌───────────┐ │
│  │ Input Validation│ │   CSRF Protection│ │    XSS    │ │
│  │   (Zod/Joi)     │ │   (NextAuth)     │ │Prevention │ │
│  └─────────────────┘ └─────────────────┘ └───────────┘ │
└─────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────┐
│                  Authentication Layer                  │
│  ┌─────────────────┐ ┌─────────────────┐ ┌───────────┐ │
│  │   OKTA OIDC     │ │   JWT Tokens    │ │   Passkey │ │
│  │  (Enterprise)   │ │  (Secure)       │ │(Advanced) │ │
│  └─────────────────┘ └─────────────────┘ └───────────┘ │
└─────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────┐
│                   Authorization Layer                  │
│  ┌─────────────────┐ ┌─────────────────┐ ┌───────────┐ │
│  │      RBAC       │ │  Data Isolation │ │   API     │ │
│  │ (Role-Based)    │ │  (Team-Based)   │ │  Tokens   │ │
│  └─────────────────┘ └─────────────────┘ └───────────┘ │
└─────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────┐
│                     Data Layer                         │
│  ┌─────────────────┐ ┌─────────────────┐ ┌───────────┐ │
│  │   Encryption    │ │  SQL Injection  │ │   Audit   │ │
│  │  (At Rest/Transit)│ │   Protection   │ │   Logs    │ │
│  └─────────────────┘ └─────────────────┘ └───────────┘ │
└─────────────────────────────────────────────────────────┘
```

## 🔐 Authentication Security

### OKTA OIDC Implementation
**Security Benefits:**
- ✅ **Enterprise SSO** - Centralized identity management
- ✅ **MFA Support** - Multi-factor authentication required
- ✅ **Session Management** - Automatic timeout and refresh
- ✅ **Audit Trails** - Complete authentication logging

**Critical Security Configuration:**
```typescript
// pages/api/auth/[...nextauth].ts
{
  id: "okta",
  name: "OKTA", 
  type: "oauth",
  clientId: process.env.OKTA_CLIENT_ID as string,
  clientSecret: process.env.OKTA_CLIENT_SECRET as string,
  issuer: process.env.OKTA_ISSUER,
  
  // SECURITY: Verify JWT tokens
  jwks_endpoint: "https://your-domain.okta.com/oauth2/v1/keys",
  
  // SECURITY: Validate issuer to prevent token substitution  
  authorization: {
    url: "https://your-domain.okta.com/oauth2/v1/authorize",
    params: { scope: "openid profile email" }
  },
  
  // SECURITY: Allow account linking (enterprise requirement)
  allowDangerousEmailAccountLinking: true,
}
```

**Security Validation Checklist:**
- [ ] OKTA application configured with correct redirect URIs
- [ ] Client secret properly secured in environment variables
- [ ] JWT signature validation enabled
- [ ] Token expiration configured (recommended: 1 hour)
- [ ] Refresh token rotation enabled

### Session Security
```typescript
// NextAuth session configuration
session: {
  strategy: "jwt",
  maxAge: 30 * 24 * 60 * 60, // 30 days
  updateAge: 24 * 60 * 60,    // 24 hours
},

jwt: {
  maxAge: 60 * 60, // 1 hour - short for security
},

// SECURITY: Strong secret for JWT signing
// NEXTAUTH_SECRET must be ≥32 characters random string
```

## 🔒 Authorization & Access Control

### Role-Based Access Control (RBAC)
```typescript
// User roles hierarchy (highest to lowest privilege)
enum UserRole {
  OWNER = "OWNER",     // Full team control
  ADMIN = "ADMIN",     // Team management  
  MANAGER = "MANAGER", // Limited team management
  MEMBER = "MEMBER",   // Basic access
}

// Permission validation pattern
export async function checkTeamAccess(userId: string, teamId: string, requiredRole: UserRole) {
  const userTeam = await prisma.userTeam.findFirst({
    where: { userId, teamId },
    select: { role: true }
  });
  
  if (!userTeam) return false;
  
  const roleHierarchy = {
    OWNER: 4, ADMIN: 3, MANAGER: 2, MEMBER: 1
  };
  
  return roleHierarchy[userTeam.role] >= roleHierarchy[requiredRole];
}
```

### Data Isolation Strategy
```typescript
// All database queries MUST include team isolation
const documents = await prisma.document.findMany({
  where: {
    team: {
      users: {
        some: { userId: session.user.id } // Ensure user has team access
      }
    }
  }
});

// API middleware for automatic team filtering
export function withTeamAccess(handler: NextApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getServerSession(req, res, authOptions);
    if (!session) return res.status(401).json({ error: "Unauthorized" });
    
    // Inject team filtering into request context
    req.userTeams = await getUserTeams(session.user.id);
    
    return handler(req, res);
  };
}
```

## 🔐 Input Validation & Sanitization

### Zod Schema Validation
```typescript
// Example: Document upload validation
import { z } from 'zod';

const uploadDocumentSchema = z.object({
  name: z.string()
    .min(1, "Document name required")
    .max(255, "Name too long")
    .regex(/^[a-zA-Z0-9\s\-_.()]+$/, "Invalid characters"), // Prevent path traversal
    
  description: z.string()
    .max(1000, "Description too long")
    .optional(),
    
  folderId: z.string()
    .cuid("Invalid folder ID")
    .optional(),
    
  // File validation
  file: z.object({
    size: z.number().max(100 * 1024 * 1024, "File too large (100MB max)"),
    type: z.enum([
      'application/pdf',
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      // ... allowed MIME types
    ]),
    name: z.string().regex(/\.(pdf|doc|docx|ppt|pptx|xls|xlsx)$/i, "Invalid file type")
  })
});

// API route validation
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const validatedData = uploadDocumentSchema.parse(req.body);
    // Process validated data...
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Validation failed", 
        issues: error.issues 
      });
    }
    throw error;
  }
}
```

### SQL Injection Prevention
```typescript
// ✅ SAFE: Prisma ORM prevents SQL injection
const user = await prisma.user.findFirst({
  where: { email: userInput } // Automatically parameterized
});

// ❌ DANGEROUS: Raw SQL (avoided in codebase)
// const result = await prisma.$queryRaw`SELECT * FROM users WHERE email = ${userInput}`;

// ✅ SAFE: Raw SQL with proper parameterization (if needed)
const result = await prisma.$queryRaw`
  SELECT * FROM users WHERE email = ${userInput}
`; // Prisma automatically handles parameterization
```

## 🔧 API Security

### Rate Limiting Implementation
```typescript
// lib/middleware/rate-limit.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"), // 10 requests per 10 seconds
});

export async function withRateLimit(req: NextApiRequest, res: NextApiResponse) {
  const identifier = req.ip ?? "anonymous";
  const { success, limit, reset, remaining } = await ratelimit.limit(identifier);
  
  if (!success) {
    res.setHeader("X-RateLimit-Limit", limit);
    res.setHeader("X-RateLimit-Remaining", remaining);
    res.setHeader("X-RateLimit-Reset", reset);
    return res.status(429).json({ error: "Rate limit exceeded" });
  }
  
  return true;
}
```

### API Token Security
```typescript
// API token generation and validation
export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function validateApiToken(token: string): Promise<boolean> {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  
  const validToken = await prisma.restrictedToken.findFirst({
    where: { 
      hashedKey: hashedToken,
      expiresAt: { gt: new Date() }
    }
  });
  
  return !!validToken;
}

// API middleware
export function withApiAuth(handler: NextApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token || !await validateApiToken(token)) {
      return res.status(401).json({ error: "Invalid API token" });
    }
    
    return handler(req, res);
  };
}
```

## 🗄️ Database Security

### Connection Security
```env
# Production database connection with SSL
POSTGRES_PRISMA_URL=postgresql://user:pass@host.neon.tech/db?sslmode=require&connect_timeout=15

# Separate non-pooling connection for migrations
POSTGRES_PRISMA_URL_NON_POOLING=postgresql://user:pass@host.neon.tech/db?sslmode=require
```

### Data Encryption
```typescript
// Document password encryption
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.NEXT_PRIVATE_DOCUMENT_PASSWORD_KEY;

export function encryptPassword(password: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY);
  let encrypted = cipher.update(password, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

export function decryptPassword(encryptedPassword: string): string {
  const [ivHex, encrypted] = encryptedPassword.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
```

### Audit Logging
```typescript
// Audit trail for sensitive operations
export async function logSecurityEvent(event: {
  userId: string;
  action: string;
  resource: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
}) {
  await prisma.auditLog.create({
    data: {
      ...event,
      timestamp: new Date(),
      severity: getSeverityLevel(event.action)
    }
  });
}

// Usage in API routes
await logSecurityEvent({
  userId: session.user.id,
  action: "DOCUMENT_SHARED",
  resource: `document:${documentId}`,
  details: { linkId, expiresAt },
  ipAddress: req.ip,
  userAgent: req.headers['user-agent']
});
```

## 🌐 Network Security

### Content Security Policy (CSP)
```typescript
// next.config.mjs
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' vercel.live;
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https:;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`;

export default {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: ContentSecurityPolicy.replace(/\n/g, ''),
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};
```

### HTTPS Enforcement
```typescript
// Middleware for HTTPS redirect
export function middleware(request: NextRequest) {
  // Redirect HTTP to HTTPS in production
  if (process.env.NODE_ENV === 'production' && 
      request.headers.get('x-forwarded-proto') !== 'https') {
    return NextResponse.redirect(
      `https://${request.headers.get('host')}${request.nextUrl.pathname}`,
      301
    );
  }
  
  return NextResponse.next();
}
```

## 🔐 File Security

### Secure File Upload
```typescript
// File validation and security
export async function validateUploadSecurity(file: File): Promise<void> {
  // 1. File size validation
  const MAX_SIZE = 100 * 1024 * 1024; // 100MB
  if (file.size > MAX_SIZE) {
    throw new Error("File too large");
  }
  
  // 2. MIME type validation
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    // ... other allowed types
  ];
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error("File type not allowed");
  }
  
  // 3. File extension validation
  const allowedExtensions = /\.(pdf|doc|docx|ppt|pptx|xls|xlsx)$/i;
  if (!allowedExtensions.test(file.name)) {
    throw new Error("File extension not allowed");
  }
  
  // 4. Magic number validation (prevent MIME spoofing)
  const buffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(buffer);
  
  // PDF magic number: %PDF
  if (file.type === 'application/pdf') {
    const pdfHeader = String.fromCharCode(...uint8Array.slice(0, 4));
    if (pdfHeader !== '%PDF') {
      throw new Error("Invalid PDF file");
    }
  }
  
  // Additional magic number checks for other file types...
}
```

### Secure File Serving
```typescript
// Signed URLs for file access
export async function generateSecureFileUrl(fileKey: string, userId: string): Promise<string> {
  // 1. Verify user has access to file
  const document = await prisma.document.findFirst({
    where: {
      versions: {
        some: {
          pages: {
            some: { file: fileKey }
          }
        }
      },
      team: {
        users: {
          some: { userId }
        }
      }
    }
  });
  
  if (!document) {
    throw new Error("Access denied");
  }
  
  // 2. Generate signed URL with expiration
  const expiresIn = 60 * 60; // 1 hour
  const signedUrl = await generateSignedUrl(fileKey, expiresIn);
  
  return signedUrl;
}
```

## 🚨 Production Security Checklist

### Environment Variables Security
- [ ] All secrets use strong random values (≥32 characters)
- [ ] No hardcoded credentials in code
- [ ] Environment variables properly set in Vercel
- [ ] Separate environments for development/staging/production
- [ ] Database credentials rotated regularly

### Authentication Security
- [ ] OKTA OIDC properly configured with correct redirect URIs
- [ ] JWT tokens have appropriate expiration times
- [ ] Session management follows security best practices
- [ ] Multi-factor authentication enforced in OKTA
- [ ] Account lockout policies configured

### Authorization Security  
- [ ] Role-based access control implemented
- [ ] Data isolation enforced at database level
- [ ] API endpoints validate user permissions
- [ ] Team-based data segregation working
- [ ] Privilege escalation prevented

### Application Security
- [ ] Input validation on all user inputs
- [ ] SQL injection protection verified
- [ ] XSS protection enabled
- [ ] CSRF protection active
- [ ] Rate limiting implemented
- [ ] File upload security validated

### Infrastructure Security
- [ ] HTTPS enforced everywhere
- [ ] Security headers configured
- [ ] Content Security Policy implemented
- [ ] Database connections encrypted (SSL)
- [ ] Backup and recovery procedures tested
- [ ] Monitoring and alerting configured

### Compliance Considerations
- [ ] **GDPR:** User data deletion capabilities
- [ ] **SOC 2:** Audit logging and access controls
- [ ] **HIPAA:** Additional encryption if handling health data
- [ ] **SOX:** Financial data controls if applicable

## 🔍 Security Monitoring

### Audit Logging Strategy
```typescript
// Security events to monitor
const SECURITY_EVENTS = {
  LOGIN_SUCCESS: 'login_success',
  LOGIN_FAILURE: 'login_failure',
  PASSWORD_CHANGE: 'password_change',
  DOCUMENT_SHARED: 'document_shared',
  DATAROOM_ACCESS: 'dataroom_access',
  API_TOKEN_USED: 'api_token_used',
  PERMISSION_CHANGED: 'permission_changed',
  FILE_DOWNLOADED: 'file_downloaded',
};

// Monitoring high-risk activities
export async function monitorSecurityEvent(event: SecurityEvent) {
  // Log to database
  await logSecurityEvent(event);
  
  // Alert on suspicious activities
  if (isHighRiskEvent(event)) {
    await sendSecurityAlert(event);
  }
  
  // Rate limiting check
  if (await isRateLimitExceeded(event.userId, event.action)) {
    await temporarilyLockAccount(event.userId);
  }
}
```

### Security Headers Monitoring
```typescript
// Verify security headers are properly set
export function validateSecurityHeaders(response: Response): boolean {
  const requiredHeaders = [
    'x-frame-options',
    'x-content-type-options', 
    'content-security-policy',
    'strict-transport-security'
  ];
  
  return requiredHeaders.every(header => 
    response.headers.has(header)
  );
}
```

## 🆘 Incident Response

### Security Incident Procedure
1. **Detection:** Monitor logs for suspicious activities
2. **Assessment:** Determine scope and severity
3. **Containment:** Isolate affected systems/accounts
4. **Investigation:** Analyze attack vectors and impact
5. **Recovery:** Restore services and implement fixes
6. **Lessons Learned:** Update security measures

### Emergency Security Actions
```bash
# Immediate threat response commands

# 1. Disable compromised user account
npx prisma studio # Navigate to User table, set status to 'disabled'

# 2. Revoke all API tokens for team
npm run db:revoke-tokens --team-id=<team-id>

# 3. Force password reset for all team members
npm run auth:force-reset --team-id=<team-id>

# 4. Check access logs for suspicious activity
npm run audit:security-report --since="2023-01-01"
```

---

This security guide ensures Deal Docs meets enterprise-grade security standards for handling sensitive business documents and data rooms. Regular security audits and penetration testing are recommended for production deployments.