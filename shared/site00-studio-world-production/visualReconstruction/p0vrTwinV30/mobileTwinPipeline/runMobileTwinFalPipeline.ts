import type { DesignPageAuthorityReviewSession } from '../types.js';
import { P0_VR_TWIN_V30R7MF1_LINEAGE } from '../constants.js';
import { ensureMobileDesignReferenceAuthority } from './mobileDesignReferenceAuthority.js';
import { buildMobileTwinCompositionState } from './buildMobileTwinCompositionState.js';
import { runMobileCompositionPreflight } from './mobileCompositionPreflight.js';
import { dispatchMobileTwinFalRender } from './dispatchMobileTwinFalRender.js';
import { dispatchMobileTwinFalBlueprintTwin } from './dispatchMobileTwinFalBlueprintTwin.js';
import { classifyLegacyMobileRender } from './mobileRenderClassification.js';
import { finalizeMobileTwinPackageSession } from './runGenerateMobileTwinPackageCore.js';
import {
  assertBlueprintTwinNotRedesigned,
  buildRenderBlueprintTwinReconciliationReceipt,
} from './mobileTwinReconciliation.js';
import type { MobileProviderCostRecord } from './types.js';

export type MobileTwinFalAction =
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
