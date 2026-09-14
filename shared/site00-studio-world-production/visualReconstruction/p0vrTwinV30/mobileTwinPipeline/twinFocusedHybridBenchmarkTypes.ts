import type { FocusedHybridStrategyId } from '../../../../site00-visual-generation/twinFocusedHybridBenchmarkCatalog.js';

export type TwinFocusedHybridBenchmarkSnapshot = {
  id: string;
  referenceAuthorityId: string;
  referenceHash: string;
  compositionStateId: string;
  compositionHash: string;
  featureManifestVersion: string;
  projectContextVersion: string;
  hostProjectContractVersion: string;
  viewport: 'MOBILE';
  outputWidthPx: number;
  outputHeightPx: number;
  promptContractVersion: string;
  sprintVersion: string;
  sourceBenchmarkSnapshotId: string | null;
  createdAt: string;
  status: 'FROZEN';
};

export type FocusedHybridStrategyRunStatus =
  | 'NOT_RUN'
  | 'RUNNING'
  | 'COMPLETE'
  | 'REVIEW_REQUIRED'
  | 'PROVIDER_RUN_FAILED'
  | 'REUSED_CONTROL';

export type ProviderStrategyBenchmarkReceipt = {
  id: string;
  strategyId: FocusedHybridStrategyId;
  actualProvider: 'FAL';
  actualModel: string;
  blueprintProvider: 'FAL';
  blueprintModel: string;
  benchmarkSnapshotId: string;
  compositionStateId: string;
  compositionHash: string;
  actualRenderId: string;
  blueprintRenderId: string;
  actualPresentationRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  majorRegionMatch: boolean;
  objectPositionMatch: boolean;
  hierarchyMatch: boolean;
  pageStateMatch: boolean;
  blueprintClarityRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  twinCompositionRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  providerLatencyMs: number;
  providerCostUsd: number;
  providerErrors: string | null;
  presentationFirewallErrorCode: string | null;
  machineRecommendation: 'REVIEW_REQUIRED';
  machinePass: false;
  canonicalPath: boolean;
  createdAt: string;
};

export type FocusedHybridStrategyRow = {
  strategyId: FocusedHybridStrategyId;
  status: FocusedHybridStrategyRunStatus;
  actualRenderId: string | null;
  blueprintRenderId: string | null;
  actualJobId: string | null;
  blueprintJobId: string | null;
  receiptId: string | null;
  idempotencyKey: string;
  providerErrorState?: string | null;
  presentationFirewallPass?: boolean | null;
};

export type MobileTwinFocusedHybridBenchmarkState = {
  benchmarkId: string;
  snapshot: TwinFocusedHybridBenchmarkSnapshot;
  methodLocked: 'ATOMIC_SIBLING_FROM_COMPOSITION';
  controlStrategyId: 'GPT2_FULL_PAIR';
  strategies: Record<FocusedHybridStrategyId, FocusedHybridStrategyRow>;
  status: 'NOT_STARTED' | 'RUNNING' | 'FOUNDER_REVIEW_READY' | 'PARTIAL';
  totalNewJobs: number;
  totalBenchmarkCostUsd: number;
  founderSelectedStrategy?: FounderMobileTwinRenderStrategyDecision | null;
  founderNotes?: string | null;
};

export type FounderMobileTwinRenderStrategyDecision =
  | 'GPT2_FULL_PAIR'
  | 'NBP_FULL_PAIR'
  | 'HYBRID_GPT2_ACTUAL__NBP_BLUEPRINT'
  | 'UNRESOLVED';

export type MobileTwinRenderStrategyStatus = 'UNRESOLVED' | 'PROVISIONAL_WINNER';

export type MobileTwinRenderStrategy = {
  strategy: Exclude<FounderMobileTwinRenderStrategyDecision, 'UNRESOLVED'>;
  actualProvider: 'FAL';
  actualModel: string;
  blueprintProvider: 'FAL';
  blueprintModel: string;
  benchmarkRunId: string;
  benchmarkSnapshotId: string;
  compositionStateId: string;
  compositionHash: string;
  actualRenderId: string | null;
  blueprintRenderId: string | null;
  founderNotes: string | null;
  selectedAt: string;
  status: MobileTwinRenderStrategyStatus;
};
