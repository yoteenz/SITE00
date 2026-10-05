import { describe, expect, it } from 'vitest';

import {
  formatPageConceptGalleryMountDebugLine,
  samplePageConceptGalleryImageHost,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGalleryMountDebug.js';
import type { PageConceptGenerationState } from '../shared/site00-design-workspace-production/pageConceptPipeline/types.js';

const baseState = (): PageConceptGenerationState => ({
  projectId: 'ndxbook',
  pageId: 'overview',
  generationStatus: 'GPT2_MOBILE_AWAITING_SELECTION',
  activeGenerationRunId: 'pcgr-1',
  activeGenerationStage: null,
  activeReviewRunId: null,
  generationJobs: [],
  pipelineSet: null,
  archivedRuns: [],
  cgptSubsteps: null,
  liveProgress: null,
  lastFailure: null,
});

describe('pageConceptGalleryMountDebug', () => {
  it('reports HTTPS image host from ready mobile jobs', () => {
    const state = baseState();
    state.generationJobs = [
      {
        artifactId: 'a',
        provider: 'GPT2_MOBILE',
        status: 'READY',
        createdAt: '2026-09-27T00:00:00.000Z',
        viewport: 'MOBILE',
        imageUri: 'https://cdn.example.com/concept.png',
      } as PageConceptGenerationState['generationJobs'][number],
    ];
    expect(samplePageConceptGalleryImageHost(state)).toBe('cdn.example.com');
    const line = formatPageConceptGalleryMountDebugLine({
      trace: { phase: 'applied', runId: 'pcgr-1' },
      generationState: state,
      persistedServerRunId: 'pcgr-1',
    });
    expect(line).toContain('pcgr-1');
    expect(line).toContain('cdn.example.com');
  });
});
