export {
  P0_VR_3L_LINEAGE,
  FAMILY_SOURCE_SNAPSHOT_LABEL,
  COMPOSER_DERIVED_DRAFT_LABEL,
  DEFAULT_PROPAGATION_SCOPE,
} from './constants.js';

export {
  discoverMissingDesignTargets,
  classifyMissingTargetType,
  tabStateRemainsSubordinate,
  instanceDoesNotCreatePage,
  getMissingTarget,
} from './targetClassifier.js';

export {
  listSharedShells,
  getSharedShell,
  buildSharedShellDependencyGraph,
  getShellVersion,
  bumpShellVersion,
  getDesignFamilyVersion,
  bumpDesignFamilyVersion,
  clearSharedShellRegistryForTest,
} from './sharedShellRegistry.js';

export {
  selectBestSibling,
  evaluateSiblingCaptureNeed,
  detectDuplicatedFamilyImplementation,
  sharedCodeExistsBeforeRebuild,
} from './siblingSelection.js';

export { captureSiblingIfNeeded, captureDerivedTargetDraft } from './onDemandSiblingCapture.js';

export {
  deriveMissingTargetFromFamily,
} from './familyDerivation.js';

export {
  getFamilyDerivedRecord,
  listFamilyDerivationReceipts,
  clearFamilyDerivationForTest,
} from './derivationStore.js';

export {
  normalizePropagationScope,
  analyzeShellPropagationImpact,
  commitShellPropagation,
  buildShellPropagationRecapturePlan,
  addShellPropagationException,
  listShellPropagationExceptions,
  rollbackShellPropagation,
  listShellPropagationReceipts,
  listFamilyShellChanges,
  crossProjectPropagationBlocked,
  hostShellContaminationBlocked,
  propagationRequiresFounderConfirmation,
  detectReferenceConflict,
  clearShellPropagationForTest,
} from './shellPropagation.js';

export { runFamilyFidelityQa } from './familyFidelityQa.js';

export {
  buildMissingTargetQueue,
  summarizeMissingTargetQueue,
  getCharacterLabVoiceLabEntry,
  listDerivationReceiptsForQueue,
} from './missingTargetQueue.js';

export type {
  MissingDesignTargetType,
  MissingDesignTargetRecord,
  MissingTargetQueueStatus,
  FamilyDerivedMissingTargetRecord,
  SharedShellRecord,
  SharedShellDependencyGraph,
  ShellPropagationScope,
  ShellPropagationImpact,
  ShellPropagationReceipt,
  ShellPropagationRecapturePlan,
  ShellPropagationExceptionRecord,
  FamilyShellChangeRecord,
  FamilyDerivationReceipt,
  FamilyFidelityQaResult,
  DeriveMissingTargetResult,
  SiblingCaptureDecision,
  DuplicatedFamilyImplementationSignal,
  RepoOwnedProjectId,
} from './types.js';

export type { MissingTargetQueueEntry, MissingTargetQueueSummary } from './missingTargetQueue.js';
export type { SiblingCandidate } from './siblingSelection.js';
