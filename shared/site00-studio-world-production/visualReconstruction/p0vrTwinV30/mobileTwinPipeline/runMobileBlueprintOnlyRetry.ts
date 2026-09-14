import type { DesignPageAuthorityReviewSession } from '../types.js';
import { assertLockedMobileProviderAvailable } from './getMobileTwinVisualProviderStrategy.js';
import { dispatchMobileTwinFalBlueprintFromComposition } from './dispatchMobileTwinFalBlueprintFromComposition.js';
import type { MobileProviderCostRecord } from './types.js';

/** Re-dispatch NBP Blueprint only — same composition + Actual sibling (style failure path). */
export async function runMobileBlueprintOnlyRetry(input: {
  session: DesignPageAuthorityReviewSession;
  publicOrigin?: string;
}): Promise<DesignPageAuthorityReviewSession> {
  const session = input.session;
  const pipeline = session.mobileTwinPipeline;
  if (!pipeline?.designReference) throw new Error('MOBILE_REFERENCE_MISSING');

  assertLockedMobileProviderAvailable(pipeline);

  const atomicRun = pipeline.activeAtomicRunId ?
    pipeline.atomicRuns.find((r) => r.id === pipeline.activeAtomicRunId)
  : pipeline.atomicRuns.at(-1);
  if (!atomicRun?.actualRenderJobId) throw new Error('MOBILE_RENDER_GENERATION_FAILED');

  const pair = pipeline.visualPairs.find((p) => p.atomicRunId === atomicRun.id);
  const actual =
    (pair ? pipeline.renders.find((r) => r.id === pair.actualRenderId) : null) ??
    pipeline.renders.find(
      (r) =>
        r.compositionStateId === atomicRun.compositionStateId &&
        r.compositionHash === atomicRun.compositionHash &&
        Boolean(r.renderImageUri),
    ) ??
    pipeline.renders.find((r) => r.id === pipeline.activeRenderId);
  if (!actual?.renderImageUri) throw new Error('MOBILE_RENDER_GENERATION_FAILED');

  const composition = pipeline.compositionStates.find((c) => c.id === actual.compositionStateId);
  if (!composition || composition.compositionHash !== actual.compositionHash) {
    throw new Error('MOBILE_COMPOSITION_STATE_MISSING');
  }

  const twinId = `${atomicRun.id}-blueprint-retry-${Date.now()}`;
  const dispatched = await dispatchMobileTwinFalBlueprintFromComposition({
    twinId,
    reference: pipeline.designReference,
    composition,
    siblingActualRenderId: actual.id,
    publicOrigin: input.publicOrigin,
    pipeline,
  });

  const costRecord: MobileProviderCostRecord = {
    id: `cost-blueprint-retry-${twinId}`,
    kind: 'BLUEPRINT_TWIN',
    providerJobRef: dispatched.providerJobRef,
    model: dispatched.model,
    estimatedCostUsd: dispatched.costUsd,
    createdAt: new Date().toISOString(),
  };

  const visualPair = pipeline.visualPairs.find((p) => p.atomicRunId === atomicRun.id);
  const nextPair =
    visualPair ?
      {
        ...visualPair,
        blueprintRenderId: dispatched.blueprint.id,
        blueprintRenderHash: dispatched.blueprint.twinImageHash,
        status:
          dispatched.blueprint.blueprintStyleStatus === 'PASS' ?
            ('FOUNDER_REVIEW_READY' as const)
          : ('BLOCKED' as const),
      }
    : null;

  return {
    ...session,
    mobileTwinPipeline: {
      ...pipeline,
      falJobsDispatched: pipeline.falJobsDispatched + 1,
      desktopJobsDispatched: 0,
      totalProviderCostUsd: pipeline.totalProviderCostUsd + dispatched.costUsd,
      providerCostRecords: [...pipeline.providerCostRecords, costRecord],
      blueprintTwins: [...pipeline.blueprintTwins, dispatched.blueprint],
      visualPairs: nextPair ?
        pipeline.visualPairs.map((p) => (p.id === nextPair.id ? nextPair : p))
      : pipeline.visualPairs,
      artifactsById: {
        ...pipeline.artifactsById,
        [dispatched.blueprint.id]: dispatched.blueprint,
        [dispatched.styleReceipt.id]: dispatched.styleReceipt,
      },
    },
    updatedAt: new Date().toISOString(),
  };
}
