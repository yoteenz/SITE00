/**
 * P0.VR.TWINV3.0R8M2R5 — @Fal forensic UI blueprint + blueprint-driven twin
 */

import { describe, expect, it, beforeEach } from 'vitest';
import {
  applyOneTimeFounderAuthorityInjection,
  createDesignPageAuthorityReviewSession,
  ensureMobileDesignReferenceAuthority,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/index.js';
import { escalateFounderMobileTwinPackageFromCanonicalAssets } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/escalateFounderMobileTwinPackageFromCanonicalAssets.js';
import { compileApprovedMobileTwinPackage } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/compileApprovedMobileTwinPackage.js';
import { compileVisualMobileTwinImplementationR8M2R4 } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2R4/compileVisualMobileTwinImplementationR8M2R4.js';
import { compileVisualMobileTwinImplementationR8M2R5 } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2R5/compileVisualMobileTwinImplementationR8M2R5.js';
import {
  FORENSIC_BLUEPRINT_FAL_ENDPOINT,
  FORENSIC_BLUEPRINT_PROMPT_VERSION,
  FORENSIC_PROMPT_OPENING,
  MOBILE_TWIN_IMPLEMENTATION_VERSION_FORENSIC_BLUEPRINT,
  MOBILE_TWIN_IMPL_COMPILER_GENERATION_R8M2R5,
  P0_VR_TWIN_V30R8M2R5_LINEAGE,
  R8M2R4_CORRECTION_REQUIRED_REASON,
  SYNTHETIC_SCREENSHOT_USED_AS_PROOF,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2R5/constants.js';
import { buildForensicUiBlueprintPrompt } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2R5/buildForensicUiBlueprintPrompt.js';
import {
  buildNanoBanana2EditInput,
  generateForensicUiBlueprintAuthority,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2R5/dispatchForensicUiBlueprintFal.js';
import { clearForensicBlueprintCacheForTests } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2R5/forensicBlueprintCache.js';
import { assertNotSyntheticScreenshotProof } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2R5/realBrowserForensicFidelity.js';
import { renderTreeStructureSignatureR8M2R5 } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2R5/staleRenderTreeReuseFirewallR8M2R5.js';
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

describe('P0.VR.TWINV3.0R8M2R5 forensic blueprint implementation', () => {
  beforeEach(() => {
    clearForensicBlueprintCacheForTests();
  });

  it('1–6 Fal workflow, primary actual, secondary blueprint, endpoint, prompt', async () => {
    const prompt = buildForensicUiBlueprintPrompt({
      sourceActualHash: 'abc123456789',
      canonicalViewport: { widthPx: 1200, heightPx: 2600 },
    });
    expect(prompt).toContain('FORENSIC UI IMPLEMENTATION BLUEPRINT');
    expect(prompt).toContain(FORENSIC_BLUEPRINT_PROMPT_VERSION);
    const input = buildNanoBanana2EditInput({
      prompt,
      primaryImageUrl: 'https://example.com/actual.jpg',
      secondaryImageUrl: 'https://example.com/light-bp.jpg',
    });
    expect(input.image_urls[0]).toContain('actual');
    expect(input.output_format).toBe('png');
    expect(FORENSIC_BLUEPRINT_FAL_ENDPOINT).toBe('fal-ai/nano-banana-2/edit');

    const gen = await generateForensicUiBlueprintAuthority({
      projectId: 'ndxbook',
      sourceActualAuthorityId: 'actual-1',
      sourceActualHash: 'abc1234567890123',
      primaryActualImageUrl: 'https://example.com/actual.jpg',
      secondaryLightBlueprintUrl: 'https://example.com/bp.jpg',
      canonicalViewport: { widthPx: 1200, heightPx: 2600 },
    });
    expect(gen.authority.sourceActualHash).toBe('abc1234567890123');
    expect(gen.receipt.endpoint).toBe(FORENSIC_BLUEPRINT_FAL_ENDPOINT);
    expect(gen.receipt.promptVersion).toBe(FORENSIC_BLUEPRINT_PROMPT_VERSION);
  });

  it('7–17 forensic artifacts on compile', () => {
    const doc = compileApprovedMobileTwinPackage(founderCompileInput());
    expect(doc.forensicUiBlueprintAuthority?.status).toMatch(/MACHINE_VALIDATED|FOUNDER_BLUEPRINT_REVIEW/);
    expect(doc.forensicUiObjectMap?.objects.length).toBeGreaterThan(10);
    expect(doc.forensicUiSectionMap?.sections.length).toBeGreaterThan(5);
    expect(doc.forensicTypographyMap?.entries.length).toBeGreaterThan(0);
    expect(doc.forensicVisualStyleMap?.limeAccent).toBe('#c8ff00');
    expect(doc.forensicSpacingMap?.sectionGapPx).toBeGreaterThan(0);
    expect(doc.forensicAssetPlacementMap?.assets.length).toBeGreaterThan(0);
    expect(doc.forensicImplementationSpec?.hash.length).toBeGreaterThanOrEqual(8);
  });

  it('18–22 forensic prompt injected; fresh fm3 ingestion tree on production path', () => {
    const input = founderCompileInput();
    const prior = compileVisualMobileTwinImplementationR8M2R4(input);
    const doc = compileApprovedMobileTwinPackage(input);
    expect(doc.forensicImplementationCodingPrompt?.fullText.startsWith(FORENSIC_PROMPT_OPENING)).toBe(true);
    expect(doc.forensicPromptInjected).toBe(true);
    expect(renderTreeStructureSignatureR8M2R5(prior)).not.toBe(renderTreeStructureSignatureR8M2R5(doc));
    expect(doc.renderTree?.nodes.some((n) => n.sectionId.startsWith('fm3-'))).toBe(true);
    expect(doc.implementationVersion).toBe('mobile-twin-impl-v8-forensic-ingestion');
  });

  it('23–28 critical regions use ingestion forensic geometry in tree', () => {
    const doc = compileApprovedMobileTwinPackage(founderCompileInput());
    const sections = new Set(doc.renderTree?.nodes.map((n) => n.sectionId));
    for (const id of [
      'fm3-hero-workspace',
      'fm3-candidate-gallery',
      'fm3-structured-output',
      'fm3-readiness',
      'fm3-bottom-nav',
    ]) {
      expect(sections.has(id)).toBe(true);
    }
    expect(doc.renderTree?.nodes.some((n) => n.styleSource === 'FORENSIC_INGESTION_REBUILD')).toBe(true);
  });

  it('29–35 real browser QA; no synthetic proof; DOM loop', () => {
    const doc = compileApprovedMobileTwinPackage(founderCompileInput());
    expect(doc.realBrowserTwinScreenshot?.proofKind).toBe('PLAYWRIGHT_DOM');
    expect(doc.syntheticScreenshotUsedAsProof).toBe(false);
    expect(() =>
      assertNotSyntheticScreenshotProof({
        ...doc.realBrowserTwinScreenshot!,
        proofKind: 'PLAYWRIGHT_DOM',
        screenshotPath: 'compile-time/synthetic.png',
      }),
    ).toThrow(SYNTHETIC_SCREENSHOT_USED_AS_PROOF);
    expect(doc.forensicDomCorrectionIterations?.length).toBeGreaterThanOrEqual(2);
    expect(doc.forensicFidelityGate?.realBrowserScreenshotPresent).toBe(true);
    const within = doc.forensicDomCorrectionIterations?.at(-1)?.measurements.filter((m) => m.withinTolerance).length ?? 0;
    expect(within).toBeGreaterThan(0);
  });

  it('36–40 production path, UI, design route, desktop', () => {
    const doc = compileApprovedMobileTwinPackage(founderCompileInput());
    expect(doc.compilerGeneration).toBe('R8M3');
    expect(doc.lineage).toBe('P0.VR.TWINV3.0R8M3');
    expect(doc.priorBuildCorrection?.reason).toBe('FORENSIC_BLUEPRINT_NOT_INGESTED_AS_IMPLEMENTATION_SPEC');
    expect(documentRequiresR8M2Recompile(doc)).toBe(false);
    expect(documentRequiresR8M2Recompile(compileVisualMobileTwinImplementationR8M2R4(founderCompileInput()))).toBe(true);
    expect(scanDocumentForAuthorityRasterViolations(doc.nodes.map((n) => n.imageUri))).toEqual([]);
    const page = readFileSync('src/site00/pages/DesignTwinImplementationPage.tsx', 'utf8');
    expect(page).toContain('FORENSIC_BLUEPRINT');
    expect(page).toContain('DesignTwinForensicBlueprintPanel');
    const review = readFileSync('src/site00/components/designWorkspace/DesignTwinImplementationReviewPanel.tsx', 'utf8');
    expect(review).toContain('FORENSIC BLUEPRINT');
    expect(review).toContain('DesignTwinForensicImplementationInspector');
    const designWs = readFileSync('src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx', 'utf8');
    expect(designWs).not.toContain('mobile-twin-impl-v7-forensic-blueprint');
    void compileVisualMobileTwinImplementationR8M2R5;
  });
});
