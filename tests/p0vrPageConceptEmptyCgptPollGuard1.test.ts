import { describe, expect, it } from 'vitest';

import { pageConceptGenerationStateHasReadyMobileArtifacts } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGalleryHydration.js';
import {
  pageConceptServerRunIsEmptyInFlightCgpt,
  shouldIgnorePollServerRunSnapshotOverLocalGallery,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptServerRun.js';
import type { PageConceptGenerationState } from '../shared/site00-design-workspace-production/pageConceptPipeline/types.js';

describe('empty CGPT poll must not clobber READY mobile gallery', () => {
  it('detects orphan empty CGPT run', () => {
    expect(
      pageConceptServerRunIsEmptyInFlightCgpt({
        jobs: [],
        status: 'CGPT_RUNNING',
        generationStatus: 'CGPT_RUNNING',
      }),
    ).toBe(true);
  });

  it('ignores poll when local has READY mobile', () => {
    const local = {
      generationJobs: [
        {
          provider: 'GPT2_MOBILE',
          status: 'READY',
          artifactId: 'pcga-a',
        },
      ],
      pipelineSet: {
        pipelineLineage: 'GPT2_VIEWPORT_FAMILY_TWIN_PIPELINE',
        mobileConcepts: [{ conceptId: 'a', status: 'READY', artifactId: 'pcga-a' }],
      },
      generationStatus: 'GPT2_MOBILE_AWAITING_SELECTION',
    } as unknown as PageConceptGenerationState;
    expect(pageConceptGenerationStateHasReadyMobileArtifacts(local)).toBe(true);
    expect(
      shouldIgnorePollServerRunSnapshotOverLocalGallery(local, {
        jobs: [],
        status: 'CGPT_RUNNING',
        generationStatus: 'CGPT_RUNNING',
      }),
    ).toBe(true);
  });
});
