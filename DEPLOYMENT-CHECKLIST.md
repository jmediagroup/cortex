# Cortex Deployment Checklist

## ✅ Priority 1 Fixes - COMPLETED

### 1. Environment Configuration ✓
- Created `.env.local` with production credentials
- Created `.env.example` with template for team members
- All required environment variables are now configured

### 2. Stripe Customer Creation Flow ✓
**Fixed in:** `lib/stripe/server.ts`
- Added automatic Stripe customer creation for new users
- Customers are now created with userId metadata before checkout
- Changed `customerId` parameter to accept `string | null`
- Eliminates orphaned customers and failed subscription associations

### 3. Webhook Metadata Passing ✓
**Fixed in:** `lib/stripe/server.ts`
- Added `subscription_data.metadata.userId` to checkout sessions
- Ensures userId is available in all subscription webhook events
- Fixes issue where subscription.created/updated events lacked userId

### 4. Webhook Idempotency ✓
**Fixed in:** `app/api/webhooks/route.ts`
**Added:** `supabase-webhook-events.sql`
- Created `webhook_events` table to track processed events
- Added idempotency check at start of webhook handler
- Prevents duplicate processing of the same Stripe event
- Includes 30-day auto-cleanup function for old events

### 5. App Branding Metadata ✓
**Fixed in:** `app/layout.tsx`
- Updated title to "Cortex - Wealth Optimization Platform"
- Added comprehensive description for SEO
- Added Open Graph and Twitter Card metadata
- Added keywords and robots configuration

---

## 🔧 Before Deployment - DATABASE SETUP

You need to run the new migration to add webhook idempotency support:

1. **Connect to Supabase:**
   ```bash
   # Option 1: Via Supabase Dashboard
   Go to: https://supabase.com/dashboard/project/pehteunyustvnxmxjcfk/sql

   # Option 2: Via Supabase CLI
   supabase db push
   ```

2. **Run the migration:**
   Copy and execute the contents of `supabase-webhook-events.sql` in the SQL editor

3. **Verify the table was created:**
   ```sql
   SELECT * FROM public.webhook_events LIMIT 1;
   ```

---

## 🚀 Deployment Steps

### 1. Update Supabase Database
```bash
# Run the new webhook events migration
# Execute supabase-webhook-events.sql in Supabase Dashboard SQL Editor
```

### 2. Configure Stripe Webhook
```bash
# In Stripe Dashboard (https://dashboard.stripe.com/test/webhooks)
# Add webhook endpoint: https://cortex.vip/api/webhooks
# Select events:
- customer.subscription.created
- customer.subscription.updated
- customer.subscription.deleted
- checkout.session.completed

# Update STRIPE_WEBHOOK_SECRET in .env.local with the signing secret
```

### 3. Verify Environment Variables
Ensure all variables in `.env.local` are also set in your deployment platform:
- Vercel: Project Settings → Environment Variables
- Netlify: Site Settings → Build & Deploy → Environment
- Custom: Set in your hosting platform

### 4. Test the Flow
1. Sign up for a new account
2. Navigate to /pricing
3. Click "Upgrade to Pro"
4. Complete checkout with test card: `4242 4242 4242 4242`
5. Verify:
   - Stripe customer created with metadata
   - Subscription created with metadata
   - Webhook processed successfully
   - User tier updated to "pro" in database
   - No duplicate webhook processing

---

## 📋 Remaining Items (Priority 2 & 3)

### Priority 2 - COMPLETED ✅

1. **Input Validation** ✓
   - Validate priceId against allowed values
   - Add type guards for webhook data
   - Validate user email format

2. **Error Boundaries** ✓
   - Add error boundaries to calculator components
   - Prevent page crashes from calculation errors
   - Provide user-friendly error messages

3. **Token Refresh Logic** ✓
   - Handle expired tokens in API routes
   - Add automatic token refresh
   - Graceful degradation for auth failures

4. **Next.js Config Enhancements** ✓
   - Add security headers
   - Configure environment variable validation
   - Add proper image optimization settings

### Priority 3 - Post-Launch Improvements

1. **Usage Tracking**
   - Add feature usage logging to database
   - Track calculator runs per user
   - Implement feature quotas for free tier

2. **Webhook Retry Logic**
   - Add exponential backoff for failed webhooks
   - Queue system for webhook processing
   - Alert system for critical webhook failures

3. **Centralized Configuration**
   - Extract protected routes to config file
   - Create constants file for price IDs
   - Environment-specific configuration

4. **Monitoring & Analytics**
   - Add error tracking (Sentry, LogRocket)
   - Add analytics (PostHog, Mixpanel)
   - Add performance monitoring

---

## 🔐 Security Checklist

- [x] Environment variables not committed to git
- [x] Stripe webhook signature verification enabled
- [x] Row Level Security enabled on users table
- [x] Service role key only used server-side
- [x] Security headers configured in next.config.ts
- [ ] Rate limiting on API routes (TODO)
- [ ] CORS configuration for API routes (TODO)
- [x] Input validation on all endpoints

---

## 📊 Testing Checklist

### Stripe Integration
- [ ] New user checkout creates customer
- [ ] Existing customer checkout reuses customer
- [ ] Subscription metadata includes userId
- [ ] Webhook events update database correctly
- [ ] Duplicate webhooks are ignored
- [ ] Failed payments downgrade user tier
- [ ] Customer portal works correctly

### Authentication
- [ ] Sign up creates user in database
- [ ] Login redirects to dashboard
- [ ] Protected routes require authentication
- [ ] Token refresh works correctly
- [ ] Logout clears session

### Features
- [ ] Free tier can access basic calculators
- [ ] Pro tier can access all calculators
- [ ] Dashboard shows correct tier status
- [ ] Calculator results are accurate

---

## 🐛 Known Issues / Technical Debt

1. **Type Safety**: Heavy use of `as` type casting in API routes (improved with auth-helpers)
2. **Error Handling**: Limited error recovery in API routes (improved with error boundaries)
3. **Hardcoded Values**: Protected routes and price IDs hardcoded (partially addressed)
4. **No Loading States**: Webhook processing doesn't show real-time status
5. **No Usage Limits**: Free tier has unlimited access to basic features

---

## 📝 Next Steps

1. **Immediate**: Run database migration for webhook events table
2. **Before Launch**: Test complete checkout flow end-to-end
3. **Week 1**: Monitor webhook processing and error rates
4. **Week 2**: Add usage tracking and analytics
5. **Month 1**: Implement remaining Priority 3 items

---

## 🆘 Troubleshooting

### Webhook Not Working
1. Check Stripe webhook signing secret matches .env
2. Verify endpoint URL is correct: `https://cortex.vip/api/webhooks`
3. Check webhook events table for duplicates
4. Review Stripe Dashboard webhook logs

### Checkout Session Fails
1. Verify STRIPE_SECRET_KEY is set
2. Check priceId is valid
3. Ensure user exists in database
4. Review browser console for errors

### User Not Upgraded
1. Check webhook_events table for event processing
2. Verify userId in subscription metadata
3. Check users table for tier/subscription_status
4. Review Supabase logs for RLS policy issues

---

**Last Updated:** January 4, 2026
**Status:** Ready for deployment after database migration
