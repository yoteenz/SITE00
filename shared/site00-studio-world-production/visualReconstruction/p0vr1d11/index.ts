/**
 * P0.VR.1D.11 — Character Lab full-screen reference reconstruction.
 */

export {
  P0_VR_1D11_LINEAGE,
  CHARACTER_LAB_FULL_SCREEN_VISUAL_AUTHORITY,
  FAIL_CHARACTER_LAB_OLD_SHELL_PRESERVED,
  FAIL_CHARACTER_LAB_REFERENCE_NOT_FULL_SCREEN_AUTHORITY,
  FAIL_CHARACTER_LAB_HERO_GEOMETRY_DRIFT,
  FAIL_CHARACTER_PORTRAIT_WRONG_AUTHORITY,
  FAIL_CHARACTER_LANGUAGE_NOTE_DRIFT,
  FAIL_STICKY_NOTE_ASSET_MISSING,
  FAIL_STICKY_NOTE_GENERIC_CSS_APPROXIMATION,
  FAIL_FAL_TEXT_TO_IMAGE_USED_WHEN_REFERENCE_AVAILABLE,
  FAIL_CHARACTER_IDENTITY_LAYOUT_DRIFT,
  FAIL_QUOTE_CARD_GEOMETRY_DRIFT,
  FAIL_PERFORMANCE_GRID_DRIFT,
  FAIL_CHARACTER_LAB_BOTTOM_NAV_DRIFT,
  FAIL_PREVIOUS_LOCK_BLOCKS_REBUILD,
  STALE_AFTER_CHARACTER_LAB_REFERENCE_REBUILD,
  NDX_CHARACTER_LAB_REFERENCE_PATH,
  NDX_CHARACTER_LAB_ROUTE,
  NDX_CHARACTER_LAB_VR_REGION_IDS,
  NDX_CHARACTER_LAB_ASSET_PATHS,
} from './constants.js';
export {
  resolveCharacterLabReferenceAssets,
  buildCharacterLabVisualAssetManifest,
  existingAssetPreferredOverFalGeneration,
  falReconstructionCandidates,
} from './characterLabReferenceAssetResolver.js';
export {
  CHARACTER_LAB_MOBILE_VISUAL_SHELL_SPEC,
  characterLabShellStyle,
} from './characterLabMobileVisualShellSpec.js';
export { buildCharacterLabFullScreenImplementationSpec } from './characterLabScreenImplementationSpec.js';
export {
  markStaleCharacterLabLocks,
  staleCharacterLabLockDoesNotBlockRebuild,
} from './invalidateStaleCharacterLabLocks.js';
export { runNdxCharacterLabCorrectionPass } from './runNdxCharacterLabCorrectionPass.js';
export type {
  CharacterLabAssetRole,
  CharacterLabAssetSource,
  CharacterLabVisualAssetEntry,
  CharacterLabVisualAssetManifest,
  CharacterLabMobileVisualShellSpec,
  NdxCharacterLabCorrectionReport,
} from './types.js';
