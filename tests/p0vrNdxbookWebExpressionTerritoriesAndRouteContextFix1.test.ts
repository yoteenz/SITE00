/**
 * P0.VR.NDXBOOK-WEB-EXPRESSION-TERRITORIES-AND-ROUTE-CONTEXT-FIX1
 */

import { describe, expect, it } from 'vitest';

import { registerNdxbookDesignPilot } from '../shared/site00-studio-world-production/visualReconstruction/p0vr2/ndxPilotRegistration.js';
import { compilePageFunctionContract } from '../shared/site00-design-workspace-production/pageConceptPipeline/functionContract.js';
import {
  compilePageConceptPageArchitectureBrief,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptPageArchitectureBrief.js';
import { compileGpt2MobileProviderPrompt } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGpt2MobileProviderPromptCompiler.js';
import {
  interpretScreenshotFunctionality,
  validateScreenshotFunctionMapForGpt2Dispatch,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptScreenshotFunctionalPageMap.js';
import {
  buildGpt2TargetRouteContextBlock,
  resolvePageConceptTargetRouteContract,
  targetRouteExcludesDesignWorkspace,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptTargetPageContext.js';
import {
  compileWebExpressionTerritorySet,
  validateSterileWebExpressionTerritory,
  validateWebExpressionTerritoryDistance,
  webExpressionTerritoryForSlot,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptWebExpressionTerritories.js';
import { listSiteDesignPagesForProject } from '../shared/site00-design-workspace-production/designProjectBinding/index.js';
import { compileProjectCreativeContext, compilePageCreativeContext } from '../shared/site00-design-workspace-production/pageConceptPipeline/contextCompilers.js';
import { compilePageConceptCgptCreativeBrief } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptCgptCreativeBrief.js';
import { compileProjectSkinContract } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptProjectSkinContract.js';
import { mockGpt2MobileProviderReferenceBundleForTest } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGpt2MobileReferenceAuthority.js';
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
    injectionId: 'inj-web-territory-1',
    projectId: PROJECT,
    pageId,
    projectContextVersion: '1',
    pageContextVersion: '1',
    functionContractVersion: '1',
    creativeThesis: 'NDXBOOK overview as real mobile product page.',
    creativePremise: 'Overview orients founder within NDXBOOK.',
    pageStory: 'Project home with entries and state.',
    pagePurposeInterpretation: 'Overview',
    visualOpportunity: 'Light editorial product page',
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
    colorStrategy: 'Light field + black/lime',
    materialStrategy: 'Paper and concrete',
    avoidList: ['poster', 'full black page'],
    mandatoryBrandSignals: ['NDXBOOK'],
    audienceIntent: 'Founder',
    createdAt: new Date().toISOString(),
    cgptProvider: 'vitest',
    cgptModel: 'vitest',
  };
}

function fixtureBundle() {
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
  const providerReferences = mockGpt2MobileProviderReferenceBundleForTest();
  const skinContract = compileProjectSkinContract(PROJECT);
  return { pageId, projectContext, pageContext, functionContract, injection, cgptBrief, providerReferences, skinContract };
}

describe('P0.VR NDXBOOK web expression territories + route context fix', () => {
  it('target product route excludes Design workspace authoring path', () => {
    const { pageContext, projectContext, injection, cgptBrief, functionContract } = fixtureBundle();
    const arch = compilePageConceptPageArchitectureBrief({
      projectContext,
      pageContext,
      functionContract,
      injection,
      cgptCreativeBrief: cgptBrief,
      captureSetId: 'cap-test',
    });
    const target = arch.targetRouteContract;
    expect(target.targetRouteLabel).toContain('PROJECTS');
    expect(target.targetRouteLabel).toContain('NDXBOOK');
    expect(target.targetRouteLabel).not.toContain('> DESIGN >');
    expect(targetRouteExcludesDesignWorkspace(target)).toBe(true);
    expect(target.authoringRoute).toContain('/design/twin-opus-direct');
  });

  it('authoring context block forbids design workspace UI in GPT2 output', () => {
    const contract = resolvePageConceptTargetRouteContract({
      projectId: 'ndxbook',
      pageId: 'ndxbook:overview',
      pageContext: fixtureBundle().pageContext,
      functionContract: fixtureBundle().functionContract,
    });
    const block = buildGpt2TargetRouteContextBlock(contract);
    expect(block).toContain('YOU ARE NOT DESIGNING THE SITE 00 DESIGN WORKSPACE');
    expect(block).toContain('AUTHORING CONTEXT IN OUTPUT: NO');
  });

  it('full-page scroll map includes bottom navigation stage', () => {
    const fx = fixtureBundle();
    const fc = fx.functionContract;
    const arch = compilePageConceptPageArchitectureBrief({
      projectContext: fx.projectContext,
      pageContext: fx.pageContext,
      functionContract: fc,
      injection: fx.injection,
      cgptCreativeBrief: fx.cgptBrief,
    });
    const map = interpretScreenshotFunctionality({
      captureSetId: 'cap-1',
      providerReferenceBundle: fx.providerReferences,
      projectContext: fx.projectContext,
      pageContext: fx.pageContext,
      functionContract: fc,
      pageArchitectureBrief: arch,
    });
    expect(map.fullPageScrollMap.some((s) => s.stage === 'BOTTOM_NAVIGATION')).toBe(true);
    expect(validateScreenshotFunctionMapForGpt2Dispatch(map).ok).toBe(true);
  });

  it('generates three distinct web expression territories sharing function map', () => {
    const fx = fixtureBundle();
    const fc = fx.functionContract;
    const arch = compilePageConceptPageArchitectureBrief({
      projectContext: fx.projectContext,
      pageContext: fx.pageContext,
      functionContract: fc,
      injection: fx.injection,
      cgptCreativeBrief: fx.cgptBrief,
    });
    const map = interpretScreenshotFunctionality({
      captureSetId: 'cap-1',
      providerReferenceBundle: fx.providerReferences,
      projectContext: fx.projectContext,
      pageContext: fx.pageContext,
      functionContract: fc,
      pageArchitectureBrief: arch,
    });
    const set = compileWebExpressionTerritorySet({
      brief: fx.cgptBrief,
      injection: fx.injection,
      target: arch.targetRouteContract,
      pageArchitectureBriefId: arch.briefId,
      functionMapId: map.mapId,
      projectId: 'ndxbook',
      pageId: fx.pageContext.pageId,
    });
    expect(set.territories).toHaveLength(3);
    expect(set.sourceFunctionMapId).toBe(map.mapId);
    const distance = validateWebExpressionTerritoryDistance(set);
    expect(distance.ok).toBe(true);
    for (const t of set.territories) {
      expect(validateSterileWebExpressionTerritory(t).ok).toBe(true);
    }
    const premises = new Set(set.territories.map((t) => t.creativePremise));
    const moves = new Set(set.territories.map((t) => t.distinctiveMove));
    expect(premises.size).toBe(3);
    expect(moves.size).toBe(3);
  });

  it('GPT2 A/B/C prompts each receive only their assigned territory', () => {
    const fx = fixtureBundle();
    const fc = fx.functionContract;
    const arch = compilePageConceptPageArchitectureBrief({
      projectContext: fx.projectContext,
      pageContext: fx.pageContext,
      functionContract: fc,
      injection: fx.injection,
      cgptCreativeBrief: fx.cgptBrief,
    });
    const map = interpretScreenshotFunctionality({
      captureSetId: 'cap-1',
      providerReferenceBundle: fx.providerReferences,
      projectContext: fx.projectContext,
      pageContext: fx.pageContext,
      functionContract: fc,
      pageArchitectureBrief: arch,
    });
    const set = compileWebExpressionTerritorySet({
      brief: fx.cgptBrief,
      injection: fx.injection,
      target: arch.targetRouteContract,
      pageArchitectureBriefId: arch.briefId,
      functionMapId: map.mapId,
      projectId: 'ndxbook',
      pageId: fx.pageContext.pageId,
    });
    const prompts = (['MOBILE_CONCEPT_A', 'MOBILE_CONCEPT_B', 'MOBILE_CONCEPT_C'] as const).map((slot) => {
      const territory = webExpressionTerritoryForSlot(set, slot);
      return compileGpt2MobileProviderPrompt({
        slot,
        cgptBrief: fx.cgptBrief,
        pageArchitectureBrief: arch,
        skinContract: fx.skinContract,
        functionContract: fc,
        pageContext: fx.pageContext,
        injection: fx.injection,
        bottomContinuityApplied: true,
        mobileViewport: { width: 768, height: 1376 },
        screenshotFunctionalPageMap: map,
        webExpressionTerritory: territory,
        bottomStructuralCaptureAttached: true,
        middleStructuralCaptureAttached: true,
        topStructuralCaptureAttached: true,
      }).prompt;
    });
    expect(prompts[0]).toContain(set.territories[0]!.name);
    expect(prompts[0]).not.toContain(set.territories[1]!.websiteMetaphor);
    expect(prompts[1]).toContain(set.territories[1]!.name);
    expect(prompts[2]).toContain(set.territories[2]!.name);
    for (const p of prompts) {
      expect(p.toLowerCase()).toContain('web expression territory');
      expect(p).toContain('YOU ARE NOT DESIGNING THE SITE 00 DESIGN WORKSPACE');
      expect(p.toLowerCase()).not.toContain('projects > design > ndxbook');
    }
  });

  it('rejects palette-only territory pairs', () => {
    const fx = fixtureBundle();
    const fc = fx.functionContract;
    const arch = compilePageConceptPageArchitectureBrief({
      projectContext: fx.projectContext,
      pageContext: fx.pageContext,
      functionContract: fc,
      injection: fx.injection,
      cgptCreativeBrief: fx.cgptBrief,
    });
    const map = interpretScreenshotFunctionality({
      captureSetId: 'cap-1',
      providerReferenceBundle: fx.providerReferences,
      projectContext: fx.projectContext,
      pageContext: fx.pageContext,
      functionContract: fc,
      pageArchitectureBrief: arch,
    });
    const set = compileWebExpressionTerritorySet({
      brief: fx.cgptBrief,
      injection: fx.injection,
      target: arch.targetRouteContract,
      pageArchitectureBriefId: arch.briefId,
      functionMapId: map.mapId,
      projectId: 'ndxbook',
      pageId: fx.pageContext.pageId,
    });
    const broken = {
      ...set,
      territories: [
        { ...set.territories[0]!, materialLanguage: 'light theme only' },
        {
          ...set.territories[0]!,
          territoryId: 'dup-b',
          territorySlot: 'B' as const,
          name: 'B — LIGHT CLONE',
          materialLanguage: 'dark theme only',
        },
        set.territories[2]!,
      ],
    };
    const distance = validateWebExpressionTerritoryDistance(broken);
    expect(distance.ok).toBe(false);
  });
});
