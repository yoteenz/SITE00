import type { WorkspaceConceptCandidate, WorkspaceConceptSlotId } from './types.js';
import { WORKSPACE_SELF_TARGET_ID } from '../designTargetModel.js';

export const WORKSPACE_CONCEPT_SLOT_IDS: readonly WorkspaceConceptSlotId[] = [
  'CONCEPT_A',
  'CONCEPT_B',
  'CONCEPT_C',
];

export const WORKSPACE_CONCEPT_GENERATION_COUNT = 3 as const;

export const OPUS_ALLOWED_MUTATION_SCOPE = [
  'visual shell',
  'layout',
  'component arrangement',
  'styling',
  'responsive composition',
  'presentation markup',
] as const;

export const OPUS_FORBIDDEN_MUTATION_SCOPE = [
  'routes',
  'logic',
  'state',
  'persistence',
  'data',
  'API',
  'Supabase',
  'events',
  'provider execution',
  'business rules',
] as const;

export function seedWorkspaceConceptSlots(): WorkspaceConceptCandidate[] {
  return WORKSPACE_CONCEPT_SLOT_IDS.map((conceptId) => ({
    conceptId,
    targetId: WORKSPACE_SELF_TARGET_ID,
    conceptName: conceptId.replace('_', ' '),
    conceptTerritory: '',
    rationale: '',
    mobileArtifactPath: null,
    desktopArtifactPath: null,
    visualStrategy: '',
    layoutStrategy: '',
    informationHierarchyStrategy: '',
    responsiveStrategy: '',
    functionContractId: null,
    createdAt: null,
    status: 'EMPTY',
  }));
}
