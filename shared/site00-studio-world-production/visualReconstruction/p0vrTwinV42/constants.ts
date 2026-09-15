export const P0_VR_TWIN_V42_LINEAGE = 'P0.VR.TWINV4.2' as const;
export const P0_VR_TWIN_V41F1_LINEAGE = 'P0.VR.TWINV4.1F1' as const;
export const TWIN_V42_STORAGE_PREFIX = 'site00:twin-v4:' as const;
export const TWIN_V42_GOLDEN_AUTHORITY_KEY = `${TWIN_V42_STORAGE_PREFIX}golden-authority:v1` as const;
export const TWIN_V42_GATE_BUNDLE_KEY = `${TWIN_V42_STORAGE_PREFIX}golden-diff-gate:v1` as const;

export const TWIN_V4_GOLDEN_AUTHORITY_INVALID = 'TWIN_V4_GOLDEN_AUTHORITY_INVALID' as const;
/** No loadable https forensic on device yet (prime/cache) — not a corrupt pin. */
export const TWIN_V4_GOLDEN_AUTHORITY_UNAVAILABLE = 'TWIN_V4_GOLDEN_AUTHORITY_UNAVAILABLE' as const;
export const DIFF_CONVERGENCE_STALLED = 'DIFF_CONVERGENCE_STALLED' as const;

export const TWIN_V42_FULL_PAGE_DIFF_THRESHOLD = 0.015 as const;
export const TWIN_V42_CRITICAL_REGION_DIFF_THRESHOLD = 0.01 as const;
export const TWIN_V42_SECONDARY_REGION_DIFF_THRESHOLD = 0.02 as const;

export const MIN_TWIN_V42_GOLDEN_DIFF_ITERATIONS = 3 as const;

export const TWIN_V42_SEGMENTATION_VERSION = 'v41-pixel-1' as const;

export const TWIN_V42_CRITICAL_REGION_IDS = [
  'TITLE_HEADER',
  'LEFT_MAIN_BLUEPRINT',
  'RIGHT_SPEC_TABLE',
  'LOWER_COLOR_PALETTE',
  'LOWER_TYPOGRAPHY_KEY',
  'LOWER_DIVIDER_SPECS',
  'LOWER_NOTES_CONTEXT',
] as const;

export const TWIN_V42_PLAYWRIGHT_DEVICE_SCALE = 1 as const;
