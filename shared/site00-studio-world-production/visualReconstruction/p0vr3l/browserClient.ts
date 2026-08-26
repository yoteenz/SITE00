/**
 * P0.VR.3L — Browser-safe exports for Design workspace UI.
 */

export {
  buildMissingTargetQueue,
  summarizeMissingTargetQueue,
  getCharacterLabVoiceLabEntry,
  listDerivationReceiptsForQueue,
} from './missingTargetQueue.js';

export {
  discoverMissingDesignTargets,
  classifyMissingTargetType,
  tabStateRemainsSubordinate,
  instanceDoesNotCreatePage,
} from './targetClassifier.js';

export {
  analyzeShellPropagationImpact,
  normalizePropagationScope,
  propagationRequiresFounderConfirmation,
  crossProjectPropagationBlocked,
  hostShellContaminationBlocked,
  listShellPropagationExceptions,
} from './shellPropagation.js';

export {
  listSharedShells,
  buildSharedShellDependencyGraph,
} from './sharedShellRegistry.js';

export {
  COMPOSER_DERIVED_DRAFT_LABEL,
  FAMILY_SOURCE_SNAPSHOT_LABEL,
  P0_VR_3L_LINEAGE,
  DEFAULT_PROPAGATION_SCOPE,
} from './constants.js';

export type {
  ShellPropagationScope,
  ShellPropagationImpact,
  MissingDesignTargetType,
} from './types.js';

export type { MissingTargetQueueEntry, MissingTargetQueueSummary } from './missingTargetQueue.js';
