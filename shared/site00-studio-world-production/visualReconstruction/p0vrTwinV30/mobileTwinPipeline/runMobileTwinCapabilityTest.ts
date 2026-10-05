import type { DesignPageAuthorityReviewSession } from '../types.js';
import { P0_VR_TWIN_V30R7MF3P1_LINEAGE } from '../constants.js';
import { ensureMobileDesignReferenceAuthority } from './mobileDesignReferenceAuthority.js';
import { buildMobileTwinCompositionState } from './buildMobileTwinCompositionState.js';
import { runMobileCompositionPreflight } from './mobileCompositionPreflight.js';
import { dispatchMobileTwinFalRender } from './dispatchMobileTwinFalRender.js';
import { dispatchMobileTwinFalBlueprintFromComposition } from './dispatchMobileTwinFalBlueprintFromComposition.js';
import { dispatchMobileTwinFalBlueprintFromActualTransform } from './dispatchMobileTwinFalBlueprintFromActualTransform.js';
import { buildTwinCapabilityTestCompositionSnapshot } from './buildTwinCapabilityTestSnapshot.js';
import { buildTwinVisualMatchReceipt } from './twinVisualMatchReceipt.js';
import { classifyLegacyMobileRender } from './mobileRenderClassification.js';
import type { MobileProviderCostRecord } from './types.js';
import type {
  MobileTwinCapabilityTestState,
  TwinFlowACapabilityReceipt,
  TwinFlowBCapabilityReceipt,
} from './twinCapabilityTestTypes.js';

export type CapabilityTestRetry = 'NONE' | 'FLOW_A' | 'FLOW_B';

function appendCost(
  pipeline: NonNullable<DesignPageAuthorityReviewSession['mobileTwinPipeline']>,
  record: MobileProviderCostRecord,
) {
  return {
    ...pipeline,
    providerCostRecords: [...pipeline.providerCostRecords, record],
    totalProviderCostUsd: pipeline.totalProviderCostUsd + record.estimatedCostUsd,
    falJobsDispatched: pipeline.falJobsDispatched + 1,
    desktopJobsDispatched: 0,
  };
}

export function capabilityTestIdempotencyKey(referenceAuthorityId: string, compositionHash: string): string {
  return `capability-test:${referenceAuthorityId}:${compositionHash}`;
}

export async function runMobileTwinCapabilityTest(input: {
  session: DesignPageAuthorityReviewSession;
  publicOrigin?: string;
  retry?: CapabilityTestRetry;
  forceNew?: boolean;
}): Promise<DesignPageAuthorityReviewSession> {
  let session = ensureMobileDesignReferenceAuthority(input.session);
  let pipeline = session.mobileTwinPipeline!;
  const ref = pipeline.designReference!;
  const testId = `r7mf3p1-${Date.now()}`;
  const composition = buildMobileTwinCompositionState({ runId: testId, reference: ref });
  composition.status = 'FROZEN';
  const preflight = runMobileCompositionPreflight({ reference: ref, composition });
  if (!preflight.pass) throw new Error(preflight.errors[0] ?? 'MOBILE_COMPOSITION_STATE_MISSING');

  const snapshot = buildTwinCapabilityTestCompositionSnapshot({ testId, reference: ref, composition });
  const idempotencyKey = capabilityTestIdempotencyKey(ref.id, composition.compositionHash);

  const existing = pipeline.twinCapabilityTest;
  if (
    !input.forceNew &&
    input.retry === 'NONE' &&
    existing?.idempotencyKey === idempotencyKey &&
    existing.status === 'FOUNDER_REVIEW_READY'
  ) {
    return session;
  }

  let canonicalActual = existing?.canonicalActualRenderId ?
    pipeline.renders.find((r) => r.id === existing.canonicalActualRenderId)
  : null;

  if (input.retry !== 'FLOW_A' && input.retry !== 'FLOW_B' && !canonicalActual) {
    const actualRunId = `${testId}-canonical-actual`;
    const actualDispatched = await dispatchMobileTwinFalRender({
      runId: actualRunId,
      reference: ref,
      composition,
      publicOrigin: input.publicOrigin,
    });
    canonicalActual = actualDispatched.render;
    const costRecord: MobileProviderCostRecord = {
      id: `cost-cap-actual-${actualRunId}`,
      kind: 'MOBILE_RENDER',
      providerJobRef: actualDispatched.providerJobRef,
      model: actualDispatched.model,
      estimatedCostUsd: actualDispatched.costUsd,
      createdAt: new Date().toISOString(),
    };
    pipeline = appendCost(pipeline, costRecord);
    pipeline = {
      ...pipeline,
      compositionStates: [...pipeline.compositionStates, composition],
      activeCompositionStateId: composition.id,
      renders: [...pipeline.renders.map(classifyLegacyMobileRender), actualDispatched.render],
      activeRenderId: actualDispatched.render.id,
      artifactsById: {
        ...pipeline.artifactsById,
        [composition.id]: composition,
        [actualDispatched.render.id]: actualDispatched.render,
        ...(actualDispatched.render.referenceTranslationEvidenceReceiptId ?
          { [actualDispatched.render.referenceTranslationEvidenceReceiptId]: actualDispatched.translationEvidence }
        : {}),
      },
    };
  } else if (canonicalActual && input.retry !== 'FLOW_B') {
    composition.id = snapshot.compositionStateId;
  }

  if (!canonicalActual) {
    throw new Error('MOBILE_RENDER_GENERATION_FAILED');
  }

  let flowABlueprint = existing?.flowABlueprintId ?
    pipeline.blueprintTwins.find((b) => b.id === existing.flowABlueprintId)
  : null;
  let flowAReceipt: TwinFlowACapabilityReceipt | null = null;
  let flowACost = 0;

  if (input.retry !== 'FLOW_B' && !flowABlueprint) {
    const blueprintId = `${testId}-flow-a-blueprint`;
    try {
      const bp = await dispatchMobileTwinFalBlueprintFromComposition({
        twinId: blueprintId,
        reference: ref,
        composition,
        siblingActualRenderId: canonicalActual.id,
        publicOrigin: input.publicOrigin,
      });
      flowABlueprint = bp.blueprint;
      flowACost = bp.costUsd;
      const costRecord: MobileProviderCostRecord = {
        id: `cost-cap-flowa-${blueprintId}`,
        kind: 'BLUEPRINT_TWIN',
        providerJobRef: bp.providerJobRef,
        model: bp.model,
        estimatedCostUsd: bp.costUsd,
        createdAt: new Date().toISOString(),
      };
      pipeline = appendCost(pipeline, costRecord);
      flowAReceipt = {
        id: `tfar-${testId}`,
        flowMode: 'TWIN_FLOW_A_ATOMIC_SIBLINGS',
        actualRenderId: canonicalActual.id,
        blueprintRenderId: flowABlueprint.id,
        actualJobId: canonicalActual.providerJobRef,
        blueprintJobId: bp.providerJobRef,
        actualHash: canonicalActual.renderImageHash,
        blueprintHash: flowABlueprint.twinImageHash,
        compositionStateId: composition.id,
        compositionHash: composition.compositionHash,
        provider: 'FAL',
        model: bp.model,
        estimatedCostUsd: flowACost,
        status: 'COMPLETE',
        createdAt: new Date().toISOString(),
      };
      pipeline = {
        ...pipeline,
        blueprintTwins: [...pipeline.blueprintTwins, flowABlueprint],
        artifactsById: { ...pipeline.artifactsById, [flowABlueprint.id]: flowABlueprint, [flowAReceipt.id]: flowAReceipt },
      };
    } catch {
      flowAReceipt = {
        id: `tfar-${testId}`,
        flowMode: 'TWIN_FLOW_A_ATOMIC_SIBLINGS',
        actualRenderId: canonicalActual.id,
        blueprintRenderId: '',
        actualJobId: canonicalActual.providerJobRef,
        blueprintJobId: '',
        actualHash: canonicalActual.renderImageHash,
        blueprintHash: '',
        compositionStateId: composition.id,
        compositionHash: composition.compositionHash,
        provider: 'FAL',
        model: '',
        estimatedCostUsd: 0,
        status: 'FAILED',
        createdAt: new Date().toISOString(),
      };
    }
  }

  let flowBBlueprint = existing?.flowBBlueprintId ?
    pipeline.blueprintTwins.find((b) => b.id === existing.flowBBlueprintId)
  : null;
  let flowBReceipt: TwinFlowBCapabilityReceipt | null = null;

  if (input.retry !== 'FLOW_A' && !flowBBlueprint) {
    const blueprintId = `${testId}-flow-b-blueprint`;
    try {
      const bp = await dispatchMobileTwinFalBlueprintFromActualTransform({
        twinId: blueprintId,
        composition,
        actualRender: canonicalActual,
        publicOrigin: input.publicOrigin,
      });
      flowBBlueprint = bp.blueprint;
      const costRecord: MobileProviderCostRecord = {
        id: `cost-cap-flowb-${blueprintId}`,
        kind: 'BLUEPRINT_TWIN',
        providerJobRef: bp.providerJobRef,
        model: bp.model,
        estimatedCostUsd: bp.costUsd,
        createdAt: new Date().toISOString(),
      };
      pipeline = appendCost(pipeline, costRecord);
      flowBReceipt = {
        id: `tfbr-${testId}`,
        flowMode: 'TWIN_FLOW_B_ACTUAL_TO_BLUEPRINT_TRANSFORM',
        actualSourceRenderId: canonicalActual.id,
        actualHash: canonicalActual.renderImageHash,
        actualJobId: canonicalActual.providerJobRef,
        blueprintRenderId: flowBBlueprint.id,
        blueprintTransformJobId: bp.providerJobRef,
        blueprintHash: flowBBlueprint.twinImageHash,
        compositionStateId: composition.id,
        compositionHash: composition.compositionHash,
        provider: 'FAL',
        model: bp.model,
        estimatedCostUsd: bp.costUsd,
        status: 'COMPLETE',
        createdAt: new Date().toISOString(),
      };
      pipeline = {
        ...pipeline,
        blueprintTwins: [...pipeline.blueprintTwins, flowBBlueprint],
        artifactsById: { ...pipeline.artifactsById, [flowBBlueprint.id]: flowBBlueprint, [flowBReceipt.id]: flowBReceipt },
      };
    } catch {
      flowBReceipt = {
        id: `tfbr-${testId}`,
        flowMode: 'TWIN_FLOW_B_ACTUAL_TO_BLUEPRINT_TRANSFORM',
        actualSourceRenderId: canonicalActual.id,
        actualHash: canonicalActual.renderImageHash,
        actualJobId: canonicalActual.providerJobRef,
        blueprintRenderId: '',
        blueprintTransformJobId: '',
        blueprintHash: '',
        compositionStateId: composition.id,
        compositionHash: composition.compositionHash,
        provider: 'FAL',
        model: '',
        estimatedCostUsd: 0,
        status: 'FAILED',
        createdAt: new Date().toISOString(),
      };
    }
  }

  const flowAReceiptId = flowAReceipt?.id ?? existing?.flowAReceiptId ?? `tfar-${testId}`;
  const flowBReceiptId = flowBReceipt?.id ?? existing?.flowBReceiptId ?? `tfbr-${testId}`;
  const flowAVisualMatchReceiptId = `tvmr-a-${testId}`;
  const flowBVisualMatchReceiptId = `tvmr-b-${testId}`;

  const artifactsById = { ...pipeline.artifactsById, [snapshot.id]: snapshot };
  if (flowABlueprint && flowAReceipt) {
    artifactsById[flowAVisualMatchReceiptId] = buildTwinVisualMatchReceipt({
      id: flowAVisualMatchReceiptId,
      flowId: 'TWIN_FLOW_A_ATOMIC_SIBLINGS',
      actual: canonicalActual,
      blueprint: flowABlueprint,
    });
  }
  if (flowBBlueprint && flowBReceipt) {
    artifactsById[flowBVisualMatchReceiptId] = buildTwinVisualMatchReceipt({
      id: flowBVisualMatchReceiptId,
      flowId: 'TWIN_FLOW_B_ACTUAL_TO_BLUEPRINT_TRANSFORM',
      actual: canonicalActual,
      blueprint: flowBBlueprint,
    });
  }

  const partial = (!flowABlueprint && flowBBlueprint) || (flowABlueprint && !flowBBlueprint);
  const failed = !flowABlueprint && !flowBBlueprint;
  const capabilityTest: MobileTwinCapabilityTestState = {
    testId,
    snapshot,
    actualControlMode: 'SHARED_CANONICAL_ACTUAL',
    canonicalActualRenderId: canonicalActual.id,
    flowABlueprintId: flowABlueprint?.id ?? existing?.flowABlueprintId ?? null,
    flowBBlueprintId: flowBBlueprint?.id ?? existing?.flowBBlueprintId ?? null,
    flowAReceiptId,
    flowBReceiptId,
    flowAVisualMatchReceiptId,
    flowBVisualMatchReceiptId,
    status:
      failed ? 'FAILED'
      : partial ? 'PARTIAL'
      : 'FOUNDER_REVIEW_READY',
    founderDecision: existing?.founderDecision ?? null,
    founderSelectedStrategy: pipeline.mobileTwinVisualGenerationStrategy ?? 'UNRESOLVED',
    idempotencyKey,
    capabilityTestCostUsd:
      (pipeline.totalProviderCostUsd ?? 0) - (session.mobileTwinPipeline?.totalProviderCostUsd ?? 0),
    assetJobsDispatched: 0,
    fullPackageFanoutBlocked: true,
  };

  return {
    ...session,
    mobileTwinPipeline: {
      ...pipeline,
      twinCapabilityTest: capabilityTest,
      mobileTwinVisualGenerationStrategy: pipeline.mobileTwinVisualGenerationStrategy ?? 'UNRESOLVED',
      artifactsById: {
        ...artifactsById,
        ...(flowAReceipt ? { [flowAReceipt.id]: flowAReceipt } : {}),
        ...(flowBReceipt ? { [flowBReceipt.id]: flowBReceipt } : {}),
      },
    },
    updatedAt: new Date().toISOString(),
  };
}

void P0_VR_TWIN_V30R7MF3P1_LINEAGE;
