/**
 * P0.5E.4C — Character visual casting types + pipeline state machine.
 */

import type {
  CASTING_CANDIDATE_STATUSES,
  CASTING_DEEPER_JUDGMENTS,
  CASTING_PRIMARY_JUDGMENTS,
  CASTING_ROUND_STATUSES,
  CASTING_VARIATION_AXES,
  MERGE_TRAIT_OPTIONS,
  FOUNDER_CASTING_REFERENCE_ROLES,
  CHARACTER_BIBLE_ASSET_SLOTS,
  CHARACTER_BIBLE_REVIEW_TABS,
  REFERENCE_CONTROLLED_VARIATION_SLOTS,
  CASTING_PROMPT_AUTHORITY_LAYERS,
} from './constants.js';

export type FounderCastingReferenceRole = (typeof FOUNDER_CASTING_REFERENCE_ROLES)[number];

export type CharacterPipelineState =
  | 'CHARACTER_DISCOVERY_IN_PROGRESS'
  | 'CHARACTER_SYNTHESIS_READY'
  | 'FOUNDER_I_KNOW_HER_CONFIRMATION'
  | 'FOUNDER_I_KNOW_HER_CONFIRMED'
  | 'CHARACTER_TRUTH_LOCKED_FOR_CASTING'
  | 'VISUAL_CASTING_READY'
  | 'CASTING_CANDIDATES_PENDING'
  | 'CASTING_CANDIDATES_READY'
  | 'FOUNDER_CASTING_CALIBRATION'
  | 'VISUAL_IDENTITY_CANDIDATE_SELECTED'
  | 'FINAL_IDENTITY_CONFIRMATION'
  | 'FINAL_VISUAL_IDENTITY_APPROVED'
  | 'CHARACTER_REFERENCE_PACK_READY'
  | 'CONTINUITY_TEST_READY';

export type CastingPrimaryJudgment = (typeof CASTING_PRIMARY_JUDGMENTS)[number];
export type CastingDeeperJudgment = (typeof CASTING_DEEPER_JUDGMENTS)[number];
export type CastingCandidateStatus = (typeof CASTING_CANDIDATE_STATUSES)[number];
export type CastingRoundStatus = (typeof CASTING_ROUND_STATUSES)[number];
export type CastingVariationAxis = (typeof CASTING_VARIATION_AXES)[number];
export type MergeTraitOption = (typeof MERGE_TRAIT_OPTIONS)[number];
export type VisibilityConfidence = 'CLEARLY_VISIBLE' | 'PARTIALLY_VISIBLE' | 'INFERRED' | 'UNKNOWN';
export type CharacterBibleAssetSlot = (typeof CHARACTER_BIBLE_ASSET_SLOTS)[number];
export type CharacterBibleReviewTab = (typeof CHARACTER_BIBLE_REVIEW_TABS)[number];
export type ReferenceControlledVariationSlot = (typeof REFERENCE_CONTROLLED_VARIATION_SLOTS)[number];
export type CastingPromptAuthorityLayer = (typeof CASTING_PROMPT_AUTHORITY_LAYERS)[number];
export type CastingGenerationMode = 'LEGACY_VARIATION' | 'REFERENCE_DRIVEN' | 'CHARACTER_BIBLE_ASSET_PACK';

export type DecomposedVisualField = {
  value: string;
  confidence: VisibilityConfidence;
};

export type CharacterReferenceDecomposition = {
  decompositionId: string;
  referenceId: string;
  sourcePreviewUrl: string;
  sourceStoragePath: string;
  role: FounderCastingReferenceRole;
  decomposedAt: string;
  identity: {
    ageRange: DecomposedVisualField;
    skinTone: DecomposedVisualField;
    faceShape: DecomposedVisualField;
    browShape: DecomposedVisualField;
    eyeShape: DecomposedVisualField;
    noseProfile: DecomposedVisualField;
    lipShape: DecomposedVisualField;
    jawCharacter: DecomposedVisualField;
    likenessAnchors: DecomposedVisualField[];
    distinguishingProportions: DecomposedVisualField;
    presenceEnergy: DecomposedVisualField;
  };
  hair: {
    texture: DecomposedVisualField;
    density: DecomposedVisualField;
    length: DecomposedVisualField;
    parting: DecomposedVisualField;
    styleStructure: DecomposedVisualField;
    patternNotes: DecomposedVisualField;
    color: DecomposedVisualField;
    hairlineBehavior: DecomposedVisualField;
    stylingLane: DecomposedVisualField;
  };
  wardrobe: {
    topCategory: DecomposedVisualField;
    bottomCategory: DecomposedVisualField;
    layerPieces: DecomposedVisualField;
    silhouette: DecomposedVisualField;
    fit: DecomposedVisualField;
    fabricImpression: DecomposedVisualField;
    colorPalette: DecomposedVisualField;
    shoes: DecomposedVisualField;
    accessories: DecomposedVisualField;
    jewelry: DecomposedVisualField;
    eyewear: DecomposedVisualField;
    nails: DecomposedVisualField;
    lookNaming: DecomposedVisualField;
  };
  presence: {
    moodEnergy: DecomposedVisualField;
    posture: DecomposedVisualField;
    poseLanguage: DecomposedVisualField;
    cameraRelationship: DecomposedVisualField;
    editorialVsEveryday: DecomposedVisualField;
  };
  environment: {
    roomType: DecomposedVisualField;
    setCues: DecomposedVisualField;
    lightingMood: DecomposedVisualField;
    colorEnvironment: DecomposedVisualField;
    editorialObjects: DecomposedVisualField;
    propSuggestions: DecomposedVisualField;
    realismLane: DecomposedVisualField;
  };
  authorityNotes: string[];
};

export type ActiveCastingReferenceAuthority = {
  authorityId: string;
  referenceId: string;
  role: FounderCastingReferenceRole;
  previewUrl: string;
  storagePath: string;
  decompositionId: string;
  activatedAt: string;
  authorityRank: number;
};

export type ReferenceDrivenCastingBundle = {
  bundleId: string;
  referenceId: string;
  decompositionId: string;
  authorityOrder: CastingPromptAuthorityLayer[];
  legacyPromptSecondary: true;
  compiledAt: string;
  promptSnapshotIds: string[];
};

export type CharacterBibleAssetPack = {
  packId: string;
  referenceId: string;
  decompositionId: string;
  roundId: string | null;
  slots: CharacterBibleAssetSlot[];
  lockStates: {
    faceLocked: boolean;
    wardrobeLocked: boolean;
    environmentLocked: boolean;
  };
  status: 'PLANNED' | 'GENERATING' | 'REVIEW' | 'APPROVED';
  createdAt: string;
  approvedAt: string | null;
};

export type ReferenceDerivedCharacterSummary = {
  summaryId: string;
  referenceId: string;
  decompositionId: string;
  identityLine: string;
  hairLine: string;
  wardrobeLine: string;
  environmentLine: string;
  presenceLine: string;
  compiledAt: string;
};

export type FounderCharacterRecognitionConfirmed = {
  eventId: string;
  projectId: string;
  characterId: string;
  synthesisVersion: string | null;
  confirmedAt: string;
  founderAction: 'YES_I_KNOW_HER';
  sourceRoute: string;
  calibrationSessionId: string | null;
  characterTruthSnapshotId: string;
};

export type CharacterTruthTruthLayer = {
  text: string;
  authority: 'FOUNDER_CONFIRMED' | 'SYSTEM_INFERRED' | 'UNRESOLVED';
};

export type CharacterTruthSnapshot = {
  snapshotId: string;
  version: number;
  characterId: string;
  projectId: string;
  createdAt: string;
  lockedForCasting: boolean;
  supersededBySnapshotId: string | null;
  characterSummary: CharacterTruthTruthLayer | null;
  intelligenceProfile: CharacterTruthTruthLayer[];
  contradictionProfile: CharacterTruthTruthLayer[];
  humor: CharacterTruthTruthLayer[];
  emotionalRange: CharacterTruthTruthLayer[];
  values: CharacterTruthTruthLayer[];
  blindSpots: CharacterTruthTruthLayer[];
  culturalLife: CharacterTruthTruthLayer[];
  privateHumanity: CharacterTruthTruthLayer[];
  languageVoiceTraits: CharacterTruthTruthLayer[];
  bookRelationship: CharacterTruthTruthLayer | null;
  behavior: CharacterTruthTruthLayer[];
  cameraBehavior: CharacterTruthTruthLayer[];
  visualHypotheses: CharacterTruthTruthLayer[];
  founderConfirmedTruths: string[];
  systemInferences: string[];
  unresolvedAreas: string[];
};

export type CharacterCastingAuthority = {
  authorityId: string;
  snapshotId: string;
  visualHypothesisEvidence: string[];
  visualTendencyEvidence: string[];
  projectVisualCanonNotes: string[];
  continuityArchitectureNotes: string[];
};

export type VisualCastingReadinessEvaluation = {
  evaluationId: string;
  ready: boolean;
  visualCastingReady: boolean;
  blockers: string[];
  providerReadiness: 'READY' | 'AUTH_REQUIRED' | 'SCHEMA_REVIEW_REQUIRED' | 'CASTING_BLOCKED_PROVIDER';
  estimatedCandidateCount: number;
  estimatedCostUsd: number | null;
  provider: string | null;
  model: string | null;
};

export type CharacterCastingPromptContract = {
  contractId: string;
  snapshotId: string;
  sections: {
    characterTruth: string;
    culturalIdentity: string;
    ageRange: string;
    facePresence: string;
    hair: string;
    beauty: string;
    wardrobe: string;
    jewelry: string;
    posture: string;
    cameraRelationship: string;
    environment: string;
    light: string;
    realism: string;
    negativeIdentityConstraints: string;
    variationAxis: string;
    continuityIntent: string;
    referenceAuthorityBlock?: string;
    legacyPromptSecondary?: string;
  };
  variationAxis: CastingVariationAxis;
  generationMode?: CastingGenerationMode;
  assetSlot?: CharacterBibleAssetSlot | null;
  controlledVariationSlot?: ReferenceControlledVariationSlot | null;
  referenceAuthorityId?: string | null;
};

export type CharacterCastingCandidate = {
  candidateId: string;
  roundId: string;
  characterTruthSnapshotId: string;
  provider: string;
  model: string;
  promptSnapshotId: string;
  variationAxis: CastingVariationAxis;
  assetSlot: CharacterBibleAssetSlot | ReferenceControlledVariationSlot | null;
  generationMode: CastingGenerationMode;
  outputAssetId: string | null;
  previewUrl: string | null;
  createdAt: string;
  founderJudgment: CastingPrimaryJudgment | null;
  deeperJudgment: CastingDeeperJudgment | null;
  strengths: string[];
  weaknesses: string[];
  castingStatus: CastingCandidateStatus;
  founderNote: string | null;
};

export type CharacterCastingRound = {
  roundId: string;
  roundNumber: number;
  characterId: string;
  characterTruthSnapshotId: string;
  candidateIds: string[];
  generationContractId: string | null;
  generationMode: CastingGenerationMode;
  referenceAuthorityId: string | null;
  assetPackId: string | null;
  provider: string;
  model: string;
  costUsd: number | null;
  createdAt: string;
  status: CastingRoundStatus;
  retainedTraits: MergeTraitOption[];
  variedTraits: CastingVariationAxis[];
  rejectedTraits: string[];
  basedOnPriorTruthSnapshotId: string | null;
};

export type CharacterCastingMergeRequest = {
  mergeRequestId: string;
  roundId: string;
  candidateIds: string[];
  retainFromEach: Partial<Record<string, MergeTraitOption[]>>;
  createdAt: string;
  status: 'PENDING' | 'APPLIED' | 'CANCELLED';
};

export type CastingFalGenerationTracking = {
  attemptId: string;
  roundId: string;
  startedAt: string;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED';
  errorMessage: string | null;
};

export type FounderCastingReference = {
  referenceId: string;
  previewUrl: string;
  storagePath: string;
  role: FounderCastingReferenceRole;
  label: string | null;
  decomposedSignals: string[];
  decomposition: CharacterReferenceDecomposition | null;
  decomposedAt: string | null;
  storedInBible: boolean;
  bibleReceiptId: string | null;
  uploadedAt: string;
  status: 'UPLOADED' | 'DECOMPOSED' | 'BIBLE_STORED';
};

export type CharacterVisualCastingState = {
  castingVersion: typeof import('./constants.js').CHARACTER_VISUAL_CASTING_VERSION;
  pipelineState: CharacterPipelineState;
  founderIKnowHerConfirmed: boolean;
  characterTruthLockedForCasting: boolean;
  visualCastingReady: boolean;
  castingCandidatesReady: boolean;
  finalVisualIdentityApproved: boolean;
  characterReferencePackReady: boolean;
  continuityTestReady: boolean;
  recognitionConfirmed: FounderCharacterRecognitionConfirmed | null;
  truthSnapshots: CharacterTruthSnapshot[];
  activeTruthSnapshotId: string | null;
  castingAuthority: CharacterCastingAuthority | null;
  readiness: VisualCastingReadinessEvaluation;
  rounds: CharacterCastingRound[];
  candidates: CharacterCastingCandidate[];
  mergeRequests: CharacterCastingMergeRequest[];
  selectedCandidateId: string | null;
  finalIdentityConfirmationRoundId: string | null;
  referencePackSummary: {
    packId: string | null;
    faceAnchors: number;
    expressionAnchors: number;
    hairAnchors: number;
    wardrobeAnchors: number;
    negativeConstraints: number;
  };
  reopenCalibrationAcknowledged: boolean;
  falImageRequests: number;
  falVideoRequests: number;
  falGenerationTracking: CastingFalGenerationTracking | null;
  founderReferences: FounderCastingReference[];
  activeReferenceAuthority: ActiveCastingReferenceAuthority | null;
  promptContractSnapshots: Record<string, CharacterCastingPromptContract>;
  referenceDrivenBundles: ReferenceDrivenCastingBundle[];
  characterBibleAssetPack: CharacterBibleAssetPack | null;
  referenceDerivedSummary: ReferenceDerivedCharacterSummary | null;
  updatedAt: string;
};
