/**
 * P0.VR.GPT2-MOBILE-DUAL-REFERENCE-AUTHORITY-WIRING-FIX1
 */

import { describe, expect, it } from 'vitest';

import {
  GPT2_MOBILE_INPUT_ROLE,
  buildGpt2MobileProviderReferenceBundle,
  mockGpt2MobileProviderReferenceBundleForTest,
  validateFunctionalPageReferenceDimensions,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGpt2MobileReferenceAuthority.js';
import {
  buildPageGpt2MobileConceptRequestPackage,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGpt2MobileRequestPackage.js';
import { compileGpt2MobileProviderPrompt } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGpt2MobileProviderPromptCompiler.js';
import { gpt2MobileProviderImageOrderForTest } from '../api/_lib/site00PageConcept/renderPageGpt2MobileConceptJob.js';
import { appendPageCapture } from '../shared/site00-design-workspace-production/designPageCapture.js';
import { listSiteDesignPagesForProject } from '../shared/site00-design-workspace-production/designProjectBinding/index.js';
import { compilePageFunctionContract } from '../shared/site00-design-workspace-production/pageConceptPipeline/functionContract.js';
import { compileProjectCreativeContext, compilePageCreativeContext } from '../shared/site00-design-workspace-production/pageConceptPipeline/contextCompilers.js';
import { compilePageConceptCgptCreativeBrief } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptCgptCreativeBrief.js';
import { compilePageConceptPageArchitectureBrief } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptPageArchitectureBrief.js';
import { compileProjectSkinContract } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptProjectSkinContract.js';
import { buildScreenshotFunctionalPageMapForTest } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptScreenshotFunctionalPageMap.js';
import { PAGE_CONCEPT_MOBILE_CONCEPT_SLOTS } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptViewportAuthorityFamily.js';
import type { PageCreativeInjection } from '../shared/site00-design-workspace-production/pageConceptPipeline/types.js';

const PROJECT = 'ndxbook';

function overviewPageId(): string {
  const overview = listSiteDesignPagesForProject(PROJECT).find((p) => p.screenId === 'overview');
  if (!overview) throw new Error('overview missing');
  return overview.pageId;
}

function sampleInjection(pageId: string): PageCreativeInjection {
  return {
    injectionId: 'inj-dual-ref',
    projectId: PROJECT,
    pageId,
    projectContextVersion: '1',
    pageContextVersion: '1',
    functionContractVersion: '1',
    creativeThesis: 'NDXBOOK overview page architecture.',
    creativePremise: 'Overview is a real mobile product page.',
    pageStory: 'Orient founder within SITE 00 shell.',
    pagePurposeInterpretation: 'Overview',
    visualOpportunity: 'Index + evidence',
    visualTerritory: 'NDX archive',
    hierarchyDirection: 'Title-first',
    hierarchyStrategy: 'Monument then entries',
    spatialDirection: 'Vertical scroll',
    compositionStrategy: 'Regions',
    informationPriority: 'Entries',
    imageDataBalance: 'Evidence supports index',
    responsiveDirection: 'Mobile first',
    mobileDirection: 'Single column scroll',
    desktopDirection: 'Wide later',
    creativeLatitude: 'High within architecture',
    immutableRequirements: ['navigation'],
    referenceStrategy: 'Archive',
    assetStrategy: 'Evidence plates',
    imageryStrategy: 'Document plates',
    interactionCharacter: 'Tappable rows',
    distinctiveMove: 'Register index',
    typographyStrategy: 'Display + mono',
    colorStrategy: 'Black field',
    materialStrategy: 'Matte',
    avoidList: ['poster'],
    mandatoryBrandSignals: ['NDXBOOK'],
    audienceIntent: 'Founder',
    createdAt: new Date().toISOString(),
    cgptProvider: 'vitest',
    cgptModel: 'vitest',
  };
}

describe('P0.VR.GPT2-MOBILE-DUAL-REFERENCE-AUTHORITY-WIRING-FIX1', () => {
  it('rejects tiny functional reference dimensions', () => {
    const result = validateFunctionalPageReferenceDimensions({ width: 390, height: 186 });
    expect(result.ok).toBe(false);
    expect(result.errorCode).toBe('GPT2_FUNCTIONAL_REFERENCE_TOO_SMALL');
  });

  it('builds functional + continuity references from full capture in vitest', async () => {
    const bundle = await buildGpt2MobileProviderReferenceBundle({
      captureSetId: 'pcs-test',
      functionalCaptureBase64: 'aaa',
      functionalAssetId: 'cap-mobile',
      functionalSourcePath: 'capture/mobile.png',
      fallbackViewport: { width: 390, height: 844 },
    });
    expect(bundle.topStructuralCapture.role).toBe(GPT2_MOBILE_INPUT_ROLE.TOP_STRUCTURAL);
    expect(bundle.topStructuralCapture.width).toBe(390);
    expect(bundle.bottomStructuralCapture.role).toBe(GPT2_MOBILE_INPUT_ROLE.BOTTOM_STRUCTURAL);
    expect(bundle.middleStructuralCapture.role).toBe(GPT2_MOBILE_INPUT_ROLE.MIDDLE_STRUCTURAL);
    expect(gpt2MobileProviderImageOrderForTest({
      prompt: '',
      bottomContinuityCaptureBase64: '',
      providerReferences: bundle,
      lineage: {} as never,
      inspector: {} as never,
    })).toEqual([
      GPT2_MOBILE_INPUT_ROLE.TOP_STRUCTURAL,
      GPT2_MOBILE_INPUT_ROLE.MIDDLE_STRUCTURAL,
      GPT2_MOBILE_INPUT_ROLE.BOTTOM_STRUCTURAL,
    ]);
  });

  it('compiled prompt labels image roles and separates structure from style', async () => {
    const pageId = overviewPageId();
    const projectContext = compileProjectCreativeContext(PROJECT)!;
    const pageContext = compilePageCreativeContext(PROJECT, pageId)!;
    const functionContract = compilePageFunctionContract(PROJECT, pageId)!;
    const injection = sampleInjection(pageId);
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
      captureSetId: 'cap-dual',
      providerReferenceBundle: refs,
      projectContext,
      pageContext,
      functionContract,
      pageArchitectureBrief: arch,
    });
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
    expect(compiled.prompt).toMatch(/Structural Capture A \(TOP_STRUCTURAL_CAPTURE\)/i);
    expect(compiled.prompt).toMatch(/Structural Capture B \(MIDDLE_STRUCTURAL_CAPTURE\)/i);
    expect(compiled.prompt).toMatch(/Structural Capture C \(BOTTOM_STRUCTURAL_CAPTURE\)/i);
    expect(compiled.prompt).toMatch(/DESIGN AUTHORITY/i);
    expect(compiled.prompt).toMatch(/FUNCTIONAL REFERENCE ONLY/i);
    expect(compiled.prompt).toMatch(/DO NOT USE CAPTURES FOR/i);
    expect(compiled.prompt).toMatch(/FULL portrait mobile viewport/i);
  });

  it('A/B/C share functional authority metadata and distinct territory in package', () => {
    const pageId = overviewPageId();
    appendPageCapture({
      projectId: PROJECT,
      pageId,
      screenId: 'overview',
      route: '/projects/design/ndxbook/overview',
      captureId: 'm-cap-dual',
      viewport: 'MOBILE',
      artifactPath: 'data:image/png;base64,aaaa',
      timestamp: new Date().toISOString(),
      buildVersion: 'vitest',
      createdBy: 'vitest',
      source: 'LOCAL_FALLBACK',
    });
    const projectContext = compileProjectCreativeContext(PROJECT)!;
    const pageContext = compilePageCreativeContext(PROJECT, pageId)!;
    const functionContract = compilePageFunctionContract(PROJECT, pageId)!;
    const injection = sampleInjection(pageId);
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
      captureSetId: 'cap-dual',
      providerReferenceBundle: refs,
      projectContext,
      pageContext,
      functionContract,
      pageArchitectureBrief: arch,
    });
    const functionalIds = PAGE_CONCEPT_MOBILE_CONCEPT_SLOTS.map((slot) => {
      const pkg = buildPageGpt2MobileConceptRequestPackage({
        runId: 'pcgr-dual',
        slot,
        conceptId: `c-${slot}`,
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
      expect(pkg.providerReferences.topStructuralCapture.assetId).toBe('test-top-structural');
      expect(pkg.inspector.currentCaptureRole).toBe('FUNCTIONAL_REFERENCE_ONLY');
      return pkg.inspector.compiledProviderPrompt.sharedBaseHash;
    });
    expect(new Set(functionalIds).size).toBe(1);
    const territories = PAGE_CONCEPT_MOBILE_CONCEPT_SLOTS.map((slot) => pkgTerritory(slot, injection, cgptBrief));
    expect(new Set(territories).size).toBe(3);
  });
});

function pkgTerritory(
  slot: (typeof PAGE_CONCEPT_MOBILE_CONCEPT_SLOTS)[number],
  injection: PageCreativeInjection,
  brief: ReturnType<typeof compilePageConceptCgptCreativeBrief>,
): string {
  const pageId = overviewPageId();
  const projectContext = compileProjectCreativeContext(PROJECT)!;
  const pageContext = compilePageCreativeContext(PROJECT, pageId)!;
  const functionContract = compilePageFunctionContract(PROJECT, pageId)!;
  const arch = compilePageConceptPageArchitectureBrief({
    projectContext,
    pageContext,
    functionContract,
    injection,
    cgptCreativeBrief: brief,
  });
  const skin = compileProjectSkinContract(PROJECT);
  const refs = mockGpt2MobileProviderReferenceBundleForTest();
  const screenshotFunctionalPageMap = buildScreenshotFunctionalPageMapForTest({
    captureSetId: 'cap-dual-t',
    providerReferenceBundle: refs,
    projectContext,
    pageContext,
    functionContract,
    pageArchitectureBrief: arch,
  });
  const pkg = buildPageGpt2MobileConceptRequestPackage({
    runId: 'pcgr-dual-t',
    slot,
    conceptId: `c-${slot}`,
    projectContext,
    pageContext,
    functionContract,
    injection,
    cgptBrief: brief,
    pageArchitectureBrief: arch,
    skinContract: skin,
    providerReferences: refs,
    screenshotFunctionalPageMap,
    pageContextSummary: '{}',
    mobileViewport: { width: 390, height: 844 },
  });
  return pkg.inspector.territoryDirective;
}
