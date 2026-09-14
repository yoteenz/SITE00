/**
 * P0.VR.TWINV3.0R7MF1 — mobile FAL provider activation
 */

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import {
  applyOneTimeFounderAuthorityInjection,
  approveMobileImplementationRender,
  createDesignPageAuthorityReviewSession,
  ensureMobileDesignReferenceAuthority,
  FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER,
  P0_VR_TWIN_V30R7MF1_LINEAGE,
  R6F2_BLUEPRINT_ROLE,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/index.js';
import { buildMobileBlueprintTwinFalPrompt, buildMobileImplementationRenderFalPrompt } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/buildMobileTwinFalPrompts.js';
import { buildMobileTwinCompositionState } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/buildMobileTwinCompositionState.js';
import { canGenerateMobileTwinPackage } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/runGenerateMobileTwinPackage.js';
import { runGenerateMobileImplementationRenderNode } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/runGenerateMobileImplementationRenderNode.js';
import { runMobileTwinFalPipeline } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/runMobileTwinFalPipeline.js';
import { classifyLegacyMobileRender, isRenderEligibleForFinalAuthority } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/mobileRenderClassification.js';
import { resolveFounderAuthorityAbsolutePath } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/designWorkspaceDerivation/pixelGroundedAuthorityAnalysisNode.js';

function lockedSession() {
  return ensureMobileDesignReferenceAuthority(applyOneTimeFounderAuthorityInjection(createDesignPageAuthorityReviewSession()));
}

describe('P0.VR.TWINV3.0R7MF1 mobile FAL twin pipeline', () => {
  it('1–2 local stub preserved + blocked from final authority', async () => {
    let session = await runGenerateMobileImplementationRenderNode(lockedSession());
    const stub = session.mobileTwinPipeline!.renders.at(-1)!;
    expect(classifyLegacyMobileRender(stub).renderMode).toBe('PIPELINE_PROOF_STUB');
    expect(isRenderEligibleForFinalAuthority(stub)).toBe(false);
    expect(() => approveMobileImplementationRender(session)).toThrow(/LOCAL_COMPILER_STUB_CANNOT_BECOME_FINAL_IMPLEMENTATION_AUTHORITY/);
  });

  it('3–8 FAL render dispatch includes reference + composition + manifest context', async () => {
    const session = await runMobileTwinFalPipeline({
      session: lockedSession(),
      action: 'GENERATE_MOBILE_RENDER',
      founderConfirmedSpend: true,
    });
    const render = session.mobileTwinPipeline!.renders.at(-1)!;
    const comp = session.mobileTwinPipeline!.compositionStates.at(-1)!;
    const ref = session.mobileTwinPipeline!.designReference!;
    expect(render.provider).toBe('FAL');
    expect(render.renderMode).toBe('REAL_PROVIDER_RENDER');
    expect(render.compositionStateId).toBe(comp.id);
    expect(render.compositionHash).toBe(comp.compositionHash);
    expect(render.referenceAuthorityId).toBe(ref.id);
    expect(comp.featureManifestVersion).toBe('design-workspace-feature-manifest-v1');
    expect(comp.projectCreativeContextVersion).toContain('ndxbook');
    const prompt = buildMobileImplementationRenderFalPrompt({ reference: ref, composition: comp });
    expect(prompt).toContain(comp.id);
    expect(prompt).toContain(comp.compositionHash);
    expect(prompt).toContain(ref.sourceImageHash);
  });

  it('9 no silent local fallback when FAL fails', async () => {
    const prev = process.env.VITEST;
    process.env.VITEST = '';
    delete process.env.FAL_KEY;
    await expect(
      runMobileTwinFalPipeline({
        session: lockedSession(),
        action: 'GENERATE_MOBILE_RENDER',
        founderConfirmedSpend: true,
      }),
    ).rejects.toThrow(/FAL_KEY_MISSING|MOBILE_RENDER_PROVIDER_FAILED/);
    process.env.VITEST = prev;
  });

  it('10–11 real render persisted separately from reference', async () => {
    const session = await runMobileTwinFalPipeline({
      session: lockedSession(),
      action: 'GENERATE_MOBILE_RENDER',
      founderConfirmedSpend: true,
    });
    const ref = session.mobileTwinPipeline!.designReference!;
    const render = session.mobileTwinPipeline!.renders.at(-1)!;
    expect(render.renderImageUri).not.toBe(ref.sourceImageUri);
    expect(render.renderImageHash).not.toBe(ref.sourceImageHash);
  });

  it('12–13 phase A only — no blueprint twin job yet', async () => {
    const session = await runMobileTwinFalPipeline({
      session: lockedSession(),
      action: 'GENERATE_MOBILE_RENDER',
      founderConfirmedSpend: true,
    });
    expect(session.mobileTwinPipeline!.blueprintTwins.length).toBe(0);
    expect(session.mobileTwinPipeline!.desktopJobsDispatched).toBe(0);
    expect(session.mobileTwinPipeline!.falJobsDispatched).toBe(1);
  });

  it('14–18 approve/refine/regenerate real render + freeze', async () => {
    let session = await runMobileTwinFalPipeline({
      session: lockedSession(),
      action: 'GENERATE_MOBILE_RENDER',
      founderConfirmedSpend: true,
    });
    const countBefore = session.mobileTwinPipeline!.renders.length;
    session = await runMobileTwinFalPipeline({
      session,
      action: 'REGENERATE_MOBILE_RENDER',
      founderConfirmedSpend: true,
    });
    expect(session.mobileTwinPipeline!.renders.length).toBe(countBefore + 1);
    session = await runMobileTwinFalPipeline({
      session,
      action: 'REFINE_MOBILE_RENDER',
      founderConfirmedSpend: true,
      refineNotes: ['Tighten pipeline strip density'],
    });
    const refined = session.mobileTwinPipeline!.renders.at(-1)!;
    expect(refined.parentRenderId).toBeTruthy();
    expect(refined.founderNotes?.length).toBeGreaterThan(0);
    session = approveMobileImplementationRender(session);
    expect(session.mobileTwinPipeline!.implementationVisualAuthority?.sourceProviderJobId).toBeTruthy();
    expect(session.mobileTwinPipeline!.compositionStates.find((c) => c.id === refined.compositionStateId)?.status).toBe('FROZEN');
  });

  it('19–20 twin package blocked before approval / unlocked after FAL approval', async () => {
    let session = await runMobileTwinFalPipeline({
      session: lockedSession(),
      action: 'GENERATE_MOBILE_RENDER',
      founderConfirmedSpend: true,
    });
    expect(canGenerateMobileTwinPackage(session)).toBe(false);
    session = approveMobileImplementationRender(session);
    expect(canGenerateMobileTwinPackage(session)).toBe(true);
  });

  it('21–24 blueprint twin uses approved render not design reference', async () => {
    let session = await runMobileTwinFalPipeline({
      session: lockedSession(),
      action: 'GENERATE_MOBILE_RENDER',
      founderConfirmedSpend: true,
    });
    const render = session.mobileTwinPipeline!.renders.at(-1)!;
    const comp = session.mobileTwinPipeline!.compositionStates.at(-1)!;
    session = approveMobileImplementationRender(session);
    const auth = session.mobileTwinPipeline!.implementationVisualAuthority!;
    const twinPrompt = buildMobileBlueprintTwinFalPrompt({
      composition: comp,
      implementationRenderId: render.id,
      implementationRenderHash: render.renderImageHash,
      implementationVisualAuthorityId: auth.id,
    });
    expect(twinPrompt).toContain(render.id);
    expect(twinPrompt).not.toContain('Design Reference Authority is COMPOSITION GUIDELINE only');
    session = await runMobileTwinFalPipeline({
      session,
      action: 'GENERATE_MOBILE_TWIN_PACKAGE',
      founderConfirmedSpend: true,
    });
    expect(session.mobileTwinPipeline!.falJobsDispatched).toBe(2);
    const twin = session.mobileTwinPipeline!.blueprintTwins.at(-1)!;
    expect(twin.implementationRenderId).toBe(render.id);
    expect(twin.compositionHash).toBe(comp.compositionHash);
  });

  it('25–27 package reconciliation + cost lineage', async () => {
    let session = await runMobileTwinFalPipeline({
      session: lockedSession(),
      action: 'GENERATE_MOBILE_RENDER',
      founderConfirmedSpend: true,
    });
    session = approveMobileImplementationRender(session);
    session = await runMobileTwinFalPipeline({
      session,
      action: 'GENERATE_MOBILE_TWIN_PACKAGE',
      founderConfirmedSpend: true,
    });
    const pkg = session.mobileTwinPipeline!.packages.at(-1)!;
    const recon = session.mobileTwinPipeline!.artifactsById[pkg.reconciliationReceiptId] as { result: string };
    expect(recon.result).toBe('PASS');
    expect(session.mobileTwinPipeline!.providerCostRecords.length).toBeGreaterThanOrEqual(2);
    expect(session.mobileTwinPipeline!.totalProviderCostUsd).toBeGreaterThan(0);
  });

  it('28 R6F2 forensic role unchanged', () => {
    expect(lockedSession().mobileTwinPipeline?.r6f2ForensicRole ?? R6F2_BLUEPRINT_ROLE).toBe(R6F2_BLUEPRINT_ROLE);
  });

  it('29–30 no desktop jobs + lineage constant', async () => {
    const session = await runMobileTwinFalPipeline({
      session: lockedSession(),
      action: 'GENERATE_MOBILE_RENDER',
      founderConfirmedSpend: true,
    });
    expect(session.mobileTwinPipeline!.desktopJobsDispatched).toBe(0);
    expect(P0_VR_TWIN_V30R7MF1_LINEAGE).toContain('R7MF1');
  });

  it('founder mobile JPG hash unchanged', () => {
    const mobile = lockedSession().authorityPipeline!.mobileMaster!;
    const path = resolveFounderAuthorityAbsolutePath(mobile.authorityImageUri);
    const hash = createHash('sha256').update(readFileSync(path)).digest('hex');
    expect(hash).toBe(FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER.originalFileHashSha256);
  });
});
