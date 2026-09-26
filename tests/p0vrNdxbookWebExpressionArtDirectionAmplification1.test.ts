/**
 * P0.VR.NDXBOOK-WEB-EXPRESSION-ART-DIRECTION-AMPLIFICATION1
 */

import { describe, expect, it } from 'vitest';

import { registerNdxbookDesignPilot } from '../shared/site00-studio-world-production/visualReconstruction/p0vr2/ndxPilotRegistration.js';
import { compilePageFunctionContract } from '../shared/site00-design-workspace-production/pageConceptPipeline/functionContract.js';
import { compilePageConceptPageArchitectureBrief } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptPageArchitectureBrief.js';
import { compileGpt2MobileProviderPrompt } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGpt2MobileProviderPromptCompiler.js';
import { interpretScreenshotFunctionality } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptScreenshotFunctionalPageMap.js';
import {
  NDX_COLOR_EXPRESSION_CONTRACT,
  validateNdxColorExpressionText,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptNdxColorExpressionContract.js';
import {
  compileWebExpressionTerritorySet,
  validateExpressionSterility,
  validateWebExpressionTerritoryArtDirectionCompleteness,
  validateWebExpressionTerritoryDistance,
  validateWebExpressionTypeScaleDramaRequirement,
  webExpressionTerritoryForSlot,
  webExpressionTerritoryHandoffWithinBudget,
  WEB_EXPRESSION_TERRITORY_SET_VERSION,
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
    injectionId: 'inj-art-direction-1',
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
    colorStrategy: 'Light field + black/lime family',
    materialStrategy: 'Paper and concrete',
    avoidList: ['poster', 'full black page'],
    mandatoryBrandSignals: ['NDXBOOK'],
    audienceIntent: 'Founder',
    createdAt: new Date().toISOString(),
    cgptProvider: 'vitest',
    cgptModel: 'vitest',
  };
}

function compileFixtureSet() {
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
    captureSetId: 'cap-art',
  });
  const map = interpretScreenshotFunctionality({
    captureSetId: 'cap-art',
    providerReferenceBundle: mockGpt2MobileProviderReferenceBundleForTest(),
    projectContext,
    pageContext,
    functionContract,
    pageArchitectureBrief: arch,
  });
  const set = compileWebExpressionTerritorySet({
    brief: cgptBrief,
    injection,
    target: arch.targetRouteContract,
    pageArchitectureBriefId: arch.briefId,
    functionMapId: map.mapId,
    projectId: PROJECT,
    pageId,
  });
  return { set, arch, map, cgptBrief, functionContract, pageContext, injection, skinContract: compileProjectSkinContract(PROJECT) };
}

describe('P0.VR NDXBOOK web expression art direction amplification', () => {
  it('compiles v2 territory set with art direction on every slot', () => {
    const { set } = compileFixtureSet();
    expect(set.version).toBe(WEB_EXPRESSION_TERRITORY_SET_VERSION);
    for (const t of set.territories) {
      expect(t.artDirectionPremise.trim().length).toBeGreaterThan(20);
      expect(t.signatureGraphicDevice.trim().length).toBeGreaterThan(10);
      expect(validateWebExpressionTerritoryArtDirectionCompleteness(t).ok).toBe(true);
      expect(validateExpressionSterility(t).ok).toBe(true);
    }
  });

  it('A/B/C signature devices and typographic concepts differ', () => {
    const { set } = compileFixtureSet();
    const sigs = set.territories.map((t) => t.signatureGraphicDevice.trim().toLowerCase());
    expect(new Set(sigs).size).toBe(3);
    const typos = set.territories.map((t) => t.typographicConcept.trim().toLowerCase());
    expect(new Set(typos).size).toBe(3);
    expect(validateWebExpressionTerritoryDistance(set).ok).toBe(true);
  });

  it('at least two territories use MEDIUM or HIGH type drama', () => {
    const { set } = compileFixtureSet();
    expect(validateWebExpressionTypeScaleDramaRequirement(set).ok).toBe(true);
    const elevated = set.territories.filter((t) => t.typeScaleDrama === 'MEDIUM' || t.typeScaleDrama === 'HIGH');
    expect(elevated.length).toBeGreaterThanOrEqual(2);
  });

  it('image art direction, composition, disruption, bespoke, lower continuation present', () => {
    const { set } = compileFixtureSet();
    for (const t of set.territories) {
      expect(t.imageArtDirection.trim()).not.toBe('');
      expect(t.editorialCompositionRule.trim()).not.toBe('');
      expect(t.controlledDisruption.trim()).not.toBe('');
      expect(t.bespokeMoment.trim()).not.toBe('');
      expect(t.lowerPageCreativeContinuation.trim()).not.toBe('');
    }
  });

  it('NDX color contract allows tonal family and rejects unrelated hues', () => {
    expect(NDX_COLOR_EXPRESSION_CONTRACT.signalRange.length).toBeGreaterThan(1);
    expect(NDX_COLOR_EXPRESSION_CONTRACT.blackRange.length).toBeGreaterThan(1);
    expect(validateNdxColorExpressionText('acid lime on cool paper with graphite').ok).toBe(true);
    expect(validateNdxColorExpressionText('primary coral and magenta brand gradient').ok).toBe(false);
  });

  it('rejects palette-only territory pairs as TERRITORY_VISUAL_IDEA_TOO_WEAK', () => {
    const { set } = compileFixtureSet();
    const broken = {
      ...set,
      territories: [
        { ...set.territories[0]!, materialLanguage: 'light theme only' },
        {
          ...set.territories[0]!,
          territoryId: 'dup-b',
          territorySlot: 'B' as const,
          name: 'B — LIGHT CLONE',
          signatureGraphicDevice: 'Palette-only clone — alternate label, same structural art direction.',
          distinctiveMove: 'Palette-only clone move — structurally identical art direction.',
          materialLanguage: 'dark theme only',
          colorExpressionSystem: 'dark theme contrast palette shift only',
        },
        set.territories[2]!,
      ],
    } as typeof set;
    const distance = validateWebExpressionTerritoryDistance(broken);
    expect(distance.ok).toBe(false);
    expect(distance.errorCode).toBe('TERRITORY_VISUAL_IDEA_TOO_WEAK');
  });

  it('sterility guard flags incomplete art direction', () => {
    const { set } = compileFixtureSet();
    const broken = { ...set.territories[0]!, artDirectionPremise: '', signatureGraphicDevice: '' };
    expect(validateExpressionSterility(broken).errorCode).toBe('EXPRESSION_TOO_SYSTEMIC');
  });

  it('GPT2 handoff uses compact ART DIRECTION block within budget', () => {
    const { set, arch, map, cgptBrief, functionContract, pageContext, injection, skinContract } = compileFixtureSet();
    for (const slot of ['MOBILE_CONCEPT_A', 'MOBILE_CONCEPT_B', 'MOBILE_CONCEPT_C'] as const) {
      const territory = webExpressionTerritoryForSlot(set, slot);
      expect(webExpressionTerritoryHandoffWithinBudget(territory)).toBe(true);
      const { prompt } = compileGpt2MobileProviderPrompt({
        slot,
        cgptBrief,
        pageArchitectureBrief: arch,
        skinContract,
        functionContract,
        pageContext,
        injection,
        bottomContinuityApplied: true,
        mobileViewport: { width: 768, height: 1376 },
        screenshotFunctionalPageMap: map,
        webExpressionTerritory: territory,
        bottomStructuralCaptureAttached: true,
        middleStructuralCaptureAttached: true,
        topStructuralCaptureAttached: true,
      });
      expect(prompt).toContain('ART DIRECTION:');
      expect(prompt).toContain('SIGNATURE GRAPHIC DEVICE:');
      expect(prompt).toContain('BESPOKE MOMENT:');
      expect(prompt.toLowerCase()).toContain('web expression territory');
      expect(prompt).toContain('YOU ARE NOT DESIGNING THE SITE 00 DESIGN WORKSPACE');
    }
  });

  it('function map unchanged — architecture brief still targets NDXBOOK overview', () => {
    const { arch } = compileFixtureSet();
    expect(arch.targetRouteContract.targetRouteLabel).toContain('NDXBOOK');
    expect(arch.targetRouteContract.targetRouteLabel).not.toContain('> DESIGN >');
  });
});
