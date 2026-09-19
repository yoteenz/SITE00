import type { DesignPageAuthorityReviewSession } from '../types.js';
import { P0_VR_TWIN_V30R7MF3P3_LINEAGE } from '../constants.js';
import {
  focusedHybridIdempotencyKey,
  FOCUSED_HYBRID_MAIN_STRATEGIES,
  resolveFocusedHybridGpt2Model,
  resolveFocusedHybridNbpModel,
  type FocusedHybridStrategyId,
} from '../../../../site00-visual-generation/twinFocusedHybridBenchmarkCatalog.js';
import { ensureMobileDesignReferenceAuthority } from './mobileDesignReferenceAuthority.js';
import { buildTwinFocusedHybridBenchmarkSnapshot } from './buildTwinFocusedHybridBenchmarkSnapshot.js';
import { buildNbpCorrectedActualFalPrompt } from './buildNbpCorrectedActualPrompt.js';
import {
  buildMobileBlueprintTwinFromCompositionFalPrompt,
  buildMobileImplementationRenderFalPrompt,
} from './buildMobileTwinFalPrompts.js';
import { dispatchMobileTwinSplitProviderPair } from './dispatchMobileTwinSplitProviderPair.js';
import { buildProviderStrategyBenchmarkReceipt } from './buildProviderStrategyBenchmarkReceipt.js';
import { evaluateActualPresentationFirewall } from './actualPresentationFirewall.js';
import { classifyLegacyMobileRender } from './mobileRenderClassification.js';
import { ensureMobileTwinFlowAControlPair } from './ensureMobileTwinFlowAControlPair.js';
import type {
  FocusedHybridStrategyRow,
  MobileTwinFocusedHybridBenchmarkState,
  ProviderStrategyBenchmarkReceipt,
} from './twinFocusedHybridBenchmarkTypes.js';
import type { MobileProviderCostRecord } from './types.js';

export type FocusedHybridRetryStrategy = FocusedHybridStrategyId | 'NONE';

function emptyStrategyRow(strategyId: FocusedHybridStrategyId, snapshotId: string): FocusedHybridStrategyRow {
  return {
    strategyId,
    status: 'NOT_RUN',
    actualRenderId: null,
    blueprintRenderId: null,
    actualJobId: null,
    blueprintJobId: null,
    receiptId: null,
    idempotencyKey: focusedHybridIdempotencyKey(snapshotId, strategyId),
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
    throw new Error('MOBILE_TWIN_FOCUSED_HYBRID_REQUIRES_METHOD_A');
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

function initBenchmarkState(input: {
  benchmarkId: string;
  snapshotId: string;
  snapshot: MobileTwinFocusedHybridBenchmarkState['snapshot'];
  control: { actualId: string; blueprintId: string };
  existing?: MobileTwinFocusedHybridBenchmarkState | null;
}): MobileTwinFocusedHybridBenchmarkState {
  const strategies: MobileTwinFocusedHybridBenchmarkState['strategies'] = {
    GPT2_FULL_PAIR: {
      ...emptyStrategyRow('GPT2_FULL_PAIR', input.snapshotId),
      status: 'REUSED_CONTROL',
      actualRenderId: input.control.actualId,
      blueprintRenderId: input.control.blueprintId,
    },
    NBP_FULL_PAIR_CORRECTED: emptyStrategyRow('NBP_FULL_PAIR_CORRECTED', input.snapshotId),
    GPT2_ACTUAL__NBP_BLUEPRINT: emptyStrategyRow('GPT2_ACTUAL__NBP_BLUEPRINT', input.snapshotId),
    NON_CANONICAL_AUDIT_PATH: emptyStrategyRow('NON_CANONICAL_AUDIT_PATH', input.snapshotId),
  };
  if (input.existing) {
    for (const id of Object.keys(strategies) as FocusedHybridStrategyId[]) {
      const prior = input.existing.strategies[id];
      if (prior?.status === 'COMPLETE' || prior?.status === 'REVIEW_REQUIRED') {
        strategies[id] = { ...strategies[id], ...prior };
      }
    }
    strategies.GPT2_FULL_PAIR = {
      ...strategies.GPT2_FULL_PAIR,
      actualRenderId: input.control.actualId,
      blueprintRenderId: input.control.blueprintId,
      status: 'REUSED_CONTROL',
    };
  }
  return {
    benchmarkId: input.benchmarkId,
    snapshot: input.snapshot,
    methodLocked: 'ATOMIC_SIBLING_FROM_COMPOSITION',
    controlStrategyId: 'GPT2_FULL_PAIR',
    strategies,
    status: input.existing?.status ?? 'NOT_STARTED',
    totalNewJobs: input.existing?.totalNewJobs ?? 0,
    totalBenchmarkCostUsd: input.existing?.totalBenchmarkCostUsd ?? 0,
    founderSelectedStrategy: input.existing?.founderSelectedStrategy ?? null,
    founderNotes: input.existing?.founderNotes ?? null,
  };
}

async function runStrategyPair(input: {
  strategyId: Exclude<FocusedHybridStrategyId, 'GPT2_FULL_PAIR' | 'NON_CANONICAL_AUDIT_PATH'>;
  benchmarkSnapshotId: string;
  runPrefix: string;
  actualModel: string;
  blueprintModel: string;
  actualPrompt: string;
  blueprintPrompt?: string;
  reference: NonNullable<DesignPageAuthorityReviewSession['mobileTwinPipeline']>['designReference'];
  composition: ReturnType<typeof resolveFrozenComposition>;
  publicOrigin?: string;
  actualProviderSettings?: Record<string, unknown>;
}): Promise<{
  pair: Awaited<ReturnType<typeof dispatchMobileTwinSplitProviderPair>>;
  receipt: ProviderStrategyBenchmarkReceipt;
  rowStatus: FocusedHybridStrategyRow['status'];
  presentationFirewallPass: boolean;
}> {
  const pair = await dispatchMobileTwinSplitProviderPair({
    runPrefix: input.runPrefix,
    actualModel: input.actualModel,
    blueprintModel: input.blueprintModel,
    actualPrompt: input.actualPrompt,
    blueprintPrompt: input.blueprintPrompt,
    reference: input.reference!,
    composition: input.composition,
    publicOrigin: input.publicOrigin,
    actualProviderSettings: input.actualProviderSettings,
    blueprintProviderSettings: { focusedHybridStrategy: input.strategyId },
  });

  let presentationFirewallErrorCode: string | null = null;
  let presentationFirewallPass = true;
  if (input.strategyId === 'NBP_FULL_PAIR_CORRECTED') {
    const fw = evaluateActualPresentationFirewall({
      strategyId: 'NBP_FULL_PAIR_CORRECTED',
      actualPrompt: input.actualPrompt,
      renderImageUri: pair.actual.renderImageUri,
      providerMetadata: pair.actual.normalizedRequest as Record<string, unknown> | null,
      providerSettings: input.actualProviderSettings,
    });
    presentationFirewallPass = fw.pass;
    presentationFirewallErrorCode = fw.errorCode;
  }

  const receiptId = `psbr-${input.runPrefix}`;
  const receipt = buildProviderStrategyBenchmarkReceipt({
    id: receiptId,
    strategyId: input.strategyId,
    actualModel: pair.actualModel,
    blueprintModel: pair.blueprintModel,
    benchmarkSnapshotId: input.benchmarkSnapshotId,
    actual: pair.actual,
    blueprint: pair.blueprint,
    providerLatencyMs: pair.totalLatencyMs,
    providerCostUsd: pair.totalCostUsd,
    providerErrors: null,
    presentationFirewallErrorCode,
    canonicalPath: true,
  });

  const rowStatus: FocusedHybridStrategyRow['status'] =
    presentationFirewallPass ? 'COMPLETE' : 'REVIEW_REQUIRED';

  return { pair, receipt, rowStatus, presentationFirewallPass };
}

export async function runMobileTwinFocusedHybridBenchmark(input: {
  session: DesignPageAuthorityReviewSession;
  publicOrigin?: string;
  retry?: FocusedHybridRetryStrategy;
  forceNew?: boolean;
}): Promise<DesignPageAuthorityReviewSession> {
  const retry = input.retry ?? 'NONE';
  let session = ensureMobileDesignReferenceAuthority(input.session);
  let pipeline = session.mobileTwinPipeline!;
  assertMethodALocked(pipeline.mobileTwinVisualGenerationStrategy);

  const capTest = pipeline.twinCapabilityTest;
  if (!capTest?.snapshot) throw new Error('MOBILE_TWIN_CAPABILITY_TEST_MISSING');

  const benchmarkId = pipeline.focusedHybridBenchmark?.benchmarkId ?? `r7mf3p3-${Date.now()}`;
  const snapshot = buildTwinFocusedHybridBenchmarkSnapshot({
    benchmarkId,
    capabilitySnapshot: capTest.snapshot,
    sourceBenchmarkSnapshot: pipeline.providerBenchmark?.snapshot ?? null,
  });
  const composition = resolveFrozenComposition(
    pipeline,
    snapshot.compositionStateId,
    snapshot.compositionHash,
  );

  const allowBootstrap =
    Boolean(pipeline.founderManualTwinPathUnlock) ||
    capTest.status === 'FOUNDER_REVIEW_READY' ||
    capTest.status === 'PARTIAL';
  const ensured = await ensureMobileTwinFlowAControlPair({
    session,
    composition,
    runPrefix: `FH_CONTROL_${benchmarkId}`,
    publicOrigin: input.publicOrigin,
    allowBootstrap,
  });
  if (!ensured) throw new Error('MOBILE_TWIN_FOCUSED_HYBRID_CONTROL_MISSING');
  session = ensured.session;
  pipeline = session.mobileTwinPipeline!;
  const control = { actualId: ensured.actualId, blueprintId: ensured.blueprintId };
  const ref = pipeline.designReference!;
  const gpt2Model = resolveFocusedHybridGpt2Model();
  const nbpModel = resolveFocusedHybridNbpModel();

  let benchmarkState = initBenchmarkState({
    benchmarkId,
    snapshotId: snapshot.id,
    snapshot,
    control,
    existing: pipeline.focusedHybridBenchmark,
  });

  const globalComplete =
    !input.forceNew &&
    retry === 'NONE' &&
    benchmarkState.status === 'FOUNDER_REVIEW_READY' &&
    FOCUSED_HYBRID_MAIN_STRATEGIES.every((s) => {
      const st = benchmarkState.strategies[s].status;
      return st === 'COMPLETE' || st === 'REVIEW_REQUIRED' || st === 'REUSED_CONTROL';
    });
  if (globalComplete) {
    return session;
  }

  let artifactsById = { ...pipeline.artifactsById, [snapshot.id]: snapshot };
  let renders = [...pipeline.renders.map(classifyLegacyMobileRender)];
  let blueprintTwins = [...pipeline.blueprintTwins];
  let newJobs = 0;
  let costDelta = 0;

  const controlReceiptId = `psbr-control-${benchmarkId}`;
  if (!artifactsById[controlReceiptId]) {
    const actual = renders.find((r) => r.id === control.actualId)!;
    const blueprint = blueprintTwins.find((b) => b.id === control.blueprintId)!;
    const controlReceipt = buildProviderStrategyBenchmarkReceipt({
      id: controlReceiptId,
      strategyId: 'GPT2_FULL_PAIR',
      actualModel: actual.providerModel ?? gpt2Model,
      blueprintModel: blueprint.provider === 'FAL' ? gpt2Model : gpt2Model,
      benchmarkSnapshotId: snapshot.id,
      actual,
      blueprint,
      providerLatencyMs: 0,
      providerCostUsd: 0,
      providerErrors: null,
      presentationFirewallErrorCode: null,
      canonicalPath: true,
    });
    artifactsById[controlReceiptId] = controlReceipt;
    benchmarkState = {
      ...benchmarkState,
      strategies: {
        ...benchmarkState.strategies,
        GPT2_FULL_PAIR: {
          ...benchmarkState.strategies.GPT2_FULL_PAIR,
          receiptId: controlReceiptId,
        },
      },
    };
  }

  const strategiesToRun: Exclude<FocusedHybridStrategyId, 'GPT2_FULL_PAIR' | 'NON_CANONICAL_AUDIT_PATH'>[] = [];
  if (retry === 'NONE') {
    strategiesToRun.push('NBP_FULL_PAIR_CORRECTED', 'GPT2_ACTUAL__NBP_BLUEPRINT');
  } else if (retry === 'NBP_FULL_PAIR_CORRECTED' || retry === 'GPT2_ACTUAL__NBP_BLUEPRINT') {
    strategiesToRun.push(retry);
  }

  for (const strategyId of strategiesToRun) {
    const row = benchmarkState.strategies[strategyId];
    if (
      !input.forceNew &&
      retry === 'NONE' &&
      (row.status === 'COMPLETE' || row.status === 'REVIEW_REQUIRED') &&
      row.actualRenderId &&
      row.blueprintRenderId
    ) {
      continue;
    }

    benchmarkState = {
      ...benchmarkState,
      status: 'RUNNING',
      strategies: {
        ...benchmarkState.strategies,
        [strategyId]: { ...row, status: 'RUNNING' },
      },
    };

    const attemptSuffix = input.forceNew || retry !== 'NONE' ? `-${Date.now()}` : '';
    const runPrefix = `${strategyId}-${benchmarkId}${attemptSuffix}`.replace(/[^a-zA-Z0-9_-]/g, '_');

    try {
      let result: Awaited<ReturnType<typeof runStrategyPair>>;
      if (strategyId === 'NBP_FULL_PAIR_CORRECTED') {
        const actualPrompt = buildNbpCorrectedActualFalPrompt({ reference: ref, composition });
        result = await runStrategyPair({
          strategyId,
          benchmarkSnapshotId: snapshot.id,
          runPrefix,
          actualModel: nbpModel,
          blueprintModel: nbpModel,
          actualPrompt,
          reference: ref,
          composition,
          publicOrigin: input.publicOrigin,
          actualProviderSettings: { focusedHybridStrategy: strategyId, presentationFirewall: true },
        });
      } else {
        const actualPrompt = buildMobileImplementationRenderFalPrompt({ reference: ref, composition });
        const blueprintPrompt = buildMobileBlueprintTwinFromCompositionFalPrompt({
          composition,
          siblingActualRenderId: `${runPrefix}-actual`,
        });
        result = await runStrategyPair({
          strategyId,
          benchmarkSnapshotId: snapshot.id,
          runPrefix,
          actualModel: gpt2Model,
          blueprintModel: nbpModel,
          actualPrompt,
          blueprintPrompt,
          reference: ref,
          composition,
          publicOrigin: input.publicOrigin,
        });
      }

      const { pair, receipt, rowStatus, presentationFirewallPass } = result;
      newJobs += 2;
      costDelta += pair.totalCostUsd;

      const actualCost: MobileProviderCostRecord = {
        id: `cost-fh-${runPrefix}-actual`,
        kind: 'MOBILE_RENDER',
        providerJobRef: pair.actualJobRef,
        model: pair.actualModel,
        estimatedCostUsd: pair.actualCostUsd,
        createdAt: new Date().toISOString(),
      };
      const blueprintCost: MobileProviderCostRecord = {
        id: `cost-fh-${runPrefix}-blueprint`,
        kind: 'BLUEPRINT_TWIN',
        providerJobRef: pair.blueprintJobRef,
        model: pair.blueprintModel,
        estimatedCostUsd: pair.blueprintCostUsd,
        createdAt: new Date().toISOString(),
      };
      pipeline = appendCost(appendCost(pipeline, actualCost), blueprintCost);

      renders = [...renders, pair.actual];
      blueprintTwins = [...blueprintTwins, pair.blueprint];
      artifactsById[pair.actual.id] = pair.actual;
      artifactsById[pair.blueprint.id] = pair.blueprint;
      artifactsById[receipt.id] = receipt;

      benchmarkState = {
        ...benchmarkState,
        strategies: {
          ...benchmarkState.strategies,
          [strategyId]: {
            ...row,
            status: rowStatus,
            actualRenderId: pair.actual.id,
            blueprintRenderId: pair.blueprint.id,
            actualJobId: pair.actualJobRef,
            blueprintJobId: pair.blueprintJobRef,
            receiptId: receipt.id,
            presentationFirewallPass,
          },
        },
        totalNewJobs: benchmarkState.totalNewJobs + 2,
        totalBenchmarkCostUsd: benchmarkState.totalBenchmarkCostUsd + pair.totalCostUsd,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'PROVIDER_RUN_FAILED';
      benchmarkState = {
        ...benchmarkState,
        strategies: {
          ...benchmarkState.strategies,
          [strategyId]: {
            ...row,
            status: 'PROVIDER_RUN_FAILED',
            providerErrorState: message,
          },
        },
      };
    }
  }

  const mainReady = FOCUSED_HYBRID_MAIN_STRATEGIES.every((s) => {
    const st = benchmarkState.strategies[s].status;
    return st === 'COMPLETE' || st === 'REVIEW_REQUIRED' || st === 'REUSED_CONTROL';
  });

  benchmarkState = {
    ...benchmarkState,
    status: mainReady ? 'FOUNDER_REVIEW_READY' : benchmarkState.status === 'RUNNING' ? 'PARTIAL' : benchmarkState.status,
  };

  void newJobs;
  void costDelta;

  return {
    ...session,
    mobileTwinPipeline: {
      ...pipeline,
      compositionStates: pipeline.compositionStates.some((c) => c.id === composition.id) ?
        pipeline.compositionStates
      : [...pipeline.compositionStates, composition],
      renders,
      blueprintTwins,
      focusedHybridBenchmark: benchmarkState,
      artifactsById,
      desktopJobsDispatched: 0,
    },
    updatedAt: new Date().toISOString(),
  };
}

void P0_VR_TWIN_V30R7MF3P3_LINEAGE;
