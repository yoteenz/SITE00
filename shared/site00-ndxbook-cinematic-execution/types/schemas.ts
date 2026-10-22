/** Versioned machine-readable contracts for NDXBOOK cinematic execution. */

export const CINEMATIC_EXECUTION_CONTRACT_VERSION = '1.0.0' as const;
export const REFERENCE_BINDING_MANIFEST_VERSION = '1.0.0' as const;
export const CINEMATIC_JOB_LIFECYCLE_VERSION = '1.0.0' as const;

export type ApprovalStatus = 'DRAFT' | 'FOUNDER_APPROVED' | 'FOUNDER_REJECTED' | 'PENDING_REVIEW';

export type ReferenceRole =
  | 'START_FRAME'
  | 'END_FRAME'
  | 'MIDDLE_FRAME'
  | 'CHARACTER_IDENTITY'
  | 'WARDROBE'
  | 'SCENE'
  | 'PROP'
  | 'STYLE'
  | 'OMNI_REFERENCE';

export type ProviderAutomationMode =
  | 'API_AUTOMATED'
  | 'MANUAL_SUBMISSION'
  | 'MANUAL_IMPORT'
  | 'DISABLED';

export type CinematicJobState =
  | 'DRAFT'
  | 'REFERENCES_PENDING'
  | 'READY_FOR_APPROVAL'
  | 'APPROVED_FOR_EXECUTION'
  | 'QUEUED'
  | 'SUBMITTED'
  | 'RUNNING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'CANCELLED'
  | 'OUTPUT_IMPORTED'
  | 'QUALITY_REVIEW'
  | 'FOUNDER_APPROVED'
  | 'FOUNDER_REJECTED'
  | 'REGISTERED_FOR_EDIT';

export type ReferenceBindingEntry = {
  assetId: string;
  fileLocation: string;
  contentHash: string | null;
  mediaType: 'image/jpeg' | 'image/png' | 'image/webp' | 'video/mp4' | 'unknown';
  referenceRole: ReferenceRole;
  approvalVersion: string;
  approvalStatus: ApprovalStatus;
  providerUploadStatus: 'NOT_REQUIRED' | 'PENDING' | 'UPLOADED' | 'FAILED';
  providerReferenceId: string | null;
  validatedDeliveryStatus: 'PENDING' | 'VALIDATED' | 'FAILED';
  creativeRole: string;
  width: number | null;
  height: number | null;
  entryId: string;
  sceneId: string | null;
  shotId: string | null;
  characterId: string | null;
};

export type ReferenceBindingManifest = {
  manifestVersion: typeof REFERENCE_BINDING_MANIFEST_VERSION;
  manifestHash: string | null;
  entryId: string;
  shotId: string;
  references: ReferenceBindingEntry[];
};

export type IdentityContinuityLock = {
  characterId: string;
  faceIdentity: string;
  hairstyle: string;
  hairLength: string;
  hairTexture: string;
  makeup: string;
  wardrobe: string;
  accessories: string;
  nailShape: string;
  nailColor: string;
  shoes: string;
  periodStyling: string;
  shotLevelOverridesAllowed: string[];
  restrictions: string[];
};

export type ShotKeyframeSpec = {
  role: 'START' | 'MIDDLE' | 'END';
  assetId: string;
  timestampSec: number;
  aspectRatio: string;
};

export type ShotExecutionContract = {
  contractVersion: typeof CINEMATIC_EXECUTION_CONTRACT_VERSION;
  campaignId: string;
  entryId: string;
  sceneId: string;
  shotId: string;
  shotVersion: string;
  storyboardVersion: string;
  approvalStatus: ApprovalStatus;
  narrativeBeat: string;
  shotObjective: string;
  requiredCharacterIds: string[];
  requiredVisualAssetIds: string[];
  optionalReferenceIds: string[];
  identityContinuity: IdentityContinuityLock[];
  lockedWardrobeDetails: string[];
  lockedSceneDetails: string[];
  lockedPropDetails: string[];
  periodAuthority: string;
  keyframes: ShotKeyframeSpec[];
  actionDescription: string;
  cameraDirection: string;
  cameraMovement: string;
  performanceDirection: string;
  lightingDirection: string;
  audioRequirements: string | null;
  expectedDurationSec: number;
  expectedAspectRatio: string;
  outputResolution: '720p' | '1080p' | '4K';
  provider: string;
  modelVersion: string;
  providerParameterMapping: Record<string, unknown>;
  negativeConstraints: string[];
  validationCriteria: string[];
  founderReviewStatus: ApprovalStatus;
  referenceManifest: ReferenceBindingManifest;
  motionAuthority: {
    subjectMovement: string;
    cameraPath: string;
    actionTiming: string;
    focalEmphasis: string;
    temporalContinuity: string;
    wardrobeBehavior: string;
    hairMovement: string;
    handFingerIntegrity: string;
    facialConsistency: string;
    propInteraction: string;
    backgroundContinuity: string;
    dialogueOrAudio: string | null;
  };
};

export type CinematicGenerationJobRecord = {
  lifecycleVersion: typeof CINEMATIC_JOB_LIFECYCLE_VERSION;
  jobId: string;
  idempotencyKey: string;
  state: CinematicJobState;
  providerJobId: string | null;
  sourceContractVersion: string;
  referenceManifestHash: string;
  promptHash: string | null;
  modelVersion: string;
  submissionTimestamp: string | null;
  startTimestamp: string | null;
  completionTimestamp: string | null;
  providerStatus: string | null;
  providerError: string | null;
  costOrCredits: number | null;
  outputAssetIds: string[];
  qualityReviewId: string | null;
  approvalHistory: Array<{ at: string; actor: string; action: string; note?: string }>;
};

export type ReferenceReadinessFailure =
  | 'REFERENCE_MISSING'
  | 'REFERENCE_UNAPPROVED'
  | 'REFERENCE_HASH_MISMATCH'
  | 'REFERENCE_UNDELIVERABLE'
  | 'UNSUPPORTED_MEDIA_TYPE'
  | 'EXCESS_REFERENCE_COUNT'
  | 'PROVIDER_UPLOAD_FAILURE';

export type ReferenceReadinessResult =
  | { ok: true; manifestHash: string }
  | { ok: false; blockedReason: ReferenceReadinessFailure; detail: string; assetId?: string };
