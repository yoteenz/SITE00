/**
 * P0.5E.3 — Everyday life — ordinary humanity without over-written biography.
 */

import { randomId } from './id.js';
import type { EmbodiedCharacterEverydayLife } from './types.js';

export function buildEmbodiedCharacterEverydayLife(
  overrides: Partial<EmbodiedCharacterEverydayLife> = {},
): EmbodiedCharacterEverydayLife {
  return {
    lifeId: randomId('life'),
    morningHabits: overrides.morningHabits ?? [],
    lateNightHabits: overrides.lateNightHabits ?? [],
    phoneBehavior: overrides.phoneBehavior ?? 'TBD — discovery',
    procrastination: overrides.procrastination ?? 'TBD — discovery',
    guiltyPleasures: overrides.guiltyPleasures ?? [],
    thingsSheAlwaysCarries: overrides.thingsSheAlwaysCarries ?? [],
  };
}
