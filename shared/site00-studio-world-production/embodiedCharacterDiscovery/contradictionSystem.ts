/**
 * P0.5E.3 — Contradiction engine — perfect characters prohibited.
 */

import { randomId } from './id.js';
import type { EmbodiedCharacterContradictionSystem } from './types.js';

export const CONTRADICTION_TENSION_EXAMPLES = [
  'NOSY ↔ RESPECTFUL',
  'OPINIONATED ↔ WILLING TO BE WRONG',
  'CONFIDENT ↔ OCCASIONALLY INSECURE',
  'CULTURALLY FLUENT ↔ STILL LEARNING',
  'OBSERVANT ↔ SOMETIMES MISREADS THINGS',
  'MESSY ↔ PRECISE',
  'SOCIAL ↔ NEEDS SOLITUDE',
  'FUNNY ↔ CAPABLE OF REAL SERIOUSNESS',
  'SKEPTICAL ↔ SECRETLY HOPEFUL',
  'CURIOUS ↔ SOMETIMES TOO CURIOUS',
  'COOL ↔ OCCASIONALLY DEEPLY UNCOOL',
] as const;

export function buildEmbodiedCharacterContradictionSystem(
  overrides: Partial<EmbodiedCharacterContradictionSystem> = {},
): EmbodiedCharacterContradictionSystem {
  return {
    systemId: randomId('con'),
    majorContradictions: overrides.majorContradictions ?? [],
    minorContradictions: overrides.minorContradictions ?? [],
    recurringBlindSpots: overrides.recurringBlindSpots ?? [],
    behaviorsSheRegrets: overrides.behaviorsSheRegrets ?? [],
    traitOthersFindAnnoying: overrides.traitOthersFindAnnoying ?? 'TBD — discovery',
    embarrassedLikes: overrides.embarrassedLikes ?? 'TBD — discovery',
    pretendsNotToCare: overrides.pretendsNotToCare ?? 'TBD — discovery',
  };
}

export function contradictionsMeetMinimumRequirements(system: EmbodiedCharacterContradictionSystem): boolean {
  return (
    system.majorContradictions.length >= 3 &&
    system.minorContradictions.length >= 3 &&
    system.recurringBlindSpots.length >= 2 &&
    system.behaviorsSheRegrets.length >= 2 &&
    Boolean(system.traitOthersFindAnnoying && system.traitOthersFindAnnoying !== 'TBD — discovery')
  );
}
