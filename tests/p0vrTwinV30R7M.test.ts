/**
 * P0.VR.TWINV3.0R7M — mobile composition-state twin pipeline
 */

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  applyOneTimeFounderAuthorityInjection,
  approveMobileImplementationRender,
  buildMobileTwinCompositionState,
  createDesignPageAuthorityReviewSession,
  DESIGN_WORKSPACE_REQUIRED_FEATURE_IDS_V1,
  ensureMobileDesignReferenceAuthority,
  FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER,
  mobileMasterToDesignReference,
  P0_VR_TWIN_V30R7M_LINEAGE,
  R6F2_BLUEPRINT_ROLE,
  runMobileCompositionForensicQa,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/index.js';
import { runGenerateMobileImplementationRenderNode } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/runGenerateMobileImplementationRenderNode.js';
import { runGenerateMobileTwinPackageNode } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/runGenerateMobileTwinPackageNode.js';
import { canGenerateMobileTwinPackage } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/runGenerateMobileTwinPackage.js';

const runGenerateMobileImplementationRender = runGenerateMobileImplementationRenderNode;
const runGenerateMobileTwinPackage = runGenerateMobileTwinPackageNode;
import { resolveFounderAuthorityAbsolutePath } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/designWorkspaceDerivation/pixelGroundedAuthorityAnalysisNode.js';

function lockedSession() {
  return applyOneTimeFounderAuthorityInjection(createDesignPageAuthorityReviewSession());
}

describe('P0.VR.TWINV3.0R7M mobile twin pipeline', () => {
  it('1–2 founder mobile JPG immutable + design reference role', () => {
    const session = lockedSession();
    const mobile = session.authorityPipeline!.mobileMaster!;
    const path = resolveFounderAuthorityAbsolutePath(mobile.authorityImageUri);
    const hashBefore = createHash('sha256').update(readFileSync(path)).digest('hex');
    expect(hashBefore).toBe(FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER.originalFileHashSha256);
    const ref = mobileMasterToDesignReference(mobile);
    expect(ref.status).toBe('REFERENCE_LOCKED');
    expect(ref.sourceImageHash).toBe(mobile.authorityImageHash);
    expect(ref.sourceImageUri).toBe(mobile.authorityImageUri);
  });

  it('3 desktop deferred — no desktop twin state', () => {
    const session = ensureMobileDesignReferenceAuthority(lockedSession());
    expect(session.mobileTwinPipeline?.desktopStatus).toBe('DEFERRED');
    expect(session.mobileTwinPipeline?.designReference?.viewport).toBe('MOBILE');
  });

  it('4–8 composition before render + manifest/context attached', async () => {
    const session = await runGenerateMobileImplementationRender(lockedSession());
    const comp = session.mobileTwinPipeline!.compositionStates.at(-1)!;
    const render = session.mobileTwinPipeline!.renders.at(-1)!;
    expect(comp.id).toBeTruthy();
    expect(render.compositionStateId).toBe(comp.id);
    expect(comp.referenceAuthorityId).toBe(session.mobileTwinPipeline!.designReference!.id);
    expect(comp.featureManifestVersion).toBe('design-workspace-feature-manifest-v1');
    expect(comp.projectCreativeContextVersion).toContain('ndxbook');
  });

  it('9 all 29 features in composition bindings', async () => {
    const session = await runGenerateMobileImplementationRender(lockedSession());
    const comp = session.mobileTwinPipeline!.compositionStates.at(-1)!;
    expect(comp.featureBindings.length).toBe(DESIGN_WORKSPACE_REQUIRED_FEATURE_IDS_V1.length);
    for (const fid of DESIGN_WORKSPACE_REQUIRED_FEATURE_IDS_V1) {
      expect(comp.featureBindings.some((fb) => fb.featureId === fid)).toBe(true);
    }
  });

  it('10–11 render persisted separately from reference', async () => {
    const session = await runGenerateMobileImplementationRender(lockedSession());
    const ref = session.mobileTwinPipeline!.designReference!;
    const render = session.mobileTwinPipeline!.renders.at(-1)!;
    expect(render.renderImageUri).not.toBe(ref.sourceImageUri);
    expect(render.renderImageHash).not.toBe(ref.sourceImageHash);
  });

  it('12–13 render review + twin package blocked before approval', async () => {
    let session = await runGenerateMobileImplementationRender(lockedSession());
    expect(session.mobileTwinPipeline!.renderGate).toBe('FOUNDER_REVIEW');
    expect(canGenerateMobileTwinPackage(session)).toBe(false);
    await expect(runGenerateMobileTwinPackage(session)).rejects.toThrow(/MOBILE_RENDER_NOT_APPROVED/);
  });

  it('14–16 approve render → visual authority + frozen composition', async () => {
    let session = await runGenerateMobileImplementationRender(lockedSession());
    const hashBefore = session.mobileTwinPipeline!.compositionStates.at(-1)!.compositionHash;
    session = approveMobileImplementationRender(session);
    expect(session.mobileTwinPipeline!.implementationVisualAuthority?.status).toBe('FROZEN_IMPLEMENTATION_AUTHORITY');
    expect(session.mobileTwinPipeline!.renderGate).toBe('FROZEN');
    const comp = session.mobileTwinPipeline!.compositionStates.at(-1)!;
    expect(comp.status).toBe('FROZEN');
    expect(comp.compositionHash).toBe(hashBefore);
  });

  it('17–20 twin package shares composition hash across derivatives', async () => {
    let session = await runGenerateMobileImplementationRender(lockedSession());
    session = approveMobileImplementationRender(session);
    session = await runGenerateMobileTwinPackage(session);
    const pkg = session.mobileTwinPipeline!.packages.at(-1)!;
    const comp = session.mobileTwinPipeline!.compositionStates.find((c) => c.id === pkg.compositionStateId)!;
    const blueprint = session.mobileTwinPipeline!.artifactsById[pkg.blueprintTwinVisualId] as {
      compositionHash: string;
    };
    const objectMap = session.mobileTwinPipeline!.artifactsById[pkg.objectMapId] as { compositionHash: string };
    expect(pkg.compositionHash).toBe(comp.compositionHash);
    expect(blueprint.compositionHash).toBe(comp.compositionHash);
    expect(objectMap.compositionHash).toBe(comp.compositionHash);
  });

  it('21–25 reconciliation + fidelity receipts', async () => {
    let session = await runGenerateMobileImplementationRender(lockedSession());
    session = approveMobileImplementationRender(session);
    session = await runGenerateMobileTwinPackage(session);
    const pkg = session.mobileTwinPipeline!.packages.at(-1)!;
    const recon = session.mobileTwinPipeline!.artifactsById[pkg.reconciliationReceiptId] as { result: string };
    const refFid = session.mobileTwinPipeline!.artifactsById[pkg.referenceTranslationFidelityReceiptId] as {
      result: string;
    };
    const twinFid = session.mobileTwinPipeline!.artifactsById[pkg.twinFidelityReceiptId] as { result: string };
    expect(recon.result).toBe('PASS');
    expect(refFid.result).toBe('PASS');
    expect(twinFid.result).toBe('PASS');
  });

  it('26–27 R6F2 forensic role only', async () => {
    const session = await runGenerateMobileImplementationRender(lockedSession());
    expect(session.mobileTwinPipeline!.r6f2ForensicRole).toBe(R6F2_BLUEPRINT_ROLE);
    const comp = session.mobileTwinPipeline!.compositionStates.at(-1)!;
    const forensic = runMobileCompositionForensicQa(comp);
    expect(forensic.primaryGeometrySource).toBe('MobileTwinCompositionState');
    expect(forensic.role).toBe(R6F2_BLUEPRINT_ROLE);
  });

  it('28–29 approve/regenerate hooks + package after approval', async () => {
    let session = await runGenerateMobileImplementationRender(lockedSession());
    session = approveMobileImplementationRender(session);
    expect(canGenerateMobileTwinPackage(session)).toBe(true);
    session = await runGenerateMobileTwinPackage(session);
    expect(session.mobileTwinPipeline!.latestPackageId).toBeTruthy();
    expect(session.mobileTwinPipeline!.packages.at(-1)?.status).toBe('FOUNDER_REVIEW_READY');
  });

  it('30 no desktop jobs — fal count unchanged by mobile-only pipeline', async () => {
    const before = lockedSession();
    const session = await runGenerateMobileImplementationRender(before);
    expect(session.mobileTwinPipeline!.falJobsDispatched).toBe(0);
    expect(P0_VR_TWIN_V30R7M_LINEAGE).toContain('R7M');
  });

  it('composition state built deterministically from reference', () => {
    const session = ensureMobileDesignReferenceAuthority(lockedSession());
    const ref = session.mobileTwinPipeline!.designReference!;
    const comp = buildMobileTwinCompositionState({ runId: 'test', reference: ref });
    expect(comp.objectDefinitions.length).toBeGreaterThan(40);
    expect(comp.compositionHash).toMatch(/^[0-9a-f]{8}$/);
  });
});
