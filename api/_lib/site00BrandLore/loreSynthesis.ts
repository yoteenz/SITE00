/**
 * Brand Lore synthesis — re-exports shared implementation for API layer.
 */
export {
  synthesizeBrandLoreProfile,
  assertSynthesisGrounded,
  mergePreservingFounderConfirmations,
  mergeCalibrationIntoProfile,
  extractOperationalProjectTypes,
  extractOperationalGoals,
  type LoreSynthesisInput,
} from '../../../shared/site00-brand-lore/loreSynthesis.js';
