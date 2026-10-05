import type { ConceptDirectionAction, ConceptDirectionGate, CreativeExperienceConcept } from './map2Types';

export function createGate0(): ConceptDirectionGate {
  return {
    gate_id: 'GATE_0_CONCEPT_DIRECTION',
    status: 'PENDING',
    selected_concept_id: null,
    history: [],
  };
}

export function applyGate0Action(
  gate: ConceptDirectionGate,
  action: ConceptDirectionAction,
  detail: { concept_id?: string; hybrid?: ConceptDirectionGate['hybrid'] },
): ConceptDirectionGate {
  const at = new Date().toISOString();
  gate.history.push({ action, at, detail: JSON.stringify(detail) });
  switch (action) {
    case 'SELECT':
      gate.selected_concept_id = detail.concept_id ?? null;
      gate.status = 'APPROVED';
      break;
    case 'HYBRIDIZE':
      gate.hybrid = detail.hybrid;
      gate.selected_concept_id = detail.hybrid?.resulting_concept_id ?? gate.selected_concept_id;
      gate.status = 'APPROVED';
      break;
    case 'DEFER':
      gate.status = 'DEFERRED';
      break;
    case 'REJECT':
      gate.status = 'REJECTED';
      break;
    default:
      gate.status = 'AMENDED';
  }
  return gate;
}

export function assertGraphExpansionAllowed(gate: ConceptDirectionGate): void {
  if (gate.status !== 'APPROVED' || !gate.selected_concept_id) {
    throw new Error('GATE_0_NOT_APPROVED: complete experience graph expansion blocked until concept direction approved');
  }
}

export function markConceptSelected(concepts: CreativeExperienceConcept[], selectedId: string): CreativeExperienceConcept[] {
  return concepts.map((c) => ({ ...c, status: c.concept_id === selectedId ? 'SELECTED' : c.status }));
}
