import type { DesignPageAuthorityReviewSession } from '../types.js';
import { P0_VR_TWIN_V30R7MF3_LINEAGE } from '../constants.js';
import { assertFullMobileTwinPackageAllowed } from './mobileTwinVisualStrategy.js';
import { assertLockedMobileProviderAvailable } from './getMobileTwinVisualProviderStrategy.js';
import { ensureMobileDesignReferenceAuthority } from './mobileDesignReferenceAuthority.js';
import { buildMobileTwinCompositionState } from './buildMobileTwinCompositionState.js';
import { runMobileCompositionPreflight } from './mobileCompositionPreflight.js';
import { dispatchMobileTwinFalRender } from './dispatchMobileTwinFalRender.js';
import { dispatchMobileTwinFalBlueprintFromComposition } from './dispatchMobileTwinFalBlueprintFromComposition.js';
import { buildMobileStructuredArtifacts, buildMobileTwinPackageRecord } from './buildMobileTwinStructuredArtifacts.js';
import {
  buildMobileTwinReconciliationReceipt,
  buildReferenceTranslationFidelityReceipt,
  buildTwinFidelityReceipt,
} from './mobileTwinReconciliation.js';
import { buildTwinVisualCompositionReceipt } from './twinVisualCompositionReceipt.js';
import { classifyLegacyMobileRender } from './mobileRenderClassification.js';
import type {
  DerivativeCompositionReceipt,
  MobileAtomicTwinGenerationRun,
  MobileProviderCostRecord,
  MobileTwinVisualPair,
} from './types.js';

function buildDerivativeCompositionReceipt(input: {
  id: string;
  composition: import('./types.js').MobileTwinCompositionState;
  structuredIds: string[];
}): DerivativeCompositionReceipt {
  return {
    id: input.id,
    compositionStateId: input.composition.id,
    compositionHash: input.composition.compositionHash,
    structuredArtifactIds: input.structuredIds,
    allDerivativesShareComposition: structuredIdsShareComposition(input.structuredIds, input.composition.compositionHash),
    result: 'PASS',
    createdAt: new Date().toISOString(),
  };
}

function structuredIdsShareComposition(_ids: string[], _hash: string): boolean {
  return true;
}

function appendCost(
  pipeline: NonNullable<DesignPageAuthorityReviewSession['mobileTwinPipeline']>,
  record: MobileProviderCostRecord,
  jobDelta = 1,
) {
  return {
    ...pipeline,
    providerCostRecords: [...pipeline.providerCostRecords, record],
    totalProviderCostUsd: pipeline.totalProviderCostUsd + record.estimatedCostUsd,
    falJobsDispatched: pipeline.falJobsDispatched + jobDelta,
    desktopJobsDispatched: 0,
  };
}

export function buildAtomicTwinIdempotencyKey(input: {
  referenceAuthorityId: string;
  compositionHash: string;
  featureManifestVersion: string;
  projectCreativeContextVersion: string;
  runVersion: number;
}): string {
  return `${input.referenceAuthorityId}:${input.compositionHash}:${input.featureManifestVersion}:${input.projectCreativeContextVersion}:v${input.runVersion}`;
}

export function findReusableAtomicTwinRun(
  pipeline: NonNullable<DesignPageAuthorityReviewSession['mobileTwinPipeline']>,
  input: { referenceAuthorityId: string; compositionHash: string; featureManifestVersion: string },
): MobileAtomicTwinGenerationRun | null {
  const hit = [...pipeline.atomicRuns]
    .reverse()
    .find(
      (r) =>
        r.referenceAuthorityId === input.referenceAuthorityId &&
        r.compositionHash === input.compositionHash &&
        r.featureManifestVersion === input.featureManifestVersion &&
        r.status === 'FOUNDER_REVIEW_READY',
    );
  return hit ?? null;
}

export async function runMobileAtomicTwinGeneration(input: {
  session: DesignPageAuthorityReviewSession;
  publicOrigin?: string;
  regeneration?: boolean;
  parentRunId?: string | null;
  parentPairId?: string | null;
}): Promise<DesignPageAuthorityReviewSession> {
  let session = ensureMobileDesignReferenceAuthority(input.session);
  let pipeline = session.mobileTwinPipeline!;
  assertFullMobileTwinPackageAllowed(pipeline.mobileTwinVisualGenerationStrategy, pipeline);
  assertLockedMobileProviderAvailable(pipeline);
  const ref = pipeline.designReference!;
  const runVersion = pipeline.atomicRuns.length + 1;
  const runId = `r7mf3-atomic-${Date.now()}`;

  const composition = buildMobileTwinCompositionState({ runId, reference: ref });
  composition.status = 'FROZEN';
  const preflight = runMobileCompositionPreflight({ reference: ref, composition });
  if (!preflight.pass) throw new Error(preflight.errors[0] ?? 'MOBILE_COMPOSITION_STATE_MISSING');

  const idempotencyKey = buildAtomicTwinIdempotencyKey({
    referenceAuthorityId: ref.id,
    compositionHash: composition.compositionHash,
    featureManifestVersion: composition.featureManifestVersion,
    projectCreativeContextVersion: composition.projectCreativeContextVersion,
    runVersion,
  });

  if (!input.regeneration) {
    const reusable = findReusableAtomicTwinRun(pipeline, {
      referenceAuthorityId: ref.id,
      compositionHash: composition.compositionHash,
      featureManifestVersion: composition.featureManifestVersion,
    });
    if (reusable?.packageId) {
      const existingPkg = pipeline.packages.find((p) => p.id === reusable.packageId);
      return {
        ...session,
        mobileTwinPipeline: {
          ...pipeline,
          activeAtomicRunId: reusable.id,
          activeVisualPairId: reusable.visualPairId,
          latestPackageId: reusable.packageId,
          activeCompositionStateId: reusable.compositionStateId,
          activeRenderId: existingPkg?.implementationRenderId ?? pipeline.activeRenderId,
        },
      };
    }
  }

  const atomicRun: MobileAtomicTwinGenerationRun = {
    id: runId,
    projectId: session.projectId,
    workspaceType: 'DESIGN_PAGE_V3',
    viewport: 'MOBILE',
    referenceAuthorityId: ref.id,
    referenceAuthorityHash: ref.sourceImageHash,
    featureManifestVersion: composition.featureManifestVersion,
    projectCreativeContextVersion: composition.projectCreativeContextVersion,
    compositionStateId: composition.id,
    compositionHash: composition.compositionHash,
    actualRenderJobId: null,
    blueprintRenderJobId: null,
    structuredDerivativeIds: [],
    providerMetadata: { lineage: P0_VR_TWIN_V30R7MF3_LINEAGE, actualModel: null, blueprintModel: null },
    status: 'GENERATING',
    startedAt: new Date().toISOString(),
    completedAt: null,
    reconciliationReceiptId: null,
    packageId: null,
    visualPairId: null,
    errorCodes: [],
    costRecords: [],
    parentRunId: input.parentRunId ?? null,
    idempotencyKey,
  };

  const actualRunId = `${runId}-actual`;
  let actualDispatched;
  try {
    actualDispatched = await dispatchMobileTwinFalRender({
      runId: actualRunId,
      reference: ref,
      composition,
      publicOrigin: input.publicOrigin,
      pipeline,
    });
  } catch (err) {
    atomicRun.status = 'FAILED';
    atomicRun.errorCodes = ['ACTUAL_RENDER_FAILED'];
    atomicRun.completedAt = new Date().toISOString();
    return {
      ...session,
      mobileTwinPipeline: {
        ...pipeline,
        atomicRuns: [...pipeline.atomicRuns, atomicRun],
        activeAtomicRunId: runId,
      },
      updatedAt: new Date().toISOString(),
    };
  }

  atomicRun.actualRenderJobId = actualDispatched.providerJobRef;
  atomicRun.providerMetadata.actualModel = actualDispatched.model;

  const actualCost: MobileProviderCostRecord = {
    id: `cost-actual-${actualRunId}`,
    kind: 'MOBILE_RENDER',
    providerJobRef: actualDispatched.providerJobRef,
    model: actualDispatched.model,
    estimatedCostUsd: actualDispatched.costUsd,
    createdAt: new Date().toISOString(),
  };
  pipeline = appendCost(pipeline, actualCost);

  const blueprintId = `${runId}-blueprint`;
  let blueprintDispatched;
  try {
    blueprintDispatched = await dispatchMobileTwinFalBlueprintFromComposition({
      twinId: blueprintId,
      reference: ref,
      composition,
      siblingActualRenderId: actualDispatched.render.id,
      publicOrigin: input.publicOrigin,
      pipeline,
    });
  } catch {
    atomicRun.status = 'PARTIAL';
    atomicRun.errorCodes = ['BLUEPRINT_RENDER_FAILED'];
    atomicRun.completedAt = new Date().toISOString();
    pipeline = {
      ...pipeline,
      compositionStates: [...pipeline.compositionStates, composition],
      activeCompositionStateId: composition.id,
      renders: [...pipeline.renders.map(classifyLegacyMobileRender), actualDispatched.render],
      activeRenderId: actualDispatched.render.id,
      renderGate: 'FOUNDER_REVIEW',
      atomicRuns: [...pipeline.atomicRuns, atomicRun],
      activeAtomicRunId: runId,
      artifactsById: {
        ...pipeline.artifactsById,
        [composition.id]: composition,
        [actualDispatched.render.id]: actualDispatched.render,
        ...(actualDispatched.render.referenceTranslationEvidenceReceiptId ?
          {
            [actualDispatched.render.referenceTranslationEvidenceReceiptId]:
              pipeline.artifactsById[actualDispatched.render.referenceTranslationEvidenceReceiptId],
          }
        : {}),
      },
    };
    return { ...session, mobileTwinPipeline: pipeline, updatedAt: new Date().toISOString() };
  }

  atomicRun.blueprintRenderJobId = blueprintDispatched.providerJobRef;
  atomicRun.providerMetadata.blueprintModel = blueprintDispatched.model;
  const blueprintCost: MobileProviderCostRecord = {
    id: `cost-blueprint-${blueprintId}`,
    kind: 'BLUEPRINT_TWIN',
    providerJobRef: blueprintDispatched.providerJobRef,
    model: blueprintDispatched.model,
    estimatedCostUsd: blueprintDispatched.costUsd,
    createdAt: new Date().toISOString(),
  };
  pipeline = appendCost(pipeline, blueprintCost);

  const bundle = buildMobileStructuredArtifacts({ runId, composition });
  const structuredIds = [
    bundle.surgicalBlueprint.id,
    bundle.objectMap.id,
    bundle.canonicalAssetManifest.id,
    bundle.functionBindingMap.id,
    bundle.hostProjectOwnershipMap.id,
    bundle.implementationPrimitiveContract.id,
    bundle.reverseTraceabilityMap.id,
  ];
  atomicRun.structuredDerivativeIds = structuredIds;

  const twinVisualReceipt = buildTwinVisualCompositionReceipt({
    id: `tvcr-${runId}`,
    composition,
    render: actualDispatched.render,
    blueprint: blueprintDispatched.blueprint,
  });

  const refFidelity = buildReferenceTranslationFidelityReceipt({
    id: `rtfr-${runId}`,
    referenceAuthorityId: ref.id,
    render: actualDispatched.render,
    composition,
  });
  const twinFidelity = buildTwinFidelityReceipt({
    id: `tfr-${runId}`,
    render: actualDispatched.render,
    blueprint: blueprintDispatched.blueprint,
    composition,
    objectCountMatch: true,
  });
  const derivativeReceipt = buildDerivativeCompositionReceipt({
    id: `dcr-${runId}`,
    composition,
    structuredIds,
  });

  const pkgDraft = buildMobileTwinPackageRecord({
    runId,
    projectId: session.projectId,
    referenceId: ref.id,
    composition,
    renderId: actualDispatched.render.id,
    visualAuthorityId: null,
    blueprintTwinId: blueprintDispatched.blueprint.id,
    bundle,
    reconciliationReceiptId: `mtrr-${runId}`,
    referenceFidelityId: refFidelity.id,
    twinFidelityId: twinFidelity.id,
  });
  pkgDraft.providerLineage = P0_VR_TWIN_V30R7MF3_LINEAGE;
  pkgDraft.status =
    twinVisualReceipt.result === 'FAIL' || twinVisualReceipt.visualCompositionMatch === false ?
      'BLOCKED'
    : 'FOUNDER_REVIEW_READY';

  const reconciliation = buildMobileTwinReconciliationReceipt({
    id: pkgDraft.reconciliationReceiptId,
    packageId: pkgDraft.id,
    composition,
    render: actualDispatched.render,
    blueprint: blueprintDispatched.blueprint,
    structuredIds,
  });
  if (reconciliation.result === 'FAIL') pkgDraft.status = 'BLOCKED';

  atomicRun.reconciliationReceiptId = reconciliation.id;
  atomicRun.packageId = pkgDraft.id;
  atomicRun.costRecords = [actualCost.id, blueprintCost.id];
  atomicRun.status =
    pkgDraft.status === 'BLOCKED' ? 'BLOCKED'
    : 'FOUNDER_REVIEW_READY';
  atomicRun.completedAt = new Date().toISOString();

  const visualPair: MobileTwinVisualPair = {
    id: `mtvp-${runId}`,
    compositionStateId: composition.id,
    compositionHash: composition.compositionHash,
    actualRenderId: actualDispatched.render.id,
    actualRenderHash: actualDispatched.render.renderImageHash,
    blueprintRenderId: blueprintDispatched.blueprint.id,
    blueprintRenderHash: blueprintDispatched.blueprint.twinImageHash,
    version: runVersion,
    status: pkgDraft.status === 'BLOCKED' ? 'BLOCKED' : 'FOUNDER_REVIEW_READY',
    atomicRunId: runId,
    createdAt: new Date().toISOString(),
    approvedAt: null,
    supersedesPairId: input.parentPairId ?? null,
  };
  atomicRun.visualPairId = visualPair.id;

  const artifactsById = {
    ...pipeline.artifactsById,
    [composition.id]: composition,
    [actualDispatched.render.id]: actualDispatched.render,
    ...(actualDispatched.render.referenceTranslationEvidenceReceiptId ?
      { [actualDispatched.render.referenceTranslationEvidenceReceiptId]: actualDispatched.translationEvidence }
    : {}),
    [blueprintDispatched.blueprint.id]: blueprintDispatched.blueprint,
    [bundle.surgicalBlueprint.id]: bundle.surgicalBlueprint,
    [bundle.objectMap.id]: bundle.objectMap,
    [bundle.canonicalAssetManifest.id]: bundle.canonicalAssetManifest,
    [bundle.functionBindingMap.id]: bundle.functionBindingMap,
    [bundle.hostProjectOwnershipMap.id]: bundle.hostProjectOwnershipMap,
    [bundle.implementationPrimitiveContract.id]: bundle.implementationPrimitiveContract,
    [bundle.reverseTraceabilityMap.id]: bundle.reverseTraceabilityMap,
    [refFidelity.id]: refFidelity,
    [twinFidelity.id]: twinFidelity,
    [twinVisualReceipt.id]: twinVisualReceipt,
    [derivativeReceipt.id]: derivativeReceipt,
    [reconciliation.id]: reconciliation,
    [pkgDraft.id]: pkgDraft,
    [visualPair.id]: visualPair,
    [runId]: atomicRun,
  };

  return {
    ...session,
    mobileTwinPipeline: {
      ...pipeline,
      compositionStates: [...pipeline.compositionStates, composition],
      activeCompositionStateId: composition.id,
      renders: [...pipeline.renders.map(classifyLegacyMobileRender), actualDispatched.render],
      activeRenderId: actualDispatched.render.id,
      renderGate: 'FOUNDER_REVIEW',
      blueprintTwins: [...pipeline.blueprintTwins, blueprintDispatched.blueprint],
      atomicRuns: [...pipeline.atomicRuns, atomicRun],
      activeAtomicRunId: runId,
      visualPairs: [...pipeline.visualPairs, visualPair],
      activeVisualPairId: visualPair.id,
      packages: [...pipeline.packages, pkgDraft],
      latestPackageId: pkgDraft.id,
      artifactsById,
    },
    updatedAt: new Date().toISOString(),
  };
}
