/**
 * P0.VR.TWINV3.0R7MF3P1 — mobile twin A/B capability test
 */

import { describe, expect, it } from 'vitest';
import {
  applyOneTimeFounderAuthorityInjection,
  createDesignPageAuthorityReviewSession,
  ensureMobileDesignReferenceAuthority,
  P0_VR_TWIN_V30R7MF3P1_LINEAGE,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/index.js';
import { buildTwinCapabilityTestCompositionSnapshot } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/buildTwinCapabilityTestSnapshot.js';
import { buildMobileTwinCompositionState } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/buildMobileTwinCompositionState.js';
import {
  blueprintPromptUsesFrozenComposition,
  blueprintTransformPromptUsesActualImage,
  buildMobileBlueprintTwinFromActualTransformFalPrompt,
  buildMobileBlueprintTwinFromCompositionFalPrompt,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/buildMobileTwinFalPrompts.js';
import { canRunFullMobileTwinPackage } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/mobileTwinVisualStrategy.js';
import { recordFounderTwinCapabilityDecision } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/recordFounderTwinCapabilityDecision.js';
import {
  capabilityTestIdempotencyKey,
  runMobileTwinCapabilityTest,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/runMobileTwinCapabilityTest.js';
import { runMobileTwinFalPipeline } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/runMobileTwinFalPipeline.js';
import { runMobileAtomicTwinGeneration } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/runMobileAtomicTwinGeneration.js';
import { buildTwinVisualMatchReceipt } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/twinVisualMatchReceipt.js';

function lockedSession() {
  return ensureMobileDesignReferenceAuthority(applyOneTimeFounderAuthorityInjection(createDesignPageAuthorityReviewSession()));
}

describe('P0.VR.TWINV3.0R7MF3P1 capability test', () => {
  it('1–3 frozen snapshot shared by flows', () => {
    const session = lockedSession();
    const ref = session.mobileTwinPipeline!.designReference!;
    const comp = buildMobileTwinCompositionState({ runId: 'snap', reference: ref });
    const snap = buildTwinCapabilityTestCompositionSnapshot({ testId: 't1', reference: ref, composition: comp });
    expect(snap.status).toBe('FROZEN');
    expect(snap.compositionHash).toBe(comp.compositionHash);
    const aPrompt = buildMobileBlueprintTwinFromCompositionFalPrompt({ composition: comp, siblingActualRenderId: 'x' });
    const bPrompt = buildMobileBlueprintTwinFromActualTransformFalPrompt({
      composition: comp,
      actualRenderId: 'x',
      actualRenderHash: 'h',
    });
    expect(blueprintPromptUsesFrozenComposition(aPrompt)).toBe(true);
    expect(blueprintTransformPromptUsesActualImage(bPrompt)).toBe(true);
    expect(aPrompt).toContain(comp.compositionHash);
    expect(bPrompt).toContain(comp.compositionHash);
  });

  it('4–9 shared canonical actual + separate flow receipts', async () => {
    const session = await runMobileTwinFalPipeline({
      session: lockedSession(),
      action: 'RUN_MOBILE_TWIN_CAPABILITY_TEST',
      founderConfirmedSpend: true,
    });
    const test = session.mobileTwinPipeline!.twinCapabilityTest!;
    expect(test.actualControlMode).toBe('SHARED_CANONICAL_ACTUAL');
    expect(test.canonicalActualRenderId).toBeTruthy();
    const actual = session.mobileTwinPipeline!.renders.find((r) => r.id === test.canonicalActualRenderId)!;
    const flowA = session.mobileTwinPipeline!.artifactsById[test.flowAReceiptId] as { flowMode: string };
    const flowB = session.mobileTwinPipeline!.artifactsById[test.flowBReceiptId] as { flowMode: string };
    expect(flowA.flowMode).toBe('TWIN_FLOW_A_ATOMIC_SIBLINGS');
    expect(flowB.flowMode).toBe('TWIN_FLOW_B_ACTUAL_TO_BLUEPRINT_TRANSFORM');
    expect(flowB.actualSourceRenderId).toBe(actual.id);
    const bpB = session.mobileTwinPipeline!.blueprintTwins.find((b) => b.id === test.flowBBlueprintId)!;
    expect(bpB.structuralSource).toBe('ACTUAL_RENDER_PIXELS');
    expect(session.mobileTwinPipeline!.packages.length).toBe(0);
  });

  it('10–12 machine score cannot auto-promote; founder selects strategy', async () => {
    let session = await runMobileTwinCapabilityTest({ session: lockedSession() });
    const match = buildTwinVisualMatchReceipt({
      id: 'm',
      flowId: 'TWIN_FLOW_A_ATOMIC_SIBLINGS',
      actual: session.mobileTwinPipeline!.renders.at(-1)!,
      blueprint: session.mobileTwinPipeline!.blueprintTwins.at(-1)!,
    });
    expect(match.machinePass).toBe(false);
    session = recordFounderTwinCapabilityDecision(session, 'FLOW_B_MORE_ACCURATE');
    expect(session.mobileTwinPipeline!.mobileTwinVisualGenerationStrategy).toBe('ACTUAL_IMAGE_TO_BLUEPRINT_TRANSFORM');
  });

  it('13–16 full package blocked; no assets/desktop', async () => {
    const session = lockedSession();
    expect(canRunFullMobileTwinPackage(session.mobileTwinPipeline!.mobileTwinVisualGenerationStrategy)).toBe(false);
    await expect(runMobileAtomicTwinGeneration({ session })).rejects.toThrow(/MOBILE_TWIN_VISUAL_STRATEGY_UNRESOLVED/);
    expect(P0_VR_TWIN_V30R7MF3P1_LINEAGE).toContain('R7MF3P1');
  });

  it('17 idempotency prevents duplicate control run', async () => {
    let session = await runMobileTwinCapabilityTest({ session: lockedSession() });
    const jobs = session.mobileTwinPipeline!.falJobsDispatched;
    session = await runMobileTwinCapabilityTest({ session });
    expect(session.mobileTwinPipeline!.falJobsDispatched).toBe(jobs);
    const ref = session.mobileTwinPipeline!.designReference!.id;
    const hash = session.mobileTwinPipeline!.twinCapabilityTest!.snapshot.compositionHash;
    expect(capabilityTestIdempotencyKey(ref, hash)).toContain('capability-test');
  });
});
