import { describe, expect, it } from 'vitest';
import {
  applyOneTimeFounderAuthorityInjection,
  createDesignPageAuthorityReviewSession,
  ensureMobileDesignReferenceAuthority,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/index.js';
import { emptyMobileTwinPipelineState } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/types.js';
import type { MobileDesignReferenceAuthority } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/types.js';

describe('ensureMobileDesignReferenceAuthority', () => {
  it('accepts locked designReference when mobileMaster missing from authority pipeline', () => {
    const ref: MobileDesignReferenceAuthority = {
      id: 'mdra-test',
      projectId: 'ndxbook',
      workspaceType: 'DESIGN_PAGE_V3',
      viewport: 'MOBILE',
      sourceAuthorityId: 'vma-test',
      sourceImageId: 'img-test',
      sourceImageHash: 'hash-test',
      sourceImageUri: '/assets/test-reference.jpg',
      featureManifestVersion: 'v1',
      projectCreativeContextVersion: 'ndxbook',
      founderApproved: true,
      approvedAt: new Date().toISOString(),
      status: 'REFERENCE_LOCKED',
      version: 1,
    };
    const session = {
      ...createDesignPageAuthorityReviewSession({ projectId: 'ndxbook' }),
      authorityPipeline: {
        ...applyOneTimeFounderAuthorityInjection(createDesignPageAuthorityReviewSession({ projectId: 'ndxbook' }))
          .authorityPipeline!,
        mobileMaster: null,
      },
      mobileTwinPipeline: {
        ...emptyMobileTwinPipelineState(),
        designReference: ref,
      },
    };
    const next = ensureMobileDesignReferenceAuthority(session);
    expect(next.mobileTwinPipeline?.designReference?.status).toBe('REFERENCE_LOCKED');
    expect(next.mobileTwinPipeline?.designReference?.sourceImageUri).toBe(ref.sourceImageUri);
  });
});
