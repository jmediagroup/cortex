# Cortex Setup Instructions

## Prerequisites
- Vercel account with cortex.vip domain configured
- Supabase project (already created)
- Stripe account in test mode

## 1. Supabase Database Setup

Run these SQL migrations in your Supabase SQL Editor (Dashboard → SQL Editor → New query):

### A. Users Table
```sql
-- Copy and paste contents from: supabase-users-table.sql
```

### B. Webhook Events Table
```sql
-- Copy and paste contents from: supabase-webhook-events.sql
```

## 2. Supabase Authentication Configuration

Go to Supabase Dashboard → Authentication → URL Configuration:

1. **Site URL**: `https://cortex.vip`
2. **Redirect URLs**: Add these:
   - `https://cortex.vip/**`
   - `http://localhost:3000/**` (for local development)

## 3. Stripe Configuration

### A. Product & Price Setup
1. Go to Stripe Dashboard → Products
2. Verify "Cortex Pro" product exists
3. Note the price ID (should match: `price_1SljQgI9OPey6RIR1KjtjSOo`)

### B. Webhook Configuration
1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "+ Add endpoint"
3. **Endpoint URL**: `https://cortex.vip/api/webhooks`
4. **Events to send**:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click "Add endpoint"
6. Copy the **Signing secret** (starts with `whsec_`)
7. Add to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`

## 4. Vercel Environment Variables

All environment variables are already configured in Vercel:
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- ✅ `STRIPE_SECRET_KEY`
- ✅ `STRIPE_WEBHOOK_SECRET`
- ✅ `NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID`
- ✅ `NEXT_PUBLIC_APP_URL`

## 5. Testing the Flow

### A. Create Test Account
1. Visit `https://cortex.vip`
2. Click "Get Started" or navigate to `/login`
3. Click "New here? Create an account"
4. Enter email and password (min 6 characters)
5. Check your email for Supabase confirmation
6. Click confirmation link

### B. Sign In
1. Go to `/login`
2. Enter credentials
3. Should redirect to `/dashboard`

### C. Test Stripe Checkout (Test Mode)
1. From dashboard, click "Explore Pro Plans" or go to `/pricing`
2. Click "Upgrade to Pro"
3. Should redirect to Stripe Checkout
4. Use test card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits
5. Complete checkout
6. Should redirect back to dashboard

### D. Verify Webhook Processing
1. After successful checkout, check Stripe Dashboard → Developers → Webhooks
2. Click on your endpoint → Recent deliveries
3. Verify `checkout.session.completed` was sent and received 200 response
4. In Supabase, check the `users` table:
   - User's `tier` should be updated to 'pro'
   - `stripe_customer_id` should be populated
   - `stripe_subscription_id` should be populated

## 6. Common Issues

### Issue: "Failed to create checkout session"
- **Check**: User is logged in (session exists)
- **Check**: Stripe price ID is correct in environment variables
- **Check**: STRIPE_SECRET_KEY is correct

### Issue: "User tier not updating after payment"
- **Check**: Webhook is configured correctly in Stripe
- **Check**: Webhook secret matches in Vercel
- **Check**: Check Stripe webhook delivery logs for errors
- **Check**: Verify `webhook_events` table exists in Supabase

### Issue: "Email confirmation not sending"
- **Check**: Supabase authentication settings
- **Check**: Email templates are enabled
- **Check**: SMTP is configured (or using Supabase default)

## 7. Going to Production

When ready to move from test mode to production:

1. **Stripe**:
   - Switch from test mode to live mode
   - Create production webhook endpoint
   - Update environment variables with live keys

2. **Supabase**:
   - Already in production

3. **Vercel**:
   - Update environment variables for production
   - Redeploy

## Files Reference

- **Database migrations**: `supabase-users-table.sql`, `supabase-webhook-events.sql`
- **Environment template**: `.env.example`
- **Deployment checklist**: `DEPLOYMENT-CHECKLIST.md`
- **API endpoints**:
  - `/api/create-checkout-session` - Creates Stripe checkout
  - `/api/create-portal-session` - Creates customer portal session
  - `/api/webhooks` - Handles Stripe webhooks
