/**
 * The Takes workspace payload the spine API returns and the EXPRESSION Takes screen renders. Types only, so the
 * browser bundle never pulls in the node-side spine.
 */
import type {
  ActorRole,
  ApprovalDecision,
  ApprovalKind,
  BudgetStatus,
  ContinuityStatus,
  JobKind,
  JobState,
  MediaAdapterId,
  ProviderRef,
  RequiredDecision,
  ShotGenerationStatus,
  ShotReference,
  ShotSetupStatus,
  TakeAction,
  TakeDecisionState,
  Unknowable,
} from './types.js';

export type ActionState = { allowed: boolean; reason: string | null };
export type ReasonView = { code: string; detail: string };

export type JobView = {
  jobId: string;
  jobKind: JobKind;
  status: JobState;
  producesReferenceId: string | null;
  routeId: string;
  provider: string;
  model: string;
  quotedCredits: number | null;
  maxAuthorizedCredits: number | null;
  actualCredits: Unknowable<number>;
  providerOperationId: Unknowable<string>;
  submittedAt: string | null;
  completedAt: string | null;
  errors: Array<{ at: string; code: string; message: string }>;
  dispatch: { enabled: boolean; reasons: ReasonView[] };
};

export type HistoryView = { approvalId: string; kind: ApprovalKind; decision: ApprovalDecision; actor: string; actorRole: ActorRole; at: string; note: string | null };

export type TakeView = {
  takeId: string;
  jobId: string;
  takeNumber: number;
  state: TakeDecisionState | 'SELECTED_FOR_EDIT';
  decision: TakeDecisionState;
  selectedForEdit: boolean;
  runtimeSec: Unknowable<number>;
  resolution: Unknowable<string>;
  frameRate: Unknowable<number>;
  aspectRatio: Unknowable<string>;
  audioPresent: Unknowable<boolean>;
  provider: string;
  model: string;
  contentSha256: string;
  storage: MediaAdapterId;
  continuity: ContinuityStatus;
  estimatedCredits: number | null;
  actualCredits: Unknowable<number>;
  /** Short-lived signed read of the stored copy; null when it cannot be signed here. */
  preview: { url: string; expiresAt: string; mimeType: string } | null;
  previewUnavailable: string | null;
  history: HistoryView[];
  sourceAssets: Array<{ assetId: string; role: string; sha256: string | null }>;
  fixture: boolean;
  actions: Record<TakeAction, ActionState>;
};

export type ShotView = {
  shotId: string;
  sceneId: string;
  setup: ShotSetupStatus;
  generation: ShotGenerationStatus;
  fps: number;
  screenSec: number;
  generationSec: number;
  aspect: string;
  summary: { purpose: string; subject: string; framing: string; movement: string; lighting: string };
  requiredDecisions: RequiredDecision[];
  references: ShotReference[];
  budget: { budgetId: string; status: BudgetStatus; plannedCredits: number | null; authorizedCredits: number; committedCredits: number; actualCredits: Unknowable<number>; note: string };
  jobs: JobView[];
  takes: TakeView[];
  generate: { enabled: boolean; reasons: ReasonView[] };
  liveProviderCheck: 'NOT_RUN' | 'PASSED' | 'FAILED';
};

export type TakesWorkspaceView = {
  projectId: string;
  displayName: string;
  catalogue: { kind: 'LIVE' | 'TEST_FIXTURE'; records: string; media: MediaAdapterId; readOnlyReason: string | null };
  viewer: { id: string; role: ActorRole };
  project: { releases: number; runtime: string; castAuthority: 'PROJECT_LOCAL'; globalActorCatalogue: 'NOT_IMPORTED' };
  release: { releaseId: string; title: string; runtimeTargetSec: number };
  scene: { sceneId: string; packetStatus: string; screenplayStatus: string };
  shots: ShotView[];
  providers: ProviderRef[];
  generatedAt: string;
};
