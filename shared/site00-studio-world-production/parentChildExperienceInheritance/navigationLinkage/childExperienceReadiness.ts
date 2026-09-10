/**
 * ChildExperienceReadiness — CURRENT only when visual + wiring pass.
 */

import type { ChildExperienceReadiness, ParentChildLinkageContract } from './types.js';
import type { ChildConvergencePlan } from '../types.js';

export function deriveChildExperienceReadiness(input: {
  childRoute: string;
  childSurfaceId: string;
  convergencePlan?: ChildConvergencePlan;
  linkageContracts: ParentChildLinkageContract[];
  inheritancePassed?: boolean;
  functionalQAPassed?: boolean;
}): ChildExperienceReadiness {
  const inheritancePassed = input.inheritancePassed ?? (input.convergencePlan?.migrationRisk !== 'BLOCKED');
  const linkageForChild = input.linkageContracts.filter(
    (c) => c.targetChildRoute === input.childRoute || c.targetSurfaceId === input.childSurfaceId,
  );
  const incomingLinkage = input.linkageContracts.filter(
    (c) => c.targetChildRoute.includes(input.childRoute) || c.targetSurfaceId === input.childSurfaceId,
  );

  const linkagePassed =
    incomingLinkage.length > 0 &&
    incomingLinkage.every((c) => c.status === 'WIRED' || c.status === 'PERMISSION_GATED' || c.status === 'EXEMPT');

  const hasReturnGap = linkageForChild.some((c) => c.errors.includes('CHILD_RETURN_PATH_MISSING'));

  const experienceInheritanceStatus = inheritancePassed ? 'PASS' : 'FAIL';
  const navigationLinkageStatus = linkagePassed && !hasReturnGap ? 'PASS' : linkagePassed ? 'FAIL' : 'FAIL';
  const functionalQAStatus = input.functionalQAPassed === false ? 'FAIL' : input.functionalQAPassed ? 'PASS' : 'NOT_RUN';

  let derivedStatus: ChildExperienceReadiness['derivedStatus'] = 'PARTIAL';
  if (experienceInheritanceStatus === 'PASS' && navigationLinkageStatus === 'PASS' && functionalQAStatus !== 'FAIL') {
    derivedStatus = functionalQAStatus === 'PASS' ? 'CURRENT' : 'PARTIAL';
  } else if (experienceInheritanceStatus === 'PASS' && navigationLinkageStatus === 'FAIL') {
    derivedStatus = 'VISUAL_ONLY';
  } else if (experienceInheritanceStatus === 'FAIL' && navigationLinkageStatus === 'PASS') {
    derivedStatus = 'WIRED_ONLY';
  } else if (experienceInheritanceStatus === 'FAIL' && navigationLinkageStatus === 'FAIL') {
    derivedStatus = 'BROKEN';
  }

  return {
    childRoute: input.childRoute,
    childSurfaceId: input.childSurfaceId,
    experienceInheritanceStatus,
    navigationLinkageStatus,
    functionalQAStatus,
    derivedStatus,
  };
}

export function childMayReportCurrent(readiness: ChildExperienceReadiness): boolean {
  return readiness.derivedStatus === 'CURRENT';
}
