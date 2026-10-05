/**
 * Studio World execution truth — durable run envelope types.
 * Domain payloads remain in domain-specific records; this is the execution identity layer.
 */

export const STUDIO_WORLD_RUN_TYPES = [
  'INTELLIGENCE_SYNTHESIS',
  'CONCEPT_FORMATION',
  'DIRECTION_FORMATION',
  'WORLD_EXPRESSION',
  'SEQUENCE_GENERATION',
  'CREATIVE_ASSET_GENERATION',
  'EXPERIENCE_FORMATION',
  'EXPERIENCE_VISUAL_DEVELOPMENT',
  'VISUAL_REFERENCE_CAPTURE',
  'VISUAL_REFERENCE_PACKAGE',
  'DESIGN_PROOF_GENERATION',
  'ASSET_REVISION',
  'ASSET_PROMOTION',
  'IMPLEMENTATION_CONTRACT_COMPILATION',
  'IMPLEMENTATION_ORCHESTRATION',
  'IMPLEMENTATION_FIDELITY_EVALUATION',
  'PROJECT_INTELLIGENCE_MANIFEST',
  'WORLD_FORMATION_FUTURE',
] as const;

export type StudioWorldRunType = (typeof STUDIO_WORLD_RUN_TYPES)[number];

export const STUDIO_WORLD_NORMALIZED_STATUSES = [
  'CREATED',
  'QUEUED',
  'RUNNING',
  'WAITING_FOR_PROVIDER',
  'WAITING_FOR_FOUNDER',
  'SUCCEEDED',
  'FAILED',
  'CANCELLED',
  'SUPERSEDED',
  'BLOCKED',
  'NOT_EVALUATED',
  'RECOVERY_REQUIRED',
] as const;

export type StudioWorldNormalizedStatus = (typeof STUDIO_WORLD_NORMALIZED_STATUSES)[number];

export const STUDIO_WORLD_FAILURE_CATEGORIES = [
  'PERSISTENCE_FAILURE',
  'DURABLE_PERSISTENCE_UNAVAILABLE',
  'PROVIDER_CONFIGURATION_FAILURE',
  'PROVIDER_DISPATCH_FAILURE',
  'PROVIDER_TIMEOUT',
  'PROVIDER_RESULT_INVALID',
  'ASSET_STORAGE_FAILURE',
  'CONCURRENCY_CONFLICT',
  'IDEMPOTENCY_CONFLICT',
  'DEPENDENCY_NOT_READY',
  'LIVE_PATH_NOT_VERIFIED',
  'RECOVERY_REQUIRED',
  'UNKNOWN_FAILURE',
] as const;

export type StudioWorldFailureCategory = (typeof STUDIO_WORLD_FAILURE_CATEGORIES)[number];

export type StudioWorldProviderSummary = {
  provider?: string;
  model?: string;
  providerRequestId?: string;
  dispatchState?: 'NOT_DISPATCHED' | 'DISPATCHED' | 'RESULT_RECEIVED' | 'UNKNOWN';
};

export type StudioWorldCostSummary = {
  estimatedCostUsd?: number;
  actualCostUsd?: number;
  estimatedTokens?: number;
  actualTokens?: number;
};

export type StudioWorldRunRecord = {
  id: string;
  projectId: string | null;
  projectSlug: string | null;
  brandId: string | null;
  brandSlug: string | null;
  runType: StudioWorldRunType;
  runSubtype: string | null;
  methodologyDomain: string | null;
  methodologyVersion: string | null;
  experimentId: string | null;
  experimentVersion: string | null;
  parentRunId: string | null;
  rootRunId: string | null;
  idempotencyKey: string | null;
  status: string;
  normalizedStatus: StudioWorldNormalizedStatus;
  requestedBy: string | null;
  triggerType: string | null;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  failedAt: string | null;
  cancelledAt: string | null;
  supersededAt: string | null;
  inputFingerprint: string | null;
  outputFingerprint: string | null;
  snapshotId: string | null;
  snapshotFingerprint: string | null;
  providerSummary: StudioWorldProviderSummary;
  costSummary: StudioWorldCostSummary;
  errorSummary: {
    category?: StudioWorldFailureCategory;
    message?: string;
    recoveryHint?: string;
  } | null;
  metadata: Record<string, unknown>;
  domainRecordType: string | null;
  domainRecordId: string | null;
  version: number;
  updatedAt: string;
};

export type StudioWorldIdempotencyRecord = {
  id: string;
  projectId: string | null;
  projectSlug: string | null;
  idempotencyKey: string;
  inputFingerprint: string;
  runId: string;
  runType: StudioWorldRunType;
  createdAt: string;
};

export type GenerationReceiptRecord = {
  receiptId: string;
  runId: string | null;
  provider: string;
  model: string | null;
  providerRequestId: string | null;
  requestTimestamp: string;
  completionTimestamp: string | null;
  promptHash: string | null;
  referencePackageFingerprint: string | null;
  inputAssetFingerprints: string[];
  outputAssetIds: string[];
  providerStatus: string;
  estimatedTokens: number | null;
  actualTokens: number | null;
  estimatedCostUsd: number | null;
  actualCostUsd: number | null;
  retryAttempt: number;
  errorClassification: StudioWorldFailureCategory | null;
  payloadFingerprint: string | null;
  payloadClassification: string | null;
};

export type CapabilityVerificationStatus =
  | 'NOT_VERIFIED'
  | 'TEST_VERIFIED'
  | 'STAGING_VERIFIED'
  | 'PRODUCTION_VERIFIED'
  | 'VERIFICATION_FAILED'
  | 'STALE';

export type CapabilityImplementationStatus =
  | 'METHODOLOGY_READY'
  | 'IMPLEMENTED'
  | 'TEST_VERIFIED'
  | 'LIVE_PATH_UNVERIFIED'
  | 'LIVE_VERIFIED'
  | 'FOUNDER_APPROVED'
  | 'PRODUCTION_READY';

export type CapabilityVerificationRecord = {
  capabilityId: string;
  environment: string;
  implementationStatus: CapabilityImplementationStatus;
  verificationStatus: CapabilityVerificationStatus;
  verifiedAt: string | null;
  verificationMethod: string | null;
  verificationRunId: string | null;
  sourceCommit: string | null;
  notes: string | null;
  updatedAt: string;
};

export type OrchestrationDispatchStatus =
  | 'NOT_PREPARED'
  | 'IMPLEMENTATION_CONTRACT_READY'
  | 'ORCHESTRATION_NOT_CONNECTED'
  | 'LIVE_PATH_NOT_VERIFIED'
  | 'BLOCKED_PENDING_ORCHESTRATION_ADAPTER'
  | 'DISPATCHED'
  | 'SUCCEEDED'
  | 'FAILED';
