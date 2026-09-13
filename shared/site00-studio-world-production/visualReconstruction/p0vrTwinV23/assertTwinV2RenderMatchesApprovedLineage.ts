import type { ConceptDirectedTwinSession } from '../p0vrTwinV21/types.js';
import type { ConceptCandidate } from '../p0vrTwinV22/types.js';

export function assertTwinV2RenderMatchesApprovedLineage(input: {
  session: ConceptDirectedTwinSession;
  approvedConcept: ConceptCandidate;
  packageId: string;
  blueprintId: string;
}): { pass: boolean; reasons: string[] } {
  const reasons: string[] = [];
  const twin = input.session.renderedTwin;
  if (!twin) {
    reasons.push('no renderedTwin');
    return { pass: false, reasons };
  }
  if ('sourcePackageId' in twin && twin.sourcePackageId !== input.packageId) {
    reasons.push(`packageId mismatch: ${twin.sourcePackageId} !== ${input.packageId}`);
  }
  if ('sourceConceptId' in twin && twin.sourceConceptId !== input.approvedConcept.conceptId) {
    reasons.push(`conceptId mismatch`);
  }
  if ('sourceBlueprintId' in twin && twin.sourceBlueprintId !== input.blueprintId) {
    reasons.push(`blueprintId mismatch`);
  }
  if (twin.buildMode && twin.buildMode !== 'PACKAGE_DRIVEN_SOURCE_GENERATION') {
    reasons.push(`invalid buildMode ${twin.buildMode}`);
  }
  return { pass: reasons.length === 0, reasons };
}
