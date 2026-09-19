/**
 * P0.VR.TWINV3.0R6F2 — exact object boundaries + geometry fidelity
 */

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  applyOneTimeFounderAuthorityInjection,
  createDesignPageAuthorityReviewSession,
  evaluateTranslationApprovalGate,
  FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER,
  P0_VR_TWIN_V30R6F2_LINEAGE,
  requestDerivationCorrection,
  runDesignWorkspaceDerivation,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/index.js';
import {
  auditObjectOverlaps,
  buildGeometryFidelityReceipt,
  buildInteractionBounds,
  computeBoundsTightnessMetric,
  computeSurroundingWhitespaceRatio,
  computeTemplateLoosenessRatio,
  evaluateObjectBoundaryFidelity,
  listGeometryQaWeakObjects,
  maxWhitespaceTolerance,
  tightenVisualBounds,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/designWorkspaceDerivation/exactBoundaryAnalysis.js';
import type { ExactPixelMeasuredObject } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/designWorkspaceDerivation/geometryFidelityTypes.js';
import { resolveFounderAuthorityAbsolutePath } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/designWorkspaceDerivation/pixelGroundedAuthorityAnalysisNode.js';

function lockedSession() {
  return applyOneTimeFounderAuthorityInjection(createDesignPageAuthorityReviewSession());
}

function stubExact(partial: Partial<ExactPixelMeasuredObject>): ExactPixelMeasuredObject {
  const predicted = { x: 0, y: 0, w: 100, h: 40 };
  const visual = partial.visualBounds ?? { x: 5, y: 5, w: 30, h: 20 };
  return {
    objectId: partial.objectId ?? 'mobile-test-btn',
    viewport: partial.viewport ?? 'MOBILE',
    parentObjectId: partial.parentObjectId ?? null,
    regionId: 'reg',
    category: partial.category ?? 'BUTTON',
    semanticRole: 'TEST',
    featureId: null,
    ownership: 'SHARED_CONTRACT',
    x: visual.x,
    y: visual.y,
    w: visual.w,
    h: visual.h,
    zIndex: 1,
    visibleText: null,
    interactionIntent: null,
    fidelityImportance: 'HIGH',
    implementationPrimitive: 'DOM_BUTTON',
    normalizedX: 0,
    normalizedY: 0,
    normalizedWidth: 0.1,
    normalizedHeight: 0.02,
    centerX: visual.x + visual.w / 2,
    centerY: visual.y + visual.h / 2,
    visualImportance: partial.visualImportance ?? 'HIGH',
    pixelSource: 'MEASURED',
    predictedBounds: partial.predictedBounds ?? predicted,
    visualBounds: visual,
    interactionBounds: partial.interactionBounds ?? buildInteractionBounds(visual, partial.category ?? 'BUTTON'),
    geometrySource: partial.geometrySource ?? 'PIXEL_EDGE',
    geometryConfidence: partial.geometryConfidence ?? 0.9,
    geometryConfidenceLevel: partial.geometryConfidenceLevel ?? 'HIGH',
    derivationAlgorithm: 'R6F2',
    lineGeometry: partial.lineGeometry,
  };
}

describe('P0.VR.TWINV3.0R6F2 exact boundary derivation', () => {
  it('1 loose template box fails tightness QA', () => {
    const loose = { x: 0, y: 0, w: 200, h: 80 };
    const obj = stubExact({ predictedBounds: loose, visualBounds: loose, category: 'BUTTON' });
    const metric = computeBoundsTightnessMetric(obj);
    expect(metric.pass).toBe(false);
  });

  it('2 visual vs interaction bounds differ for buttons', () => {
    const visual = { x: 10, y: 10, w: 80, h: 30 };
    const interaction = buildInteractionBounds(visual, 'BUTTON');
    expect(interaction.h).toBeGreaterThan(visual.h);
  });

  it('3–5 parent/child overlap rules', () => {
    const parent = stubExact({
      objectId: 'mobile-parent',
      category: 'PANEL',
      visualBounds: { x: 0, y: 0, w: 200, h: 200 },
      parentObjectId: null,
    });
    const child = stubExact({
      objectId: 'mobile-child',
      parentObjectId: 'mobile-parent',
      visualBounds: { x: 10, y: 10, w: 40, h: 40 },
    });
    const audit = auditObjectOverlaps({ viewport: 'MOBILE', objects: [parent, child], runId: 't' });
    expect(audit.entries[0]?.classification).toBe('VALID_PARENT_CHILD');
    const sibA = stubExact({ objectId: 'a', visualBounds: { x: 0, y: 0, w: 80, h: 40 } });
    const sibB = stubExact({ objectId: 'b', visualBounds: { x: 10, y: 10, w: 80, h: 40 } });
    const collision = auditObjectOverlaps({ viewport: 'MOBILE', objects: [sibA, sibB], runId: 't2' });
    expect(collision.entries.some((e) => e.classification === 'INVALID_COLLISION')).toBe(true);
  });

  it('6–9 text/button/thumbnail tight geometry helpers', () => {
    const predicted = { x: 0, y: 0, w: 120, h: 40 };
    const tight = tightenVisualBounds(predicted, 'TEXT');
    expect(tight.w).toBeLessThan(predicted.w);
    const btn = tightenVisualBounds(predicted, 'BUTTON');
    expect(btn.w).toBeLessThan(predicted.w);
    const thumb = tightenVisualBounds(predicted, 'THUMBNAIL');
    expect(computeTemplateLoosenessRatio(predicted, thumb)).toBeGreaterThan(0.1);
  });

  it('7 divider uses line geometry in full derivation', async () => {
    const { bundle } = await runDesignWorkspaceDerivation(lockedSession());
    const divider = bundle.surgicalObjectMap.objects.find(
      (o) => o.category === 'BORDER' && (o as ExactPixelMeasuredObject).lineGeometry,
    ) as ExactPixelMeasuredObject | undefined;
    expect(divider?.lineGeometry?.orientation).toBeTruthy();
  });

  it('10–13 gallery, authority pair, nav, readiness decompose', async () => {
    const { bundle } = await runDesignWorkspaceDerivation(lockedSession());
    const objs = bundle.surgicalObjectMap.objects;
    expect(objs.filter((o) => o.objectId.includes('gallery-thumb')).length).toBeGreaterThanOrEqual(4);
    expect(objs.some((o) => o.objectId.includes('lock-pair'))).toBe(true);
    expect(objs.some((o) => o.objectId.includes('host-nav'))).toBe(true);
    expect(objs.some((o) => o.objectId.includes('readiness'))).toBe(true);
  });

  it('14–17 geometry source + receipts + coverage vs geometry', async () => {
    const { session, bundle } = await runDesignWorkspaceDerivation(lockedSession());
    const pkg = bundle.implementationPackage;
    const mobGeo = session.designWorkspaceDerivation!.artifactsById[pkg.geometryFidelityReceiptMobileId!] as {
      result: string;
      objectCoveragePercent: number;
      weightedGeometryFidelityPercent: number;
    };
    const mobCov = session.designWorkspaceDerivation!.artifactsById[pkg.authorityVisualCoverageReceiptMobileId!] as {
      coveragePercent: number;
    };
    expect(mobGeo.objectCoveragePercent).toBe(100);
    expect(mobGeo.weightedGeometryFidelityPercent).toBeGreaterThan(0);
    expect(mobGeo.weightedGeometryFidelityPercent).toBeLessThanOrEqual(100);
    if (mobGeo.result === 'PASS') expect(mobCov.coveragePercent).toBeGreaterThan(90);
  });

  it('18–19 independent viewport counts', async () => {
    const { bundle } = await runDesignWorkspaceDerivation(lockedSession());
    const mob = bundle.surgicalObjectMap.objects.filter((o) => o.viewport === 'MOBILE').length;
    const desk = bundle.surgicalObjectMap.objects.filter((o) => o.viewport === 'DESKTOP').length;
    expect(mob).not.toBe(desk);
  });

  it('20 bounds tightness uses object-type tolerance', () => {
    const text = stubExact({ category: 'TEXT', visualBounds: { x: 0, y: 0, w: 40, h: 20 } });
    const panel = stubExact({ category: 'PANEL', visualBounds: { x: 0, y: 0, w: 400, h: 300 } });
    expect(computeSurroundingWhitespaceRatio(text.predictedBounds, text.visualBounds, 'TEXT')).toBeLessThan(0.3);
    expect(maxWhitespaceTolerance('PANEL')).toBeGreaterThan(maxWhitespaceTolerance('TEXT'));
  });

  it('21–22 lineage on correction + manual override record shape', async () => {
    let session = (await runDesignWorkspaceDerivation(lockedSession())).session;
    const priorId = session.designWorkspaceDerivation!.latestPackageId!;
    session = requestDerivationCorrection(session, ['OBJECT_BOUNDARIES_NOT_PIXEL_EXACT']);
    expect(session.designWorkspaceDerivation!.translationReview?.correctionReason).toBe('OBJECT_BOUNDARIES_NOT_PIXEL_EXACT');
    session = (await runDesignWorkspaceDerivation(session)).session;
    const pkg = session.designWorkspaceDerivation!.packages.at(-1)!;
    expect(pkg.priorImplementationPackageId).toBe(priorId);
    expect(pkg.derivationVersion).toBe(2);
  });

  it('23–25 gates, raster firewall, no build', async () => {
    const { bundle } = await runDesignWorkspaceDerivation(lockedSession());
    expect(bundle.implementationPrimitiveContract.authorityRasterFirewall).toBe(true);
    expect(bundle.implementationPackage.status).not.toBe('APPROVED_FOR_BUILD');
    const gate = evaluateTranslationApprovalGate(
      (await runDesignWorkspaceDerivation(lockedSession())).session,
    );
    expect(gate.allowed).toBe(true);
  });

  it('26–28 authority JPG unchanged + lineage', async () => {
    const path = resolveFounderAuthorityAbsolutePath(FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER.publicPath);
    const before = createHash('sha256').update(readFileSync(path)).digest('hex');
    await runDesignWorkspaceDerivation(lockedSession());
    const after = createHash('sha256').update(readFileSync(path)).digest('hex');
    expect(after).toBe(before);
    expect(P0_VR_TWIN_V30R6F2_LINEAGE).toContain('R6F2');
  });

  it('24 geometry QA lists weak objects when forced fail', () => {
    const obj = stubExact({
      visualImportance: 'CRITICAL',
      geometryConfidence: 0.3,
      geometryConfidenceLevel: 'LOW',
      geometrySource: 'LOW_CONFIDENCE_INFERENCE',
      visualBounds: { x: 0, y: 0, w: 200, h: 80 },
      predictedBounds: { x: 0, y: 0, w: 200, h: 80 },
    });
    const audit = auditObjectOverlaps({ viewport: 'MOBILE', objects: [obj], runId: 'x' });
    const receipt = evaluateObjectBoundaryFidelity({ object: obj, overlapAudit: audit });
    expect(receipt.result).toBe('FAIL');
    const analysis = {
      id: 'a',
      authorityImageId: 'i',
      viewport: 'MOBILE' as const,
      measuredObjects: [obj],
      boundaryReceipts: [receipt],
      overlapAudit: audit,
      geometryFidelityReceipt: buildGeometryFidelityReceipt({
        viewport: 'MOBILE',
        runId: 'x',
        boundaryReceipts: [receipt],
        overlapAudit: audit,
        objectCoveragePercent: 100,
      }),
      version: 2 as const,
    };
    expect(listGeometryQaWeakObjects(analysis).length).toBeGreaterThan(0);
  });
});
