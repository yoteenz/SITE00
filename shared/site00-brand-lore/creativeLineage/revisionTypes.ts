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
  'CANCELLED',
  'FAILED',
] as const;
export type RevisionSpecStatus = (typeof REVISION_SPEC_STATUSES)[number];

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
  generationMode: 'IMAGE_EDIT' | 'PROMPT_REGENERATION' | null;
  generationGate: {
    liveGenerationEnabled: false;
    gateReason: string;
  };
  childAssetId: string | null;
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
  typographyRevision: string | null;
  colorRevision: string | null;
  compositionRevision: string | null;
  copyRevision: string | null;
  imageryRevision: string | null;
  deltaPrompt: string;
  compiledAt: string;
};

export type CreativeRevisionDiff = {
  revisionId: string;
  parentAssetId: string;
  childAssetId: string | null;
  requestedChanges: string[];
  actualChanges: string[];
  lockedElementsPreserved: string[];
  unexpectedChanges: string[];
  visualDriftDetected: boolean;
  compliance: 'PASS' | 'PARTIAL' | 'FAIL';
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
  diff: CreativeRevisionDiff | null;
  founderActions: Array<'LOVE_REVISION' | 'REVISE_AGAIN' | 'KEEP_ORIGINAL' | 'NOT_FOR_ME'>;
};
