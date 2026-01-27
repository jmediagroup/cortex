/**
 * Validation utilities for API endpoints and user input
 */

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates Stripe price ID format
 */
export function isValidPriceId(priceId: string): boolean {
  // Stripe price IDs start with 'price_'
  return typeof priceId === 'string' && priceId.startsWith('price_') && priceId.length > 6;
}

/**
 * Validates Stripe customer ID format
 */
export function isValidCustomerId(customerId: string): boolean {
  // Stripe customer IDs start with 'cus_'
  return typeof customerId === 'string' && customerId.startsWith('cus_') && customerId.length > 4;
}

/**
 * Validates UUID format (for user IDs)
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validates allowed price IDs from environment
 */
export function isAllowedPriceId(priceId: string): boolean {
  const allowedPriceIds = [
    // Finance Pro
    process.env.NEXT_PUBLIC_STRIPE_FINANCE_PRO_MONTHLY_PRICE_ID,
    process.env.NEXT_PUBLIC_STRIPE_FINANCE_PRO_ANNUAL_PRICE_ID,

    // Elite
    process.env.NEXT_PUBLIC_STRIPE_ELITE_MONTHLY_PRICE_ID,
    process.env.NEXT_PUBLIC_STRIPE_ELITE_ANNUAL_PRICE_ID,

    // Legacy
    process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID,
  ].filter(Boolean);

  return allowedPriceIds.includes(priceId);
}

/**
 * Sanitizes string input to prevent injection attacks
 */
export function sanitizeString(input: string, maxLength: number = 255): string {
  return input
    .trim()
    .substring(0, maxLength)
    .replace(/[<>]/g, ''); // Remove potential HTML tags
}

/**
 * Validates phone number format (basic international support)
 */
export function isValidPhone(phone: string): boolean {
  if (!phone || phone.trim() === '') return true; // Phone is optional
  const phoneRegex = /^[\d\s\-\+\(\)]{10,20}$/;
  return phoneRegex.test(phone.trim());
}

/**
 * Valid company size options
 */
export const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '500+'] as const;
export type CompanySize = typeof COMPANY_SIZES[number];

/**
 * Validates company size against allowed values
 */
export function isValidCompanySize(size: string): size is CompanySize {
  return COMPANY_SIZES.includes(size as CompanySize);
}

/**
 * Type guard for Stripe webhook event types
 */
export function isValidWebhookEventType(type: string): boolean {
  const validTypes = [
    'checkout.session.completed',
    'customer.subscription.created',
    'customer.subscription.updated',
    'customer.subscription.deleted',
  ];
  return validTypes.includes(type);
}

/**
 * Validates request has required fields
 */
export function validateRequiredFields<T extends Record<string, any>>(
  data: T,
  requiredFields: (keyof T)[]
): { valid: boolean; missing?: string[] } {
  const missing = requiredFields.filter(field => {
    const value = data[field];
    return value === undefined || value === null || value === '';
  });

  if (missing.length > 0) {
    return { valid: false, missing: missing as string[] };
  }

  return { valid: true };
}
