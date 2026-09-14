/**
 * P0.VR.TWINV3.0R7MF3P4 — Founder NBP full-pair promotion + locked Mobile routing
 */

import { describe, expect, it, vi, afterEach } from 'vitest';
import {
  applyOneTimeFounderAuthorityInjection,
  createDesignPageAuthorityReviewSession,
  ensureMobileDesignReferenceAuthority,
  P0_VR_TWIN_V30R7MF3P4_LINEAGE,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/index.js';
import {
  applyFounderNbpMobileTwinPromotion,
  normalizeFounderNbpPromotionOnLoad,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/applyFounderNbpMobileTwinPromotion.js';
import { getMobileTwinVisualProviderStrategy } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/getMobileTwinVisualProviderStrategy.js';
import { assertLockedMobileProviderAvailable } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/getMobileTwinVisualProviderStrategy.js';
import { buildNbpCorrectedActualFalPrompt } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/buildNbpCorrectedActualPrompt.js';
import {
  ACTUAL_PRESENTATION_VIOLATION_DEVICE_FRAME,
  evaluateActualPresentationFirewall,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/actualPresentationFirewall.js';
import { recordFounderTwinCapabilityDecision } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/recordFounderTwinCapabilityDecision.js';
import { recordFounderMobileTwinRenderStrategy } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/recordFounderMobileTwinRenderStrategy.js';
import { runMobileTwinCapabilityTest } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/runMobileTwinCapabilityTest.js';
import { runMobileTwinFocusedHybridBenchmark } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/runMobileTwinFocusedHybridBenchmark.js';
import { runMobileAtomicTwinGeneration } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/runMobileAtomicTwinGeneration.js';
import { runMobileTwinFalPipeline } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/runMobileTwinFalPipeline.js';
import { getFocusedHybridBenchmarkGate } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/focusedHybridBenchmarkGate.js';
import { canRunFullMobileTwinPackage } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/mobileTwinVisualStrategy.js';
import { reconcileMobileTwinPipelineState } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/reconcileMobileTwinPipelineState.js';
import { HISTORICAL_PROVIDER_BENCHMARK } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/mobileTwinProviderPromotionTypes.js';
import {
  resolveFocusedHybridGpt2Model,
  resolveFocusedHybridNbpModel,
} from '../shared/site00-visual-generation/twinFocusedHybridBenchmarkCatalog.js';
import * as falReferenceImageJob from '../shared/site00-visual-generation/falReferenceImageJob.js';

function lockedSession() {
  return ensureMobileDesignReferenceAuthority(
    applyOneTimeFounderAuthorityInjection(createDesignPageAuthorityReviewSession({ projectId: 'ndxbook' })),
  );
}

async function methodASession() {
  let session = await runMobileTwinCapabilityTest({ session: lockedSession() });
  session = recordFounderTwinCapabilityDecision(session, 'FLOW_A_MORE_ACCURATE');
  return session;
}

async function promotedSession() {
  return applyFounderNbpMobileTwinPromotion(await methodASession());
}

describe('P0.VR.TWINV3.0R7MF3P4 NBP mobile provider lock', () => {
  it('1 founder promotion creates FounderTwinProviderPromotionReceipt', async () => {
    const session = await promotedSession();
    const id = session.mobileTwinPipeline!.founderTwinProviderPromotionReceiptId!;
    const receipt = session.mobileTwinPipeline!.artifactsById[id];
    expect(receipt).toBeTruthy();
    expect((receipt as { selectionMethod?: string }).selectionMethod).toBe('FOUNDER_MANUAL_PROMOTION');
    expect((receipt as { status?: string }).status).toBe('ACTIVE');
  });

  it('2–5 mobile strategy NBP_FULL_PAIR with NBP models and LOCKED_MOBILE_STRATEGY', async () => {
    const session = await promotedSession();
    const nbp = resolveFocusedHybridNbpModel();
    const rs = session.mobileTwinPipeline!.mobileTwinRenderStrategy!;
    expect(rs.strategy).toBe('NBP_FULL_PAIR');
    expect(rs.actualModel).toBe(nbp);
    expect(rs.blueprintModel).toBe(nbp);
    expect(rs.status).toBe('LOCKED_MOBILE_STRATEGY');
    const route = getMobileTwinVisualProviderStrategy(session.mobileTwinPipeline)!;
    expect(route.strategy).toBe('NBP_FULL_PAIR');
    expect(route.actual.model).toBe(nbp);
    expect(route.blueprint.model).toBe(nbp);
    expect(route.locked).toBe(true);
  });

  it('6–10 normal atomic generation uses two NBP jobs only (no GPT2/FLUX)', async () => {
    const session = await promotedSession();
    const spy = vi.spyOn(falReferenceImageJob, 'runFalReferenceImageJob');
    spy.mockClear();
    const nbp = resolveFocusedHybridNbpModel();
    const gpt2 = resolveFocusedHybridGpt2Model();
    const after = await runMobileAtomicTwinGeneration({ session });
    expect(spy).toHaveBeenCalledTimes(2);
    for (const call of spy.mock.calls) {
      expect(call[0].model).toBe(nbp);
      expect(call[0].model).not.toBe(gpt2);
      expect(String(call[0].model)).not.toContain('flux');
    }
    expect(after.mobileTwinPipeline!.desktopJobsDispatched).toBe(0);
    spy.mockRestore();
  });

  it('7 benchmark dispatch blocked when provider locked', async () => {
    const session = await promotedSession();
    await expect(
      runMobileTwinFalPipeline({
        session,
        action: 'RUN_MOBILE_TWIN_FOCUSED_HYBRID_BENCHMARK',
        founderConfirmedSpend: true,
      }),
    ).rejects.toThrow(/MOBILE_TWIN_PROVIDER_STRATEGY_LOCKED/);
  });

  it('11 method remains ATOMIC_SIBLING_FROM_COMPOSITION', async () => {
    const session = await promotedSession();
    expect(session.mobileTwinPipeline!.mobileTwinVisualGenerationStrategy).toBe('ATOMIC_SIBLING_FROM_COMPOSITION');
  });

  it('12–13 NBP page-only firewall still active on actual prompt', async () => {
    const session = await promotedSession();
    const ref = session.mobileTwinPipeline!.designReference!;
    const comp = session.mobileTwinPipeline!.compositionStates[0]!;
    const prompt = buildNbpCorrectedActualFalPrompt({ reference: ref, composition: comp });
    expect(prompt).toContain('PRESENTATION FIREWALL');
    const violation = evaluateActualPresentationFirewall({
      strategyId: 'NBP_FULL_PAIR_CORRECTED',
      actualPrompt: prompt,
      renderImageUri: 'vitest-fal://phone-mockup-test',
    });
    expect(violation.pass).toBe(false);
    expect(violation.errorCode).toBe(ACTUAL_PRESENTATION_VIOLATION_DEVICE_FRAME);
  });

  it('14–15 benchmark history preserved; provisional selection cannot override lock', async () => {
    let session = await runMobileTwinFocusedHybridBenchmark({ session: await methodASession() });
    session = applyFounderNbpMobileTwinPromotion(session);
    expect(session.mobileTwinPipeline!.focusedHybridBenchmark).toBeTruthy();
    expect(session.mobileTwinPipeline!.focusedHybridBenchmark!.benchmarkRoutingRole).toBe(
      HISTORICAL_PROVIDER_BENCHMARK,
    );
    expect(() => recordFounderMobileTwinRenderStrategy(session, 'GPT2_FULL_PAIR')).toThrow(
      /MOBILE_TWIN_PROVIDER_STRATEGY_LOCKED/,
    );
    const reconciled = reconcileMobileTwinPipelineState(session.mobileTwinPipeline!);
    expect(reconciled.mobileTwinRenderStrategy!.status).toBe('LOCKED_MOBILE_STRATEGY');
    expect(reconciled.mobileTwinRenderStrategy!.strategy).toBe('NBP_FULL_PAIR');
  });

  it('16 NBP provider failure fails closed (no silent GPT2 fallback)', async () => {
    const session = await promotedSession();
    vi.spyOn(falReferenceImageJob, 'runFalReferenceImageJob').mockRejectedValueOnce(new Error('FAL down'));
    await expect(runMobileAtomicTwinGeneration({ session })).resolves.toMatchObject({
      mobileTwinPipeline: expect.objectContaining({
        atomicRuns: expect.arrayContaining([expect.objectContaining({ status: 'FAILED' })]),
      }),
    });
    vi.restoreAllMocks();
  });

  it('17 full mobile twin package path unblocked after promotion', async () => {
    const session = await promotedSession();
    expect(
      canRunFullMobileTwinPackage(session.mobileTwinPipeline!.mobileTwinVisualGenerationStrategy, session.mobileTwinPipeline),
    ).toBe(true);
  });

  it('18–19 structured blueprint from composition; blueprint raster not machine source', async () => {
    const session = await runMobileAtomicTwinGeneration({ session: await promotedSession() });
    const bp = session.mobileTwinPipeline!.blueprintTwins.at(-1)!;
    expect(bp.structuralSource).toBe('FROZEN_COMPOSITION_STATE');
    expect(bp.outputRepresentationMode).toBe('TECHNICAL_BLUEPRINT_RENDER');
  });

  it('20 asset fan-out remains cost-gated on capability test', async () => {
    const session = await promotedSession();
    expect(session.mobileTwinPipeline!.twinCapabilityTest?.fullPackageFanoutBlocked ?? true).toBe(true);
  });

  it('21–22 desktop routing unchanged (zero jobs)', async () => {
    const session = await promotedSession();
    expect(session.mobileTwinPipeline!.desktopStatus).toBe('DEFERRED');
    expect(session.mobileTwinPipeline!.desktopJobsDispatched).toBe(0);
  });

  it('24 focused hybrid gate closed; normalize on load for ndxbook pilot', async () => {
    const session = normalizeFounderNbpPromotionOnLoad(await methodASession());
    expect(session.mobileTwinPipeline!.mobileTwinProviderLock?.locked).toBe(true);
    const gate = getFocusedHybridBenchmarkGate(session.mobileTwinPipeline);
    expect(gate.canRun).toBe(false);
    expect(gate.reason).toBe('PROVIDER_STRATEGY_LOCKED');
  });

  it('lineage artifact recorded', async () => {
    const session = await promotedSession();
    expect(session.mobileTwinPipeline!.artifactsById[`lineage-${P0_VR_TWIN_V30R7MF3P4_LINEAGE}`]).toBeTruthy();
  });
});

describe('P0.VR.TWINV3.0R7MF3P4 locked provider availability', () => {
  const prev = process.env.SITE00_TWIN_BENCHMARK_NBPRO_MODEL;

  afterEach(() => {
    if (prev === undefined) delete process.env.SITE00_TWIN_BENCHMARK_NBPRO_MODEL;
    else process.env.SITE00_TWIN_BENCHMARK_NBPRO_MODEL = prev;
  });

  it('16b assertLockedMobileProviderAvailable fails closed when NBP marked unavailable', async () => {
    process.env.SITE00_TWIN_BENCHMARK_NBPRO_MODEL = 'UNAVAILABLE';
    const session = await promotedSession();
    expect(() => assertLockedMobileProviderAvailable(session.mobileTwinPipeline!)).toThrow(
      /MOBILE_TWIN_LOCKED_PROVIDER_UNAVAILABLE/,
    );
  });
});
