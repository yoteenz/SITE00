/**
 * Experience Concept distinctiveness gate — conceptual collapse detection.
 */

import type { ExperienceConcept, ExperienceConceptDistinctivenessReport } from './types.js';

const COMPARE_FIELDS: Array<keyof Pick<
  ExperienceConcept,
  | 'experienceMetaphor'
  | 'viewerRole'
  | 'informationBehavior'
  | 'interactionGrammar'
  | 'navigationBehavior'
  | 'hierarchyBehavior'
  | 'spatialBehavior'
  | 'responsivePhilosophy'
>> = [
  'experienceMetaphor',
  'viewerRole',
  'informationBehavior',
  'interactionGrammar',
  'navigationBehavior',
  'hierarchyBehavior',
  'spatialBehavior',
  'responsivePhilosophy',
];

function normalize(value: string): string {
  return value.toLowerCase().replace(/\s+/g, ' ').trim();
}

function fieldOverlap(a: ExperienceConcept, b: ExperienceConcept): string[] {
  return COMPARE_FIELDS.filter((field) => normalize(a[field]) === normalize(b[field]));
}

export function runExperienceConceptDistinctivenessGate(
  concepts: ExperienceConcept[],
): ExperienceConceptDistinctivenessReport {
  if (concepts.length !== 3) {
    return {
      result: 'CONCEPTUAL_COLLAPSE',
      cousinPairs: [],
      conceptualCollapse: true,
      artificialDiversityUsed: false,
      notes: ['Expected exactly 3 experience concepts'],
    };
  }

  const cousinPairs: ExperienceConceptDistinctivenessReport['cousinPairs'] = [];
  for (let i = 0; i < concepts.length; i++) {
    for (let j = i + 1; j < concepts.length; j++) {
      const overlap = fieldOverlap(concepts[i], concepts[j]);
      if (overlap.length >= 4) {
        cousinPairs.push({
          conceptA: concepts[i].experienceConceptId,
          conceptB: concepts[j].experienceConceptId,
          overlapFields: overlap,
        });
      } else if (overlap.length >= 2) {
        cousinPairs.push({
          conceptA: concepts[i].experienceConceptId,
          conceptB: concepts[j].experienceConceptId,
          overlapFields: overlap,
        });
      }
    }
  }

  const metaphorSet = new Set(concepts.map((c) => normalize(c.experienceMetaphor)));
  const viewerSet = new Set(concepts.map((c) => normalize(c.viewerRole)));
  const infoSet = new Set(concepts.map((c) => normalize(c.informationBehavior)));

  const conceptualCollapse =
    metaphorSet.size < 3 || viewerSet.size < 2 || infoSet.size < 2 || cousinPairs.some((p) => p.overlapFields.length >= 5);

  let result: ExperienceConceptDistinctivenessReport['result'] = 'PASS';
  if (conceptualCollapse) result = 'CONCEPTUAL_COLLAPSE';
  else if (cousinPairs.some((p) => p.overlapFields.length >= 3)) result = 'COUSIN_BUT_DISTINCT';

  return {
    result,
    cousinPairs,
    conceptualCollapse,
    artificialDiversityUsed: false,
    notes: conceptualCollapse
      ? ['Three concepts share too much interaction/information/spatial logic — styling cannot fix collapse']
      : ['Concepts differ in central metaphor and experience behavior'],
  };
}

export function noStyleOnlyCollapseFixAllowed(report: ExperienceConceptDistinctivenessReport): boolean {
  if (!report.conceptualCollapse) return true;
  return !report.notes.some((n) => n.toLowerCase().includes('color') || n.toLowerCase().includes('font'));
}
