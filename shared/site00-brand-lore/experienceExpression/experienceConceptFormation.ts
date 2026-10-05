/**
 * Experience Concept formation from Experiment E snapshot — not from selected Concept Territory.
 */

import type { BrandLoreProfile } from '../types.js';
import { EXPERIENCE_CONCEPT_COUNT } from './constants.js';
import type { CrossMediumConceptEvidence } from './crossMediumConceptEvidence.js';
import type { ExperimentEIntelligenceSnapshot } from './experienceExpressionSnapshot.js';
import type { ExperienceConcept } from './types.js';

type ConceptPartial = Omit<
  ExperienceConcept,
  'experienceConceptId' | 'conceptIndex' | 'founderJudgment' | 'appetiteLineage' | 'formedInIsolation' | 'evidenceReferences'
> & { evidenceReferences?: string[] };

function baseFromSnapshot(
  index: number,
  snapshot: ExperimentEIntelligenceSnapshot,
  partial: ConceptPartial,
  appetiteLineage: string | null,
): ExperienceConcept {
  return {
    ...partial,
    experienceConceptId: `exp-concept-e-${snapshot.fingerprint}-${index}`,
    conceptIndex: index,
    evidenceReferences: partial.evidenceReferences ?? [],
    founderJudgment: null,
    appetiteLineage,
    formedInIsolation: true,
  };
}

/** Three interaction-thesis concepts derived from shared brand intelligence — not Experiment D territories. */
const SNAPSHOT_EXPERIENCE_CONCEPTS: [ConceptPartial, ConceptPartial, ConceptPartial] = [
  {
    name: 'THE SIGNAL CONSOLE',
    centralThesis:
      'NDXBOOK is read as a mission console — founder scans live signals, not spreadsheet rows.',
    experienceMetaphor: 'Operations console with instrument clusters',
    whyItBelongsToSelectedTerritory:
      'Derived from brand intelligence + functional canon — institutional knowledge as instrumented operations.',
    whyItBelongsInsideSite00:
      'Console mounts inside SITE 00 shell; host nav remains building infrastructure.',
    viewerRole: 'Mission operator monitoring project signals',
    projectRelationship: 'Project phases appear as instrument clusters with live readings',
    informationBehavior:
      'Status arrives as signal strength and alarm states — raw fields live in inspector drawer',
    interactionGrammar: 'TUNE cluster; ACKNOWLEDGE alarm; DRILL into signal detail',
    navigationBehavior: 'Pan between instrument zones — formation, review, canon — not equal tabs',
    hierarchyBehavior: 'NEEDS FOUNDER = red alarm; FORMING = oscillating signal; COMPLETE = steady green',
    spatialBehavior: 'Console plane with depth — hero instrument + satellite clusters',
    compositionBehavior: 'Variable-scale instruments — not equal card grid',
    hostClientRelationship: 'Host typography on console chrome; client palette on instrument faces',
    responsivePhilosophy:
      'Mobile: priority alarm fullscreen then cluster stack; Desktop: full console panorama',
    motionPhilosophy: 'Signal pulse on update; alarm blink on founder-required state',
    keyExperienceMoments: ['Generation signal spikes', 'Founder acknowledges blocker', 'Canon signal locks'],
    genericTemplateAvoidanceStrategy: [
      'No KPI tile row',
      'No equal section cards',
      'Interpret command queue as alarm panel not sidebar list',
    ],
    risks: ['Too many instruments recreates dashboard'],
    implementationFeasibility: 'HIGH',
    functionalPreservationRationale: 'Each instrument links to route; inspector holds canonical data',
    evidenceReferences: ['functional-canon', 'brand-lore', 'expression-context'],
  },
  {
    name: 'THE CASE DOSSIER',
    centralThesis:
      'Project intelligence is an investigative dossier — founder assembles proof, not browses modules.',
    experienceMetaphor: 'Case dossier with tabbed evidence sections',
    whyItBelongsToSelectedTerritory:
      'Brand intelligence supports institutional scrutiny — dossier is medium-native to NDXBOOK truth-seeking.',
    whyItBelongsInsideSite00: 'Dossier sits on SITE 00 desk surface — host frame unchanged.',
    viewerRole: 'Investigator assembling and verifying project case',
    projectRelationship: 'Each experiment/generation is an evidence exhibit in the dossier',
    informationBehavior: 'Exhibits install in sections — expand for lineage and judgment history',
    interactionGrammar: 'OPEN exhibit; COMPARE two proofs; STAMP founder approval',
    navigationBehavior: 'Section tabs as dossier dividers — not SaaS sidebar',
    hierarchyBehavior: 'ACTIVE = open divider; SUPERSEDED = archived exhibit; CANON = stamped seal',
    spatialBehavior: 'Open dossier spread with exhibit depth',
    compositionBehavior: 'Hero exhibit + supporting proof cluster',
    hostClientRelationship: 'Host labels on dossier metadata; client material on exhibit surfaces',
    responsivePhilosophy: 'Mobile: one divider fullscreen with swipe; Desktop: spread view with margin notes',
    motionPhilosophy: 'Exhibit slide-in on formation; stamp animation on canon',
    keyExperienceMoments: ['New exhibit filed', 'Compare two directions', 'Canon stamp'],
    genericTemplateAvoidanceStrategy: [
      'No dashboard grid',
      'Exhibits at varied weight',
      'Status rows become exhibit captions not table cells',
    ],
    risks: ['Dossier could feel like nested menus without exhibit metaphor'],
    implementationFeasibility: 'HIGH',
    functionalPreservationRationale: 'Sections map to routes; all mutations via exhibit actions',
    evidenceReferences: ['brand-personality', 'functional-canon', 'founder-creative-appetite'],
  },
  {
    name: 'THE ACTIVE WORKBENCH',
    centralThesis:
      'Creative intelligence work happens on a bench — founder handles tools and work-in-progress artifacts.',
    experienceMetaphor: 'Workbench with tools, fixtures, and in-progress pieces',
    whyItBelongsToSelectedTerritory:
      'Expression context + appetite support hands-on making — not passive dashboard consumption.',
    whyItBelongsInsideSite00: 'Bench inside SITE 00 workshop room — host provides room, client owns bench.',
    viewerRole: 'Craftsperson directing work on the bench',
    projectRelationship: 'Formations and reviews are physical pieces clamped to the bench',
    informationBehavior: 'Pieces appear on bench surface — pick up to inspect, clamp to hold active',
    interactionGrammar: 'PICK UP piece; CLAMP active; SWAP tool; FILE to storage',
    navigationBehavior: 'Move between bench zones — active work, review tray, canon shelf',
    hierarchyBehavior: 'FORMING = piece vibrating on bench; BLOCKED = tool missing; COMPLETE = filed to shelf',
    spatialBehavior: 'Workbench depth with tool rail and shelf backdrop',
    compositionBehavior: 'Active piece dominates; tools and shelf recede',
    hostClientRelationship: 'Host room lighting; client texture on bench and pieces',
    responsivePhilosophy: 'Mobile: single active piece + tool drawer; Desktop: bench + tool rail + shelf',
    motionPhilosophy: 'Piece clamp animation; tool swap transition',
    keyExperienceMoments: ['New piece clamped', 'Founder swaps review tool', 'Canon shelf filing'],
    genericTemplateAvoidanceStrategy: [
      'No card modules',
      'Workbench zones not vertical sections',
      'Command queue as tool tray not list widget',
    ],
    risks: ['Bench metaphor needs clear tool affordances'],
    implementationFeasibility: 'MEDIUM',
    functionalPreservationRationale: 'Bench zones wrap all routes; shelf links to content library',
    evidenceReferences: ['founder-creative-appetite', 'expression-context', 'functional-canon'],
  },
];

export function buildExperienceConceptsFromSnapshot(params: {
  snapshot: ExperimentEIntelligenceSnapshot;
  profile: BrandLoreProfile | null;
  crossMediumEvidence: CrossMediumConceptEvidence[];
  appetiteLineage: string | null;
  conceptIndex?: 1 | 2 | 3;
}): ExperienceConcept[] {
  const promoted = params.crossMediumEvidence.filter(
    (e) => e.classification === 'EXPLICITLY_PROMOTED_CROSS_MEDIUM',
  );

  const concepts = SNAPSHOT_EXPERIENCE_CONCEPTS.map((partial, i) => {
    const evidenceRefs = [
      ...(partial.evidenceReferences ?? []),
      ...promoted.map((e) => e.evidenceId),
    ];
    return baseFromSnapshot(
      (i + 1) as 1 | 2 | 3,
      params.snapshot,
      {
        ...partial,
        evidenceReferences: evidenceRefs,
        whyItBelongsToSelectedTerritory: `${partial.whyItBelongsToSelectedTerritory} Snapshot ${params.snapshot.fingerprint}.${promoted.length ? ` Cross-medium evidence: ${promoted.map((e) => e.directionName).join(', ')}.` : ''}`,
      },
      params.appetiteLineage,
    );
  });

  if (params.conceptIndex) {
    return concepts.filter((c) => c.conceptIndex === params.conceptIndex);
  }

  return concepts.slice(0, EXPERIENCE_CONCEPT_COUNT);
}
