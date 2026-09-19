/**
 * Cross-parent direction audit — evaluate nine directions across three parent concepts.
 */

import type {
  BrandPresentationDirectionCandidate,
  BrandPresentationDirectionCrossParentAudit,
  FrozenParentConceptSnapshot,
} from './types.js';

const PARENT_MECHANISM_HINTS: Record<string, string[]> = {
  'THE COLLECTOR WHO CONNECTS': ['connect', 'connection', 'synthes', 'relate', 'bridge', 'gather'],
  'THE ROOM THAT KNOWS': ['room', 'place', 'environment', 'context', 'accumul', 'conversation', 'enter'],
  'THE THING THAT KEEPS NOTICING': ['notic', 'observe', 'signal', 'overlook', 'attent', 'anomal'],
};

function textOf(d: BrandPresentationDirectionCandidate): string {
  return [
    d.directionName,
    d.directionThesis,
    d.directionInterpretation,
    d.brandBehavior,
    d.editorialBehavior,
  ]
    .join(' ')
    .toLowerCase();
}

export function runBrandPresentationDirectionCrossParentAudit(params: {
  directions: BrandPresentationDirectionCandidate[];
  parentSnapshots: FrozenParentConceptSnapshot[];
}): BrandPresentationDirectionCrossParentAudit {
  const evaluatedAt = new Date().toISOString();
  const notes: string[] = [];
  const conceptualLeakage: string[] = [];
  const crossParentDuplication: string[] = [];
  const artificialDiversityFlags: string[] = [];

  for (const direction of params.directions) {
    const parent = params.parentSnapshots.find((p) => p.id === direction.parentConceptId);
    if (!parent) continue;
    const parentName = parent.name.toUpperCase();
    const hints = Object.entries(PARENT_MECHANISM_HINTS).filter(([name]) => name !== parentName);
    const dirText = textOf(direction);
    for (const [otherParent, tokens] of hints) {
      const hits = tokens.filter((t) => dirText.includes(t));
      if (hits.length >= 3) {
        conceptualLeakage.push(
          `${direction.directionName} (${parent.name}) shows leakage toward ${otherParent}: ${hits.join(', ')}`,
        );
      }
    }
  }

  for (let i = 0; i < params.directions.length; i++) {
    for (let j = i + 1; j < params.directions.length; j++) {
      const a = params.directions[i]!;
      const b = params.directions[j]!;
      if (a.parentConceptId === b.parentConceptId) continue;
      if (a.directionName.toLowerCase() === b.directionName.toLowerCase()) {
        crossParentDuplication.push(`Duplicate name across parents: ${a.directionName}`);
      }
      const overlap = a.directionThesis.toLowerCase().split(/\s+/).filter((w) =>
        b.directionThesis.toLowerCase().includes(w),
      );
      if (overlap.length > 10) {
        crossParentDuplication.push(`High thesis overlap: ${a.directionName} ↔ ${b.directionName}`);
      }
    }
  }

  const allShort = params.directions.every((d) => d.directionThesis.length < 40);
  if (allShort) {
    artificialDiversityFlags.push('All direction theses unusually short — possible shallow diversity');
  }

  let result: BrandPresentationDirectionCrossParentAudit['result'] = 'PASS';
  if (conceptualLeakage.length) result = 'CONCEPTUAL_LEAKAGE';
  else if (crossParentDuplication.length) result = 'CROSS_PARENT_DUPLICATION';
  else if (artificialDiversityFlags.length) result = 'ARTIFICIAL_DIVERSITY';
  else if (notes.length) result = 'NEEDS_FOUNDER_REVIEW';

  return {
    evaluatedAt,
    result,
    conceptualLeakage,
    crossParentDuplication,
    artificialDiversityFlags,
    semanticAuditResult: 'SEMANTIC_AUDIT_NOT_EVALUATED',
    notes: notes.length ? notes : ['Cross-parent heuristic audit complete'],
  };
}
