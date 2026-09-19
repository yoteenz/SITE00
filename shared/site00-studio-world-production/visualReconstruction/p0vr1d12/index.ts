export {
  P0_VR_1D12_LINEAGE,
  CURRENT_VISUAL_SHELL_VERSION,
  LEGACY_VISUAL_SHELL_VERSION,
  SUPERSEDED_VISUAL_ONLY,
  RUNTIME_CURRENT_ROUTE_ELIGIBLE,
  FAIL_LEGACY_SHELL_FIRST_PAINT,
  FAIL_LEGACY_SHELL_LOADING_FALLBACK,
  FAIL_LEGACY_SHELL_SUSPENSE_FALLBACK,
  FAIL_PRE_HYDRATION_SHELL_MISMATCH,
  FAIL_MOBILE_DETECTION_CAUSES_SHELL_SWAP,
  FAIL_VISUAL_SPEC_ASYNC_SHELL_SWAP,
  FAIL_STALE_ROUTE_VISIBLE_DURING_LOAD,
  FAIL_LOADING_TO_FINAL_LAYOUT_SHIFT,
  FAIL_OLD_LOADING_EXPERIMENT_SCREEN_VISIBLE,
  NDX_RECONSTRUCTED_MOBILE_SCREEN_IDS,
  NDX_RECONSTRUCTED_ROUTE_PATTERNS,
} from './constants.js';
export type { NdxReconstructedMobileScreenId } from './constants.js';
export type { ReferenceShellLoadingTarget, LegacyShellFlashForensic } from './types.js';
export {
  isNdxReconstructedRoute,
  extractProjectSlugFromPath,
  resolveReconstructedScreenIdFromPath,
  isReconstructedMobileScreenId,
  shouldUseReferenceShellFirst,
} from './routeShellResolution.js';
