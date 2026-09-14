import type { DesignPageAuthorityReviewSession } from '../p0vrTwinV30/types.js';
import { isMobileTwinPackageApprovalConfirmed } from './confirmMobileTwinPackageApproval.js';

/** True when founder may run BUILD TWIN DESIGN ROUTE (package frozen). */
export function shouldShowBuildTwinDesignRoute(session: DesignPageAuthorityReviewSession): boolean {
  if (isMobileTwinPackageApprovalConfirmed(session)) return true;
  const pipeline = session.mobileTwinPipeline;
  if (!pipeline?.latestPackageId) return false;
  const pkg = pipeline.packages.find((p) => p.id === pipeline.latestPackageId);
  if (pkg?.status === 'APPROVED') return true;
  const slice = pipeline.mobileTwinImplementation?.packageApprovalStatus;
  return slice === 'CONFIRMED' || slice === 'LOCAL_ONLY' || slice === 'PERSIST_FAILED';
}
