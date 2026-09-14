import type { MobileTwinPipelineState } from './types.js';

/** Keep visual pair + package pointers aligned with the active atomic run blueprint (post retry). */
export function syncActiveBlueprintReviewMount(pipeline: MobileTwinPipelineState): MobileTwinPipelineState {
  const run =
    pipeline.activeAtomicRunId ?
      pipeline.atomicRuns.find((r) => r.id === pipeline.activeAtomicRunId)
    : pipeline.atomicRuns.at(-1) ?? null;
  if (!run?.blueprintRenderArtifactId) return pipeline;

  const blueprintId = run.blueprintRenderArtifactId;
  const blueprint = pipeline.blueprintTwins.find((b) => b.id === blueprintId);
  if (!blueprint?.twinImageUri) return pipeline;

  const visualPairs = pipeline.visualPairs.map((p) => {
    if (p.atomicRunId !== run.id && p.id !== run.visualPairId) return p;
    return {
      ...p,
      blueprintRenderId: blueprintId,
      blueprintRenderHash: blueprint.twinImageHash,
      status:
        blueprint.blueprintStyleStatus === 'PASS' || blueprint.blueprintStyleStatus === undefined ?
          ('FOUNDER_REVIEW_READY' as const)
        : p.status,
    };
  });

  const packages = pipeline.packages.map((pkg) => {
    if (pkg.id !== pipeline.latestPackageId && pkg.id !== run.packageId) return pkg;
    return { ...pkg, blueprintTwinVisualId: blueprintId };
  });

  const blueprintTwins = pipeline.blueprintTwins.map((bp) => {
    if (bp.id === blueprintId) {
      if (bp.blueprintStyleStatus === 'PASS' && bp.blueprintVisualVariant !== 'ACTIVE_BLUEPRINT_TWIN') {
        return { ...bp, blueprintVisualVariant: 'ACTIVE_BLUEPRINT_TWIN' as const };
      }
      return bp;
    }
    if (bp.implementationRenderId === blueprint.implementationRenderId && bp.id !== blueprintId && bp.twinImageUri) {
      if (bp.blueprintVisualVariant === 'ACTIVE_BLUEPRINT_TWIN' || bp.blueprintVisualVariant === 'CANONICAL_LIGHT') {
        return { ...bp, blueprintVisualVariant: 'HISTORICAL_BLUEPRINT_VARIANT' as const };
      }
    }
    return bp;
  });

  const activeVisualPairId =
    visualPairs.find((p) => p.atomicRunId === run.id)?.id ?? run.visualPairId ?? pipeline.activeVisualPairId;

  return {
    ...pipeline,
    visualPairs,
    packages,
    blueprintTwins,
    activeVisualPairId: activeVisualPairId ?? pipeline.activeVisualPairId,
    activeAtomicRunId: run.id,
  };
}
