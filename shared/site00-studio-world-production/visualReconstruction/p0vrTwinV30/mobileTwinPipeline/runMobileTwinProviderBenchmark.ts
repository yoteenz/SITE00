import type { DesignPageAuthorityReviewSession } from '../types.js';
import { P0_VR_TWIN_V30R7MF3P2_LINEAGE } from '../constants.js';
import {
  resolveTwinBenchmarkModel,
  TWIN_BENCHMARK_CHALLENGERS,
  TWIN_BENCHMARK_VERSION,
  type TwinBenchmarkChallengerSlug,
} from '../../../../site00-visual-generation/twinProviderBenchmarkCatalog.js';
import { ensureMobileDesignReferenceAuthority } from './mobileDesignReferenceAuthority.js';
import {
  buildTwinProviderBenchmarkSnapshot,
  providerBenchmarkIdempotencyKey,
} from './buildTwinProviderBenchmarkSnapshot.js';
import { dispatchMobileTwinBenchmarkPair } from './dispatchMobileTwinBenchmarkPair.js';
import { buildProviderTwinBenchmarkReceipt } from './buildProviderTwinBenchmarkReceipt.js';
import { classifyLegacyMobileRender } from './mobileRenderClassification.js';
import type { TwinFlowACapabilityReceipt } from './twinCapabilityTestTypes.js';
import type {
  MobileTwinProviderBenchmarkState,
  ProviderBenchmarkCostRecord,
  ProviderTwinBenchmarkReceipt,
} from './twinProviderBenchmarkTypes.js';
import type { MobileProviderCostRecord } from './types.js';

export type ProviderBenchmarkRetrySlug = TwinBenchmarkChallengerSlug | 'NONE';

const CHALLENGER_RUN_PREFIX: Record<Exclude<TwinBenchmarkChallengerSlug, 'GPT2_BASELINE'>, string> = {
  NBPRO: 'NBPRO_METHOD_A',
  FLUX2MAX: 'FLUX2MAX_METHOD_A',
  KONTEXTMAX: 'KONTEXTMAX_METHOD_A',
};

function emptyRunRow(providerRunId: string) {
  return {
    providerRunId,
    status: 'NOT_RUN' as const,
    actualRenderId: null,
    blueprintRenderId: null,
    receiptId: null,
    costRecordId: null,
    actualJobId: null,
    blueprintJobId: null,
  };
}

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

function assertMethodALocked(strategy: string | undefined): void {
  if (strategy !== 'ATOMIC_SIBLING_FROM_COMPOSITION') {
    throw new Error('MOBILE_TWIN_PROVIDER_BENCHMARK_REQUIRES_METHOD_A');
  }
}

function resolveFrozenComposition(
  pipeline: NonNullable<DesignPageAuthorityReviewSession['mobileTwinPipeline']>,
  compositionStateId: string,
  compositionHash: string,
) {
  const comp = pipeline.compositionStates.find((c) => c.id === compositionStateId);
  if (!comp) throw new Error('MOBILE_COMPOSITION_STATE_MISSING');
  if (comp.compositionHash !== compositionHash) throw new Error('MOBILE_COMPOSITION_STATE_MISSING');
  return comp;
}

function resolveBaselineFromCapabilityTest(
  pipeline: NonNullable<DesignPageAuthorityReviewSession['mobileTwinPipeline']>,
): { actualId: string; blueprintId: string; model: string } | null {
  const test = pipeline.twinCapabilityTest;
  if (test?.flowABlueprintId && test.canonicalActualRenderId) {
    const actual = pipeline.renders.find((r) => r.id === test.canonicalActualRenderId);
    const blueprint = pipeline.blueprintTwins.find((b) => b.id === test.flowABlueprintId);
    if (actual?.renderImageUri && blueprint?.twinImageUri) {
      return {
        actualId: actual.id,
        blueprintId: blueprint.id,
        model: actual.providerModel || 'openai/gpt-image-2/edit',
      };
    }
  }
  if (!test?.flowAReceiptId) return null;
  const flowA = pipeline.artifactsById[test.flowAReceiptId] as TwinFlowACapabilityReceipt | undefined;
  if (!flowA || flowA.flowMode !== 'TWIN_FLOW_A_ATOMIC_SIBLINGS' || flowA.status !== 'COMPLETE') {
    return null;
  }
  return {
    actualId: flowA.actualRenderId,
    blueprintId: flowA.blueprintRenderId,
    model: flowA.model || 'openai/gpt-image-2/edit',
  };
}

export async function runMobileTwinProviderBenchmark(input: {
  session: DesignPageAuthorityReviewSession;
  publicOrigin?: string;
  retry?: ProviderBenchmarkRetrySlug;
  forceNew?: boolean;
}): Promise<DesignPageAuthorityReviewSession> {
  const retry = input.retry ?? 'NONE';
  let session = ensureMobileDesignReferenceAuthority(input.session);
  let pipeline = session.mobileTwinPipeline!;
  assertMethodALocked(pipeline.mobileTwinVisualGenerationStrategy);

  const capTest = pipeline.twinCapabilityTest;
  if (!capTest?.snapshot) throw new Error('MOBILE_TWIN_CAPABILITY_TEST_MISSING');

  const benchmarkId = pipeline.providerBenchmark?.benchmarkId ?? `r7mf3p2-${Date.now()}`;
  const snapshot = buildTwinProviderBenchmarkSnapshot({
    benchmarkId,
    capabilitySnapshot: capTest.snapshot,
  });
  const composition = resolveFrozenComposition(
    pipeline,
    snapshot.compositionStateId,
    snapshot.compositionHash,
  );

  let baseline = resolveBaselineFromCapabilityTest(pipeline);
  const ref = pipeline.designReference!;
  const gpt2Model = resolveTwinBenchmarkModel('GPT2_BASELINE').model;

  if (!baseline && pipeline.founderManualTwinPathUnlock) {
    const runPrefix = `GPT2_BASELINE_${benchmarkId}`;
    const pair = await dispatchMobileTwinBenchmarkPair({
      runPrefix,
      model: gpt2Model,
      reference: ref,
      composition,
      publicOrigin: input.publicOrigin,
    });
    baseline = { actualId: pair.actual.id, blueprintId: pair.blueprint.id, model: pair.model };
    const testId = capTest.testId;
    const flowAReceipt: TwinFlowACapabilityReceipt = {
      id: capTest.flowAReceiptId ?? `tfar-${testId}`,
      flowMode: 'TWIN_FLOW_A_ATOMIC_SIBLINGS',
      actualRenderId: pair.actual.id,
      blueprintRenderId: pair.blueprint.id,
      actualJobId: pair.actualJobRef,
      blueprintJobId: pair.blueprintJobRef,
      actualHash: pair.actual.renderImageHash,
      blueprintHash: pair.blueprint.twinImageHash,
      compositionStateId: composition.id,
      compositionHash: composition.compositionHash,
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
    session = { ...session, mobileTwinPipeline: pipeline };
  }

  if (!baseline) throw new Error('MOBILE_TWIN_PROVIDER_BASELINE_MISSING');

  const benchmarkIdempotencyKey = providerBenchmarkIdempotencyKey(snapshot.id, 'benchmark', TWIN_BENCHMARK_VERSION);

  const existing = pipeline.providerBenchmark;
  if (
    !input.forceNew &&
    retry === 'NONE' &&
    existing?.idempotencyKey === benchmarkIdempotencyKey &&
    existing.status === 'FOUNDER_REVIEW_READY'
  ) {
    return session;
  }

  const baselineResolution = resolveTwinBenchmarkModel('GPT2_BASELINE');
  let benchmarkState: MobileTwinProviderBenchmarkState = existing ?? {
    benchmarkId,
    snapshot,
    methodLocked: 'ATOMIC_SIBLING_FROM_COMPOSITION',
    baselineActualRenderId: baseline.actualId,
    baselineBlueprintRenderId: baseline.blueprintId,
    baselineModel: baseline.model,
    runs: {
      GPT2_BASELINE: {
        providerRunId: `baseline-${benchmarkId}`,
        status: 'COMPLETE',
        actualRenderId: baseline.actualId,
        blueprintRenderId: baseline.blueprintId,
        receiptId: null,
        costRecordId: null,
        actualJobId: capTest.flowAReceiptId ? (pipeline.artifactsById[capTest.flowAReceiptId] as TwinFlowACapabilityReceipt).actualJobId : null,
        blueprintJobId: capTest.flowAReceiptId ? (pipeline.artifactsById[capTest.flowAReceiptId] as TwinFlowACapabilityReceipt).blueprintJobId : null,
      },
      NBPRO: emptyRunRow(`nbpro-${benchmarkId}`),
      FLUX2MAX: emptyRunRow(`flux2max-${benchmarkId}`),
      KONTEXTMAX: emptyRunRow(`kontextmax-${benchmarkId}`),
    },
    status: 'NOT_STARTED',
    totalNewJobs: 0,
    totalBenchmarkCostUsd: 0,
    idempotencyKey: benchmarkIdempotencyKey,
  };

  benchmarkState = {
    ...benchmarkState,
    snapshot,
    baselineActualRenderId: baseline.actualId,
    baselineBlueprintRenderId: baseline.blueprintId,
    baselineModel: baselineResolution.model,
    methodLocked: 'ATOMIC_SIBLING_FROM_COMPOSITION',
  };

  const slugsToRun =
    retry !== 'NONE' && retry !== 'GPT2_BASELINE' ? [retry] : TWIN_BENCHMARK_CHALLENGERS;

  let newJobs = 0;
  let benchmarkCostDelta = 0;
  const artifactsById = { ...pipeline.artifactsById, [snapshot.id]: snapshot };
  let renders = [...pipeline.renders.map(classifyLegacyMobileRender)];
  let blueprintTwins = [...pipeline.blueprintTwins];

  for (const slug of slugsToRun) {
    if (slug === 'GPT2_BASELINE') continue;

    const resolution = resolveTwinBenchmarkModel(slug);
    const rowKey = slug;
    const prior = benchmarkState.runs[rowKey];
    const rowIdempotency = providerBenchmarkIdempotencyKey(snapshot.id, resolution.model, TWIN_BENCHMARK_VERSION);

    if (!resolution.available) {
      benchmarkState = {
        ...benchmarkState,
        runs: {
          ...benchmarkState.runs,
          [rowKey]: {
            ...prior,
            status: 'UNAVAILABLE',
            providerRunId: prior.providerRunId,
          },
        },
      };
      continue;
    }

    if (
      !input.forceNew &&
      retry === 'NONE' &&
      prior.status === 'COMPLETE' &&
      prior.actualRenderId &&
      prior.blueprintRenderId
    ) {
      continue;
    }

    if (retry !== 'NONE' && retry !== slug) continue;

    benchmarkState = {
      ...benchmarkState,
      runs: {
        ...benchmarkState.runs,
        [rowKey]: { ...prior, status: 'RUNNING' },
      },
      status: 'RUNNING',
    };

    const runPrefix = `${CHALLENGER_RUN_PREFIX[slug]}-${benchmarkId}`;
    try {
      const pair = await dispatchMobileTwinBenchmarkPair({
        runPrefix,
        model: resolution.model,
        reference: ref,
        composition,
        publicOrigin: input.publicOrigin,
        providerSettings: { benchmarkSlug: slug, idempotencyKey: rowIdempotency },
      });

      newJobs += 2;
      benchmarkCostDelta += pair.actualCostUsd + pair.blueprintCostUsd;

      const actualCostRecord: MobileProviderCostRecord = {
        id: `cost-bench-${runPrefix}-actual`,
        kind: 'MOBILE_RENDER',
        providerJobRef: pair.actualJobRef,
        model: pair.model,
        estimatedCostUsd: pair.actualCostUsd,
        createdAt: new Date().toISOString(),
      };
      const blueprintCostRecord: MobileProviderCostRecord = {
        id: `cost-bench-${runPrefix}-blueprint`,
        kind: 'BLUEPRINT_TWIN',
        providerJobRef: pair.blueprintJobRef,
        model: pair.model,
        estimatedCostUsd: pair.blueprintCostUsd,
        createdAt: new Date().toISOString(),
      };
      pipeline = appendCost(appendCost(pipeline, actualCostRecord), blueprintCostRecord);

      const receiptId = `ptbr-${runPrefix}`;
      const receipt: ProviderTwinBenchmarkReceipt = buildProviderTwinBenchmarkReceipt({
        id: receiptId,
        providerRunId: prior.providerRunId,
        challengerSlug: slug,
        model: pair.model,
        actual: pair.actual,
        blueprint: pair.blueprint,
        actualLatencyMs: pair.actualLatencyMs,
        blueprintLatencyMs: pair.blueprintLatencyMs,
        actualCostUsd: pair.actualCostUsd,
        blueprintCostUsd: pair.blueprintCostUsd,
        providerErrorState: null,
      });

      const costRecordId = `pbcr-${runPrefix}`;
      const providerCost: ProviderBenchmarkCostRecord = {
        id: costRecordId,
        challengerSlug: slug,
        provider: 'FAL',
        model: pair.model,
        actualCostUsd: pair.actualCostUsd,
        blueprintCostUsd: pair.blueprintCostUsd,
        totalCostUsd: pair.actualCostUsd + pair.blueprintCostUsd,
        currency: 'USD',
        timestamp: new Date().toISOString(),
      };

      renders = [...renders, pair.actual];
      blueprintTwins = [...blueprintTwins, pair.blueprint];
      artifactsById[pair.actual.id] = pair.actual;
      artifactsById[pair.blueprint.id] = pair.blueprint;
      artifactsById[receiptId] = receipt;
      artifactsById[costRecordId] = providerCost;

      benchmarkState = {
        ...benchmarkState,
        runs: {
          ...benchmarkState.runs,
          [rowKey]: {
            providerRunId: prior.providerRunId,
            status: 'COMPLETE',
            actualRenderId: pair.actual.id,
            blueprintRenderId: pair.blueprint.id,
            receiptId,
            costRecordId,
            actualJobId: pair.actualJobRef,
            blueprintJobId: pair.blueprintJobRef,
          },
        },
        totalNewJobs: benchmarkState.totalNewJobs + 2,
        totalBenchmarkCostUsd: benchmarkState.totalBenchmarkCostUsd + providerCost.totalCostUsd,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'PROVIDER_RUN_FAILED';
      benchmarkState = {
        ...benchmarkState,
        runs: {
          ...benchmarkState.runs,
          [rowKey]: {
            ...prior,
            status: 'PROVIDER_RUN_FAILED',
            providerErrorState: message,
          },
        },
      };
    }
  }

  const challengerComplete = TWIN_BENCHMARK_CHALLENGERS.every((s) => {
    const st = benchmarkState.runs[s].status;
    return st === 'COMPLETE' || st === 'UNAVAILABLE' || st === 'PROVIDER_RUN_FAILED';
  });
  const anyComplete = TWIN_BENCHMARK_CHALLENGERS.some((s) => benchmarkState.runs[s].status === 'COMPLETE');
  const allComplete = TWIN_BENCHMARK_CHALLENGERS.every((s) => benchmarkState.runs[s].status === 'COMPLETE');

  benchmarkState = {
    ...benchmarkState,
    status:
      allComplete ? 'FOUNDER_REVIEW_READY'
      : anyComplete && challengerComplete ? 'FOUNDER_REVIEW_READY'
      : challengerComplete ? 'PARTIAL'
      : benchmarkState.status === 'RUNNING' ? 'PARTIAL' : benchmarkState.status,
    idempotencyKey: benchmarkIdempotencyKey,
  };

  return {
    ...session,
    mobileTwinPipeline: {
      ...pipeline,
      compositionStates: pipeline.compositionStates.some((c) => c.id === composition.id) ?
        pipeline.compositionStates
      : [...pipeline.compositionStates, composition],
      renders,
      blueprintTwins,
      providerBenchmark: benchmarkState,
      artifactsById,
      desktopJobsDispatched: 0,
    },
    updatedAt: new Date().toISOString(),
  };
}

void P0_VR_TWIN_V30R7MF3P2_LINEAGE;
