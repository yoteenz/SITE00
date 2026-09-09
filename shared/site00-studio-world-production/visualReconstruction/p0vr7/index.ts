/**
 * P0.VR.7 — Reference fidelity contract + screenshot design authority engine.
 */

export * from './types.js';
export * from './constants.js';
export * from './contractStore.js';
export * from './decomposition.js';
export * from './implementationPlan.js';
export {
  createPendingScreenshotQA,
  runDesignReferenceScreenshotQA,
  shouldBlockFalsePass,
  compareRegionGeometry,
} from './screenshotQA.js';
export * from './correctionPlan.js';
export * from './executionHandoff.js';
export * from './integration.js';
export * from './viewportAuthority.js';
export {
  listFidelityContracts,
  clearFidelityContractStoreForTest,
  implementationCompleteDoesNotEqualVerified,
} from './contractStore.js';
