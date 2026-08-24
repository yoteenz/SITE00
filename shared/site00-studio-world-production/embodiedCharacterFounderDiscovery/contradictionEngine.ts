/**
 * P0.5E.4 — Contradiction engine with generic-adjective rejection.
 */

import { GENERIC_ADJECTIVE_CONTRADICTIONS } from './constants.js';
import type { CharacterContradiction, TraitAuthorityState } from './types.js';

export function isGenericAdjectiveContradiction(traitA: string, traitB: string): boolean {
  const pair = `${traitA.toUpperCase()} ↔ ${traitB.toUpperCase()}`;
  return GENERIC_ADJECTIVE_CONTRADICTIONS.some(
    (g) => pair.includes(g.split(' BUT ')[0]!) && pair.includes(g.split(' BUT ')[1]!),
  );
}

export function validateCharacterContradiction(c: CharacterContradiction): { ok: boolean; reason?: string } {
  if (c.genericAdjectivePair) return { ok: false, reason: 'Generic marketing adjective pair' };
  if (isGenericAdjectiveContradiction(c.traitA, c.traitB)) {
    return { ok: false, reason: 'Contradiction reads like marketing adjectives' };
  }
  if (!c.whyBothAreTrue.trim() || !c.whenAAppears.trim() || !c.whenBAppears.trim()) {
    return { ok: false, reason: 'Contradiction requires contextual explanation' };
  }
  return { ok: true };
}

export function meaningfulContradictionCount(contradictions: CharacterContradiction[]): number {
  return contradictions.filter((c) => validateCharacterContradiction(c).ok).length;
}

export function applyFounderContradictionAuthority(
  c: CharacterContradiction,
  authority: TraitAuthorityState,
): CharacterContradiction {
  return { ...c, founderAuthority: authority };
}
