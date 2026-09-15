import { describe, expect, it } from 'vitest';
import {
  applyOneTimeFounderAuthorityInjection,
  createDesignPageAuthorityReviewSession,
  ensureMobileDesignReferenceAuthority,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/index.js';
import {
  applyFounderCanonicalLightBlueprintMount,
  NDXBOOK_MOBILE_LIGHT_TECHNICAL_BLUEPRINT_MOUNT,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/ndxbookLightBlueprintMount.js';
import { emptyMobileTwinPipelineState } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/types.js';
import { resolveMobileTwinReviewSlots } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/hydrateMobileTwinReviewState.js';

describe('founder canonical light blueprint mount', () => {
  it('replaces active blueprint twin URI on NDXBOOK', () => {
    let session = applyOneTimeFounderAuthorityInjection(createDesignPageAuthorityReviewSession({ projectId: 'ndxbook' }));
    session = ensureMobileDesignReferenceAuthority({
      ...session,
      mobileTwinPipeline: {
        ...emptyMobileTwinPipelineState(),
        falJobsDispatched: 2,
        activeRenderId: 'render-1',
        activeAtomicRunId: 'run-1',
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
        renders: [
          {
            id: 'render-1',
            compositionStateId: 'comp-1',
            compositionHash: 'h',
            referenceAuthorityId: 'ref',
            renderImageUri: 'https://fal.media/actual.png',
            renderImageHash: 'x',
            widthPx: 390,
            heightPx: 844,
            provider: 'FAL',
            providerJobRef: 'actual',
            status: 'FOUNDER_REVIEW',
            createdAt: new Date().toISOString(),
          },
        ],
        blueprintTwins: [
          {
            id: 'bp-1',
            implementationRenderId: 'render-1',
            compositionStateId: 'comp-1',
            compositionHash: 'h',
            twinImageUri: 'https://fal.media/dark-blueprint.png',
            twinImageHash: 'y',
            provider: 'FAL',
            providerJobRef: 'bp',
            outputRepresentationMode: 'TECHNICAL_BLUEPRINT_RENDER',
            blueprintVisualVariant: 'ACTIVE_BLUEPRINT_TWIN',
            createdAt: new Date().toISOString(),
          },
        ],
      },
    });

    const pipe = applyFounderCanonicalLightBlueprintMount(session.mobileTwinPipeline!, 'ndxbook');
    const slots = resolveMobileTwinReviewSlots(pipe);
    expect(slots.blueprintTwin?.twinImageUri).toBe(NDXBOOK_MOBILE_LIGHT_TECHNICAL_BLUEPRINT_MOUNT);
    expect(slots.blueprintTwin?.outputRepresentationMode).toBe('LIGHT_TECHNICAL_BLUEPRINT');
    expect(slots.blueprintTwin?.blueprintStyleStatus).toBe('PASS');
  });
});
