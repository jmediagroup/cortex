# Stripe Webhook Troubleshooting Guide

## Issue: User tier not updating to "pro" after successful payment

Your payment is going through successfully, but the webhook isn't updating the user's tier in the database. Let's diagnose and fix this.

---

## Diagnostic Steps

### Step 1: Check if Webhook is Configured in Stripe

1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Check if there's an endpoint for your production domain
3. The endpoint URL should be: `https://cortex.vip/api/webhooks`
4. Required events (select these):
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`

**If webhook is NOT configured:**
- Click "Add endpoint"
- Set URL to: `https://cortex.vip/api/webhooks`
- Select the 4 events listed above
- Copy the "Signing secret" (starts with `whsec_`)
- Add it to Vercel as `STRIPE_WEBHOOK_SECRET`
- Redeploy your application

---

### Step 2: Check Webhook Delivery Status

1. In Stripe Dashboard → **Developers** → **Webhooks**
2. Click on your webhook endpoint
3. Go to the "**Attempts**" tab
4. Find your recent payment

**What to look for:**

#### ✅ Success (200 response)
- Webhook is working!
- If tier still didn't update, check Step 3

#### ❌ Failed (400/500 response)
- Click on the failed attempt
- Check the error message
- Common errors:
  - **400: No signature** → Webhook secret mismatch
  - **400: Signature verification failed** → Webhook secret is wrong
  - **500: Internal error** → Check Vercel logs

#### ⚠️ No attempts shown
- Webhook is not configured (see Step 1)
- OR events are not selected

---

### Step 3: Check Vercel Function Logs

The webhook now has detailed logging. Let's check what's happening:

1. Go to Vercel Dashboard → Your Project → **Functions**
2. Find `/api/webhooks`
3. Click on it to see logs
4. Look for log entries starting with `[Webhook]`

**What the logs tell you:**

```
[Webhook] Received webhook request
[Webhook] Event verified: checkout.session.completed (evt_xxx)
[Webhook] Processing checkout.session.completed
  {
    sessionId: "cs_test_xxx",
    userId: "uuid-here" or undefined,
    customerId: "cus_xxx",
    subscriptionId: "sub_xxx",
    metadata: { userId: "uuid-here" } or {}
  }
```

**Key things to check:**

1. **`userId` is undefined**
   - This means the metadata didn't get passed to Stripe
   - See Step 4 below

2. **Database update failed error**
   - Check Supabase connection
   - Check RLS policies (see Step 5)

3. **Successfully updated user tier**
   - Webhook worked! Check dashboard to verify

---

### Step 4: Verify Environment Variables

Check that all required environment variables are set in Vercel:

```bash
# Required for webhook
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxx

# Required for database updates
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Required for checkout success URL
NEXT_PUBLIC_APP_URL=https://cortex.vip
```

**Missing `NEXT_PUBLIC_APP_URL`?**
This could cause issues with the checkout flow. Add it!

---

### Step 5: Check Supabase RLS Policies

The webhook uses the service role key to update the database. Verify RLS policies:

1. Go to Supabase Dashboard → **Authentication** → **Policies**
2. Check the `users` table
3. Ensure there's a policy like:

```sql
CREATE POLICY "Service role has full access"
  ON users FOR ALL
  USING (auth.role() = 'service_role');
```

**If this policy is missing**, create it:

```sql
CREATE POLICY "Service role has full access"
  ON users FOR ALL
  USING (auth.role() = 'service_role');
```

---

### Step 6: Manual Database Check

Let's verify the user record exists and can be updated:

1. Go to Supabase → **Table Editor** → `users` table
2. Find your user by email
3. Check the current tier value
4. Note the user's `id` (UUID)

**Try a manual update:**

Go to Supabase → **SQL Editor** and run:

```sql
UPDATE users
SET
  tier = 'pro',
  subscription_status = 'active',
  updated_at = NOW()
WHERE email = 'your-email@example.com';
```

If this fails, there's a database/RLS issue.
If this succeeds, the issue is with the webhook.

---

## Common Issues & Solutions

### Issue 1: "No userId in session metadata"

**Symptom:** Logs show `userId: undefined`

**Cause:** The checkout session wasn't created with the userId in metadata

**Solution:** Check that you have `NEXT_PUBLIC_APP_URL` set in Vercel

**Why:** The checkout session creation code in `lib/stripe/server.ts` includes the userId in metadata, but if the environment isn't set up correctly, it might not work.

---

### Issue 2: Webhook signature verification failed

**Symptom:** 400 error in Stripe webhook attempts

**Cause:** The `STRIPE_WEBHOOK_SECRET` doesn't match

**Solution:**
1. Go to Stripe → Webhooks → Your endpoint
2. Click "**Reveal**" next to Signing secret
3. Copy the secret (starts with `whsec_`)
4. Update `STRIPE_WEBHOOK_SECRET` in Vercel
5. Redeploy

---

### Issue 3: Database update failed

**Symptom:** Logs show "Database update failed: ..."

**Possible causes:**
1. **RLS Policy blocking service role** → Add service role policy (see Step 5)
2. **Invalid user ID** → User record doesn't exist in database
3. **Supabase connection failed** → Check service role key is correct

---

### Issue 4: Webhook not receiving events

**Symptom:** No attempts in Stripe dashboard

**Solutions:**
1. Ensure webhook endpoint is added in Stripe
2. Ensure events are selected
3. Ensure endpoint URL is correct: `https://cortex.vip/api/webhooks`
4. Test mode webhook only receives test mode events
5. Live mode webhook only receives live mode events

---

## Testing the Webhook Manually

You can test the webhook endpoint directly using Stripe CLI:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to your local server
stripe listen --forward-to http://localhost:3000/api/webhooks

# Trigger a test event
stripe trigger checkout.session.completed
```

---

## Quick Fix Checklist

- [ ] Webhook endpoint configured in Stripe Dashboard
- [ ] Webhook events selected: checkout.session.completed, customer.subscription.*
- [ ] STRIPE_WEBHOOK_SECRET matches Stripe dashboard secret
- [ ] NEXT_PUBLIC_APP_URL set to https://cortex.vip
- [ ] SUPABASE_SERVICE_ROLE_KEY is set correctly
- [ ] Application redeployed after environment variable changes
- [ ] RLS policy allows service role to update users table
- [ ] Webhook attempts in Stripe show 200 success responses
- [ ] Vercel function logs show successful database updates

---

## Next Steps

After following the diagnostic steps:

1. **Make a test purchase** with a Stripe test card
2. **Check Stripe webhook attempts** - should show 200 success
3. **Check Vercel function logs** - should show "[Webhook] Successfully updated user tier"
4. **Check Supabase users table** - tier should be 'pro'
5. **Refresh dashboard** - Pro apps should be unlocked

If you're still having issues, check the Vercel function logs and share the specific error messages you're seeing.

---

## Environment Variable Reminder

Make sure you've set **all** of these in Vercel:

```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID=price_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# App
NEXT_PUBLIC_APP_URL=https://cortex.vip
```

After adding or changing any environment variable, **you must redeploy** for changes to take effect.
