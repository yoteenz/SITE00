/**
 * P0.VR.6R2 — Browser-safe exports.
 */

export * from './types.js';
export * from './constants.js';
export { DEFAULT_FIDELITY_SETTINGS } from './constants.js';
export { driftSummaryLabel } from './convergenceEngine.js';
export {
  derivePageVisualVerificationStatus,
  referenceCardVisualLabel,
  pageMatchUsesVisualVerification,
} from './pageStatus.js';
export { resolvePresetFidelityContract } from './presetFidelity.js';
