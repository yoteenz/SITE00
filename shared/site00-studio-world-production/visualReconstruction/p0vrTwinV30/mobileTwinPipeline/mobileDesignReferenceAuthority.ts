import type { DesignPageAuthorityReviewSession } from '../types.js';
import type { ViewportMasterAuthority } from '../designWorkspaceAuthorityTypes.js';
import type { MobileDesignReferenceAuthority } from './types.js';
import { emptyMobileTwinPipelineState } from './types.js';

export function mobileMasterToDesignReference(master: ViewportMasterAuthority): MobileDesignReferenceAuthority {
  if (master.viewport !== 'MOBILE') throw new Error('DESKTOP_SCOPE_VIOLATION');
  return {
    id: `mdra-${master.id}`,
    projectId: master.projectId,
    workspaceType: 'DESIGN_PAGE_V3',
    viewport: 'MOBILE',
    sourceAuthorityId: master.id,
    sourceImageId: master.authorityImageId,
    sourceImageHash: master.authorityImageHash,
    sourceImageUri: master.authorityImageUri,
    featureManifestVersion: master.designWorkspaceFeatureManifestVersion,
    projectCreativeContextVersion: master.projectCreativeContextVersion,
    founderApproved: true,
    approvedAt: master.promotedAt,
    status: 'REFERENCE_LOCKED',
    version: 1,
  };
}

export function ensureMobileDesignReferenceAuthority(
  session: DesignPageAuthorityReviewSession,
): DesignPageAuthorityReviewSession {
  const pipeline = session.mobileTwinPipeline ?? emptyMobileTwinPipelineState();
  const lockedRef = pipeline.designReference?.status === 'REFERENCE_LOCKED' ? pipeline.designReference : null;

  const mobile = session.authorityPipeline?.mobileMaster;
  if (mobile) {
    const designReference = mobileMasterToDesignReference(mobile);
    return {
      ...session,
      mobileTwinPipeline: {
        ...pipeline,
        designReference,
      },
      updatedAt: new Date().toISOString(),
    };
  }

  if (lockedRef) {
    return {
      ...session,
      mobileTwinPipeline: {
        ...pipeline,
        designReference: lockedRef,
      },
    };
  }

  throw new Error('MOBILE_REFERENCE_MISSING');
}
