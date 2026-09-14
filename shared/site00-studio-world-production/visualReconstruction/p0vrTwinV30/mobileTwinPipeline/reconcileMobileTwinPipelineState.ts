import type { MobileTwinVisualGenerationStrategy } from './mobileTwinVisualStrategy.js';
import type { TwinFlowACapabilityReceipt } from './twinCapabilityTestTypes.js';
import type { MobileTwinCapabilityTestState } from './twinCapabilityTestTypes.js';
import { buildMobileTwinCompositionState } from './buildMobileTwinCompositionState.js';
import { buildTwinCapabilityTestCompositionSnapshot } from './buildTwinCapabilityTestSnapshot.js';
import type { MobileBlueprintTwinVisual, MobileImplementationRender, MobileTwinCompositionState, MobileTwinPipelineState } from './types.js';

function unionById<T extends { id: string }>(a: T[], b: T[]): T[] {
  const map = new Map<string, T>();
  for (const row of [...a, ...b]) map.set(row.id, row);
  return [...map.values()];
}

function mergeStrategy(
  a: MobileTwinVisualGenerationStrategy | undefined,
  b: MobileTwinVisualGenerationStrategy | undefined,
): MobileTwinVisualGenerationStrategy {
  if (a && a !== 'UNRESOLVED') return a;
  if (b && b !== 'UNRESOLVED') return b;
  return a ?? b ?? 'UNRESOLVED';
}

function capabilityTestRank(test: MobileTwinCapabilityTestState | null | undefined): number {
  if (!test) return 0;
  if (test.status === 'FOUNDER_REVIEW_READY') return 4;
  if (test.status === 'PARTIAL') return 3;
  if (test.status === 'RUNNING') return 2;
  if (test.status === 'FAILED') return 1;
  return 0;
}

function mergeCapabilityTest(
  a: MobileTwinCapabilityTestState | null | undefined,
  b: MobileTwinCapabilityTestState | null | undefined,
): MobileTwinCapabilityTestState | null {
  if (!a) return b ?? null;
  if (!b) return a;
  return capabilityTestRank(a) >= capabilityTestRank(b) ? a : b;
}

function findFlowAReceipt(pipeline: MobileTwinPipelineState): TwinFlowACapabilityReceipt | null {
  for (const value of Object.values(pipeline.artifactsById)) {
    if (!value || typeof value !== 'object') continue;
    const row = value as TwinFlowACapabilityReceipt;
    if (row.flowMode === 'TWIN_FLOW_A_ATOMIC_SIBLINGS') return row;
  }
  return null;
}

function isFalRender(render: MobileImplementationRender): boolean {
  if (!render.renderImageUri) return false;
  if (render.provider === 'FAL') return true;
  return /fal\.media|vitest-fal:|fal\.run|fal\.cdn/i.test(render.renderImageUri);
}

function resolveCompositionForRender(
  pipeline: MobileTwinPipelineState,
  render: MobileImplementationRender,
): MobileTwinCompositionState | null {
  const existing = pipeline.compositionStates.find((c) => c.id === render.compositionStateId);
  if (existing) return existing;
  if (!pipeline.designReference) return null;
  const comp = buildMobileTwinCompositionState({
    runId: `bootstrap-${render.id}`,
    reference: pipeline.designReference,
  });
  comp.id = render.compositionStateId;
  comp.compositionHash = render.compositionHash;
  comp.status = 'FROZEN';
  return comp;
}

function findFlowAPair(pipeline: MobileTwinPipelineState): {
  actual: MobileImplementationRender;
  blueprint: MobileBlueprintTwinVisual;
} | null {
  const blueprints = pipeline.blueprintTwins.filter((b) => Boolean(b.twinImageUri));
  for (const blueprint of blueprints) {
    const actual =
      pipeline.renders.find((r) => r.id === blueprint.implementationRenderId) ??
      pipeline.renders.find(
        (r) =>
          r.compositionStateId === blueprint.compositionStateId &&
          r.compositionHash === blueprint.compositionHash &&
          Boolean(r.renderImageUri),
      );
    if (actual?.renderImageUri && blueprint.twinImageUri) {
      return { actual, blueprint };
    }
  }
  const receipt = findFlowAReceipt(pipeline);
  if (receipt?.status === 'COMPLETE' && receipt.actualRenderId && receipt.blueprintRenderId) {
    const actual = pipeline.renders.find((r) => r.id === receipt.actualRenderId);
    const blueprint = pipeline.blueprintTwins.find((b) => b.id === receipt.blueprintRenderId);
    if (actual?.renderImageUri && blueprint?.twinImageUri) return { actual, blueprint };
  }
  const falRenders = pipeline.renders.filter(isFalRender);
  if (falRenders.length && blueprints.length) {
    const actual = falRenders.at(-1)!;
    const blueprint =
      blueprints.find((b) => b.implementationRenderId === actual.id) ??
      blueprints.find((b) => b.compositionHash === actual.compositionHash) ??
      blueprints.at(-1)!;
    if (blueprint.twinImageUri) return { actual, blueprint };
  }
  return null;
}

/** Merge authority session pipeline + dedicated mobile-twin LS (fixes lost capability test / strategy). */
export function mergeMobileTwinPipelineRich(
  primary?: MobileTwinPipelineState,
  secondary?: MobileTwinPipelineState,
): MobileTwinPipelineState | undefined {
  if (!primary && !secondary) return undefined;
  if (!primary) return reconcileMobileTwinPipelineState(secondary!);
  if (!secondary) return reconcileMobileTwinPipelineState(primary);

  const pick = secondary.renders.length >= primary.renders.length ? secondary : primary;
  const other = pick === secondary ? primary : secondary;

  const merged: MobileTwinPipelineState = {
    ...pick,
    designReference: pick.designReference ?? other.designReference,
    renders: unionById(pick.renders, other.renders),
    blueprintTwins: unionById(pick.blueprintTwins, other.blueprintTwins),
    compositionStates: unionById(pick.compositionStates, other.compositionStates),
    packages: unionById(pick.packages, other.packages),
    atomicRuns: unionById(pick.atomicRuns ?? [], other.atomicRuns ?? []),
    visualPairs: unionById(pick.visualPairs ?? [], other.visualPairs ?? []),
    artifactsById: { ...other.artifactsById, ...pick.artifactsById },
    twinCapabilityTest: mergeCapabilityTest(pick.twinCapabilityTest, other.twinCapabilityTest),
    providerBenchmark: pick.providerBenchmark ?? other.providerBenchmark,
    mobileTwinVisualGenerationStrategy: mergeStrategy(
      pick.mobileTwinVisualGenerationStrategy,
      other.mobileTwinVisualGenerationStrategy,
    ),
    mobileTwinProviderStrategy: pick.mobileTwinProviderStrategy ?? other.mobileTwinProviderStrategy,
    falJobsDispatched: Math.max(pick.falJobsDispatched ?? 0, other.falJobsDispatched ?? 0),
    totalProviderCostUsd: Math.max(pick.totalProviderCostUsd ?? 0, other.totalProviderCostUsd ?? 0),
    desktopJobsDispatched: 0,
    desktopStatus: 'DEFERRED',
    r6f2ForensicRole: pick.r6f2ForensicRole ?? other.r6f2ForensicRole,
    providerCostRecords: [...(other.providerCostRecords ?? []), ...(pick.providerCostRecords ?? [])].slice(-16),
  };

  return reconcileMobileTwinPipelineState(merged);
}

export function isCapabilityTestFounderReviewReady(pipeline: MobileTwinPipelineState): boolean {
  const status = pipeline.twinCapabilityTest?.status;
  if (status === 'FOUNDER_REVIEW_READY' || status === 'PARTIAL') return true;
  if (findFlowAPair(pipeline) !== null) return true;
  const falCount = pipeline.renders.filter(isFalRender).length;
  return falCount >= 1 && (pipeline.falJobsDispatched ?? 0) >= 1;
}

export function hasFlowABaselineForBenchmark(pipeline: MobileTwinPipelineState): boolean {
  const test = pipeline.twinCapabilityTest;
  if (test?.flowABlueprintId && test.canonicalActualRenderId) {
    const bp = pipeline.blueprintTwins.find((b) => b.id === test.flowABlueprintId);
    const actual = pipeline.renders.find((r) => r.id === test.canonicalActualRenderId);
    if (bp?.twinImageUri && actual?.renderImageUri) return true;
  }
  return findFlowAPair(pipeline) !== null;
}

/** Rebuild capability test + ids from receipts / render pairs after storage merge or iOS reload. */
export function reconcileMobileTwinPipelineState(pipeline: MobileTwinPipelineState): MobileTwinPipelineState {
  let next = { ...pipeline };
  const pair = findFlowAPair(next);
  const receipt = findFlowAReceipt(next);

  if (pair || receipt) {
    const actualId = pair?.actual.id ?? receipt?.actualRenderId ?? null;
    const blueprintId = pair?.blueprint.id ?? receipt?.blueprintRenderId ?? null;
    const composition =
      (actualId ? next.compositionStates.find((c) => c.id === pair?.actual.compositionStateId) : null) ??
      next.compositionStates.find((c) => c.id === pair?.blueprint.compositionStateId);

    const existing = next.twinCapabilityTest;
    const compositionStateId =
      pair?.actual.compositionStateId ?? pair?.blueprint.compositionStateId ?? receipt?.compositionStateId;
    let compositionResolved =
      composition ?? (compositionStateId ? next.compositionStates.find((c) => c.id === compositionStateId) : null);

    const actualRender = actualId ? next.renders.find((r) => r.id === actualId) : null;
    if (!compositionResolved && actualRender && next.designReference) {
      const bootstrapped = resolveCompositionForRender(next, actualRender);
      if (bootstrapped) {
        compositionResolved = bootstrapped;
        next = {
          ...next,
          compositionStates: next.compositionStates.some((c) => c.id === bootstrapped.id) ?
            next.compositionStates
          : [...next.compositionStates, bootstrapped],
        };
      }
    }

    const needsUpgrade =
      !existing ||
      (existing.status !== 'FOUNDER_REVIEW_READY' &&
        existing.status !== 'PARTIAL' &&
        (pair !== null || receipt?.status === 'COMPLETE'));

    if (needsUpgrade && actualId && next.designReference) {
      const blueprintIdResolved = blueprintId ?? pair?.blueprint.id ?? null;
      if (!blueprintIdResolved) {
        if (actualRender && compositionResolved) {
          const testId = existing?.testId ?? `reconcile-partial-${compositionResolved.id.slice(0, 8)}`;
          next = {
            ...next,
            twinCapabilityTest: {
              testId,
              snapshot:
                existing?.snapshot ??
                buildTwinCapabilityTestCompositionSnapshot({
                  testId,
                  reference: next.designReference,
                  composition: compositionResolved,
                }),
              actualControlMode: 'SHARED_CANONICAL_ACTUAL',
              canonicalActualRenderId: actualId,
              flowABlueprintId: null,
              flowBBlueprintId: existing?.flowBBlueprintId ?? null,
              flowAReceiptId: existing?.flowAReceiptId ?? `tfar-${testId}`,
              flowBReceiptId: existing?.flowBReceiptId ?? `tfbr-${testId}`,
              flowAVisualMatchReceiptId: existing?.flowAVisualMatchReceiptId ?? `tvmr-a-${testId}`,
              flowBVisualMatchReceiptId: existing?.flowBVisualMatchReceiptId ?? `tvmr-b-${testId}`,
              status: 'PARTIAL',
              founderDecision: existing?.founderDecision ?? null,
              founderSelectedStrategy: mergeStrategy(
                existing?.founderSelectedStrategy,
                next.mobileTwinVisualGenerationStrategy,
              ),
              idempotencyKey:
                existing?.idempotencyKey ??
                `capability-test:${next.designReference.id}:${compositionResolved.compositionHash}`,
              capabilityTestCostUsd: existing?.capabilityTestCostUsd ?? 0,
              assetJobsDispatched: 0,
              fullPackageFanoutBlocked: true,
            },
          };
        }
        return next;
      }

      if (compositionResolved) {
      const testId = existing?.testId ?? `reconcile-${compositionResolved.id.slice(0, 8)}`;
      const snapshot =
        existing?.snapshot ??
        buildTwinCapabilityTestCompositionSnapshot({
          testId,
          reference: next.designReference,
          composition: compositionResolved,
        });

      const capabilityTest: MobileTwinCapabilityTestState = {
        testId,
        snapshot,
        actualControlMode: 'SHARED_CANONICAL_ACTUAL',
        canonicalActualRenderId: actualId,
        flowABlueprintId: blueprintIdResolved,
        flowBBlueprintId: existing?.flowBBlueprintId ?? null,
        flowAReceiptId: receipt?.id ?? existing?.flowAReceiptId ?? `tfar-${testId}`,
        flowBReceiptId: existing?.flowBReceiptId ?? `tfbr-${testId}`,
        flowAVisualMatchReceiptId: existing?.flowAVisualMatchReceiptId ?? `tvmr-a-${testId}`,
        flowBVisualMatchReceiptId: existing?.flowBVisualMatchReceiptId ?? `tvmr-b-${testId}`,
        status: pair || receipt?.status === 'COMPLETE' ? 'FOUNDER_REVIEW_READY' : (existing?.status ?? 'PARTIAL'),
        founderDecision: existing?.founderDecision ?? null,
        founderSelectedStrategy: mergeStrategy(
          existing?.founderSelectedStrategy,
          next.mobileTwinVisualGenerationStrategy,
        ),
        idempotencyKey:
          existing?.idempotencyKey ??
          `capability-test:${next.designReference.id}:${compositionResolved.compositionHash}`,
        capabilityTestCostUsd: existing?.capabilityTestCostUsd ?? 0,
        assetJobsDispatched: 0,
        fullPackageFanoutBlocked: true,
      };

      next = {
        ...next,
        twinCapabilityTest: capabilityTest,
        activeCompositionStateId: next.activeCompositionStateId ?? compositionResolved.id,
      };
      }
    }
  }

  const designReference = next.designReference;
  if (!next.twinCapabilityTest && designReference) {
    const falRenders = next.renders.filter(isFalRender);
    const actual = falRenders.at(-1);
    if (actual) {
      const compositionResolved = resolveCompositionForRender(next, actual);
      if (compositionResolved) {
        if (!next.compositionStates.some((c) => c.id === compositionResolved.id)) {
          next = { ...next, compositionStates: [...next.compositionStates, compositionResolved] };
        }
        const testId = `reconcile-fal-${actual.id.slice(0, 8)}`;
        next = {
          ...next,
          twinCapabilityTest: {
            testId,
            snapshot: buildTwinCapabilityTestCompositionSnapshot({
              testId,
              reference: designReference,
              composition: compositionResolved,
            }),
            actualControlMode: 'SHARED_CANONICAL_ACTUAL',
            canonicalActualRenderId: actual.id,
            flowABlueprintId: null,
            flowBBlueprintId: null,
            flowAReceiptId: `tfar-${testId}`,
            flowBReceiptId: `tfbr-${testId}`,
            flowAVisualMatchReceiptId: `tvmr-a-${testId}`,
            flowBVisualMatchReceiptId: `tvmr-b-${testId}`,
            status: 'PARTIAL',
            founderDecision: null,
            founderSelectedStrategy: next.mobileTwinVisualGenerationStrategy ?? 'UNRESOLVED',
            idempotencyKey: `capability-test:${designReference.id}:${compositionResolved.compositionHash}`,
            capabilityTestCostUsd: 0,
            assetJobsDispatched: 0,
            fullPackageFanoutBlocked: true,
          },
        };
      }
    }
  }

  return next;
}
