/**
 * P0.VR.DIAG.1 / P0.VR.DIAG.1R1 — Build + thresholds.
 */

export const P0_VR_DIAG_1_BUILD = 'v302' as const;
export const P0_VR_DIAG_1R1_BUILD = 'v303' as const;
export const P0_VR_DIAG_1R2_BUILD = 'v304' as const;
export const P0_VR_DIAG_1R3_BUILD = 'v305' as const;
export const P0_VR_DIAG_1R4_BUILD = 'v306' as const;
export const P0_VR_DIAG_1R5_BUILD = 'v307' as const;
export const P0_VR_DIAG_1R5A_BUILD = 'v308' as const;
export const P0_VR_DIAG_1R5B_BUILD = 'v309' as const;
export const P0_VR_CONVERGE_1_BUILD = 'v310' as const;
export const P0_VR_CONVERGE_1R1_BUILD = 'v311' as const;

export const FORENSIC_DELTA_HIGH_PX = 16;
export const FORENSIC_DELTA_MEDIUM_PX = 8;
export const FORENSIC_DELTA_MIN_PX = 2;

export const TOP_IMPACT_ITEM_LIMIT = 6;

/** Major regions accounted below this ratio → BLOCK direction approval. */
export const COVERAGE_BLOCK_MAJOR_RATIO = 0.7;
/** Matched major regions with sufficient depth below this ratio → BLOCK. */
export const COVERAGE_BLOCK_DEPTH_RATIO = 0.5;

/** Minimum resolved CRITICAL+HIGH dimensions for SUFFICIENT depth (type-aware). */
export const DEPTH_SUFFICIENT_MIN_WEIGHT = 3;

/** Fraction of major regions that must reach SUFFICIENT depth to PASS depth gate. */
export const DEPTH_GATE_PASS_RATIO = 0.75;
