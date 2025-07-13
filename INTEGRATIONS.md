# Integration Guides for Deal Docs

Comprehensive guides for extending Deal Docs with custom integrations and third-party services.

## 🔌 Integration Architecture Overview

### Supported Integration Types
```
┌─────────────────────────────────────────────────────────────┐
│                    Authentication Providers                │
│  ┌─────────────────┐ ┌─────────────────┐ ┌───────────────┐ │
│  │   OKTA OIDC     │ │  Google OAuth   │ │   LinkedIn    │ │
│  │  (Enterprise)   │ │   (Standard)    │ │   (Social)    │ │
│  └─────────────────┘ └─────────────────┘ └───────────────┘ │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                      File Storage                          │
│  ┌─────────────────┐ ┌─────────────────┐ ┌───────────────┐ │
│  │  Vercel Blob    │ │    AWS S3       │ │   MinIO       │ │
│  │   (Default)     │ │  (Enterprise)   │ │ (Self-hosted) │ │
│  └─────────────────┘ └─────────────────┘ └───────────────┘ │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                   Communication Services                   │
│  ┌─────────────────┐ ┌─────────────────┐ ┌───────────────┐ │
│  │    Resend       │ │   SendGrid      │ │   Webhooks    │ │
│  │   (Email)       │ │    (Email)      │ │ (Real-time)   │ │
│  └─────────────────┘ └─────────────────┘ └───────────────┘ │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                     Analytics & Monitoring                 │
│  ┌─────────────────┐ ┌─────────────────┐ ┌───────────────┐ │
│  │    Tinybird     │ │   PostHog       │ │   Plausible   │ │
│  │   (Advanced)    │ │  (Product)      │ │   (Privacy)   │ │
│  └─────────────────┘ └─────────────────┘ └───────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🔐 Authentication Provider Integrations

### Adding New OAuth Provider

**1. Create Provider Configuration**
```typescript
// pages/api/auth/[...nextauth].ts
import { Provider } from "next-auth/providers";

const customProvider: Provider = {
  id: "custom-provider",
  name: "Custom Provider",
  type: "oauth",
  authorization: {
    url: "https://provider.com/oauth/authorize",
    params: {
      scope: "openid profile email",
      response_type: "code",
    },
  },
  token: "https://provider.com/oauth/token",
  userinfo: "https://provider.com/oauth/userinfo",
  clientId: process.env.CUSTOM_CLIENT_ID,
  clientSecret: process.env.CUSTOM_CLIENT_SECRET,
  profile(profile: any) {
    return {
      id: profile.sub,
      name: profile.name,
      email: profile.email,
      image: profile.picture,
    };
  },
};

// Add to providers array
providers: [
  // ... existing providers
  customProvider,
],
```

**2. Add Environment Variables**
```env
# .env
CUSTOM_CLIENT_ID=your_client_id
CUSTOM_CLIENT_SECRET=your_client_secret
```

**3. Update UI Components**
```typescript
// app/(auth)/login/page-client.tsx
const authMethods = ["google", "email", "linkedin", "okta", "custom-provider"] as const;

// Add button component
<Button
  onClick={() => signIn("custom-provider")}
  variant="outline"
  size="lg"
  className="w-full"
>
  <CustomProviderIcon className="mr-2 h-5 w-5" />
  Continue with Custom Provider
</Button>
```

**4. Update Type Definitions**
```typescript
// components/hooks/useLastUsed.tsx
type LoginType = "passkey" | "google" | "credentials" | "linkedin" | "okta" | "custom-provider";
```

### SAML Integration Guide

**1. Install SAML Dependencies**
```bash
npm install @boxyhq/saml-jackson
```

**2. Configure SAML Provider**
```typescript
// lib/auth/saml.ts
import jackson from '@boxyhq/saml-jackson';

const jacksonOptions = {
  externalUrl: process.env.NEXTAUTH_URL,
  samlPath: '/api/auth/saml',
  db: {
    engine: 'sql',
    type: 'postgres',
    url: process.env.POSTGRES_PRISMA_URL,
  },
};

export default jackson(jacksonOptions);
```

**3. Create SAML API Routes**
```typescript
// pages/api/auth/saml/[...saml].ts
import { NextApiRequest, NextApiResponse } from 'next';
import jackson from '@/lib/auth/saml';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { oauthController } = await jackson();
  
  if (req.method === 'GET') {
    // Handle SAML SSO initiation
    const { redirect_url } = await oauthController.authorize(req.query);
    return res.redirect(302, redirect_url);
  }
  
  if (req.method === 'POST') {
    // Handle SAML response
    const { access_token } = await oauthController.samlResponse(req.body);
    // Create user session...
  }
}
```

## 💾 File Storage Integrations

### AWS S3 Integration

**1. Configure S3 Storage**
```typescript
// ee/features/storage/s3-store.ts
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.NEXT_PRIVATE_UPLOAD_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_PRIVATE_UPLOAD_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PRIVATE_UPLOAD_SECRET_ACCESS_KEY!,
  },
  endpoint: process.env.NEXT_PRIVATE_UPLOAD_ENDPOINT, // For S3-compatible providers
});

export async function uploadToS3(key: string, buffer: Buffer, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: process.env.NEXT_PRIVATE_UPLOAD_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });
  
  return await s3Client.send(command);
}

export async function generatePresignedUrl(key: string, expiresIn: number = 3600) {
  const command = new GetObjectCommand({
    Bucket: process.env.NEXT_PRIVATE_UPLOAD_BUCKET,
    Key: key,
  });
  
  return await getSignedUrl(s3Client, command, { expiresIn });
}
```

**2. Environment Configuration**
```env
# AWS S3 Configuration
NEXT_PUBLIC_UPLOAD_TRANSPORT=s3
NEXT_PRIVATE_UPLOAD_BUCKET=your-bucket-name
NEXT_PRIVATE_UPLOAD_ACCESS_KEY_ID=your-access-key
NEXT_PRIVATE_UPLOAD_SECRET_ACCESS_KEY=your-secret-key
NEXT_PRIVATE_UPLOAD_REGION=us-east-1
NEXT_PRIVATE_UPLOAD_ENDPOINT=https://s3.amazonaws.com  # Optional for S3-compatible providers
```

**3. Storage Factory Pattern**
```typescript
// lib/files/storage-factory.ts
import { uploadToS3, generatePresignedUrl as s3PresignedUrl } from '@/ee/features/storage/s3-store';
import { put as vercelPut } from '@vercel/blob';

export async function uploadFile(key: string, buffer: Buffer, contentType: string) {
  const transport = process.env.NEXT_PUBLIC_UPLOAD_TRANSPORT;
  
  switch (transport) {
    case 's3':
      return await uploadToS3(key, buffer, contentType);
    case 'vercel':
    default:
      return await vercelPut(key, buffer, { 
        access: 'public',
        contentType 
      });
  }
}

export async function getFileUrl(key: string): Promise<string> {
  const transport = process.env.NEXT_PUBLIC_UPLOAD_TRANSPORT;
  
  switch (transport) {
    case 's3':
      return await s3PresignedUrl(key);
    case 'vercel':
    default:
      return `https://${process.env.NEXT_PRIVATE_UPLOAD_DISTRIBUTION_HOST}/${key}`;
  }
}
```

### MinIO (Self-hosted S3) Integration

**1. MinIO Configuration**
```typescript
// lib/storage/minio.ts
import { Client } from 'minio';

const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT!,
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY!,
  secretKey: process.env.MINIO_SECRET_KEY!,
});

export async function uploadToMinio(bucketName: string, objectName: string, buffer: Buffer) {
  await minioClient.putObject(bucketName, objectName, buffer);
  return { url: `https://${process.env.MINIO_ENDPOINT}/${bucketName}/${objectName}` };
}

export async function generateMinioPresignedUrl(bucketName: string, objectName: string) {
  return await minioClient.presignedGetObject(bucketName, objectName, 24 * 60 * 60); // 24 hours
}
```

**2. Environment Variables**
```env
# MinIO Configuration
MINIO_ENDPOINT=minio.yourdomain.com
MINIO_PORT=9000
MINIO_USE_SSL=true
MINIO_ACCESS_KEY=your-access-key
MINIO_SECRET_KEY=your-secret-key
MINIO_BUCKET_NAME=deal-docs
```

## 📧 Email Service Integrations

### SendGrid Integration

**1. SendGrid Setup**
```typescript
// lib/emails/sendgrid.ts
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendEmailViaSendGrid(
  to: string, 
  subject: string, 
  html: string,
  from: string = process.env.SENDGRID_FROM_EMAIL!
) {
  const msg = {
    to,
    from,
    subject,
    html,
  };
  
  try {
    await sgMail.send(msg);
    console.log('Email sent successfully via SendGrid');
  } catch (error) {
    console.error('SendGrid error:', error);
    throw error;
  }
}
```

**2. Email Service Factory**
```typescript
// lib/emails/email-factory.ts
import { sendEmailViaSendGrid } from './sendgrid';
import { resend } from '@/lib/resend';

export async function sendEmail(to: string, subject: string, html: string) {
  const provider = process.env.EMAIL_PROVIDER || 'resend';
  
  switch (provider) {
    case 'sendgrid':
      return await sendEmailViaSendGrid(to, subject, html);
    case 'resend':
    default:
      return await resend.emails.send({
        from: 'Deal Docs <no-reply@yourdomain.com>',
        to,
        subject,
        html,
      });
  }
}
```

### Mailgun Integration

**1. Mailgun Configuration**
```typescript
// lib/emails/mailgun.ts
import Mailgun from 'mailgun.js';
import formData from 'form-data';

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY!,
  url: process.env.MAILGUN_URL || 'https://api.mailgun.net', // EU: https://api.eu.mailgun.net
});

export async function sendEmailViaMailgun(to: string, subject: string, html: string) {
  const domain = process.env.MAILGUN_DOMAIN!;
  
  const messageData = {
    from: `Deal Docs <no-reply@${domain}>`,
    to,
    subject,
    html,
  };
  
  try {
    const result = await mg.messages.create(domain, messageData);
    console.log('Email sent successfully via Mailgun:', result.id);
    return result;
  } catch (error) {
    console.error('Mailgun error:', error);
    throw error;
  }
}
```

## 📊 Analytics Integrations

### Google Analytics 4 Integration

**1. GA4 Setup**
```typescript
// lib/analytics/ga4.ts
export function initGA4() {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_GA4_ID) {
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA4_ID}`;
    script.async = true;
    document.head.appendChild(script);
    
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }
    
    gtag('js', new Date());
    gtag('config', process.env.NEXT_PUBLIC_GA4_ID);
  }
}

export function trackEvent(eventName: string, parameters: Record<string, any> = {}) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
}
```

**2. Usage in Components**
```typescript
// components/documents/document-view.tsx
import { trackEvent } from '@/lib/analytics/ga4';

export function DocumentView({ document }: { document: Document }) {
  useEffect(() => {
    trackEvent('document_viewed', {
      document_id: document.id,
      document_type: document.type,
      team_id: document.teamId,
    });
  }, [document]);
  
  return (
    // Component JSX...
  );
}
```

### Mixpanel Integration

**1. Mixpanel Setup**
```bash
npm install mixpanel-browser
```

```typescript
// lib/analytics/mixpanel.ts
import mixpanel from 'mixpanel-browser';

if (process.env.NEXT_PUBLIC_MIXPANEL_TOKEN) {
  mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN, {
    debug: process.env.NODE_ENV === 'development',
    track_pageview: true,
    persistence: 'localStorage',
  });
}

export function trackMixpanelEvent(eventName: string, properties: Record<string, any> = {}) {
  if (process.env.NEXT_PUBLIC_MIXPANEL_TOKEN) {
    mixpanel.track(eventName, properties);
  }
}

export function identifyMixpanelUser(userId: string, traits: Record<string, any> = {}) {
  if (process.env.NEXT_PUBLIC_MIXPANEL_TOKEN) {
    mixpanel.identify(userId);
    mixpanel.people.set(traits);
  }
}
```

## 🔗 Webhook Integrations

### Outgoing Webhooks Implementation

**1. Webhook Infrastructure**
```typescript
// lib/webhook/send-webhooks.ts
import crypto from 'crypto';

export async function sendWebhook(
  url: string, 
  event: string, 
  data: any, 
  secret?: string
) {
  const payload = JSON.stringify({ event, data, timestamp: new Date().toISOString() });
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'User-Agent': 'Deal-Docs-Webhook/1.0',
  };
  
  // Add signature if secret provided
  if (secret) {
    const signature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    headers['X-Deal-Docs-Signature'] = `sha256=${signature}`;
  }
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: payload,
    });
    
    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
    }
    
    return response;
  } catch (error) {
    console.error('Webhook delivery failed:', error);
    throw error;
  }
}
```

**2. Webhook Events**
```typescript
// lib/webhook/events.ts
export const WEBHOOK_EVENTS = {
  DOCUMENT_CREATED: 'document.created',
  DOCUMENT_VIEWED: 'document.viewed',
  LINK_CREATED: 'link.created',
  DATAROOM_ACCESSED: 'dataroom.accessed',
  USER_INVITED: 'user.invited',
} as const;

// Usage in API routes
await sendWebhook(
  webhookUrl,
  WEBHOOK_EVENTS.DOCUMENT_VIEWED,
  {
    document_id: documentId,
    viewer_email: viewerEmail,
    view_time: new Date().toISOString(),
    team_id: teamId,
  },
  webhookSecret
);
```

### Incoming Webhooks (Stripe, etc.)

**1. Stripe Webhook Handler**
```typescript
// pages/api/webhooks/stripe.ts
import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { buffer } from 'micro';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'] as string;
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).json({ error: 'Invalid signature' });
  }
  
  // Handle different event types
  switch (event.type) {
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;
    // ... other events
  }
  
  res.status(200).json({ received: true });
}

export const config = {
  api: {
    bodyParser: false,
  },
};
```

## 🤖 CRM Integrations

### Salesforce Integration

**1. Salesforce API Setup**
```typescript
// lib/integrations/salesforce.ts
import jsforce from 'jsforce';

const conn = new jsforce.Connection({
  loginUrl: process.env.SALESFORCE_LOGIN_URL || 'https://login.salesforce.com',
});

export async function authenticateSalesforce() {
  await conn.login(
    process.env.SALESFORCE_USERNAME!,
    process.env.SALESFORCE_PASSWORD! + process.env.SALESFORCE_SECURITY_TOKEN!
  );
}

export async function createSalesforceContact(contact: {
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
}) {
  await authenticateSalesforce();
  
  const result = await conn.sobject('Contact').create({
    FirstName: contact.firstName,
    LastName: contact.lastName,
    Email: contact.email,
    AccountId: contact.company ? await findOrCreateAccount(contact.company) : undefined,
  });
  
  return result;
}

async function findOrCreateAccount(companyName: string) {
  const existingAccount = await conn.sobject('Account').findOne({ Name: companyName });
  
  if (existingAccount) {
    return existingAccount.Id;
  }
  
  const newAccount = await conn.sobject('Account').create({ Name: companyName });
  return newAccount.id;
}
```

**2. HubSpot Integration**
```typescript
// lib/integrations/hubspot.ts
import { Client } from '@hubspot/api-client';

const hubspotClient = new Client({ accessToken: process.env.HUBSPOT_ACCESS_TOKEN });

export async function createHubSpotContact(contact: {
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
}) {
  const properties = {
    email: contact.email,
    firstname: contact.firstName,
    lastname: contact.lastName,
    company: contact.company,
  };
  
  try {
    const response = await hubspotClient.crm.contacts.basicApi.create({
      properties,
    });
    return response;
  } catch (error) {
    console.error('HubSpot contact creation failed:', error);
    throw error;
  }
}

export async function trackHubSpotEvent(email: string, eventName: string, properties: any = {}) {
  try {
    await hubspotClient.events.eventsApi.create({
      eventName,
      properties: {
        email,
        ...properties,
      },
    });
  } catch (error) {
    console.error('HubSpot event tracking failed:', error);
  }
}
```

## 📱 Mobile App Integration

### React Native SDK

**1. SDK Structure**
```typescript
// sdk/react-native/deal-docs-sdk.ts
export class DealDocsSDK {
  private apiUrl: string;
  private apiKey: string;
  
  constructor(config: { apiUrl: string; apiKey: string }) {
    this.apiUrl = config.apiUrl;
    this.apiKey = config.apiKey;
  }
  
  async createDocument(file: File, metadata: any) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));
    
    const response = await fetch(`${this.apiUrl}/api/documents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: formData,
    });
    
    return response.json();
  }
  
  async shareDocument(documentId: string, options: ShareOptions) {
    const response = await fetch(`${this.apiUrl}/api/documents/${documentId}/share`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });
    
    return response.json();
  }
}
```

## 🔧 Custom Integration Template

### Creating New Integration

**1. Integration Structure**
```typescript
// lib/integrations/custom-service.ts
interface CustomServiceConfig {
  apiKey: string;
  baseUrl: string;
  timeout?: number;
}

export class CustomServiceIntegration {
  private config: CustomServiceConfig;
  
  constructor(config: CustomServiceConfig) {
    this.config = config;
  }
  
  async authenticate(): Promise<boolean> {
    // Implement authentication logic
    return true;
  }
  
  async syncData(data: any): Promise<any> {
    // Implement data synchronization
    return {};
  }
  
  async handleWebhook(payload: any): Promise<void> {
    // Implement webhook handling
  }
}
```

**2. Integration Registry**
```typescript
// lib/integrations/registry.ts
import { CustomServiceIntegration } from './custom-service';

export const INTEGRATIONS = {
  'custom-service': CustomServiceIntegration,
  // ... other integrations
} as const;

export function createIntegration(type: keyof typeof INTEGRATIONS, config: any) {
  const IntegrationClass = INTEGRATIONS[type];
  return new IntegrationClass(config);
}
```

**3. Environment Configuration**
```env
# Custom Service Integration
CUSTOM_SERVICE_API_KEY=your_api_key
CUSTOM_SERVICE_BASE_URL=https://api.custom-service.com
CUSTOM_SERVICE_WEBHOOK_SECRET=your_webhook_secret
```

---

This integration guide provides patterns and examples for extending Deal Docs with various third-party services while maintaining security and performance standards.