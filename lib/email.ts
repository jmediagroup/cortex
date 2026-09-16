import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Email address to receive enterprise lead notifications.
const SALES_EMAIL = process.env.SALES_NOTIFICATION_EMAIL || 'sales@moneyguymutants.com';

// Sender for outbound notifications. Env-configurable via Vercel; defaults now
// point at the primary @moneyguymutants.com domain (Resend-verified post-cutover
// — see DOMAIN_MIGRATION.md). The old @cortex.vip default was dropped once the
// domain moved, so a missing env var no longer sends from an unverified domain.
const FROM_EMAIL =
  process.env.ENTERPRISE_FROM_EMAIL || 'Money Guy Mutants <notifications@moneyguymutants.com>';

export interface EnterpriseLeadEmailData {
  firstName: string;
  lastName: string;
  email: string;
  companyName: string;
  companySize: string;
  phone: string | null;
  message: string;
}

/**
 * Send notification email when a new enterprise lead is submitted
 */
export async function sendEnterpriseLeadNotification(
  lead: EnterpriseLeadEmailData
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: SALES_EMAIL,
      subject: `New Enterprise Lead: ${lead.companyName}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #054C7D; padding: 24px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.02em; text-transform: uppercase;">
              New Enterprise Lead
            </h1>
          </div>

          <div style="background: #F7F3F3; padding: 24px; border: 1px solid #E0DBDB; border-top: none; border-radius: 0 0 8px 8px;">
            <h2 style="color: #08375A; font-size: 18px; font-weight: 700; margin: 0 0 16px 0;">
              Contact Information
            </h2>

            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #48494A; font-weight: 600; width: 140px;">Name</td>
                <td style="padding: 8px 0; color: #08375A; font-weight: 500;">${lead.firstName} ${lead.lastName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #48494A; font-weight: 600;">Email</td>
                <td style="padding: 8px 0;">
                  <a href="mailto:${lead.email}" style="color: #054C7D; text-decoration: none; font-weight: 500;">${lead.email}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #48494A; font-weight: 600;">Company</td>
                <td style="padding: 8px 0; color: #08375A; font-weight: 500;">${lead.companyName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #48494A; font-weight: 600;">Company Size</td>
                <td style="padding: 8px 0; color: #08375A; font-weight: 500;">${lead.companySize} employees</td>
              </tr>
              ${lead.phone ? `
              <tr>
                <td style="padding: 8px 0; color: #48494A; font-weight: 600;">Phone</td>
                <td style="padding: 8px 0;">
                  <a href="tel:${lead.phone}" style="color: #054C7D; text-decoration: none; font-weight: 500;">${lead.phone}</a>
                </td>
              </tr>
              ` : ''}
            </table>

            <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #E0DBDB;">
              <h2 style="color: #08375A; font-size: 18px; font-weight: 700; margin: 0 0 12px 0;">
                Message
              </h2>
              <div style="background: white; padding: 16px; border-radius: 12px; border: 1px solid #E0DBDB;">
                <p style="color: #3D5666; margin: 0; line-height: 1.6; white-space: pre-wrap;">${lead.message}</p>
              </div>
            </div>

            <div style="margin-top: 24px; text-align: center;">
              <a href="mailto:${lead.email}?subject=Re: Your Money Guy Mutants Enterprise Inquiry"
                 style="display: inline-block; background: #F26531; color: white; padding: 12px 26px; border-radius: 4px; text-decoration: none; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; font-size: 14px;">
                Reply to Lead
              </a>
            </div>
          </div>

          <p style="color: #767676; font-size: 12px; text-align: center; margin-top: 16px;">
            This is an automated notification from Money Guy Mutants.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Failed to send enterprise lead notification:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Email service error:', error);
    return { success: false, error: error.message || 'Failed to send email' };
  }
}

// ---------------------------------------------------------------------------
// New-user signup notification
// ---------------------------------------------------------------------------

/**
 * Where new-signup alerts land. Hardcoded on purpose: this is the site owner's
 * personal inbox, not a role address that ops might re-point, so there's no env
 * var to forget to set in a new environment.
 */
const NEW_USER_NOTIFICATION_EMAIL = 'drew@jmediagroup.net';

/** Brand palette, mirrored from emails/*-template.html so these stay in sync. */
const MAIL = {
  pageBg: '#F7F3F3',
  cardBg: '#0a4a73',
  heading: '#F5F5F7',
  body: '#C8C8C8',
  muted: '#8A9BA8',
  footer: '#5F7280',
  sky: '#4EC9F5',
  orange: '#F26531',
  hairline: 'rgba(255,255,255,0.06)',
} as const;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || 'https://moneyguymutants.com';

/**
 * Escapes user-supplied values before they're interpolated into email HTML.
 * A display name is attacker-controlled up to the point our validation allows,
 * and a stray `<` would otherwise break the layout in the recipient's client.
 */
function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Human-readable reasons for the codes `lib/email-hygiene.ts` records. */
const FLAG_LABELS: Record<string, string> = {
  invalid_email: 'Invalid email address',
  disposable_domain: 'Disposable / throwaway email domain',
  lookalike_domain: 'Lookalike of a major provider domain',
  alias_address: 'Alias of another inbox (plus-tag or dot variant)',
  machine_generated_name: 'Name looks machine-generated',
};

function flagLabel(code: string): string {
  return FLAG_LABELS[code] ?? code.replace(/_/g, ' ');
}

export interface NewUserEmailData {
  /** The address as entered at signup. */
  email: string;
  /** First name, when the signup form collected one. */
  firstName: string | null;
  /** Supabase auth user id, when the insert returned one. */
  userId: string | null;
  /** Reason codes from `assessSignup()` — empty for a clean signup. */
  signupFlags: string[];
  /** True when the hygiene policy flagged (but did not block) the signup. */
  isFlagged: boolean;
  /** When the account was created. Defaults to now. */
  signedUpAt?: Date;
}

/**
 * Notify the site owner that someone registered.
 *
 * Fired from the signup route after the account is created. Best-effort by
 * design: a failure here is logged and swallowed by the caller, because a
 * notification problem must never cost a real user their account.
 */
export async function sendNewUserNotification(
  user: NewUserEmailData
): Promise<{ success: boolean; error?: string }> {
  const signedUpAt = user.signedUpAt ?? new Date();

  const displayName = user.firstName?.trim() ? user.firstName.trim() : null;
  const safeName = displayName ? escapeHtml(displayName) : null;
  const safeEmail = escapeHtml(user.email);
  const safeUserId = user.userId ? escapeHtml(user.userId) : null;

  const timestamp = signedUpAt.toLocaleString('en-US', {
    timeZone: 'America/New_York',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  const row = (label: string, value: string) => `
              <tr>
                <td style="padding:10px 0; color:${MAIL.muted}; font-size:13px; font-weight:600; text-transform:uppercase; letter-spacing:0.06em; vertical-align:top; width:132px;">${label}</td>
                <td style="padding:10px 0; color:${MAIL.body}; font-size:15px; line-height:1.5; vertical-align:top;">${value}</td>
              </tr>`;

  const flagCallout =
    user.signupFlags.length > 0
      ? `
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:24px 0 0 0;">
                <tr>
                  <td style="padding:16px 18px; background-color:rgba(242,101,49,0.12); border:1px solid rgba(242,101,49,0.35); border-radius:10px;">
                    <p style="margin:0 0 8px 0; color:${MAIL.orange}; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em;">${user.isFlagged ? 'Flagged for review' : 'Signup signals'}</p>
                    <p style="margin:0; color:${MAIL.body}; font-size:14px; line-height:1.6;">${user.signupFlags.map((code) => escapeHtml(flagLabel(code))).join('<br>')}</p>
                  </td>
                </tr>
              </table>`
      : '';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="dark light">
  <title>New signup — Money Guy Mutants</title>
</head>
<body style="margin:0; padding:0; background-color:${MAIL.pageBg}; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <span style="display:none; visibility:hidden; opacity:0; color:transparent; height:0; width:0; overflow:hidden;">${safeName ? `${safeName} (${safeEmail})` : safeEmail} just created an account.</span>
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:${MAIL.pageBg};">
    <tr>
      <td style="padding:32px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width:560px; margin:0 auto; background-color:${MAIL.cardBg}; border:1px solid rgba(255,255,255,0.10); border-radius:16px; overflow:hidden;">

          <!-- Header / logo lockup -->
          <tr>
            <td style="padding:18px 32px; border-bottom:1px solid ${MAIL.hairline};">
              <a href="${APP_URL}" style="text-decoration:none; display:inline-block;">
                <img src="${APP_URL}/mutant-mark.png" width="30" height="31" alt="Money Guy Mutants" style="display:inline-block; vertical-align:middle; border:0; margin-right:11px;">
                <span style="color:${MAIL.sky}; font-weight:700; letter-spacing:0.06em; font-size:13px; text-transform:uppercase; vertical-align:middle;">Money Guy Mutants</span>
              </a>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 32px 8px 32px;">
              <p style="margin:0 0 10px 0; color:${MAIL.sky}; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em;">New signup</p>
              <h1 style="margin:0 0 16px 0; color:${MAIL.heading}; font-size:24px; font-weight:700; letter-spacing:-0.02em; line-height:1.25;">${safeName ? `${safeName} joined` : 'Someone joined'}</h1>
              <p style="margin:0 0 24px 0; color:${MAIL.body}; font-size:16px; line-height:1.6;">A new account was created on Money Guy Mutants.</p>

              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-top:1px solid ${MAIL.hairline};">
                ${row('Name', safeName ?? `<span style="color:${MAIL.muted};">Not provided</span>`)}
                ${row('Email', `<a href="mailto:${safeEmail}" style="color:${MAIL.sky}; text-decoration:none; word-break:break-all;">${safeEmail}</a>`)}
                ${row('Signed up', timestamp)}
                ${row('Status', `<span style="color:${MAIL.body};">Pending email verification</span>`)}
                ${safeUserId ? row('User ID', `<span style="font-family:ui-monospace, SFMono-Regular, Menlo, monospace; font-size:13px; color:${MAIL.muted}; word-break:break-all;">${safeUserId}</span>`) : ''}
              </table>
              ${flagCallout}

              <!-- CTA -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:28px 0 0 0;">
                <tr>
                  <td style="border-radius:4px; background-color:${MAIL.orange};">
                    <a href="${APP_URL}/admin/users" style="display:inline-block; background-color:${MAIL.orange}; color:#FFFFFF; font-size:14px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; text-decoration:none; padding:14px 30px; border-radius:4px;">View in admin</a>
                  </td>
                </tr>
              </table>

              <p style="margin:24px 0 0 0; color:${MAIL.muted}; font-size:14px; line-height:1.6;">The account stays unverified until they confirm their email address.</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px; border-top:1px solid ${MAIL.hairline}; text-align:center;">
              <p style="margin:0 0 6px 0; color:${MAIL.footer}; font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:0.08em;">Money Guy Mutants</p>
              <p style="margin:0; color:${MAIL.footer}; font-size:12px;">Automated signup notification · <a href="${APP_URL}" style="color:${MAIL.footer}; text-decoration:none;">moneyguymutants.com</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const textLines = [
    'New signup on Money Guy Mutants',
    '',
    `Name:      ${displayName ?? 'Not provided'}`,
    `Email:     ${user.email}`,
    `Signed up: ${timestamp}`,
    'Status:    Pending email verification',
    ...(user.userId ? [`User ID:   ${user.userId}`] : []),
    ...(user.signupFlags.length > 0
      ? ['', user.isFlagged ? 'Flagged for review:' : 'Signup signals:', ...user.signupFlags.map((c) => `  - ${flagLabel(c)}`)]
      : []),
    '',
    `View in admin: ${APP_URL}/admin/users`,
  ];

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: NEW_USER_NOTIFICATION_EMAIL,
      replyTo: user.email,
      subject: `New signup: ${displayName ? `${displayName} (${user.email})` : user.email}`,
      html,
      text: textLines.join('\n'),
    });

    if (error) {
      console.error('Failed to send new user notification:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to send email';
    console.error('New user notification error:', message);
    return { success: false, error: message };
  }
}
