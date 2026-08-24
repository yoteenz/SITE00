/**
 * P0.5E.3 — Humor system — nonverbal humor is first-class.
 */

import { randomId } from './id.js';
import type { EmbodiedCharacterHumorSystem } from './types.js';

export const NONVERBAL_HUMOR_BEHAVIORS = [
  'a look',
  'a pause',
  'closing the laptop',
  'rewinding',
  'zooming in',
  'writing one word',
  'circling something',
  'turning away',
  'walking away',
] as const;

export function buildEmbodiedCharacterHumorSystem(
  overrides: Partial<EmbodiedCharacterHumorSystem> = {},
): EmbodiedCharacterHumorSystem {
  return {
    systemId: randomId('hum'),
    whatMakesHerLaugh: overrides.whatMakesHerLaugh ?? [],
    whatSheFindsCorny: overrides.whatSheFindsCorny ?? [],
    nonverbalHumorBehaviors: overrides.nonverbalHumorBehaviors ?? [...NONVERBAL_HUMOR_BEHAVIORS],
    thingsSheWouldNeverJokeAbout: overrides.thingsSheWouldNeverJokeAbout ?? [],
  };
}

export function nonverbalHumorModeled(system: EmbodiedCharacterHumorSystem): boolean {
  return system.nonverbalHumorBehaviors.length > 0;
}
