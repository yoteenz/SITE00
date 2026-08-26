/**
 * P0.VR.1D.10 — Mobile Content Ops full-screen reference snapshot.
 */

export const NDX_CONTENT_OPS_REFERENCE_PATH =
  '/visual-references/founder/ndxbook/mobile-content-ops-fullscreen-reference.png';

export const NDX_CONTENT_OPS_TABS = ['SIGNALS', 'OPPORTUNITIES', 'CURRENT WORK', 'APPROVALS'] as const;
export const NDX_CONTENT_OPS_ACTIVE_TAB = 'CURRENT WORK';

export const NDX_CONTENT_OPS_OPERATING_MODE = {
  label: 'OPERATING MODE',
  value: 'Assisted Autonomy · In Production',
  chip: 'SLATE PROPOSED',
} as const;

export const NDX_CONTENT_OPS_OPPORTUNITIES = [
  { label: 'Corporate Layoff Memo Language', score: '0.59' },
  { label: 'Subscription Fatigue Pattern', score: '0.54' },
  { label: 'Quiet Luxury Signal', score: '0.48' },
] as const;

export const NDX_CONTENT_OPS_REVIEW_NEEDED = [
  { label: 'Layoff Memo', priority: 'HIGH' },
  { label: 'Subscription Norm', priority: 'HIGH' },
  { label: 'Loyalty Drift', priority: 'MED' },
  { label: 'Quiet Luxury', priority: 'MED' },
] as const;

export const NDX_CONTENT_OPS_CURRENT_WORK = [
  'Subscription Normalization',
  'Corporate Layoff Memo',
  'Late Fees Across Decades',
] as const;

export const NDX_CONTENT_OPS_NEEDS_EYE = [
  { label: 'Subscription Normalization', priority: 'HIGH' },
  { label: 'Corporate Layoff Memo', priority: 'MED' },
] as const;

export const NDX_CONTENT_OPS_TODAY_ACTION = 'APPROVE SLATE';
