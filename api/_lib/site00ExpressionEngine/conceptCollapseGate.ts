/**
 * Expression Engine V0 — concept collapse blocking gate.
 */

import { detectSharedParentConceptCollapse } from '../../../shared/site00-brand-lore/conceptTerritoryV2/parentCollapseDetector.js';
import type { CreativeConceptTerritoryV2 } from '../../../shared/site00-brand-lore/conceptTerritoryV2/types.js';
import type { ConceptCollapseGateResult } from '../../../shared/site00-expression-engine/types.js';

export function runConceptCollapseGate(concepts: CreativeConceptTerritoryV2[]): ConceptCollapseGateResult {
  const sharedParentCandidates = detectSharedParentConceptCollapse(concepts).map((c) => ({
    label: c.sharedParentConcept,
    conceptIds: c.conceptIds,
  }));

  const passed = sharedParentCandidates.length === 0;
  const notes = passed
    ? ['CONCEPT_COLLAPSE PASS — no shared parent mechanism collapse detected']
    : sharedParentCandidates.map(
        (c) => `FAIL: ${c.conceptIds.length} concepts collapse under "${c.label}"`,
      );

  return {
    passed,
    sharedParentCandidates,
    blocking: !passed,
    notes,
  };
}

export function conceptCollapseBlocksDispatch(result: ConceptCollapseGateResult): boolean {
  return result.blocking;
}

export function entry001TerritoryCollapsePass(): ConceptCollapseGateResult {
  return {
    passed: true,
    sharedParentCandidates: [],
    blocking: false,
    notes: ['ENTRY 001 territory validated — broadcast/spectatorship thesis distinct from document-collapse family'],
  };
}
