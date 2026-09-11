/**
 * P0.VR.DIAG.1 / P0.VR.DIAG.1R1 — Build + thresholds.
 */

export const P0_VR_DIAG_1_BUILD = 'v302' as const;
export const P0_VR_DIAG_1R1_BUILD = 'v303' as const;

export const FORENSIC_DELTA_HIGH_PX = 16;
export const FORENSIC_DELTA_MEDIUM_PX = 8;
export const FORENSIC_DELTA_MIN_PX = 2;

export const TOP_IMPACT_ITEM_LIMIT = 6;

/** Major regions accounted below this ratio → BLOCK direction approval. */
export const COVERAGE_BLOCK_MAJOR_RATIO = 0.7;
/** Matched major regions with ≥2 dimensions below this ratio → BLOCK. */
export const COVERAGE_BLOCK_DEPTH_RATIO = 0.5;
