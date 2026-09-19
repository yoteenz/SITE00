/**
 * P0.VR.3 — Design route manifest constants.
 */

export const P0_VR_3_LINEAGE = 'P0.VR.3' as const;

/** P0.VR.3A v1 manifest — preserved as historical audit artifact only. */
export const STUDIO_WORLD_DESIGN_ROUTE_MANIFEST_VERSION = 'v1' as const;
export const STUDIO_WORLD_DESIGN_ROUTE_MANIFEST_V1_STATUS = 'HISTORICAL_AUDIT_ARTIFACT' as const;

/** Active route manifest authority (P0.VR.3B → P0.VR.3D reconciliation). */
export const ACTIVE_ROUTE_MANIFEST_SCHEMA = 'studio-world-design-route-manifest@2' as const;
export const ACTIVE_ROUTE_MANIFEST_VERSION = '2.1.0' as const;
export const P0_VR_3A_V1_ACTIVE_RUNTIME_AUTHORITY = false as const;

export const P0_VR_3_FAILURE_CODES = [
  'FAIL_SITE00_NOT_IN_DESIGN_PROJECT_SELECTOR',
  'FAIL_SITE00_ROUTE_AUDIT_INCOMPLETE',
  'FAIL_SITE00_CUSTOMER_ROUTE_OMITTED',
  'FAIL_SITE00_DEPENDENCY_ROUTE_MISSING',
  'FAIL_SITE00_VISUAL_STATE_MISCLASSIFIED',
  'FAIL_SITE00_TABLET_COVERAGE_UNKNOWN',
  'FAIL_SITE00_REFERENCE_COVERAGE_UNKNOWN',
  'FAIL_SITE00_HOST_AND_WEBSITE_CONFLATED',
  'FAIL_SITE00_SELF_DESIGN_PATCHES_HOST_WORKSPACE',
  'FAIL_SITE00_WRONG_PROJECT_ACCENT',
  'FAIL_SITE00_MISSING_ROUTE_NOT_VISIBLE_IN_DESIGN',
  'FAIL_SITE00_OUTDATED_REFERENCE_ACTIVE',
] as const;

export const SITE00_DESIGN_PROJECT_ID = 'site00' as const;

export const DESIGN_WORKSPACE_HOST_COMPONENTS = [
  'src/site00/components/designWorkspace/Site00DesignWorkspaceShell.tsx',
  'src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx',
  'src/site00/pages/StudioWorldDesignPage.tsx',
  'shared/site00-studio-world-production/visualReconstruction/p0vr2b/constants.ts',
] as const;

export const SITE00_WEBSITE_TARGET_COMPONENT_PREFIXES = [
  'src/site00/pages/',
  'src/site00/components/homepage/',
  'src/site00/components/idnty/',
  'src/site00/components/bldr/',
  'src/site00/components/environment/',
  'src/site00/assts/',
] as const;
