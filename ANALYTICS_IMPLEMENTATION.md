# Analytics & Tracking Implementation

This document outlines the complete analytics and tracking implementation for Cortex.

## Overview

The analytics system tracks user behavior, performance metrics, and business events across the platform using:
- **Supabase** for storing event data
- **Web Vitals** for performance monitoring
- **Custom event tracking** for user actions

## 📁 Files Created/Modified

### New Files
1. `supabase-analytics-migration.sql` - Database schema for events table
2. `lib/analytics.ts` - Client-side analytics utilities
3. `lib/analytics-server.ts` - Server-side analytics utilities
4. `components/WebVitals.tsx` - Web Vitals tracking component
5. `components/Analytics.tsx` - Page view tracking component

### Modified Files
1. `app/layout.tsx` - Added analytics components
2. `lib/supabase/client.ts` - Added events table types
3. `app/login/page.tsx` - Added login/signup/error tracking
4. `app/pricing/page.tsx` - Added pricing page and checkout tracking
5. `app/dashboard/page.tsx` - Added dashboard and app launch tracking
6. `app/api/webhooks/route.ts` - Added subscription event tracking
7. `package.json` - Added web-vitals dependency

## 🗄️ Database Setup

### Step 1: Run the Migration

Execute the SQL migration in your Supabase SQL Editor:

```bash
# Open the file and copy its contents
cat supabase-analytics-migration.sql
```

Then paste and run in: **Supabase Dashboard → SQL Editor → New Query**

### What the Migration Creates

1. **events table** with the following columns:
   - `id` - Auto-incrementing ID
   - `user_id` - References auth.users (nullable for anonymous events)
   - `session_id` - Browser session identifier
   - `event_type` - Type of event (e.g., 'user_login', 'app_opened')
   - `event_data` - JSONB field for additional metadata
   - `page_url` - URL where event occurred
   - `user_agent` - Browser user agent
   - `created_at` - Timestamp

2. **Indexes** for optimal query performance:
   - On user_id, event_type, created_at, session_id
   - GIN index on event_data for JSONB queries

3. **Row Level Security (RLS)** policies:
   - Users can insert their own events
   - Users can view their own events
   - Service role has full access

4. **Helper functions**:
   - `delete_old_events()` - Clean up events older than 365 days
   - `get_user_event_summary()` - Get event summary for a user

5. **Analytics view**:
   - `event_analytics` - Pre-aggregated event statistics

## 📊 Events Being Tracked

### User Events
| Event Type | When Triggered | Data Captured |
|------------|---------------|---------------|
| `user_signup` | User creates account | `tier` |
| `user_login` | User logs in | - |
| `user_logout` | User logs out | - |
| `subscription_upgrade` | User upgrades subscription | `new_tier`, `old_tier`, `subscription_id` |
| `subscription_cancel` | Subscription cancelled | `old_tier`, `new_tier`, `subscription_id` |

### App Usage Events
| Event Type | When Triggered | Data Captured |
|------------|---------------|---------------|
| `app_opened` | User opens an app | `app_name`, `app_id`, `app_category` |
| `page_view` | User navigates to a page | `page_name` |
| `dashboard_visit` | User visits dashboard | - |
| `pricing_page_view` | User visits pricing page | - |

### Error Events
| Event Type | When Triggered | Data Captured |
|------------|---------------|---------------|
| `error_occurred` | Client-side error | `error_message`, `error_code`, `error_stack`, `context` |
| `api_error` | API request fails | `error_message`, `error_code` |

### Web Vitals Events
| Event Type | When Triggered | Data Captured |
|------------|---------------|---------------|
| `web_vital_cls` | Cumulative Layout Shift measured | `value`, `rating`, `delta` |
| `web_vital_fid` | First Input Delay measured | `value`, `rating`, `delta` |
| `web_vital_lcp` | Largest Contentful Paint measured | `value`, `rating`, `delta` |
| `web_vital_fcp` | First Contentful Paint measured | `value`, `rating`, `delta` |
| `web_vital_ttfb` | Time to First Byte measured | `value`, `rating`, `delta` |
| `web_vital_inp` | Interaction to Next Paint measured | `value`, `rating`, `delta` |

## 🔧 How to Use Analytics

### Client-Side Tracking

```typescript
import { trackEvent } from '@/lib/analytics';

// Track a simple event
await trackEvent('page_view');

// Track event with data
await trackEvent('app_opened', {
  app_name: 'Budget Calculator',
  app_category: 'Finance',
});

// Track critical events immediately (don't batch)
await trackEvent('error_occurred', {
  error_message: 'API call failed',
  error_code: '500',
}, true);
```

### Server-Side Tracking

```typescript
import { trackServerEvent } from '@/lib/analytics-server';

// Track from API routes or server components
await trackServerEvent(
  userId,
  'subscription_upgrade',
  {
    new_tier: 'finance_pro',
    subscription_id: 'sub_123',
  }
);
```

### Helper Functions

```typescript
import {
  trackPageView,
  trackAppOpened,
  trackCalculationCompleted,
  trackError,
  trackSubscriptionChange,
} from '@/lib/analytics';

// Track page view
await trackPageView('Dashboard');

// Track app opened
await trackAppOpened('Budget Calculator', 'Finance');

// Track calculation
await trackCalculationCompleted('Budget Calculator', 'monthly_budget', {
  income: 5000,
  expenses: 3000,
});

// Track error
await trackError('Network error', stackTrace, 'ERR_NETWORK');

// Track subscription change
await trackSubscriptionChange('free', 'finance_pro', 'subscription_upgrade');
```

## 📈 Querying Analytics Data

### Get User Event Summary

```sql
SELECT * FROM get_user_event_summary('user-uuid-here');
```

### View Event Analytics

```sql
SELECT * FROM event_analytics
WHERE event_date >= NOW() - INTERVAL '30 days'
ORDER BY event_date DESC;
```

### Custom Queries

```sql
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

-- Conversion funnel
SELECT
  COUNT(CASE WHEN event_type = 'pricing_page_view' THEN 1 END) as pricing_views,
  COUNT(CASE WHEN event_type = 'subscription_upgrade' THEN 1 END) as upgrades,
  ROUND(
    COUNT(CASE WHEN event_type = 'subscription_upgrade' THEN 1 END)::numeric /
    NULLIF(COUNT(CASE WHEN event_type = 'pricing_page_view' THEN 1 END), 0) * 100,
    2
  ) as conversion_rate
FROM events
WHERE created_at >= NOW() - INTERVAL '30 days';

-- Error rate by page
SELECT
  page_url,
  COUNT(*) as error_count,
  COUNT(DISTINCT session_id) as affected_sessions
FROM events
WHERE event_type = 'error_occurred'
  AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY page_url
ORDER BY error_count DESC;

-- Web Vitals averages
SELECT
  event_type,
  ROUND(AVG((event_data->>'value')::numeric), 2) as avg_value,
  COUNT(*) as sample_count
FROM events
WHERE event_type LIKE 'web_vital_%'
  AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY event_type;
```

## 🎯 Key Features

### 1. Event Batching
- Events are queued and sent in batches (every 5 seconds or 10 events)
- Reduces network requests and improves performance
- Critical events can be sent immediately

### 2. Session Tracking
- Each browser session gets a unique ID
- Allows grouping related user actions
- Persists across page loads using sessionStorage

### 3. Anonymous Tracking
- Events can be tracked for non-logged-in users
- `user_id` is nullable for anonymous events

### 4. Performance Monitoring
- Automatic Web Vitals tracking
- Tracks all Core Web Vitals metrics
- Includes ratings (good/needs-improvement/poor)

### 5. Error Tracking
- Automatic error tracking on auth failures
- Captures error message, code, and context
- Sent immediately for quick alerting

### 6. Reliable Event Delivery
- Uses `keepalive` flag on page unload
- Ensures events are sent even when navigating away
- Fallback mechanisms for reliability

## 🔐 Security & Privacy

1. **Row Level Security**: Users can only see their own events
2. **Service Role Access**: Backend can track events on behalf of users
3. **Data Retention**: Built-in function to delete old events (365 days)
4. **Anonymous Support**: Can track without user_id for pre-auth flows

## 🚀 Next Steps

### Optional Enhancements

1. **Add calculation tracking to individual apps**
   ```typescript
   // In each calculator component
   await trackCalculationCompleted('App Name', 'calculation_type', {
     // calculation parameters
   });
   ```

2. **Create analytics dashboard**
   - Build an admin page to visualize event data
   - Use the helper functions and views
   - Display charts using Recharts (already in dependencies)

3. **Set up alerts**
   - Create Supabase Edge Functions to alert on high error rates
   - Monitor critical metrics in real-time

4. **Export functionality**
   - Add CSV export for analytics data
   - Integration with external analytics tools

5. **A/B Testing**
   - Use event_data to track experiment variants
   - Analyze conversion rates by variant

## 📞 Vercel Analytics (Optional)

To also enable Vercel's built-in Web Vitals:

1. Enable in Vercel project settings:
   - Go to your project → Analytics → Enable

2. The `web-vitals` package is already installed

3. Vercel will automatically collect Web Vitals

**Note**: You now have both custom Web Vitals tracking (in Supabase) and can optionally add Vercel's analytics for additional insights.

## 🧹 Maintenance

### Clean Up Old Events

Run periodically (e.g., via cron job or Supabase Edge Function):

```sql
SELECT delete_old_events();
```

### Monitor Event Volume

```sql
SELECT
  DATE_TRUNC('day', created_at) as day,
  COUNT(*) as event_count,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT session_id) as unique_sessions
FROM events
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY day DESC;
```

## ✅ Testing

After deployment, verify analytics are working:

1. **Sign up** → Check for `user_signup` event
2. **Log in** → Check for `user_login` event
3. **Visit dashboard** → Check for `dashboard_visit` and `page_view` events
4. **Open an app** → Check for `app_opened` event
5. **Visit pricing** → Check for `pricing_page_view` event
6. **Check Web Vitals** → Should see `web_vital_*` events after page loads

Query to verify:
```sql
SELECT * FROM events
WHERE created_at >= NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
```
