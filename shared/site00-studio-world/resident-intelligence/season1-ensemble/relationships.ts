import type { ResidentRelationshipEdge } from './types.js';

/** Production intelligence graph — not all edges need UI surfacing. */
export const STUDIO_WORLD_SEASON1_RELATIONSHIPS: readonly ResidentRelationshipEdge[] = [
  { id: 'rel-etta-zuri', fromResidentId: 'SW-RESIDENT-001', toResidentId: 'SW-RESIDENT-002', label: 'Power duo', productionNote: 'Creative taste × strategic intelligence' },
  { id: 'rel-etta-caspian', fromResidentId: 'SW-RESIDENT-001', toResidentId: 'SW-RESIDENT-005', label: 'Precision vs spectacle', productionNote: 'Exact creative authority vs cinematic world drama' },
  { id: 'rel-etta-noa', fromResidentId: 'SW-RESIDENT-001', toResidentId: 'SW-RESIDENT-004', label: 'Taste vs logic', productionNote: 'High trust — editorial vs systems' },
  { id: 'rel-jules-ensemble', fromResidentId: 'SW-RESIDENT-003', toResidentId: 'SW-RESIDENT-001', label: 'Social glue', productionNote: 'Jules ↔ everyone — hospitality routing' },
  { id: 'rel-noa-caspian', fromResidentId: 'SW-RESIDENT-004', toResidentId: 'SW-RESIDENT-005', label: 'Systems vs drama', productionNote: 'Structure vs atmosphere tension' },
  { id: 'rel-iona-marlowe', fromResidentId: 'SW-RESIDENT-006', toResidentId: 'SW-RESIDENT-007', label: 'Fabrication vs persona', productionNote: 'Lab craft vs performance mapping' },
  { id: 'rel-zuri-ev', fromResidentId: 'SW-RESIDENT-002', toResidentId: 'SW-RESIDENT-008', label: 'Strategic rivalry', productionNote: 'Client intelligence vs expansion leverage' },
  { id: 'rel-marlowe-ensemble', fromResidentId: 'SW-RESIDENT-007', toResidentId: 'SW-RESIDENT-001', label: 'Observer / confidant / instigator', productionNote: 'Casting director reads entire floor' },
  { id: 'rel-jules-iona', fromResidentId: 'SW-RESIDENT-003', toResidentId: 'SW-RESIDENT-006', label: 'Protective confidence', productionNote: 'Jules ↔ Iona confidence-restoration dynamic' },
];

export function getStudioWorldSeason1Relationships(): readonly ResidentRelationshipEdge[] {
  return STUDIO_WORLD_SEASON1_RELATIONSHIPS;
}
