import { describe, expect, it } from 'vitest';

import {
  resolveDesignHeroCompareCaptureDimensions,
  resolveHeroCompareConceptPreviewSrc,
} from '../shared/site00-design-workspace-production/designHeroComparePresentation.js';
import type { PageConceptCandidate } from '../shared/site00-design-workspace-production/designProjectBinding/designPageConceptModel.js';
import type { PageConceptGenerationState } from '../shared/site00-design-workspace-production/pageConceptPipeline/types.js';

function mobileCandidate(overrides: Partial<PageConceptCandidate>): PageConceptCandidate {
  return {
    conceptId: 'mc-a',
    projectId: 'ndxbook',
    pageId: 'overview',
    conceptTitle: 'Concept A',
    conceptTerritory: 'T',
    creativeRationale: 'R',
    visualReference: 'https://cdn.test/stale-a.png',
    mobileVisualReference: 'https://cdn.test/stale-a.png',
    desktopVisualReference: null,
    gpt2AuthorityConceptId: null,
    creativeInjectionId: null,
    generatedBy: 'GPT2',
    createdAt: '2026-09-25T10:00:00.000Z',
    lineage: { creativeTerritories: [] },
    status: 'CANDIDATE',
    viewportScope: 'MOBILE',
    runId: 'run-1',
    artifactId: 'art-old-a',
    conceptSlot: 'MOBILE_CONCEPT_A',
    pipelineId: 'GPT2_VIEWPORT_FAMILY_TWIN_PIPELINE',
    artifactStatus: 'READY',
    runGroup: 'CURRENT',
    runLabel: 'A',
    artifactRole: 'MOBILE_CANDIDATE',
    galleryFilterStatus: 'CANDIDATE',
    ...overrides,
  };
}

describe('designHeroComparePresentation', () => {
  it('resolveDesignHeroCompareCaptureDimensions uses mobile 390×844', () => {
    expect(resolveDesignHeroCompareCaptureDimensions('MOBILE')).toEqual({ width: 390, height: 844 });
  });

  it('resolveHeroCompareConceptPreviewSrc prefers latest READY job over stale gallery URI', () => {
    const concept = mobileCandidate({});
    const generationState = {
      generationJobs: [
        {
          artifactId: 'art-new-a',
          imageUri: 'https://cdn.test/fresh-a.png',
          provider: 'GPT2_MOBILE',
          viewport: 'MOBILE',
          status: 'READY',
          createdAt: '2026-09-25T12:00:00.000Z',
          renditionSlot: 'RENDITION_A',
        },
      ],
    } as unknown as PageConceptGenerationState;

    const src = resolveHeroCompareConceptPreviewSrc({
      concept,
      viewport: 'MOBILE',
      generationState,
    });
    expect(src).toContain('fresh-a.png');
    expect(src).toContain('artifact=art-new-a');
    expect(src).not.toContain('stale-a');
  });
});
