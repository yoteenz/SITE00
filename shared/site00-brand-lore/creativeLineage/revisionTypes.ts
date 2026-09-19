/**
 * Surgical revision specification — parent immutable, child lineage.
 */

export const REVISION_SEVERITIES = ['MICRO', 'TARGETED', 'SUBSTANTIAL', 'REINTERPRET'] as const;
export type RevisionSeverity = (typeof REVISION_SEVERITIES)[number];

export const REVISION_ELEMENT_KEYS = [
  'COPY',
  'TYPOGRAPHY',
  'COLOR',
  'COMPOSITION',
  'ASSETS',
  'ANNOTATIONS',
  'BACKGROUND',
  'MATERIALS',
  'CROP',
  'INFORMATION',
  'FORMAT',
  'WORLD',
  'DIRECTION_DNA',
] as const;
export type RevisionElementKey = (typeof REVISION_ELEMENT_KEYS)[number];

export type RevisionElementState = 'LOCKED' | 'MUTABLE' | 'UNSPECIFIED';

export const REVISION_CATEGORY_KEYS = [
  'typography',
  'color',
  'composition',
  'copy',
  'imagery',
  'material',
  'annotation',
  'hierarchy',
  'spacing',
  'scale',
  'crop',
  'graphicDevice',
  'brandRecognition',
  'formatBehavior',
  'motion',
  'other',
] as const;
export type RevisionCategoryKey = (typeof REVISION_CATEGORY_KEYS)[number];

export type RevisionCategoryNotes = Partial<Record<RevisionCategoryKey, string>>;

export const REVISION_SPEC_STATUSES = [
  'DRAFT',
  'READY_FOR_REVIEW',
  'APPROVED_FOR_GENERATION',
  'GENERATING',
  'GENERATED',
  'COMPARISON_READY',
  'ACCEPTED',
  'REVISION_REQUESTED',
  'REJECTED',
  'CANCELLED',
  'FAILED',
  'GENERATION_FAILED',
  'STORAGE_FAILED',
] as const;
export type RevisionSpecStatus = (typeof REVISION_SPEC_STATUSES)[number];

export const REVISION_GENERATION_MODES = [
  'IMAGE_EDIT',
  'REFERENCE_CONDITIONED_REGENERATION',
  'PROMPT_REGENERATION',
] as const;
export type RevisionGenerationMode = (typeof REVISION_GENERATION_MODES)[number];

export const REVISION_COMPLIANCE_RESULTS = ['PASS', 'PARTIAL', 'FAIL', 'NOT_EVALUATED'] as const;
export type RevisionComplianceResult = (typeof REVISION_COMPLIANCE_RESULTS)[number];

export type RevisionComplianceCategory = {
  category: string;
  requestedChange: string | null;
  result: RevisionComplianceResult;
  evidence: string;
};

export type RevisionGenerationReceipt = {
  receiptId: string;
  revisionSpecId: string;
  parentAssetId: string;
  rootAssetId: string;
  childAssetId: string | null;
  revisionNumber: number;
  branchId: string;
  generationMode: RevisionGenerationMode;
  provider: string;
  model: string;
  promptHash: string;
  sourceImageReference: string | null;
  referenceAssetIds: string[];
  generationStartedAt: string;
  generationCompletedAt: string | null;
  costEstimateUsd: number | null;
  providerRequestId: string | null;
  storagePath: string | null;
  failureReason: string | null;
  surgicalityPreflight: string;
  contaminationPreflight: string;
  idempotencyKey: string;
  isTechnicalRetry: boolean;
};

export type AssetExchangeInstruction = {
  instructionId: string;
  targetElement: string;
  replacementType: string;
  replacementDescription: string;
  preservePosition: boolean;
  preserveScale: boolean;
  preserveTreatment: boolean;
  founderNote: string | null;
};

export type CreativeRevisionSpec = {
  revisionId: string;
  parentAssetId: string;
  rootAssetId: string;
  revisionNumber: number;
  branchId: string;
  brandSlug: string;
  projectId: string;
  directionId: string;
  worldId: string;
  creativeFamilyId: string | null;
  severity: RevisionSeverity;
  founderOriginalNote: string;
  categoryNotes: RevisionCategoryNotes;
  elementStates: Partial<Record<RevisionElementKey, RevisionElementState>>;
  lockedElements: RevisionElementKey[];
  mutableElements: RevisionElementKey[];
  preserveUnspecified: true;
  requestedAssetExchange: AssetExchangeInstruction[];
  requestedCopyChanges: string[];
  requestedColorChanges: string[];
  requestedTypographyChanges: string[];
  status: RevisionSpecStatus;
  generationMode: RevisionGenerationMode | null;
  generationGate: {
    liveGenerationEnabled: boolean;
    gateReason: string;
  };
  childAssetId: string | null;
  generationReceipt: RevisionGenerationReceipt | null;
  complianceDiff: CreativeRevisionDiff | null;
  idempotencyKey: string | null;
  approvedAt: string | null;
  generationAttempt: number;
  createdAt: string;
  updatedAt: string;
};

export type RevisionBranch = {
  branchId: string;
  rootAssetId: string;
  brandSlug: string;
  label: string;
  revisionIds: string[];
  parentBranchId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type RevisionGenerationBrief = {
  revisionMode: RevisionSeverity;
  parentAssetId: string;
  coreDirection: string;
  world: string;
  preserve: string[];
  change: string[];
  doNot: string[];
  hardLocks: string[];
  softPreservation: string[];
  antiDriftRules: string[];
  typographyRevision: string | null;
  colorRevision: string | null;
  compositionRevision: string | null;
  copyRevision: string | null;
  imageryRevision: string | null;
  assetExchanges: string[];
  worldDnaPreserve: string[];
  brandDnaPreserve: string[];
  formatRequirements: string[];
  deltaPrompt: string;
  compiledAt: string;
};

export type ChangeSatisfactionEntry = {
  requestedChange: string;
  result: RevisionComplianceResult;
  evidence: string;
};

export type CreativeRevisionDiff = {
  revisionId: string;
  parentAssetId: string;
  childAssetId: string | null;
  requestedChanges: ChangeSatisfactionEntry[];
  lockedElementsPreserved: ChangeSatisfactionEntry[];
  unrequestedDrift: ChangeSatisfactionEntry[];
  categoryResults: RevisionComplianceCategory[];
  preserveUnspecified: boolean;
  visualDriftDetected: boolean;
  summaryCompliance: RevisionComplianceResult;
  copyProvenance: {
    parentCopy: string | null;
    requestedCopy: string | null;
    generatedCopyNote: string | null;
  };
};

export type CreativeFamilyRevisionSpec = {
  familyRevisionId: string;
  creativeFamilyId: string;
  brandSlug: string;
  targetSystems: Array<
    'TYPOGRAPHY_SYSTEM' | 'PALETTE_SYSTEM' | 'COMPOSITION_SYSTEM' | 'ANNOTATION_SYSTEM' | 'COPY_SYSTEM' | 'MOTION_SYSTEM'
  >;
  founderNote: string;
  slideRevisionSpecIds: string[];
  status: RevisionSpecStatus;
  createdAt: string;
  updatedAt: string;
};

export const PREFERENCE_LEARNING_SCOPES = ['BRAND_SPECIFIC', 'FOUNDER_GLOBAL'] as const;
export type PreferenceLearningScope = (typeof PREFERENCE_LEARNING_SCOPES)[number];

export type FounderCreativePreferenceEvidence = {
  evidenceId: string;
  brandSlug: string;
  projectId: string;
  sourceAssetId: string;
  revisionId: string | null;
  category: RevisionCategoryKey | RevisionElementKey;
  observation: string;
  confidence: number;
  occurrenceCount: number;
  learningScope: PreferenceLearningScope;
  firstObservedAt: string;
  lastObservedAt: string;
};

export type RevisionComparisonState = {
  parentAssetId: string;
  childAssetId: string | null;
  revisionId: string;
  specStatus: RevisionSpecStatus;
  diff: CreativeRevisionDiff | null;
  generationReceipt: RevisionGenerationReceipt | null;
  parentStoragePath: string | null;
  childStoragePath: string | null;
  founderActions: Array<'LOVE_IT' | 'REVISE_AGAIN' | 'NOT_FOR_ME' | 'SET_PREFERRED_VERSION'>;
};
