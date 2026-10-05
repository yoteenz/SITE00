/**
 * B5.7 — Legacy demo fixtures — must NOT appear as active current work.
 */

export const STALE_DEMO_FIXTURE_LABELS = [
  'Corporate Layoff Memo',
  'Subscription Normalization',
  'Late Fees Across Decades',
  'Airline Loyalty Normalization',
  'Quiet Luxury Signal',
  'EXPERIMENT 01 — NDX FEED',
  'Layoff Memo',
  'Subscription Norm',
  'Loyalty Drift',
] as const;

export type StaleDemoFixtureLabel = (typeof STALE_DEMO_FIXTURE_LABELS)[number];

export function isStaleDemoFixtureLabel(label: string): boolean {
  const lower = label.toLowerCase();
  return STALE_DEMO_FIXTURE_LABELS.some((s) => lower.includes(s.toLowerCase()));
}

export const DEMO_FIXTURE_SOURCE = 'DEMO_FIXTURE' as const;
export const HISTORY_SOURCE = 'HISTORY' as const;
