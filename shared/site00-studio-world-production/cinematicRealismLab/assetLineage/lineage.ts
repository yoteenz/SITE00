/**
 * Asset lineage — immutable prompt + output tracking.
 */

import type { CompiledProviderPrompt, RealismBenchmarkAsset, RealismLaneRun } from '../types.js';

export type AssetLineageRecord = {
  lineageId: string;
  assetId: string;
  runId: string;
  experimentId: string;
  promptFingerprint: string | null;
  promptSnapshot: CompiledProviderPrompt | null;
  workflowKind: RealismLaneRun['workflowKind'];
  providerId: RealismLaneRun['providerId'];
  laneId: RealismLaneRun['laneId'];
  parentAssetId: string | null;
  createdAt: string;
};

export function bindAssetLineage(params: {
  asset: RealismBenchmarkAsset;
  run: RealismLaneRun;
  experimentId: string;
  parentAssetId?: string | null;
}): AssetLineageRecord {
  return {
    lineageId: `lineage-${params.asset.assetId}`,
    assetId: params.asset.assetId,
    runId: params.run.runId,
    experimentId: params.experimentId,
    promptFingerprint: params.run.promptSnapshot?.fingerprint ?? null,
    promptSnapshot: params.run.promptSnapshot,
    workflowKind: params.run.workflowKind,
    providerId: params.run.providerId,
    laneId: params.run.laneId,
    parentAssetId: params.parentAssetId ?? null,
    createdAt: new Date().toISOString(),
  };
}

export function lineageChain(records: AssetLineageRecord[], assetId: string): AssetLineageRecord[] {
  const chain: AssetLineageRecord[] = [];
  let current = records.find((r) => r.assetId === assetId);
  while (current) {
    chain.unshift(current);
    current = current.parentAssetId ? records.find((r) => r.assetId === current!.parentAssetId!) : undefined;
  }
  return chain;
}
