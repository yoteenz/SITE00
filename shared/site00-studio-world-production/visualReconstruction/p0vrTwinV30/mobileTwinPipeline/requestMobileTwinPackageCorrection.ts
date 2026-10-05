import type { DesignPageAuthorityReviewSession } from '../types.js';

export type MobileTwinPackageCorrectionReason =
  | 'VISUAL_TWIN_ISSUE'
  | 'BLUEPRINT_ISSUE'
  | 'OBJECT_MAP_ISSUE'
  | 'ASSET_ISSUE'
  | 'FUNCTION_ISSUE'
  | 'OWNERSHIP_ISSUE'
  | 'TRACEABILITY_ISSUE'
  | 'OTHER';

export type MobileTwinPackageCorrectionRequest = {
  id: string;
  packageId: string;
  reason: MobileTwinPackageCorrectionReason;
  note: string;
  createdAt: string;
  status: 'OPEN';
};

/** Record founder correction intent — does not regenerate or dispatch providers. */
export function requestMobileTwinPackageCorrection(
  session: DesignPageAuthorityReviewSession,
  input: { reason: MobileTwinPackageCorrectionReason; note?: string },
): DesignPageAuthorityReviewSession {
  const pipeline = session.mobileTwinPipeline;
  if (!pipeline?.latestPackageId) throw new Error('MOBILE_TWIN_PACKAGE_NOT_READY');
  const pkg = pipeline.packages.find((p) => p.id === pipeline.latestPackageId);
  if (!pkg) throw new Error('MOBILE_TWIN_PACKAGE_NOT_READY');

  const id = `mtpcr-${Date.now()}`;
  const request: MobileTwinPackageCorrectionRequest = {
    id,
    packageId: pkg.id,
    reason: input.reason,
    note: input.note?.trim() ?? '',
    createdAt: new Date().toISOString(),
    status: 'OPEN',
  };

  return {
    ...session,
    mobileTwinPipeline: {
      ...pipeline,
      artifactsById: {
        ...pipeline.artifactsById,
        [id]: request,
      },
    },
    updatedAt: new Date().toISOString(),
  };
}
