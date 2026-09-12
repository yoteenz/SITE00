export const P0_VR_REPLICATION_2_BUILD = 'v316' as const;

/** Authority-derived macro bands (NDXBOOK overview mobile pilot). */
export const NDX_AUTHORITY_SHELL_BANDS = [
  'host-header',
  'breadcrumb',
  'masthead',
  'masthead-context-column',
  'section-nav',
  'hero-editorial',
  'progress-phase',
  'metric-status-row',
  'focus-milestone',
  'recent-activity',
  'bottom-nav',
] as const;

export type NdxAuthorityShellBandId = (typeof NDX_AUTHORITY_SHELL_BANDS)[number];

export const NDX_SECTION_NAV_LABELS = [
  'OVERVIEW',
  'IDENTITY',
  'EVOLVE',
  'PRODUCTION',
  'REVIEWS',
  'LIBRARY',
] as const;

export const NDX_METRIC_STATUS_LABELS = [
  'CREATIVE PRODUCTION',
  'FOUNDER REVIEW',
  'PACKAGE READINESS',
  'TECHNICAL HEALTH',
] as const;
