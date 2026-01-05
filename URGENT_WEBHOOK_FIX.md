# URGENT: Webhook 307 Redirect Fix

## The Problem

Your Stripe webhook is failing with a **307 redirect** error:
```json
{
  "redirect": "https://www.cortex.vip/api/webhooks",
  "status": "307"
}
```

This happens because:
1. Your webhook is configured to send events to `https://cortex.vip/api/webhooks`
2. Your Vercel deployment redirects `cortex.vip` → `www.cortex.vip`
3. **Stripe webhooks DO NOT follow redirects** - they fail immediately with a 307 error
4. Therefore, your webhook never executes and tiers don't update

---

## The Solution

You need to update your Stripe webhook endpoint to use the **www** subdomain.

### Step 1: Update Stripe Webhook Endpoint

1. Go to **Stripe Dashboard** → **Developers** → **Webhooks**
2. Find your existing webhook endpoint
3. Click the **⋮** menu → **Update details**
4. Change the endpoint URL from:
   ```
   https://cortex.vip/api/webhooks
   ```
   To:
   ```
   https://www.cortex.vip/api/webhooks
   ```
5. Click **Update endpoint**

### Step 2: Test the Webhook

After updating, Stripe provides a "Send test webhook" button:
1. Click **Send test webhook**
2. Select event type: `checkout.session.completed`
3. Click **Send test webhook**
4. Check the response - should show **200 OK** instead of 307

---

## Alternative Solution: Fix the Redirect in Vercel

If you prefer to keep the webhook at `cortex.vip` (without www), you need to configure Vercel to NOT redirect API routes.

### Option A: Add vercel.json Configuration

Create a `vercel.json` file in your project root:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ]
}
```

This ensures API routes don't redirect.

### Option B: Change Domain Settings in Vercel

1. Go to Vercel Dashboard → Your Project → **Settings** → **Domains**
2. Find `cortex.vip` in the domains list
3. Check if "Redirect to Primary Domain" is enabled
4. If `www.cortex.vip` is set as primary, consider:
   - Option 1: Make `cortex.vip` (without www) the primary domain
   - Option 2: Update Stripe webhook to use `www.cortex.vip`

---

## Recommended Approach

**Use the www subdomain** in your Stripe webhook configuration.

**Why?**
- Simpler and faster fix (no code changes needed)
- Keeps your domain redirect configuration intact
- Standard practice for production webhooks
- No deployment required

**Steps:**
1. Update Stripe webhook URL to `https://www.cortex.vip/api/webhooks`
2. Test with Stripe's "Send test webhook" button
3. Make a real test purchase
4. Verify tier updates in Supabase

---

## Updating Environment Variables

You should also update your environment variable to match:

**In Vercel:**
```bash
NEXT_PUBLIC_APP_URL=https://www.cortex.vip
```

**Why?** This ensures:
- Checkout success/cancel URLs use the correct domain
- Email redirects work properly
- No redirect loops

After updating this variable, redeploy your application.

---

## Verification Checklist

After making the fix:

- [ ] Stripe webhook endpoint URL updated to `https://www.cortex.vip/api/webhooks`
- [ ] Test webhook sent from Stripe dashboard shows 200 OK
- [ ] `NEXT_PUBLIC_APP_URL` updated to `https://www.cortex.vip` in Vercel
- [ ] Application redeployed
- [ ] Test purchase made with Stripe test card
- [ ] Webhook attempts in Stripe show 200 success (no more 307)
- [ ] User tier updated to 'pro' in Supabase
- [ ] Dashboard shows Pro apps unlocked

---

## Testing After Fix

1. **Make a test purchase:**
   - Go to `/pricing`
   - Click "Upgrade to Pro"
   - Use test card: `4242 4242 4242 4242`
   - Complete checkout

2. **Check Stripe webhook attempts:**
   - Should show **200** instead of 307
   - Response should show `{"received":true}`

3. **Check Vercel function logs:**
   - Should see: `[Webhook] Event verified: checkout.session.completed`
   - Should see: `[Webhook] Successfully updated user tier to pro`

4. **Check Supabase:**
   - User's tier should be `'pro'`
   - `stripe_customer_id` and `stripe_subscription_id` should be populated

5. **Refresh dashboard:**
   - Pro apps should now be accessible

---

## Important Notes

- **307 is a temporary redirect** - Vercel is redirecting your domain
- **Stripe will not follow redirects** - this is by design for security
- **The webhook code is fine** - it's just never being executed
- **This is a common issue** when using apex domains that redirect to www

---

## Quick Fix Command

If you want to check which domain your site actually uses:

```bash
curl -I https://cortex.vip
```

Look for the `Location:` header - it probably shows `https://www.cortex.vip`

Then update your Stripe webhook to match that domain.

---

## Summary

**Problem:** Webhook configured for `cortex.vip` but site redirects to `www.cortex.vip`

**Solution:** Update Stripe webhook endpoint to `https://www.cortex.vip/api/webhooks`

**Result:** Webhooks will work, tiers will update, users will get Pro access

This should fix your issue immediately - no code changes needed!
