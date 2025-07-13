# Testing Strategy for Deal Docs

## 🚨 Current Status: No Testing Infrastructure

**Critical Gap Identified:** Deal Docs currently has no testing setup. This is a major risk for enterprise deployment.

## 🎯 Recommended Testing Setup

### 1. Unit Testing with Vitest

**Why Vitest:**
- Native Next.js/TypeScript support
- Fast execution with native ESM
- Jest-compatible API
- Built-in TypeScript support

**Setup:**
```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

**Add to package.json:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

### 2. Integration Testing with Playwright

**Why Playwright:**
- Tests OKTA OIDC authentication flow
- Cross-browser testing (Chrome, Firefox, Safari)
- Built-in screenshot and video recording
- API testing capabilities

**Setup:**
```bash
npm install -D @playwright/test
npx playwright install
```

### 3. Database Testing Strategy

**Test Database Setup:**
- Use separate test database in Neon
- Seed with known test data
- Reset between test runs

**Environment Configuration:**
```env
# .env.test
POSTGRES_PRISMA_URL=postgresql://test_user:pass@host.neon.tech/test_db
SELF_HOSTED=true
NEXT_PUBLIC_SELF_HOSTED=true
```

## 🧪 Testing Priorities by Feature

### Priority 1: Authentication (CRITICAL)
- [ ] OKTA OIDC login flow
- [ ] Token refresh handling
- [ ] Session persistence
- [ ] Logout functionality
- [ ] Authorization redirects

**Test Example:**
```typescript
// tests/auth/okta-login.test.ts
import { test, expect } from '@playwright/test';

test('OKTA OIDC login flow', async ({ page }) => {
  await page.goto('/login');
  await page.click('[data-testid="okta-login"]');
  
  // Fill OKTA credentials
  await page.fill('[name="identifier"]', process.env.TEST_USER_EMAIL);
  await page.fill('[name="credentials.passcode"]', process.env.TEST_USER_PASSWORD);
  await page.click('[type="submit"]');
  
  // Verify successful login
  await expect(page).toHaveURL('/documents');
  await expect(page.getByText('Welcome')).toBeVisible();
});
```

### Priority 2: Enterprise Features (HIGH)
- [ ] Unlimited dataroom creation
- [ ] Subscription bypass verification
- [ ] Premium feature access
- [ ] Custom branding functionality

**Test Example:**
```typescript
// tests/enterprise/dataroom-limits.test.ts
import { test, expect } from '@playwright/test';

test('unlimited dataroom creation', async ({ page }) => {
  await page.goto('/datarooms');
  
  // Should not see upgrade prompts
  await expect(page.getByText('Upgrade to')).not.toBeVisible();
  
  // Should be able to create dataroom
  await page.click('[data-testid="create-dataroom"]');
  await page.fill('[name="name"]', 'Test Dataroom');
  await page.click('[type="submit"]');
  
  await expect(page.getByText('Test Dataroom')).toBeVisible();
});
```

### Priority 3: Core Functionality (MEDIUM)
- [ ] Document upload and processing
- [ ] Link generation and sharing
- [ ] Document viewing and analytics
- [ ] User management and permissions

### Priority 4: Performance & Security (LOW)
- [ ] File upload limits and validation
- [ ] Rate limiting protection
- [ ] SQL injection prevention
- [ ] XSS protection

## 🔧 Testing Configuration Files

### vitest.config.ts
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
})
```

### playwright.config.ts
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

## 📊 Test Coverage Goals

### Minimum Viable Coverage
- **Authentication:** 90%+ (critical for enterprise)
- **Enterprise Features:** 85%+ (subscription bypass)
- **Core API Routes:** 80%+ (document operations)
- **Database Operations:** 75%+ (Prisma queries)

### Continuous Integration

**GitHub Actions Workflow:**
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - run: npm ci
      - run: npm run test
      - run: npx playwright install
      - run: npm run test:e2e
      
      env:
        POSTGRES_PRISMA_URL: ${{ secrets.TEST_DATABASE_URL }}
        OKTA_CLIENT_ID: ${{ secrets.TEST_OKTA_CLIENT_ID }}
        OKTA_CLIENT_SECRET: ${{ secrets.TEST_OKTA_CLIENT_SECRET }}
```

## 🎯 Implementation Roadmap

### Week 1: Foundation
1. Install Vitest + Testing Library
2. Create basic component tests
3. Set up test database
4. Write authentication tests

### Week 2: Integration
1. Install Playwright
2. Create OKTA login E2E tests
3. Test enterprise feature access
4. Set up CI/CD pipeline

### Week 3: Coverage
1. Add API route testing
2. Database operation tests
3. Performance testing setup
4. Security testing basics

## 🚨 Immediate Actions Needed

1. **Test Database:** Create separate Neon database for testing
2. **Test Users:** Set up dedicated OKTA test accounts
3. **CI Environment:** Configure GitHub Actions with secrets
4. **Test Data:** Create realistic seed data for testing

## 📚 Testing Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [Next.js Testing Guide](https://nextjs.org/docs/app/building-your-application/testing)

---

**Note:** This testing strategy should be implemented before any production deployment to ensure enterprise-grade reliability and security.