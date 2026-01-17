import { createBrowserClient } from './supabase/client';

// Event type definitions
export type EventType =
  // User events
  | 'user_signup'
  | 'user_login'
  | 'user_logout'
  | 'password_reset_requested'
  | 'password_reset_completed'
  | 'subscription_upgrade'
  | 'subscription_cancel'

  // App usage events
  | 'app_opened'
  | 'calculation_completed'
  | 'result_downloaded'
  | 'app_session_start'
  | 'app_session_end'

  // Engagement events
  | 'page_view'
  | 'dashboard_visit'
  | 'pricing_page_view'
  | 'account_page_view'

  // Donation events
  | 'donation_popup_shown'
  | 'donation_popup_clicked'
  | 'donation_popup_dismissed'

  // Error events
  | 'error_occurred'
  | 'api_error'

  // Web Vitals
  | 'web_vital_cls'
  | 'web_vital_fid'
  | 'web_vital_lcp'
  | 'web_vital_fcp'
  | 'web_vital_ttfb'
  | 'web_vital_inp';

export interface EventData {
  // Common fields
  app_name?: string;
  app_category?: string;
  calculation_type?: string;

  // Subscription fields
  old_tier?: string;
  new_tier?: string;
  plan_name?: string;

  // Error fields
  error_message?: string;
  error_stack?: string;
  error_code?: string;

  // Session fields
  session_duration?: number;

  // Web Vitals fields
  value?: number;
  rating?: 'good' | 'needs-improvement' | 'poor';
  delta?: number;

  // Generic fields
  [key: string]: string | number | boolean | undefined | null;
}

export interface AnalyticsEvent {
  user_id?: string;
  session_id: string;
  event_type: EventType;
  event_data?: EventData;
  page_url?: string;
  user_agent?: string;
}

// Generate or retrieve session ID
let sessionId: string | null = null;

export function getSessionId(): string {
  if (typeof window === 'undefined') return 'server-side';

  if (sessionId) return sessionId;

  // Try to get from sessionStorage
  const stored = sessionStorage.getItem('analytics_session_id');
  if (stored) {
    sessionId = stored;
    return sessionId;
  }

  // Generate new session ID
  sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  sessionStorage.setItem('analytics_session_id', sessionId);

  return sessionId;
}

// Event queue for batching
let eventQueue: AnalyticsEvent[] = [];
let flushTimeout: NodeJS.Timeout | null = null;
const FLUSH_INTERVAL = 5000; // Flush every 5 seconds
const BATCH_SIZE = 10; // Or when we have 10 events

// Track web vitals
export async function trackWebVital(
  name: string,
  value: number,
  rating: 'good' | 'needs-improvement' | 'poor',
  delta?: number
) {
  const eventType = `web_vital_${name.toLowerCase()}` as EventType;

  await trackEvent(eventType, {
    value,
    rating,
    delta,
  });
}

// Main tracking function
export async function trackEvent(
  eventType: EventType,
  eventData?: EventData,
  immediate = false
): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();

    const event: AnalyticsEvent = {
      user_id: user?.id,
      session_id: getSessionId(),
      event_type: eventType,
      event_data: eventData,
      page_url: window.location.href,
      user_agent: navigator.userAgent,
    };

    if (immediate) {
      // Send immediately for critical events
      await sendEvents([event]);
    } else {
      // Add to queue for batching
      eventQueue.push(event);

      // Flush if batch is full
      if (eventQueue.length >= BATCH_SIZE) {
        await flushEvents();
      } else {
        // Schedule flush
        scheduleFlush();
      }
    }
  } catch (error) {
    console.error('Failed to track event:', error);
  }
}

// Flush events to Supabase
async function flushEvents(): Promise<void> {
  if (eventQueue.length === 0) return;

  const eventsToSend = [...eventQueue];
  eventQueue = [];

  if (flushTimeout) {
    clearTimeout(flushTimeout);
    flushTimeout = null;
  }

  await sendEvents(eventsToSend);
}

// Send events to Supabase
async function sendEvents(events: AnalyticsEvent[]): Promise<void> {
  if (events.length === 0) return;

  try {
    const supabase = createBrowserClient();
    const { error } = await (supabase
      .from('events')
      .insert as any)(events);

    if (error) {
      console.error('Failed to send events:', error);
      // Optionally: retry logic here
    }
  } catch (error) {
    console.error('Failed to send events:', error);
  }
}

// Schedule flush
function scheduleFlush(): void {
  if (flushTimeout) return;

  flushTimeout = setTimeout(() => {
    flushEvents();
  }, FLUSH_INTERVAL);
}

// Flush on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (eventQueue.length > 0) {
      // Use sendBeacon for reliability
      const supabase = createBrowserClient();
      const events = [...eventQueue];

      // Try to send via fetch with keepalive
      fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(events),
        keepalive: true,
      }).catch(() => {
        // Silent fail on unload
      });
    }
  });
}

// Helper functions for common events

export async function trackPageView(pageName?: string): Promise<void> {
  await trackEvent('page_view', {
    page_name: pageName || document.title,
  });
}

export async function trackAppOpened(appName: string, appCategory?: string): Promise<void> {
  await trackEvent('app_opened', {
    app_name: appName,
    app_category: appCategory,
  });
}

export async function trackCalculationCompleted(
  appName: string,
  calculationType: string,
  additionalData?: EventData
): Promise<void> {
  await trackEvent('calculation_completed', {
    app_name: appName,
    calculation_type: calculationType,
    ...additionalData,
  });
}

export async function trackError(
  errorMessage: string,
  errorStack?: string,
  errorCode?: string
): Promise<void> {
  await trackEvent('error_occurred', {
    error_message: errorMessage,
    error_stack: errorStack,
    error_code: errorCode,
  }, true); // Send errors immediately
}

export async function trackSubscriptionChange(
  oldTier: string,
  newTier: string,
  eventType: 'subscription_upgrade' | 'subscription_cancel'
): Promise<void> {
  await trackEvent(eventType, {
    old_tier: oldTier,
    new_tier: newTier,
  }, true); // Send subscription events immediately
}

// Analytics query helpers (for dashboard/admin pages)
export async function getUserEventSummary(userId: string) {
  const supabase = createBrowserClient();

  const { data, error } = await (supabase
    .rpc as any)('get_user_event_summary', { target_user_id: userId });

  if (error) {
    console.error('Failed to get user event summary:', error);
    return null;
  }

  return data;
}

export async function getRecentEvents(limit = 50) {
  const supabase = createBrowserClient();

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Failed to get recent events:', error);
    return null;
  }

  return data;
}

export async function getEventsByType(eventType: EventType, limit = 100) {
  const supabase = createBrowserClient();

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('event_type', eventType)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Failed to get events by type:', error);
    return null;
  }

  return data;
}
