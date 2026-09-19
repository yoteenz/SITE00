import { describe, expect, it } from 'vitest';
import { createDesignPageAuthorityReviewSession } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/index.js';
import {
  mergeMobileTwinFalApiResponse,
  stripSessionForMobileTwinFalRequest,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/mergeMobileTwinFalApiResponse.js';
import { emptyMobileTwinPipelineState } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/types.js';

describe('mergeMobileTwinFalApiResponse', () => {
  it('strips gallery bulk from request and merges pipeline on response', () => {
    const client = createDesignPageAuthorityReviewSession({ projectId: 'ndxbook' });
    client.territoryGallery = {
      A: [{ id: 'c1', territoryId: 'A', batchGeneration: 1, imageUri: 'x', promptHash: 'h', createdAt: '' }],
      B: [],
      C: [],
    };
    const stripped = stripSessionForMobileTwinFalRequest(client);
    expect(stripped.territoryGallery.A).toHaveLength(0);

    const serverPipeline = {
      ...emptyMobileTwinPipelineState(),
      falJobsDispatched: 2,
      focusedHybridBenchmark: {
        benchmarkId: 't1',
        status: 'FOUNDER_REVIEW_READY',
      } as never,
    };
    const merged = mergeMobileTwinFalApiResponse(client, serverPipeline, '2026-01-01T00:00:00.000Z');
    expect(merged.mobileTwinPipeline?.falJobsDispatched).toBe(2);
    expect(merged.territoryGallery.A).toHaveLength(1);
    expect(merged.updatedAt).toBe('2026-01-01T00:00:00.000Z');
  });
});
