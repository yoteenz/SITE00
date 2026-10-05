/**
 * P0.VR.PAGE-CONCEPT-POST-RUN-RESTART-CONTROLS1
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  buildPageConceptPostRunActions,
  pageConceptPostRunConfirmMessage,
  pageConceptPostRunPrimaryAction,
  pageConceptPostRunSecondaryAction,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptPostRunControls.js';
import { computePageConceptModalGeneratePress } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptModalGeneratePress.js';
import {
  archivePageConceptRunBranch,
  nextPageConceptArchiveLabel,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptRunArchive.js';
import type { PageConceptGenerationState } from '../shared/site00-design-workspace-production/pageConceptPipeline/types.js';
import { executePageConceptGeneration } from '../api/_lib/site00PageConcept/executePageConceptGenerationRun.js';
import { loadPageConceptGenerationState } from '../shared/site00-design-workspace-production/pageConceptPipeline/store.js';
import { listSiteDesignPagesForProject } from '../shared/site00-design-workspace-production/designProjectBinding/index.js';

const ROOT = join(import.meta.dirname, '..');
const read = (rel: string) => readFileSync(join(ROOT, rel), 'utf8');

function reviewState(): PageConceptGenerationState {
  return {
    targetType: 'PAGE',
    projectId: 'ndxbook',
    pageId: 'page-overview',
    projectContext: null,
    pageContext: null,
    functionContract: null,
    pipelineSet: {
      pipelineSetId: 'pps-review-1',
      projectId: 'ndxbook',
      pageId: 'page-overview',
      targetType: 'PAGE',
      captureSetId: 'cap-1',
      functionContractId: 'fc-1',
      creativeInjection: {
        injectionId: 'inj-1',
        projectId: 'ndxbook',
        pageId: 'page-overview',
        projectContextVersion: 'v1',
        pageContextVersion: 'v1',
        functionContractVersion: 'fc-1',
        creativeThesis: 'Premise long enough for synthesis validation field',
        pagePurposeInterpretation: 'Purpose',
        visualOpportunity: 'Visual',
        hierarchyDirection: 'H',
        spatialDirection: 'C',
        informationPriority: 'I',
        imageDataBalance: 'B',
        responsiveDirection: 'R',
        mobileDirection: 'Mobile direction with enough characters for validation',
        desktopDirection: 'Desktop direction with enough characters for validation',
        creativeLatitude: 'Latitude',
        immutableRequirements: [],
        referenceStrategy: 'R',
        assetStrategy: 'A',
        createdAt: new Date().toISOString(),
        cgptProvider: 'test',
        cgptModel: 'test',
      },
      cgptCreativeBrief: null,
      gpt2AuthorityConcept: {
        conceptId: 'gpt2-1',
        projectId: 'ndxbook',
        pageId: 'page-overview',
        injectionId: 'inj-1',
        name: 'Authority',
        premise: 'P',
        hierarchyStrategy: 'H',
        compositionStrategy: 'C',
        visualLanguage: 'V',
        interactionPresentation: 'I',
        mobileIntent: 'M',
        desktopIntent: 'D',
        authorityArtifact: 'data:image/png;base64,authority-test-b64',
        gpt2Provider: 'test',
        gpt2Model: 'test',
        createdAt: new Date().toISOString(),
      },
      renditions: [],
      createdAt: new Date().toISOString(),
    },
    generationJobs: [
      {
        artifactId: 'pcga-RENDITION_A-MOBILE',
        projectId: 'ndxbook',
        pageId: 'page-overview',
        renditionSlot: 'RENDITION_A',
        viewport: 'MOBILE',
        captureSetId: 'c1',
        projectContextVersion: 'v1',
        pageContextVersion: 'v1',
        functionContractId: 'fc-1',
        creativeInjectionId: 'inj-1',
        gpt2AuthorityConceptId: 'gpt2-1',
        renditionId: 'r1',
        provider: 'NBP',
        model: 'nbp',
        providerJobId: null,
        promptVersion: 'v1',
        createdAt: new Date().toISOString(),
        status: 'READY',
        artifactPath: null,
        imageUri: 'data:image/png;base64,abc',
        width: 390,
        height: 844,
      },
    ],
    generationStatus: 'READY_FOR_FOUNDER_REVIEW',
    lastFailure: null,
    history: [],
    activeGenerationRunId: 'pcgr-1',
    activeGenerationRunStartedAt: null,
    activeGenerationStage: null,
    liveProgress: null,
    cgptSubsteps: null,
    archivedRuns: [],
    activeReviewRunId: null,
  };
}

describe('P0.VR PAGE-CONCEPT POST-RUN RESTART CONTROLS', () => {
  it('READY_FOR_REVIEW is not a dead-end modal generate press', () => {
    const press = computePageConceptModalGeneratePress({
      eligibility: { canGenerate: true, sessionReady: true } as never,
      mode: 'review',
      generating: false,
      generationStatus: 'READY_FOR_FOUNDER_REVIEW',
      executionError: null,
      failedNbp: false,
    });
    expect(press.blockReason).not.toBe('READY FOR REVIEW');
  });

  it('exposes VIEW RENDITIONS and NEW GENERATION when review ready', () => {
    const actions = buildPageConceptPostRunActions(reviewState());
    expect(pageConceptPostRunPrimaryAction(actions)?.id).toBe('view_renditions');
    expect(pageConceptPostRunSecondaryAction(actions)?.id).toBe('new_generation');
    expect(actions.some((a) => a.id === 'regenerate_cgpt')).toBe(true);
    expect(actions.some((a) => a.id === 'regenerate_gpt2')).toBe(true);
    expect(actions.some((a) => a.id === 'regenerate_nbp')).toBe(false);
    process.env.SITE00_PAGE_CONCEPT_LEGACY_NBP = 'true';
    expect(buildPageConceptPostRunActions(reviewState()).some((a) => a.id === 'regenerate_nbp')).toBe(true);
    delete process.env.SITE00_PAGE_CONCEPT_LEGACY_NBP;
  });

  it('archives prior run without deleting jobs', () => {
    const state = reviewState();
    const archived = archivePageConceptRunBranch(state, { reason: 'new_generation' });
    expect(archived.archivedRuns?.length).toBe(1);
    expect(archived.generationJobs.length).toBe(1);
    expect(archived.activeReviewRunId).toBe('pps-review-1');
    expect(nextPageConceptArchiveLabel(0)).toBe('RUN 01');
  });

  it('spend actions require confirm copy with provider counts', () => {
    process.env.SITE00_PAGE_CONCEPT_LEGACY_NBP = 'true';
    const regen = buildPageConceptPostRunActions(reviewState()).find((a) => a.id === 'regenerate_nbp');
    expect(regen?.spendNote).toContain('6 NBP');
    expect(pageConceptPostRunConfirmMessage(regen!)).toContain('Expected provider spend');
    delete process.env.SITE00_PAGE_CONCEPT_LEGACY_NBP;
    const view = buildPageConceptPostRunActions(reviewState()).find((a) => a.id === 'view_renditions');
    expect(view?.spendNote).toBeNull();
  });

  it('regenerate GPT2 only skips CGPT provider stage', async () => {
    delete process.env.SITE00_PAGE_CONCEPT_LEGACY_NBP;
    process.env.SITE00_PAGE_CONCEPT_CGPT_QA_STOP = 'false';
    process.env.SITE00_PAGE_CONCEPT_REQUIRE_GPT2_REVIEW = 'false';
    const pageId =
      listSiteDesignPagesForProject('ndxbook').find((p) => p.pageId === 'overview')?.pageId ??
      listSiteDesignPagesForProject('ndxbook')[0]!.pageId;
    const base = loadPageConceptGenerationState('ndxbook', pageId);
    const review = reviewState();
    const state = {
      ...base,
      pageId,
      generationStatus: review.generationStatus,
      pipelineSet: review.pipelineSet,
      generationJobs: review.generationJobs,
    };
    const result = await executePageConceptGeneration(
      {
        founderConfirmedSpend: true,
        state,
        mobileCapture: { captureId: 'm', width: 390, height: 844, artifactBase64: 'm' },
        desktopCapture: { captureId: 'd', width: 1440, height: 900, artifactBase64: 'd' },
      },
      { dryRun: true, retryGpt2Only: true },
    );
    expect(result.pipelineSet.creativeInjection?.injectionId).toBe('inj-1');
    expect(result.pipelineSet.mobileConcepts?.length).toBe(3);
    expect(result.pipelineSet.gpt2AuthorityConcept).toBeNull();
  });

  it('regenerate NBP only skips CGPT/GPT2 provider stages', async () => {
    process.env.SITE00_PAGE_CONCEPT_LEGACY_NBP = 'true';
    process.env.SITE00_PAGE_CONCEPT_CGPT_QA_STOP = 'false';
    process.env.SITE00_PAGE_CONCEPT_REQUIRE_GPT2_REVIEW = 'false';
    const pageId =
      listSiteDesignPagesForProject('ndxbook').find((p) => p.pageId === 'overview')?.pageId ??
      listSiteDesignPagesForProject('ndxbook')[0]!.pageId;
    const base = loadPageConceptGenerationState('ndxbook', pageId);
    const review = reviewState();
    const state = {
      ...base,
      pageId,
      generationStatus: review.generationStatus,
      pipelineSet: review.pipelineSet,
      generationJobs: review.generationJobs,
    };
    const result = await executePageConceptGeneration(
      {
        founderConfirmedSpend: true,
        state,
        mobileCapture: { captureId: 'm', width: 390, height: 844, artifactBase64: 'm' },
        desktopCapture: { captureId: 'd', width: 1440, height: 900, artifactBase64: 'd' },
      },
      { dryRun: true, regenerateNbpOnly: true },
    );
    expect(result.pipelineSet.creativeInjection?.injectionId).toBe('inj-1');
    expect(result.pipelineSet.gpt2AuthorityConcept?.conceptId).toBe('gpt2-1');
    expect(result.jobs.length).toBeGreaterThan(0);
    delete process.env.SITE00_PAGE_CONCEPT_LEGACY_NBP;
  });

  it('UI wires post-run footer controls', () => {
    const overlay = read('src/site00/components/designBench/opusDirect/PageConceptGenerationOverlay.tsx');
    expect(overlay).toContain('postRunPrimaryAction');
    expect(read('shared/site00-design-workspace-production/pageConceptPipeline/pageConceptPostRunControls.ts')).toContain(
      'page-concept-view-renditions',
    );
    const panel = read('src/site00/components/designBench/pageConceptGenerator/PageConceptGeneratorPanel.tsx');
    expect(panel).toContain('page-concept-post-run-more');
    expect(panel).toContain('MORE ▾');
    expect(panel).toContain('postRunPrimaryAction');
  });
});
