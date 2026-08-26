/** Browser-safe P0.VR.3 exports. */
export {
  P0_VR_3_LINEAGE,
  P0_VR_3_FAILURE_CODES,
  SITE00_DESIGN_PROJECT_ID,
  STUDIO_WORLD_DESIGN_ROUTE_MANIFEST_VERSION,
  STUDIO_WORLD_DESIGN_ROUTE_MANIFEST_V1_STATUS,
  ACTIVE_ROUTE_MANIFEST_SCHEMA,
  ACTIVE_ROUTE_MANIFEST_VERSION,
  P0_VR_3A_V1_ACTIVE_RUNTIME_AUTHORITY,
} from './constants.js';
export {
  listDesignableProjects,
  listDesignWorkspaceProjects,
  getDesignableProject,
  isSite00SelfDesignableProject,
  resolveDesignProjectAccent,
  site00UsesNdxAccentForProject,
} from './designProjectRegistry.js';
export {
  compileSite00DesignRouteManifest,
  compileSite00DesignRouteManifestV1Historical,
  getStudioWorldDesignRouteManifest,
  syncSite00ManifestToDesignRegistry,
  groupManifestScreensByFamily,
  listManifestScreensForProject,
  getActiveManifestAuthority,
  getActiveDesignRouteSyncContract,
  buildSite00FounderDesignScreenSet,
} from './designRouteManifest.js';
export type {
  StudioWorldDesignRouteManifest,
  DesignableProjectRecord,
  Site00DesignCoverageSummary,
  Site00SelfDesignBoundaryResult,
} from './types.js';
