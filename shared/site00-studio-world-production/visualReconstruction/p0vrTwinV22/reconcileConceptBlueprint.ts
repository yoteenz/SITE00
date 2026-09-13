import type { PageCreativeDirection } from '../p0vrTwinV21/types.js';
import type { ConceptBlueprint, ConceptBlueprintReconciliation } from './types.js';

export function reconcileConceptBlueprint(input: {
  conceptId: string;
  plannedDirection: PageCreativeDirection;
  blueprint: ConceptBlueprint;
}): ConceptBlueprintReconciliation {
  const plannedSections = new Set(input.plannedDirection.sectionOrder);
  const blueprintSections = new Set(input.blueprint.sections.map((s) => s.label));
  const missing = [...plannedSections].filter((s) => !blueprintSections.has(s));
  const unexpected = [...blueprintSections].filter((s) => !plannedSections.has(s));

  return {
    reconciliationId: `cbr-${input.conceptId}`,
    conceptId: input.conceptId,
    retainedDecisions: input.plannedDirection.visualHierarchy.slice(0, 4),
    changedDecisions: unexpected.map((s) => `Band emphasis shifted: ${s}`),
    unexpectedAdditions: unexpected,
    missingPlannedObjects: missing,
    actualGeneratedGeometry: `${input.blueprint.objects.length} objects across ${input.blueprint.sections.length} sections (normalized)`,
    winner: 'GENERATED_VISUAL',
  };
}
