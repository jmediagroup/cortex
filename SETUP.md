# Cortex - Setup Guide

This guide will walk you through setting up Supabase authentication and Stripe payments for Cortex.

## Prerequisites

- Node.js 18+ installed
- A Supabase account (https://supabase.com)
- A Stripe account (https://stripe.com)

## Step 1: Supabase Setup

### 1.1 Create a New Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in your project details:
   - Project name: `cortex-io` (or your preferred name)
   - Database password: Generate a secure password
   - Region: Choose closest to your users
4. Click "Create new project" and wait for it to initialize

### 1.2 Run the Database Schema

1. In your Supabase project dashboard, navigate to the SQL Editor
2. Click "New query"
3. Copy the contents of `supabase-schema.sql` and paste it into the editor
4. Click "Run" to execute the schema
5. Verify the `users` table was created under Database > Tables

### 1.3 Configure Authentication

1. In Supabase dashboard, go to Authentication > Providers
2. Enable "Email" provider (it should be enabled by default)
3. Optional: Configure email templates under Authentication > Email Templates
4. Optional: Enable other providers (Google, GitHub, etc.) if desired

### 1.4 Get Your Supabase Keys

1. Navigate to Settings > API
2. Copy the following values:
   - Project URL (labeled as "Project URL")
   - `anon` `public` key (labeled as "anon public")
   - `service_role` key (labeled as "service_role" - click "Reveal" to show it)

## Step 2: Stripe Setup

### 2.1 Create Products and Prices

1. Log in to https://dashboard.stripe.com
2. Switch to **Test mode** (toggle in top right)
3. Navigate to Products > Add Product
4. Create your Pro subscription:
   - Name: "Cortex Pro"
   - Description: "Advanced financial planning tools"
   - Pricing: Recurring
   - Price: $29.00
   - Billing period: Monthly
   - Click "Save product"
5. Copy the **Price ID** (starts with `price_...`)

### 2.2 Get Your Stripe Keys

1. Navigate to Developers > API keys
2. Copy the following:
   - Publishable key (starts with `pk_test_...`)
   - Secret key (starts with `sk_test_...` - click "Reveal" to show it)

### 2.3 Set Up Webhook (for local development)

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Run `stripe login` to authenticate
3. Run `stripe listen --forward-to localhost:3000/api/webhooks`
4. Copy the webhook signing secret (starts with `whsec_...`)

### 2.4 Set Up Webhook (for production)

1. Navigate to Developers > Webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://yourdomain.com/api/webhooks`
4. Events to send:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click "Add endpoint"
6. Copy the webhook signing secret

## Step 3: Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your environment variables in `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://pehteunyustvnxmxjcfk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlaHRldW55dXN0dm54bXhqY2ZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1MDA5NTAsImV4cCI6MjA4MzA3Njk1MH0.cK7E2WtK83qFv3MA9W_X8pKCvgHo7hX6zwqksMs9mDE
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlaHRldW55dXN0dm54bXhqY2ZrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzUwMDk1MCwiZXhwIjoyMDgzMDc2OTUwfQ.n7p07D7wtb-xV3N7jU5n8HMNkHlayH4iZRLxxEwBjiQ

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
pk_test_DDYqgxV1Id3VU0AWEFH7kZpe
STRIPE_SECRET_KEY=sk_test_ycgFeclpkltR7jnzEfLO3zxy
STRIPE_WEBHOOK_SECRET=whsec_344422ade251dc867b3ff66fd6ac72ef968f0cf7969033346bf59419252528e6

# Stripe Price IDs
NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID=price_1SljQgI9OPey6RIR1KjtjSOo

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 4: Install Dependencies and Run

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open http://localhost:3000

## Step 5: Test the Integration

### Test Sign Up Flow

1. Go to http://localhost:3000/login
2. Click "Sign Up" (you'll need to create this link in the login page)
3. Enter email and password
4. Check your email for confirmation link (in development, check Supabase logs)
5. Verify you're redirected to the dashboard

### Test Subscription Flow

1. Log in with your test account
2. Navigate to http://localhost:3000/pricing
3. Click "Upgrade to Pro"
4. Use Stripe test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC
   - Any ZIP code
5. Complete checkout
6. Verify you're redirected to dashboard with Pro tier access

### Test Webhook Integration

1. With Stripe CLI running (`stripe listen --forward-to localhost:3000/api/webhooks`)
2. Complete a test subscription
3. Check the CLI output to see webhook events
4. Verify user tier updated in Supabase dashboard

## Step 6: Deploy to Production

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add all environment variables in Vercel project settings
4. Update `NEXT_PUBLIC_APP_URL` to your production domain
5. Deploy!

### Update Stripe for Production

1. Switch Stripe to Live mode
2. Create production products/prices
3. Update environment variables with live keys
4. Set up production webhook endpoint in Stripe dashboard

## Troubleshooting

### "Unauthorized" errors
- Verify Supabase keys are correct
- Check that RLS policies are set up correctly
- Ensure user is authenticated before API calls

### Stripe checkout not working
- Verify Price ID is correct
- Check that webhook secret matches
- Ensure Stripe CLI is running for local development

### User tier not updating
- Check webhook logs in Stripe dashboard
- Verify webhook endpoint is accessible
- Check Supabase logs for database errors

## Security Notes

- **Never commit `.env.local` to Git**
- Use environment-specific keys (test for dev, live for production)
- Keep service role key secure - only use server-side
- Regularly rotate API keys
- Enable Stripe webhook signature verification

## Support

For issues, check:
- Supabase logs in dashboard
- Stripe webhook logs in dashboard
- Browser console for client-side errors
- Server logs for API route errors
