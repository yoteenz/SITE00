import { resolveTwinBenchmarkModel } from '../../../../site00-visual-generation/twinProviderBenchmarkCatalog.js';
import type { DesignPageAuthorityReviewSession } from '../types.js';
import { dispatchMobileTwinBenchmarkPair } from './dispatchMobileTwinBenchmarkPair.js';
import { classifyLegacyMobileRender } from './mobileRenderClassification.js';
import type { TwinFlowACapabilityReceipt } from './twinCapabilityTestTypes.js';
import type { MobileTwinCompositionState } from './types.js';

/** Ensure GPT2 Flow A actual+blueprint exist with real URIs (Railway FAL). */
export async function ensureMobileTwinFlowAControlPair(input: {
  session: DesignPageAuthorityReviewSession;
  composition: MobileTwinCompositionState;
  runPrefix: string;
  publicOrigin?: string;
  allowBootstrap: boolean;
}): Promise<{ session: DesignPageAuthorityReviewSession; actualId: string; blueprintId: string } | null> {
  let session = input.session;
  let pipeline = session.mobileTwinPipeline!;
  const capTest = pipeline.twinCapabilityTest;
  if (!capTest?.snapshot) return null;

  const resolveIds = (): { actualId: string; blueprintId: string } | null => {
    const bench = pipeline.providerBenchmark;
    if (bench?.baselineActualRenderId && bench.baselineBlueprintRenderId) {
      const actual = pipeline.renders.find((r) => r.id === bench.baselineActualRenderId);
      const blueprint = pipeline.blueprintTwins.find((b) => b.id === bench.baselineBlueprintRenderId);
      if (actual?.renderImageUri && blueprint?.twinImageUri) {
        return { actualId: actual.id, blueprintId: blueprint.id };
      }
    }
    if (capTest.flowABlueprintId && capTest.canonicalActualRenderId) {
      const actual = pipeline.renders.find((r) => r.id === capTest.canonicalActualRenderId);
      const blueprint = pipeline.blueprintTwins.find((b) => b.id === capTest.flowABlueprintId);
      if (actual?.renderImageUri && blueprint?.twinImageUri) {
        return { actualId: actual.id, blueprintId: blueprint.id };
      }
    }
    if (capTest.flowAReceiptId) {
      const flowA = pipeline.artifactsById[capTest.flowAReceiptId] as TwinFlowACapabilityReceipt | undefined;
      if (flowA?.status === 'COMPLETE') {
        const actual = pipeline.renders.find((r) => r.id === flowA.actualRenderId);
        const blueprint = pipeline.blueprintTwins.find((b) => b.id === flowA.blueprintRenderId);
        if (actual?.renderImageUri && blueprint?.twinImageUri) {
          return { actualId: actual.id, blueprintId: blueprint.id };
        }
      }
    }
    return null;
  };

  const existing = resolveIds();
  if (existing) return { session, ...existing };

  if (!input.allowBootstrap) return null;

  const ref = pipeline.designReference!;
  const gpt2Model = resolveTwinBenchmarkModel('GPT2_BASELINE').model;
  const pair = await dispatchMobileTwinBenchmarkPair({
    runPrefix: input.runPrefix,
    model: gpt2Model,
    reference: ref,
    composition: input.composition,
    publicOrigin: input.publicOrigin,
  });

  const flowAReceipt: TwinFlowACapabilityReceipt = {
    id: capTest.flowAReceiptId ?? `tfar-${capTest.testId}`,
    flowMode: 'TWIN_FLOW_A_ATOMIC_SIBLINGS',
    actualRenderId: pair.actual.id,
    blueprintRenderId: pair.blueprint.id,
    actualJobId: pair.actualJobRef,
    blueprintJobId: pair.blueprintJobRef,
    actualHash: pair.actual.renderImageHash,
    blueprintHash: pair.blueprint.twinImageHash,
    compositionStateId: input.composition.id,
    compositionHash: input.composition.compositionHash,
    provider: 'FAL',
    model: pair.model,
    estimatedCostUsd: pair.actualCostUsd + pair.blueprintCostUsd,
    status: 'COMPLETE',
    createdAt: new Date().toISOString(),
  };

  pipeline = {
    ...pipeline,
    renders: [...pipeline.renders.map(classifyLegacyMobileRender), pair.actual],
    blueprintTwins: [...pipeline.blueprintTwins, pair.blueprint],
    twinCapabilityTest: {
      ...capTest,
      canonicalActualRenderId: pair.actual.id,
      flowABlueprintId: pair.blueprint.id,
      flowAReceiptId: flowAReceipt.id,
      status: 'FOUNDER_REVIEW_READY',
    },
    artifactsById: {
      ...pipeline.artifactsById,
      [pair.actual.id]: pair.actual,
      [pair.blueprint.id]: pair.blueprint,
      [flowAReceipt.id]: flowAReceipt,
    },
    falJobsDispatched: pipeline.falJobsDispatched + 2,
    totalProviderCostUsd: pipeline.totalProviderCostUsd + pair.actualCostUsd + pair.blueprintCostUsd,
  };

  session = { ...session, mobileTwinPipeline: pipeline, updatedAt: new Date().toISOString() };
  return { session, actualId: pair.actual.id, blueprintId: pair.blueprint.id };
}
