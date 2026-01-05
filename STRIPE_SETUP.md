# Stripe Configuration Guide

## Issue Fixed: "Price ID not allowed" Error

The pricing page was using the wrong environment variable name. This has been corrected.

---

## Required Environment Variables

### In Vercel (Production)

Go to your Vercel project → Settings → Environment Variables and add:

```bash
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxx

# Stripe Price ID (IMPORTANT: Use this exact variable name)
NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID=price_xxxxxxxxxxxxxxxxxxxxxxxx

# Supabase Keys
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### In .env.local (Local Development)

Create/update your `.env.local` file with the same variables:

```bash
# Stripe Keys (use TEST keys for development)
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxx

# Stripe Price ID - MUST match your Stripe dashboard
NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID=price_xxxxxxxxxxxxxxxxxxxxxxxx

# Supabase Keys
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## How to Get Your Stripe Price ID

1. Go to Stripe Dashboard → **Products**
2. Find your "Cortex Pro" product (or create it if it doesn't exist)
3. Click on the product
4. Find the price (should show $9/month)
5. Click on the price to expand details
6. Copy the **Price ID** (starts with `price_`)
7. Paste it as the value for `NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID`

### Example:
If your Price ID is `price_1QRc8SD5FgHjKl3MnOpQrSt`, then set:
```bash
NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID=price_1QRc8SD5FgHjKl3MnOpQrSt
```

---

## Vercel Deployment Steps

After updating the environment variable in Vercel:

1. **Redeploy your application**
   - Go to Vercel → Deployments
   - Click on the latest deployment
   - Click "Redeploy"
   - OR push a new commit to trigger automatic deployment

2. **Verify the variable is loaded**
   - After deployment, check the Function logs
   - Environment variables starting with `NEXT_PUBLIC_` are available in the browser
   - Test by clicking "Upgrade to Pro" on the pricing page

---

## Testing the Payment Flow

### Test Mode (Development)

1. Use Stripe test keys (`sk_test_*` and `pk_test_*`)
2. Use test Price ID from your Stripe test mode dashboard
3. Use Stripe test card numbers:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - Any future expiry date (e.g., 12/25)
   - Any 3-digit CVC (e.g., 123)
   - Any ZIP code (e.g., 12345)

### Production Mode (Live)

1. Switch to Stripe live keys (`sk_live_*` and `pk_live_*`)
2. Use live Price ID from your Stripe live mode dashboard
3. Update all Stripe environment variables in Vercel
4. Real credit cards will be charged

---

## Common Issues & Solutions

### Issue: "Price ID not allowed"
**Solution:** Ensure you're using the correct environment variable name:
- ✅ Correct: `NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID`
- ❌ Wrong: `NEXT_PUBLIC_STRIPE_PRICE_ID`

### Issue: Price shows $29 instead of $9
**Solution:** Fixed! The pricing page now shows $9/month.

### Issue: Webhook not receiving events
**Solution:**
1. Ensure webhook endpoint is configured in Stripe
2. URL should be: `https://your-domain.vercel.app/api/webhooks`
3. Webhook secret must match `STRIPE_WEBHOOK_SECRET` in Vercel

### Issue: Environment variable not found in production
**Solution:**
1. Check Vercel environment variables are set for "Production" environment
2. Redeploy after adding new variables
3. Variables starting with `NEXT_PUBLIC_` are available client-side
4. Other variables are only available server-side

---

## Pricing Page Updates

The pricing page has been updated:
- ✅ Price changed from $29 to $9 per month
- ✅ Environment variable corrected to `NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID`
- ✅ Free tier features updated to match available apps
- ✅ Validation logic already matches the correct variable name

---

## Next Steps

1. **Get your Stripe Price ID** from Stripe Dashboard
2. **Add it to Vercel** environment variables as `NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID`
3. **Redeploy** your application
4. **Test** the upgrade flow:
   - Click "Upgrade to Pro" on pricing page
   - Should redirect to Stripe checkout
   - Complete purchase with test card
   - Verify user tier updates to "pro" in Supabase
5. **Configure webhook** (after first successful test)

---

## Verification Checklist

- [ ] Stripe Price ID added to Vercel environment variables
- [ ] Variable name is `NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID`
- [ ] Price ID starts with `price_`
- [ ] Application redeployed after adding variable
- [ ] Test purchase completes successfully
- [ ] User tier updates to "pro" in Supabase
- [ ] Stripe webhook endpoint configured
- [ ] Webhook events are being received
