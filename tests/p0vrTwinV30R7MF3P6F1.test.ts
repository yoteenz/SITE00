/**
 * P0.VR.TWINV3.0R7MF3P6F1 — Blueprint-only light style correction + same-run retry
 */

import { describe, expect, it, vi, afterEach } from 'vitest';
import {
  applyOneTimeFounderAuthorityInjection,
  createDesignPageAuthorityReviewSession,
  ensureMobileDesignReferenceAuthority,
  P0_VR_TWIN_V30R7MF3P6F1_LINEAGE,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/index.js';
import {
  BLUEPRINT_DARK_MODE_VIOLATION,
  buildBlueprintVisualStyleReceipt,
  buildMobileLightTechnicalBlueprintFalPrompt,
  classifyBlueprintAsHistoricalVariant,
  classifyDominantBackground,
  getLockedMobileLightBlueprintStyleContract,
  HISTORICAL_BLUEPRINT_VARIANT,
  lightBlueprintPromptForbidsDarkBackground,
  lightBlueprintPromptStartsWithLightBackgroundRequirement,
  MOBILE_LIGHT_TECHNICAL_BLUEPRINT_CONTRACT_ID,
  R7MF3P6F1_LIGHT_BLUEPRINT_PROMPT_VERSION,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/blueprintVisualStyleContract.js';
import { BLUEPRINT_RETRY_ACTUAL_REGENERATION_VIOLATION } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/blueprintOnlyRetryGuards.js';
import { applyFounderNbpMobileTwinPromotion } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/applyFounderNbpMobileTwinPromotion.js';
import { recordFounderTwinCapabilityDecision } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/recordFounderTwinCapabilityDecision.js';
import { runMobileTwinCapabilityTest } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/runMobileTwinCapabilityTest.js';
import { runMobileAtomicTwinGeneration } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/runMobileAtomicTwinGeneration.js';
import { runMobileBlueprintOnlyRetry } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/runMobileBlueprintOnlyRetry.js';
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

describe('P0.VR.TWINV3.0R7MF3P6F1 light blueprint retry', () => {
  it('1–2 dark blueprint classified; preserved as historical', () => {
    const receipt = buildBlueprintVisualStyleReceipt({
      blueprintRenderId: 'bp-dark',
      twinImageUri: 'vitest-fal://dark-blueprint-test',
    });
    expect(receipt.failureCode).toBe(BLUEPRINT_DARK_MODE_VIOLATION);
    const historical = classifyBlueprintAsHistoricalVariant({
      id: 'bp-dark',
      compositionStateId: 'c1',
      compositionHash: 'h1',
      implementationRenderId: 'r1',
      twinImageUri: 'vitest-fal://dark-blueprint-test',
      twinImageHash: 'x',
      provider: 'FAL',
      providerJobRef: 'ref',
      blueprintStyleStatus: 'REVIEW_REQUIRED',
      styleFailureCode: BLUEPRINT_DARK_MODE_VIOLATION,
      createdAt: new Date().toISOString(),
    });
    expect(historical.blueprintVisualVariant).toBe(HISTORICAL_BLUEPRINT_VARIANT);
  });

  it('3–5 contract id and prompt priority + negative style', async () => {
    const session = await promotedSession();
    const comp = session.mobileTwinPipeline!.compositionStates[0]!;
    const prompt = buildMobileLightTechnicalBlueprintFalPrompt({
      composition: comp,
      siblingActualRenderId: 'sibling-1',
      styleReferenceAttached: true,
    });
    expect(getLockedMobileLightBlueprintStyleContract().id).toBe(MOBILE_LIGHT_TECHNICAL_BLUEPRINT_CONTRACT_ID);
    expect(prompt).toContain(R7MF3P6F1_LIGHT_BLUEPRINT_PROMPT_VERSION);
    expect(lightBlueprintPromptStartsWithLightBackgroundRequirement(prompt)).toBe(true);
    expect(lightBlueprintPromptForbidsDarkBackground(prompt)).toBe(true);
    expect(prompt).toContain('STYLE_REFERENCE_ONLY');
  });

  it('6–8 retry dispatches one NBP blueprint job, zero actual jobs', async () => {
    let session = await promotedSession();
    session = await runMobileAtomicTwinGeneration({ session });
    const atomicRunId = session.mobileTwinPipeline!.activeAtomicRunId!;
    const compId = session.mobileTwinPipeline!.activeCompositionStateId!;
    const compHash = session.mobileTwinPipeline!.compositionStates.find((c) => c.id === compId)!.compositionHash;
    const actualId = session.mobileTwinPipeline!.activeRenderId!;
    const rendersBefore = session.mobileTwinPipeline!.renders.length;
    const spy = vi.spyOn(falReferenceImageJob, 'runFalReferenceImageJob');
    spy.mockClear();
    session = await runMobileBlueprintOnlyRetry({ session });
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0].model).toBe(resolveFocusedHybridNbpModel());
    expect(session.mobileTwinPipeline!.renders.length).toBe(rendersBefore);
    expect(session.mobileTwinPipeline!.activeAtomicRunId).toBe(atomicRunId);
    expect(session.mobileTwinPipeline!.activeCompositionStateId).toBe(compId);
    const bp = session.mobileTwinPipeline!.blueprintTwins.at(-1)!;
    expect(bp.compositionStateId).toBe(compId);
    expect(bp.compositionHash).toBe(compHash);
    expect(bp.implementationRenderId).toBe(actualId);
    spy.mockRestore();
  });

  it('9–14 historical preserved; light pass promotes active pointer', async () => {
    let session = await promotedSession();
    session = await runMobileAtomicTwinGeneration({ session });
    const priorBpId = session.mobileTwinPipeline!.blueprintTwins.at(-1)!.id;
    vi.spyOn(falReferenceImageJob, 'runFalReferenceImageJob').mockResolvedValue({
      url: 'vitest-fal://light-blueprint-pass',
      jobRef: 'job-light',
      model: resolveFocusedHybridNbpModel(),
    });
    session = await runMobileBlueprintOnlyRetry({ session });
    const prior = session.mobileTwinPipeline!.blueprintTwins.find((b) => b.id === priorBpId)!;
    expect(prior.blueprintVisualVariant).toBe(HISTORICAL_BLUEPRINT_VARIANT);
    const active = session.mobileTwinPipeline!.blueprintTwins.at(-1)!;
    expect(active.blueprintVisualVariant).toBe('ACTIVE_BLUEPRINT_TWIN');
    const pair = session.mobileTwinPipeline!.visualPairs.find(
      (p) => p.atomicRunId === session.mobileTwinPipeline!.activeAtomicRunId,
    );
    expect(pair?.blueprintRenderId).toBe(active.id);
    expect(pair?.status).toBe('FOUNDER_REVIEW_READY');
  });

  it('15 dark retry not auto-promoted to ready pair', async () => {
    let session = await promotedSession();
    session = await runMobileAtomicTwinGeneration({ session });
    vi.spyOn(falReferenceImageJob, 'runFalReferenceImageJob').mockResolvedValue({
      url: 'vitest-fal://dark-blueprint-test',
      jobRef: 'job-dark',
      model: resolveFocusedHybridNbpModel(),
    });
    session = await runMobileBlueprintOnlyRetry({ session });
    const bp = session.mobileTwinPipeline!.blueprintTwins.at(-1)!;
    expect(bp.blueprintStyleStatus).toBe('REVIEW_REQUIRED');
    expect(classifyDominantBackground({ twinImageUri: bp.twinImageUri })).toBe('DARK');
    const pair = session.mobileTwinPipeline!.visualPairs.find(
      (p) => p.atomicRunId === session.mobileTwinPipeline!.activeAtomicRunId,
    );
    expect(pair?.status).toBe('BLOCKED');
  });

  it('16–18 package not fully regenerated; structured source unchanged', async () => {
    let session = await promotedSession();
    session = await runMobileAtomicTwinGeneration({ session });
    const pkgCountBefore = session.mobileTwinPipeline!.packages.length;
    const msbBefore = Object.keys(session.mobileTwinPipeline!.artifactsById).filter((k) => k.startsWith('msb-')).length;
    vi.spyOn(falReferenceImageJob, 'runFalReferenceImageJob').mockResolvedValue({
      url: 'vitest-fal://light-blueprint-pass',
      jobRef: 'job-light-2',
      model: resolveFocusedHybridNbpModel(),
    });
    session = await runMobileBlueprintOnlyRetry({ session });
    expect(session.mobileTwinPipeline!.packages.length).toBe(pkgCountBefore);
    const msbAfter = Object.keys(session.mobileTwinPipeline!.artifactsById).filter((k) => k.startsWith('msb-')).length;
    expect(msbAfter).toBe(msbBefore);
    const bp = session.mobileTwinPipeline!.blueprintTwins.at(-1)!;
    expect(bp.structuralSource).toBe('FROZEN_COMPOSITION_STATE');
  });

  it('19–22 no benchmark GPT2 FLUX desktop on retry', async () => {
    let session = await runMobileAtomicTwinGeneration({ session: await promotedSession() });
    const spy = vi.spyOn(falReferenceImageJob, 'runFalReferenceImageJob');
    spy.mockClear();
    session = await runMobileBlueprintOnlyRetry({ session });
    expect(spy.mock.calls.every((c) => c[0].model !== resolveFocusedHybridGpt2Model())).toBe(true);
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

  it('23 lineage artifact + guard constant exported', async () => {
    const session = await runMobileBlueprintOnlyRetry({ session: await runMobileAtomicTwinGeneration({ session: await promotedSession() }) });
    expect(session.mobileTwinPipeline!.artifactsById[`lineage-${P0_VR_TWIN_V30R7MF3P6F1_LINEAGE}`]).toBeTruthy();
    expect(BLUEPRINT_RETRY_ACTUAL_REGENERATION_VIOLATION).toContain('ACTUAL_REGENERATION');
  });
});
