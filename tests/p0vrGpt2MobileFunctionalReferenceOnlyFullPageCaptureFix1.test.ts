/**
 * P0.VR.GPT2-MOBILE-FUNCTIONAL-REFERENCE-ONLY-AND-FULL-PAGE-CAPTURE-FIX1
 */

import { describe, expect, it } from 'vitest';

import {
  GPT2_FUNCTIONAL_REFERENCE_PACKAGE_V1,
  GPT2_MOBILE_INPUT_ROLE,
  GPT2_MOBILE_BOTTOM_STRUCTURAL_HEIGHT_FRACTION,
  GPT2_MOBILE_BOTTOM_STRUCTURAL_TOP_FRACTION,
  GPT2_MOBILE_MIDDLE_STRUCTURAL_HEIGHT_FRACTION,
  GPT2_MOBILE_MIDDLE_STRUCTURAL_TOP_FRACTION,
  GPT2_MOBILE_TOP_STRUCTURAL_HEIGHT_FRACTION,
  assertScreenshotDesignAuthorityForbidden,
  buildGpt2MobileProviderReferenceBundle,
  mockGpt2MobileProviderReferenceBundleForTest,
  orderedProviderReferenceAssets,
  validateMobileStructuralCaptureCoverage,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGpt2MobileReferenceAuthority.js';
import {
  PAGE_GPT2_MOBILE_CAPTURE_INFLUENCE_MODE,
  PAGE_GPT2_MOBILE_PAGE_CONCEPT_PROMPT_VERSION,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGpt2MobilePageAuthority.js';
import { buildPageGpt2MobileConceptRequestPackage } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGpt2MobileRequestPackage.js';
import { compileGpt2MobileProviderPrompt } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGpt2MobileProviderPromptCompiler.js';
import { evaluateGpt2MobileBottomNavContinuityHandoffValidity } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGpt2MobileContinuityLock.js';
import { gpt2MobileProviderImageOrderForTest } from '../api/_lib/site00PageConcept/renderPageGpt2MobileConceptJob.js';
import { listSiteDesignPagesForProject } from '../shared/site00-design-workspace-production/designProjectBinding/index.js';
import { compilePageFunctionContract } from '../shared/site00-design-workspace-production/pageConceptPipeline/functionContract.js';
import { compileProjectCreativeContext, compilePageCreativeContext } from '../shared/site00-design-workspace-production/pageConceptPipeline/contextCompilers.js';
import { compilePageConceptCgptCreativeBrief } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptCgptCreativeBrief.js';
import { compilePageConceptPageArchitectureBrief } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptPageArchitectureBrief.js';
import { compileProjectSkinContract } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptProjectSkinContract.js';
import { buildScreenshotFunctionalPageMapForTest } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptScreenshotFunctionalPageMap.js';
import type { PageCreativeInjection } from '../shared/site00-design-workspace-production/pageConceptPipeline/types.js';

const PROJECT = 'ndxbook';

function overviewPageId(): string {
  const overview = listSiteDesignPagesForProject(PROJECT).find((p) => p.screenId === 'overview');
  if (!overview) throw new Error('overview missing');
  return overview.pageId;
}

describe('P0.VR.GPT2-MOBILE-FUNCTIONAL-REFERENCE-ONLY-AND-FULL-PAGE-CAPTURE-FIX1', () => {
  it('builds exactly top/middle/bottom structural captures with bottom reaching page end', async () => {
    const bundle = await buildGpt2MobileProviderReferenceBundle({
      captureSetId: 'cap-func-ref-1',
      functionalCaptureBase64: 'aaa',
      functionalAssetId: 'full-page-src',
      functionalSourcePath: 'capture/full-page.png',
      fallbackViewport: { width: 390, height: 844 },
    });
    expect(bundle.capturePackageVersion).toBe(GPT2_FUNCTIONAL_REFERENCE_PACKAGE_V1);
    expect(bundle.screenshotAuthorityMode).toBe('FUNCTIONAL_REFERENCE_ONLY');
    expect(bundle.providerImageOrder).toEqual([
      GPT2_MOBILE_INPUT_ROLE.TOP_STRUCTURAL,
      GPT2_MOBILE_INPUT_ROLE.MIDDLE_STRUCTURAL,
      GPT2_MOBILE_INPUT_ROLE.BOTTOM_STRUCTURAL,
    ]);
    expect(bundle.bottomStructuralCapture.regionTopFraction).toBe(GPT2_MOBILE_BOTTOM_STRUCTURAL_TOP_FRACTION);
    expect(
      bundle.bottomStructuralCapture.regionTopFraction + bundle.bottomStructuralCapture.regionHeightFraction,
    ).toBeGreaterThanOrEqual(0.99);
    expect(bundle.topStructuralCapture.height).toBe(Math.round(844 * GPT2_MOBILE_TOP_STRUCTURAL_HEIGHT_FRACTION));
    expect(bundle.middleStructuralCapture.height).toBe(
      Math.round(844 * GPT2_MOBILE_MIDDLE_STRUCTURAL_HEIGHT_FRACTION),
    );
    expect(bundle.bottomStructuralCapture.height).toBe(
      Math.round(844 * GPT2_MOBILE_BOTTOM_STRUCTURAL_HEIGHT_FRACTION),
    );
    expect(gpt2MobileProviderImageOrderForTest({
      prompt: '',
      bottomContinuityCaptureBase64: '',
      providerReferences: bundle,
      lineage: {} as never,
      inspector: {} as never,
    })).toHaveLength(3);
  });

  it('rejects redundant duplicate middle capture and missing bottom coverage', () => {
    const height = 844;
    const slice = Math.round(height * GPT2_MOBILE_MIDDLE_STRUCTURAL_HEIGHT_FRACTION);
    const duplicateMiddle = {
      role: GPT2_MOBILE_INPUT_ROLE.MIDDLE_STRUCTURAL,
      assetId: 'dup',
      sourcePath: 'x',
      width: 390,
      height: slice,
      base64: 'x',
      regionTopFraction: GPT2_MOBILE_MIDDLE_STRUCTURAL_TOP_FRACTION,
      regionHeightFraction: GPT2_MOBILE_MIDDLE_STRUCTURAL_HEIGHT_FRACTION,
      uiLabel: 'MIDDLE STRUCTURE',
    };
    const top = {
      ...duplicateMiddle,
      role: GPT2_MOBILE_INPUT_ROLE.TOP_STRUCTURAL,
      regionTopFraction: 0,
      regionHeightFraction: GPT2_MOBILE_TOP_STRUCTURAL_HEIGHT_FRACTION,
      uiLabel: 'TOP STRUCTURE',
    };
    const redundant = validateMobileStructuralCaptureCoverage({
      sourcePageHeight: height,
      top,
      middle: duplicateMiddle,
      bottom: duplicateMiddle,
    });
    expect(redundant.ok).toBe(false);
    expect(redundant.errorCode).toBe('REDUNDANT_CAPTURE_SET');

    const missingBottom = validateMobileStructuralCaptureCoverage({
      sourcePageHeight: height,
      top,
      middle: duplicateMiddle,
      bottom: {
        ...duplicateMiddle,
        regionTopFraction: 0.85,
        regionHeightFraction: 0.1,
      },
    });
    expect(missingBottom.ok).toBe(false);
    expect(missingBottom.errorCode).toBe('MISSING_BOTTOM_STRUCTURAL_CAPTURE');
  });

  it('prompt uses functional reference only and forbids screenshot design authority', () => {
    const pageId = overviewPageId();
    const projectContext = compileProjectCreativeContext(PROJECT)!;
    const pageContext = compilePageCreativeContext(PROJECT, pageId)!;
    const functionContract = compilePageFunctionContract(PROJECT, pageId)!;
    const injection: PageCreativeInjection = {
      injectionId: 'inj-func-ref',
      projectId: PROJECT,
      pageId,
      projectContextVersion: '1',
      pageContextVersion: '1',
      functionContractVersion: '1',
      creativeThesis: 'Overview',
      creativePremise: 'NDXBOOK overview',
      pageStory: 'Overview',
      pagePurposeInterpretation: 'Overview',
      visualOpportunity: 'Light page',
      visualTerritory: 'NDX',
      hierarchyDirection: 'Title-first',
      hierarchyStrategy: 'Monument',
      spatialDirection: 'Vertical',
      compositionStrategy: 'Regions',
      informationPriority: 'Entries',
      imageDataBalance: 'Evidence',
      responsiveDirection: 'Mobile',
      mobileDirection: 'Scroll',
      desktopDirection: 'Wide',
      creativeLatitude: 'High',
      immutableRequirements: ['bottom nav'],
      referenceStrategy: 'Capture',
      assetStrategy: 'Evidence',
      imageryStrategy: 'Archival',
      interactionCharacter: 'Tappable',
      distinctiveMove: 'Index',
      typographyStrategy: 'Uppercase',
      colorStrategy: 'Light',
      materialStrategy: 'Paper',
      avoidList: ['poster'],
      mandatoryBrandSignals: ['NDXBOOK'],
      audienceIntent: 'Founder',
      createdAt: new Date().toISOString(),
      cgptProvider: 'vitest',
      cgptModel: 'vitest',
    };
    const cgptBrief = compilePageConceptCgptCreativeBrief({
      injection,
      projectContext,
      pageContext,
      functionContract,
    });
    const arch = compilePageConceptPageArchitectureBrief({
      projectContext,
      pageContext,
      functionContract,
      injection,
      cgptCreativeBrief: cgptBrief,
    });
    const skin = compileProjectSkinContract(PROJECT);
    const refs = mockGpt2MobileProviderReferenceBundleForTest();
    const screenshotFunctionalPageMap = buildScreenshotFunctionalPageMapForTest({
      captureSetId: 'cap-func-ref',
      providerReferenceBundle: refs,
      projectContext,
      pageContext,
      functionContract,
      pageArchitectureBrief: arch,
    });
    const pkg = buildPageGpt2MobileConceptRequestPackage({
      runId: 'run-func-ref',
      slot: 'MOBILE_CONCEPT_A',
      conceptId: 'c-a',
      projectContext,
      pageContext,
      functionContract,
      injection,
      cgptBrief,
      pageArchitectureBrief: arch,
      skinContract: skin,
      providerReferences: refs,
      screenshotFunctionalPageMap,
      pageContextSummary: '{}',
      mobileViewport: { width: 390, height: 844 },
    });
    expect(PAGE_GPT2_MOBILE_PAGE_CONCEPT_PROMPT_VERSION).toContain('functional-reference-only');
    expect(pkg.inspector.captureInfluenceMode).toBe(PAGE_GPT2_MOBILE_CAPTURE_INFLUENCE_MODE);
    expect(pkg.inspector.captureInfluenceMode).toBe('FUNCTIONAL_REFERENCE_ONLY');
    expect(pkg.prompt).toMatch(/FUNCTIONAL_REFERENCE_ONLY|FUNCTIONAL REFERENCE ONLY/i);
    expect(pkg.prompt).toMatch(/SCREENSHOT_DESIGN_AUTHORITY: FORBIDDEN/i);
    expect(pkg.prompt).toMatch(/Do NOT imitate capture styling/i);
    expect(pkg.prompt).toMatch(/Structural Capture A/i);
    expect(pkg.prompt).toMatch(/Structural Capture C/i);
    expect(evaluateGpt2MobileBottomNavContinuityHandoffValidity(pkg.prompt).ok).toBe(true);
    expect(() =>
      assertScreenshotDesignAuthorityForbidden('Image A is the visual authority from capture'),
    ).toThrow(/SCREENSHOT_DESIGN_AUTHORITY_FORBIDDEN/);
    expect(() => assertScreenshotDesignAuthorityForbidden(pkg.prompt)).not.toThrow();
  });

  it('legacy full-page + half + nav provider order is blocked', () => {
    const refs = mockGpt2MobileProviderReferenceBundleForTest();
    const legacyOrder = [
      GPT2_MOBILE_INPUT_ROLE.FULL_PAGE_SOURCE,
      GPT2_MOBILE_INPUT_ROLE.BOTTOM_HALF,
      GPT2_MOBILE_INPUT_ROLE.BOTTOM_NAV,
    ] as typeof refs.providerImageOrder;
    expect(() =>
      orderedProviderReferenceAssets({
        ...refs,
        providerImageOrder: legacyOrder,
      }),
    ).toThrow(/GPT2_MOBILE_LEGACY_REFERENCE_ROLE_FORBIDDEN/);
  });
});
