/**
 * P0.VR.CGPT-PAGE-ARCHITECTURE-HANDOFF1
 */

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { appendPageCapture } from '../shared/site00-design-workspace-production/designPageCapture.js';
import { listSiteDesignPagesForProject } from '../shared/site00-design-workspace-production/designProjectBinding/index.js';
import { compilePageFunctionContract } from '../shared/site00-design-workspace-production/pageConceptPipeline/functionContract.js';
import { compileProjectCreativeContext, compilePageCreativeContext } from '../shared/site00-design-workspace-production/pageConceptPipeline/contextCompilers.js';
import { compilePageConceptCgptCreativeBrief } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptCgptCreativeBrief.js';
import {
  compilePageConceptPageArchitectureBrief,
  evaluateGpt2MobilePageArchitectureValidity,
  validatePageArchitectureBrief,
  formatPageArchitectureBriefForGpt2Prompt,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptPageArchitectureBrief.js';
import {
  buildPageGpt2MobileConceptRequestPackage,
  mobileConceptTerritoryDirective,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGpt2MobileRequestPackage.js';
import { PAGE_CONCEPT_MOBILE_CONCEPT_SLOTS } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptViewportAuthorityFamily.js';
import { mockGpt2MobileProviderReferenceBundleForTest } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGpt2MobileReferenceAuthority.js';
import { buildScreenshotFunctionalPageMapForTest } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptScreenshotFunctionalPageMap.js';
import type { PageCreativeInjection } from '../shared/site00-design-workspace-production/pageConceptPipeline/types.js';

const PROJECT = 'ndxbook';

function overviewPageId(): string {
  const overview = listSiteDesignPagesForProject(PROJECT).find((p) => p.screenId === 'overview');
  if (!overview) throw new Error('overview missing');
  return overview.pageId;
}

function seedCaptures(projectId: string, pageId: string) {
  const base = {
    projectId,
    pageId,
    screenId: 'overview',
    route: '/projects/design/ndxbook/overview',
    timestamp: new Date().toISOString(),
    buildVersion: 'vitest',
    createdBy: 'vitest',
    source: 'LOCAL_FALLBACK' as const,
  };
  appendPageCapture({ ...base, captureId: 'm-cap', viewport: 'MOBILE', artifactPath: 'data:image/png;base64,aaaa' });
  appendPageCapture({ ...base, captureId: 'd-cap', viewport: 'DESKTOP', artifactPath: 'data:image/png;base64,bbbb' });
}

function sampleInjection(pageId: string): PageCreativeInjection {
  return {
    injectionId: 'inj-arch-1',
    projectId: PROJECT,
    pageId,
    projectContextVersion: '1',
    pageContextVersion: '1',
    functionContractVersion: '1',
    creativeThesis: 'Cultural ledger overview with index register rhythm for NDXBOOK inside DESIGN workspace.',
    creativePremise: 'NDXBOOK Overview is the project home — not a poster.',
    pageStory: 'Orient founder to NDXBOOK system entries and active cultural signal.',
    pagePurposeInterpretation: 'Project overview entry point',
    visualOpportunity: 'Editorial index with evidence plates',
    visualTerritory: 'NDX black archive register',
    hierarchyDirection: 'Title-first index',
    hierarchyStrategy: 'Monument title then structured entries',
    spatialDirection: 'Vertical scroll page',
    compositionStrategy: 'Region-based page stack',
    informationPriority: 'Entries before decoration',
    imageDataBalance: 'Evidence supports story',
    responsiveDirection: 'Mobile thumb reach',
    mobileDirection: 'Single column page scroll',
    desktopDirection: 'Wide grid later',
    creativeLatitude: 'High within architecture',
    immutableRequirements: ['navigation', 'entries'],
    referenceStrategy: 'Archive',
    assetStrategy: 'Evidence collage in page body',
    imageryStrategy: 'Grain plates as content not hero poster',
    interactionCharacter: 'Tappable rows and promote affordances',
    distinctiveMove: 'Index declaration as page entry not flyer headline',
    typographyStrategy: 'Display + mono ledger',
    colorStrategy: 'NDX black field',
    materialStrategy: 'Matte archive',
    avoidList: ['generic SaaS dashboard', 'poster hero'],
    mandatoryBrandSignals: ['NDXBOOK'],
    audienceIntent: 'Founder orientation',
    createdAt: new Date().toISOString(),
    cgptProvider: 'vitest',
    cgptModel: 'vitest',
  };
}

describe('P0.VR.CGPT-PAGE-ARCHITECTURE-HANDOFF1', () => {
  it('generates Page Architecture Brief after CGPT synthesis compile path', () => {
    seedCaptures(PROJECT, overviewPageId());
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
    expect(arch.briefId).toMatch(/^pab-/);
    expect(validatePageArchitectureBrief(arch).ok).toBe(true);
  });

  it('blocks GPT2 dispatch when page architecture is incomplete', () => {
    expect(validatePageArchitectureBrief(null).errorCode).toBe('PAGE_ARCHITECTURE_INCOMPLETE');
  });

  it('includes route and site/module context', () => {
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
    expect(arch.pageIdentity.route).toMatch(/ndxbook/i);
    expect(arch.pageIdentity.siteContext).toBe('SITE 00');
    expect(arch.pageIdentity.moduleContext).toContain('PROJECTS');
    expect(arch.pageIdentity.moduleContext).not.toContain('> DESIGN');
    expect(arch.targetRouteContract.targetRouteLabel).toContain('OVERVIEW');
  });

  it('includes host/project boundary and mobile region map', () => {
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
    expect(arch.hostShellMap.hostOwns.length).toBeGreaterThan(2);
    expect(arch.hostShellMap.projectOwns.length).toBeGreaterThan(2);
    expect(arch.mobileRegionMap.length).toBeGreaterThanOrEqual(7);
    expect(arch.navigationContract.inPageNavigation.length).toBeGreaterThan(0);
    expect(arch.bottomContinuityContract.contractId).toBeTruthy();
    expect(arch.aboveFoldContract.firstViewportPurpose).toMatch(/poster/i);
    expect(arch.mobileScrollNarrative.bottom).toMatch(/continuity/i);
  });

  it('all three GPT2 packages share the same architecture brief id', () => {
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
    const skin = {
      contractId: 'skin',
      version: '1',
      skinName: 'NDX',
      typography: { displayFont: 'D', bodyFont: 'B', monoFont: 'M' },
      palette: ['#000'],
      material: ['matte'],
      imagery: ['grain'],
      composition: ['dense'],
      componentExpression: ['sharp'],
      brandSignals: ['NDX'],
      forbiddenDrift: ['SaaS'],
    };
    const providerReferences = mockGpt2MobileProviderReferenceBundleForTest();
    const screenshotFunctionalPageMap = buildScreenshotFunctionalPageMapForTest({
      captureSetId: 'pcgr-arch',
      providerReferenceBundle: providerReferences,
      projectContext,
      pageContext,
      functionContract,
      pageArchitectureBrief: arch,
    });
    const ids = PAGE_CONCEPT_MOBILE_CONCEPT_SLOTS.map((slot) => {
      const pkg = buildPageGpt2MobileConceptRequestPackage({
        runId: 'pcgr-arch',
        slot,
        conceptId: `c-${slot}`,
        projectContext,
        pageContext,
        functionContract,
        injection,
        cgptBrief,
        pageArchitectureBrief: arch,
        skinContract: skin as never,
        providerReferences,
        screenshotFunctionalPageMap,
        pageContextSummary: '{}',
        mobileViewport: { width: 390, height: 844 },
      });
      expect(pkg.prompt).toContain('PAGE REGIONS');
      expect(pkg.inspector.compiledProviderPrompt.sharedBaseHash).toBeTruthy();
      return pkg.inspector.compiledProviderPrompt.sharedBaseHash;
    });
    expect(new Set(ids).size).toBe(1);
    const territories = PAGE_CONCEPT_MOBILE_CONCEPT_SLOTS.map((slot) =>
      mobileConceptTerritoryDirective({ slot, injection, brief: cgptBrief }),
    );
    expect(new Set(territories).size).toBe(3);
  });

  it('territory variation does not change architecture block', () => {
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
    const archText = formatPageArchitectureBriefForGpt2Prompt(arch);
    for (const slot of PAGE_CONCEPT_MOBILE_CONCEPT_SLOTS) {
      const t = mobileConceptTerritoryDirective({ slot, injection, brief: cgptBrief });
      expect(t).not.toBe(archText);
    }
  });

  it('post-generation evaluator fails poster heuristic and incomplete brief', () => {
    const failPoster = evaluateGpt2MobilePageArchitectureValidity({
      architectureBrief: null,
      promptIncludedArchitecture: false,
      posterDriftHeuristic: true,
    });
    expect(failPoster.ok).toBe(false);
    expect(failPoster.errorCode).toBe('PAGE_ARCHITECTURE_VALIDATION_FAILED');
  });

  it('debug view wiring exposes architecture in overlay and execute path', () => {
    const overlay = readFileSync(
      join(process.cwd(), 'src/site00/components/designBench/opusDirect/PageConceptGenerationOverlay.tsx'),
      'utf8',
    );
    expect(overlay).toContain('pageArchitectureDebugLines');
    const execute = readFileSync(
      join(process.cwd(), 'api/_lib/site00PageConcept/executePageConceptGenerationRun.ts'),
      'utf8',
    );
    expect(execute).toContain('compilePageConceptPageArchitectureBrief');
    expect(execute).toContain('validatePageArchitectureBrief');
    expect(execute).toContain('PAGE_ARCHITECTURE_INCOMPLETE');
  });
});
