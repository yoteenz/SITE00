import type { FocusedHybridStrategyId } from '../../../../site00-visual-generation/twinFocusedHybridBenchmarkCatalog.js';
import type { MobileBlueprintTwinVisual, MobileImplementationRender } from './types.js';
import type { ProviderStrategyBenchmarkReceipt } from './twinFocusedHybridBenchmarkTypes.js';

export function buildProviderStrategyBenchmarkReceipt(input: {
  id: string;
  strategyId: FocusedHybridStrategyId;
  actualModel: string;
  blueprintModel: string;
  benchmarkSnapshotId: string;
  actual: MobileImplementationRender;
  blueprint: MobileBlueprintTwinVisual;
  providerLatencyMs: number;
  providerCostUsd: number;
  providerErrors: string | null;
  presentationFirewallErrorCode: string | null;
  canonicalPath: boolean;
}): ProviderStrategyBenchmarkReceipt {
  const hashAligned =
    input.actual.compositionHash === input.blueprint.compositionHash &&
    input.actual.compositionStateId === input.blueprint.compositionStateId;
  const distinctImages = input.actual.renderImageHash !== input.blueprint.twinImageHash;
  const twinCompositionRisk: ProviderStrategyBenchmarkReceipt['twinCompositionRisk'] =
    hashAligned && distinctImages ? 'LOW'
    : hashAligned ? 'MEDIUM'
    : 'HIGH';

  const presentationRisk: ProviderStrategyBenchmarkReceipt['actualPresentationRisk'] =
    input.presentationFirewallErrorCode ? 'HIGH'
    : input.strategyId === 'NBP_FULL_PAIR_CORRECTED' ? 'MEDIUM'
    : 'LOW';

  return {
    id: input.id,
    strategyId: input.strategyId,
    actualProvider: 'FAL',
    actualModel: input.actualModel,
    blueprintProvider: 'FAL',
    blueprintModel: input.blueprintModel,
    benchmarkSnapshotId: input.benchmarkSnapshotId,
    compositionStateId: input.actual.compositionStateId,
    compositionHash: input.actual.compositionHash,
    actualRenderId: input.actual.id,
    blueprintRenderId: input.blueprint.id,
    actualPresentationRisk: presentationRisk,
    majorRegionMatch: hashAligned,
    objectPositionMatch: hashAligned,
    hierarchyMatch: hashAligned,
    pageStateMatch: hashAligned,
    blueprintClarityRisk: hashAligned ? 'LOW' : 'MEDIUM',
    twinCompositionRisk,
    providerLatencyMs: input.providerLatencyMs,
    providerCostUsd: input.providerCostUsd,
    providerErrors: input.providerErrors,
    presentationFirewallErrorCode: input.presentationFirewallErrorCode,
    machineRecommendation: 'REVIEW_REQUIRED',
    machinePass: false,
    canonicalPath: input.canonicalPath,
    createdAt: new Date().toISOString(),
  };
}
