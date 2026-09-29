/**
 * Admin configuration
 * Uses email allowlist for admin access control
 */

// Admin email allowlist - uses NEXT_PUBLIC_ prefix so it's available in client components
const ADMIN_EMAILS: string[] = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
  .split(',')
  .map(email => email.trim().toLowerCase())
  .filter(Boolean);

/** The admin allowlist (lower-cased). */
export function getAdminEmails(): string[] {
  return [...ADMIN_EMAILS];
}

/**
 * Check if an email address belongs to an admin
 */
export function isAdmin(email: string | undefined | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}
