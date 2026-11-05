import { Resend } from 'resend';
import { checkSharedRateLimit } from '@/lib/rate-limit-shared';

/**
 * Operational alerts to the site owner: AI provider down, AI budget nearly
 * spent, a spike in failed logins.
 *
 * OFF until OPS_ALERT_EMAIL is set (CLAUDE.md rule 11: nothing is emailed
 * without Drew's go). It only ever sends to that one owner address — never
 * to users. Every alert is also written to the server log, so it is visible
 * in Vercel logs even while email is off.
 *
 * Each alert key is sent at most once per `dedupeSeconds` across all
 * serverless instances (the shared rate limiter does the bookkeeping), so a
 * flapping provider can't flood the inbox.
 *
 * Alert bodies must never contain PII or raw financial inputs (rule 8): only
 * counts, states and thresholds.
 */

const FROM_EMAIL =
  process.env.ENTERPRISE_FROM_EMAIL || 'Money Guy Mutants <notifications@moneyguymutants.com>';

export interface OpsAlert {
  /** Stable id for dedupe, e.g. "ai-circuit-open:why". */
  key: string;
  subject: string;
  /** Plain text. No PII. */
  body: string;
  /** Minimum seconds between two sends of the same key. Default 6 hours. */
  dedupeSeconds?: number;
}

export async function sendOpsAlert(alert: OpsAlert): Promise<void> {
  try {
    const dedupe = await checkSharedRateLimit(`ops-alert:${alert.key}`, {
      limit: 1,
      windowSeconds: alert.dedupeSeconds ?? 6 * 3600,
    });
    if (!dedupe.success) return;

    console.warn(`[ops-alert] ${alert.subject} — ${alert.body.replace(/\s+/g, ' ').slice(0, 300)}`);

    const to = process.env.OPS_ALERT_EMAIL;
    if (!to || !process.env.RESEND_API_KEY) return;

    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `[MGM ops] ${alert.subject}`,
      text: `${alert.body}\n\nRunbook: docs/HARDENING.md in the cortex repo.\nThis alert is sent at most once per ${Math.round(
        (alert.dedupeSeconds ?? 6 * 3600) / 3600,
      )} hour(s).`,
    });
    if (error) console.error('[ops-alert] send failed:', error.message);
  } catch (err) {
    // Alerting must never break the request that triggered it.
    console.error('[ops-alert] failed:', err instanceof Error ? err.message : 'unknown error');
  }
}
