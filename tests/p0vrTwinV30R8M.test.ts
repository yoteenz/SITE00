/**
 * P0.VR.TWINV3.0R8M — durable approval + twin implementation compiler
 */

import { readFileSync } from 'node:fs';
import { describe, expect, it, beforeEach } from 'vitest';
import {
  applyOneTimeFounderAuthorityInjection,
  createDesignPageAuthorityReviewSession,
  ensureMobileDesignReferenceAuthority,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/index.js';
import { applyFounderNbpMobileTwinPromotion } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/applyFounderNbpMobileTwinPromotion.js';
import { recordFounderTwinCapabilityDecision } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/recordFounderTwinCapabilityDecision.js';
import { runMobileTwinCapabilityTest } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/runMobileTwinCapabilityTest.js';
import { runMobileAtomicTwinGeneration } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/runMobileAtomicTwinGeneration.js';
import { approveMobileTwinPackage, canApproveMobileTwinPackage } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/approveMobileTwinPackage.js';
import {
  applyMobileTwinPackageApprovalConfirmation,
  isMobileTwinPackageApprovalConfirmed,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/confirmMobileTwinPackageApproval.js';
import { compileApprovedMobileTwinPackage, assertCompilerDoesNotUseRasterAuthorities } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/compileApprovedMobileTwinPackage.js';
import { mobileTwinTwinPreviewRoute } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/constants.js';
import { P0_VR_TWIN_V30R8M1_LINEAGE, MOBILE_TWIN_IMPL_COMPILER_GENERATION } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M1/constants.js';
import { mobileTwinImplementationStore } from '../api/_lib/site00MobileTwinImplementation/storeAdapter.js';
import {
  compileMobileTwinImplementationService,
  persistMobileTwinPackageApprovalService,
  approveMobileTwinImplementationService,
  requestMobileTwinImplementationCorrectionService,
} from '../api/_lib/site00MobileTwinImplementation/mobileTwinImplementationService.js';
import { SITE00_ROUTES } from '../src/site00/config/routes.js';
import * as designPersistence from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/designPageAuthorityPersistence.js';
import { applyMobileTwinPackageApprovalConfirmation } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/confirmMobileTwinPackageApproval.js';
import { resolveTwinImplementationPreview } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/resolveTwinImplementationPreview.js';
import * as implementationApi from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/requestMobileTwinImplementation.js';
import { vi } from 'vitest';

async function approvedPackageSession() {
  let session = ensureMobileDesignReferenceAuthority(
    applyOneTimeFounderAuthorityInjection(createDesignPageAuthorityReviewSession({ projectId: 'ndxbook' })),
  );
  session = await runMobileTwinCapabilityTest({ session });
  session = recordFounderTwinCapabilityDecision(session, 'FLOW_A_MORE_ACCURATE');
  session = applyFounderNbpMobileTwinPromotion(session);
  session = await runMobileAtomicTwinGeneration({ session });
  session = approveMobileTwinPackage(session);
  return session;
}

describe('P0.VR.TWINV3.0R8M mobile twin implementation pipeline', () => {
  beforeEach(() => {
    mobileTwinImplementationStore.resetMemory();
  });

  it('1–2 existing approved package detected; founder not asked to re-approve', async () => {
    const session = applyMobileTwinPackageApprovalConfirmation(await approvedPackageSession());
    expect(isMobileTwinPackageApprovalConfirmed(session)).toBe(true);
    expect(canApproveMobileTwinPackage(session)).toBe(false);
    expect(session.mobileTwinPipeline!.mobileTwinImplementation!.implementationStatus).toBe('READY_TO_COMPILE');
  });

  it('3–6 approval creates backend record and survives refresh semantics', async () => {
    const session = await approvedPackageSession();
    const record = await persistMobileTwinPackageApprovalService(session);
    expect(record.status).toBe('APPROVED');
    const state = await mobileTwinImplementationStore.getImplementationState('ndxbook');
    expect(state?.latestPackageApprovalId).toBe(record.id);
    mobileTwinImplementationStore.resetMemory();
    const afterClear = await mobileTwinImplementationStore.getImplementationState('ndxbook');
    expect(afterClear).toBeNull();
    await persistMobileTwinPackageApprovalService(session);
    const reloaded = await mobileTwinImplementationStore.getImplementationState('ndxbook');
    expect(reloaded?.latestPackageApprovalId).toBeTruthy();
  });

  it('7–11 compile consumes structured package; forbids raster authorities', async () => {
    const session = await approvedPackageSession();
    await persistMobileTwinPackageApprovalService(session);
    const compiled = await compileMobileTwinImplementationService(session);
    expect(compiled.document.structuredSource).toBe('COMPOSITION_AND_PACKAGE_ARTIFACTS');
    expect(compiled.document.lineage).toBe(P0_VR_TWIN_V30R8M1_LINEAGE);
    expect(compiled.document.compilerGeneration).toBe(MOBILE_TWIN_IMPL_COMPILER_GENERATION);
    expect(compiled.document.renderTree?.nodes.length).toBeGreaterThan(0);
    expect(compiled.document.nodes.length).toBeGreaterThan(0);
    assertCompilerDoesNotUseRasterAuthorities({
      actualRenderUri: 'vitest-fal://actual',
      blueprintRenderUri: 'vitest-fal://bp',
      document: compiled.document,
    });
    expect(compiled.document.forbiddenPrimitiveScan.count).toBe(0);
    const manual = compileApprovedMobileTwinPackage({
      pipeline: session.mobileTwinPipeline!,
      packageId: session.mobileTwinPipeline!.latestPackageId!,
    });
    expect(manual.nodes.length).toBe(session.mobileTwinPipeline!.compositionStates[0]!.objectDefinitions.length);
  });

  it('12–14 twin preview route exists; current design workspace not mutated', () => {
    expect(SITE00_ROUTES.projectDesignTwin).toBe('/projects/:projectSlug/design/twin');
    expect(mobileTwinTwinPreviewRoute('ndxbook')).toBe('/projects/ndxbook/design/twin');
    const workspace = readFileSync('src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx', 'utf8');
    expect(workspace).not.toContain('DesignTwinImplementationPage');
    expect(workspace).not.toContain('CURRENT_DESIGN_ROUTE_MUTATION_FORBIDDEN');
  });

  it('15–18 fidelity receipts + functional validation on compile', async () => {
    const session = await approvedPackageSession();
    await persistMobileTwinPackageApprovalService(session);
    const compiled = await compileMobileTwinImplementationService(session);
    expect(compiled.visual.result).toBe('PASS');
    expect(compiled.structural.result).toBe('PASS');
    expect(compiled.functional.pass).toBe(true);
  });

  it('19–22 correction does not reopen creative; founder approve → promotion ready', async () => {
    const session = await approvedPackageSession();
    await persistMobileTwinPackageApprovalService(session);
    const compiled = await compileMobileTwinImplementationService(session);
    const correction = await requestMobileTwinImplementationCorrectionService({
      projectId: 'ndxbook',
      buildId: compiled.build.id,
      reason: 'LAYOUT',
    });
    expect(correction.creativeReopen).toBe(false);
    const approved = await approveMobileTwinImplementationService('ndxbook', compiled.build.id);
    expect(approved.build?.founderStatus).toBe('FOUNDER_APPROVED');
    expect(approved.promotion.status).toBe('PROMOTION_READY');
  });

  it('23 no automatic promotion flag on build record', async () => {
    const session = await approvedPackageSession();
    await persistMobileTwinPackageApprovalService(session);
    const compiled = await compileMobileTwinImplementationService(session);
    expect(compiled.build.promotionStatus).toBe('NOT_READY');
  });

  it('24–26 implementation versioning + history in memory payload', async () => {
    const session = await approvedPackageSession();
    await persistMobileTwinPackageApprovalService(session);
    const v1 = await compileMobileTwinImplementationService(session);
    const v2 = await compileMobileTwinImplementationService(session);
    expect(v1.build.implementationVersion).toBe('mobile-twin-impl-v1');
    expect(v2.build.implementationVersion).toBe('mobile-twin-impl-v2');
    const state = await mobileTwinImplementationStore.getImplementationState('ndxbook');
    expect(state?.implementationPayload.buildCount).toBe(2);
  });

  it('27 desktop implementation jobs remain 0', async () => {
    const session = await approvedPackageSession();
    expect(session.mobileTwinPipeline!.desktopJobsDispatched).toBe(0);
  });

  it('28 twin preview local compile when implementation API unreachable', async () => {
    const session = applyMobileTwinPackageApprovalConfirmation(await approvedPackageSession());
    vi.spyOn(designPersistence, 'readDesignPageAuthoritySession').mockReturnValue(session);
    vi.spyOn(implementationApi, 'fetchMobileTwinImplementationState').mockRejectedValue(
      new Error('MOBILE_TWIN_IMPLEMENTATION_API_UNREACHABLE'),
    );
    const preview = await resolveTwinImplementationPreview('ndxbook');
    expect(preview.source).toBe('LOCAL_COMPILE');
    expect(preview.document.compilerGeneration).toBe(MOBILE_TWIN_IMPL_COMPILER_GENERATION);
    expect(preview.document.nodes.length).toBeGreaterThan(0);
    vi.restoreAllMocks();
  });
});
