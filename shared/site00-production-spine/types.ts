/**
 * Production record spine: typed records for one shot's path from planning to an approved take
 * (sprint P0.SITE00.STUDIOWORLD.PRODUCTION-SPINE-AND-EXCHANGE-S101-PACKET-ALIGNMENT.V1, §16–§17).
 *
 * PROJECT, RELEASE, SCENE and PROVIDER are references resolved from the project's existing canon and the provider
 * route table; the spine never copies them. SHOT (the shot's production setup), GENERATION_JOB, TAKE, ASSET, APPROVAL,
 * BUDGET and CONTINUITY_REFERENCE are stored. A value a provider does not return is UNKNOWN; a value that does not
 * exist yet (no submission, no output) is NOT_AVAILABLE. Neither is ever guessed.
 *
 * This file has no runtime imports, so browser code may import its types.
 */

export const SPINE_SCHEMA_VERSION = 1 as const;

export const UNKNOWN = 'UNKNOWN' as const;
export const NOT_AVAILABLE = 'NOT_AVAILABLE' as const;
export type Unknowable<T> = T | typeof UNKNOWN | typeof NOT_AVAILABLE;

export const RECORD_KINDS = ['PROJECT', 'RELEASE', 'SCENE', 'SHOT', 'GENERATION_JOB', 'TAKE', 'ASSET', 'PROVIDER', 'APPROVAL', 'BUDGET', 'CONTINUITY_REFERENCE'] as const;
export type RecordKind = (typeof RECORD_KINDS)[number];

export const STORED_KINDS = ['SHOT', 'GENERATION_JOB', 'TAKE', 'ASSET', 'APPROVAL', 'BUDGET', 'CONTINUITY_REFERENCE'] as const;
export type StoredKind = (typeof STORED_KINDS)[number];

/** Marks test data. A live store refuses any record that carries it. */
export const TEST_FIXTURE = 'TEST_FIXTURE' as const;

export type RecordBase<K extends StoredKind> = {
  kind: K;
  id: string;
  projectId: string;
  schemaVersion: typeof SPINE_SCHEMA_VERSION;
  /** Starts at 1; each accepted update adds one. APPROVAL records never change. */
  revision: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  fixture?: typeof TEST_FIXTURE;
};

/** A pointer into existing canon: the file, the record inside it, and the file hash it was read at. */
export type SourceRef = { path: string; recordId: string; sha256: string | null };

/* ── actors ─────────────────────────────────────────────────────────────────────────────────────────── */

export type ActorRole = 'FOUNDER' | 'REVIEWER' | 'SYSTEM';
export type Actor = { id: string; role: ActorRole };

/* ── references (resolved, never stored) ──────────────────────────────────────────────────────────── */

export type ProjectRef = {
  kind: 'PROJECT';
  projectId: string;
  displayName: string;
  canon: SourceRef[];
  releases: number;
  runtimeSec: number;
  /** Characters stay project-local; nothing is written to the global Actor Catalogue. */
  castAuthority: 'PROJECT_LOCAL';
  globalActorCatalogue: 'NOT_IMPORTED';
};
export type ReleaseRef = { kind: 'RELEASE'; projectId: string; releaseId: string; title: string; runtimeTargetSec: number; source: SourceRef };
export type SceneRef = { kind: 'SCENE'; projectId: string; releaseId: string; sceneId: string; packetStatus: string; screenplayStatus: string; source: SourceRef };

/** What this environment may do with a route. A connector the founder uses elsewhere lends nothing here. */
export type ProviderExecution = 'DISABLED' | 'ENABLED' | 'FAKE_TEST_ONLY';
export type ProviderRef = {
  kind: 'PROVIDER';
  routeId: string;
  provider: string;
  model: string;
  mode: string;
  config: Record<string, string | number | boolean>;
  transportId: string;
  execution: ProviderExecution;
  reason: string;
};

/* ── stored records ─────────────────────────────────────────────────────────────────────────────────── */

export type DecisionRole = 'SCREENPLAY' | 'CITY_REFERENCE' | 'GENERATION_AUTHORIZATION';
/** A founder decision the shot waits on, with its status as the directorial packet records it. */
export type RequiredDecision = { decisionId: string; role: DecisionRole; question: string; status: 'OPEN' | 'ANSWERED'; source: SourceRef };

export type ReferenceStatus = 'NOT_CREATED' | 'CREATED_UNAPPROVED' | 'APPROVED';
export type ShotReference = { referenceId: string; role: 'START_FRAME' | 'REFERENCE'; title: string; status: ReferenceStatus; blockedBy: string[]; assetId: string | null };

export type ShotSetupStatus = 'PRODUCTION_SETUP_READY' | 'PRODUCTION_SETUP_INCOMPLETE';
export type ShotGenerationStatus = 'GENERATION_AUTHORIZATION_PENDING' | 'GENERATION_READY';
export type LiveProviderCheck = 'NOT_RUN' | 'PASSED' | 'FAILED';

export type ShotRecord = RecordBase<'SHOT'> & {
  releaseId: string;
  sceneId: string;
  shotId: string;
  source: SourceRef;
  setup: ShotSetupStatus;
  generation: ShotGenerationStatus;
  fps: number;
  screenFrames: number;
  screenSec: number;
  generationSec: number;
  aspect: string;
  /** The packet's own words for the shot, kept with the source hash they were read at. */
  summary: { purpose: string; subject: string; framing: string; movement: string; lighting: string };
  requiredDecisions: RequiredDecision[];
  references: ShotReference[];
  jobIds: string[];
  budgetId: string;
  liveProviderCheck: LiveProviderCheck;
};

export const JOB_STATES = [
  'DRAFT',
  'AWAITING_APPROVAL',
  'AUTHORIZED',
  'QUEUED',
  'RUNNING',
  'SUCCEEDED',
  'FAILED',
  'CANCELED',
  'ASSET_CAPTURE_PENDING',
  'ASSET_CAPTURE_FAILED',
  'CAPTURED',
] as const;
export type JobState = (typeof JOB_STATES)[number];

export type JobKind = 'REFERENCE_IMAGE' | 'KEYFRAME_IMAGE' | 'VIDEO_I2V';
export type SettingValue = string | number | boolean;

export type JobInput = { role: 'START_FRAME' | 'END_FRAME' | 'REFERENCE'; referenceId: string; assetId: string | null; contentSha256: string | null };

export type JobTransition = { from: JobState; to: JobState; at: string; actor: string; reason: string; evidence: Record<string, string> };
export type JobError = { at: string; code: string; message: string };
export type JobAttempt = { attempt: number; authorizationId: string | null; ticketId: string | null; operationId: Unknowable<string>; outcome: 'OPEN' | 'SUCCEEDED' | 'FAILED' | 'CANCELED'; chargedCredits: Unknowable<number> };

export type GenerationJobRecord = RecordBase<'GENERATION_JOB'> & {
  releaseId: string;
  sceneId: string;
  shotId: string;
  jobKind: JobKind;
  /** The shot reference this job produces (reference images), or null for the shot's video. */
  producesReferenceId: string | null;
  requestedOutputs: { mediaType: 'IMAGE' | 'VIDEO'; count: number; durationSec: number | null; aspect: string; resolution: string; audio: boolean };
  inputs: JobInput[];
  prompt: { text: string; source: 'DERIVED_FROM_PACKET'; sourceRef: SourceRef };
  routeId: string;
  provider: string;
  model: string;
  mode: string;
  settings: Record<string, SettingValue>;
  quotedCost: { credits: number | null; source: SourceRef; quotedAt: string | null };
  maxAuthorizedCost: { credits: number | null };
  founderApprovalRef: string | null;
  /** sha256 over everything that changes what the provider would make. A changed hash voids the authorization. */
  inputHash: string;
  idempotencyKey: string;
  providerOperationId: Unknowable<string>;
  status: JobState;
  submittedAt: string | null;
  completedAt: string | null;
  actualSpend: { credits: Unknowable<number> };
  outputAssetIds: string[];
  errors: JobError[];
  attempts: JobAttempt[];
  transitions: JobTransition[];
};

export const TAKE_DECISION_STATES = ['READY_FOR_REVIEW', 'APPROVED', 'HELD', 'REJECTED'] as const;
export type TakeDecisionState = (typeof TAKE_DECISION_STATES)[number];
export const TAKE_ACTIONS = ['APPROVE', 'HOLD', 'REJECT', 'SELECT_FOR_EDIT', 'DESELECT_FOR_EDIT'] as const;
export type TakeAction = (typeof TAKE_ACTIONS)[number];
export type ContinuityStatus = 'NOT_REVIEWED' | 'PASS' | 'ISSUES';

export type TakeRecord = RecordBase<'TAKE'> & {
  releaseId: string;
  sceneId: string;
  shotId: string;
  jobId: string;
  takeNumber: number;
  assetId: string;
  storageRef: string;
  contentSha256: string;
  /** Read from the stored file by a media probe, not from the provider's claims. */
  runtimeSec: Unknowable<number>;
  resolution: Unknowable<string>;
  frameRate: Unknowable<number>;
  aspectRatio: Unknowable<string>;
  audioPresent: Unknowable<boolean>;
  provider: string;
  model: string;
  continuity: { status: ContinuityStatus; approvalId: string | null };
  decision: TakeDecisionState;
  selectedForEdit: boolean;
  approvalIds: string[];
};

export type MediaAdapterId = 'MEMORY_TEST' | 'LOCAL_PRIVATE' | 'SUPABASE_PRIVATE';

export type AssetRecord = RecordBase<'ASSET'> & {
  mediaType: 'VIDEO' | 'IMAGE';
  mimeType: string;
  adapter: MediaAdapterId;
  storageRef: string;
  contentSha256: string;
  byteSize: number;
  verifiedAt: string;
  lineage: {
    sourceJobId: string | null;
    sourceTakeId: string | null;
    derivedFromAssetId: string | null;
    providerOperationId: Unknowable<string>;
    /** Only the host is kept. A provider's temporary URL is never stored or used as the master. */
    providerSourceHost: Unknowable<string>;
  };
};

export const APPROVAL_KINDS = ['GENERATION_AUTHORIZATION', 'BUDGET_AUTHORIZATION', 'REFERENCE_APPROVAL', 'TAKE_DECISION', 'CONTINUITY_REVIEW'] as const;
export type ApprovalKind = (typeof APPROVAL_KINDS)[number];
export type ApprovalDecision = 'AUTHORIZE' | 'REVOKE' | TakeAction | 'PASS' | 'ISSUES';

export type ApprovalRecord = RecordBase<'APPROVAL'> & {
  approvalKind: ApprovalKind;
  subject: { kind: StoredKind; id: string };
  decision: ApprovalDecision;
  actor: string;
  actorRole: ActorRole;
  at: string;
  note: string | null;
  /** Founder decisions (FD-…) this approval answers or relies on. */
  decisionRefs: string[];
  supersedes: string | null;
  /** GENERATION_AUTHORIZATION only. */
  inputHash?: string;
  maxCredits?: number;
  expiresAt?: string;
  budgetId?: string;
  /** BUDGET_AUTHORIZATION only. */
  authorizedCredits?: number;
};

export type BudgetStatus = 'PLANNING_ESTIMATE_ONLY' | 'AUTHORIZED' | 'CLOSED';
export type BudgetLine = { lineId: string; jobIds: string[]; description: string; credits: number | null; basis: string };

export type BudgetRecord = RecordBase<'BUDGET'> & {
  releaseId: string;
  shotIds: string[];
  status: BudgetStatus;
  plannedCredits: number | null;
  authorizedCredits: number;
  approvalId: string | null;
  lines: BudgetLine[];
  quoteSource: SourceRef;
  quotedAt: string | null;
  note: string;
};

export type ContinuityRefStatus = 'CANONICAL' | 'INSPECTION_ONLY' | 'INVALIDATED';

export type ContinuityReferenceRecord = RecordBase<'CONTINUITY_REFERENCE'> & {
  shotId: string;
  takeId: string;
  sourceAssetId: string;
  sourceSha256: string;
  frameIndex: number;
  timestampSec: number;
  resolution: string;
  assetId: string;
  contentSha256: string;
  takeDecisionAtExtraction: TakeDecisionState;
  status: ContinuityRefStatus;
  purpose: string;
};

export type RecordOf<K extends StoredKind> = {
  SHOT: ShotRecord;
  GENERATION_JOB: GenerationJobRecord;
  TAKE: TakeRecord;
  ASSET: AssetRecord;
  APPROVAL: ApprovalRecord;
  BUDGET: BudgetRecord;
  CONTINUITY_REFERENCE: ContinuityReferenceRecord;
}[K];
export type AnyRecord = RecordOf<StoredKind>;

export class SpineError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(`${code}: ${message}`);
    this.name = 'SpineError';
  }
}
