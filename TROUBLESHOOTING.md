# Local Development Troubleshooting Guide

Complete troubleshooting guide for common development issues in Deal Docs.

## 🚨 Critical Issues (Development Blockers)

### Issue: Port 3000 Already in Use
**Error:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solutions:**
```bash
# Find and kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Alternative: Use different port
npm run dev -- -p 3001

# Check what's running on port 3000
lsof -i:3000
```

**Prevention:** Always stop dev server with `Ctrl+C` before closing terminal

---

### Issue: Database Connection Failed
**Error:** `PrismaClientInitializationError: Can't reach database server`

**Root Causes & Solutions:**

**1. Invalid Connection String:**
```bash
# Check your .env file
cat .env | grep POSTGRES

# Verify format (should include ?connect_timeout=15&sslmode=require)
POSTGRES_PRISMA_URL=postgresql://user:pass@host.neon.tech/db?connect_timeout=15&sslmode=require
```

**2. Neon Database Sleeping:**
```bash
# Wake up database by running a query
npm run dev:prisma

# Or visit Neon dashboard to wake database
```

**3. Network/Firewall Issues:**
```bash
# Test connectivity
curl -v telnet://ep-rough-mountain-ad6aspu4-pooler.c-2.us-east-1.aws.neon.tech:5432

# Check if corporate firewall blocks port 5432
```

**4. Invalid Credentials:**
- Regenerate connection string in Neon dashboard
- Update both `POSTGRES_PRISMA_URL` and `POSTGRES_PRISMA_URL_NON_POOLING`

---

### Issue: Prisma Client Out of Sync
**Error:** `@prisma/client did not initialize yet` or `Unknown arg 'mode' in data.mode`

**Solution:**
```bash
# Regenerate Prisma client
npx prisma generate

# Full reset if needed
rm -rf node_modules/.prisma
npm run dev:prisma
```

**Prevention:** Run `npm run dev:prisma` after pulling schema changes

---

## 🔐 Authentication Issues

### Issue: OKTA Authentication Not Working
**Error:** User gets stuck in login loop or authorization fails

**Debugging Steps:**

**1. Check OKTA Configuration:**
```env
# Verify correct format in .env
OKTA_CLIENT_ID=0oat5o6rhcAnBtG3l697
OKTA_CLIENT_SECRET=6dsIK31J5Ep33NH1xUJVeR43zsHTdWrzb0YJL_R3uQPjIneRJC6OdWjad5gQ20i6
OKTA_ISSUER=https://trial-2094636.okta.com/oauth2/default
```

**2. Verify Redirect URIs in OKTA:**
```
http://localhost:3000/api/auth/callback/okta    # Development
https://your-domain.vercel.app/api/auth/callback/okta  # Production
```

**3. Check Browser Network Tab:**
- Look for 403/401 errors to OKTA endpoints
- Verify authorization codes are being returned
- Check for CORS issues

**4. Clear Auth State:**
```bash
# Clear NextAuth cookies in browser
# Or use incognito mode
```

---

### Issue: NextAuth Session Issues
**Error:** `useSession()` returns null or undefined

**Solutions:**
```bash
# Check NextAuth configuration
cat pages/api/auth/[...nextauth].ts

# Verify environment variables
echo $NEXTAUTH_SECRET
echo $NEXTAUTH_URL

# Clear browser storage
# Application tab -> Storage -> Clear all
```

**Common Fixes:**
- Ensure `NEXTAUTH_SECRET` is set and ≥32 characters
- Verify `NEXTAUTH_URL` matches current environment
- Check cookie domain settings for localhost vs production

---

## 💾 Database & Migration Issues

### Issue: Migration Failures
**Error:** `Migration failed to apply cleanly to the shadow database`

**Solutions:**
```bash
# Reset database (DESTRUCTIVE - dev only)
npx prisma migrate reset

# Force apply specific migration
npx prisma migrate deploy --force

# Check migration status
npx prisma migrate status
```

**For Corrupted Database:**
1. Create new Neon branch
2. Update connection string
3. Run fresh migrations: `npm run dev:prisma`

---

### Issue: Seeding Problems
**Error:** No sample data, empty database

**Manual Seeding:**
```bash
# Check if seed script exists
ls prisma/

# Create test user (if no seed script)
npx prisma studio
# Manually add user through GUI
```

**Create Sample Data:**
1. Register through UI
2. Create test dataroom
3. Upload sample document
4. Generate sharing link

---

## 🎨 Build & Compilation Issues

### Issue: TypeScript Compilation Errors
**Error:** Various TS errors during `npm run build`

**Common Solutions:**
```bash
# Update TypeScript
npm install typescript@latest

# Clear TypeScript cache
rm -rf .next
rm -rf node_modules/.cache

# Check for type mismatches
npm run lint
```

**Specific Fix - usePlan Hook Error:**
```typescript
// If you see React hooks error in lib/swr/use-billing.ts
// Ensure useSWR is called outside conditional logic
const { data: plan, error } = useSWR<PlanResponse>(
  teamId && `/api/teams/${teamId}/billing/plan`,
  fetcher,
);

// THEN check environment variables
if (process.env.NEXT_PUBLIC_SELF_HOSTED === 'true') {
  return { /* ... */ };
}
```

---

### Issue: Build Size Limit Exceeded  
**Error:** `The Edge Function "api/route" size is 1.08 MB and your plan size limit is 1 MB`

**Solutions:**
```bash
# Analyze bundle size
npm run build
# Check .next/static/chunks/ for large files

# Remove problematic endpoints
rm app/api/og/yir/route.tsx  # Known issue

# Move to Node.js runtime instead of Edge
# Add to route file:
export const runtime = 'nodejs'
```

---

## 🌐 Environment Variable Issues

### Issue: Environment Variables Not Loading
**Error:** `process.env.VARIABLE_NAME` returns undefined

**Debugging:**
```bash
# Check .env file exists and has correct format
cat .env

# Verify no spaces around = sign
# ✅ CORRECT: VARIABLE=value  
# ❌ WRONG:   VARIABLE = value

# Check .env.local takes precedence over .env
ls -la .env*

# Restart dev server after changes
npm run dev
```

**Next.js Environment Variable Rules:**
- Client-side variables MUST start with `NEXT_PUBLIC_`
- Server-side variables available only in API routes/middleware
- Restart required after .env changes

---

### Issue: Self-Hosted Flags Not Working
**Error:** Still seeing upgrade prompts, subscription limits active

**Verification:**
```bash
# Check both flags are set
grep SELF_HOSTED .env

# Should show:
SELF_HOSTED=true
NEXT_PUBLIC_SELF_HOSTED=true
```

**Test in Browser Console:**
```javascript
// Should return "true"
console.log(process.env.NEXT_PUBLIC_SELF_HOSTED)
```

If undefined, restart dev server and check .env syntax.

---

## 🔧 Performance Issues

### Issue: Slow Development Server
**Symptoms:** Hot reload takes 10+ seconds, high CPU usage

**Solutions:**
```bash
# Clear Next.js cache
rm -rf .next

# Reduce file watching (on macOS)
echo 'kern.maxfiles=65536' | sudo tee -a /etc/sysctl.conf
echo 'kern.maxfilesperproc=65536' | sudo tee -a /etc/sysctl.conf

# Exclude node_modules from file watching
# Add to next.config.mjs:
{
  webpack: (config) => {
    config.watchOptions = {
      ignored: /node_modules/
    }
    return config
  }
}
```

---

### Issue: Memory Issues During Build
**Error:** `JavaScript heap out of memory`

**Solutions:**
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build

# Or add to package.json script:
"build": "NODE_OPTIONS='--max-old-space-size=4096' next build"
```

---

## 📱 Browser-Specific Issues

### Issue: Safari Authentication Problems
**Symptoms:** OKTA login works in Chrome but fails in Safari

**Solutions:**
- Enable cross-site tracking in Safari preferences
- Check for third-party cookie blocking
- Test in Safari Private Browsing mode
- Verify OKTA domain is not blocked

---

### Issue: Chrome Development Issues
**Symptoms:** Hot reload not working, cached responses

**Solutions:**
```bash
# Disable browser caching
# Chrome DevTools -> Network -> Disable cache (while DevTools open)

# Clear Chrome cache for localhost
# Chrome -> More Tools -> Clear Browsing Data -> Advanced -> Localhost

# Use hard refresh
# Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
```

---

## 🆘 Emergency Debugging Commands

### Full Development Reset
```bash
# Nuclear option - full reset
rm -rf node_modules
rm -rf .next
rm package-lock.json
npm install
npm run dev:prisma
npm run dev
```

### Database Emergency Reset
```bash
# Reset database (DESTRUCTIVE)
npx prisma migrate reset --force
npm run dev:prisma

# Or create new Neon branch
# Update POSTGRES_PRISMA_URL to new branch
npm run dev:prisma
```

### Quick Health Check Script
```bash
#!/bin/bash
echo "=== Deal Docs Health Check ==="
echo "Node Version: $(node -v)"
echo "NPM Version: $(npm -v)"
echo "Port 3000 Available: $(lsof -ti:3000 || echo 'YES')"
echo "Database Connection: $(npm run dev:prisma 2>&1 | grep -q 'Error' && echo 'FAILED' || echo 'OK')"
echo "OKTA Variables Set: $(grep -q 'OKTA_CLIENT_ID' .env && echo 'YES' || echo 'NO')"
echo "Self-Hosted Enabled: $(grep -q 'SELF_HOSTED=true' .env && echo 'YES' || echo 'NO')"
```

---

## 📞 Getting Help

### Information to Gather Before Asking for Help
1. **Error message:** Full error text and stack trace
2. **Environment:** Node version, OS, browser
3. **Steps to reproduce:** Exact sequence that causes the issue
4. **Environment variables:** Which ones are set (don't share secrets)
5. **Recent changes:** What was changed before the issue started

### Useful Debug Commands
```bash
# System info
node -v && npm -v && echo $PWD

# Package versions
npm list next react prisma

# Environment check (safe output)
env | grep -E "(NODE_|NEXT_|DATABASE)" | sed 's/=.*/=***/'

# Database connection test
npx prisma db pull --preview-feature
```

### Log Locations
- **Next.js logs:** Terminal running `npm run dev`
- **Browser logs:** Chrome DevTools -> Console
- **Network logs:** Chrome DevTools -> Network
- **Database logs:** Neon dashboard -> Monitoring

---

Remember: Most issues are environment-related. When in doubt, restart the dev server and check your `.env` file! 🔄