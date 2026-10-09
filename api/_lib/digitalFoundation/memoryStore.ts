import type {
  ApprovalRecord,
  ArtifactEvent,
  ClientActionRequest,
  DigitalFoundationArtifact,
  DigitalFoundationLead,
  DigitalFoundationQuote,
  FoundationBuildCredit,
  OwnershipRecord,
  ProjectStageRecord,
  QuoteAcceptanceRecord,
  ReferralSource,
} from '../../../shared/site00-digital-foundation/types.js';
import type { BuildReadinessAssessment } from '../../../shared/site00-digital-foundation/types.js';
import { seedReferralSources } from '../../../shared/site00-digital-foundation/referralSources.js';
import { defaultDigitalFoundationCommercialConfig } from '../../../shared/site00-digital-foundation/commercialConfig.js';
import type {
  DigitalFoundationExecutionTask,
  DigitalFoundationRunbook,
  DigitalFoundationVerificationResult,
  DigitalFoundationVerificationRule,
  ManualVerificationOverride,
  ProjectForecast,
  ProjectOperationsConfig,
} from '../../../shared/site00-digital-foundation/operations/types.js';
import { isCloudMobilePreviewDev } from '../cloudMobilePreview.js';
import {
  mergePreviewSnapshotFromDisk,
  touchPreviewSnapshotAfterMutation,
} from './previewMemorySnapshot.js';

export type DfMemoryState = {
  config: ReturnType<typeof defaultDigitalFoundationCommercialConfig>;
  referralSources: ReferralSource[];
  leads: Map<string, DigitalFoundationLead>;
  artifacts: Map<string, DigitalFoundationArtifact>;
  artifactsByToken: Map<string, string>;
  quotes: Map<string, DigitalFoundationQuote>;
  acceptances: Map<string, QuoteAcceptanceRecord>;
  stages: Map<string, ProjectStageRecord[]>;
  clientActions: Map<string, ClientActionRequest[]>;
  approvals: Map<string, ApprovalRecord[]>;
  ownership: Map<string, OwnershipRecord>;
  buildReadiness: Map<string, BuildReadinessAssessment>;
  credits: Map<string, FoundationBuildCredit>;
  events: ArtifactEvent[];
  stripeProcessedEventIds: Set<string>;
  checkoutSessions: Map<string, { artifact_id: string; quote_id: string; session_id: string }>;
  runbooks: Map<string, DigitalFoundationRunbook>;
  runbookHistory: Map<string, DigitalFoundationRunbook[]>;
  tasks: Map<string, DigitalFoundationExecutionTask[]>;
  verificationRules: Map<string, DigitalFoundationVerificationRule[]>;
  verificationResults: Map<string, DigitalFoundationVerificationResult[]>;
  verificationOverrides: Map<string, ManualVerificationOverride[]>;
  forecasts: Map<string, ProjectForecast>;
  projectConfig: Map<string, ProjectOperationsConfig>;
  readinessClock: Map<
    string,
    { readiness_satisfied_at: string | null; production_started_at: string | null }
  >;
};

let state: DfMemoryState | null = null;

export function getDfMemoryState(): DfMemoryState {
  if (!state) {
    state = {
      config: defaultDigitalFoundationCommercialConfig(),
      referralSources: seedReferralSources(),
      leads: new Map(),
      artifacts: new Map(),
      artifactsByToken: new Map(),
      quotes: new Map(),
      acceptances: new Map(),
      stages: new Map(),
      clientActions: new Map(),
      approvals: new Map(),
      ownership: new Map(),
      buildReadiness: new Map(),
      credits: new Map(),
      events: [],
      stripeProcessedEventIds: new Set(),
      checkoutSessions: new Map(),
      runbooks: new Map(),
      runbookHistory: new Map(),
      tasks: new Map(),
      verificationRules: new Map(),
      verificationResults: new Map(),
      verificationOverrides: new Map(),
      forecasts: new Map(),
      projectConfig: new Map(),
      readinessClock: new Map(),
    };
    if (isCloudMobilePreviewDev()) {
      mergePreviewSnapshotFromDisk(state);
    }
  }
  return state;
}

function afterDfMutation(): void {
  if (!state || !isCloudMobilePreviewDev()) return;
  touchPreviewSnapshotAfterMutation(state);
}

export function resetDigitalFoundationMemoryStore(): void {
  state = null;
}

export function memSaveArtifact(a: DigitalFoundationArtifact): void {
  const s = getDfMemoryState();
  s.artifacts.set(a.artifact_id, a);
  s.artifactsByToken.set(a.public_token, a.artifact_id);
  afterDfMutation();
}

export function memGetArtifact(id: string): DigitalFoundationArtifact | undefined {
  return getDfMemoryState().artifacts.get(id);
}

export function memGetArtifactByToken(token: string): DigitalFoundationArtifact | undefined {
  const id = getDfMemoryState().artifactsByToken.get(token);
  return id ? memGetArtifact(id) : undefined;
}

export function memSaveLead(l: DigitalFoundationLead): void {
  getDfMemoryState().leads.set(l.lead_id, l);
  afterDfMutation();
}

export function memGetLead(id: string): DigitalFoundationLead | undefined {
  return getDfMemoryState().leads.get(id);
}

export function memSaveQuote(q: DigitalFoundationQuote): void {
  getDfMemoryState().quotes.set(q.quote_id, q);
  afterDfMutation();
}

export function memGetQuote(id: string): DigitalFoundationQuote | undefined {
  return getDfMemoryState().quotes.get(id);
}

export function memAppendEvent(e: ArtifactEvent): void {
  getDfMemoryState().events.push(e);
  afterDfMutation();
}

/** Cloud preview: reload shared snapshot when token missing (multi-backend tunnel). */
export function memRefreshPreviewSnapshotFromDisk(): void {
  if (!isCloudMobilePreviewDev()) return;
  mergePreviewSnapshotFromDisk(getDfMemoryState());
}

export function listArtifacts(): DigitalFoundationArtifact[] {
  return [...getDfMemoryState().artifacts.values()].sort(
    (a, b) => b.created_at.localeCompare(a.created_at),
  );
}
