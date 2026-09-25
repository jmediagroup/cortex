import { createBrowserClient } from './supabase/client';
import {
  EVENT_COLUMNS,
  KEEPALIVE_MAX_BYTES,
  isTokenUsable,
  toEventRows,
  type QueuedEvent,
} from './analytics-batch';

// Event type definitions
export type EventType =
  // User events
  | 'user_signup'
  | 'user_login'
  | 'user_logout'
  | 'password_reset_requested'
  | 'password_reset_completed'
  | 'resend_verification_requested'
  | 'subscription_upgrade'
  | 'subscription_cancel'
  | 'subscription_success_view'

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
  | 'enterprise_page_view'
  | 'enterprise_form_submitted'

  // Search landing pages (/calculators/*)
  | 'landing_page_view'
  | 'landing_cta_click'

  // Onboarding events
  | 'onboarding_started'
  | 'onboarding_step_completed'
  | 'onboarding_completed'
  | 'onboarding_skipped'

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
  // Landing page attribution
  landing_slug?: string;
  cta_location?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  referrer?: string;
  plan?: string;
  source?: string;

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

// ---------------------------------------------------------------------------
// Batching
//
// Events wait in memory and go to Supabase in ONE insert when the page is
// hidden (tab switch, close or navigation away), so a page view and its Web
// Vitals cost one request instead of one each — and a very short visit still
// records its page_view. `immediate` events (errors, sign-in, checkout) flush
// the queue right away, and a long-lived tab also flushes every
// MAX_QUEUED_EVENTS events.
// ---------------------------------------------------------------------------

const MAX_QUEUED_EVENTS = 25;
let eventQueue: QueuedEvent[] = [];

// The signed-in user, read once per page load from the session stored in the
// browser's cookies (no auth request per event, unlike the old getUser() call)
// and then kept current by the auth client's own events (token refresh,
// sign-in, sign-out). Inserts are sent with this user's access token, like
// supabase-js would, so the `events` insert policy
// (auth.uid() = user_id OR user_id IS NULL) accepts rows carrying their id.
interface Identity {
  userId: string;
  accessToken: string;
  /** Supabase `expires_at`, in seconds. */
  expiresAt: number | null;
}
let identity: Identity | null = null;
let identityKnown = false;
let identityWatched = false;

function watchIdentity(): void {
  if (identityWatched) return;
  identityWatched = true;
  try {
    createBrowserClient().auth.onAuthStateChange((_event, session) => {
      const next: Identity | null =
        session?.user && session.access_token
          ? {
              userId: session.user.id,
              accessToken: session.access_token,
              expiresAt: session.expires_at ?? null,
            }
          : null;
      // Signed out or switched accounts: send what the previous user queued
      // with their token first, so those rows keep their user_id.
      if (identity && identity.userId !== next?.userId) void flushEvents();
      identity = next;
      identityKnown = true;
    });
  } catch (error) {
    // Supabase isn't configured; events are recorded anonymously.
    identityKnown = true;
    console.error('Failed to read the session for analytics:', error);
  }
}

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

// Main tracking function. Queues synchronously — nothing is awaited before
// the event is in the queue — so it survives an immediate page close.
export async function trackEvent(
  eventType: EventType,
  eventData?: EventData,
  immediate = false
): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    watchIdentity();

    eventQueue.push({
      // `undefined` until the stored session has been read; filled in when sent.
      user_id: identityKnown ? (identity?.userId ?? null) : undefined,
      session_id: getSessionId(),
      event_type: eventType,
      event_data: eventData,
      page_url: window.location.href,
      user_agent: navigator.userAgent,
    });

    if (immediate || eventQueue.length >= MAX_QUEUED_EVENTS) {
      await flushEvents();
    }
  } catch (error) {
    console.error('Failed to track event:', error);
  }
}

// Sends everything queued so far as one insert.
function flushEvents(): Promise<void> {
  if (eventQueue.length === 0) return Promise.resolve();

  const events = eventQueue;
  eventQueue = [];
  return sendEvents(events);
}

// A direct PostgREST insert — the same request supabase-js makes — so it can
// use `keepalive` and still complete while the page unloads. The request is
// built synchronously from the current identity.
function sendEvents(events: QueuedEvent[]): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey || events.length === 0) return Promise.resolve();

  const sender = identity && isTokenUsable(identity.expiresAt, Date.now()) ? identity : null;
  const rows = toEventRows(
    events,
    sender?.userId ?? null,
    identityKnown ? (identity?.userId ?? null) : null,
  );
  const body = JSON.stringify(rows);

  return fetch(`${supabaseUrl}/rest/v1/events?columns=${EVENT_COLUMNS.join(',')}`, {
    method: 'POST',
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${sender?.accessToken ?? anonKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body,
    keepalive: new TextEncoder().encode(body).length <= KEEPALIVE_MAX_BYTES,
  })
    .then((res) => {
      if (!res.ok) console.error('Failed to send events:', res.status);
    })
    .catch((error) => {
      console.error('Failed to send events:', error);
    });
}

if (typeof window !== 'undefined') {
  // Registered on window in the bubble phase, so it runs after web-vitals'
  // capture-phase listeners have queued the page's final CLS/INP/LCP values.
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') void flushEvents();
  });
  // Closing the tab or leaving the page fires `pagehide` first and then
  // `visibilitychange` (the spec order, which Chrome follows), so a
  // still-visible page is flushed once by the visibilitychange handler above,
  // after web-vitals has queued its final values. Flush here only when the
  // page is already hidden, e.g. in browsers that fire the events the other
  // way round.
  window.addEventListener('pagehide', () => {
    if (document.visibilityState === 'hidden') void flushEvents();
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
