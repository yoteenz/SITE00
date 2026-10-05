import { describe, expect, it } from 'vitest';

import type { PageConceptGenerationState } from '../shared/site00-design-workspace-production/pageConceptPipeline/types.js';
import type { PageConceptServerRunSnapshot } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptServerRun.js';
import {
  pageConceptServerRunHasReadyMobileGallery,
  shouldReplaceLocalPageConceptStateWithServerRun,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGalleryServerHydration.js';

function localState(jobs: PageConceptGenerationState['generationJobs']): PageConceptGenerationState {
  return {
    targetType: 'PAGE',
    projectId: 'ndxbook',
    pageId: 'overview',
    generationStatus: 'IDLE',
    generationJobs: jobs,
    pipelineSet: null,
    activeGenerationRunId: 'pcgr-old',
  } as PageConceptGenerationState;
}

function serverRun(partial: Partial<PageConceptServerRunSnapshot>): PageConceptServerRunSnapshot {
  return {
    runId: 'pcgr-new',
    projectId: 'ndxbook',
    pageId: 'overview',
    status: 'READY_FOR_REVIEW',
    currentStage: null,
    cgptStatus: 'COMPLETE',
    gpt2Status: 'COMPLETE',
    nbpStatus: 'COMPLETE',
    cgptMeta: null,
    panelProgress: null,
    cgptSubsteps: null,
    dryRun: false,
    error: null,
    generationStatus: 'GPT2_MOBILE_AWAITING_SELECTION',
    plan: null,
    pipelineSet: null,
    jobs: [],
    updatedAt: '2026-09-25T22:00:00.000Z',
    completedAt: '2026-09-25T22:00:00.000Z',
    latestProgressSequence: 0,
    ...partial,
  };
}

describe('pageConceptGalleryServerHydration', () => {
  it('detects READY GPT2 mobile on server snapshot', () => {
    const run = serverRun({
      jobs: [
        {
          artifactId: 'a1',
          provider: 'GPT2_MOBILE',
          status: 'READY',
          createdAt: '2026-09-25T22:00:00.000Z',
        } as PageConceptServerRunSnapshot['jobs'][number],
      ],
    });
    expect(pageConceptServerRunHasReadyMobileGallery(run)).toBe(true);
  });

  it('replaces empty local gallery when server has READY mobile', () => {
    const local = localState([]);
    const run = serverRun({
      jobs: [
        {
          artifactId: 'a1',
          provider: 'GPT2_MOBILE',
          status: 'READY',
          createdAt: '2026-09-25T23:00:00.000Z',
        } as PageConceptServerRunSnapshot['jobs'][number],
      ],
    });
    expect(shouldReplaceLocalPageConceptStateWithServerRun(local, run)).toBe(true);
  });

  it('replaces stale local READY mobile when server run is newer', () => {
    const local = localState([
      {
        artifactId: 'old',
        provider: 'GPT2_MOBILE',
        status: 'READY',
        createdAt: '2026-09-20T12:00:00.000Z',
      } as PageConceptGenerationState['generationJobs'][number],
    ]);
    const run = serverRun({
      jobs: [
        {
          artifactId: 'new',
          provider: 'GPT2_MOBILE',
          status: 'READY',
          createdAt: '2026-09-25T23:00:00.000Z',
        } as PageConceptServerRunSnapshot['jobs'][number],
      ],
    });
    expect(shouldReplaceLocalPageConceptStateWithServerRun(local, run)).toBe(true);
  });

  it('prefers server gallery when run id differs (cross-origin sync policy)', () => {
    const local = localState([
      {
        artifactId: 'old',
        provider: 'GPT2_MOBILE',
        status: 'READY',
        createdAt: '2026-09-26T01:00:00.000Z',
      } as PageConceptGenerationState['generationJobs'][number],
    ]);
    const run = serverRun({
      runId: 'pcgr-newer-run',
      jobs: [
        {
          artifactId: 'server',
          provider: 'GPT2_MOBILE',
          status: 'READY',
          createdAt: '2026-09-25T20:00:00.000Z',
        } as PageConceptServerRunSnapshot['jobs'][number],
      ],
    });
    expect(shouldReplaceLocalPageConceptStateWithServerRun(local, run, { preferServerGallery: true })).toBe(true);
  });

  it('keeps local when server run is older than local artifacts', () => {
    const local = localState([
      {
        artifactId: 'new-local',
        provider: 'GPT2_MOBILE',
        status: 'READY',
        createdAt: '2026-09-26T01:00:00.000Z',
      } as PageConceptGenerationState['generationJobs'][number],
    ]);
    const run = serverRun({
      runId: 'pcgr-old-server',
      jobs: [
        {
          artifactId: 'old-server',
          provider: 'GPT2_MOBILE',
          status: 'READY',
          createdAt: '2026-09-20T12:00:00.000Z',
        } as PageConceptServerRunSnapshot['jobs'][number],
      ],
      updatedAt: '2026-09-20T12:00:00.000Z',
    });
    expect(shouldReplaceLocalPageConceptStateWithServerRun(local, run)).toBe(false);
  });
});
