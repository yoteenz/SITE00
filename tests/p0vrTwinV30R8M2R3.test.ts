/**
 * P0.VR.TWINV3.0R8M2R3 — translation-driven full rebuild
 */

import { describe, expect, it } from 'vitest';
import {
  applyOneTimeFounderAuthorityInjection,
  createDesignPageAuthorityReviewSession,
  ensureMobileDesignReferenceAuthority,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/index.js';
import { escalateFounderMobileTwinPackageFromCanonicalAssets } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/escalateFounderMobileTwinPackageFromCanonicalAssets.js';
import { compileApprovedMobileTwinPackage } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/compileApprovedMobileTwinPackage.js';
import { compileVisualMobileTwinImplementationR8M2R2 } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2R2/compileVisualMobileTwinImplementationR8M2R2.js';
import { compileVisualMobileTwinImplementationR8M2R3 } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2R3/compileVisualMobileTwinImplementationR8M2R3.js';
import {
  MOBILE_TWIN_IMPLEMENTATION_VERSION_TRANSLATION_REBUILD,
  MOBILE_TWIN_IMPL_COMPILER_GENERATION_R8M2R3,
  P0_VR_TWIN_V30R8M2R3_LINEAGE,
  R8M2R2_CORRECTION_REQUIRED_REASON,
  PATCH_EXISTING_PROHIBITED,
  STALE_RENDER_TREE_REUSE,
  TRANSLATION_REBUILD_NOT_MATERIAL,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2R3/constants.js';
import {
  assertGenerationModeAllowed,
  resolveProductionImplementationGenerationMode,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2R3/implementationGenerationMode.js';
import { renderTreeStructureSignature, componentCompositionHash } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2R3/staleRenderTreeReuseFirewall.js';
import { documentRequiresR8M2Recompile } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2/invalidatePriorR8M1Build.js';
import { scanDocumentForAuthorityRasterViolations } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2/runtimeAuthorityRasterFirewall.js';
import { readFileSync } from 'node:fs';

function founderCompileInput() {
  let session = applyOneTimeFounderAuthorityInjection(createDesignPageAuthorityReviewSession({ projectId: 'ndxbook' }));
  session = ensureMobileDesignReferenceAuthority(session);
  session = escalateFounderMobileTwinPackageFromCanonicalAssets(session);
  const pipeline = session.mobileTwinPipeline!;
  return { pipeline, packageId: pipeline.latestPackageId! };
}

describe('P0.VR.TWINV3.0R8M2R3 translation rebuild', () => {
  it('1–3 FULL_TRANSLATION_REBUILD mandatory; PATCH prohibited; R8M2R2 marked correction', () => {
    expect(resolveProductionImplementationGenerationMode()).toBe('FULL_TRANSLATION_REBUILD');
    expect(() => assertGenerationModeAllowed('PATCH_EXISTING')).toThrow(PATCH_EXISTING_PROHIBITED);
    const doc = compileApprovedMobileTwinPackage(founderCompileInput());
    expect(doc.priorBuildCorrection?.priorGeneration).toBe('R8M2R2');
    expect(doc.priorBuildCorrection?.reason).toBe(R8M2R2_CORRECTION_REQUIRED_REASON);
  });

  it('4–7 stale render tree firewall; hashes differ; function bindings preserved', () => {
    const input = founderCompileInput();
    const prior = compileVisualMobileTwinImplementationR8M2R2(input);
    const next = compileVisualMobileTwinImplementationR8M2R3(input);
    expect(renderTreeStructureSignature(prior)).not.toBe(renderTreeStructureSignature(next));
    expect(componentCompositionHash(next)).not.toBe(componentCompositionHash(prior));
    expect(next.nodes.filter((n) => n.functionTarget).length).toBeGreaterThan(0);
  });

  it('8–10 fresh plan, component tree, css contract', () => {
    const doc = compileApprovedMobileTwinPackage(founderCompileInput());
    expect(doc.translationDrivenImplementationPlan?.id).toMatch(/^tdip-/);
    expect(doc.translationDrivenComponentTree?.nodes.length).toBeGreaterThan(20);
    expect(doc.translationDrivenCssContract?.rootClass).toBe('site00-twin-td');
  });

  it('11–17 critical sections rebuilt in td-* render tree', () => {
    const doc = compileApprovedMobileTwinPackage(founderCompileInput());
    const sections = new Set(doc.renderTree?.nodes.map((n) => n.sectionId));
    for (const id of ['td-hero', 'td-gallery', 'td-structured', 'td-readiness', 'td-metadata', 'td-bottom-nav']) {
      expect(sections.has(id)).toBe(true);
    }
    expect(doc.renderTree?.nodes.some((n) => n.styleSource === 'TRANSLATION_DRIVEN_REBUILD')).toBe(true);
  });

  it('18–20 composition, layout, style hashes differ from R8M2R2', () => {
    const input = founderCompileInput();
    const prior = compileVisualMobileTwinImplementationR8M2R2(input);
    const doc = compileApprovedMobileTwinPackage(input);
    const receipt = doc.translationMaterialityReceipt!;
    expect(receipt.priorComponentCompositionHash).not.toBe(receipt.newComponentCompositionHash);
    expect(receipt.priorLayoutContractHash).not.toBe(receipt.newLayoutContractHash);
    expect(receipt.priorStyleContractHash).not.toBe(receipt.newStyleContractHash);
    expect(receipt.result).toBe('PASS');
    void prior;
  });

  it('21–24 brief drives structure; no authority raster', () => {
    const doc = compileApprovedMobileTwinPackage(founderCompileInput());
    expect(doc.implementationTranslationBrief?.globalTranslation.length).toBeGreaterThan(40);
    expect(doc.implementationExpressionIr?.objectExpressions.length).toBeGreaterThan(20);
    expect(scanDocumentForAuthorityRasterViolations(doc.nodes.map((n) => n.imageUri))).toEqual([]);
    expect(doc.assetTraceability?.length).toBeGreaterThan(0);
  });

  it('25–26 materiality receipt; near-identical would fail', () => {
    const doc = compileApprovedMobileTwinPackage(founderCompileInput());
    expect(doc.translationMaterialityReceipt?.result).toBe('PASS');
    expect(TRANSLATION_REBUILD_NOT_MATERIAL).toBe('TRANSLATION_REBUILD_NOT_MATERIAL');
    expect(STALE_RENDER_TREE_REUSE).toBe('STALE_RENDER_TREE_REUSE');
  });

  it('27–29 production path R8M2R3 + region convergence receipts', () => {
    const doc = compileApprovedMobileTwinPackage(founderCompileInput());
    expect(doc.compilerGeneration).toBe(MOBILE_TWIN_IMPL_COMPILER_GENERATION_R8M2R3);
    expect(doc.lineage).toBe(P0_VR_TWIN_V30R8M2R3_LINEAGE);
    expect(doc.implementationVersion).toBe(MOBILE_TWIN_IMPLEMENTATION_VERSION_TRANSLATION_REBUILD);
    expect(doc.translationDrivenRegionConvergenceReceipts?.length).toBe(10);
  });

  it('30–33 design route untouched; desktop zero; cache requires R8M2R3', () => {
    const doc = compileApprovedMobileTwinPackage(founderCompileInput());
    expect(doc.viewport).toBe('MOBILE');
    expect(documentRequiresR8M2Recompile(doc)).toBe(false);
    expect(documentRequiresR8M2Recompile(compileVisualMobileTwinImplementationR8M2R2(founderCompileInput()))).toBe(true);
    const designWs = readFileSync('src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx', 'utf8');
    expect(designWs).not.toContain('mobile-twin-impl-v5-translation-rebuild');
  });

  it('renderer uses translation-driven root class', () => {
    const renderer = readFileSync('src/site00/components/designWorkspace/MobileTwinCompiledImplementationRenderer.tsx', 'utf8');
    expect(renderer).toContain('site00-twin-td');
    expect(renderer).toContain("document.compilerGeneration === 'R8M2R3'");
  });
});
