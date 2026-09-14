/**
 * P0.VR.TWINV3.0R7MF3 — atomic mobile twin generation
 */

import { describe, expect, it, vi } from 'vitest';
import {
  applyOneTimeFounderAuthorityInjection,
  createDesignPageAuthorityReviewSession,
  ensureMobileDesignReferenceAuthority,
  FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER,
  P0_VR_TWIN_V30R7MF3_LINEAGE,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/index.js';
import {
  approveMobileTwinPackage,
  blueprintPromptUsesFrozenComposition,
  buildMobileBlueprintTwinFromCompositionFalPrompt,
  buildMobileTwinCompositionState,
  canApproveMobileTwinPackage,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/index.js';
import {
  buildMobileImplementationRenderFalPrompt,
  promptIncludesAntiCloneInstruction,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/buildMobileTwinFalPrompts.js';
import { runMobileTwinFalPipeline } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/runMobileTwinFalPipeline.js';
import { buildTwinVisualCompositionReceipt } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/twinVisualCompositionReceipt.js';
import { canGenerateMobileTwinPackage } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/runGenerateMobileTwinPackage.js';

function lockedSession() {
  return ensureMobileDesignReferenceAuthority(applyOneTimeFounderAuthorityInjection(createDesignPageAuthorityReviewSession()));
}

describe('P0.VR.TWINV3.0R7MF3 atomic mobile twin', () => {
  it('1–6 immutable reference + one atomic run + shared composition on siblings', async () => {
    const session = await runMobileTwinFalPipeline({
      session: lockedSession(),
      action: 'GENERATE_MOBILE_TWIN',
      founderConfirmedSpend: true,
    });
    const ref = session.mobileTwinPipeline!.designReference!;
    const run = session.mobileTwinPipeline!.atomicRuns.at(-1)!;
    const comp = session.mobileTwinPipeline!.compositionStates.at(-1)!;
    const render = session.mobileTwinPipeline!.renders.at(-1)!;
    const blueprint = session.mobileTwinPipeline!.blueprintTwins.at(-1)!;
    expect(ref.sourceImageHash).toContain(FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER.originalFileHashSha256);
    expect(ref.status).toBe('REFERENCE_LOCKED');
    expect(run.status).toMatch(/FOUNDER_REVIEW_READY|BLOCKED/);
    expect(run.compositionStateId).toBe(comp.id);
    expect(render.compositionStateId).toBe(comp.id);
    expect(blueprint.compositionStateId).toBe(comp.id);
    expect(render.compositionHash).toBe(comp.compositionHash);
    expect(blueprint.compositionHash).toBe(comp.compositionHash);
    expect(blueprint.structuralSource).toBe('FROZEN_COMPOSITION_STATE');
  });

  it('7–13 blueprint not from actual pixels; structured from composition', async () => {
    const session = await runMobileTwinFalPipeline({
      session: lockedSession(),
      action: 'GENERATE_MOBILE_TWIN',
      founderConfirmedSpend: true,
    });
    const comp = session.mobileTwinPipeline!.compositionStates.at(-1)!;
    const pkg = session.mobileTwinPipeline!.packages.at(-1)!;
    const msb = session.mobileTwinPipeline!.artifactsById[pkg.surgicalBlueprintId] as { compositionHash: string };
    expect(msb.compositionHash).toBe(comp.compositionHash);
    const bpPrompt = buildMobileBlueprintTwinFromCompositionFalPrompt({
      composition: comp,
      siblingActualRenderId: 'sibling',
    });
    expect(blueprintPromptUsesFrozenComposition(bpPrompt)).toBe(true);
    expect(bpPrompt).not.toContain('APPROVED MOBILE IMPLEMENTATION RENDER');
  });

  it('14–16 actual anti-clone + blueprint twin prompt', () => {
    const session = lockedSession();
    const ref = session.mobileTwinPipeline!.designReference!;
    const comp = buildMobileTwinCompositionState({ runId: 't', reference: ref });
    const actualPrompt = buildMobileImplementationRenderFalPrompt({ reference: ref, composition: comp });
    expect(promptIncludesAntiCloneInstruction(actualPrompt)).toBe(true);
  });

  it('17–19 twin visual receipt + hash alone ≠ visual pass', async () => {
    const session = await runMobileTwinFalPipeline({
      session: lockedSession(),
      action: 'GENERATE_MOBILE_TWIN',
      founderConfirmedSpend: true,
    });
    const runId = session.mobileTwinPipeline!.activeAtomicRunId!;
    const tvcr = session.mobileTwinPipeline!.artifactsById[`tvcr-${runId}`] as ReturnType<
      typeof buildTwinVisualCompositionReceipt
    >;
    expect(tvcr).toBeTruthy();
    expect(tvcr.hashAloneWouldPass).toBe(true);
    expect(typeof tvcr.visualCompositionMatch).toBe('boolean');
  });

  it('20–24 founder reviews pair; no separate render approval required', async () => {
    let session = await runMobileTwinFalPipeline({
      session: lockedSession(),
      action: 'GENERATE_MOBILE_TWIN',
      founderConfirmedSpend: true,
    });
    expect(canGenerateMobileTwinPackage(session)).toBe(false);
    expect(canApproveMobileTwinPackage(session)).toBe(true);
    session = approveMobileTwinPackage(session);
    expect(session.mobileTwinPipeline!.packages.at(-1)!.status).toBe('APPROVED');
    expect(session.mobileTwinPipeline!.visualPairs.at(-1)!.status).toBe('APPROVED');
  });

  it('25–27 atomic supersedes sequential generate render UX contract', async () => {
    const session = await runMobileTwinFalPipeline({
      session: lockedSession(),
      action: 'GENERATE_MOBILE_TWIN',
      founderConfirmedSpend: true,
    });
    expect(session.mobileTwinPipeline!.falJobsDispatched).toBe(2);
    expect(session.mobileTwinPipeline!.packages.at(-1)).toBeTruthy();
    expect(P0_VR_TWIN_V30R7MF3_LINEAGE).toContain('R7MF3');
  });

  it('28–30 regenerate preserves history; desktop 0', async () => {
    let session = await runMobileTwinFalPipeline({
      session: lockedSession(),
      action: 'GENERATE_MOBILE_TWIN',
      founderConfirmedSpend: true,
    });
    const pairsBefore = session.mobileTwinPipeline!.visualPairs.length;
    session = await runMobileTwinFalPipeline({
      session,
      action: 'REGENERATE_MOBILE_TWIN',
      founderConfirmedSpend: true,
    });
    expect(session.mobileTwinPipeline!.visualPairs.length).toBeGreaterThan(pairsBefore);
    expect(session.mobileTwinPipeline!.desktopJobsDispatched).toBe(0);
  });
});
