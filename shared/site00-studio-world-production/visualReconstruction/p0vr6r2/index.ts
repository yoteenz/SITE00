/**
 * P0.VR.6R2 — Canonical visual convergence engine.
 */

export * from './types.js';
export * from './constants.js';
export * from './sessionStore.js';
export * from './regionRegistry.js';
export * from './dynamicMasking.js';
export * from './overlayEngine.js';
export {
  classifyDriftSeverity,
  classifyVisualDrift,
  countDriftBySeverity,
  exactModeCanVerify,
  measureRegionDeltas,
} from './deltaMeasurement.js';
export * from './convergenceEngine.js';
export * from './iterationLoop.js';
export * from './executionEnvelope.js';
export * from './pageStatus.js';
export * from './presetFidelity.js';
export * from './integration.js';
