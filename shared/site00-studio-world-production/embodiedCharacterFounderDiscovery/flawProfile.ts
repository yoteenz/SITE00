/**
 * P0.5E.4 — Flaw profile with secretly-flattering rejection.
 */

import { SECRETLY_FLATTERING_FLAW_PATTERNS } from './constants.js';
import type { CharacterFlawEntry, CharacterFlawProfile } from './types.js';

export function isSecretlyFlatteringFlaw(description: string): boolean {
  const upper = description.toUpperCase();
  return SECRETLY_FLATTERING_FLAW_PATTERNS.some((p) => upper.includes(p));
}

export function validateFlawEntry(entry: CharacterFlawEntry): { ok: boolean; reason?: string } {
  if (entry.secretlyFlattering || isSecretlyFlatteringFlaw(entry.description)) {
    return { ok: false, reason: 'Flaw is secretly a compliment' };
  }
  if (entry.category === 'CHARMING_FLAW' && isSecretlyFlatteringFlaw(entry.description)) {
    return { ok: false, reason: 'Charming flaw cannot be flattering' };
  }
  return { ok: true };
}

export function genuineFlawCount(profile: CharacterFlawProfile): number {
  return profile.flaws.filter((f) => validateFlawEntry(f).ok).length;
}

export function flawProfileHasAnnoyingTraits(profile: CharacterFlawProfile): boolean {
  return (
    profile.flaws.some((f) => f.category === 'ANNOYING_TRAIT') ||
    profile.knowsItsAnnoying.length > 0 ||
    profile.bestFriendWouldRoastHerFor.length > 0
  );
}
