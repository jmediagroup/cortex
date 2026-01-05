# Deployment Configuration Checklist

## ✅ Build Issues - FIXED

### Issue 1: Next.js 15+ `headers()` Promise (RESOLVED)
**Problem:** In Next.js 15+, the `headers()` function returns a Promise that must be awaited.

**Fix Applied:** Updated `app/api/webhooks/route.ts:9` to await the headers Promise:
```typescript
const headersList = await headers();
const signature = headersList.get('stripe-signature');
```

### Issue 2: Supabase TypeScript Inference (RESOLVED)
**Problem:** Supabase client generic types weren't properly inferred, causing TypeScript to treat update/insert parameters as `never`.

**Fix Applied:** Added type assertions using `as any` for Supabase operations in:
- `app/api/webhooks/route.ts` (3 locations)
- `app/login/page.tsx` (1 location)

### Issue 3: Next.js Suspense Boundary (RESOLVED)
**Problem:** `useSearchParams()` requires a Suspense boundary in Next.js 15+.

**Fix Applied:** Wrapped `AuthForm` component in Suspense boundary in `app/login/page.tsx`.

---

## 🔧 Critical Configuration Checks

### 1. Environment Variables (Vercel)

Ensure ALL of the following environment variables are set in your Vercel project settings:

#### Supabase Configuration
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**How to find these:**
1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Copy the Project URL and anon/public key
4. Copy the service_role key (⚠️ Keep this secret!)

#### Stripe Configuration
```bash
STRIPE_SECRET_KEY=sk_live_... or sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... or pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**How to find these:**
1. Go to Stripe Dashboard → Developers → API Keys
2. Copy the Secret key and Publishable key
3. For webhook secret: Go to Developers → Webhooks → Add endpoint
   - Set endpoint URL to: `https://your-domain.vercel.app/api/webhooks`
   - Select events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `checkout.session.completed`
   - Copy the signing secret

**⚠️ IMPORTANT:** Set these in Vercel at: Project Settings → Environment Variables

---

### 2. Supabase Database Setup

#### Required Table: `users`
Ensure your Supabase database has the `users` table with the following schema:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Policy: Service role can do anything (for webhooks)
CREATE POLICY "Service role has full access"
  ON users FOR ALL
  USING (auth.role() = 'service_role');
```

**How to verify:**
1. Go to Supabase Dashboard → Table Editor
2. Check if `users` table exists with all columns
3. Go to Authentication → Policies
4. Verify RLS policies are in place

---

### 3. Stripe Product & Price IDs

Update your pricing page with actual Stripe Price IDs:

**To get these:**
1. Go to Stripe Dashboard → Products
2. Create a product (e.g., "Cortex Pro")
3. Add a price (e.g., $29/month)
4. Copy the Price ID (starts with `price_...`)
5. Update your code wherever price IDs are referenced

**Files to check:**
- Look for hardcoded price IDs in pricing pages
- Update `lib/validation.ts` if it exists with allowed price IDs

---

### 4. Vercel Build Settings

In Vercel Project Settings → General:

- **Framework Preset:** Next.js
- **Build Command:** `npm run build` (default)
- **Output Directory:** `.next` (default)
- **Install Command:** `npm install` (default)
- **Node Version:** 20.x (recommended)

---

### 5. Database Connection from Vercel

**Test the connection:**
1. Deploy to Vercel
2. Check deployment logs for database connection errors
3. Verify environment variables are loaded (check Function Logs)

**Common issues:**
- Missing `NEXT_PUBLIC_` prefix for client-side variables
- Typos in environment variable names
- Missing service role key for server-side operations

---

### 6. Stripe Webhook Endpoint

After deploying to Vercel:

1. Get your production URL (e.g., `https://cortex-io.vercel.app`)
2. Go to Stripe Dashboard → Developers → Webhooks
3. Click "Add endpoint"
4. Set URL to: `https://your-domain.vercel.app/api/webhooks`
5. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `checkout.session.completed`
6. Copy the **Signing secret** (starts with `whsec_`)
7. Add it to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`
8. Redeploy your application

**Test the webhook:**
- Make a test purchase in Stripe
- Check Stripe Dashboard → Webhooks → Your endpoint → Attempts
- Should show successful 200 responses

---

## 🧪 Pre-Deployment Testing Checklist

Before deploying to production:

- [ ] All environment variables are set in Vercel
- [ ] Supabase `users` table exists with correct schema
- [ ] RLS policies are enabled on `users` table
- [ ] Stripe products and prices are created
- [ ] Test local build: `npm run build` (should succeed)
- [ ] Test authentication flow locally
- [ ] Test Stripe checkout flow in test mode
- [ ] Webhook endpoint will be configured after first deployment

---

## 🚨 Post-Deployment Verification

After deploying to Vercel:

1. **Test User Registration:**
   - Visit `/login`
   - Create a new account
   - Check Supabase Auth → Users (user should appear)
   - Check Supabase → Table Editor → users (record should be created)

2. **Test User Login:**
   - Sign out
   - Sign in with the account you created
   - Should redirect to `/dashboard`

3. **Test Stripe Checkout:**
   - Go to `/pricing` (if it exists)
   - Click upgrade to Pro
   - Complete checkout in test mode
   - Verify user tier is updated in database

4. **Test Webhook:**
   - Complete a test checkout
   - Check Stripe Dashboard → Webhooks → Recent deliveries
   - Should show successful webhook delivery
   - User tier in database should update to 'pro'

---

## 🔒 Security Best Practices

1. **Never commit sensitive keys:**
   - `.env.local` is in `.gitignore`
   - Never commit `SUPABASE_SERVICE_ROLE_KEY` or `STRIPE_SECRET_KEY`

2. **Use environment-specific keys:**
   - Use Stripe test keys (`sk_test_*`, `pk_test_*`) for development
   - Use Stripe live keys (`sk_live_*`, `pk_live_*`) only in production

3. **Enable Vercel environment protection:**
   - Set production environment variables to "Production" only
   - This prevents them from being used in preview deployments

---

## 📝 Known Technical Debt

### Supabase Type Inference Issue
The current codebase uses `as any` type assertions for Supabase operations due to type inference issues with the generic Database type.

**Future improvement:**
Generate Supabase types using the official CLI:
```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/database.types.ts
```

Then update `lib/supabase/client.ts` to import the generated types instead of the manual Database type definition.

---

## 📞 Support & Resources

- **Next.js Docs:** https://nextjs.org/docs
- **Supabase Docs:** https://supabase.com/docs
- **Stripe Docs:** https://stripe.com/docs
- **Vercel Deployment:** https://vercel.com/docs

---

## ✨ Summary

All build errors have been fixed:
1. ✅ Next.js headers Promise handling
2. ✅ Supabase TypeScript type assertions
3. ✅ Suspense boundary for useSearchParams

The application should now deploy successfully to Vercel. Follow the configuration checklist above to ensure all services are properly connected.
