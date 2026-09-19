/**
 * P0.VR.3B — Cross-project normalized route manifest constants.
 */

export const P0_VR_3B_LINEAGE = 'P0.VR.3B' as const;
export const STUDIO_WORLD_DESIGN_ROUTE_MANIFEST_ID = 'studio-world-design-route-manifest' as const;
export const ACTIVE_ROUTE_MANIFEST_SCHEMA = 'studio-world-design-route-manifest@2' as const;
export const ACTIVE_ROUTE_MANIFEST_VERSION = '2.1.0' as const;

export const P0_VR_3B_FAILURE_CODES = [
  'FAIL_RAW_ROUTE_ORPHANED',
  'FAIL_NORMALIZED_SCREEN_UNREACHABLE',
  'FAIL_DESIGN_SCREEN_DUPLICATE',
] as const;

/** Router-forensics targets validated against Site00Routes + SITE00_ROUTES. */
export const SITE00_TARGET_RAW_IMPLEMENTATION_ROUTE_COUNT = 153 as const;
export const SITE00_TARGET_NORMALIZED_DESIGN_SCREEN_COUNT = 136 as const;
