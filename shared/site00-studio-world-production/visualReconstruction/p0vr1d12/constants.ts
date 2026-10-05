/**
 * P0.VR.1D.12 — Legacy shell flash removal + reference-shell-first loading.
 */

export const P0_VR_1D12_LINEAGE = 'P0.VR.1D.12' as const;

/** Current reference-driven mobile shell authority (P0.VR.1D.9+). */
export const CURRENT_VISUAL_SHELL_VERSION = 'P0.VR.1D.9+' as const;

export const LEGACY_VISUAL_SHELL_VERSION = 'legacy' as const;

export const SUPERSEDED_VISUAL_ONLY = 'SUPERSEDED_VISUAL_ONLY' as const;
export const RUNTIME_CURRENT_ROUTE_ELIGIBLE = false as const;

export const FAIL_LEGACY_SHELL_FIRST_PAINT = 'FAIL_LEGACY_SHELL_FIRST_PAINT' as const;
export const FAIL_LEGACY_SHELL_LOADING_FALLBACK = 'FAIL_LEGACY_SHELL_LOADING_FALLBACK' as const;
export const FAIL_LEGACY_SHELL_SUSPENSE_FALLBACK = 'FAIL_LEGACY_SHELL_SUSPENSE_FALLBACK' as const;
export const FAIL_PRE_HYDRATION_SHELL_MISMATCH = 'FAIL_PRE_HYDRATION_SHELL_MISMATCH' as const;
export const FAIL_MOBILE_DETECTION_CAUSES_SHELL_SWAP = 'FAIL_MOBILE_DETECTION_CAUSES_SHELL_SWAP' as const;
export const FAIL_VISUAL_SPEC_ASYNC_SHELL_SWAP = 'FAIL_VISUAL_SPEC_ASYNC_SHELL_SWAP' as const;
export const FAIL_STALE_ROUTE_VISIBLE_DURING_LOAD = 'FAIL_STALE_ROUTE_VISIBLE_DURING_LOAD' as const;
export const FAIL_LOADING_TO_FINAL_LAYOUT_SHIFT = 'FAIL_LOADING_TO_FINAL_LAYOUT_SHIFT' as const;
export const FAIL_OLD_LOADING_EXPERIMENT_SCREEN_VISIBLE = 'FAIL_OLD_LOADING_EXPERIMENT_SCREEN_VISIBLE' as const;

/** Reconstructed NDX mobile routes — shell must render synchronously on first paint. */
export const NDX_RECONSTRUCTED_MOBILE_SCREEN_IDS = [
  'overview',
  'campaign-board',
  'lab-hub',
  'experiment-01',
  'content-ops',
  'cultural-intelligence',
  'character-lab',
] as const;

export type NdxReconstructedMobileScreenId = (typeof NDX_RECONSTRUCTED_MOBILE_SCREEN_IDS)[number];

export const NDX_RECONSTRUCTED_ROUTE_PATTERNS = [
  /^\/projects\/ndxbook\/?$/,
  /^\/projects\/ndxbook\/lab\/?$/,
  /^\/projects\/ndxbook\/content-operations\/campaign-board/,
  /^\/projects\/ndxbook\/marketing-expression\/experiment-01/,
  /^\/projects\/ndxbook\/content-operations\/?$/,
  /^\/projects\/ndxbook\/cultural-intelligence/,
  /^\/projects\/ndxbook\/character\//,
  /^\/projects\/ndxbook\/experiments/,
] as const;
