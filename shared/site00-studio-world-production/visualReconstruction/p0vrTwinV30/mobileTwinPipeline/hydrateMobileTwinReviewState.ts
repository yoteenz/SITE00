import { syncActiveBlueprintReviewMount } from './syncActiveBlueprintReviewMount.js';
import type { MobileBlueprintTwinVisual, MobileImplementationRender, MobileTwinPipelineState } from './types.js';

export type MobileTwinReviewSlots = {
  actualRender: MobileImplementationRender | null;
  blueprintTwin: MobileBlueprintTwinVisual | null;
  atomicRunId: string | null;
  visualPairId: string | null;
  packageId: string | null;
  falJobCount: number;
  providerCostUsd: number;
};

export function countFalJobsForActiveRun(pipeline: MobileTwinPipelineState): number {
  const runId = pipeline.activeAtomicRunId;
  if (!runId) {
    return pipeline.providerCostRecords?.length ?? pipeline.falJobsDispatched ?? 0;
  }
  const fromRecords =
    pipeline.providerCostRecords?.filter(
      (r) => r.id.includes(runId) || r.providerJobRef.includes(runId.slice(-8)),
    ).length ?? 0;
  if (fromRecords > 0) return fromRecords;
  const run = pipeline.atomicRuns.find((r) => r.id === runId);
  if (run?.costRecords?.length) return run.costRecords.length;
  return pipeline.falJobsDispatched ?? 0;
}

/** Bind review UI to atomic run / visual pair — not stale Phase A or benchmark rows. */
export function resolveMobileTwinReviewSlots(pipeline: MobileTwinPipelineState): MobileTwinReviewSlots {
  const run =
    pipeline.activeAtomicRunId ?
      pipeline.atomicRuns.find((r) => r.id === pipeline.activeAtomicRunId)
    : pipeline.atomicRuns.at(-1) ?? null;

  const pair =
    pipeline.activeVisualPairId ?
      pipeline.visualPairs.find((p) => p.id === pipeline.activeVisualPairId)
    : run?.visualPairId ?
      pipeline.visualPairs.find((p) => p.id === run.visualPairId)
    : null;

  const actualId =
    run?.actualRenderArtifactId ??
    pair?.actualRenderId ??
    pipeline.activeRenderId ??
    null;
  const runBlueprintId = run?.blueprintRenderArtifactId ?? null;
  let blueprintId = runBlueprintId ?? pair?.blueprintRenderId ?? null;

  const actualRender = actualId ? pipeline.renders.find((r) => r.id === actualId) ?? null : null;
  let blueprintTwin = blueprintId ? pipeline.blueprintTwins.find((b) => b.id === blueprintId) ?? null : null;

  if (actualRender) {
    const siblings = pipeline.blueprintTwins.filter(
      (b) => b.implementationRenderId === actualRender.id && b.twinImageUri,
    );
    const mountedFromRun =
      runBlueprintId ? siblings.find((b) => b.id === runBlueprintId) ?? null : null;
    const activeForActual =
      mountedFromRun ??
      siblings.find((b) => b.blueprintVisualVariant === 'ACTIVE_BLUEPRINT_TWIN') ??
      siblings.at(-1) ??
      null;
    if (activeForActual && (!blueprintTwin || blueprintTwin.id !== activeForActual.id)) {
      if (!runBlueprintId || activeForActual.id === runBlueprintId) {
        blueprintTwin = activeForActual;
        blueprintId = activeForActual.id;
      }
    }
  }

  if (!blueprintTwin && actualRender) {
    blueprintTwin =
      pipeline.blueprintTwins.find((b) => b.implementationRenderId === actualRender.id && b.twinImageUri) ??
      null;
  }

  const pkgId = pipeline.latestPackageId ?? run?.packageId ?? null;
  const falJobCount = countFalJobsForActiveRun(pipeline);
  const providerCostUsd =
    pipeline.totalProviderCostUsd > 0 ?
      pipeline.totalProviderCostUsd
    : (pipeline.providerCostRecords?.reduce((s, r) => s + r.estimatedCostUsd, 0) ?? 0);

  return {
    actualRender,
    blueprintTwin,
    atomicRunId: run?.id ?? null,
    visualPairId: pair?.id ?? null,
    packageId: pkgId,
    falJobCount,
    providerCostUsd,
  };
}

/** After merge/reconcile, set activity pointers from latest atomic twin run. */
export function hydrateMobileTwinReviewState(pipeline: MobileTwinPipelineState): MobileTwinPipelineState {
  let next = syncActiveBlueprintReviewMount({ ...pipeline });
  const slots = resolveMobileTwinReviewSlots(next);

  if (slots.actualRender) {
    next.activeRenderId = slots.actualRender.id;
    next.renderGate = 'FOUNDER_REVIEW';
  }
  if (slots.atomicRunId) next.activeAtomicRunId = slots.atomicRunId;
  if (slots.visualPairId) next.activeVisualPairId = slots.visualPairId;
  if (slots.packageId) next.latestPackageId = slots.packageId;

  if (slots.falJobCount > (next.falJobsDispatched ?? 0)) {
    next.falJobsDispatched = slots.falJobCount;
  }

  return next;
}
