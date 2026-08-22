/**
 * Core Direction extraction helpers — docs/site00/CORE_DIRECTION_METHODOLOGY.md §6.
 * extractCoreDna() is a pure function; callers are responsible for only invoking it
 * once a territory has actually reached CORE_DIRECTION_APPROVED (see
 * coreDirectionGateStatus() in types.ts and promoteVisualDnaToApproved() in
 * visualDnaContract.ts, which is the one canonical, gated call site for NDXBOOK).
 */

import { branchPassesLineageTest } from './types.js';
import type { CoreDNA, CreativeTerritory } from './types.js';

/** Extracts the expansion grammar from an approved Core Direction Board + its lineage-tested branches. */
export function extractCoreDna(territory: CreativeTerritory): CoreDNA {
  const cd = territory.coreDirection;
  const approvedBranches = territory.branchLineage.filter(branchPassesLineageTest);

  return {
    conceptRules: [cd.bigIdea, cd.oneLineThesis, cd.brandConnection],
    visualRules: [cd.visualMetaphor, cd.governingBehavior, ...territory.visualPrinciples],
    compositionRules: [territory.compositionBehavior, territory.informationHierarchy],
    imageRules: [cd.materialImageryLanguage, territory.imageLanguage],
    materialRules: [cd.materialImageryLanguage],
    typographyRules: [cd.typographicAttitude, ...Object.values(territory.typographyLogic)],
    colorRules: [cd.coreColorLogic, ...Object.values(territory.colorLogic)],
    motionRules: [territory.motionBehavior],
    contentBehavior: approvedBranches.map((b) => `${b.branchName}: ${b.primaryBehavior}`),
    signatureDevices: [...cd.signatureDevices, ...territory.graphicLanguage],
    prohibitedDrift: cd.antiDirection,
  };
}

/** True only when every declared branch for this territory legitimately traces back to the Core Concept. */
export function allBranchesPassLineageTest(territory: CreativeTerritory): boolean {
  return territory.branchLineage.length > 0 && territory.branchLineage.every(branchPassesLineageTest);
}
