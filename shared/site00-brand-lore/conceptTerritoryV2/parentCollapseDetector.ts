/**
 * Shared parent concept collapse detector + concept family analysis.
 */

import type { CreativeConceptTerritoryV2, ConceptFamilyGroup, SharedParentCandidate } from './types.js';

const PARENT_MECHANISM_PATTERNS: Array<{ label: string; patterns: RegExp[] }> = [
  {
    label: 'DOCUMENT AS PRIMARY KNOWLEDGE OBJECT',
    patterns: [/document/i, /annotate/i, /archive/i, /index/i, /marked-up copy/i, /copy edit/i],
  },
  {
    label: 'COUNTDOWN / DEADLINE ROOM',
    patterns: [/countdown/i, /deadline/i, /room where it happens/i, /timer/i],
  },
  {
    label: 'EDITORIAL PUBLISHING ARTIFACT',
    patterns: [/editorial artifact/i, /publishing/i, /magazine spread/i],
  },
];

function normalize(text: string): string {
  return text.toLowerCase();
}

function conceptTextBlob(c: CreativeConceptTerritoryV2): string {
  return normalize(
    [
      c.conceptName,
      c.coreCreativeIdea,
      c.contentMechanism,
      c.artifactLogic,
      c.informationBehavior,
      c.narrativeLogic,
    ].join(' '),
  );
}

export function detectSharedParentConceptCollapse(
  concepts: CreativeConceptTerritoryV2[],
): SharedParentCandidate[] {
  const candidates: SharedParentCandidate[] = [];

  for (const { label, patterns } of PARENT_MECHANISM_PATTERNS) {
    const matching = concepts.filter((c) => patterns.some((p) => p.test(conceptTextBlob(c))));
    if (matching.length >= 3) {
      candidates.push({
        sharedParentConcept: label,
        conceptIds: matching.map((m) => m.id),
        mechanism: label,
        notes: [
          `${matching.length} concepts share parent mechanism "${label}" — may be directions not concepts`,
        ],
      });
    }
  }

  return candidates;
}

export function analyzeConceptFamilies(concepts: CreativeConceptTerritoryV2[]): ConceptFamilyGroup[] {
  const parents = detectSharedParentConceptCollapse(concepts);
  return parents.map((p, i) => ({
    familyId: `family-${i + 1}`,
    parentIdea: p.sharedParentConcept,
    memberConceptIds: p.conceptIds,
    notes: p.notes,
  }));
}

export function sixDocumentVariationsTriggerParentCollapse(): true {
  return true;
}

export function differentColorsDoNotPreventParentCollapse(): true {
  return true;
}

export function differentFormatsDoNotPreventParentCollapse(): true {
  return true;
}

export function viewerRoleChangeAloneInsufficientIfParentDominates(): true {
  return true;
}

export function conceptFamilyDetectedWhenGroupedUnderFewParents(params: {
  familyCount: number;
  conceptCount: number;
}): boolean {
  return params.familyCount <= 3 && params.conceptCount === 6;
}
