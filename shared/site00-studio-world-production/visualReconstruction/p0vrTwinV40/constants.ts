export const P0_VR_TWIN_V40_LINEAGE = 'P0.VR.TWINV4.0' as const;
export const TWIN_V4_ROUTE_SEGMENT = 'twin-v4' as const;
export const TWIN_V4_CSS_NAMESPACE = 'site00-twin-v4' as const;

/** Forensic blueprint implementation spec canonical canvas (matches Fal blueprint output). */
export const TWIN_V4_FORENSIC_CANONICAL_VIEWPORT = { widthPx: 1200, heightPx: 2600 } as const;

export const TWIN_V4_FAL_GENERATION_JOBS = 0 as const;

export const TWIN_V4_STORAGE_PREFIX = 'site00:twin-v4:' as const;

export const TWIN_V4_FORENSIC_AUTHORITY_MISMATCH = 'TWIN_V4_FORENSIC_AUTHORITY_MISMATCH' as const;
export const TWIN_V4_FORENSIC_NOT_AVAILABLE = 'TWIN_V4_FORENSIC_NOT_AVAILABLE' as const;
export const TWIN_V4_RUNTIME_RASTER_VIOLATION = 'TWIN_V4_RUNTIME_RASTER_VIOLATION' as const;
export const TWIN_V4_SYNTHETIC_QA_FORBIDDEN = 'TWIN_V4_SYNTHETIC_QA_FORBIDDEN' as const;

export const TWIN_V4_MAJOR_REGION_TOLERANCE = 0.03 as const;
export const TWIN_V4_SECONDARY_REGION_TOLERANCE = 0.05 as const;
export const TWIN_V4_ANNOTATION_TOLERANCE = 0.06 as const;
export const MIN_TWIN_V4_CORRECTION_ITERATIONS = 2 as const;

export type TwinV4ForensicReconstructionGateStatus =
  | 'BLOCKED'
  | 'RECONSTRUCTING'
  | 'REVIEW_READY'
  | 'FOUNDER_APPROVED'
  | 'FOUNDER_REJECTED';
