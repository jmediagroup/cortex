# Analytics Setup - Quick Start Guide

## ✅ What's Been Implemented

Your Cortex application now has comprehensive analytics tracking including:

- ✅ Web Vitals performance monitoring (CLS, LCP, FCP, TTFB, INP)
- ✅ Automatic page view tracking
- ✅ User authentication events (signup, login, logout)
- ✅ Subscription events (upgrade, cancel)
- ✅ App usage tracking (which apps users open)
- ✅ Error tracking
- ✅ Dashboard and pricing page visits
- ✅ Event batching for performance
- ✅ Server-side tracking for webhooks

## 🚀 Next Steps to Deploy

### 1. Run the Database Migration

**This is the only manual step required!**

1. Go to your Supabase dashboard
2. Navigate to: **SQL Editor** → **New Query**
3. Copy and paste the contents of `supabase-analytics-migration.sql`
4. Click **Run** to execute the migration

This will create:
- The `events` table
- All necessary indexes
- Row Level Security policies
- Helper functions and views

### 2. Deploy to Vercel

Your code is ready to deploy! Simply push to your repository:

```bash
git add .
git commit -m "Add analytics and tracking"
git push
```

Vercel will automatically deploy the changes.

### 3. Verify Analytics Are Working

After deployment, test the tracking:

1. **Sign up for a new account** → Creates `user_signup` event
2. **Log in** → Creates `user_login` event
3. **Visit dashboard** → Creates `dashboard_visit` and `page_view` events
4. **Open an app** → Creates `app_opened` event
5. **Visit pricing page** → Creates `pricing_page_view` event

### 4. Query Your Analytics Data

In Supabase SQL Editor:

```sql
-- See all recent events
SELECT * FROM events
ORDER BY created_at DESC
LIMIT 100;

-- Check Web Vitals
SELECT
  event_type,
  ROUND(AVG((event_data->>'value')::numeric), 2) as avg_value,
  COUNT(*) as sample_count
FROM events
WHERE event_type LIKE 'web_vital_%'
  AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY event_type;

-- Most popular apps
SELECT
  event_data->>'app_name' as app_name,
  COUNT(*) as opens,
  COUNT(DISTINCT user_id) as unique_users
FROM events
WHERE event_type = 'app_opened'
  AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY event_data->>'app_name'
ORDER BY opens DESC;

-- Use the helper view
SELECT * FROM event_analytics
WHERE event_date >= NOW() - INTERVAL '30 days'
ORDER BY event_date DESC;
```

## 📊 What Gets Tracked Automatically

### User Journey
- Page views (every route change)
- Login/signup/logout
- Dashboard visits
- App opens (with app name and category)
- Pricing page views
- Subscription upgrades/cancellations

### Performance
- Cumulative Layout Shift (CLS)
- Largest Contentful Paint (LCP)
- First Contentful Paint (FCP)
- Time to First Byte (TTFB)
- Interaction to Next Paint (INP)

### Errors
- Authentication errors
- API errors
- Checkout errors

## 📖 Full Documentation

See `ANALYTICS_IMPLEMENTATION.md` for:
- Complete event reference
- How to add custom tracking
- Advanced queries
- Query helper functions
- Maintenance tips

## 🎯 Optional Enhancements

### Enable Vercel Analytics (Optional)

For additional built-in analytics from Vercel:

1. Go to your Vercel project settings
2. Navigate to **Analytics**
3. Click **Enable**

This gives you Vercel's Web Vitals dashboard alongside your custom Supabase analytics.

### Add Calculation Tracking to Apps

To track when users complete calculations in each app, add to your calculator components:

```typescript
import { trackCalculationCompleted } from '@/lib/analytics';

// After calculation completes
await trackCalculationCompleted('Budget Calculator', 'monthly_budget', {
  income: userInput.income,
  expenses: userInput.expenses,
});
```

### Build an Analytics Dashboard

Create an admin page to visualize your analytics data:

1. Create `/app/admin/analytics/page.tsx`
2. Use `getRecentEvents()`, `getEventsByType()`, etc.
3. Display charts using Recharts (already installed)

## 🔒 Security & Privacy

- ✅ Row Level Security enabled (users only see their own events)
- ✅ Anonymous tracking supported (pre-auth events)
- ✅ Service role has admin access for backend tracking
- ✅ Automatic data retention (365 days by default)

## 📞 Need Help?

- Check `ANALYTICS_IMPLEMENTATION.md` for detailed documentation
- Query examples are included for common analytics needs
- All tracking functions have TypeScript types and JSDoc comments

---

**You're all set!** Just run the database migration and deploy. Analytics will start tracking automatically.
