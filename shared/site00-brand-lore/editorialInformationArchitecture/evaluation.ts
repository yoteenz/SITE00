/**
 * Editorial artifact QA + failure states.
 */

import type {
  EditorialArtifactEvaluation,
  EditorialFailureState,
  FirstSlideArtDirectionContract,
  TypographyRoleAssignment,
} from './types.js';
import { evaluateArtifactDistances } from './distanceQA.js';
import { evaluateLimeUsage } from './limeGovernance.js';
import { multipleHandwritingIdentitiesFail } from './typographyGovernance.js';

export function evaluateEditorialArtifact(contract: FirstSlideArtDirectionContract): EditorialArtifactEvaluation {
  const failures: EditorialFailureState[] = [];
  const distance = evaluateArtifactDistances(contract);

  if (!contract.viewerShouldNoticeFirst) failures.push('FAIL_NO_PRIMARY_READ');
  if (contract.informationBudget.primaryHeadlineCount > 2) failures.push('FAIL_COMPETING_HEADLINES');
  if (!contract.informationBudget.withinBudget) failures.push('FAIL_INFORMATION_OVERLOAD');
  if (contract.informationBudget.fullResearchExplanations > 0 || contract.informationBudget.fullSourceLists > 0) {
    failures.push('FAIL_REPORT_ON_SLIDE_ONE');
  }
  if (!contract.readingPath.articulated) failures.push('FAIL_NO_READING_PATH');
  if (contract.informationBudget.primaryEvidenceObjects > 2) failures.push('FAIL_EVIDENCE_COMPETES_WITH_HOOK');
  if (contract.informationBudget.longParagraphs > 0) failures.push('FAIL_TOO_MUCH_MICROCOPY');

  const unknownRole = contract.typographyAssignments.some((a) => a.isNdxAuthored && !a.role);
  if (unknownRole) failures.push('FAIL_UNKNOWN_TYPOGRAPHY_ROLE');

  const mixedCase = contract.typographyAssignments.some(
    (a) => a.isNdxAuthored && a.uppercaseRequired && a.text !== a.text.toUpperCase(),
  );
  if (mixedCase) failures.push('FAIL_MIXED_CASE_NDX_COPY');

  if (contract.informationBudget.primaryTraceClusters > 1) failures.push('FAIL_TRACE_OVERLOAD');

  const limeEval = evaluateLimeUsage({
    limeFunction: contract.limeFunction,
    limeElementCount: contract.limeFunction ? 1 : 0,
  });
  if (limeEval.overused) failures.push('FAIL_LIME_OVERUSE');
  if (limeEval.decorativeOnly) failures.push('FAIL_DECORATIVE_LIME');

  if (!distance.grid.pass) failures.push('FAIL_GRID_ILLEGIBLE');
  if (!distance.feed.pass) failures.push('FAIL_FEED_ILLEGIBLE');
  if (!distance.inspection.rewardsInspection) failures.push('FAIL_NO_INSPECTION_REWARD');

  if (contract.textDensity.level === 'ARCHIVAL_DENSE') failures.push('FAIL_FIRST_SLIDE_CONTAINS_WHOLE_ARGUMENT');
  if (contract.informationBudget.violations.some((v) => /report|whole argument/i.test(v))) {
    failures.push('FAIL_AI_EDITORIAL_CLUTTER');
  }

  const handwritingStyles = contract.typographyAssignments
    .filter((a) => a.role === 'HUMAN_TRACE')
    .map((a) => a.text);
  if (multipleHandwritingIdentitiesFail(handwritingStyles)) {
    failures.push('FAIL_MULTIPLE_HANDWRITING_IDENTITIES');
  }

  const pass = failures.length === 0;

  return {
    evaluationId: `eia-eval-${contract.artifactId}`,
    artifactId: contract.artifactId,
    primaryIdeaClarity: pass ? 'PASS' : 'FAIL',
    readingPathClarity: contract.readingPath.articulated ? 'PASS' : 'FAIL',
    thumbnailLegibility: distance.grid.pass ? 'PASS' : 'FAIL',
    feedLegibility: distance.feed.pass ? 'PASS' : 'FAIL',
    inspectionReward: distance.inspection.rewardsInspection ? 'PASS' : 'FAIL',
    typographicCoherence: unknownRole || mixedCase ? 'FAIL' : 'PASS',
    uppercaseCompliance: mixedCase ? 'FAIL' : 'PASS',
    textDensity: contract.textDensity.firstSlideAllowed ? 'PASS' : 'FAIL',
    evidencePriority: contract.informationBudget.primaryEvidenceObjects <= 2 ? 'PASS' : 'FAIL',
    traceRestraint: contract.informationBudget.primaryTraceClusters <= 1 ? 'PASS' : 'FAIL',
    limeRestraint: limeEval.restrained ? 'PASS' : 'FAIL',
    makerPresence: contract.primaryTrace ? 'PASS' : 'PASS',
    characterPresence: 'PASS',
    artDirectionQuality: pass ? 'PASS' : 'FAIL',
    genericTemplateRisk: failures.includes('FAIL_SPARSE_BECOMES_GENERIC'),
    aiClutterRisk: failures.includes('FAIL_AI_EDITORIAL_CLUTTER'),
    bespokeArtDirected: pass,
    failureStates: failures,
    distanceEvaluation: distance,
    evaluatedAt: new Date().toISOString(),
  };
}

export function randomTypographyBlocked(assignments: TypographyRoleAssignment[]): boolean {
  return assignments.filter((a) => a.isNdxAuthored).every((a) =>
    ['DISPLAY', 'DOCUMENT', 'HUMAN_TRACE'].includes(a.role),
  );
}

export function feelsLikeBespokeArtDirected(eval_: EditorialArtifactEvaluation): boolean {
  return eval_.bespokeArtDirected && eval_.artDirectionQuality === 'PASS';
}
