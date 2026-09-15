import { describe, expect, it } from 'vitest';
import { mergeMobileTwinFalApiResponse } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/mergeMobileTwinFalApiResponse.js';
import { createDesignPageAuthorityReviewSession } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/index.js';
import { emptyMobileTwinPipelineState } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/types.js';
import { resolveMobileTwinReviewSlots } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/hydrateMobileTwinReviewState.js';

describe('mergeMobileTwinFalApiResponse', () => {
  it('merges server blueprint URI when job count unchanged (light retry in place)', () => {
    const client = createDesignPageAuthorityReviewSession({ projectId: 'ndxbook' });
    const clientPipe = {
      ...emptyMobileTwinPipelineState(),
      falJobsDispatched: 4,
      activeAtomicRunId: 'run-1',
      activeRenderId: 'render-1',
      atomicRuns: [
        {
          id: 'run-1',
          actualRenderArtifactId: 'render-1',
          blueprintRenderArtifactId: 'bp-1',
          status: 'RECONCILING',
          packageId: null,
          visualPairId: null,
          actualRenderJobId: 'a',
          blueprintRenderJobId: 'b',
          actualStatus: 'READY',
          blueprintStatus: 'READY',
          errorCodes: [],
          providerMetadata: {},
          providerJobRecords: [],
          costRecords: [],
          createdAt: new Date().toISOString(),
          completedAt: null,
        },
      ],
      blueprintTwins: [
        {
          id: 'bp-1',
          implementationRenderId: 'render-1',
          compositionStateId: 'c1',
          compositionHash: 'h',
          twinImageUri: 'https://fal.media/old-dark.png',
          twinImageHash: 'old',
          provider: 'FAL',
          providerJobRef: 'old',
          createdAt: new Date().toISOString(),
        },
      ],
    };
    const serverPipe = {
      ...clientPipe,
      blueprintTwins: [
        {
          ...clientPipe.blueprintTwins[0]!,
          twinImageUri: 'https://fal.media/new-light.png',
          twinImageHash: 'new',
          outputRepresentationMode: 'LIGHT_TECHNICAL_BLUEPRINT' as const,
          blueprintStyleStatus: 'PASS' as const,
        },
      ],
    };

    const merged = mergeMobileTwinFalApiResponse(
      { ...client, mobileTwinPipeline: clientPipe },
      serverPipe,
      new Date().toISOString(),
    );
    const slots = resolveMobileTwinReviewSlots(merged.mobileTwinPipeline!);
    expect(slots.blueprintTwin?.twinImageUri).toBe('https://fal.media/new-light.png');
  });
});
