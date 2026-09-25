/**
 * Pure helpers for the browser analytics batch in lib/analytics.ts. No browser
 * or Supabase imports, so they can be unit tested under Node.
 */

/** An event waiting in the browser queue. */
export interface QueuedEvent {
  /**
   * The signed-in user when the event was tracked, `null` when signed out, or
   * `undefined` when it was tracked before the stored session had been read
   * (filled in when the batch is sent).
   */
  user_id?: string | null;
  session_id: string;
  event_type: string;
  event_data?: Record<string, unknown> | null;
  page_url?: string | null;
  user_agent?: string | null;
}

/** A row for `public.events`, with every column present. */
export interface EventRow {
  user_id: string | null;
  session_id: string;
  event_type: string;
  event_data: Record<string, unknown> | null;
  page_url: string | null;
  user_agent: string | null;
}

/** Sent as PostgREST's `columns` parameter so every row inserts the same columns. */
export const EVENT_COLUMNS = [
  'user_id',
  'session_id',
  'event_type',
  'event_data',
  'page_url',
  'user_agent',
] as const;

/**
 * Browsers cap the bodies of in-flight `keepalive` requests at 64 KiB per
 * page; stay under it with some headroom.
 */
export const KEEPALIVE_MAX_BYTES = 60_000;

/**
 * Builds the rows for one insert request sent as `senderId` (the user whose
 * access token authenticates the request, or `null` for the anon key).
 *
 * The `events` insert policy only accepts rows whose `user_id` is the
 * caller's own id or NULL, and one rejected row fails the whole request. So
 * a row that would carry any other id — the token expired, or the user signed
 * out after the event was tracked — is recorded anonymously instead of losing
 * the batch. Events tracked before the stored session was read take
 * `knownUserId`.
 */
export function toEventRows(
  events: readonly QueuedEvent[],
  senderId: string | null,
  knownUserId: string | null,
): EventRow[] {
  return events.map((e) => {
    const userId = e.user_id === undefined ? knownUserId : e.user_id;
    return {
      user_id: userId !== null && userId === senderId ? userId : null,
      session_id: e.session_id,
      event_type: e.event_type,
      event_data: e.event_data ?? null,
      page_url: e.page_url ?? null,
      user_agent: e.user_agent ?? null,
    };
  });
}

/**
 * Whether an access token (Supabase `expires_at`, in seconds) is still good
 * for at least `marginMs`. An unknown expiry is left for the server to judge.
 */
export function isTokenUsable(
  expiresAt: number | null | undefined,
  nowMs: number,
  marginMs = 10_000,
): boolean {
  if (expiresAt === null || expiresAt === undefined) return true;
  return expiresAt * 1000 - nowMs > marginMs;
}
