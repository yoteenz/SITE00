/**
 * P0.VR.PAGE-CONCEPT-CGPT-CREATIVE-SYNTHESIS-LEAK-FIX1
 */

import { describe, expect, it } from 'vitest';

import { useLegacyPageConceptNbpPipeline } from './helpers/pageConceptLegacyNbpTestEnv.js';

import { executePageConceptGeneration } from '../api/_lib/site00PageConcept/executePageConceptGenerationRun.js';
import { generatePageCreativeInjection } from '../api/_lib/site00PageConcept/generatePageCreativeInjection.js';
import {
  buildPageCreativeInjectionFromParsed,
  mergeCgptParsedRecords,
} from '../api/_lib/site00PageConcept/buildPageCreativeInjectionFromParsed.js';
import { loadPageConceptGenerationState } from '../shared/site00-design-workspace-production/pageConceptPipeline/store.js';
import { compilePageCreativeContext, compileProjectCreativeContext } from '../shared/site00-design-workspace-production/pageConceptPipeline/contextCompilers.js';
import { compilePageFunctionContract } from '../shared/site00-design-workspace-production/pageConceptPipeline/functionContract.js';
import {
  compilePageConceptCgptCreativeBrief,
  verifyGpt2HandoffContextIntegrity,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptCgptCreativeBrief.js';
import { buildPageConceptGpt2AuthorityPackage } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGpt2AuthorityPackage.js';
import {
  buildVitestCgptCreativeInjection,
  isSystemContaminatedSignal,
  pageConceptCgptQaStopAfterCgpt,
  sanitizeBrandSignalLines,
  translateFunctionContractToCreativeRequirements,
  validateCgptCreativeSynthesis,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptCgptCreativeSynthesis.js';
import { listSiteDesignPagesForProject } from '../shared/site00-design-workspace-production/designProjectBinding/index.js';
import { PAGE_CGPT_PROMPT_VERSION } from '../shared/site00-design-workspace-production/pageConceptPipeline/generationPlan.js';

const PROJECT = 'ndxbook';

function fixtures() {
  const pageId =
    listSiteDesignPagesForProject(PROJECT).find((p) => p.pageId === 'overview')?.pageId ??
    listSiteDesignPagesForProject(PROJECT)[0]!.pageId;
  const projectContext = compileProjectCreativeContext(PROJECT)!;
  const pageContext = compilePageCreativeContext(PROJECT, pageId)!;
  const functionContract = compilePageFunctionContract(PROJECT, pageId)!;
  return { pageId, projectContext, pageContext, functionContract };
}

describe('P0.VR PAGE-CONCEPT CGPT CREATIVE SYNTHESIS LEAK FIX', () => {
  useLegacyPageConceptNbpPipeline();

  it('validateCgptCreativeSynthesis rejects empty mandatory fields', () => {
    const { projectContext, pageContext, functionContract } = fixtures();
    const full = buildVitestCgptCreativeInjection({ projectContext, pageContext, functionContract });
    expect(validateCgptCreativeSynthesis(full).ok).toBe(true);

    const incomplete = { ...full, creativePremise: '', pageStory: '' };
    const v = validateCgptCreativeSynthesis(incomplete);
    expect(v.ok).toBe(false);
    expect(v.errorCode).toBe('CGPT_SYNTHESIS_INCOMPLETE');
    expect(v.missingFields).toContain('creativePremise');
  });

  it('blocks GPT2 when synthesis incomplete after CGPT stage path', async () => {
    const { pageId, projectContext, pageContext, functionContract } = fixtures();
    process.env.SITE00_PAGE_CONCEPT_CGPT_QA_STOP = 'false';
    const state = loadPageConceptGenerationState(PROJECT, pageId);
    const patches: { generationStatus?: string; error?: string | null }[] = [];
    const result = await executePageConceptGeneration(
      {
        founderConfirmedSpend: true,
        state,
        mobileCapture: { captureId: 'm', width: 390, height: 844, artifactBase64: 'm' },
        desktopCapture: { captureId: 'd', width: 1440, height: 900, artifactBase64: 'd' },
      },
      {
        dryRun: true,
        onProgress: (p) => {
          patches.push({ generationStatus: p.generationStatus, error: p.error });
        },
      },
    );
    expect(result.pipelineSet.creativeInjection).toBeTruthy();
    expect(validateCgptCreativeSynthesis(result.pipelineSet.creativeInjection!).ok).toBe(true);
    expect(result.pipelineSet.gpt2AuthorityConcept).toBeTruthy();
  });

  it('mergeCgptParsedRecords fills missing synthesis fields on repair', () => {
    const { projectContext, pageContext, functionContract } = fixtures();
    const base = buildVitestCgptCreativeInjection({ projectContext, pageContext, functionContract });
    const parsedBase = {
      creativePremise: base.creativePremise,
      pageStory: '',
    };
    const repair = {
      pageStory: base.pageStory,
      compositionStrategy: base.compositionStrategy,
      hierarchyStrategy: base.hierarchyStrategy,
      typographyStrategy: base.typographyStrategy,
      colorStrategy: base.colorStrategy,
      materialStrategy: base.materialStrategy,
      imageryStrategy: base.imageryStrategy,
      imageStrategy: base.imageStrategy,
      interactionCharacter: base.interactionCharacter,
      distinctiveMove: base.distinctiveMove,
      creativeLatitude: base.creativeLatitude,
      mobileDirection: base.mobileDirection,
      desktopDirection: base.desktopDirection,
      visualTerritory: base.visualTerritory,
      pageSurprise: base.pageSurprise,
      avoidList: base.avoidList,
      mandatoryBrandSignals: base.mandatoryBrandSignals,
    };
    const merged = mergeCgptParsedRecords(parsedBase, repair);
    const injection = buildPageCreativeInjectionFromParsed(
      { projectContext, pageContext, functionContract },
      merged,
      'test',
    );
    expect(validateCgptCreativeSynthesis(injection).ok).toBe(true);
  });

  it('verifyGpt2HandoffContextIntegrity reports CONTEXT_LOSS when fields dropped', () => {
    const { projectContext, pageContext, functionContract } = fixtures();
    const injection = buildVitestCgptCreativeInjection({ projectContext, pageContext, functionContract });
    const brief = compilePageConceptCgptCreativeBrief({
      injection,
      projectContext,
      pageContext,
      functionContract,
    });
    const pkg = buildPageConceptGpt2AuthorityPackage({
      projectContext,
      pageContext,
      functionContract,
      injection,
      cgptBrief: brief,
    });
    const cgpt = pkg.payload.cgptCreativeDirection as Record<string, string>;
    delete cgpt.pageSurprise;
    const integrity = verifyGpt2HandoffContextIntegrity({ brief, package: pkg });
    expect(integrity.ok).toBe(false);
    expect(integrity.missing).toContain('pageSurprise');
  });

  it('full handoff COMPLETE for vitest synthesis injection', () => {
    const { projectContext, pageContext, functionContract } = fixtures();
    const injection = buildVitestCgptCreativeInjection({ projectContext, pageContext, functionContract });
    const brief = compilePageConceptCgptCreativeBrief({
      injection,
      projectContext,
      pageContext,
      functionContract,
    });
    const pkg = buildPageConceptGpt2AuthorityPackage({
      projectContext,
      pageContext,
      functionContract,
      injection,
      cgptBrief: brief,
    });
    expect(verifyGpt2HandoffContextIntegrity({ brief, package: pkg }).ok).toBe(true);
  });

  it('sanitizes system terms from brand signals', () => {
    expect(isSystemContaminatedSignal('RASTER CHEAT')).toBe(true);
    const cleaned = sanitizeBrandSignalLines(['NDX lime signal', 'PROVIDER BYPASS', 'Archival editorial index']);
    expect(cleaned.some((l) => /PROVIDER|raster cheat/i.test(l))).toBe(false);
    expect(cleaned.some((l) => /NDX/i.test(l))).toBe(true);
  });

  it('translates function contract without raw Supabase/routes jargon', () => {
    const { pageContext, functionContract } = fixtures();
    const creative = translateFunctionContractToCreativeRequirements({
      functionContract: {
        ...functionContract,
        regions: ['ROUTES', 'OVERVIEW_PANEL', 'SUPABASE'],
        immutableBehaviors: ['PERSISTENCE', 'Must show active work'],
      },
      pageContext,
    });
    expect(creative.join(' ')).not.toMatch(/SUPABASE|ROUTES|PERSISTENCE/i);
    expect(creative.length).toBeGreaterThan(0);
  });

  it('creative brief functional requirements exclude infra-only tokens', () => {
    const { projectContext, pageContext, functionContract } = fixtures();
    const injection = buildVitestCgptCreativeInjection({ projectContext, pageContext, functionContract });
    const brief = compilePageConceptCgptCreativeBrief({
      injection,
      projectContext,
      pageContext,
      functionContract,
    });
    const blob = brief.functionalRequirements.join(' ');
    expect(blob).not.toMatch(/SUPABASE|API-CONTRACT|COMPOSER-FREEZE/i);
  });

  it('CGPT QA stop prevents GPT2 until founder continues', async () => {
    const { pageId } = fixtures();
    process.env.SITE00_PAGE_CONCEPT_CGPT_QA_STOP = 'true';
    process.env.SITE00_PAGE_CONCEPT_REQUIRE_GPT2_REVIEW = 'false';
    const state = loadPageConceptGenerationState(PROJECT, pageId);

    const result = await executePageConceptGeneration(
      {
        founderConfirmedSpend: true,
        state,
        mobileCapture: { captureId: 'm', width: 390, height: 844, artifactBase64: 'm' },
        desktopCapture: { captureId: 'd', width: 1440, height: 900, artifactBase64: 'd' },
      },
      { dryRun: true },
    );
    expect(result.pipelineSet.gpt2AuthorityConcept).toBeNull();
    expect(result.pipelineSet.cgptCreativeBrief).toBeTruthy();
    expect(pageConceptCgptQaStopAfterCgpt()).toBe(true);
  });

  it('continueGpt2AfterCgptReview runs GPT2 after QA stop', async () => {
    delete process.env.SITE00_PAGE_CONCEPT_LEGACY_NBP;
    const { pageId } = fixtures();
    process.env.SITE00_PAGE_CONCEPT_CGPT_QA_STOP = 'true';
    process.env.SITE00_PAGE_CONCEPT_REQUIRE_GPT2_REVIEW = 'false';
    const state = loadPageConceptGenerationState(PROJECT, pageId);
    const stopped = await executePageConceptGeneration(
      {
        founderConfirmedSpend: true,
        state,
        mobileCapture: { captureId: 'm', width: 390, height: 844, artifactBase64: 'm' },
        desktopCapture: { captureId: 'd', width: 1440, height: 900, artifactBase64: 'd' },
      },
      { dryRun: true },
    );
    expect(stopped.pipelineSet.creativeInjection).toBeTruthy();
    const continued = await executePageConceptGeneration(
      {
        founderConfirmedSpend: true,
        state: {
          ...state,
          pipelineSet: stopped.pipelineSet,
          generationStatus: 'CGPT_AWAITING_FOUNDER_REVIEW',
        },
        mobileCapture: { captureId: 'm', width: 390, height: 844, artifactBase64: 'm' },
        desktopCapture: { captureId: 'd', width: 1440, height: 900, artifactBase64: 'd' },
      },
      { dryRun: true, continueGpt2AfterCgptReview: true },
    );
    expect(continued.pipelineSet.mobileConcepts?.length).toBe(3);
  });

  it('uses creative synthesis prompt version in generation plan export', () => {
    expect(PAGE_CGPT_PROMPT_VERSION).toContain('creative-synthesis');
  });

  it('vitest generatePageCreativeInjection returns substantive mobile/desktop/distinctive fields', async () => {
    const { projectContext, pageContext, functionContract } = fixtures();
    process.env.VITEST = 'true';
    const injection = await generatePageCreativeInjection({
      projectContext,
      pageContext,
      functionContract,
    });
    for (const field of ['mobileDirection', 'desktopDirection', 'distinctiveMove', 'pageSurprise'] as const) {
      expect(injection[field]?.trim().length ?? 0).toBeGreaterThan(20);
    }
  });
});
