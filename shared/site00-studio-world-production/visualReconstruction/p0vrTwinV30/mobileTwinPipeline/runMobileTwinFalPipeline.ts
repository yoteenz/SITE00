import type { DesignPageAuthorityReviewSession } from '../types.js';
import { P0_VR_TWIN_V30R7MF1_LINEAGE } from '../constants.js';
import { ensureMobileDesignReferenceAuthority } from './mobileDesignReferenceAuthority.js';
import { buildMobileTwinCompositionState } from './buildMobileTwinCompositionState.js';
import { runMobileCompositionPreflight } from './mobileCompositionPreflight.js';
import { dispatchMobileTwinFalRender } from './dispatchMobileTwinFalRender.js';
import { dispatchMobileTwinFalBlueprintTwin } from './dispatchMobileTwinFalBlueprintTwin.js';
import { classifyLegacyMobileRender } from './mobileRenderClassification.js';
import { finalizeMobileTwinPackageSession } from './runGenerateMobileTwinPackageCore.js';
import { runMobileAtomicTwinGeneration } from './runMobileAtomicTwinGeneration.js';
import { runMobileTwinCapabilityTest } from './runMobileTwinCapabilityTest.js';
import { runMobileTwinProviderBenchmark } from './runMobileTwinProviderBenchmark.js';
import { runMobileTwinFocusedHybridBenchmark } from './runMobileTwinFocusedHybridBenchmark.js';
import {
  assertBlueprintTwinNotRedesigned,
  buildRenderBlueprintTwinReconciliationReceipt,
} from './mobileTwinReconciliation.js';
import type { MobileProviderCostRecord } from './types.js';

export type MobileTwinFalAction =
  | 'RUN_MOBILE_TWIN_CAPABILITY_TEST'
  | 'RETRY_CAPABILITY_FLOW_A'
  | 'RETRY_CAPABILITY_FLOW_B'
  | 'RUN_MOBILE_TWIN_PROVIDER_BENCHMARK'
  | 'RETRY_PROVIDER_BENCHMARK_NBPRO'
  | 'RETRY_PROVIDER_BENCHMARK_FLUX2MAX'
  | 'RETRY_PROVIDER_BENCHMARK_KONTEXTMAX'
  | 'RUN_MOBILE_TWIN_FOCUSED_HYBRID_BENCHMARK'
  | 'RETRY_FOCUSED_HYBRID_NBP_FULL'
  | 'RETRY_FOCUSED_HYBRID_GPT2_NBP'
  | 'GENERATE_MOBILE_TWIN'
  | 'REGENERATE_MOBILE_TWIN'
  | 'GENERATE_MOBILE_RENDER'
  | 'REFINE_MOBILE_RENDER'
  | 'REGENERATE_MOBILE_RENDER'
  | 'GENERATE_MOBILE_TWIN_PACKAGE';

function appendCost(pipeline: NonNullable<DesignPageAuthorityReviewSession['mobileTwinPipeline']>, record: MobileProviderCostRecord) {
  return {
    ...pipeline,
    providerCostRecords: [...pipeline.providerCostRecords, record],
    totalProviderCostUsd: pipeline.totalProviderCostUsd + record.estimatedCostUsd,
    falJobsDispatched: pipeline.falJobsDispatched + 1,
    desktopJobsDispatched: 0,
  };
}

export async function runMobileTwinFalPipeline(input: {
  session: DesignPageAuthorityReviewSession;
  action: MobileTwinFalAction;
  founderConfirmedSpend?: boolean;
  refineNotes?: string[];
  publicOrigin?: string;
}): Promise<DesignPageAuthorityReviewSession> {
  if (!input.founderConfirmedSpend) {
    throw new Error('SPEND_GUARD: founderConfirmedSpend required');
  }

  let session = ensureMobileDesignReferenceAuthority(input.session);
  const pipeline = session.mobileTwinPipeline!;
  const ref = pipeline.designReference!;

  if (input.action === 'RUN_MOBILE_TWIN_CAPABILITY_TEST') {
    return runMobileTwinCapabilityTest({
      session,
      publicOrigin: input.publicOrigin,
      retry: 'NONE',
    });
  }
  if (input.action === 'RETRY_CAPABILITY_FLOW_A') {
    return runMobileTwinCapabilityTest({
      session,
      publicOrigin: input.publicOrigin,
      retry: 'FLOW_A',
    });
  }
  if (input.action === 'RETRY_CAPABILITY_FLOW_B') {
    return runMobileTwinCapabilityTest({
      session,
      publicOrigin: input.publicOrigin,
      retry: 'FLOW_B',
    });
  }

  if (input.action === 'RUN_MOBILE_TWIN_PROVIDER_BENCHMARK') {
    return runMobileTwinProviderBenchmark({ session, publicOrigin: input.publicOrigin, retry: 'NONE' });
  }
  if (input.action === 'RETRY_PROVIDER_BENCHMARK_NBPRO') {
    return runMobileTwinProviderBenchmark({ session, publicOrigin: input.publicOrigin, retry: 'NBPRO', forceNew: true });
  }
  if (input.action === 'RETRY_PROVIDER_BENCHMARK_FLUX2MAX') {
    return runMobileTwinProviderBenchmark({
      session,
      publicOrigin: input.publicOrigin,
      retry: 'FLUX2MAX',
      forceNew: true,
    });
  }
  if (input.action === 'RETRY_PROVIDER_BENCHMARK_KONTEXTMAX') {
    return runMobileTwinProviderBenchmark({
      session,
      publicOrigin: input.publicOrigin,
      retry: 'KONTEXTMAX',
      forceNew: true,
    });
  }

  if (input.action === 'RUN_MOBILE_TWIN_FOCUSED_HYBRID_BENCHMARK') {
    return runMobileTwinFocusedHybridBenchmark({ session, publicOrigin: input.publicOrigin, retry: 'NONE' });
  }
  if (input.action === 'RETRY_FOCUSED_HYBRID_NBP_FULL') {
    return runMobileTwinFocusedHybridBenchmark({
      session,
      publicOrigin: input.publicOrigin,
      retry: 'NBP_FULL_PAIR_CORRECTED',
      forceNew: true,
    });
  }
  if (input.action === 'RETRY_FOCUSED_HYBRID_GPT2_NBP') {
    return runMobileTwinFocusedHybridBenchmark({
      session,
      publicOrigin: input.publicOrigin,
      retry: 'GPT2_ACTUAL__NBP_BLUEPRINT',
      forceNew: true,
    });
  }

  if (input.action === 'GENERATE_MOBILE_TWIN' || input.action === 'REGENERATE_MOBILE_TWIN') {
    const parentRun = pipeline.activeAtomicRunId ? pipeline.atomicRuns.find((r) => r.id === pipeline.activeAtomicRunId) : null;
    return runMobileAtomicTwinGeneration({
      session,
      publicOrigin: input.publicOrigin,
      regeneration: input.action === 'REGENERATE_MOBILE_TWIN',
      parentRunId: parentRun?.id ?? null,
      parentPairId: pipeline.activeVisualPairId,
    });
  }

  if (input.action === 'GENERATE_MOBILE_RENDER' || input.action === 'REGENERATE_MOBILE_RENDER') {
    const runId = `r7mf2-render-${Date.now()}`;
    const composition = buildMobileTwinCompositionState({ runId, reference: ref });
    composition.status = 'RECONCILED';
    const preflight = runMobileCompositionPreflight({ reference: ref, composition });
    if (!preflight.pass) throw new Error(preflight.errors[0] ?? 'MOBILE_COMPOSITION_STATE_MISSING');

    const parentRenderId =
      input.action === 'REGENERATE_MOBILE_RENDER' && pipeline.activeRenderId ? pipeline.activeRenderId : null;

    const dispatched = await dispatchMobileTwinFalRender({
      runId,
      reference: ref,
      composition,
      publicOrigin: input.publicOrigin,
      parentRenderId,
      regeneration: input.action === 'REGENERATE_MOBILE_RENDER',
    });

    const costRecord: MobileProviderCostRecord = {
      id: `cost-render-${runId}`,
      kind: 'MOBILE_RENDER',
      providerJobRef: dispatched.providerJobRef,
      model: dispatched.model,
      estimatedCostUsd: dispatched.costUsd,
      createdAt: new Date().toISOString(),
    };

    const nextPipeline = appendCost(
      {
        ...pipeline,
        compositionStates: [...pipeline.compositionStates, composition],
        activeCompositionStateId: composition.id,
        renders: [...pipeline.renders.map((r) => classifyLegacyMobileRender(r)), dispatched.render],
        activeRenderId: dispatched.render.id,
        renderGate: 'FOUNDER_REVIEW',
        artifactsById: {
          ...pipeline.artifactsById,
          [composition.id]: composition,
          [dispatched.render.id]: dispatched.render,
          [dispatched.translationEvidence.id]: dispatched.translationEvidence,
        },
      },
      costRecord,
    );

    return { ...session, mobileTwinPipeline: nextPipeline, updatedAt: new Date().toISOString() };
  }

  if (input.action === 'REFINE_MOBILE_RENDER') {
    if (!pipeline.activeRenderId) throw new Error('MOBILE_RENDER_GENERATION_FAILED');
    const parent = pipeline.renders.find((r) => r.id === pipeline.activeRenderId);
    if (!parent) throw new Error('MOBILE_RENDER_GENERATION_FAILED');
    const composition = pipeline.compositionStates.find((c) => c.id === parent.compositionStateId);
    if (!composition) throw new Error('MOBILE_COMPOSITION_STATE_MISSING');

    const runId = `r7mf2-refine-${Date.now()}`;
    const dispatched = await dispatchMobileTwinFalRender({
      runId,
      reference: ref,
      composition,
      publicOrigin: input.publicOrigin,
      refineNotes: input.refineNotes ?? ['Founder refinement'],
      parentRenderId: parent.id,
    });

    const costRecord: MobileProviderCostRecord = {
      id: `cost-render-${runId}`,
      kind: 'MOBILE_RENDER',
      providerJobRef: dispatched.providerJobRef,
      model: dispatched.model,
      estimatedCostUsd: dispatched.costUsd,
      createdAt: new Date().toISOString(),
    };

    const nextPipeline = appendCost(
      {
        ...pipeline,
        renders: [...pipeline.renders.map((r) => classifyLegacyMobileRender(r)), dispatched.render],
        activeRenderId: dispatched.render.id,
        renderGate: 'FOUNDER_REVIEW',
        artifactsById: {
          ...pipeline.artifactsById,
          [dispatched.render.id]: dispatched.render,
          [dispatched.translationEvidence.id]: dispatched.translationEvidence,
        },
      },
      costRecord,
    );

    return { ...session, mobileTwinPipeline: nextPipeline, updatedAt: new Date().toISOString() };
  }

  if (input.action === 'GENERATE_MOBILE_TWIN_PACKAGE') {
    if (pipeline.renderGate !== 'FROZEN' && pipeline.renderGate !== 'APPROVED') {
      throw new Error('MOBILE_RENDER_NOT_APPROVED');
    }
    const render = pipeline.renders.find((r) => r.id === pipeline.activeRenderId);
    if (!render || render.status !== 'APPROVED') throw new Error('MOBILE_RENDER_NOT_APPROVED');
    const composition = pipeline.compositionStates.find((c) => c.id === render.compositionStateId);
    if (!composition || composition.status !== 'FROZEN') throw new Error('MOBILE_COMPOSITION_STATE_MISSING');
    const visualAuthority = pipeline.implementationVisualAuthority;
    if (!visualAuthority) throw new Error('MOBILE_RENDER_NOT_APPROVED');

    const runId = `r7mf1-pkg-${Date.now()}`;
    const twinDispatched = await dispatchMobileTwinFalBlueprintTwin({
      twinId: runId,
      composition,
      render,
      visualAuthority,
      publicOrigin: input.publicOrigin,
    });

    const twinCost: MobileProviderCostRecord = {
      id: `cost-twin-${runId}`,
      kind: 'BLUEPRINT_TWIN',
      providerJobRef: twinDispatched.blueprint.providerJobRef,
      model: 'openai/gpt-image-2/edit',
      estimatedCostUsd: twinDispatched.costUsd,
      createdAt: new Date().toISOString(),
    };

    assertBlueprintTwinNotRedesigned({
      blueprintObjectCount: composition.objectDefinitions.length,
      compositionObjectCount: composition.objectDefinitions.length,
    });

    let sessionWithTwin: DesignPageAuthorityReviewSession = {
      ...session,
      mobileTwinPipeline: appendCost(
        {
          ...pipeline,
          blueprintTwins: [...pipeline.blueprintTwins, twinDispatched.blueprint],
          artifactsById: {
            ...pipeline.artifactsById,
            [twinDispatched.blueprint.id]: twinDispatched.blueprint,
          },
        },
        twinCost,
      ),
    };

    const twinWritten = {
      publicPath: twinDispatched.blueprint.twinImageUri,
      hash: twinDispatched.blueprint.twinImageHash,
    };

    sessionWithTwin = await finalizeMobileTwinPackageSession(sessionWithTwin, twinWritten, runId);

    const pkgPipeline = sessionWithTwin.mobileTwinPipeline!;
    const pkg = pkgPipeline.packages.at(-1)!;
    const blueprint = twinDispatched.blueprint;
    const rbtr = buildRenderBlueprintTwinReconciliationReceipt({
      id: `rbtr-${runId}`,
      render,
      blueprint,
      composition,
    });
    const pkgUpdated = {
      ...pkg,
      renderBlueprintTwinReconciliationReceiptId: rbtr.id,
      providerLineage: P0_VR_TWIN_V30R7MF1_LINEAGE,
      status: rbtr.result === 'FAIL' ? ('BLOCKED' as const) : pkg.status,
    };

    return {
      ...sessionWithTwin,
      mobileTwinPipeline: {
        ...pkgPipeline,
        packages: pkgPipeline.packages.map((p) => (p.id === pkg.id ? pkgUpdated : p)),
        latestPackageId: pkgUpdated.id,
        artifactsById: {
          ...pkgPipeline.artifactsById,
          [rbtr.id]: rbtr,
          [pkgUpdated.id]: pkgUpdated,
        },
      },
      updatedAt: new Date().toISOString(),
    };
  }

  throw new Error('MOBILE_RENDER_PROVIDER_FAILED');
}
