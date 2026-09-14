import type { DesignPageAuthorityReviewSession } from '../types.js';
import { P0_VR_TWIN_V30R7MF3P6F1_LINEAGE } from '../constants.js';
import {
  BLUEPRINT_DARK_MODE_VIOLATION,
  classifyBlueprintAsHistoricalVariant,
  HISTORICAL_BLUEPRINT_VARIANT,
} from './blueprintVisualStyleContract.js';
import { assertBlueprintOnlyRetryJobCounts } from './blueprintOnlyRetryGuards.js';
import { assertLockedMobileProviderAvailable } from './getMobileTwinVisualProviderStrategy.js';
import { dispatchMobileTwinFalBlueprintFromComposition } from './dispatchMobileTwinFalBlueprintFromComposition.js';
import { hydrateMobileTwinReviewState } from './hydrateMobileTwinReviewState.js';
import type { MobileBlueprintTwinVisual, MobileProviderCostRecord, MobileTwinPackage } from './types.js';

function markPriorBlueprintsHistorical(
  blueprints: MobileBlueprintTwinVisual[],
  activeBlueprintId: string | null,
): MobileBlueprintTwinVisual[] {
  return blueprints.map((bp) => {
    if (bp.id === activeBlueprintId) {
      return classifyBlueprintAsHistoricalVariant({
        ...bp,
        blueprintVisualVariant: HISTORICAL_BLUEPRINT_VARIANT,
        styleFailureCode: bp.styleFailureCode ?? BLUEPRINT_DARK_MODE_VIOLATION,
        blueprintStyleStatus: bp.blueprintStyleStatus ?? 'REVIEW_REQUIRED',
      });
    }
    if (bp.blueprintVisualVariant === 'ACTIVE_BLUEPRINT_TWIN' || bp.blueprintVisualVariant === 'CANONICAL_LIGHT') {
      return classifyBlueprintAsHistoricalVariant(bp);
    }
    return bp;
  });
}

function updatePackageBlueprintPointer(
  packages: MobileTwinPackage[],
  packageId: string | null,
  blueprintId: string,
  pairReady: boolean,
): MobileTwinPackage[] {
  if (!packageId) return packages;
  return packages.map((pkg) => {
    if (pkg.id !== packageId) return pkg;
    return {
      ...pkg,
      blueprintTwinVisualId: blueprintId,
      status: pairReady ? 'FOUNDER_REVIEW_READY' : pkg.status === 'APPROVED' ? pkg.status : 'FOUNDER_REVIEW_READY',
    };
  });
}

/** Re-dispatch NBP Blueprint only — same atomic run, composition, and Actual sibling. */
export async function runMobileBlueprintOnlyRetry(input: {
  session: DesignPageAuthorityReviewSession;
  publicOrigin?: string;
}): Promise<DesignPageAuthorityReviewSession> {
  const session = input.session;
  const pipeline = session.mobileTwinPipeline;
  if (!pipeline?.designReference) throw new Error('MOBILE_REFERENCE_MISSING');

  assertLockedMobileProviderAvailable(pipeline);

  const atomicRun =
    pipeline.activeAtomicRunId ?
      pipeline.atomicRuns.find((r) => r.id === pipeline.activeAtomicRunId)
    : pipeline.atomicRuns.at(-1);
  if (!atomicRun?.actualRenderJobId) throw new Error('MOBILE_RENDER_GENERATION_FAILED');
  if (atomicRun.actualStatus !== 'READY' && atomicRun.actualStatus !== undefined) {
    throw new Error('MOBILE_RENDER_GENERATION_FAILED');
  }

  const composition = pipeline.compositionStates.find((c) => c.id === atomicRun.compositionStateId);
  if (!composition || composition.compositionHash !== atomicRun.compositionHash) {
    throw new Error('MOBILE_COMPOSITION_STATE_MISSING');
  }
  if (composition.status !== 'FROZEN' && composition.status !== 'RECONCILED') {
    throw new Error('MOBILE_COMPOSITION_STATE_MISSING');
  }

  const pair = pipeline.visualPairs.find((p) => p.atomicRunId === atomicRun.id);
  const actualRenderId = pair?.actualRenderId ?? atomicRun.actualRenderArtifactId;
  const actual =
    (actualRenderId ? pipeline.renders.find((r) => r.id === actualRenderId) : null) ??
    pipeline.renders.find(
      (r) =>
        r.compositionStateId === atomicRun.compositionStateId &&
        r.compositionHash === atomicRun.compositionHash &&
        Boolean(r.renderImageUri),
    );
  if (!actual?.renderImageUri) throw new Error('MOBILE_RENDER_GENERATION_FAILED');

  const priorBlueprintId = pair?.blueprintRenderId ?? atomicRun.blueprintRenderArtifactId ?? null;
  const blueprintTwinsHistorical = markPriorBlueprintsHistorical(pipeline.blueprintTwins, priorBlueprintId);

  const twinId = `${atomicRun.id}-blueprint-light-retry-${Date.now()}`;
  assertBlueprintOnlyRetryJobCounts({ actualJobs: 0, blueprintJobs: 1 });

  const dispatched = await dispatchMobileTwinFalBlueprintFromComposition({
    twinId,
    reference: pipeline.designReference,
    composition,
    siblingActualRenderId: actual.id,
    publicOrigin: input.publicOrigin,
    pipeline: { ...pipeline, blueprintTwins: blueprintTwinsHistorical },
  });

  const stylePass = dispatched.blueprint.blueprintStyleStatus === 'PASS';
  const pairReady = stylePass;

  const nextPair =
    pair ?
      {
        ...pair,
        blueprintRenderId: dispatched.blueprint.id,
        blueprintRenderHash: dispatched.blueprint.twinImageHash,
        status: pairReady ? ('FOUNDER_REVIEW_READY' as const) : ('BLOCKED' as const),
      }
    : null;

  const nextAtomicRun = {
    ...atomicRun,
    blueprintRenderJobId: dispatched.providerJobRef,
    blueprintRenderArtifactId: dispatched.blueprint.id,
    blueprintStatus: stylePass ? ('READY' as const) : ('FAILED' as const),
    status: pairReady ? ('FOUNDER_REVIEW_READY' as const) : ('PARTIAL' as const),
    errorCodes:
      stylePass ? atomicRun.errorCodes.filter((c) => c !== BLUEPRINT_DARK_MODE_VIOLATION)
      : [...new Set([...atomicRun.errorCodes, BLUEPRINT_DARK_MODE_VIOLATION])],
    providerMetadata: {
      ...atomicRun.providerMetadata,
      blueprintModel: dispatched.model,
      lineage: P0_VR_TWIN_V30R7MF3P6F1_LINEAGE,
    },
  };

  const costRecord: MobileProviderCostRecord = {
    id: `cost-blueprint-retry-${twinId}`,
    kind: 'BLUEPRINT_TWIN',
    providerJobRef: dispatched.providerJobRef,
    model: dispatched.model,
    estimatedCostUsd: dispatched.costUsd,
    createdAt: new Date().toISOString(),
  };

  const packages = updatePackageBlueprintPointer(
    pipeline.packages,
    atomicRun.packageId ?? pipeline.latestPackageId,
    dispatched.blueprint.id,
    pairReady,
  );

  const nextPipeline = hydrateMobileTwinReviewState({
    ...pipeline,
    falJobsDispatched: pipeline.falJobsDispatched + 1,
    desktopJobsDispatched: 0,
    totalProviderCostUsd: pipeline.totalProviderCostUsd + dispatched.costUsd,
    providerCostRecords: [...pipeline.providerCostRecords, costRecord],
    blueprintTwins: [...blueprintTwinsHistorical, dispatched.blueprint],
    visualPairs: nextPair ? pipeline.visualPairs.map((p) => (p.id === nextPair.id ? nextPair : p)) : pipeline.visualPairs,
    atomicRuns: pipeline.atomicRuns.map((r) => (r.id === atomicRun.id ? nextAtomicRun : r)),
    packages,
    artifactsById: {
      ...pipeline.artifactsById,
      [dispatched.blueprint.id]: dispatched.blueprint,
      [dispatched.styleReceipt.id]: dispatched.styleReceipt,
      [atomicRun.id]: nextAtomicRun,
      [`lineage-${P0_VR_TWIN_V30R7MF3P6F1_LINEAGE}`]: { sprint: P0_VR_TWIN_V30R7MF3P6F1_LINEAGE, at: new Date().toISOString() },
    },
  });

  return {
    ...session,
    mobileTwinPipeline: nextPipeline,
    updatedAt: new Date().toISOString(),
  };
}
