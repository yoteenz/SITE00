/**
 * P0.5E.4 — Cultural knowledge boundary helpers.
 */

import type { CulturalKnowledgeBoundary } from './types.js';

export function blocksFabricatedLivedExperience(boundary: CulturalKnowledgeBoundary): boolean {
  return boundary.fabricatedLivedExperience === false;
}

export function researchNotPretendSupported(boundaries: CulturalKnowledgeBoundary[]): boolean {
  return boundaries.some(
    (b) =>
      b.level === 'DO_NOT_PRETEND' ||
      b.level === 'UNCERTAIN' ||
      (b.researchNotPretendPhrase && b.researchNotPretendPhrase.length > 0),
  );
}

export function genericStudioWorldHasNoIdentityAssumptions(text: string): boolean {
  const forbidden = ['NDX', 'lime', 'Bookmark', 'Dog-Ear', 'African-American', 'Black woman'];
  return !forbidden.some((f) => text.includes(f));
}
