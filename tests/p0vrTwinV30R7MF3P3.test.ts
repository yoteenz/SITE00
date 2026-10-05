/**
 * P0.VR.TWINV3.0R7MF3P3 — GPT2 / NBP focused hybrid benchmark
 */

import { describe, expect, it } from 'vitest';
import {
  applyOneTimeFounderAuthorityInjection,
  createDesignPageAuthorityReviewSession,
  ensureMobileDesignReferenceAuthority,
  P0_VR_TWIN_V30R7MF3P3_LINEAGE,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/index.js';
import { buildNbpCorrectedActualFalPrompt } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/buildNbpCorrectedActualPrompt.js';
import {
  ACTUAL_PRESENTATION_VIOLATION_DEVICE_FRAME,
  evaluateActualPresentationFirewall,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/actualPresentationFirewall.js';
import { recordFounderTwinCapabilityDecision } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/recordFounderTwinCapabilityDecision.js';
import { recordFounderMobileTwinRenderStrategy } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/recordFounderMobileTwinRenderStrategy.js';
import { runMobileTwinCapabilityTest } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/runMobileTwinCapabilityTest.js';
import { runMobileTwinFocusedHybridBenchmark } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/runMobileTwinFocusedHybridBenchmark.js';
import { runMobileTwinProviderBenchmark } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/runMobileTwinProviderBenchmark.js';
import type { ProviderStrategyBenchmarkReceipt } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/twinFocusedHybridBenchmarkTypes.js';
import {
  focusedHybridIdempotencyKey,
  FOCUSED_HYBRID_ACTIVE_MODELS,
  isFocusedHybridProviderModel,
  resolveFocusedHybridGpt2Model,
  resolveFocusedHybridNbpModel,
  TWIN_FOCUSED_HYBRID_PROMPT_CONTRACT_VERSION,
} from '../shared/site00-visual-generation/twinFocusedHybridBenchmarkCatalog.js';

function lockedSession() {
  return ensureMobileDesignReferenceAuthority(applyOneTimeFounderAuthorityInjection(createDesignPageAuthorityReviewSession()));
}

async function methodAWithP2Baseline() {
  let session = await runMobileTwinCapabilityTest({ session: lockedSession() });
  session = recordFounderTwinCapabilityDecision(session, 'FLOW_A_MORE_ACCURATE');
  session = await runMobileTwinProviderBenchmark({ session });
  return session;
}

describe('P0.VR.TWINV3.0R7MF3P3 focused hybrid', () => {
  it('1–2 only GPT2 and NBP models are active in focused hybrid catalog', () => {
    expect(resolveFocusedHybridGpt2Model()).toBe(FOCUSED_HYBRID_ACTIVE_MODELS.GPT2);
    expect(resolveFocusedHybridNbpModel()).toContain('nano-banana');
    expect(isFocusedHybridProviderModel(FOCUSED_HYBRID_ACTIVE_MODELS.GPT2)).toBe(true);
    expect(isFocusedHybridProviderModel(FOCUSED_HYBRID_ACTIVE_MODELS.NBP)).toBe(true);
    expect(isFocusedHybridProviderModel('fal-ai/flux-2-max/edit')).toBe(false);
  });

  it('3–5 shared snapshot drives all strategies with same composition ids', async () => {
    const session = await runMobileTwinFocusedHybridBenchmark({ session: await methodAWithP2Baseline() });
    const fh = session.mobileTwinPipeline!.focusedHybridBenchmark!;
    const hash = fh.snapshot.compositionHash;
    const compId = fh.snapshot.compositionStateId;
    expect(fh.snapshot.promptContractVersion).toBe(TWIN_FOCUSED_HYBRID_PROMPT_CONTRACT_VERSION);
    for (const key of ['GPT2_FULL_PAIR', 'NBP_FULL_PAIR_CORRECTED', 'GPT2_ACTUAL__NBP_BLUEPRINT'] as const) {
      const row = fh.strategies[key];
      if (!row.actualRenderId) continue;
      const actual = session.mobileTwinPipeline!.renders.find((r) => r.id === row.actualRenderId)!;
      expect(actual.compositionHash).toBe(hash);
      expect(actual.compositionStateId).toBe(compId);
    }
  });

  it('6 GPT2 control pair reused without regenerating control', async () => {
    const before = await methodAWithP2Baseline();
    const baselineId = before.mobileTwinPipeline!.providerBenchmark!.baselineActualRenderId;
    const session = await runMobileTwinFocusedHybridBenchmark({ session: before });
    const control = session.mobileTwinPipeline!.focusedHybridBenchmark!.strategies.GPT2_FULL_PAIR;
    expect(control.status).toBe('REUSED_CONTROL');
    expect(control.actualRenderId).toBe(baselineId);
  });

  it('7–8 NBP full uses NBP for both; hybrid uses GPT2 actual + NBP blueprint', async () => {
    const session = await runMobileTwinFocusedHybridBenchmark({ session: await methodAWithP2Baseline() });
    const fh = session.mobileTwinPipeline!.focusedHybridBenchmark!;
    const nbp = fh.strategies.NBP_FULL_PAIR_CORRECTED;
    const hybrid = fh.strategies.GPT2_ACTUAL__NBP_BLUEPRINT;
    expect(nbp.status === 'COMPLETE' || nbp.status === 'REVIEW_REQUIRED').toBe(true);
    expect(hybrid.status).toBe('COMPLETE');
    const nbpReceipt = session.mobileTwinPipeline!.artifactsById[nbp.receiptId!] as ProviderStrategyBenchmarkReceipt;
    const hybridReceipt = session.mobileTwinPipeline!.artifactsById[hybrid.receiptId!] as ProviderStrategyBenchmarkReceipt;
    expect(nbpReceipt.actualModel).toContain('nano-banana');
    expect(nbpReceipt.blueprintModel).toContain('nano-banana');
    expect(hybridReceipt.actualModel).toBe(FOCUSED_HYBRID_ACTIVE_MODELS.GPT2);
    expect(hybridReceipt.blueprintModel).toContain('nano-banana');
    expect(hybridReceipt.canonicalPath).toBe(true);
  });

  it('9 NBP corrected actual prompt includes presentation firewall', async () => {
    const session = await methodAWithP2Baseline();
    const ref = session.mobileTwinPipeline!.designReference!;
    const comp = session.mobileTwinPipeline!.compositionStates[0]!;
    const prompt = buildNbpCorrectedActualFalPrompt({ reference: ref, composition: comp });
    expect(prompt).toContain('PRESENTATION FIREWALL');
    expect(prompt).toContain('phone mockup');
  });

  it('10 device mockup simulation triggers ACTUAL_PRESENTATION_VIOLATION_DEVICE_FRAME', () => {
    const fw = evaluateActualPresentationFirewall({
      strategyId: 'NBP_FULL_PAIR_CORRECTED',
      actualPrompt: buildNbpCorrectedActualFalPrompt({
        reference: {
          id: 'r1',
          projectId: 'ndxbook',
          workspaceType: 'DESIGN_PAGE_V3',
          viewport: 'MOBILE',
          sourceAuthorityId: 'a',
          sourceImageId: 'i',
          sourceImageHash: 'h',
          sourceImageUri: '/x.jpg',
          featureManifestVersion: 'v1',
          projectCreativeContextVersion: 'v1',
          founderApproved: true,
          approvedAt: '',
          status: 'REFERENCE_LOCKED',
          version: 1,
        },
        composition: {
          id: 'c1',
          projectId: 'ndxbook',
          workspaceType: 'DESIGN_PAGE_V3',
          viewport: 'MOBILE',
          referenceAuthorityId: 'r1',
          featureManifestVersion: 'v1',
          projectCreativeContextVersion: 'v1',
          hostProjectContractVersion: 'v1',
          compositionVersion: 1,
          objectDefinitions: [],
          regionDefinitions: [],
          typographyDefinitions: [],
          assetSlots: [],
          functionTargets: [],
          featureBindings: [],
          ownershipBindings: [],
          stateDefinitions: [],
          interactionDefinitions: [],
          relationships: [],
          zOrder: [],
          responsiveIntent: 'MOBILE_ONLY',
          providerMetadata: { provider: 'LOCAL', model: 'x', jobRef: null },
          compositionHash: 'hash',
          status: 'FROZEN',
          createdAt: '',
        },
      }),
      renderImageUri: 'vitest-fal://device-frame-violation',
      providerSettings: { simulateDeviceFrame: true },
    });
    expect(fw.pass).toBe(false);
    expect(fw.errorCode).toBe(ACTUAL_PRESENTATION_VIOLATION_DEVICE_FRAME);
  });

  it('16–20 founder strategy selection persists MobileTwinRenderStrategy', async () => {
    let session = await runMobileTwinFocusedHybridBenchmark({ session: await methodAWithP2Baseline() });
    session = recordFounderMobileTwinRenderStrategy(session, 'HYBRID_GPT2_ACTUAL__NBP_BLUEPRINT');
    expect(session.mobileTwinPipeline!.mobileTwinRenderStrategy?.strategy).toBe('HYBRID_GPT2_ACTUAL__NBP_BLUEPRINT');
    expect(session.mobileTwinPipeline!.mobileTwinRenderStrategy?.status).toBe('PROVISIONAL_WINNER');
    session = recordFounderMobileTwinRenderStrategy(session, 'UNRESOLVED');
    expect(session.mobileTwinPipeline!.mobileTwinRenderStrategy).toBeNull();
  });

  it('21–23 no desktop jobs, no package fan-out', async () => {
    const session = await runMobileTwinFocusedHybridBenchmark({ session: await methodAWithP2Baseline() });
    expect(session.mobileTwinPipeline!.desktopJobsDispatched).toBe(0);
    expect(session.mobileTwinPipeline!.packages.length).toBe(0);
  });

  it('24–26 cost tracked; machine cannot auto-pass', async () => {
    const session = await runMobileTwinFocusedHybridBenchmark({ session: await methodAWithP2Baseline() });
    const fh = session.mobileTwinPipeline!.focusedHybridBenchmark!;
    expect(fh.totalBenchmarkCostUsd).toBeGreaterThan(0);
    const receipt = session.mobileTwinPipeline!.artifactsById[
      fh.strategies.GPT2_ACTUAL__NBP_BLUEPRINT.receiptId!
    ] as ProviderStrategyBenchmarkReceipt;
    expect(receipt.machinePass).toBe(false);
    expect(receipt.machineRecommendation).toBe('REVIEW_REQUIRED');
  });

  it('idempotency key uses snapshot + strategy + sprint version', () => {
    const key = focusedHybridIdempotencyKey('snap-1', 'NBP_FULL_PAIR_CORRECTED');
    expect(key).toContain('NBP_FULL_PAIR_CORRECTED');
    expect(key).toContain('snap-1');
  });

  it('lineage constant exported', () => {
    expect(P0_VR_TWIN_V30R7MF3P3_LINEAGE).toBe('P0.VR.TWINV3.0R7MF3P3');
  });
});
