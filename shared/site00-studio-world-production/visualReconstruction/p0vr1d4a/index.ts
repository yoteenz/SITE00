/**
 * P0.VR.1D.4A — Founder mood board ingest + live 6×6 reconstruction.
 */

export {
  P0_VR_1D4A_LINEAGE,
  P0_VR_1D4A_REUSED_LINEAGE,
  FAIL_REGION_MAPPING_RUNTIME,
  FOUNDER_REFERENCE_SOURCE,
} from './constants.js';
export {
  verifyFounderBoardCanonicalResolution,
  founderReferenceReady,
} from './verifyFounderBoardCanonicalResolution.js';
export {
  runFounderMoodBoardIngestAndLiveReconstruction,
  largestMappedDelta,
} from './runFounderMoodBoardIngestAndLiveReconstruction.js';
export type {
  FounderReferenceResolutionProof,
  ExtractedScreenSummary,
  FounderMoodBoardIngestLiveReport,
} from './types.js';
