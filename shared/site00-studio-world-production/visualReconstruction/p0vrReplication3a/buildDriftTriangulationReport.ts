/**
 * P0.VR.REPLICATION.3A — Build full drift triangulation report for NDX pilot session.
 */

import type { ReconstructionTwinSession } from '../p0vrUpgrade2/types.js';
import type { AuthorityShellBlueprint } from '../p0vrReplication2/authorityShellBlueprint.js';
import { NDX_DRIFT_TRACE_REGION_IDS, P0_VR_REPLICATION_3A_BUILD } from './constants.js';
import { NDX_AUTHORITY_REGION_BENCHMARKS } from './ndxRegionBenchmarks.js';
import { NDX_PILOT_RUNTIME_REGION_MAP } from './pilotRuntimeSourceMap.js';
import { classifyDriftLayer } from './replicationDriftClassifier.js';
import { buildRegionLiteralReplicationScore } from './regionLiteralReplicationScore.js';
import { buildReplicationImplementationReceipts } from './replicationImplementationReceipt.js';
import { REPLICATION_POLICY_AUDIT_ENTRIES } from './replicationPolicyAudit.js';
import { buildNdxReplicationRuntimeModuleTrace } from './runtimeModuleTrace.js';
import type {
  CulpritRankingEntry,
  DriftTriangulationReport,
  NextReplicationFix,
  RegionDriftPipelineView,
  RegionReplicationDiff,
  ReplicationDecisionTrace,
  ReplicationFailureLayer,
  VisualProviderAudit,
} from './types.js';

function buildVisualProviderAudit(): VisualProviderAudit {
  return {
    provider: 'NONE_IN_REPLICATION_HOT_PATH',
    model: 'pageRegionLayoutProfile-heuristic',
    inputDimensions: 'authority PNG not passed to vision model on REPLICATE',
    cropStrategy: 'n/a — profile normalized Y/height only',
    instructionClass: 'DESCRIBE/INTERPRET (not LITERAL_SEGMENT)',
    outputSchema: 'PageRegionLayoutProfile regions',
    latencyMs: null,
    errorOrFallback: 'Fallback to static layout profile instead of authority CV',
    confidence: 'LOW for internal hero structure',
    calledInReplicationPath: false,
  };
}

function buildRegionDiff(regionId: string): RegionReplicationDiff {
  const ref = NDX_AUTHORITY_REGION_BENCHMARKS[regionId as keyof typeof NDX_AUTHORITY_REGION_BENCHMARKS];
  const runtime = NDX_PILOT_RUNTIME_REGION_MAP[regionId as keyof typeof NDX_PILOT_RUNTIME_REGION_MAP];
  const assetFail = runtime.assets.some((a) => !a.renderSuccess);
  const internalMatch =
    runtime.source.subregionCount >= ref.majorChildBlocks.length * 0.75 &&
    !runtime.decision.collapsedToGeneric;
  return {
    regionId,
    referenceCrop: `authority:${regionId}`,
    renderCrop: `twin:${runtime.source.selectorOrClass}`,
    macroMatch: !runtime.decision.collapsedToGeneric,
    internalStructureMatch: internalMatch,
    assetMatch: !assetFail,
    surfaceMatch: regionId !== 'hero-editorial',
    typographyMatch: regionId !== 'project-masthead',
    driftSeverity:
      regionId === 'hero-editorial' || assetFail
        ? 'HIGH'
        : runtime.decision.collapsedToGeneric
          ? 'MEDIUM'
          : 'LOW',
    highestImpactDifference:
      regionId === 'hero-editorial'
        ? 'Authority multi-slice hero + lime graphic collapsed to single media frame'
        : runtime.decision.notes,
  };
}

function buildPipelineView(trace: ReplicationDecisionTrace): RegionDriftPipelineView {
  const stageStatus = (stage: string, ok: boolean) =>
    ok ? ('PASS' as const) : stage === 'RECONSTRUCTION_DECISION' || stage === 'SOURCE_GENERATION' ? ('DRIFT' as const) : ('FAIL' as const);

  const detOk = trace.detectedRegion.subregionCount >= 2;
  const bpOk = trace.blueprintRegion != null && trace.blueprintRegion.genericness !== 'GENERIC';
  const decOk = !trace.decision.collapsedToGeneric;
  const srcOk = trace.generatedSourceTarget.subregionCount >= trace.detectedRegion.subregionCount;
  const renderOk = trace.assetBindings.every((a) => a.renderSuccess);

  return {
    regionId: trace.regionId,
    stages: [
      { stage: 'REFERENCE_INPUT', status: 'PASS', summary: `${trace.referenceRegion.majorChildBlocks.length} child blocks` },
      {
        stage: 'VISUAL_DETECTION',
        status: stageStatus('VISUAL_DETECTION', detOk),
        summary: trace.detectedRegion.summary,
      },
      {
        stage: 'AUTHORITY_BLUEPRINT',
        status: stageStatus('AUTHORITY_BLUEPRINT', bpOk),
        summary: trace.blueprintRegion?.geometry ?? 'missing',
      },
      {
        stage: 'RECONSTRUCTION_DECISION',
        status: stageStatus('RECONSTRUCTION_DECISION', decOk),
        summary: trace.decision.notes,
      },
      {
        stage: 'SOURCE_GENERATION',
        status: stageStatus('SOURCE_GENERATION', srcOk),
        summary: trace.generatedSourceTarget.elementSummary,
      },
      {
        stage: 'ASSET_BINDING',
        status: trace.assetBindings.some((a) => !a.renderSuccess) ? 'DRIFT' : 'PASS',
        summary: `${trace.assetBindings.filter((a) => a.renderSuccess).length}/${trace.assetBindings.length} slots ok`,
      },
      {
        stage: 'BROWSER_RENDER',
        status: renderOk ? 'PASS' : 'DRIFT',
        summary: trace.renderedRegion.computedStylesSummary,
      },
    ],
    culpritLayer: trace.failureLayer,
  };
}

function rankCulprits(traces: ReplicationDecisionTrace[]): CulpritRankingEntry[] {
  const counts = new Map<ReplicationFailureLayer, { regions: string[]; evidence: number }>();
  for (const t of traces) {
    const cur = counts.get(t.failureLayer) ?? { regions: [], evidence: 0 };
    cur.regions.push(t.regionId);
    cur.evidence += t.evidence.length;
    counts.set(t.failureLayer, cur);
  }
  const entries: CulpritRankingEntry[] = [...counts.entries()].map(([layer, data]) => ({
    layer,
    severity:
      layer === 'EXECUTION_POLICY' || layer === 'VISUAL_INTELLIGENCE' || layer === 'SOURCE_GENERATION'
        ? 'HIGH'
        : 'MEDIUM',
    confidence: layer === 'VISUAL_INTELLIGENCE' || layer === 'EXECUTION_POLICY' ? 'HIGH' : 'MEDIUM',
    evidenceCount: data.evidence,
    affectedRegions: data.regions,
  }));
  entries.sort((a, b) => b.evidenceCount - a.evidenceCount || b.affectedRegions.length - a.affectedRegions.length);
  return entries;
}

function resolveNextFix(primary: ReplicationFailureLayer): NextReplicationFix {
  switch (primary) {
    case 'VISUAL_INTELLIGENCE':
      return 'UPGRADE_VISUAL_MODEL';
    case 'EXECUTION_POLICY':
      return 'CHANGE_EXECUTION_POLICY';
    case 'SOURCE_GENERATION':
      return 'FIX_SOURCE_GENERATOR';
    case 'ASSET_BINDING':
      return 'FIX_ASSET_BINDING';
    case 'ORCHESTRATION':
      return 'WIRE_CORRECT_MODULE';
    case 'IMPLEMENTATION':
      return 'WIRE_CORRECT_MODULE';
    case 'RENDERING':
      return 'FIX_RENDERER';
    default:
      return 'MULTI_LAYER_FIX';
  }
}

export function buildDriftTriangulationReport(input: {
  session: ReconstructionTwinSession;
  shellBlueprint: AuthorityShellBlueprint;
  replicationMode: boolean;
}): DriftTriangulationReport {
  const createdAt = new Date().toISOString();
  const traces: ReplicationDecisionTrace[] = NDX_DRIFT_TRACE_REGION_IDS.map((regionId) => {
    const referenceRegion = NDX_AUTHORITY_REGION_BENCHMARKS[regionId];
    const runtime = NDX_PILOT_RUNTIME_REGION_MAP[regionId];
    const assetMissing = runtime.assets.some((a) => !a.renderSuccess);
    const classified = classifyDriftLayer({
      reference: referenceRegion,
      detected: runtime.detected,
      blueprint: runtime.blueprint,
      decision: runtime.decision,
      source: runtime.source,
      assetMissing,
      renderMismatch: regionId === 'hero-editorial' || assetMissing,
    });
    return {
      traceId: `rdt_${input.session.sessionId}_${regionId}`,
      sessionId: input.session.sessionId,
      pageId: input.session.pageId,
      viewport: input.session.viewport,
      regionId,
      referenceRegion,
      detectedRegion: runtime.detected,
      blueprintRegion: runtime.blueprint,
      decision: runtime.decision,
      generatedSourceTarget: runtime.source,
      assetBindings: runtime.assets,
      renderedRegion: runtime.render,
      driftStage: classified.stage,
      failureLayer: classified.layer,
      confidence: regionId === 'hero-editorial' ? 'HIGH' : 'MEDIUM',
      evidence: classified.evidence,
      createdAt,
    };
  });

  const literalScores = NDX_DRIFT_TRACE_REGION_IDS.map((id) => buildRegionLiteralReplicationScore(id));
  const regionDiffs = NDX_DRIFT_TRACE_REGION_IDS.map((id) => buildRegionDiff(id));
  const culpritRanking = rankCulprits(traces);
  const primaryRootCause = culpritRanking[0]?.layer ?? 'EXECUTION_POLICY';
  const secondaryRootCause = culpritRanking[1]?.layer ?? 'SOURCE_GENERATION';

  return {
    reportId: `dtr_${input.session.sessionId}_${Date.now()}`,
    sessionId: input.session.sessionId,
    pageId: input.session.pageId,
    viewport: input.session.viewport,
    authorityVersionId: input.session.authorityVersionId,
    twinRenderMode: input.session.twinRenderMode ?? 'SHELL_FIRST_NDX_OVERVIEW',
    buildRef: P0_VR_REPLICATION_3A_BUILD,
    traces,
    regionDiffs,
    literalScores,
    implementationReceipts: buildReplicationImplementationReceipts({
      replicationMode: input.replicationMode,
    }),
    runtimeModuleTrace: buildNdxReplicationRuntimeModuleTrace({
      replicationMode: input.replicationMode,
      shellFirstExecuted: true,
      visionProviderCalled: false,
    }),
    visualProviderAudit: buildVisualProviderAudit(),
    policyAudit: REPLICATION_POLICY_AUDIT_ENTRIES,
    regionPipelineViews: traces.map(buildPipelineView),
    culpritRanking,
    primaryRootCause,
    secondaryRootCause,
    nextReplicationFix: resolveNextFix(primaryRootCause),
    promotionReady: false,
    hotfixApplied: false,
    hotfixNotes: null,
    createdAt,
  };
}
