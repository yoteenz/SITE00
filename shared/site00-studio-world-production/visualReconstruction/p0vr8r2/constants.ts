/**
 * P0.VR.8R2 — Prior route audit recovery constants.
 */

export const P0_VR_8R2_LINEAGE = 'P0.VR.8R2-SITE00' as const;

export const KNOWN_REPOSITORIES = {
  site00: { repositoryId: 'yoteenz/SITE00', repositoryName: 'SITE00' },
  fsbw: { repositoryId: 'yoteenz/fsbw', repositoryName: 'FSBW' },
} as const;

/** Prior audit source modules searched during forensic recovery. */
export const PRIOR_AUDIT_SEARCH_LOCATIONS = [
  'shared/site00-studio-world-production/visualReconstruction/p0vr3/designRouteManifest.ts',
  'shared/site00-studio-world-production/visualReconstruction/p0vr3a/site00RouteForensics.ts',
  'shared/site00-studio-world-production/visualReconstruction/p0vr3b/site00RawRouteInventory.ts',
  'shared/site00-studio-world-production/visualReconstruction/p0vr3b/manifestV2Compiler.ts',
  'shared/site00-studio-world-production/visualReconstruction/p0vr3d/site00AuditReconciliation.ts',
  'shared/site00-studio-world-production/founderWorkspace/cohesion/routeInventory.ts',
  'shared/site00-studio-world-production/visualReconstruction/p0vr2/ndxPilotRegistration.ts',
  'shared/site00-studio-world-production/visualReconstruction/p0vr3j/ndxbookDesignPilotReconciliation.ts',
  'shared/site00-studio-world-production/visualReconstruction/p0vr3h/ndxbookMissingRoutes.ts',
  'shared/site00-astral-world/screen-masters/vr2Adapter.ts',
  'shared/site00-design-control-plane/projectAuthorityRegistry.ts',
  'shared/site00-design-control-plane/memoryStore.ts',
  'public/studio-world/design/implementation-snapshot-persistent-registry.json',
] as const;

export const LEGACY_AUDIT_SNAPSHOT_LABEL = 'LEGACY_AUDIT_SNAPSHOT' as const;
