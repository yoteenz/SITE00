/**
 * P0.VR.1D.12 — Client-safe exports (no Node APIs).
 */

export {
  P0_VR_1D12_LINEAGE,
  CURRENT_VISUAL_SHELL_VERSION,
  LEGACY_VISUAL_SHELL_VERSION,
  SUPERSEDED_VISUAL_ONLY,
  RUNTIME_CURRENT_ROUTE_ELIGIBLE,
  NDX_RECONSTRUCTED_MOBILE_SCREEN_IDS,
} from './constants.js';
export type { NdxReconstructedMobileScreenId } from './constants.js';
export {
  isNdxReconstructedRoute,
  extractProjectSlugFromPath,
  resolveReconstructedScreenIdFromPath,
  isReconstructedMobileScreenId,
  shouldUseReferenceShellFirst,
} from './routeShellResolution.js';
