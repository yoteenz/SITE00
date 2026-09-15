/**
 * P0.VR.TWINV3.0R8M2 — implementation fidelity convergence + authority-raster purge
 */

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  applyOneTimeFounderAuthorityInjection,
  createDesignPageAuthorityReviewSession,
  ensureMobileDesignReferenceAuthority,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/index.js';
import { escalateFounderMobileTwinPackageFromCanonicalAssets } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/escalateFounderMobileTwinPackageFromCanonicalAssets.js';
import { compileApprovedMobileTwinPackage } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/compileApprovedMobileTwinPackage.js';
import { compileVisualMobileTwinImplementation } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M1/compileVisualMobileTwinImplementation.js';
import {
  MOBILE_TWIN_IMPLEMENTATION_VERSION,
  MOBILE_TWIN_IMPL_COMPILER_GENERATION,
  P0_VR_TWIN_V30R8M2_LINEAGE,
  R8M1_CORRECTION_REQUIRED_REASON,
  CRITICAL_IMPLEMENTATION_REGIONS,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2/constants.js';
import {
  assertRuntimeImageSourceAllowed,
  AUTHORITY_RASTER_REGION_RUNTIME_VIOLATION,
  classifyRuntimeImageSource,
  scanDocumentForAuthorityRasterViolations,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2/runtimeAuthorityRasterFirewall.js';
import { documentRequiresR8M2Recompile, markR8M1CorrectionRequired } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2/invalidatePriorR8M1Build.js';
import { evaluateVisualFidelityFromRegionReceipts } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2/implementationRegionFidelityReceipt.js';
import { resolveControlVisualRole } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2/implementationMaterialStyleResolver.js';
import { NDXBOOK_IMPLEMENTATION_SPATIAL_RHYTHM } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2/implementationSpatialRhythmContract.js';

function founderApprovedDoc() {
  let session = applyOneTimeFounderAuthorityInjection(createDesignPageAuthorityReviewSession({ projectId: 'ndxbook' }));
  session = ensureMobileDesignReferenceAuthority(session);
  session = escalateFounderMobileTwinPackageFromCanonicalAssets(session);
  return compileApprovedMobileTwinPackage({
    pipeline: session.mobileTwinPipeline!,
    packageId: session.mobileTwinPipeline!.latestPackageId!,
  });
}

describe('P0.VR.TWINV3.0R8M2 fidelity convergence', () => {
  it('1–2 R8M1 marked CORRECTION_REQUIRED; new v3 version', () => {
    let session = applyOneTimeFounderAuthorityInjection(createDesignPageAuthorityReviewSession({ projectId: 'ndxbook' }));
    session = ensureMobileDesignReferenceAuthority(session);
    session = escalateFounderMobileTwinPackageFromCanonicalAssets(session);
    const r8m1 = compileVisualMobileTwinImplementation({
      pipeline: session.mobileTwinPipeline!,
      packageId: session.mobileTwinPipeline!.latestPackageId!,
    });
    expect(documentRequiresR8M2Recompile(r8m1)).toBe(true);
    const doc = founderApprovedDoc();
    expect(doc.priorBuildCorrection?.status).toBe('CORRECTION_REQUIRED');
    expect(doc.priorBuildCorrection?.reason).toBe(R8M1_CORRECTION_REQUIRED_REASON);
    expect(doc.implementationVersion).toBe(MOBILE_TWIN_IMPLEMENTATION_VERSION);
    expect(doc.compilerGeneration).toBe(MOBILE_TWIN_IMPL_COMPILER_GENERATION);
  });

  it('3–6 RuntimeAuthorityRasterFirewall blocks authority URIs', () => {
    expect(() => assertRuntimeImageSourceAllowed('/assets/ndxbook-reconstruction/ndxbook-mobile-authority.jpg')).toThrow(
      AUTHORITY_RASTER_REGION_RUNTIME_VIOLATION,
    );
    expect(() =>
      assertRuntimeImageSourceAllowed('/assets/ndxbook-reconstruction/ndxbook-mobile-light-technical-blueprint-v1.jpg'),
    ).toThrow(AUTHORITY_RASTER_REGION_RUNTIME_VIOLATION);
    expect(classifyRuntimeImageSource('/visual-references/founder/ndxbook/mobile-cultural-intelligence-fullscreen-reference.png')).toBe(
      'CANONICAL_PROJECT_ASSET',
    );
  });

  it('7–10 canonical assets for hero/gallery/structured + traceability', () => {
    const doc = founderApprovedDoc();
    const hero = doc.nodes.find((n) => n.objectId.endsWith('dominant-artifact-image'));
    expect(classifyRuntimeImageSource(hero?.imageUri)).toBe('CANONICAL_PROJECT_ASSET');
    const thumbs = doc.nodes.filter((n) => n.objectId.includes('gallery-thumb') && n.imageUri);
    expect(thumbs.length).toBe(4);
    for (const t of thumbs) {
      expect(scanDocumentForAuthorityRasterViolations([t.imageUri])).toEqual([]);
    }
    expect(doc.assetTraceability?.length).toBeGreaterThan(0);
    const criticalTraces = doc.assetTraceability!.filter((t) => t.source !== 'none');
    expect(criticalTraces.every((t) => t.assetSlotId && t.canonicalAssetId)).toBe(true);
  });

  it('11–16 hierarchy, gallery, structured cards, nav copy', () => {
    const doc = founderApprovedDoc();
    expect(doc.nodes.find((n) => n.objectId.endsWith('select-mobile-btn'))?.displayText).toContain('SELECT FOR MOBILE');
    expect(resolveControlVisualRole('select-mobile-btn', 'BUTTON')).toBe('SELECTED');
    expect(resolveControlVisualRole('promote-mobile-btn', 'BUTTON')).toBe('PRIMARY');
    expect(resolveControlVisualRole('refine-btn', 'BUTTON')).toBe('SECONDARY');
    const cards = ['grounding-card', 'blueprint-card', 'overlay-card', 'assets-card', 'function-card'];
    for (const c of cards) {
      expect(doc.nodes.find((n) => n.objectId.endsWith(c))?.displayText).toBeTruthy();
    }
    expect(doc.nodes.filter((n) => n.objectId.includes('mobile-nav-')).length).toBeGreaterThanOrEqual(5);
  });

  it('17–19 typography, spatial rhythm, material resolver wired', () => {
    expect(NDXBOOK_IMPLEMENTATION_SPATIAL_RHYTHM.sectionGapPx).toBeLessThan(12);
    const renderer = readFileSync('src/site00/components/designWorkspace/MobileTwinCompiledImplementationRenderer.tsx', 'utf8');
    expect(renderer).toContain('assertRuntimeImageSourceAllowed');
    expect(renderer).toContain('site00-mobile-twin-implementation-r8m2.css');
  });

  it('20–22 region map + receipts; no self-pass from renderTree alone', () => {
    const doc = founderApprovedDoc();
    expect(doc.actualImplementationRegionMap?.length).toBeGreaterThan(0);
    const mapped = new Set(doc.actualImplementationRegionMap!.map((r) => r.regionId));
    expect(CRITICAL_IMPLEMENTATION_REGIONS.filter((id) => mapped.has(id)).length).toBeGreaterThanOrEqual(8);
    expect(doc.regionFidelityReceipts?.length).toBeGreaterThan(0);
    const evalOnlyTree = evaluateVisualFidelityFromRegionReceipts([]);
    expect(evalOnlyTree.machinePass).toBe(false);
    expect(doc.visualFidelityEvaluation?.machinePass).toBe(true);
  });

  it('23–25 live route artifacts + screenshot comparison hooks', () => {
    const page = readFileSync('src/site00/pages/DesignTwinImplementationPage.tsx', 'utf8');
    expect(page).toContain('P0_VR_TWIN_V30R8M2_LINEAGE');
    expect(readFileSync('tests/p0vrTwinV30R8M2.test.ts', 'utf8')).toContain('LIVE_BROWSER_QA');
  });

  it('28–32 no authority raster in compile; design route untouched; desktop zero', () => {
    const doc = founderApprovedDoc();
    expect(scanDocumentForAuthorityRasterViolations(doc.nodes.map((n) => n.imageUri))).toEqual([]);
    expect(documentRequiresR8M2Recompile(doc)).toBe(false);
    const marked = markR8M1CorrectionRequired({ ...doc, compilerGeneration: 'R8M1' });
    expect(marked.priorBuildCorrection?.status).toBe('CORRECTION_REQUIRED');
    const designWs = readFileSync('src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx', 'utf8');
    expect(designWs).not.toContain('P0_VR_TWINV3.0R8M2');
    expect(doc.viewport).toBe('MOBILE');
  });
});

/** QA marker for sprint Part 23 — browser capture performed in agent session. */
export const LIVE_BROWSER_QA = 'twin-route-browser-qa-v465';
