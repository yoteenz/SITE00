/**
 * Client-facing business-day ranges — preserve raw min/max; no artificial symmetry (e.g. do not force 2–4 from 2–3).
 * Long-range week normalization for BLDR remains on the BLDR estimator path, not applied here.
 */
export function formatBusinessDayRange(minDays: number, maxDays: number): string {
  if (minDays === maxDays) return `${minDays} business day${minDays === 1 ? '' : 's'}`;
  return `${minDays}–${maxDays} business days`;
}

/** Optional display-only shift for long horizons (weeks) — does not mutate stored delivery promises. */
export function displayWeekRangeShift(minWeeks: number, maxWeeks: number): { min: number; max: number } {
  return { min: minWeeks + 1, max: maxWeeks + 1 };
}
