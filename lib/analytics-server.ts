import { createServiceClient } from './supabase/client';
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
    const supabase = createServiceClient();

    const event = {
      user_id: userId,
      session_id: sessionId || `server-${Date.now()}`,
      event_type: eventType,
      event_data: eventData,
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
