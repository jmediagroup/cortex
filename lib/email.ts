import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Email address to receive enterprise lead notifications
const SALES_EMAIL = process.env.SALES_NOTIFICATION_EMAIL || 'sales@cortex.vip';

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
      from: 'Cortex Sales <notifications@cortex.vip>',
      to: SALES_EMAIL,
      subject: `New Enterprise Lead: ${lead.companyName}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 24px; border-radius: 16px 16px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 800;">
              New Enterprise Lead
            </h1>
          </div>

          <div style="background: #f8fafc; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 16px 16px;">
            <h2 style="color: #1e293b; font-size: 18px; font-weight: 700; margin: 0 0 16px 0;">
              Contact Information
            </h2>

            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-weight: 600; width: 140px;">Name</td>
                <td style="padding: 8px 0; color: #1e293b; font-weight: 500;">${lead.firstName} ${lead.lastName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Email</td>
                <td style="padding: 8px 0;">
                  <a href="mailto:${lead.email}" style="color: #4f46e5; text-decoration: none; font-weight: 500;">${lead.email}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Company</td>
                <td style="padding: 8px 0; color: #1e293b; font-weight: 500;">${lead.companyName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Company Size</td>
                <td style="padding: 8px 0; color: #1e293b; font-weight: 500;">${lead.companySize} employees</td>
              </tr>
              ${lead.phone ? `
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Phone</td>
                <td style="padding: 8px 0;">
                  <a href="tel:${lead.phone}" style="color: #4f46e5; text-decoration: none; font-weight: 500;">${lead.phone}</a>
                </td>
              </tr>
              ` : ''}
            </table>

            <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
              <h2 style="color: #1e293b; font-size: 18px; font-weight: 700; margin: 0 0 12px 0;">
                Message
              </h2>
              <div style="background: white; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0;">
                <p style="color: #334155; margin: 0; line-height: 1.6; white-space: pre-wrap;">${lead.message}</p>
              </div>
            </div>

            <div style="margin-top: 24px; text-align: center;">
              <a href="mailto:${lead.email}?subject=Re: Your Cortex Enterprise Inquiry"
                 style="display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 700;">
                Reply to Lead
              </a>
            </div>
          </div>

          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 16px;">
            This is an automated notification from Cortex.
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
