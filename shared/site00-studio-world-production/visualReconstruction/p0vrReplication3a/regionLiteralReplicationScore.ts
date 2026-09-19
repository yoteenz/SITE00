/**
 * P0.VR.REPLICATION.3A — Stage survival scores (coarse, shows where information is lost).
 */

import type { NdxDriftTraceRegionId } from './constants.js';
import type { RegionLiteralReplicationScore, ReplicationDriftStage } from './types.js';
import { NDX_AUTHORITY_REGION_BENCHMARKS } from './ndxRegionBenchmarks.js';
import { NDX_PILOT_RUNTIME_REGION_MAP } from './pilotRuntimeSourceMap.js';

function pct(n: number, d: number): number {
  if (d <= 0) return 100;
  return Math.max(0, Math.min(100, Math.round((n / d) * 100)));
}

export function buildRegionLiteralReplicationScore(regionId: NdxDriftTraceRegionId): RegionLiteralReplicationScore {
  const ref = NDX_AUTHORITY_REGION_BENCHMARKS[regionId];
  const runtime = NDX_PILOT_RUNTIME_REGION_MAP[regionId];
  const refBlocks = ref.majorChildBlocks.length;

  const referencePct = 100;
  const visualDetectionPct = pct(runtime.detected.subregionCount, refBlocks);
  const blueprintPct = runtime.blueprint
    ? pct(runtime.blueprint.subregionCount ?? 1, refBlocks)
    : visualDetectionPct;
  const decisionPct = runtime.decision.collapsedToGeneric
    ? Math.min(blueprintPct, 52)
    : runtime.decision.literalReplication
      ? Math.min(blueprintPct, 90)
      : Math.min(blueprintPct, 70);
  const sourcePct = pct(runtime.source.subregionCount, refBlocks);
  const failedAssets = runtime.assets.filter((a) => !a.renderSuccess).length;
  const assetPenalty = failedAssets * 12;
  const renderPct = Math.max(0, sourcePct - assetPenalty);

  const stages: { stage: ReplicationDriftStage; value: number }[] = [
    { stage: 'REFERENCE_INPUT', value: referencePct },
    { stage: 'VISUAL_DETECTION', value: visualDetectionPct },
    { stage: 'AUTHORITY_BLUEPRINT', value: blueprintPct },
    { stage: 'RECONSTRUCTION_DECISION', value: decisionPct },
    { stage: 'SOURCE_GENERATION', value: sourcePct },
    { stage: 'BROWSER_RENDER', value: renderPct },
  ];
  let firstLossStage: ReplicationDriftStage = 'VISUAL_COMPARE';
  for (let i = 1; i < stages.length; i++) {
    if (stages[i]!.value < stages[i - 1]!.value - 5) {
      firstLossStage = stages[i]!.stage;
      break;
    }
  }

  return {
    regionId,
    referencePct,
    visualDetectionPct,
    blueprintPct,
    decisionPct,
    sourcePct,
    renderPct,
    firstLossStage,
  };
}
