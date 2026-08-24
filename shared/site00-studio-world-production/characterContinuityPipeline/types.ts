/**
 * P0.5E.5 — Generic Character Continuity Pipeline types.
 */

import type {
  ANCHOR_CLASSES,
  BIBLE_INVALIDATION_OUTCOMES,
  BIBLE_SOURCE_TYPES,
  BIBLE_STATUSES,
  CONTINUITY_CATEGORIES,
  CONTINUITY_QA_RESULTS,
  FALLBACK_POLICY_OUTCOMES,
  GENERATION_CONTINUITY_MODES,
  NEGATIVE_CONSTRAINT_CATEGORIES,
  PIPELINE_FAILURE_STATES,
  REFERENCE_AUTHORITY_LEVELS,
  REFERENCE_PACK_READINESS,
  REFERENCE_TYPES,
  SCHEMA_SUPPORT_STATES,
  VARIATION_CLASSES,
} from './constants.js';

export type BibleStatus = (typeof BIBLE_STATUSES)[number];
export type BibleSourceType = (typeof BIBLE_SOURCE_TYPES)[number];
export type AnchorClass = (typeof ANCHOR_CLASSES)[number];
export type VariationClass = (typeof VARIATION_CLASSES)[number];
export type NegativeConstraintCategory = (typeof NEGATIVE_CONSTRAINT_CATEGORIES)[number];
export type ReferenceType = (typeof REFERENCE_TYPES)[number];
export type ReferenceAuthorityLevel = (typeof REFERENCE_AUTHORITY_LEVELS)[number];
export type ReferencePackReadinessState = (typeof REFERENCE_PACK_READINESS)[number];
export type ContinuityCategory = (typeof CONTINUITY_CATEGORIES)[number];
export type GenerationContinuityMode = (typeof GENERATION_CONTINUITY_MODES)[number];
export type SchemaSupportState = (typeof SCHEMA_SUPPORT_STATES)[number];
export type ContinuityQaResult = (typeof CONTINUITY_QA_RESULTS)[number];
export type BibleInvalidationOutcome = (typeof BIBLE_INVALIDATION_OUTCOMES)[number];
export type FallbackPolicyOutcome = (typeof FALLBACK_POLICY_OUTCOMES)[number];
export type PipelineFailureState = (typeof PIPELINE_FAILURE_STATES)[number];

export type EmbodiedCharacterBible = {
  id: string;
  projectId: string;
  brandId: string;
  characterId: string;
  version: string;
  status: BibleStatus;
  identityAuthority: 'NOT_APPROVED' | 'PARTIAL' | 'APPROVED';
  continuityAuthority: 'NOT_APPROVED' | 'PARTIAL' | 'APPROVED';
  visualAuthority: 'NOT_APPROVED' | 'PARTIAL' | 'APPROVED';
  voiceAuthority: 'NOT_APPROVED' | 'PARTIAL' | 'APPROVED';
  behaviorAuthority: 'NOT_APPROVED' | 'PARTIAL' | 'APPROVED';
  characterEssence: string | null;
  psychologicalLogic: string | null;
  worldview: string | null;
  culturalContext: string | null;
  intelligenceProfile: Record<string, unknown> | null;
  contradictions: string[];
  flaws: string[];
  humorSystem: Record<string, unknown> | null;
  emotionalRange: Record<string, unknown> | null;
  voiceSystem: Record<string, unknown> | null;
  bookOrArtifactRelationship: Record<string, unknown> | null;
  physicalBehavior: Record<string, unknown> | null;
  cameraRelationship: Record<string, unknown> | null;
  everydayLife: Record<string, unknown> | null;
  relationships: Record<string, unknown> | null;
  publicPrivateDifference: Record<string, unknown> | null;
  visualIdentity: Record<string, unknown> | null;
  hairLogic: Record<string, unknown> | null;
  skinLogic: Record<string, unknown> | null;
  faceLogic: Record<string, unknown> | null;
  bodyLogic: Record<string, unknown> | null;
  beautyLogic: Record<string, unknown> | null;
  wardrobeLogic: Record<string, unknown> | null;
  jewelryLogic: Record<string, unknown> | null;
  nailLogic: Record<string, unknown> | null;
  accessoryLogic: Record<string, unknown> | null;
  expressionLogic: Record<string, unknown> | null;
  gestureLogic: Record<string, unknown> | null;
  movementLogic: Record<string, unknown> | null;
  environmentLogic: Record<string, unknown> | null;
  propLogic: Record<string, unknown> | null;
  lightingLogic: Record<string, unknown> | null;
  cameraLogic: Record<string, unknown> | null;
  allowedVariation: string[];
  prohibitedVariation: string[];
  identityAnchors: CharacterIdentityAnchor[];
  recognitionAnchors: string[];
  negativeIdentityConstraints: NegativeIdentityConstraint[];
  referencePackIds: string[];
  continuityRules: CharacterVariationRule[];
  providerNotes: string[];
  knownLimitations: string[];
  founderApproval: boolean;
  fingerprint: string;
  createdAt: string;
  updatedAt: string;
};

export type CharacterBibleIngestionReceipt = {
  receiptId: string;
  rawSource: string;
  sourceType: BibleSourceType;
  sourceVersion: string | null;
  sourceFingerprint: string;
  normalizedFields: string[];
  unmappedFields: string[];
  conflicts: string[];
  warnings: string[];
  missingCriticalFields: string[];
  ingestedAt: string;
};

export type CharacterBibleAudit = {
  auditId: string;
  bibleId: string;
  status: BibleStatus;
  characterTruthReady: boolean;
  visualIdentityReady: boolean;
  imageGenerationReady: boolean;
  videoGenerationReady: boolean;
  voiceReady: boolean;
  multiSceneContinuityReady: boolean;
  blockedReasons: string[];
  missingCriticalAuthority: string[];
  conflicts: string[];
  unresolvedVariations: string[];
  referenceGaps: string[];
  providerLimitations: string[];
  auditedAt: string;
};

export type CharacterContinuityBible = {
  continuityBibleId: string;
  bibleId: string;
  bibleVersion: string;
  categories: Record<ContinuityCategory, string[]>;
  compiledAt: string;
};

export type CharacterIdentityAnchor = {
  anchorId: string;
  anchorClass: AnchorClass;
  description: string;
  authority: 'NOT_APPROVED' | 'APPROVED' | 'EMPTY';
  variability: VariationClass;
  mustPreserve: boolean;
  providerImportance: 'HIGH' | 'MEDIUM' | 'LOW';
  referenceIds: string[];
  confidence: 'CANON' | 'STRONG' | 'HYPOTHESIS' | 'UNSET';
};

export type CharacterVariationRule = {
  ruleId: string;
  target: string;
  variationClass: VariationClass;
  rationale: string;
};

export type NegativeIdentityConstraint = {
  constraintId: string;
  category: NegativeConstraintCategory;
  description: string;
  compileToNegativePrompt: boolean;
};

export type CharacterReferenceEntry = {
  id: string;
  characterId: string;
  referenceType: ReferenceType;
  assetId: string | null;
  approvalState: 'NOT_APPROVED' | 'APPROVED' | 'REJECTED' | 'EMPTY';
  identityStrength: ReferenceAuthorityLevel;
  useCases: string[];
  doNotUseFor: string[];
  source: string;
  fingerprint: string;
};

export type CharacterReferencePack = {
  packId: string;
  characterId: string;
  references: CharacterReferenceEntry[];
  readiness: ReferencePackReadinessState;
  approvedReferenceCount: number;
};

export type ReferenceAuthorityEvaluation = {
  evaluationId: string;
  referenceId: string;
  authorityLevel: ReferenceAuthorityLevel;
  mayDefineFace: boolean;
  mayDefineHair: boolean;
  mayDefineWardrobe: boolean;
  mayDefineExpression: boolean;
  scopeConflict: boolean;
  conflictReason: string | null;
};

export type CharacterSceneContract = {
  contractId: string;
  characterBibleId: string;
  continuityBibleId: string;
  referencePackId: string | null;
  sceneId: string;
  platform: string;
  contentEventId: string | null;
  motionBehavior: string | null;
  bookBehavior: string | null;
  environment: string | null;
  emotionalState: string | null;
  thoughtState: string | null;
  spokenState: string | null;
  cameraRelationship: string | null;
  wardrobeState: string | null;
  hairState: string | null;
  beautyState: string | null;
  accessoryState: string | null;
  physicalAction: string | null;
  gesture: string | null;
  movement: string | null;
  propInteraction: string | null;
  camera: Record<string, unknown> | null;
  shotType: string | null;
  framing: string | null;
  duration: number | null;
  lighting: string | null;
  audioNeeds: boolean;
  identityRequirements: string[];
  allowedVariation: string[];
  prohibitedVariation: string[];
  referenceSelection: string[];
  providerRequirements: string[];
  continuityPriority: string[];
  compiledAt: string;
};

export type CharacterGenerationCapability = {
  capabilityId: string;
  provider: string;
  endpoint: string;
  schemaVersion: string;
  schemaSupportState: SchemaSupportState;
  schemaRetrievedAt: string | null;
  supportsTextToImage: boolean;
  supportsImageToImage: boolean;
  supportsReferenceImages: boolean;
  supportsMultipleReferences: boolean;
  supportsFaceReference: boolean;
  supportsIdentityBinding: boolean;
  supportsElements: boolean;
  supportsReferenceToVideo: boolean;
  supportsImageToVideo: boolean;
  supportsTextToVideo: boolean;
  supportsStartFrame: boolean;
  supportsEndFrame: boolean;
  supportsAudio: boolean;
  supportsLipSync: boolean;
  supportsVoiceReference: boolean;
  supportsNegativePrompt: boolean;
  supportsSeed: boolean;
  supportsLoRA: boolean;
  supportsCharacterTraining: boolean;
  supportsResolutionControl: boolean;
  supportsDurationControl: boolean;
  supportsAspectRatio: boolean;
  supportsCameraInstruction: boolean;
  maxReferenceCount: number;
};

export type CharacterGenerationModelSelection = {
  selectionId: string;
  selectedProvider: string;
  selectedEndpoint: string;
  whySelected: string;
  supportedContinuityMechanisms: string[];
  unsupportedRequirements: string[];
  fallbackOptions: string[];
  costEstimateUsd: number;
  identityFidelityPriority: true;
};

export type ProviderCharacterGenerationContract = {
  contractId: string;
  provider: string;
  endpoint: string;
  schemaVersion: string;
  prompt: string;
  negativePrompt: string | null;
  referenceImages: string[];
  faceReferences: string[];
  identityBindings: string[];
  elements: string[];
  startImage: string | null;
  endImage: string | null;
  seed: number | null;
  aspectRatio: string | null;
  resolution: string | null;
  duration: number | null;
  fps: number | null;
  audioConfig: Record<string, unknown> | null;
  voiceConfig: Record<string, unknown> | null;
  continuityInstructions: string[];
  motionInstructions: string[];
  cameraInstructions: string[];
  environmentInstructions: string[];
  unsupportedBibleRequirements: string[];
  unsupportedFieldsStripped: string[];
  costEstimateUsd: number;
  compiledAt: string;
  compilerVersion: string;
  fingerprint: string;
  previewOnly: boolean;
};

export type CharacterGenerationSnapshot = {
  snapshotId: string;
  characterBibleVersion: string;
  continuityBibleVersion: string;
  sceneContractVersion: string;
  referencePackVersion: string;
  provider: string;
  endpoint: string;
  endpointSchemaVersion: string;
  generationContract: ProviderCharacterGenerationContract;
  prompt: string;
  references: string[];
  seed: number | null;
  costEstimateUsd: number;
  result: string | null;
  continuityEvaluation: CharacterContinuityEvaluation | null;
  dispatched: false;
  immutableAfterDispatch: true;
  createdAt: string;
};

export type IdentityFidelityEvaluation = {
  evaluationId: string;
  faceMatch: ContinuityQaResult;
  skinContinuity: ContinuityQaResult;
  ageContinuity: ContinuityQaResult;
  bodyContinuity: ContinuityQaResult;
  passes: boolean;
};

export type CharacterBehaviorFidelityEvaluation = {
  evaluationId: string;
  gestureFit: ContinuityQaResult;
  movementFit: ContinuityQaResult;
  cameraRelationship: ContinuityQaResult;
  expressionFit: ContinuityQaResult;
  passes: boolean;
};

export type CharacterContinuityEvaluation = {
  evaluationId: string;
  identityFidelity: IdentityFidelityEvaluation;
  behaviorFidelity: CharacterBehaviorFidelityEvaluation;
  overallResult: ContinuityQaResult;
  influencerCollapseRisk: boolean;
  genericAiHostRisk: boolean;
  founderReviewRequired: boolean;
};

export type CharacterVideoContinuityEvaluation = {
  evaluationId: string;
  identityPersistence: ContinuityQaResult;
  faceStability: ContinuityQaResult;
  hairContinuity: ContinuityQaResult;
  wardrobeContinuity: ContinuityQaResult;
  frameDriftDetected: boolean;
  passes: boolean;
};

export type CharacterSceneState = {
  stateId: string;
  sceneId: string;
  wardrobeId: string | null;
  hairVariantId: string | null;
  makeupState: string | null;
  jewelryState: string | null;
  nailState: string | null;
  propState: string | null;
  bookState: string | null;
  timeOfDay: string | null;
  emotionalState: string | null;
  energyState: string | null;
};

export type CharacterMultiSceneContinuity = {
  continuityId: string;
  sharedCharacterIdentityId: string;
  sharedContinuityBibleId: string;
  sharedReferencePackId: string | null;
  shots: Array<{
    shotId: string;
    sceneContractId: string;
    sceneState: CharacterSceneState;
    wardrobeContinuityLocked: boolean;
    hairContinuityLocked: boolean;
  }>;
};

export type BookContinuityContract = {
  contractId: string;
  bookVersion: string | null;
  cover: string | null;
  size: string | null;
  materials: string | null;
  pageStyle: string | null;
  bookmarkTabState: string | null;
  wearState: string | null;
  currentPage: string | null;
  visibleAnnotations: string[];
  propsInserted: string[];
  finalized: false;
};

export type CharacterVoiceGenerationContract = {
  contractId: string;
  voiceBibleVersion: string | null;
  spokenCopy: string | null;
  emotionalState: string | null;
  platform: string | null;
  deliveryStyle: string | null;
  voiceIdentityCast: false;
  blockingReason: string | null;
};

export type CharacterBibleVersion = {
  versionId: string;
  bibleId: string;
  major: number;
  minor: number;
  changeSummary: string;
  identityChanging: boolean;
  recast: boolean;
  createdAt: string;
};

export type CharacterBibleInvalidation = {
  invalidationId: string;
  fromVersion: string;
  toVersion: string;
  outcome: BibleInvalidationOutcome;
  affectedAssets: string[];
  automaticRegeneration: false;
};

export type CharacterProviderFallbackPolicy = {
  policyId: string;
  preferredEndpoint: string;
  outcome: FallbackPolicyOutcome;
  identityFidelitySacrificed: false;
  reason: string;
};

export type CharacterTrainedIdentity = {
  trainedIdentityId: string;
  trainingType: 'LORA' | 'MODEL_ADAPTER' | 'IDENTITY_EMBEDDING' | 'PROVIDER_SPECIFIC_CHARACTER_PROFILE';
  trainingProvider: string | null;
  trainingEndpoint: string | null;
  trainingDatasetId: string | null;
  characterBibleVersion: string | null;
  referencePackVersion: string | null;
  approvalState: 'NOT_APPROVED' | 'APPROVED';
  trainingExecuted: false;
};

export type CharacterTrainingReadiness = {
  evaluationId: string;
  ready: false;
  blockingGates: string[];
};

export type CharacterContinuityPipelineSystem = {
  systemId: string;
  version: typeof import('./constants.js').CHARACTER_CONTINUITY_PIPELINE_VERSION;
  brandId: string;
  preCastingMode: true;
  productionGenerationBlocked: true;
};

export type CharacterContinuityPipelineRun = {
  runId: string;
  projectId: string;
  system: CharacterContinuityPipelineSystem;
  bible: EmbodiedCharacterBible | null;
  ingestionReceipts: CharacterBibleIngestionReceipt[];
  bibleAudit: CharacterBibleAudit | null;
  continuityBible: CharacterContinuityBible | null;
  referencePack: CharacterReferencePack;
  sceneContracts: CharacterSceneContract[];
  capabilityRegistry: CharacterGenerationCapability[];
  modelSelections: CharacterGenerationModelSelection[];
  providerContracts: ProviderCharacterGenerationContract[];
  generationSnapshots: CharacterGenerationSnapshot[];
  multiSceneContinuity: CharacterMultiSceneContinuity | null;
  bookContinuity: BookContinuityContract;
  voiceContract: CharacterVoiceGenerationContract;
  bibleVersions: CharacterBibleVersion[];
  invalidations: CharacterBibleInvalidation[];
  trainedIdentity: CharacterTrainedIdentity | null;
  trainingReadiness: CharacterTrainingReadiness;
  preCastingStatus: 'CHARACTER_IDENTITY_NOT_CAST';
  productionGenerationBlocked: true;
  productionGenerationBlockReason: string;
  continuityMode: GenerationContinuityMode;
  falSchemaRequests: number;
  falGenerationRequests: number;
  anthropicRequests: number;
  updatedAt: string;
};
