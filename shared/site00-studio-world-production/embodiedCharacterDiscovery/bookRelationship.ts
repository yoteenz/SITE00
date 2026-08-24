/**
 * P0.5E.3 — Relationship to primary creative artifact (generic — terms configured by adapter).
 */

import { randomId } from './id.js';
import type { EmbodiedCharacterBookRelationship } from './types.js';

export function buildEmbodiedCharacterBookRelationship(params: {
  termMeanings: Record<string, string>;
  whySheKeepsIt?: string[];
  behaviorsFeelNatural?: string[];
}): EmbodiedCharacterBookRelationship {
  return {
    relationshipId: randomId('book'),
    whySheKeepsIt: params.whySheKeepsIt ?? [],
    termMeanings: params.termMeanings,
    behaviorsFeelNatural: params.behaviorsFeelNatural ?? [],
  };
}
