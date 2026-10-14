/**
 * Inline background for an `.mgm-range` slider: the track is filled with
 * `color` up to the current value and a visible neutral after it, so the
 * slider reads on white cards (the bare `appearance-none` track was invisible).
 *
 * No React imports, so Node's test runner can load it.
 */
export const RANGE_TRACK_REST = 'var(--mist-300)';

/** Percentage (0–100) of the way `value` sits between `min` and `max`. */
export function rangePercent(value: number, min: number, max: number): number {
  if (!Number.isFinite(value) || !(max > min)) return 0;
  const pct = ((value - min) / (max - min)) * 100;
  return Math.min(100, Math.max(0, pct));
}

export function rangeFill(
  value: number,
  min: number,
  max: number,
  color = 'var(--navy)',
): { background: string } {
  const pct = rangePercent(value, min, max);
  return {
    background: `linear-gradient(to right, ${color} 0%, ${color} ${pct}%, ${RANGE_TRACK_REST} ${pct}%, ${RANGE_TRACK_REST} 100%)`,
  };
}
