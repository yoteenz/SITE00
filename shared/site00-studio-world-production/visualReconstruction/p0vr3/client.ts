/** Browser-safe P0.VR.3 exports. */
export {
  P0_VR_3_LINEAGE,
  P0_VR_3_FAILURE_CODES,
  SITE00_DESIGN_PROJECT_ID,
  STUDIO_WORLD_DESIGN_ROUTE_MANIFEST_VERSION,
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
  getStudioWorldDesignRouteManifest,
  syncSite00ManifestToDesignRegistry,
  groupManifestScreensByFamily,
} from './designRouteManifest.js';
export type {
  StudioWorldDesignRouteManifest,
  DesignableProjectRecord,
  Site00DesignCoverageSummary,
  Site00SelfDesignBoundaryResult,
} from './types.js';
