/**
 * P0.VR.TWINV3.0R7MF3P5 — Light technical blueprint contract
 */

import { describe, expect, it, vi, afterEach } from 'vitest';
import {
  applyOneTimeFounderAuthorityInjection,
  createDesignPageAuthorityReviewSession,
  ensureMobileDesignReferenceAuthority,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/index.js';
import {
  BLUEPRINT_DARK_MODE_VIOLATION,
  buildBlueprintVisualStyleReceipt,
  buildMobileLightTechnicalBlueprintFalPrompt,
  getLockedMobileLightBlueprintStyleContract,
  lightBlueprintPromptForbidsDarkBackground,
  MOBILE_LIGHT_TECHNICAL_BLUEPRINT_CONTRACT_ID,
  R7MF3P5_LIGHT_BLUEPRINT_PROMPT_VERSION,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/blueprintVisualStyleContract.js';
import { applyFounderNbpMobileTwinPromotion } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/applyFounderNbpMobileTwinPromotion.js';
import { getMobileTwinVisualProviderStrategy } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/getMobileTwinVisualProviderStrategy.js';
import { recordFounderTwinCapabilityDecision } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/recordFounderTwinCapabilityDecision.js';
import { runMobileTwinCapabilityTest } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/runMobileTwinCapabilityTest.js';
import { runMobileAtomicTwinGeneration } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/runMobileAtomicTwinGeneration.js';
import { runMobileBlueprintOnlyRetry } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/runMobileBlueprintOnlyRetry.js';
import { reconcileMobileTwinPipelineState } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/reconcileMobileTwinPipelineState.js';
import { runMobileTwinFalPipeline } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/runMobileTwinFalPipeline.js';
import * as falReferenceImageJob from '../shared/site00-visual-generation/falReferenceImageJob.js';
import { resolveFocusedHybridGpt2Model, resolveFocusedHybridNbpModel } from '../shared/site00-visual-generation/twinFocusedHybridBenchmarkCatalog.js';

async function promotedSession() {
  let session = ensureMobileDesignReferenceAuthority(
    applyOneTimeFounderAuthorityInjection(createDesignPageAuthorityReviewSession({ projectId: 'ndxbook' })),
  );
  session = await runMobileTwinCapabilityTest({ session });
  session = recordFounderTwinCapabilityDecision(session, 'FLOW_A_MORE_ACCURATE');
  return applyFounderNbpMobileTwinPromotion(session);
}

describe('P0.VR.TWINV3.0R7MF3P5 light blueprint contract', () => {
  it('1–2 canonical BlueprintVisualStyleContract exists with LIGHT mode', () => {
    const c = getLockedMobileLightBlueprintStyleContract();
    expect(c.id).toBe(MOBILE_LIGHT_TECHNICAL_BLUEPRINT_CONTRACT_ID);
    expect(c.mode).toBe('LIGHT');
    expect(c.status).toBe('LOCKED');
  });

  it('3–5 light prompt requests light background and forbids dark + device mockup', async () => {
    const session = await promotedSession();
    const comp = session.mobileTwinPipeline!.compositionStates[0]!;
    const prompt = buildMobileLightTechnicalBlueprintFalPrompt({
      composition: comp,
      siblingActualRenderId: 'sibling-1',
    });
    expect(prompt).toContain('LIGHT TECHNICAL BLUEPRINT');
    expect(prompt).toContain('white or very light cool');
    expect(lightBlueprintPromptForbidsDarkBackground(prompt)).toBe(true);
    expect(prompt).toContain('phone mockup');
    expect(prompt).toContain('r7mf3p6f1-light-blueprint-v1');
  });

  it('6–9 NBP blueprint provider with LIGHT_TECHNICAL representation when locked', async () => {
    const session = await promotedSession();
    const route = getMobileTwinVisualProviderStrategy(session.mobileTwinPipeline)!;
    expect(route.blueprint.model).toContain('nano-banana');
    expect(route.useLightTechnicalBlueprint).toBe(true);
    expect(session.mobileTwinPipeline!.mobileTwinVisualGenerationStrategy).toBe('ATOMIC_SIBLING_FROM_COMPOSITION');
    expect(route.actual.model).toBe(resolveFocusedHybridNbpModel());
  });

  it('10–12 dark blueprint risk and style receipt', () => {
    const receipt = buildBlueprintVisualStyleReceipt({
      blueprintRenderId: 'bp-1',
      twinImageUri: 'vitest-fal://dark-blueprint-test',
    });
    expect(receipt.darkBackgroundRisk).toBe('HIGH');
    expect(receipt.result).toBe('REVIEW_REQUIRED');
    expect(receipt.failureCode).toBe(BLUEPRINT_DARK_MODE_VIOLATION);
  });

  it('13–15 blueprint-only retry preserves composition and dispatches one blueprint job', async () => {
    let session = await promotedSession();
    const spy = vi.spyOn(falReferenceImageJob, 'runFalReferenceImageJob');
    spy.mockClear();
    session = await runMobileAtomicTwinGeneration({ session });
    const compId = session.mobileTwinPipeline!.activeCompositionStateId!;
    const compHash = session.mobileTwinPipeline!.compositionStates.find((c) => c.id === compId)!.compositionHash;
    const renderCountBefore = session.mobileTwinPipeline!.renders.length;
    spy.mockClear();
    session = await runMobileBlueprintOnlyRetry({ session });
    expect(spy).toHaveBeenCalledTimes(1);
    expect(session.mobileTwinPipeline!.renders.length).toBe(renderCountBefore);
    const bp = session.mobileTwinPipeline!.blueprintTwins.at(-1)!;
    expect(bp.compositionStateId).toBe(compId);
    expect(bp.compositionHash).toBe(compHash);
    spy.mockRestore();
  });

  it('16–17 historical dark variants preserved; cannot auto-become canonical light', async () => {
    const session = await promotedSession();
    const legacy = {
      id: 'legacy-bp',
      compositionStateId: 'c1',
      compositionHash: 'h1',
      implementationRenderId: 'r1',
      twinImageUri: 'vitest-fal://old-dark',
      twinImageHash: 'x',
      provider: 'FAL' as const,
      providerJobRef: 'ref',
      outputRepresentationMode: 'TECHNICAL_BLUEPRINT_RENDER' as const,
      createdAt: new Date().toISOString(),
    };
    const reconciled = reconcileMobileTwinPipelineState({
      ...session.mobileTwinPipeline!,
      blueprintTwins: [legacy],
    });
    expect(reconciled.blueprintTwins[0].blueprintVisualVariant).toBe('HISTORICAL_BLUEPRINT_VARIANT');
    expect(reconciled.blueprintTwins[0].styleContractId).toBeUndefined();
  });

  it('18–20 atomic generation uses light contract; structured source unchanged', async () => {
    const session = await runMobileAtomicTwinGeneration({ session: await promotedSession() });
    const bp = session.mobileTwinPipeline!.blueprintTwins.at(-1)!;
    expect(bp.outputRepresentationMode).toBe('LIGHT_TECHNICAL_BLUEPRINT');
    expect(bp.styleContractId).toBe(MOBILE_LIGHT_TECHNICAL_BLUEPRINT_CONTRACT_ID);
    expect(bp.structuralSource).toBe('FROZEN_COMPOSITION_STATE');
    const surgical = session.mobileTwinPipeline!.artifactsById[
      Object.keys(session.mobileTwinPipeline!.artifactsById).find((k) => k.startsWith('msb-')) ?? ''
    ];
    expect(surgical).toBeTruthy();
  });

  it('21–23 no benchmark GPT2 FLUX desktop on blueprint retry', async () => {
    let session = await runMobileAtomicTwinGeneration({ session: await promotedSession() });
    const spy = vi.spyOn(falReferenceImageJob, 'runFalReferenceImageJob');
    spy.mockClear();
    session = await runMobileBlueprintOnlyRetry({ session });
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0].model).toBe(resolveFocusedHybridNbpModel());
    expect(spy.mock.calls[0][0].model).not.toBe(resolveFocusedHybridGpt2Model());
    expect(session.mobileTwinPipeline!.desktopJobsDispatched).toBe(0);
    await expect(
      runMobileTwinFalPipeline({
        session,
        action: 'RUN_MOBILE_TWIN_FOCUSED_HYBRID_BENCHMARK',
        founderConfirmedSpend: true,
      }),
    ).rejects.toThrow(/MOBILE_TWIN_PROVIDER_STRATEGY_LOCKED/);
    spy.mockRestore();
  });
});
