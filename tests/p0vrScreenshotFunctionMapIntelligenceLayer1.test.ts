/**
 * P0.VR.SCREENSHOT-FUNCTION-MAP-INTELLIGENCE-LAYER1
 */

import { describe, expect, it } from 'vitest';

import { listSiteDesignPagesForProject } from '../shared/site00-design-workspace-production/designProjectBinding/index.js';
import { compilePageFunctionContract } from '../shared/site00-design-workspace-production/pageConceptPipeline/functionContract.js';
import { compileProjectCreativeContext, compilePageCreativeContext } from '../shared/site00-design-workspace-production/pageConceptPipeline/contextCompilers.js';
import { compilePageConceptCgptCreativeBrief } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptCgptCreativeBrief.js';
import { compilePageConceptPageArchitectureBrief } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptPageArchitectureBrief.js';
import {
  buildGpt2MobileScreenshotFunctionMapFixture,
} from './helpers/pageConceptGpt2MobileFunctionMapFixtures.js';
import {
  buildScreenshotFunctionMapReceipt,
  compileGpt2MobileScreenshotFunctionBlock,
  evaluateFunctionalFidelityScorecard,
  interpretScreenshotFunctionality,
  isScreenshotFunctionMapStale,
  validateBottomNavNotInvented,
  validateScreenshotFunctionMapForGpt2Dispatch,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptScreenshotFunctionalPageMap.js';
import { buildPageGpt2MobileConceptRequestPackage } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGpt2MobileRequestPackage.js';
import { GPT2_MOBILE_INPUT_ROLE } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGpt2MobileReferenceAuthority.js';
import { compileProjectSkinContract } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptProjectSkinContract.js';
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
    injectionId: 'inj-sfm-1',
    projectId: PROJECT,
    pageId,
    projectContextVersion: '1',
    pageContextVersion: '1',
    functionContractVersion: '1',
    creativeThesis: 'NDXBOOK overview functional page',
    creativePremise: 'Overview orients within SITE 00',
    pageStory: 'Overview',
    pagePurposeInterpretation: 'Overview',
    visualOpportunity: 'Editorial',
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
}

describe('P0.VR.SCREENSHOT-FUNCTION-MAP-INTELLIGENCE-LAYER1', () => {
  it('generates function map before GPT2 with top/middle/bottom capture contribution', async () => {
    const pageId = overviewPageId();
    const injection = sampleInjection(pageId);
    const fx = buildGpt2MobileScreenshotFunctionMapFixture({ projectId: PROJECT, pageId, injection });
    const map = interpretScreenshotFunctionality({
      captureSetId: 'cap-sfm',
      providerReferenceBundle: fx.providerReferences,
      projectContext: fx.projectContext,
      pageContext: fx.pageContext,
      functionContract: fx.functionContract,
      pageArchitectureBrief: fx.pageArchitectureBrief,
    });
    expect(map.regions.length).toBeGreaterThanOrEqual(3);
    const captures = new Set(map.regions.map((r) => r.sourceCapture));
    expect(captures.has(GPT2_MOBILE_INPUT_ROLE.TOP_STRUCTURAL)).toBe(true);
    expect(captures.has(GPT2_MOBILE_INPUT_ROLE.MIDDLE_STRUCTURAL)).toBe(true);
    expect(captures.has(GPT2_MOBILE_INPUT_ROLE.BOTTOM_STRUCTURAL)).toBe(true);
    expect(map.implementationMetadataEnriched).toBe(true);
    expect(map.bottomNavigationMap.itemCount).toBeGreaterThan(0);
  });

  it('blocks GPT2 when architecture brief missing from function map validation', () => {
    const pageId = overviewPageId();
    const fx = buildGpt2MobileScreenshotFunctionMapFixture({ projectId: PROJECT, pageId, injection: sampleInjection(pageId) });
    const map = { ...fx.screenshotFunctionalPageMap, pageArchitectureBriefId: null };
    const dispatch = validateScreenshotFunctionMapForGpt2Dispatch(map);
    expect(dispatch.ok).toBe(false);
    expect(dispatch.errorCode).toBe('SCREENSHOT_FUNCTION_MAP_INCOMPLETE');
  });

  it('compiled provider prompt includes concise function block; screenshots remain non-design authority', () => {
    const pageId = overviewPageId();
    const injection = sampleInjection(pageId);
    const fx = buildGpt2MobileScreenshotFunctionMapFixture({ projectId: PROJECT, pageId, injection });
    const skin = compileProjectSkinContract(PROJECT);
    const pkg = buildPageGpt2MobileConceptRequestPackage({
      runId: 'run-sfm',
      slot: 'MOBILE_CONCEPT_A',
      conceptId: 'c-a',
      projectContext: fx.projectContext,
      pageContext: fx.pageContext,
      functionContract: fx.functionContract,
      injection,
      cgptBrief: fx.cgptBrief,
      pageArchitectureBrief: fx.pageArchitectureBrief,
      skinContract: skin,
      providerReferences: fx.providerReferences,
      screenshotFunctionalPageMap: fx.screenshotFunctionalPageMap,
      pageContextSummary: '{}',
      mobileViewport: { width: 390, height: 844 },
    });
    expect(pkg.prompt).toMatch(/PAGE FUNCTION \(SCREENSHOT FUNCTIONAL PAGE MAP/i);
    expect(pkg.prompt).toMatch(/redesigning an EXISTING FUNCTIONAL PAGE/i);
    expect(pkg.prompt).toMatch(/SCREENSHOT_DESIGN_AUTHORITY: FORBIDDEN/i);
    const block = compileGpt2MobileScreenshotFunctionBlock(fx.screenshotFunctionalPageMap);
    expect(block).toMatch(/BOTTOM NAVIGATION \(LOCKED IA/i);
    const receipt = buildScreenshotFunctionMapReceipt(
      fx.screenshotFunctionalPageMap,
      validateScreenshotFunctionMapForGpt2Dispatch(fx.screenshotFunctionalPageMap),
    );
    expect(receipt.screenshotFunctionMap).toBe('PASS');
    expect(receipt.bottomNavOrderCaptured).toBe('PASS');
  });

  it('A/B/C share identical function map id in package compile', () => {
    const pageId = overviewPageId();
    const injection = sampleInjection(pageId);
    const fx = buildGpt2MobileScreenshotFunctionMapFixture({ projectId: PROJECT, pageId, injection });
    const skin = compileProjectSkinContract(PROJECT);
    const navSignature = `${fx.screenshotFunctionalPageMap.bottomNavigationMap.itemCount} items in order`;
    const shared = PAGE_CONCEPT_MOBILE_CONCEPT_SLOTS.map((slot) => {
      const pkg = buildPageGpt2MobileConceptRequestPackage({
        runId: 'run-sfm-abc',
        slot,
        conceptId: `c-${slot}`,
        projectContext: fx.projectContext,
        pageContext: fx.pageContext,
        functionContract: fx.functionContract,
        injection,
        cgptBrief: fx.cgptBrief,
        pageArchitectureBrief: fx.pageArchitectureBrief,
        skinContract: skin,
        providerReferences: fx.providerReferences,
        screenshotFunctionalPageMap: fx.screenshotFunctionalPageMap,
        pageContextSummary: '{}',
        mobileViewport: { width: 390, height: 844 },
      });
      return pkg.prompt.includes(navSignature);
    });
    expect(new Set(shared).size).toBe(1);
    expect(shared.every(Boolean)).toBe(true);
  });

  it('invented bottom nav count fails validation guard', () => {
    const pageId = overviewPageId();
    const fx = buildGpt2MobileScreenshotFunctionMapFixture({ projectId: PROJECT, pageId, injection: sampleInjection(pageId) });
    const badPrompt = compileGpt2MobileScreenshotFunctionBlock(fx.screenshotFunctionalPageMap).replace(
      `${fx.screenshotFunctionalPageMap.bottomNavigationMap.itemCount} items`,
      '99 items',
    );
    expect(validateBottomNavNotInvented(badPrompt, fx.screenshotFunctionalPageMap).ok).toBe(false);
  });

  it('source fingerprint change invalidates prior map', () => {
    const pageId = overviewPageId();
    const fx = buildGpt2MobileScreenshotFunctionMapFixture({ projectId: PROJECT, pageId, injection: sampleInjection(pageId) });
    expect(
      isScreenshotFunctionMapStale({
        map: fx.screenshotFunctionalPageMap,
        captureSetId: 'different-capture',
        functionContractId: fx.functionContract.contractId,
        pageArchitectureContentHash: fx.pageArchitectureBrief.contentHash,
        capturePackageVersion: fx.providerReferences.capturePackageVersion,
      }),
    ).toBe(true);
  });

  it('functional fidelity scorecard passes when prompt includes map block', () => {
    const pageId = overviewPageId();
    const fx = buildGpt2MobileScreenshotFunctionMapFixture({ projectId: PROJECT, pageId, injection: sampleInjection(pageId) });
    const prompt = compileGpt2MobileScreenshotFunctionBlock(fx.screenshotFunctionalPageMap);
    const score = evaluateFunctionalFidelityScorecard(fx.screenshotFunctionalPageMap, prompt);
    expect(score.bottomNav).toBe('PASS');
    expect(score.overall).toBe('PASS');
  });
});
