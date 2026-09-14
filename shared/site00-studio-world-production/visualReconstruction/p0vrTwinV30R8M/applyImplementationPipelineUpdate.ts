import type { DesignPageAuthorityReviewSession } from '../p0vrTwinV30/types.js';
import { mobileTwinTwinPreviewRoute } from './constants.js';
import type {
  MobileTwinImplementationBuildRecord,
  MobileTwinImplementationSessionSlice,
  MobileTwinImplementationStateStatus,
  MobileTwinPackageApprovalRecord,
  MobileTwinPromotionReadinessReceipt,
} from './types.js';

export function mergeMobileTwinImplementationSlice(
  session: DesignPageAuthorityReviewSession,
  patch: Partial<MobileTwinImplementationSessionSlice>,
): DesignPageAuthorityReviewSession {
  const pipeline = session.mobileTwinPipeline;
  if (!pipeline) return session;
  const prev = pipeline.mobileTwinImplementation ?? {
    packageApprovalStatus: 'PENDING',
    backendPackageApprovalId: null,
    implementationStatus: 'NOT_STARTED',
    latestBuildId: null,
    latestImplementationVersion: null,
    previewRoute: null,
    promotionStatus: 'NOT_READY',
    history: [],
  };
  return {
    ...session,
    mobileTwinPipeline: {
      ...pipeline,
      mobileTwinImplementation: { ...prev, ...patch },
    },
  };
}

export function applyBackendPackageApproval(
  session: DesignPageAuthorityReviewSession,
  record: MobileTwinPackageApprovalRecord,
): DesignPageAuthorityReviewSession {
  const history = [...(session.mobileTwinPipeline?.mobileTwinImplementation?.history ?? []), 'PACKAGE APPROVED (DURABLE)'];
  return mergeMobileTwinImplementationSlice(session, {
    packageApprovalStatus: 'CONFIRMED',
    backendPackageApprovalId: record.id,
    implementationStatus: 'READY_TO_COMPILE',
    history,
  });
}

export function applyImplementationBuild(
  session: DesignPageAuthorityReviewSession,
  build: MobileTwinImplementationBuildRecord,
  promotion: MobileTwinPromotionReadinessReceipt,
): DesignPageAuthorityReviewSession {
  const status: MobileTwinImplementationStateStatus =
    promotion.status === 'PROMOTION_READY' ? 'PROMOTION_READY' : 'FOUNDER_IMPLEMENTATION_REVIEW';
  const history = [
    ...(session.mobileTwinPipeline?.mobileTwinImplementation?.history ?? []),
    `BUILD ${build.implementationVersion}`,
  ];
  return mergeMobileTwinImplementationSlice(session, {
    latestBuildId: build.id,
    latestImplementationVersion: build.implementationVersion,
    previewRoute: build.previewRoute || mobileTwinTwinPreviewRoute(session.projectId),
    implementationStatus: status,
    promotionStatus: promotion.status,
    history,
  });
}
