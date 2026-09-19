export const P0_VR_REPLICATION_3A_BUILD = 'v317' as const;

/** Pilot regions traced for NDXBOOK overview mobile (3A). */
export const NDX_DRIFT_TRACE_REGION_IDS = [
  'host-header',
  'project-masthead',
  'masthead-context-column',
  'module-nav',
  'hero-editorial',
  'progress-phase',
  'metric-status-row',
  'focus-milestone',
  'recent-activity',
  'bottom-nav',
] as const;

export type NdxDriftTraceRegionId = (typeof NDX_DRIFT_TRACE_REGION_IDS)[number];
