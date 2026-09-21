/**
 * P0.VR.PAGE-CONCEPT-NBP-AUTHORITY-FIRST-RECONSTRUCTION1
 */

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { compileProjectSkinContract } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptProjectSkinContract.js';
import {
  assertPageNbpImageHierarchy,
  buildPageNbpRequestPackage,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptNbpRequestPackage.js';
import {
  pageConceptNbpJobAllowedInQaMode,
  pageConceptNbpOmitCurrentScreenshot,
  pageConceptNbpRequiresAuthorityApprovalId,
  pageConceptNbpSixWayDispatchPreserved,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptNbpAuthorityPolicy.js';
import { executePageConceptGeneration } from '../api/_lib/site00PageConcept/executePageConceptGenerationRun.js';
import * as nbp from '../api/_lib/site00PageConcept/renderPageNbpJob.js';
import type {
  PageCreativeInjection,
  PageFunctionContract,
  PageGPT2AuthorityConcept,
  ProjectCreativeContext,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/types.js';
import { loadPageConceptGenerationState } from '../shared/site00-design-workspace-production/pageConceptPipeline/store.js';
import { listSiteDesignPagesForProject } from '../shared/site00-design-workspace-production/designProjectBinding/index.js';

const authorityB64 = Buffer.from('golden-gpt2-authority', 'utf8').toString('base64');

function mockGpt2(overrides?: Partial<PageGPT2AuthorityConcept>): PageGPT2AuthorityConcept {
  return {
    conceptId: 'pg2-golden',
    projectId: 'ndxbook',
    pageId: 'project-home',
    injectionId: 'inj-golden',
    name: 'Editorial authority',
    premise: 'Black lime editorial intelligence',
    hierarchyStrategy: 'Headline-led',
    compositionStrategy: 'Asymmetric editorial',
    visualLanguage: 'High contrast archival',
    interactionPresentation: 'Expressive nav',
    mobileIntent: 'Stacked editorial',
    desktopIntent: 'Wide editorial field',
    authorityArtifact: `data:image/png;base64,${authorityB64}`,
    gpt2Provider: 'test',
    gpt2Model: 'test',
    createdAt: new Date().toISOString(),
    groundingPackageVersion: 'page-gpt2-authority-v2-grounding',
    ...overrides,
  };
}

function mockInjection(): PageCreativeInjection {
  return {
    injectionId: 'inj-golden',
    projectId: 'ndxbook',
    pageId: 'project-home',
    projectContextVersion: 'p1',
    pageContextVersion: 'pg1',
    functionContractVersion: 'fc1',
    creativeThesis: 'Cultural intelligence index',
    pagePurposeInterpretation: 'Founder overview',
    visualOpportunity: 'Editorial asymmetry',
    hierarchyDirection: 'Display type leads',
    spatialDirection: 'Controlled density',
    informationPriority: 'Evidence first',
    imageDataBalance: 'Image-led',
    responsiveDirection: 'Distinct mobile/desktop',
    mobileDirection: 'Vertical rhythm',
    desktopDirection: 'Horizontal field',
    creativeLatitude: 'High within NDX identity',
    immutableRequirements: ['Core modules'],
    referenceStrategy: 'Authority-first',
    assetStrategy: 'Archival',
    createdAt: new Date().toISOString(),
    cgptProvider: 'test',
    cgptModel: 'test',
  };
}

function mockFunctionContract(): PageFunctionContract {
  return {
    contractId: 'pfc-ndxbook-project-home',
    projectId: 'ndxbook',
    pageId: 'project-home',
    version: 'v1',
    route: '/projects/ndxbook',
    regions: ['HERO', 'MODULES', 'META'],
    interactions: ['NAV', 'ACTIONS'],
    immutableBehaviors: ['Must show project status'],
    responsiveRequirements: ['MOBILE', 'DESKTOP'],
    createdAt: new Date().toISOString(),
  };
}

describe('P0.VR PAGE-CONCEPT NBP AUTHORITY-FIRST', () => {
  beforeEach(() => {
    process.env.SITE00_PAGE_CONCEPT_REQUIRE_GPT2_REVIEW = 'false';
    process.env.SITE00_PAGE_CONCEPT_NBP_OMIT_CURRENT_SCREENSHOT = 'true';
    delete process.env.SITE00_PAGE_CONCEPT_NBP_QA_SINGLE;
  });

  it('compiles NDXBOOK skin contract with exact typography from SKINS tab', () => {
    const skin = compileProjectSkinContract('ndxbook');
    expect(skin.contractId).toContain('ndxbook');
    expect(skin.typography.displayFont).toContain('NDX SANS COND');
    expect(skin.typography.bodyFont).toContain('NDX SANS');
    expect(skin.typography.monoFont).toContain('NDX MONO');
    expect(skin.palette.some((p) => p.includes('#dbff00'))).toBe(true);
    expect(skin.forbiddenDrift.some((f) => f.toLowerCase().includes('saas'))).toBe(true);
  });

  it('golden package: GPT2 authority is image #1; current never #1', () => {
    const skin = compileProjectSkinContract('ndxbook');
    const pkg = buildPageNbpRequestPackage({
      gpt2Authority: mockGpt2(),
      creativeInjection: mockInjection(),
      functionContract: mockFunctionContract(),
      skinContract: skin,
      renditionSlot: 'RENDITION_A',
      renditionDirective: 'Faithful',
      viewport: 'MOBILE',
      currentImplementationBase64: Buffer.from('generic-light-dashboard', 'utf8').toString('base64'),
      pageContextSummary: 'Required modules only',
      authorityApprovalId: 'pnaa-test',
      renditionId: 'prend-a',
    });
    const hierarchy = assertPageNbpImageHierarchy(pkg);
    expect(hierarchy.ok).toBe(true);
    expect(pkg.imageInputs[0]?.role).toBe('VISUAL_AUTHORITY_GPT2');
    expect(pkg.omitCurrentScreenshot).toBe(true);
    expect(pkg.inspector.currentScreenshotRole).toBe('OMITTED');
    expect(pkg.prompt).toContain('RECONSTRUCT');
    expect(pkg.prompt).toContain('NDX SANS');
    expect(pkg.prompt).toContain('FORBIDDEN DRIFT');
    expect(pkg.prompt).toContain('Cultural intelligence index');
  });

  it('includes current as last reference when omission env is false', () => {
    process.env.SITE00_PAGE_CONCEPT_NBP_OMIT_CURRENT_SCREENSHOT = 'false';
    const skin = compileProjectSkinContract('ndxbook');
    const currentB64 = Buffer.from('current-page', 'utf8').toString('base64');
    const pkg = buildPageNbpRequestPackage({
      gpt2Authority: mockGpt2(),
      creativeInjection: mockInjection(),
      functionContract: mockFunctionContract(),
      skinContract: skin,
      renditionSlot: 'RENDITION_B',
      renditionDirective: 'Editorial',
      viewport: 'DESKTOP',
      currentImplementationBase64: currentB64,
      pageContextSummary: 'Modules',
      authorityApprovalId: 'pnaa-test',
      renditionId: 'prend-b',
    });
    expect(pkg.imageInputs).toHaveLength(2);
    expect(pkg.imageInputs[1]?.role).toBe('FUNCTIONAL_REFERENCE_CURRENT');
    expect(assertPageNbpImageHierarchy(pkg).ok).toBe(true);
  });

  it('blocks package build without GPT2 authority image', () => {
    expect(() =>
      buildPageNbpRequestPackage({
        gpt2Authority: mockGpt2({ authorityArtifact: null }),
        creativeInjection: mockInjection(),
        functionContract: mockFunctionContract(),
        skinContract: compileProjectSkinContract('ndxbook'),
        renditionSlot: 'RENDITION_A',
        renditionDirective: 'Faithful',
        viewport: 'MOBILE',
        currentImplementationBase64: null,
        pageContextSummary: 'x',
        authorityApprovalId: 'pnaa-test',
        renditionId: 'prend-a',
      }),
    ).toThrow(/GPT2_AUTHORITY_IMAGE_REQUIRED/);
  });

  it('QA single mode allows only RENDITION_A MOBILE', () => {
    process.env.SITE00_PAGE_CONCEPT_NBP_QA_SINGLE = 'true';
    expect(pageConceptNbpJobAllowedInQaMode('RENDITION_A', 'MOBILE')).toBe(true);
    expect(pageConceptNbpJobAllowedInQaMode('RENDITION_A', 'DESKTOP')).toBe(false);
    expect(pageConceptNbpJobAllowedInQaMode('RENDITION_B', 'MOBILE')).toBe(false);
    expect(pageConceptNbpSixWayDispatchPreserved()).toBe(false);
  });

  it('dry-run pipeline passes authority-first package to NBP renderer', async () => {
    const nbpSpy = vi.spyOn(nbp, 'renderPageNbpJob');
    const pageId =
      listSiteDesignPagesForProject('ndxbook').find((p) => p.pageId === 'overview')?.pageId ??
      listSiteDesignPagesForProject('ndxbook')[0]!.pageId;
    const state = loadPageConceptGenerationState('ndxbook', pageId);
    await executePageConceptGeneration(
      {
        founderConfirmedSpend: true,
        dryRun: true,
        state,
        mobileCapture: { captureId: 'm1', width: 390, height: 844, artifactBase64: 'b64m' },
        desktopCapture: { captureId: 'd1', width: 1440, height: 900, artifactBase64: 'b64d' },
      },
      { dryRun: true },
    );
    expect(nbpSpy).toHaveBeenCalled();
    const firstCall = nbpSpy.mock.calls[0]?.[0];
    expect(firstCall?.package.imageInputs[0]?.role).toBe('VISUAL_AUTHORITY_GPT2');
    expect(firstCall?.package.lineage.skinContractId).toContain('ndxbook');
    nbpSpy.mockRestore();
  });

  it('requires authority approval id when review gate and policy enabled', () => {
    expect(pageConceptNbpRequiresAuthorityApprovalId()).toBe(true);
    expect(pageConceptNbpOmitCurrentScreenshot()).toBe(true);
  });
});
