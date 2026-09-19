/**
 * P0.VR.1D.6 — Campaign Board design correction.
 */

export {
  P0_VR_1D6_LINEAGE,
  FAIL_CAMPAIGN_LIME_DIAMOND_MISSING,
  FAIL_DAY_SELECTOR_GEOMETRY_DRIFT,
  FAIL_PAGES_ARTWORK_MISSING,
  FAIL_MARGINS_ARTWORK_MISSING,
  FAIL_BOOK_IN_MOTION_ARTWORK_MISSING,
  NDX_CAMPAIGN_BOARD_REFERENCE_PATH,
  NDX_CAMPAIGN_BOARD_ROUTE,
  NDX_CAMPAIGN_BOARD_VR_REGION_IDS,
} from './constants.js';
export { buildCampaignBoardReferenceDetailAudit } from './referenceDetailAudit.js';
export { resolveCampaignBoardArtwork } from './resolveCampaignBoardArtwork.js';
export { runNdxCampaignBoardCorrectionPass } from './runNdxCampaignBoardCorrectionPass.js';
export type {
  CampaignBoardReferenceDetailAudit,
  CampaignCardArtworkResolution,
  NdxCampaignBoardCorrectionReport,
} from './types.js';
