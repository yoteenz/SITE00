import type { MobileBlueprintTwinVisual, MobileImplementationRender } from './types.js';
import type { ProviderTwinBenchmarkReceipt } from './twinProviderBenchmarkTypes.js';
import type { TwinBenchmarkChallengerSlug } from '../../../../site00-visual-generation/twinProviderBenchmarkCatalog.js';

export function buildProviderTwinBenchmarkReceipt(input: {
  id: string;
  providerRunId: string;
  challengerSlug: TwinBenchmarkChallengerSlug;
  model: string;
  actual: MobileImplementationRender;
  blueprint: MobileBlueprintTwinVisual;
  actualLatencyMs: number;
  blueprintLatencyMs: number;
  actualCostUsd: number;
  blueprintCostUsd: number;
  providerErrorState: string | null;
}): ProviderTwinBenchmarkReceipt {
  const hashAligned =
    input.actual.compositionHash === input.blueprint.compositionHash &&
    input.actual.compositionStateId === input.blueprint.compositionStateId;
  const distinctImages = input.actual.renderImageHash !== input.blueprint.twinImageHash;
  const twinCompositionRisk: ProviderTwinBenchmarkReceipt['twinCompositionRisk'] =
    hashAligned && distinctImages ? 'LOW'
    : hashAligned ? 'MEDIUM'
    : 'HIGH';

  return {
    id: input.id,
    providerRunId: input.providerRunId,
    challengerSlug: input.challengerSlug,
    model: input.model,
    actualRenderId: input.actual.id,
    blueprintRenderId: input.blueprint.id,
    compositionStateId: input.actual.compositionStateId,
    compositionHash: input.actual.compositionHash,
    referenceTranslationRisk: hashAligned ? 'LOW' : 'MEDIUM',
    cloneRisk: distinctImages ? 'LOW' : 'HIGH',
    majorRegionMatch: hashAligned,
    objectPositionMatch: hashAligned,
    hierarchyMatch: hashAligned,
    pageStateMatch: hashAligned,
    majorObjectMatch: hashAligned,
    textPlacementMatch: hashAligned,
    twinCompositionRisk,
    actualLatencyMs: input.actualLatencyMs,
    blueprintLatencyMs: input.blueprintLatencyMs,
    actualCostUsd: input.actualCostUsd,
    blueprintCostUsd: input.blueprintCostUsd,
    providerErrorState: input.providerErrorState,
    machineRecommendation: 'REVIEW_REQUIRED',
    machinePass: false,
    createdAt: new Date().toISOString(),
  };
}
