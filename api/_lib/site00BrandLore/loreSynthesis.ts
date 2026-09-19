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
  LORE_FIELD_KEYS,
  fieldHasContent,
  type LoreSynthesisInput,
} from '../../../shared/site00-brand-lore/loreSynthesis.js';
