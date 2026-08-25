/**
 * P0.VR.1D.1 — Screenshot-as-design-spec, moodboard extraction, visual-spec-to-code bridge.
 */

export * from './types.js';
export * from './constants.js';
export {
  runMoodBoardScreenExtractionPipeline,
  moodBoardIngestionSufficientByDefault,
  extractedScreenCount,
  buildCroppedReferenceAssetId,
  moodBoardExtractionId,
} from './moodBoardScreenExtractionPipeline.js';
export type { MoodBoardIngestInput } from './moodBoardScreenExtractionPipeline.js';
export {
  evaluateScreenReferenceResolution,
  referenceResolutionInsufficient,
} from './screenReferenceResolutionEvaluation.js';
export type { ScreenReferenceResolutionEvaluation } from './screenReferenceResolutionEvaluation.js';
export {
  createMoodBoardCropAuthority,
  createScreenReferenceAuthorityVersion,
  supersedeScreenReferenceAuthority,
  authoritySourcePriority,
  moodBoardCropIsPrimaryUnlessOverridden,
} from './screenReferenceAuthorityVersion.js';
export {
  matchFullScreenReferenceToScreen,
  applyFullScreenOverrideToScreens,
} from './fullScreenReferenceMatcher.js';
export type { FullScreenReferenceUpload } from './fullScreenReferenceMatcher.js';
export { buildRegionCodeSpec, regionGeometryTranslatedToCode } from './regionCodeSpec.js';
export {
  buildVisualSpecToCodeBridge,
  explicitLayoutModelForNdxDesktop,
  typographyTranslatedToConcreteCss,
  assetPlacementTranslatedToCode,
} from './visualSpecToCodeBridge.js';
export {
  buildComposerScreenBuildContract,
  composerAllowedToFreelyReinterpretLayout,
  screenshotEmulationBlocksRedesign,
  composerReceivesReferenceAndSpec,
} from './composerScreenBuildContract.js';
export {
  captureRenderedDomMeasurementMap,
  simulateDomMeasurementFromSpec,
  domMeasurementCaptureImplemented,
} from './renderedDomMeasurementMap.js';
export type { DomMeasurementInput } from './renderedDomMeasurementMap.js';
export { buildReferenceDomDelta, referenceDomDeltaImplemented } from './referenceDomDelta.js';
export {
  compileCodePatchInstructions,
  patchesIdentifyTargetAndProperty,
  vagueMakeItCloserCorrectionsPrimary,
  codePatchInstructionImplemented,
} from './codePatchInstruction.js';
export {
  createInitialImplementationRegionLocks,
  updateRegionLocksFromDomDelta,
  lockedRegionIds,
  matchedRegionsRewrittenDuringOtherFixes,
  implementationRegionLockImplemented,
} from './implementationRegionLock.js';
export {
  runDomPatchConvergencePipeline,
  buildScreenImplementationSpecFromReference,
  screenshotEmulationModeImplemented,
  domAndVisualQaCombined,
  SCREENSHOT_EMULATION_MODE,
} from './domPatchConvergencePipeline.js';
export type { RunDomPatchConvergenceInput } from './domPatchConvergencePipeline.js';
