export {
  CAMPAIGN_BOARD_FULL_SCREEN_VISUAL_AUTHORITY,
  CAMPAIGN_BOARD_REFERENCE_SCOPE,
  NDX_CAMPAIGN_BOARD_V1D13_REFERENCE_PATH,
  P0_VR_1D13_LINEAGE,
  STALE_AFTER_CAMPAIGN_REFERENCE_REBUILD,
  FAIL_CAMPAIGN_OLD_SHELL_PRESERVED,
  FAIL_CAMPAIGN_REFERENCE_NOT_FULL_SCREEN_AUTHORITY,
  FAIL_CAMPAIGN_STATUS_CARD_GEOMETRY_DRIFT,
  FAIL_CAMPAIGN_SCHEDULE_GEOMETRY_DRIFT,
  FAIL_CAMPAIGN_PAGE_CARD_GEOMETRY_DRIFT,
  FAIL_CAMPAIGN_PAGE_ART_MISSING,
  FAIL_BOOK_IN_MOTION_ART_MISSING,
  FAIL_QUICK_ACTION_LAYOUT_DRIFT,
  FAIL_FAL_TEXT_TO_IMAGE_USED_WHEN_REFERENCE_AVAILABLE,
  FAIL_CAMPAIGN_BOTTOM_NAV_DRIFT,
  FAIL_PREVIOUS_CAMPAIGN_LOCK_BLOCKS_REBUILD,
  FAIL_CAMPAIGN_LOADING_FLASHES_OLD_SHELL,
  NDX_CAMPAIGN_V1D13_VR_REGION_IDS,
} from './constants.js';
export {
  CAMPAIGN_BOARD_VISUAL_ASSET_MANIFEST,
  type CampaignBoardVisualAssetEntry,
  type CampaignBoardAssetRole,
} from './campaignBoardVisualAssetManifest.js';
export {
  classifyCampaignBoardAssetSource,
  resolveCampaignBoardReferenceAssets,
  existingAssetPreferredOverFalGeneration,
  falReconstructionCandidates,
  type CampaignBoardAssetResolution,
} from './CampaignBoardReferenceAssetResolver.js';
export { buildCampaignBoardFullScreenImplementationSpec } from './campaignBoardScreenImplementationSpec.js';
export {
  buildCampaignBoardMobileVisualShellSpec,
  type CampaignBoardMobileVisualShellSpec,
} from './campaignBoardMobileVisualShellSpec.js';
export {
  invalidateStaleCampaignBoardLocks,
  staleCampaignLockDoesNotBlockRebuild,
} from './invalidateStaleCampaignBoardLocks.js';
export {
  runNdxCampaignBoardV1D13CorrectionPass,
  type NdxCampaignBoardV1D13CorrectionReport,
} from './runNdxCampaignBoardV1D13CorrectionPass.js';
