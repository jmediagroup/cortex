import { Resend } from 'resend';
import type { OutlookListItem } from './types';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.OUTLOOK_FROM_EMAIL || 'Cortex Outlook <outlook@cortex.vip>';
const REPLY_TO = process.env.OUTLOOK_REPLY_TO || undefined;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://cortex.vip';

interface SendResult {
  success: boolean;
  error?: string;
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function shellHtml({
  preheader,
  bodyInner,
  unsubscribeUrl,
}: {
  preheader: string;
  bodyInner: string;
  unsubscribeUrl?: string;
}): string {
  const footer = unsubscribeUrl
    ? `<a href="${unsubscribeUrl}" style="color:#94a3b8;text-decoration:underline;">Unsubscribe</a> · `
    : '';
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Cortex Outlook</title></head>
<body style="margin:0;padding:24px;background:#0a0e14;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <span style="display:none;visibility:hidden;opacity:0;color:transparent;height:0;width:0;">${escapeHtml(preheader)}</span>
  <div style="max-width:600px;margin:0 auto;background:#121620;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;">
    <div style="padding:20px 24px;border-bottom:1px solid rgba(255,255,255,0.06);">
      <a href="${APP_URL}" style="color:#00f0a0;text-decoration:none;font-weight:700;letter-spacing:0.04em;font-size:13px;text-transform:uppercase;">Cortex · Outlook</a>
    </div>
    ${bodyInner}
    <div style="padding:20px 24px;border-top:1px solid rgba(255,255,255,0.06);color:#64748b;font-size:12px;text-align:center;">
      ${footer}<a href="${APP_URL}/thinking" style="color:#94a3b8;text-decoration:underline;">More on Cortex</a>
    </div>
  </div>
</body></html>`;
}

export async function sendConfirmationEmail(params: {
  email: string;
  confirmationToken: string;
}): Promise<SendResult> {
  const confirmUrl = `${APP_URL}/api/outlook/confirm?token=${encodeURIComponent(params.confirmationToken)}`;

  const html = shellHtml({
    preheader: 'Confirm your subscription to the Cortex Investment Outlook.',
    bodyInner: `
      <div style="padding:32px 24px;color:#aeaeb2;line-height:1.6;">
        <h1 style="color:#f5f5f7;font-size:22px;font-weight:700;margin:0 0 16px;letter-spacing:-0.02em;">Confirm your subscription</h1>
        <p style="margin:0 0 16px;">Click below to start receiving the daily and weekly Cortex Investment Outlook.</p>
        <p style="margin:0 0 24px;">
          <a href="${confirmUrl}" style="display:inline-block;background:#00f0a0;color:#0a0e14;padding:12px 22px;border-radius:10px;font-weight:700;text-decoration:none;">Confirm subscription</a>
        </p>
        <p style="margin:0;font-size:13px;color:#64748b;">If you didn't request this, you can ignore this email.</p>
      </div>`,
  });

  const text = `Confirm your subscription to the Cortex Investment Outlook:\n${confirmUrl}\n\nIf you didn't request this, you can ignore this email.`;

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: params.email,
      subject: 'Confirm your Cortex Outlook subscription',
      html,
      text,
      ...(REPLY_TO ? { replyTo: REPLY_TO } : {}),
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return { success: false, error: message };
  }
}

export interface DigestEmailContent {
  outlook: OutlookListItem;
  leadHtml: string;
  leadText: string;
}

interface DigestSendParams extends DigestEmailContent {
  to: string;
  unsubscribeToken: string;
}

export async function sendDigestEmail(params: DigestSendParams): Promise<SendResult> {
  const { outlook, leadHtml, leadText, to, unsubscribeToken } = params;
  const url = `${APP_URL}/thinking/${outlook.slug}`;
  const unsubscribeUrl = `${APP_URL}/api/outlook/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`;
  const subjectPrefix = outlook.type === 'weekly' ? 'Weekly Outlook' : 'Daily Outlook';

  const tickersHtml = outlook.tickers.length
    ? `<div style="margin:0 0 20px;">
        ${outlook.tickers
          .slice(0, 8)
          .map(
            (t) =>
              `<span style="display:inline-block;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;font-weight:600;letter-spacing:0.04em;color:#00f0a0;background:rgba(0,240,160,0.08);border:1px solid rgba(0,240,160,0.25);padding:3px 9px;border-radius:9999px;margin:0 4px 4px 0;">${escapeHtml(t)}</span>`,
          )
          .join('')}
      </div>`
    : '';

  const html = shellHtml({
    preheader: outlook.summary,
    unsubscribeUrl,
    bodyInner: `
      <div style="padding:32px 24px;color:#aeaeb2;line-height:1.65;">
        <div style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;color:#64748b;letter-spacing:0.06em;text-transform:uppercase;margin:0 0 12px;">
          ${escapeHtml(outlook.type === 'weekly' ? 'Weekly Outlook' : 'Daily Outlook')} · ${escapeHtml(formatDate(outlook.date))}
        </div>
        <h1 style="color:#f5f5f7;font-size:26px;font-weight:700;margin:0 0 12px;letter-spacing:-0.02em;line-height:1.2;">${escapeHtml(outlook.title)}</h1>
        <p style="margin:0 0 20px;color:#cbd5e1;font-size:16px;">${escapeHtml(outlook.summary)}</p>
        ${tickersHtml}
        <div style="border-top:1px solid rgba(255,255,255,0.06);padding-top:20px;color:#cbd5e1;">
          ${leadHtml}
        </div>
        <p style="margin:24px 0 0;">
          <a href="${url}" style="display:inline-block;background:#00f0a0;color:#0a0e14;padding:12px 22px;border-radius:10px;font-weight:700;text-decoration:none;">Continue reading on Cortex →</a>
        </p>
      </div>`,
  });

  const text = `${subjectPrefix} · ${formatDate(outlook.date)}\n\n${outlook.title}\n\n${outlook.summary}\n\n${leadText}\n\nContinue reading: ${url}\nUnsubscribe: ${unsubscribeUrl}`;

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to,
      subject: `${subjectPrefix}: ${outlook.title}`,
      html,
      text,
      headers: {
        'List-Unsubscribe': `<${unsubscribeUrl}>, <mailto:unsubscribe@cortex.vip?subject=unsubscribe>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
      ...(REPLY_TO ? { replyTo: REPLY_TO } : {}),
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return { success: false, error: message };
  }
}
