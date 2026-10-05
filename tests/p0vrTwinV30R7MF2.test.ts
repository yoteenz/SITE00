/**
 * P0.VR.TWINV3.0R7MF2 — reference translation + anti-clone render guard
 */

import { describe, expect, it } from 'vitest';
import {
  applyOneTimeFounderAuthorityInjection,
  approveMobileImplementationRender,
  createDesignPageAuthorityReviewSession,
  ensureMobileDesignReferenceAuthority,
  FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER,
  P0_VR_TWIN_V30R7MF2_LINEAGE,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/index.js';
import {
  buildMobileImplementationRenderFalPrompt,
  promptIncludesAntiCloneInstruction,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/buildMobileTwinFalPrompts.js';
import { buildMobileTwinCompositionState } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/buildMobileTwinCompositionState.js';
import { canGenerateMobileTwinPackage } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/runGenerateMobileTwinPackage.js';
import { runMobileTwinFalPipeline } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/runMobileTwinFalPipeline.js';
import {
  evaluateReferenceCloneFirewall,
  REFERENCE_TRANSLATION_COLLAPSE_TO_REPLICATION,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/referenceCloneFirewall.js';
import { buildReferenceTranslationEvidenceReceipt } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/referenceTranslationEvidence.js';
import {
  FOUNDER_MOBILE_RENDER_REJECT_REASONS,
  rejectMobileImplementationRender,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/rejectMobileImplementationRender.js';
import { MOBILE_IMPLEMENTATION_RENDER_ROLE } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/referenceRoleContracts.js';
import { isRenderEligibleForFinalAuthority } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/mobileRenderClassification.js';
import { runGenerateMobileImplementationRenderNode } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/runGenerateMobileImplementationRenderNode.js';

function lockedSession() {
  return ensureMobileDesignReferenceAuthority(applyOneTimeFounderAuthorityInjection(createDesignPageAuthorityReviewSession()));
}

describe('P0.VR.TWINV3.0R7MF2 mobile reference translation', () => {
  it('1–4 phase A only + reference immutable + render role distinct', async () => {
    const session = await runMobileTwinFalPipeline({
      session: lockedSession(),
      action: 'GENERATE_MOBILE_RENDER',
      founderConfirmedSpend: true,
    });
    const ref = session.mobileTwinPipeline!.designReference!;
    const render = session.mobileTwinPipeline!.renders.at(-1)!;
    expect(session.mobileTwinPipeline!.blueprintTwins.length).toBe(0);
    expect(ref.status).toBe('REFERENCE_LOCKED');
    expect(render.phaseAOutputRole).toBe('MOBILE_IMPLEMENTATION_RENDER');
    expect(render.referenceAuthorityId).toBe(ref.id);
    expect(render.renderImageHash).not.toBe(ref.sourceImageHash);
  });

  it('5–10 render prompt anti-clone + composition/manifest/context contracts', () => {
    const session = lockedSession();
    const ref = session.mobileTwinPipeline!.designReference!;
    const comp = buildMobileTwinCompositionState({ runId: 't', reference: ref });
    const prompt = buildMobileImplementationRenderFalPrompt({ reference: ref, composition: comp });
    expect(prompt).toContain(P0_VR_TWIN_V30R7MF2_LINEAGE);
    expect(promptIncludesAntiCloneInstruction(prompt)).toBe(true);
    expect(prompt).toContain('DO NOT replicate the reference image verbatim');
    expect(prompt).toContain(MOBILE_IMPLEMENTATION_RENDER_ROLE);
    expect(prompt).toContain(comp.id);
    expect(prompt).toContain(comp.compositionHash);
    expect(prompt).toContain('featureBindingCount');
    expect(prompt).toContain('ndxbook');
    expect(prompt).toContain('hostProjectContractVersion');
  });

  it('11–13 clone firewall + translation evidence + clone risk on render', async () => {
    const session = await runMobileTwinFalPipeline({
      session: lockedSession(),
      action: 'GENERATE_MOBILE_RENDER',
      founderConfirmedSpend: true,
    });
    const ref = session.mobileTwinPipeline!.designReference!;
    const render = session.mobileTwinPipeline!.renders.at(-1)!;
    const comp = session.mobileTwinPipeline!.compositionStates.at(-1)!;
    const receiptId = render.referenceTranslationEvidenceReceiptId!;
    const evidence = session.mobileTwinPipeline!.artifactsById[receiptId] as ReturnType<
      typeof buildReferenceTranslationEvidenceReceipt
    >;
    expect(evidence.result).toMatch(/PASS|REVIEW_REQUIRED/);
    expect(render.referenceCloneRisk).toBeTruthy();
    const firewall = evaluateReferenceCloneFirewall({
      reference: ref,
      render,
      composition: comp,
      translationEvidence: evidence,
    });
    expect(firewall.blocked).toBe(false);
  });

  it('11b literal reference copy blocked by firewall', () => {
    const session = lockedSession();
    const ref = session.mobileTwinPipeline!.designReference!;
    const comp = buildMobileTwinCompositionState({ runId: 'clone', reference: ref });
    const evidence = buildReferenceTranslationEvidenceReceipt({
      receiptId: 'rtre-clone',
      reference: ref,
      composition: comp,
      render: {
        id: 'r-clone',
        compositionStateId: comp.id,
        compositionHash: comp.compositionHash,
        referenceAuthorityId: ref.id,
      },
      promptIncludesAntiClone: true,
    });
    const firewall = evaluateReferenceCloneFirewall({
      reference: ref,
      render: { id: 'r-clone', renderImageHash: ref.sourceImageHash, renderImageUri: ref.sourceImageUri },
      composition: comp,
      translationEvidence: evidence,
    });
    expect(firewall.blocked).toBe(true);
    expect(firewall.failureClassification).toBe(REFERENCE_TRANSLATION_COLLAPSE_TO_REPLICATION);
  });

  it('14–16 founder reject TOO_CLOSE + refine/regenerate lineage', async () => {
    let session = await runMobileTwinFalPipeline({
      session: lockedSession(),
      action: 'GENERATE_MOBILE_RENDER',
      founderConfirmedSpend: true,
    });
    expect(FOUNDER_MOBILE_RENDER_REJECT_REASONS).toContain('TOO_CLOSE_TO_REFERENCE');
    session = rejectMobileImplementationRender(session, 'TOO_CLOSE_TO_REFERENCE');
    expect(session.mobileTwinPipeline!.renderGate).toBe('NEEDS_REFINEMENT');
    expect(canGenerateMobileTwinPackage(session)).toBe(false);

    session = await runMobileTwinFalPipeline({
      session: lockedSession(),
      action: 'GENERATE_MOBILE_RENDER',
      founderConfirmedSpend: true,
    });
    const before = session.mobileTwinPipeline!.renders.length;
    session = await runMobileTwinFalPipeline({
      session,
      action: 'REGENERATE_MOBILE_RENDER',
      founderConfirmedSpend: true,
    });
    expect(session.mobileTwinPipeline!.renders.length).toBe(before + 1);

    session = await runMobileTwinFalPipeline({
      session,
      action: 'REFINE_MOBILE_RENDER',
      founderConfirmedSpend: true,
      refineNotes: ['Preserve composition but do not recreate the reference literally'],
    });
    const child = session.mobileTwinPipeline!.renders.at(-1)!;
    expect(child.parentRenderId).toBeTruthy();
    expect(child.phaseAOutputRole).toBe('MOBILE_IMPLEMENTATION_RENDER');
  });

  it('17–19 package blocked on reject; desktop 0; stub cannot promote', async () => {
    let session = await runMobileTwinFalPipeline({
      session: lockedSession(),
      action: 'GENERATE_MOBILE_RENDER',
      founderConfirmedSpend: true,
    });
    session = rejectMobileImplementationRender(session, 'TOO_CLOSE_TO_REFERENCE');
    expect(canGenerateMobileTwinPackage(session)).toBe(false);
    expect(session.mobileTwinPipeline!.desktopJobsDispatched).toBe(0);

    session = await runGenerateMobileImplementationRenderNode(lockedSession());
    const stub = session.mobileTwinPipeline!.renders.at(-1)!;
    expect(isRenderEligibleForFinalAuthority(stub)).toBe(false);
  });

  it('18 approve path after valid FAL render', async () => {
    let session = await runMobileTwinFalPipeline({
      session: lockedSession(),
      action: 'GENERATE_MOBILE_RENDER',
      founderConfirmedSpend: true,
    });
    session = approveMobileImplementationRender(session);
    expect(canGenerateMobileTwinPackage(session)).toBe(true);
    expect(session.mobileTwinPipeline!.renderGate).toBe('FROZEN');
  });

  it('20 lineage constant', () => {
    expect(P0_VR_TWIN_V30R7MF2_LINEAGE).toContain('R7MF2');
    expect(FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER.originalFileHashSha256).toHaveLength(64);
  });
});
