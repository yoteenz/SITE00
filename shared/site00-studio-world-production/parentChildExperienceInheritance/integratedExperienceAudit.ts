/**
 * Integrated PCI.1 + PCI.2 audit — child is CURRENT only when visual + wiring pass.
 */

import { runParentChildExperienceInheritance } from './parentChildExperienceInheritanceEngine.js';
import {
  runNavigationLinkageAudit,
  runSiteWideNavigationLinkageAudit,
} from './navigationLinkage/navigationLinkageAudit.js';
import { deriveChildExperienceReadiness, childMayReportCurrent } from './navigationLinkage/childExperienceReadiness.js';
import type { ParentChildInheritanceEngineInput } from './types.js';
import type { LinkageAuditInput, NavigationLinkageAuditResult } from './navigationLinkage/types.js';

export type IntegratedExperienceAuditResult = {
  inheritance: ReturnType<typeof runParentChildExperienceInheritance>;
  linkageAudits: NavigationLinkageAuditResult[];
  readiness: ReturnType<typeof deriveChildExperienceReadiness>[];
  branchCurrent: boolean;
  evaluatedAt: string;
};

export function runIntegratedExperienceAudit(input: {
  inheritance: ParentChildInheritanceEngineInput;
  linkageAudits?: LinkageAuditInput[];
  siteWideProjectSlug?: string;
}): IntegratedExperienceAuditResult {
  const inheritance = runParentChildExperienceInheritance(input.inheritance);

  const linkageAudits = input.linkageAudits
    ? input.linkageAudits.map((audit) => runNavigationLinkageAudit(audit))
    : input.siteWideProjectSlug
      ? runSiteWideNavigationLinkageAudit(input.siteWideProjectSlug)
      : [];

  const readiness = inheritance.convergencePlans.map((plan) =>
    deriveChildExperienceReadiness({
      childRoute: plan.childRoute,
      childSurfaceId: plan.childSurfaceId,
      convergencePlan: plan,
      linkageContracts: linkageAudits.flatMap((a) => a.contracts),
      inheritancePassed: inheritance.qaReport.passed,
      functionalQAPassed: linkageAudits.every((a) => a.passed),
    }),
  );

  const branchCurrent =
    inheritance.qaReport.passed &&
    linkageAudits.every((a) => a.passed) &&
    readiness.every((r) => childMayReportCurrent(r) || r.derivedStatus === 'PARTIAL');

  return {
    inheritance,
    linkageAudits,
    readiness,
    branchCurrent,
    evaluatedAt: new Date().toISOString(),
  };
}
