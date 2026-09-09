/**
 * P0.VR.5 — Founder instruction intelligence + multi-asset deconstruction pipeline types.
 */

export const P0_VR_5_LINEAGE = 'P0.VR.5' as const;

export const ASSET_JOB_STATUSES = [
  'DRAFT',
  'PLANNED',
  'DETECTING',
  'CROP_REVIEW',
  'CROPS_CONFIRMED',
  'RECONSTRUCTING',
  'OUTPUT_REVIEW',
  'UPLOADING',
  'BINDING',
  'COMPLETED',
  'CANCELLED',
  'FAILED',
] as const;

export type AssetJobStatus = (typeof ASSET_JOB_STATUSES)[number];

export const ASSET_JOB_TYPES = [
  'SINGLE_ASSET',
  'MULTI_ASSET',
  'ICON_SET',
  'BACKGROUND_EXTRACT',
  'HERO_EXTRACT',
  'REPLACEMENT_BATCH',
  'CUSTOM',
] as const;

export type AssetJobType = (typeof ASSET_JOB_TYPES)[number];

export const CANDIDATE_CLASSIFICATIONS = [
  'ICON',
  'ICON_SET_MEMBER',
  'HERO_OBJECT',
  'PROJECT_CARD_VISUAL',
  'DECORATIVE_OBJECT',
  'BACKGROUND_IMAGE',
  'THUMBNAIL_VISUAL',
  'PHOTO_SOURCE',
  'OTHER_SOLO_ASSET',
] as const;

export type CandidateClassification = (typeof CANDIDATE_CLASSIFICATIONS)[number];

export const DETECTION_ORDERING_RULES = [
  'LEFT_TO_RIGHT',
  'TOP_TO_BOTTOM',
  'MANUAL',
  'GRID_ORDER',
] as const;

export type DetectionOrderingRule = (typeof DETECTION_ORDERING_RULES)[number];

export const BACKGROUND_POLICIES = ['KEEP_BACKGROUND', 'REMOVE_BACKGROUND', 'AUTO_IF_NEEDED'] as const;
export type BackgroundPolicy = (typeof BACKGROUND_POLICIES)[number];

export const FOUNDER_CROP_DECISIONS = [
  'PENDING',
  'CONFIRMED',
  'REJECTED',
  'SKIPPED',
  'RE_CROP',
  'SPLIT',
  'MERGED',
] as const;

export type FounderCropDecision = (typeof FOUNDER_CROP_DECISIONS)[number];

export const REPLACEMENT_SLOT_MATCHING_MODES = [
  'REPLACE_CURRENT_SELECTION',
  'REPLACE_BY_ORDER',
  'REPLACE_BY_SLOT_NAME',
  'MANUAL_BIND',
  'NONE',
] as const;

export type ReplacementSlotMatchingMode = (typeof REPLACEMENT_SLOT_MATCHING_MODES)[number];

export const VERSION_APPROVAL_STATES = ['PENDING', 'APPROVED', 'REJECTED'] as const;
export type VersionApprovalState = (typeof VERSION_APPROVAL_STATES)[number];

export const JOB_COST_RISK_LEVELS = ['LOW', 'MODERATE', 'HIGH'] as const;
export type JobCostRiskLevel = (typeof JOB_COST_RISK_LEVELS)[number];

export const JOB_WORKFLOW_STEPS = [
  'UPLOAD',
  'INSTRUCT',
  'DETECT',
  'CONFIRM_CROP',
  'RECONSTRUCT',
  'APPROVE',
  'REPLACE',
] as const;

export type JobWorkflowStep = (typeof JOB_WORKFLOW_STEPS)[number];

export type BoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type SourceUploadRecord = {
  uploadId: string;
  url: string;
  fileName: string | null;
  sourcePage: string | null;
  sourceModule: string | null;
  sourceRoute: string | null;
  imageWidth: number;
  imageHeight: number;
  createdAt: string;
};

export type ReplacementSlot = {
  slotId: string;
  slotName: string;
  route: string | null;
  componentPath: string | null;
  assetSlot: string | null;
  orderIndex: number;
  currentAssetUrl: string | null;
};

export type ReplacementMapping = {
  replacementTargetScope: string | null;
  replacementSlots: ReplacementSlot[];
  slotMatchingMode: ReplacementSlotMatchingMode;
  sourceOrderToTargetOrder: Record<number, string>;
};

export type DetectedAssetCandidate = {
  candidateId: string;
  jobId: string;
  sourceUploadId: string;
  boundingBox: BoundingBox;
  previewUrl: string | null;
  classification: CandidateClassification;
  confidence: number;
  orderIndex: number;
  founderDecision: FounderCropDecision;
  replacementTarget: string | null;
  lowConfidenceBlock: boolean;
};

export type ReconstructedAssetVersion = {
  versionId: string;
  candidateId: string;
  provider: string;
  backgroundPolicy: BackgroundPolicy;
  outputUrl: string | null;
  approvalState: VersionApprovalState;
  uploadState: 'PENDING' | 'UPLOADED' | 'FAILED';
  bindState: 'PENDING' | 'BOUND' | 'FAILED' | 'SKIPPED';
  dispatchCount: number;
  createdAt: string;
};

export type DesignInstructionPreset = {
  presetId: string;
  name: string;
  instructionTemplate: string;
  intentType: AssetJobType;
  assetTypes: CandidateClassification[];
  multiAsset: boolean;
  orderingRule: DetectionOrderingRule;
  backgroundPolicy: BackgroundPolicy;
  cropConfirmationRequired: boolean;
  replacementBehavior: ReplacementSlotMatchingMode;
  generationPolicy: string;
  targetScope: string | null;
  usageCount: number;
  lastUsedAt: string | null;
  founderCreated: boolean;
  founderEdited: boolean;
  learnedFromJobs: string[];
  confidence: number;
};

export type JobEvent = {
  eventId: string;
  jobId: string;
  eventType: string;
  timestamp: string;
  actor: 'FOUNDER' | 'SYSTEM';
  payload: Record<string, unknown>;
};

export type AssetJob = {
  jobId: string;
  workspaceId: string;
  projectId: string;
  pageId: string;
  route: string;
  sourceUploadIds: string[];
  sourceUploads: SourceUploadRecord[];
  founderInstruction: string;
  selectedPresetId: string | null;
  jobType: AssetJobType;
  targetAssetTypes: CandidateClassification[];
  multiAsset: boolean;
  status: AssetJobStatus;
  currentStep: JobWorkflowStep;
  dispatchCounts: { planned: number; executed: number; blocked: number };
  costRiskLevel: JobCostRiskLevel;
  backgroundPolicy: BackgroundPolicy;
  orderingRule: DetectionOrderingRule;
  cropConfirmationRequired: boolean;
  cropsConfirmed: boolean;
  replacementMapping: ReplacementMapping | null;
  detectedRegions: DetectedAssetCandidate[];
  detectionCount: number;
  detectionOrdering: DetectionOrderingRule;
  reconstructedVersions: ReconstructedAssetVersion[];
  generationProviderPlan: string[];
  createdAt: string;
  updatedAt: string;
};

export type AssetJobPlanSummary = {
  jobType: AssetJobType;
  targetAssetType: CandidateClassification | 'MIXED';
  singleOrMulti: 'SINGLE' | 'MULTI';
  detectedCount: number;
  expectedOutputs: number;
  backgroundPolicy: BackgroundPolicy;
  replacementTarget: string | null;
  generationProviderPlan: string[];
  founderConfirmationRequired: boolean;
  costRiskLevel: JobCostRiskLevel;
  estimatedDispatchCount: number;
  workflowSteps: JobWorkflowStep[];
};

export type ParsedFounderInstruction = {
  rawInstruction: string;
  intentType: AssetJobType;
  assetTypes: CandidateClassification[];
  multiAsset: boolean;
  orderingRule: DetectionOrderingRule;
  backgroundPolicy: BackgroundPolicy;
  replacementBehavior: ReplacementSlotMatchingMode;
  replacementTargetScope: string | null;
  transparentOutput: boolean;
  keywords: string[];
};
