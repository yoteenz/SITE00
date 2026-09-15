/**
 * P0.VR.TWINV3.0R8M1 — visual implementation translation + semantic label firewall
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
import { approveMobileTwinPackage } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/approveMobileTwinPackage.js';
import {
  compileApprovedMobileTwinPackage,
  compileApprovedMobileTwinPackageLegacyWireframe,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/compileApprovedMobileTwinPackage.js';
import {
  isProductionReadyImplementationDocument,
  isWireframeImplementationDocument,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/implementationDocumentValidity.js';
import { mobileTwinTwinPreviewRoute } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/constants.js';
import { mobileTwinImplementationStore } from '../api/_lib/site00MobileTwinImplementation/storeAdapter.js';
import { saveBuildMemory } from '../api/_lib/site00MobileTwinImplementation/memoryStore.js';
import { compileMobileTwinImplementationService, persistMobileTwinPackageApprovalService } from '../api/_lib/site00MobileTwinImplementation/mobileTwinImplementationService.js';
import { buildImplementationStructuralFidelityReceipt } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/buildImplementationFidelityReceipts.js';
import { evaluateMobileTwinPromotionReadiness } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/evaluatePromotionReadiness.js';
import {
  P0_VR_TWIN_V30R8M1_LINEAGE,
  REJECTED_WIREFRAME_REASON,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M1/constants.js';
import {
  MOBILE_TWIN_IMPL_COMPILER_GENERATION_R8M2R5,
  P0_VR_TWIN_V30R8M2R5_LINEAGE,
  MOBILE_TWIN_IMPLEMENTATION_VERSION_FORENSIC_BLUEPRINT,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2R5/constants.js';
import { classifyRuntimeImageSource } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2/runtimeAuthorityRasterFirewall.js';
import {
  isSemanticDebugLabel,
  scanDocumentForSemanticLabelViolations,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M1/semanticDebugLabelFirewall.js';
import { buildImplementationVisualFidelityReceipt } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/buildImplementationFidelityReceipts.js';

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

describe('P0.VR.TWINV3.0R8M1 visual implementation compiler', () => {
  beforeEach(() => {
    mobileTwinImplementationStore.resetMemory();
  });

  it('1 legacy R8M wireframe build is wireframe-classified for rejection', async () => {
    const session = await approvedPackageSession();
    const wire = compileApprovedMobileTwinPackageLegacyWireframe({
      pipeline: session.mobileTwinPipeline!,
      packageId: session.mobileTwinPipeline!.latestPackageId!,
    });
    expect(isWireframeImplementationDocument(wire)).toBe(true);
    expect(isProductionReadyImplementationDocument(wire)).toBe(false);
  });

  it('2–4 semantic debug labels blocked from production copy', () => {
    expect(isSemanticDebugLabel('DOMINANT HEADLINE')).toBe(true);
    expect(isSemanticDebugLabel('GALLERY THUMB 1')).toBe(true);
    expect(isSemanticDebugLabel('THE SIGNAL IS THE INDEX')).toBe(false);
  });

  it('5–8 authorities + project context + assets on compile', async () => {
    const session = await approvedPackageSession();
    const doc = compileApprovedMobileTwinPackage({
      pipeline: session.mobileTwinPipeline!,
      packageId: session.mobileTwinPipeline!.latestPackageId!,
    });
    expect(doc.authoritiesLoaded?.actualRenderUri).toBeTruthy();
    expect(doc.authoritiesLoaded?.blueprintRenderUri).toBeTruthy();
    expect(doc.authoritiesLoaded?.projectContextVersion).toContain('ndxbook');
    expect(doc.nodes.some((n) => n.imageUri)).toBe(true);
    expect(scanDocumentForSemanticLabelViolations(doc.nodes)).toEqual([]);
  });

  it('9–12 production compile has render tree + no semantic role as displayText', async () => {
    const session = await approvedPackageSession();
    const doc = compileApprovedMobileTwinPackage({
      pipeline: session.mobileTwinPipeline!,
      packageId: session.mobileTwinPipeline!.latestPackageId!,
    });
    expect(doc.compilerGeneration).toBe(MOBILE_TWIN_IMPL_COMPILER_GENERATION_R8M2R5);
    expect(doc.renderTree?.nodes.length).toBe(doc.nodes.length);
    for (const n of doc.nodes) {
      if (n.displayText) expect(isSemanticDebugLabel(n.displayText)).toBe(false);
    }
  });

  it('13–15 twin renderer uses real copy path; no semanticRole leak in component source', () => {
    const src = readFileSync('src/site00/components/designWorkspace/MobileTwinCompiledImplementationRenderer.tsx', 'utf8');
    expect(src).not.toContain('semanticRole.replace');
    expect(src).toContain('visibleCopy');
  });

  it('16–20 hero/gallery/cards/readiness/nav resolve copy or assets', async () => {
    const session = await approvedPackageSession();
    const doc = compileApprovedMobileTwinPackage({
      pipeline: session.mobileTwinPipeline!,
      packageId: session.mobileTwinPipeline!.latestPackageId!,
    });
    const byKey = (suffix: string) => doc.nodes.find((n) => n.objectId.endsWith(suffix));
    expect(byKey('dominant-headline')?.displayText).toBe('THE SIGNAL IS THE INDEX');
    expect(byKey('dominant-artifact-image')?.imageUri).toBeTruthy();
    expect(classifyRuntimeImageSource(byKey('dominant-artifact-image')?.imageUri)).toBe('CANONICAL_PROJECT_ASSET');
    expect(doc.nodes.filter((n) => n.objectId.includes('gallery-thumb')).length).toBeGreaterThan(0);
    expect(byKey('grounding-card')?.displayText).toBe('GROUNDING');
    expect(byKey('readiness-gauge')?.displayText).toBe('82%');
    expect(byKey('mobile-nav-references')?.displayText).toBe('WORKSPACE');
  });

  it('24–27 versioning rejects prior wireframe; new build R8M1 + receipts', async () => {
    const session = await approvedPackageSession();
    const approval = await persistMobileTwinPackageApprovalService(session);
    const wire = compileApprovedMobileTwinPackageLegacyWireframe({
      pipeline: session.mobileTwinPipeline!,
      packageId: session.mobileTwinPipeline!.latestPackageId!,
    });
    expect(isWireframeImplementationDocument(wire)).toBe(true);
    const wireBuildId = '00000000-0000-4000-8000-000000000001';
    const wireVisual = buildImplementationVisualFidelityReceipt({
      buildId: wireBuildId,
      pipeline: session.mobileTwinPipeline!,
      document: wire,
    });
    const wireStructural = buildImplementationStructuralFidelityReceipt({
      buildId: wireBuildId,
      pipeline: session.mobileTwinPipeline!,
      document: wire,
    });
    await saveBuildMemory({
      projectId: 'ndxbook',
      build: {
        id: wireBuildId,
        packageApprovalId: approval.id,
        packageId: session.mobileTwinPipeline!.latestPackageId!,
        packageChecksum: session.mobileTwinPipeline!.packages[0]!.packageChecksum,
        compositionHash: session.mobileTwinPipeline!.packages[0]!.compositionHash,
        implementationVersion: 'mobile-twin-impl-v1',
        previewRoute: mobileTwinTwinPreviewRoute('ndxbook'),
        compiledAt: new Date().toISOString(),
        buildStatus: 'PREVIEW_BUILD_READY',
        compiledDocument: wire,
        visualFidelityReceiptId: wireVisual.id,
        structuralFidelityReceiptId: wireStructural.id,
        founderStatus: 'PENDING',
        promotionStatus: 'NOT_READY',
      },
      document: wire,
      visual: wireVisual,
      structural: wireStructural,
      promotion: evaluateMobileTwinPromotionReadiness({
        packageApprovalDurable: true,
        build: null,
        visual: null,
        structural: null,
        functionalPass: false,
        previewRouteHealthy: false,
      }),
      status: 'FOUNDER_IMPLEMENTATION_REVIEW',
    });
    const v2 = await compileMobileTwinImplementationService(session);
    expect(v2.document.lineage).toBe(P0_VR_TWIN_V30R8M2R5_LINEAGE);
    expect(v2.visual.result).toBe('PASS');
    expect(v2.structural.result).toBe('PASS');
    expect(v2.build.implementationVersion).toBe(MOBILE_TWIN_IMPLEMENTATION_VERSION_FORENSIC_BLUEPRINT);
    const rejected = await mobileTwinImplementationStore.getBuild(wireBuildId);
    expect(rejected?.build.buildStatus).toBe('REJECTED_IMPLEMENTATION');
    expect(rejected?.build.rejectionReason).toBe(REJECTED_WIREFRAME_REASON);
  });

  it('28 wireframe visual receipt cannot pass as R8M1', async () => {
    const session = await approvedPackageSession();
    const wire = compileApprovedMobileTwinPackageLegacyWireframe({
      pipeline: session.mobileTwinPipeline!,
      packageId: session.mobileTwinPipeline!.latestPackageId!,
    });
    const receipt = buildImplementationVisualFidelityReceipt({
      buildId: 'wire-test',
      pipeline: session.mobileTwinPipeline!,
      document: wire,
    });
    expect(receipt.result).toBe('REVIEW_REQUIRED');
  });

  it('29–30 design route untouched; desktop jobs 0', async () => {
    const session = await approvedPackageSession();
    expect(session.mobileTwinPipeline!.desktopJobsDispatched).toBe(0);
    expect(mobileTwinTwinPreviewRoute('ndxbook')).toBe('/projects/ndxbook/design/twin');
    const workspace = readFileSync('src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx', 'utf8');
    expect(workspace).not.toContain('DesignTwinImplementationPage');
  });
});
