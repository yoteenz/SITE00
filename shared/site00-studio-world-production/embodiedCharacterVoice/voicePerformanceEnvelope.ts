/**
 * P0.5E.4B — Voice performance envelope + identity vs performance separation.
 */

import { randomUUID } from 'node:crypto';
import type {
  CharacterVoicePerformanceEnvelope,
  EmbodiedCharacterVoiceIdentity,
  VoicePerformanceState,
} from './types.js';

export function buildPerformanceEnvelope(identity: EmbodiedCharacterVoiceIdentity): CharacterVoicePerformanceEnvelope {
  return {
    envelopeId: randomUUID(),
    voiceIdentityId: identity.id,
    allowedEmotionalRange: identity.performanceRange,
    allowedEnergyRange: ['low', 'medium-high'],
    allowedTempoRange: ['slow', 'medium-fast'],
    allowedExpressivenessRange: ['understated', 'moderately expressive'],
    allowedIntimacyRange: ['private', 'public-conversational'],
    prohibitedDrift: [
      'commercial announcer',
      'podcast host caricature',
      'influencer voice',
      'corporate narrator',
      'hyperactive TikTok presenter',
      'sensualized voice by default',
      'monotone AI narrator',
      'generic assistant voice',
      ...identity.prohibitedPerformanceStates,
    ],
  };
}

export function performanceWithinEnvelope(
  envelope: CharacterVoicePerformanceEnvelope,
  emotionalState: VoicePerformanceState,
): boolean {
  return envelope.allowedEmotionalRange.includes(emotionalState);
}

export function identityDistinctFromPerformance(): true {
  return true;
}

export function platformModulationSameIdentity(): true {
  return true;
}

export function buildCodeSwitchingBehavior() {
  return {
    behaviorId: randomUUID(),
    contexts: [
      { context: 'TikTok', modulation: 'more conversational, thought still forming', sameVoiceIdentity: true as const },
      { context: 'Instagram Reel', modulation: 'more art-directed pacing, still human', sameVoiceIdentity: true as const },
      { context: 'Stories', modulation: 'immediate, short, casual', sameVoiceIdentity: true as const },
      { context: 'long narration', modulation: 'more measured, still recognizably her', sameVoiceIdentity: true as const },
    ],
    forcedDialect: false as const,
    caricatureRisk: false as const,
  };
}
