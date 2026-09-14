import type { TwinBenchmarkChallengerSlug } from '../../../../site00-visual-generation/twinProviderBenchmarkCatalog.js';

export type TwinProviderBenchmarkSnapshot = {
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
  benchmarkVersion: string;
  createdAt: string;
  status: 'FROZEN';
};

export type ProviderBenchmarkRunStatus = 'NOT_RUN' | 'RUNNING' | 'COMPLETE' | 'PROVIDER_RUN_FAILED' | 'UNAVAILABLE';

export type ProviderTwinBenchmarkReceipt = {
  id: string;
  providerRunId: string;
  challengerSlug: TwinBenchmarkChallengerSlug;
  model: string;
  actualRenderId: string;
  blueprintRenderId: string;
  compositionStateId: string;
  compositionHash: string;
  referenceTranslationRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  cloneRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  majorRegionMatch: boolean;
  objectPositionMatch: boolean;
  hierarchyMatch: boolean;
  pageStateMatch: boolean;
  majorObjectMatch: boolean;
  textPlacementMatch: boolean;
  twinCompositionRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  actualLatencyMs: number;
  blueprintLatencyMs: number;
  actualCostUsd: number;
  blueprintCostUsd: number;
  providerErrorState: string | null;
  machineRecommendation: 'REVIEW_REQUIRED';
  machinePass: false;
  createdAt: string;
};

export type ProviderBenchmarkCostRecord = {
  id: string;
  challengerSlug: TwinBenchmarkChallengerSlug;
  provider: 'FAL';
  model: string;
  actualCostUsd: number;
  blueprintCostUsd: number;
  totalCostUsd: number;
  currency: 'USD';
  timestamp: string;
};

export type FounderProviderBenchmarkDecision =
  | 'GPT_IMAGE_2'
  | 'NANO_BANANA_PRO'
  | 'FLUX_2_MAX'
  | 'FLUX_1_KONTEXT_MAX'
  | 'NONE';

export type MobileTwinProviderBenchmarkState = {
  benchmarkId: string;
  snapshot: TwinProviderBenchmarkSnapshot;
  methodLocked: 'ATOMIC_SIBLING_FROM_COMPOSITION';
  baselineActualRenderId: string | null;
  baselineBlueprintRenderId: string | null;
  baselineModel: string;
  runs: Record<
    TwinBenchmarkChallengerSlug,
    {
      providerRunId: string;
      status: ProviderBenchmarkRunStatus;
      actualRenderId: string | null;
      blueprintRenderId: string | null;
      receiptId: string | null;
      costRecordId: string | null;
      actualJobId: string | null;
      blueprintJobId: string | null;
      providerErrorState?: string | null;
    }
  >;
  status: 'NOT_STARTED' | 'RUNNING' | 'FOUNDER_REVIEW_READY' | 'PARTIAL';
  totalNewJobs: number;
  totalBenchmarkCostUsd: number;
  idempotencyKey: string;
  founderDecision?: FounderProviderBenchmarkDecision | null;
  founderDecisionNotes?: string | null;
};

export type MobileTwinProviderStrategyStatus = 'UNRESOLVED' | 'PROVISIONAL_WINNER';

export type MobileTwinProviderStrategy = {
  generationMethod: 'ATOMIC_SIBLING_FROM_COMPOSITION';
  selectedProvider: 'FAL';
  selectedModel: string;
  selectedLabel: string;
  benchmarkRunId: string;
  compositionSnapshotId: string;
  selectedAt: string;
  founderDecision: string;
  decisionNotes: string | null;
  status: MobileTwinProviderStrategyStatus;
};
