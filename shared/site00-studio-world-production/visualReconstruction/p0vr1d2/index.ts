/**
 * P0.VR.1D.2 — Live NDX project hub reconstruction execution.
 */

export * from './types.js';
export {
  resolveNdxFounderProjectHubBoards,
  NDX_FOUNDER_BOARD_CANONICAL_PATHS,
  NDX_FOUNDER_BOARD_SUPABASE_PATHS,
  NDX_WIREFRAME_FIXTURE_PATHS,
  founderBoardsRequiredForLiveExecution,
} from './resolveNdxFounderBoardAssets.js';
export {
  inferScreenViewportFromBoardCrop,
  detectScreenFramesOnBoard,
  cropBoardScreenReference,
  boardCanvasTreatedAsScreenViewport,
} from './inferScreenViewportFromBoardCrop.js';
export {
  measureScreenReferenceResolutionFromCrop,
  screenReferenceResolutionDefaultedToSufficient,
} from './measureScreenReferenceResolution.js';
export {
  runNdxProjectHubLiveReconstruction,
  NDX_DESKTOP_BOARD_REGIONS,
} from './runNdxProjectHubLiveReconstruction.js';
export type { RunNdxProjectHubLiveReconstructionInput } from './runNdxProjectHubLiveReconstruction.js';
