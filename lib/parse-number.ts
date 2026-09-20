/**
 * Parse a user-typed amount leniently: "$5,000", "1 000", "12.5%" and
 * "-250" all parse; anything without a number returns NaN.
 */
export function parseLooseNumber(raw: string | number): number {
  if (typeof raw === 'number') return raw;
  const cleaned = String(raw).replace(/[$,%\s_]/g, '');
  if (cleaned === '' || cleaned === '-' || cleaned === '.') return NaN;
  return parseFloat(cleaned);
}
