/**
 * P0.VR.GPT2-MOBILE-FULL-PAGE-CONTINUITY-AND-BOTTOM-NAV-LOCK1
 * Updated for GPT2_FUNCTIONAL_REFERENCE_PACKAGE_V1 (top/middle/bottom structural captures).
 */

import { describe, expect, it } from 'vitest';

import {
  buildGpt2MobileProviderReferenceBundle,
  GPT2_MOBILE_INPUT_ROLE,
  mockGpt2MobileProviderReferenceBundleForTest,
  orderedProviderReferenceAssets,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGpt2MobileReferenceAuthority.js';
import {
  evaluateGpt2MobileBottomNavContinuityHandoffValidity,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGpt2MobileContinuityLock.js';
import { compileGpt2MobileProviderPrompt } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGpt2MobileProviderPromptCompiler.js';
import { buildPageGpt2MobileConceptRequestPackage } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGpt2MobileRequestPackage.js';
import { PAGE_GPT2_MOBILE_CAPTURE_INFLUENCE_MODE } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGpt2MobilePageAuthority.js';
import { gpt2MobileProviderImageOrderForTest } from '../api/_lib/site00PageConcept/renderPageGpt2MobileConceptJob.js';
import { appendPageCapture } from '../shared/site00-design-workspace-production/designPageCapture.js';
import { listSiteDesignPagesForProject } from '../shared/site00-design-workspace-production/designProjectBinding/index.js';
import { compilePageFunctionContract } from '../shared/site00-design-workspace-production/pageConceptPipeline/functionContract.js';
import { compilePageCreativeContext, compileProjectCreativeContext } from '../shared/site00-design-workspace-production/pageConceptPipeline/contextCompilers.js';
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

describe('P0.VR.GPT2-MOBILE-FULL-PAGE-CONTINUITY-AND-BOTTOM-NAV-LOCK1', () => {
  it('builds top/middle/bottom structural references in provider order', async () => {
    const bundle = await buildGpt2MobileProviderReferenceBundle({
      captureSetId: 'cap-lock-1',
      functionalCaptureBase64: 'aaa',
      functionalAssetId: 'full-page-1',
      functionalSourcePath: 'capture/full-page.png',
      fallbackViewport: { width: 390, height: 844 },
    });
    expect(bundle.authorityManifest.topStructuralAttached).toBe(true);
    expect(bundle.authorityManifest.middleStructuralAttached).toBe(true);
    expect(bundle.authorityManifest.bottomStructuralAttached).toBe(true);
    expect(bundle.authorityManifest.bottomContinuityLockActive).toBe(true);
    const order = orderedProviderReferenceAssets(bundle).map((a) => a.role);
    expect(order).toEqual([
      GPT2_MOBILE_INPUT_ROLE.TOP_STRUCTURAL,
      GPT2_MOBILE_INPUT_ROLE.MIDDLE_STRUCTURAL,
      GPT2_MOBILE_INPUT_ROLE.BOTTOM_STRUCTURAL,
    ]);
    expect(bundle.coverageValidation.ok).toBe(true);
  });

  it('compiled prompt includes bottom nav lock and passes continuity handoff validation', () => {
    const pageId = overviewPageId();
    const projectContext = compileProjectCreativeContext(PROJECT)!;
    const pageContext = compilePageCreativeContext(PROJECT, pageId)!;
    const functionContract = compilePageFunctionContract(PROJECT, pageId)!;
    const injection: PageCreativeInjection = {
      injectionId: 'inj-lock-1',
      projectId: PROJECT,
      pageId,
      projectContextVersion: '1',
      pageContextVersion: '1',
      functionContractVersion: '1',
      creativeThesis: 'Overview page',
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
      captureSetId: 'cap-lock-1',
      providerReferenceBundle: refs,
      projectContext,
      pageContext,
      functionContract,
      pageArchitectureBrief: arch,
    });
    const pkg = buildPageGpt2MobileConceptRequestPackage({
      runId: 'run-lock-1',
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
    expect(pkg.inspector.captureInfluenceMode).toBe(PAGE_GPT2_MOBILE_CAPTURE_INFLUENCE_MODE);
    expect(pkg.prompt).toMatch(/BOTTOM NAV LOCK/i);
    expect(pkg.prompt).toMatch(/TOP_STRUCTURAL_CAPTURE/i);
    expect(pkg.prompt).toMatch(/BOTTOM_STRUCTURAL_CAPTURE/i);
    expect(evaluateGpt2MobileBottomNavContinuityHandoffValidity(pkg.prompt).ok).toBe(true);
    const compiled = compileGpt2MobileProviderPrompt({
      slot: 'MOBILE_CONCEPT_A',
      cgptBrief,
      pageArchitectureBrief: arch,
      skinContract: skin,
      functionContract,
      pageContext,
      injection,
      bottomContinuityApplied: true,
      topStructuralCaptureAttached: true,
      middleStructuralCaptureAttached: true,
      bottomStructuralCaptureAttached: true,
      bottomContinuityLockActive: true,
      mobileViewport: { width: 390, height: 844 },
      referenceImageRoleSummary: refs.imageRoleSummary,
      screenshotFunctionalPageMap,
    });
    expect(compiled.compiledPromptCharCount).toBeLessThan(24000);
    void appendPageCapture;
    void gpt2MobileProviderImageOrderForTest;
  });
});
