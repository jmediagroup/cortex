/**
 * Compact currency labels for chart axes: $850k below $1M, $1.2M at or above.
 * Negative values keep their sign; sub-$1k values print as whole dollars.
 */
export function formatAxisMoney(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(0)}k`;
  return `${sign}$${Math.round(abs)}`;
}
