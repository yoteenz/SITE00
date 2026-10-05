/**
 * P0.VR.TWINV3.0R6F1 — pixel-grounded authority measurement + surgical blueprint
 */

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  applyOneTimeFounderAuthorityInjection,
  approveTranslationReview,
  auditCoarseSurgicalMap,
  createDesignPageAuthorityReviewSession,
  DERIVATION_ALGORITHM_R6F1,
  FOUNDER_R5F2_NDXBOOK_DESKTOP_MASTER,
  FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER,
  MIN_SURGICAL_OBJECTS_PER_VIEWPORT,
  P0_VR_TWIN_V30R6F1_LINEAGE,
  requestDerivationCorrection,
  runDesignWorkspaceDerivation,
  scopeReadinessLabel,
  buildScopedCompilerReadinessReceipt,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/index.js';
import { analyzePixelGroundedAuthority, isBrowserPixelDerivationRuntime } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/designWorkspaceDerivation/pixelGroundedAuthorityAnalysis.js';
import { resolveFounderAuthorityAbsolutePath } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/designWorkspaceDerivation/pixelGroundedAuthorityAnalysisNode.js';

function lockedSession() {
  return applyOneTimeFounderAuthorityInjection(createDesignPageAuthorityReviewSession());
}

describe('P0.VR.TWINV3.0R6F1 pixel-grounded derivation', () => {
  it('1–2 pixel analysis resolves exact mobile and desktop founder authorities', async () => {
    const session = lockedSession();
    const mobile = session.authorityPipeline!.mobileMaster!;
    const desktop = session.authorityPipeline!.desktopMaster!;
    const runId = 'test-run';
    const mobileAnalysis = await analyzePixelGroundedAuthority({
      runId,
      master: mobile,
      featureManifestVersion: mobile.designWorkspaceFeatureManifestVersion,
      projectCreativeContextVersion: mobile.projectCreativeContextVersion,
    });
    const desktopAnalysis = await analyzePixelGroundedAuthority({
      runId,
      master: desktop,
      featureManifestVersion: desktop.designWorkspaceFeatureManifestVersion,
      projectCreativeContextVersion: desktop.projectCreativeContextVersion,
    });
    expect(mobileAnalysis.authorityImageHash).toBe(mobile.authorityImageHash);
    expect(desktopAnalysis.authorityImageHash).toBe(desktop.authorityImageHash);
    expect(mobileAnalysis.imageWidthPx).toBeGreaterThan(100);
    expect(desktopAnalysis.imageWidthPx).toBeGreaterThan(100);
  });

  it('3 source authority JPG hashes unchanged after derivation', async () => {
    const mobilePath = resolveFounderAuthorityAbsolutePath(FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER.publicPath);
    const before = createHash('sha256').update(readFileSync(mobilePath)).digest('hex');
    await runDesignWorkspaceDerivation(lockedSession());
    const after = createHash('sha256').update(readFileSync(mobilePath)).digest('hex');
    expect(after).toBe(before);
    expect(before).toBe(FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER.originalFileHashSha256);
  });

  it('4–5 decomposition yields child objects; coarse map fails audit', async () => {
    const { bundle } = await runDesignWorkspaceDerivation(lockedSession());
    const mobileChildren = bundle.surgicalObjectMap.objects.filter(
      (o) => o.viewport === 'MOBILE' && o.parentObjectId,
    );
    expect(mobileChildren.length).toBeGreaterThan(10);
    const coarse = auditCoarseSurgicalMap(10, 'MOBILE');
    expect(coarse.result).toBe('FAIL');
  });

  it('6–8 coverage receipts generated; high/critical gates', async () => {
    const { bundle, session } = await runDesignWorkspaceDerivation(lockedSession());
    const pkg = bundle.implementationPackage;
    expect(pkg.pixelGroundedAnalysisMobileId).toBeTruthy();
    expect(pkg.authorityVisualCoverageReceiptMobileId).toBeTruthy();
    const mobCov = session.designWorkspaceDerivation!.artifactsById[pkg.authorityVisualCoverageReceiptMobileId!] as {
      highImportanceUnmapped: number;
      result: string;
    };
    expect(mobCov.highImportanceUnmapped).toBe(0);
    const mobWeighted = session.designWorkspaceDerivation!.artifactsById[pkg.weightedAuthorityCoverageReceiptMobileId!] as {
      criticalCoveragePercent: number;
    };
    expect(mobWeighted.criticalCoveragePercent).toBe(100);
  });

  it('9–11 pixel + normalized geometry stored; not skeleton-only', async () => {
    const { bundle } = await runDesignWorkspaceDerivation(lockedSession());
    const obj = bundle.surgicalObjectMap.objects[0] as {
      normalizedX: number;
      x: number;
      pixelSource?: string;
    };
    expect(obj.normalizedX).toBeGreaterThanOrEqual(0);
    expect(obj.x).toBeGreaterThanOrEqual(0);
    expect(obj.pixelSource).toBe('MEASURED');
  });

  it('12–14 relationships, typography blocks, image bounds', async () => {
    const { bundle } = await runDesignWorkspaceDerivation(lockedSession());
    expect(bundle.surgicalObjectMap.relationships.every((r) => r.fromObjectId && r.toObjectId)).toBe(true);
    expect(bundle.typographyFidelityContract.styles.length).toBeGreaterThan(0);
    const withBounds = bundle.surgicalObjectMap.objects.filter((o) => (o as { imageBounds?: unknown }).imageBounds);
    expect(withBounds.length).toBeGreaterThan(0);
  });

  it('15–17 clusters preserve children; feature + function bindings hardened', async () => {
    const { session, bundle } = await runDesignWorkspaceDerivation(lockedSession());
    const clusterId = bundle.implementationPackage.visualClusterMapId!;
    const clusterMap = session.designWorkspaceDerivation!.artifactsById[clusterId] as {
      clusters: { objectIds: string[] }[];
    };
    expect(clusterMap.clusters.some((c) => c.objectIds.length >= 2)).toBe(true);
    expect(bundle.featureBindings.length).toBeGreaterThan(20);
    const move = bundle.functionBindingMap.bindings.find((b) => b.functionTarget === 'move_to_build');
    expect(move?.status).toBe('MISSING');
  });

  it('18–20 raster firewall; responsive correspondence; explicit transforms', async () => {
    const { session, bundle } = await runDesignWorkspaceDerivation(lockedSession());
    expect(bundle.implementationPrimitiveContract.authorityRasterFirewall).toBe(true);
    const mapId = bundle.implementationPackage.responsiveObjectCorrespondenceMapId!;
    const rocm = session.designWorkspaceDerivation!.artifactsById[mapId] as {
      entries: { transformationClass: string }[];
    };
    expect(rocm.entries.length).toBeGreaterThan(0);
    expect(rocm.entries.some((e) => e.transformationClass.length > 3)).toBe(true);
  });

  it('21–24 scoped readiness; not BUILD_READY; move_to_build N/A at DERIVATION', async () => {
    const { bundle } = await runDesignWorkspaceDerivation(lockedSession());
    const scoped = bundle.compilerReadinessReceipt.checks.find((c) => c.gate.includes('move_to_build'));
    expect(scoped?.result).toBe('PASS');
    expect(bundle.implementationPackage.status).toBe('FOUNDER_REVIEW_READY');
    expect(bundle.implementationPackage.status).not.toBe('APPROVED_FOR_BUILD');
    const summary = buildScopedCompilerReadinessReceipt({
      runId: 'x',
      pairId: 'p',
      visualCoverageGatePass: true,
      mobileCoverage: { result: 'PASS' } as never,
      desktopCoverage: { result: 'PASS' } as never,
      mobileGranularity: { result: 'PASS' } as never,
      desktopGranularity: { result: 'PASS' } as never,
      translationApproved: false,
    });
    expect(scopeReadinessLabel('BUILD', summary)).not.toBe('BUILD_READY');
  });

  it('25–26 gaps preserved (no guess); asset identity not cropped', async () => {
    const { bundle } = await runDesignWorkspaceDerivation(lockedSession());
    expect(bundle.canonicalAssetManifest.assets.every((a) => a.authorityCropForbidden)).toBe(true);
  });

  it('27 weighted coverage tracks critical layer', async () => {
    const { session, bundle } = await runDesignWorkspaceDerivation(lockedSession());
    const w = session.designWorkspaceDerivation!.artifactsById[pkgWeightedId(bundle.implementationPackage)] as {
      weightedCoveragePercent: number;
    };
    expect(w.weightedCoveragePercent).toBeGreaterThan(90);
  });

  it('28–30 translation approve vs authority; correction path; history preserved', async () => {
    let session = (await runDesignWorkspaceDerivation(lockedSession())).session;
    const runCountBefore = session.designWorkspaceDerivation!.runs.length;
    session = approveTranslationReview(session);
    expect(session.designWorkspaceDerivation!.translationReview?.founderDecision).toBe('APPROVE_TRANSLATION');
    session = requestDerivationCorrection(session, ['OBJECT MISSED']);
    expect(session.designWorkspaceDerivation!.correctionRequested).toBe(true);
    session = (await runDesignWorkspaceDerivation(session)).session;
    expect(session.designWorkspaceDerivation!.runs.length).toBe(runCountBefore + 1);
  });

  it('32 browser SPA path must not require sharp (vitest runs node path)', () => {
    expect(isBrowserPixelDerivationRuntime()).toBe(false);
  });

  it('31 default derivation entry remains R6F2 exact-boundary (R6F1 lineage preserved in repo)', async () => {
    const { bundle } = await runDesignWorkspaceDerivation(lockedSession());
    expect(P0_VR_TWIN_V30R6F1_LINEAGE).toContain('R6F1');
    expect(bundle.implementationPackage.derivationAlgorithm).toBe('R6F2');
    const mob = bundle.surgicalObjectMap.objects.filter((o) => o.viewport === 'MOBILE').length;
    const desk = bundle.surgicalObjectMap.objects.filter((o) => o.viewport === 'DESKTOP').length;
    expect(mob).toBeGreaterThanOrEqual(MIN_SURGICAL_OBJECTS_PER_VIEWPORT);
    expect(desk).toBeGreaterThanOrEqual(MIN_SURGICAL_OBJECTS_PER_VIEWPORT);
    expect(mob).not.toBe(desk);
  });
});

function pkgWeightedId(pkg: { weightedAuthorityCoverageReceiptMobileId?: string }) {
  return pkg.weightedAuthorityCoverageReceiptMobileId!;
}
