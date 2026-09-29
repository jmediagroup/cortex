import { createServiceClient } from './supabase/client';
import { isFunnelEvent, sanitizeFunnelData } from './tool-funnel';
import type { EventType, EventData } from './analytics';

/**
 * Server-side analytics tracking
 * Use this for tracking events from API routes and server-side code
 */
export async function trackServerEvent(
  userId: string | null,
  eventType: EventType,
  eventData?: EventData,
  sessionId?: string
): Promise<void> {
  try {
    let data: EventData | undefined = eventData;
    if (isFunnelEvent(eventType)) {
      const safe = sanitizeFunnelData(eventType, eventData);
      if (!safe) return;
      data = safe;
    }

    const supabase = createServiceClient();

    const event = {
      user_id: userId,
      session_id: sessionId || `server-${Date.now()}`,
      event_type: eventType,
      event_data: data,
      page_url: null,
      user_agent: null,
    };

    const { error } = await (supabase
      .from('events')
      .insert as any)([event]);

    if (error) {
      console.error('Failed to track server event:', error);
    }
  } catch (error) {
    console.error('Failed to track server event:', error);
  }
}
