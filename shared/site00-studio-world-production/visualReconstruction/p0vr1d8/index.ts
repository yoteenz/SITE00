/**
 * P0.VR.1D.8 — Lab / Experiment 01 design correction.
 */

export {
  P0_VR_1D8_LINEAGE,
  FAIL_LAB_HEADER_DRIFT,
  FAIL_LAB_BREADCRUMB_DRIFT,
  FAIL_EXPERIMENT_GRID_GEOMETRY_DRIFT,
  FAIL_EXPERIMENT_CARD_ARTWORK_MISSING,
  FAIL_SELECTED_CARD_BORDER_DRIFT,
  FAIL_LAB_BOTTOM_NAV_ACTIVE_STATE_DRIFT,
  NDX_EXPERIMENT_01_REFERENCE_PATH,
  NDX_EXPERIMENT_01_ROUTE,
  NDX_EXPERIMENT_01_VR_REGION_IDS,
} from './constants.js';
export { buildLabReferenceDetailAudit } from './referenceDetailAudit.js';
export { resolveExperiment01Artwork } from './resolveExperiment01Artwork.js';
export { runNdxLabExperiment01CorrectionPass } from './runNdxLabExperiment01CorrectionPass.js';
export type {
  LabReferenceDetailAudit,
  ExperimentCardArtworkResolution,
  NdxLabExperiment01CorrectionReport,
} from './types.js';
