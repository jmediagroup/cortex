/**
 * Cheap, invisible bot signals shared by every public form (signup, login,
 * enterprise lead, newsletter). Turnstile (lib/turnstile.ts) is the real bot
 * control; these catch the lazy scripts for free and cost real people nothing.
 *
 *  - Honeypot: a field hidden from people (off-screen, aria-hidden, no
 *    tab stop). Anything typed into it came from a script that fills every
 *    input. Callers answer with a decoy success where they can, so the bot
 *    can't tell it was caught.
 *  - Fill time: the form sends the timestamp it rendered at. A submit faster
 *    than a person could read the form is a script. Kept low on purpose:
 *    password managers fill and submit in under a second, so this answer is a
 *    *visible* "please try again", never a silent drop.
 *
 * Dependency-free so it can be unit-tested with plain `node --test`.
 */

/** The hidden field name every form uses. Chosen so no autofill heuristic matches it. */
export const HONEYPOT_FIELD = 'mgm_hp';

export type BotSignal =
  | { ok: true }
  | {
      ok: false;
      reason: 'honeypot' | 'too_fast' | 'missing_timing';
      /** True when the caller should answer with a fake success (honeypot only). */
      decoy: boolean;
    };

export interface BotSignalInput {
  honeypot: unknown;
  formStartedAt: unknown;
  /** Minimum plausible fill time. 0 disables the timing check. */
  minFillMs: number;
  /** When true, a missing/invalid `formStartedAt` is rejected. */
  requireTiming: boolean;
  /**
   * The values the person typed into the real fields (email, password, name).
   * Browser autofill and password managers sometimes drop one of these into
   * the hidden field too. A honeypot holding the person's *own* value is
   * autofill, not a bot, and must not block them.
   */
  ownValues?: unknown[];
  now?: number;
}

/** True when the honeypot just repeats one of the person's own field values (autofill). */
export function isAutofillEcho(honeypot: string, ownValues: unknown[] = []): boolean {
  const echo = honeypot.trim().toLowerCase();
  if (!echo) return false;
  return ownValues.some((v) => typeof v === 'string' && v.trim() !== '' && v.trim().toLowerCase() === echo);
}

export function checkBotSignals(input: BotSignalInput): BotSignal {
  const { honeypot, formStartedAt, minFillMs, requireTiming } = input;
  const now = input.now ?? Date.now();

  if (typeof honeypot === 'string' && honeypot.trim() !== '' && !isAutofillEcho(honeypot, input.ownValues)) {
    return { ok: false, reason: 'honeypot', decoy: true };
  }

  const hasTiming = typeof formStartedAt === 'number' && Number.isFinite(formStartedAt);
  if (!hasTiming) {
    return requireTiming ? { ok: false, reason: 'missing_timing', decoy: false } : { ok: true };
  }

  // Negative elapsed = the visitor's clock is behind ours; treat as fine.
  const elapsed = now - (formStartedAt as number);
  if (minFillMs > 0 && elapsed >= 0 && elapsed < minFillMs) {
    return { ok: false, reason: 'too_fast', decoy: false };
  }

  return { ok: true };
}

/** User-facing copy for a non-decoy bot signal. */
export function botSignalMessage(reason: 'too_fast' | 'missing_timing'): string {
  return reason === 'too_fast'
    ? 'That was quick! Please double-check your details and submit again.'
    : 'Something went wrong with the form. Please refresh the page and try again.';
}
