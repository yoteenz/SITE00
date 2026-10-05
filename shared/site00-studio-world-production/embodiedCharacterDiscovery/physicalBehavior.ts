/**
 * P0.5E.3 — Physical behavior bible — observed, not choreographed.
 */

import { randomId } from './id.js';
import type { EmbodiedCharacterPhysicalBehaviorBible } from './types.js';

export const PHYSICAL_BEHAVIOR_CANDIDATES = [
  'scrolling',
  'reading',
  'typing',
  'writing',
  'highlighting',
  'circling',
  'crossing things out',
  'turning pages',
  'dog-earing',
  'bookmarking',
  'searching',
  'watching videos',
  'rewinding',
  'pausing',
  'zooming',
  'staring',
  'thinking',
  'laughing',
  'side-eyeing',
  'walking',
  'sitting',
  'lounging',
  'working',
  'eating while researching',
  'falling down rabbit holes',
  'losing focus',
  'returning to something',
] as const;

export function buildEmbodiedCharacterPhysicalBehaviorBible(
  overrides: Partial<EmbodiedCharacterPhysicalBehaviorBible> = {},
): EmbodiedCharacterPhysicalBehaviorBible {
  return {
    bibleId: randomId('phys'),
    researchBehaviors: overrides.researchBehaviors ?? [...PHYSICAL_BEHAVIOR_CANDIDATES],
    idleBehavior: overrides.idleBehavior ?? 'TBD — discovery',
    thinkingBehavior: overrides.thinkingBehavior ?? 'TBD — discovery',
    frustratedBehavior: overrides.frustratedBehavior ?? 'TBD — discovery',
    excitedBehavior: overrides.excitedBehavior ?? 'TBD — discovery',
    skepticalBehavior: overrides.skepticalBehavior ?? 'TBD — discovery',
    cameraAwareBehavior: overrides.cameraAwareBehavior ?? 'TBD — discovery',
    cameraUnawareBehavior: overrides.cameraUnawareBehavior ?? 'TBD — discovery',
  };
}

export function nonverbalBehaviorModeled(bible: EmbodiedCharacterPhysicalBehaviorBible): boolean {
  return bible.researchBehaviors.length >= 10;
}
