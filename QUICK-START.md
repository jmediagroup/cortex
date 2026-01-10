# Quick Start - Multi-Sector Subscription

## 🚀 5-Minute Setup

### 1. Database Migration (2 minutes)
```
1. Open Supabase Dashboard → SQL Editor
2. Copy/paste from: supabase-tier-migration.sql
3. Click "Run"
4. Verify: SELECT enum_range(NULL::tier_type);
```

### 2. Create Stripe Products (2 minutes)

**Finance Pro:**
- Monthly: $9 → Copy price ID
- Annual: $90 → Copy price ID

**Elite:**
- Monthly: $29 → Copy price ID
- Annual: $290 → Copy price ID

### 3. Update .env.local (1 minute)
```bash
NEXT_PUBLIC_STRIPE_FINANCE_PRO_MONTHLY_PRICE_ID=price_xxxxx
NEXT_PUBLIC_STRIPE_FINANCE_PRO_ANNUAL_PRICE_ID=price_xxxxx
NEXT_PUBLIC_STRIPE_ELITE_MONTHLY_PRICE_ID=price_xxxxx
NEXT_PUBLIC_STRIPE_ELITE_ANNUAL_PRICE_ID=price_xxxxx
```

### 4. Test
```bash
npm run build  # Should succeed ✅
npm run dev    # Visit http://localhost:3000/pricing
```

## ✅ What Changed

| File | Change |
|------|--------|
| `/app/pricing/page.tsx` | New 3-tier page |
| `/app/dashboard/page.tsx` | Added sector to apps |
| `/lib/access-control.ts` | **NEW** - Access control |
| `/app/api/webhooks/route.ts` | Maps 6 price IDs to tiers |
| Database | Added `finance_pro` and `elite` tiers |

## 🎯 Key Features

- **3 Tiers**: Free, Finance Pro ($9), Elite ($29)
- **Annual Billing**: Save $18 (Finance Pro) or $58 (Elite)
- **Sector-Ready**: Easy to add Health, Education, etc.
- **6 Price IDs**: 2 per paid tier (monthly + annual) + 1 legacy

## 📞 Need Help?

See `MULTI-SECTOR-IMPLEMENTATION.md` for detailed docs.
