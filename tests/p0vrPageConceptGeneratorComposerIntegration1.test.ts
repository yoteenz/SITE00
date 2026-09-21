/**
 * P0.VR.PAGE-CONCEPT-GENERATOR-COMPOSER-INTEGRATION1
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  buildCgptBriefRows,
  buildNbpSlotPresentations,
  pageConceptHasFailedNbpJobs,
  pageConceptReviewReady,
  pageConceptStageStatesFromPipeline,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGeneratorBinding.js';
import { planPageNbpRenditions } from '../shared/site00-design-workspace-production/pageConceptPipeline/renditionPlanner.js';
import { mergePageConceptGenerationJobs } from '../shared/site00-design-workspace-production/pageConceptPipeline/generationWorkflow.js';
import type {
  PageConceptGeneratedArtifact,
  PageConceptGenerationState,
  PageCreativeInjection,
  PageGPT2AuthorityConcept,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/types.js';
import { appendPageCapture } from '../shared/site00-design-workspace-production/designPageCapture.js';
import { listSiteDesignPagesForProject } from '../shared/site00-design-workspace-production/designProjectBinding/index.js';
import {
  loadPageConceptGenerationState,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/store.js';
import { runPageConceptGeneration } from '../api/_lib/site00PageConcept/runPageConceptGeneration.js';
import * as cgpt from '../api/_lib/site00PageConcept/generatePageCreativeInjection.js';
import * as gpt2 from '../api/_lib/site00PageConcept/generatePageGpt2AuthorityConcept.js';
import * as nbp from '../api/_lib/site00PageConcept/renderPageNbpJob.js';

const ROOT = join(import.meta.dirname, '..');
const read = (rel: string) => readFileSync(join(ROOT, rel), 'utf8');

class MemoryStorage implements Storage {
  private store = new Map<string, string>();
  get length() {
    return this.store.size;
  }
  clear() {
    this.store.clear();
  }
  getItem(key: string) {
    return this.store.get(key) ?? null;
  }
  key(index: number) {
    return [...this.store.keys()][index] ?? null;
  }
  removeItem(key: string) {
    this.store.delete(key);
  }
  setItem(key: string, value: string) {
    this.store.set(key, value);
  }
}

function baseState(): PageConceptGenerationState {
  return {
    projectId: 'ndxbook',
    pageId: 'page-overview',
    targetType: 'PAGE',
    generationStatus: 'IDLE',
    generationJobs: [],
    pipelineSet: null,
    history: [],
    projectContext: {
      projectId: 'ndxbook',
      contextVersion: 'v1',
      projectLabel: 'ndxbook',
    } as PageConceptGenerationState['projectContext'],
    pageContext: {
      pageId: 'page-overview',
      contextVersion: 'v1',
      pageLabel: 'overview',
    } as PageConceptGenerationState['pageContext'],
    functionContract: {
      contractId: 'fc-1',
      projectId: 'ndxbook',
      pageId: 'page-overview',
    } as PageConceptGenerationState['functionContract'],
  };
}

const injection: PageCreativeInjection = {
  injectionId: 'inj-1',
  creativeThesis: 'THESIS',
  pagePurposeInterpretation: 'PURPOSE',
  hierarchyDirection: 'HIER',
  spatialDirection: 'SPACE',
  creativeLatitude: 'LAT',
  informationPriority: 'INFO',
  visualOpportunity: 'VIS',
  imageDataBalance: 'BAL',
  responsiveDirection: 'RESP',
  mobileDirection: 'MOB',
  desktopDirection: 'DESK',
  immutableRequirements: ['REQ'],
  referenceStrategy: 'REF',
  assetStrategy: 'ASSET',
};

const gpt2Concept: PageGPT2AuthorityConcept = {
  conceptId: 'gpt2-1',
  injectionId: 'inj-1',
  name: 'Concept Alpha',
  premise: 'Premise line',
  visualLanguage: 'Visual',
  authorityArtifact: 'data:image/png;base64,xx',
};

describe('P0.VR.PAGE-CONCEPT-GENERATOR-COMPOSER-INTEGRATION1', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal('localStorage', new MemoryStorage());
    vi.stubGlobal('window', { localStorage, dispatchEvent: () => undefined });
  });

  it('CGPT stage binds to real pipeline state', () => {
    const state = { ...baseState(), generationStatus: 'CGPT_RUNNING' as const };
    expect(pageConceptStageStatesFromPipeline(state).CGPT).toBe('ACTIVE');
    const done = {
      ...state,
      generationStatus: 'GPT2_RUNNING' as const,
      pipelineSet: {
        pipelineSetId: 'p1',
        projectId: 'ndxbook',
        pageId: 'page-overview',
        targetType: 'PAGE' as const,
        captureSetId: 'c1',
        functionContractId: 'fc-1',
        creativeInjection: injection,
        gpt2AuthorityConcept: null,
        renditions: [],
        createdAt: new Date().toISOString(),
      },
    };
    expect(pageConceptStageStatesFromPipeline(done).CGPT).toBe('COMPLETE');
    expect(buildCgptBriefRows(injection).length).toBeGreaterThan(0);
  });

  it('GPT2 cannot start before CGPT complete (stage map)', () => {
    const runningCgpt = { ...baseState(), generationStatus: 'CGPT_RUNNING' as const };
    expect(pageConceptStageStatesFromPipeline(runningCgpt).GPT2).toBe('PENDING');
    const failedCgpt = {
      ...baseState(),
      generationStatus: 'FAILED' as const,
      pipelineSet: {
        pipelineSetId: 'p1',
        projectId: 'ndxbook',
        pageId: 'page-overview',
        targetType: 'PAGE' as const,
        captureSetId: 'c1',
        functionContractId: 'fc-1',
        creativeInjection: null,
        gpt2AuthorityConcept: null,
        renditions: [],
        creativeInjectionError: 'CGPT_FAIL',
        createdAt: new Date().toISOString(),
      },
    };
    expect(pageConceptStageStatesFromPipeline(failedCgpt).GPT2).toBe('NOT_STARTED');
  });

  it('NBP cannot start before GPT2 complete (stage map)', () => {
    const gpt2Running = {
      ...baseState(),
      generationStatus: 'GPT2_RUNNING' as const,
      pipelineSet: {
        pipelineSetId: 'p1',
        projectId: 'ndxbook',
        pageId: 'page-overview',
        targetType: 'PAGE' as const,
        captureSetId: 'c1',
        functionContractId: 'fc-1',
        creativeInjection: injection,
        gpt2AuthorityConcept: null,
        renditions: [],
        createdAt: new Date().toISOString(),
      },
    };
    expect(pageConceptStageStatesFromPipeline(gpt2Running).NBP).toBe('PENDING');
  });

  it('plans exactly one GPT2 and three NBP rendition groups / six viewport outputs', () => {
    expect(planPageNbpRenditions()).toHaveLength(3);
    const slots = buildNbpSlotPresentations({ ...baseState(), generationJobs: [] });
    expect(slots).toHaveLength(6);
    expect(slots.filter((s) => s.viewport === 'MOBILE')).toHaveLength(3);
    expect(slots.filter((s) => s.viewport === 'DESKTOP')).toHaveLength(3);
  });

  it('progression UI helper matches backend review statuses', () => {
    expect(pageConceptReviewReady('READY_FOR_FOUNDER_REVIEW')).toBe(true);
    expect(pageConceptReviewReady('PARTIAL_GENERATION')).toBe(true);
    expect(pageConceptReviewReady('CGPT_RUNNING')).toBe(false);
    const review = {
      ...baseState(),
      generationStatus: 'READY_FOR_FOUNDER_REVIEW' as const,
      pipelineSet: {
        pipelineSetId: 'p1',
        projectId: 'ndxbook',
        pageId: 'page-overview',
        targetType: 'PAGE' as const,
        captureSetId: 'c1',
        functionContractId: 'fc-1',
        creativeInjection: injection,
        gpt2AuthorityConcept: gpt2Concept,
        renditions: [],
        createdAt: new Date().toISOString(),
      },
    };
    expect(pageConceptStageStatesFromPipeline(review).NBP).toBe('COMPLETE');
  });

  it('partial NBP failure preserves successes and retry merges jobs', () => {
    const jobs: PageConceptGeneratedArtifact[] = [
      {
        artifactId: 'pcga-RENDITION_A-MOBILE',
        projectId: 'ndxbook',
        pageId: 'page-overview',
        renditionSlot: 'RENDITION_A',
        viewport: 'MOBILE',
        status: 'READY',
        imageUri: 'data:image/png;base64,a',
      } as PageConceptGeneratedArtifact,
      {
        artifactId: 'pcga-RENDITION_A-DESKTOP',
        projectId: 'ndxbook',
        pageId: 'page-overview',
        renditionSlot: 'RENDITION_A',
        viewport: 'DESKTOP',
        status: 'FAILED',
        failureReason: 'NBP_FAIL',
      } as PageConceptGeneratedArtifact,
    ];
    const merged = mergePageConceptGenerationJobs({ ...baseState(), generationJobs: jobs.slice(0, 1) }, jobs);
    expect(merged.generationJobs).toHaveLength(2);
    expect(pageConceptHasFailedNbpJobs({ ...baseState(), generationJobs: jobs })).toBe(true);
  });

  it('provider spend blocked before confirmation', async () => {
    await expect(
      runPageConceptGeneration({
        state: baseState(),
        founderConfirmedSpend: false,
        mobileCapture: { captureId: 'm', width: 390, height: 844, artifactBase64: 'aa' },
        desktopCapture: { captureId: 'd', width: 1440, height: 900, artifactBase64: 'bb' },
      }),
    ).rejects.toThrow(/SPEND_GUARD/);
  });

  it('retry failed only skips successful CGPT/GPT2', async () => {
    const overview = listSiteDesignPagesForProject('ndxbook').find((p) => p.screenId === 'overview');
    if (!overview) throw new Error('overview missing');
    appendPageCapture({
      projectId: 'ndxbook',
      pageId: overview.pageId,
      screenId: 'overview',
      route: '/projects/design/ndxbook/overview',
      captureId: 'cap-m-retry',
      viewport: 'MOBILE',
      artifactPath: 'data:image/png;base64,aaaa',
      timestamp: new Date().toISOString(),
      buildVersion: 'vitest',
      createdBy: 'vitest',
      source: 'LOCAL_FALLBACK',
    });
    appendPageCapture({
      projectId: 'ndxbook',
      pageId: overview.pageId,
      screenId: 'overview',
      route: '/projects/design/ndxbook/overview',
      captureId: 'cap-d-retry',
      viewport: 'DESKTOP',
      artifactPath: 'data:image/png;base64,bbbb',
      timestamp: new Date().toISOString(),
      buildVersion: 'vitest',
      createdBy: 'vitest',
      source: 'LOCAL_FALLBACK',
    });

    vi.spyOn(cgpt, 'generatePageCreativeInjection').mockRejectedValue(new Error('SHOULD_NOT_RUN'));
    vi.spyOn(gpt2, 'generatePageGpt2AuthorityConcept').mockRejectedValue(new Error('SHOULD_NOT_RUN'));
    vi.spyOn(nbp, 'renderPageNbpJob').mockResolvedValue({
      imageBase64: 'cccc',
      providerJobId: 'nbp-1',
    });

    const readyJob: PageConceptGeneratedArtifact = {
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
      imageUri: 'data:image/png;base64,keep',
      width: 390,
      height: 844,
    };

    const loaded = loadPageConceptGenerationState('ndxbook', overview.pageId);
    const state: PageConceptGenerationState = {
      ...loaded,
      pipelineSet: {
        pipelineSetId: 'p1',
        projectId: 'ndxbook',
        pageId: overview.pageId,
        targetType: 'PAGE',
        captureSetId: 'c1',
        functionContractId: loaded.functionContract?.contractId ?? 'fc-1',
        creativeInjection: injection,
        gpt2AuthorityConcept: gpt2Concept,
        renditions: [],
        createdAt: new Date().toISOString(),
      },
      generationJobs: [readyJob],
    };

    const result = await runPageConceptGeneration({
      state,
      founderConfirmedSpend: true,
      retryFailedOnly: true,
      mobileCapture: { captureId: 'm', width: 390, height: 844, artifactBase64: 'aa' },
      desktopCapture: { captureId: 'd', width: 1440, height: 900, artifactBase64: 'bb' },
    });

    expect(cgpt.generatePageCreativeInjection).not.toHaveBeenCalled();
    expect(gpt2.generatePageGpt2AuthorityConcept).not.toHaveBeenCalled();
    const kept = result.jobs.find((j) => j.artifactId === 'pcga-RENDITION_A-MOBILE');
    expect(kept?.status).toBe('READY');
    expect(kept?.imageUri).toContain('keep');
  });

  it('overlay wires binding, results, spend gate, retry, persistence hooks', () => {
    const overlay = read('src/site00/components/designBench/opusDirect/PageConceptGenerationOverlay.tsx');
    expect(overlay).toContain('sourceCaptureLines');
    const panel = read('src/site00/components/designBench/pageConceptGenerator/PageConceptGeneratorPanel.tsx');
    expect(panel).toContain('page-concept-source-captures');
    expect(overlay).toContain('pageConceptStageStatesForPanel');
    expect(overlay).toContain('PageConceptGeneratorResults');
    expect(overlay).toContain('PageConceptGeneratorNbpStage');
    expect(overlay).toContain('onRetryFailed');
    expect(overlay).not.toContain('generatePageCreativeInjection');

    const hook = read('src/site00/components/designBench/opusDirect/usePageConceptGeneration.ts');
    expect(hook).toContain('retryFailedOnly: true');
    expect(hook).toContain('site00:page-concept-generation-updated');
    expect(hook).toContain("setOverlayMode('review')");
    expect(hook).not.toMatch(/setOverlayOpen\(false\).*success/i);

    const screen = read('src/site00/components/designBench/opusDirect/TwinOpusDirectScreen.tsx');
    expect(screen).toContain('generationState={workspace.pageConceptGeneration.generationState}');
    expect(screen).toContain('confirmNotice={workspace.pageConceptGeneration.confirmNotice}');
    expect(screen).toContain('retryFailedGeneration');

    expect(hook).toContain('generationEligibility');
    expect(hook).toContain('designPageCaptureEventMatches');
  });

  it('visual shell CSS/classes remain intact', () => {
    const panel = read('src/site00/components/designBench/pageConceptGenerator/PageConceptGeneratorPanel.tsx');
    expect(panel).toContain('s00-pcg');
    expect(panel).toContain('site00-page-concept-generator.css');
    const css = read('src/site00/styles/site00-page-concept-generator.css');
    expect(css).toContain('Martian Mono');
    expect(css).toContain('.s00-pcg__generate');
  });

  it('mobile swipe and desktop inspect hooks exist in NBP stage', () => {
    const nbpStage = read('src/site00/components/designBench/pageConceptGenerator/PageConceptGeneratorNbpStage.tsx');
    expect(nbpStage).toContain('onTouchStart');
    expect(nbpStage).toContain('sessionStorage');
    expect(nbpStage).toContain('NbpPreviewHero');
    expect(nbpStage).toContain('onInspect');
  });
});
