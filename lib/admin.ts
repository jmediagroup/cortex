/**
 * Admin configuration
 * Uses email allowlist for admin access control
 */

// Admin email allowlist - add admin emails here
const ADMIN_EMAILS: string[] = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map(email => email.trim().toLowerCase())
  .filter(Boolean);

/**
 * Check if an email address belongs to an admin
 */
export function isAdmin(email: string | undefined | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}
