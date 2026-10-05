/** Browser-safe P0.VR.3B exports. */
export {
  P0_VR_3B_LINEAGE,
  ACTIVE_ROUTE_MANIFEST_SCHEMA,
  ACTIVE_ROUTE_MANIFEST_VERSION,
  SITE00_TARGET_RAW_IMPLEMENTATION_ROUTE_COUNT,
  SITE00_TARGET_NORMALIZED_DESIGN_SCREEN_COUNT,
} from './constants.js';
export {
  compileStudioWorldDesignRouteManifestV2,
  getActiveRouteManifestV2,
  findDesignScreenByPath,
  findDesignScreenById,
} from './manifestV2Compiler.js';
export type { DesignScreenRecord, ImplementationRouteRecord, StudioWorldDesignRouteManifestV2, Site00RouteCountModel } from './types.js';
