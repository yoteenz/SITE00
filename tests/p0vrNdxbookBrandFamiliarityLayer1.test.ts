/**
 * P0.VR.NDXBOOK-BRAND-FAMILIARITY-LAYER1
 */

import { describe, expect, it } from 'vitest';

import { registerNdxbookDesignPilot } from '../shared/site00-studio-world-production/visualReconstruction/p0vr2/ndxPilotRegistration.js';
import { listSiteDesignPagesForProject } from '../shared/site00-design-workspace-production/designProjectBinding/index.js';
import { compileProjectCreativeContext, compilePageCreativeContext } from '../shared/site00-design-workspace-production/pageConceptPipeline/contextCompilers.js';
import { compilePageFunctionContract } from '../shared/site00-design-workspace-production/pageConceptPipeline/functionContract.js';
import { compilePageConceptCgptCreativeBrief } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptCgptCreativeBrief.js';
import { compilePageConceptPageArchitectureBrief } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptPageArchitectureBrief.js';
import { compileProjectSkinContract } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptProjectSkinContract.js';
import {
  compileGpt2MobileProviderPrompt,
  MAX_PROVIDER_PROMPT_CHARS,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGpt2MobileProviderPromptCompiler.js';
import {
  compileScreenshotFunctionMapZoneSummary,
  interpretScreenshotFunctionality,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptScreenshotFunctionalPageMap.js';
import { mockGpt2MobileProviderReferenceBundleForTest } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGpt2MobileReferenceAuthority.js';
import {
  compileNdxBrandFamiliarityBrief,
  evaluateNdxBrandAuthenticity,
  validateGenericEditorialDriftGuard,
  validateTerritoryNdxFamiliarityDistinction,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptNdxBrandFamiliarityBrief.js';
import {
  compileWebExpressionTerritorySet,
  validateWebExpressionTerritoryDistance,
  webExpressionTerritoryForSlot,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptWebExpressionTerritories.js';
import { targetRouteExcludesDesignWorkspace } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptTargetPageContext.js';
import type { PageCreativeInjection } from '../shared/site00-design-workspace-production/pageConceptPipeline/types.js';

const PROJECT = 'ndxbook';

function overviewPageId(): string {
  registerNdxbookDesignPilot();
  const overview = listSiteDesignPagesForProject(PROJECT).find((p) => p.screenId === 'overview');
  if (!overview) throw new Error('overview missing');
  return overview.pageId;
}

function sampleInjection(pageId: string): PageCreativeInjection {
  return {
    injectionId: 'inj-brand-familiarity-1',
    projectId: PROJECT,
    pageId,
    projectContextVersion: '1',
    pageContextVersion: '1',
    functionContractVersion: '1',
    creativeThesis: 'NDXBOOK overview mobile product page.',
    creativePremise: 'Overview orients founder within NDXBOOK.',
    pageStory: 'Project home with entries and evidence.',
    pagePurposeInterpretation: 'Overview',
    visualOpportunity: 'NDX-authored web page',
    visualTerritory: 'NDX archive light field',
    hierarchyDirection: 'Title-first',
    hierarchyStrategy: 'Monument then entries',
    spatialDirection: 'Vertical scroll',
    compositionStrategy: 'Regions',
    informationPriority: 'Entries',
    imageDataBalance: 'Evidence supports story',
    responsiveDirection: 'Mobile',
    mobileDirection: 'Single column scroll',
    desktopDirection: 'Wide later',
    creativeLatitude: 'High within architecture',
    immutableRequirements: ['navigation', 'bottom continuity'],
    referenceStrategy: 'Capture-first',
    assetStrategy: 'Evidence plates',
    imageryStrategy: 'Archival plates',
    interactionCharacter: 'Tappable rows',
    distinctiveMove: 'Index register',
    typographyStrategy: 'Uppercase display + mono',
    colorStrategy: 'Light field + black/lime family',
    materialStrategy: 'Paper and concrete',
    avoidList: ['poster', 'generic editorial template'],
    mandatoryBrandSignals: ['NDXBOOK'],
    audienceIntent: 'Founder',
    createdAt: new Date().toISOString(),
    cgptProvider: 'vitest',
    cgptModel: 'vitest',
  };
}

function compilePipelineFixture() {
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
    captureSetId: 'test-capture-brand-fam',
  });
  const refs = mockGpt2MobileProviderReferenceBundleForTest();
  const map = interpretScreenshotFunctionality({
    captureSetId: 'test-capture-brand-fam',
    providerReferenceBundle: refs,
    projectContext,
    pageContext,
    functionContract,
    pageArchitectureBrief: arch,
  });
  const brief = compileNdxBrandFamiliarityBrief({
    projectId: PROJECT,
    pageId,
    target: arch.targetRouteContract!,
    pageArchitectureBrief: arch,
    screenshotFunctionalPageMap: map,
  });
  const territorySet = compileWebExpressionTerritorySet({
    brief: cgptBrief,
    injection,
    target: arch.targetRouteContract!,
    pageArchitectureBriefId: arch.briefId,
    functionMapId: map.mapId,
    projectId: PROJECT,
    pageId,
  });
  return {
    pageId,
    arch,
    map,
    brief,
    cgptBrief,
    functionContract,
    pageContext,
    injection,
    skinContract: compileProjectSkinContract(PROJECT),
    territorySet,
  };
}

describe('P0.VR.NDXBOOK-BRAND-FAMILIARITY-LAYER1', () => {
  it('generates structured NDX brand familiarity brief with stable digest', () => {
    const { brief, map, arch } = compilePipelineFixture();
    expect(brief).not.toBeNull();
    expect(brief!.briefId.startsWith('ndxfam-')).toBe(true);
    expect(brief!.contentDigest).toMatch(/^[0-9a-f]+$/);
    expect(brief!.sourceFunctionMapId).toBe(map.mapId);
    expect(brief!.sourcePageArchitectureBriefId).toBe(arch.briefId);
    expect(brief!.imageBehavior.rules.length).toBeGreaterThanOrEqual(3);
    expect(brief!.graphicDeviceLibrary.deviceCategories.length).toBeGreaterThanOrEqual(8);
  });

  it('screenshot function map exposes zone summary for provider', () => {
    const { map } = compilePipelineFixture();
    const zones = compileScreenshotFunctionMapZoneSummary(map);
    expect(zones).toContain('SCREENSHOT_FUNCTION_MAP ZONES');
    expect(zones).toMatch(/BOTTOM_NAVIGATION|ENTRY_INDEX|PAGE_IDENTITY/);
  });

  it('provider prompt includes familiarity + function map and stays within budget', () => {
    const fixture = compilePipelineFixture();
    for (const slot of ['MOBILE_CONCEPT_A', 'MOBILE_CONCEPT_B', 'MOBILE_CONCEPT_C'] as const) {
      const territory = webExpressionTerritoryForSlot(fixture.territorySet, slot);
      const { prompt, compiledPromptCharCount } = compileGpt2MobileProviderPrompt({
        slot,
        cgptBrief: fixture.cgptBrief,
        pageArchitectureBrief: fixture.arch,
        skinContract: fixture.skinContract,
        functionContract: fixture.functionContract,
        pageContext: fixture.pageContext,
        injection: fixture.injection,
        bottomContinuityApplied: true,
        mobileViewport: { width: 768, height: 1376 },
        screenshotFunctionalPageMap: fixture.map,
        webExpressionTerritory: territory,
        topStructuralCaptureAttached: true,
        middleStructuralCaptureAttached: true,
        bottomStructuralCaptureAttached: true,
      });
      expect(prompt).toContain('NDX BRAND FAMILIARITY');
      expect(prompt).toContain('PAGE FUNCTION (SCREENSHOT FUNCTIONAL PAGE MAP');
      expect(prompt).toContain('SCREENSHOT_FUNCTION_MAP ZONES');
      expect(prompt).toContain('WEB EXPRESSION TERRITORY');
      expect(compiledPromptCharCount).toBeLessThanOrEqual(MAX_PROVIDER_PROMPT_CHARS);
      expect(validateGenericEditorialDriftGuard({ compiledPrompt: prompt, territory }).ok).toBe(true);
      expect(
        evaluateNdxBrandAuthenticity({ compiledPrompt: prompt, brief: fixture.brief }).ok,
      ).toBe(true);
    }
  });

  it('route remains PROJECTS NDXBOOK overview — not design workspace', () => {
    const { arch } = compilePipelineFixture();
    expect(arch.targetRouteContract.targetRouteLabel).toContain('NDXBOOK');
    expect(targetRouteExcludesDesignWorkspace(arch.targetRouteContract)).toBe(true);
    expect(arch.targetRouteContract.targetRouteLabel).not.toContain('> DESIGN >');
  });

  it('territory distinction and NDX familiarity validators pass for A/B/C', () => {
    const { territorySet } = compilePipelineFixture();
    expect(validateWebExpressionTerritoryDistance(territorySet).ok).toBe(true);
    expect(validateTerritoryNdxFamiliarityDistinction(territorySet).ok).toBe(true);
  });

  it('rejects generic editorial drift in territory art direction', () => {
    const { territorySet } = compilePipelineFixture();
    const territory = {
      ...webExpressionTerritoryForSlot(territorySet, 'MOBILE_CONCEPT_A'),
      compositionSystem: 'Uniform card stack dashboard SaaS template layout.',
      imageArtDirection: 'Stock photo hero panels.',
      graphicLanguage: 'Generic module grid.',
      typographicConcept: 'Default CMS headings.',
      signatureGraphicDevice: '',
      secondaryGraphicDevices: [],
    };
    const drift = validateGenericEditorialDriftGuard({
      compiledPrompt: 'valid prompt with NDX BRAND FAMILIARITY',
      territory,
    });
    expect(drift.ok).toBe(false);
    expect(drift.errorCode).toBe('GENERIC_EDITORIAL_DRIFT');
  });
});
