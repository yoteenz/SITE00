/**
 * P0.5E.4B.1 — NDX neural casting territories (adapter-owned, not generic infrastructure).
 * Behavior-first vocal direction — no dialect presets, no caricature keywords for providers.
 */

import type { NeuralCastingTerritory } from '../../site00-studio-world-production/embodiedCharacterVoice/types.js';
import type { CharacterVoiceCalibrationState } from '../../site00-studio-world-production/embodiedCharacterVoice/types.js';

const ADULT_CONVERSATIONAL_BASE =
  'Adult woman, late twenties to early thirties. Conversational, grounded, charismatic without performing. ' +
  'Natural cadence and timing — not announcer, not influencer, not AI assistant. ' +
  'Attitude and personality through rhythm and emphasis, not stereotype or forced dialect.';

/** Round 1 — audition distinct adult-female presences with personality and charisma */
export const NDX_NEURAL_CASTING_ROUND_1: NeuralCastingTerritory[] = [
  {
    label: 'VOICE A',
    territory: 'CHARISMA / ENERGY',
    vocalCharacter: 'Magnetic conversational energy — she enters the line like she already knows you',
    providerVoiceId: 'Exuberant_Girl',
    providerVoiceName: 'Exuberant Girl',
    speed: 1.04,
    pitch: 1,
    emotion: 'neutral',
    traits: ['CONVERSATIONAL_CHARISMA', 'ADULT_ENERGY', 'NATURAL_CONFIDENCE'],
    varied: ['energy', 'charisma'],
    performanceDirection: `${ADULT_CONVERSATIONAL_BASE} More forward energy and social magnetism.`,
  },
  {
    label: 'VOICE B',
    territory: 'ATTITUDE / PERSONALITY',
    vocalCharacter: 'Personality-forward — quick wit, slight edge, speaks like she means it',
    providerVoiceId: 'Energetic_Girl',
    providerVoiceName: 'Energetic Girl',
    speed: 1.06,
    pitch: 0,
    emotion: 'neutral',
    traits: ['QUICK_COGNITIVE_RHYTHM', 'DRY_AMUSEMENT', 'UNDERSTATED_CONFIDENCE'],
    varied: ['attitude', 'pace'],
    performanceDirection: `${ADULT_CONVERSATIONAL_BASE} Slight attitude in delivery — confident, not performative.`,
  },
  {
    label: 'VOICE C',
    territory: 'WARM SHARP PRESENCE',
    vocalCharacter: 'Warm but sharp — grounded adult presence with observational intelligence',
    providerVoiceId: 'Attractive_Girl',
    providerVoiceName: 'Attractive Girl',
    speed: 1.0,
    pitch: 0,
    emotion: 'neutral',
    traits: ['LOW_REGISTER_WARMTH', 'COOL_TONE', 'NATURAL_CONVERSATIONAL_TEXTURE'],
    varied: ['warmth', 'sharpness'],
    performanceDirection: `${ADULT_CONVERSATIONAL_BASE} Warmth with a sharper observational edge.`,
  },
  {
    label: 'VOICE D',
    territory: 'HUMAN WARMTH BASELINE',
    vocalCharacter: 'Most natural human texture — conversational warmth as baseline to refine',
    providerVoiceId: 'Soft_Girl',
    providerVoiceName: 'Soft Girl',
    speed: 0.98,
    pitch: 0,
    emotion: 'neutral',
    traits: ['NATURAL_CONVERSATIONAL_TEXTURE', 'SOFT_PRESENCE', 'LOW_REGISTER_WARMTH'],
    varied: ['warmth', 'naturalness'],
    performanceDirection: `${ADULT_CONVERSATIONAL_BASE} Prioritize human naturalness over polish.`,
  },
];

/** Sibling round when founder marked CLOSE on Soft_Girl region — refine, do not recast entirely */
export const NDX_SIBLING_TERRITORIES_FROM_SOFT_GIRL: NeuralCastingTerritory[] = [
  {
    label: 'VOICE A',
    territory: 'SAME WOMAN / MORE ATTITUDE',
    vocalCharacter: 'Same vocal identity — more attitude, slightly faster, less soft',
    providerVoiceId: 'Soft_Girl',
    providerVoiceName: 'Soft Girl',
    speed: 1.06,
    pitch: 1,
    emotion: 'neutral',
    traits: ['UNDERSTATED_CONFIDENCE', 'DRY_DELIVERY'],
    varied: ['attitude'],
    performanceDirection: `${ADULT_CONVERSATIONAL_BASE} Same woman — add conversational attitude and forward energy.`,
  },
  {
    label: 'VOICE B',
    territory: 'SAME WOMAN / MORE GROUNDED',
    vocalCharacter: 'Same vocal identity — slower, more grounded late-20s adult weight',
    providerVoiceId: 'Soft_Girl',
    providerVoiceName: 'Soft Girl',
    speed: 0.94,
    pitch: -1,
    emotion: 'neutral',
    traits: ['MEASURED_CADENCE', 'UNDERSTATED_CONFIDENCE'],
    varied: ['cadence', 'grounding'],
    performanceDirection: `${ADULT_CONVERSATIONAL_BASE} Same woman — more grounded, less breathy, adult weight.`,
  },
  {
    label: 'VOICE C',
    territory: 'MORE PERSONALITY / SAME WARMTH',
    vocalCharacter: 'Similar warmth with more personality and charisma in the read',
    providerVoiceId: 'Lovely_Girl',
    providerVoiceName: 'Lovely Girl',
    speed: 1.02,
    pitch: 0,
    emotion: 'neutral',
    traits: ['NATURAL_CONVERSATIONAL_TEXTURE', 'CONVERSATIONAL_CHARISMA'],
    varied: ['personality'],
    performanceDirection: `${ADULT_CONVERSATIONAL_BASE} Warmth plus visible personality — not influencer polish.`,
  },
  {
    label: 'VOICE D',
    territory: 'CHARISMA / PERSONALITY TEST',
    vocalCharacter: 'Charisma-forward adult woman — personality and timing over sweetness',
    providerVoiceId: 'Exuberant_Girl',
    providerVoiceName: 'Exuberant Girl',
    speed: 1.0,
    pitch: 0,
    emotion: 'neutral',
    traits: ['CONVERSATIONAL_CHARISMA', 'QUICK_COGNITIVE_RHYTHM'],
    varied: ['charisma'],
    performanceDirection: `${ADULT_CONVERSATIONAL_BASE} Charisma test — magnetic but still conversational.`,
  },
];

/** Sibling round when CLOSE on any non-Soft_Girl voice — keep base voice, vary performance */
export function ndxSiblingTerritoriesFromParent(providerVoiceId: string): NeuralCastingTerritory[] {
  const base = NDX_NEURAL_CASTING_ROUND_1.find((t) => t.providerVoiceId === providerVoiceId);
  if (!base) return NDX_SIBLING_TERRITORIES_FROM_SOFT_GIRL;
  return [
    { ...base, label: 'VOICE A', territory: 'SAME WOMAN / DRIER', speed: Math.max(0.9, base.speed - 0.04), pitch: base.pitch - 1, vocalCharacter: 'Same woman — drier delivery, less polished' },
    { ...base, label: 'VOICE B', territory: 'SAME WOMAN / MORE WARMTH', speed: base.speed + 0.03, pitch: base.pitch + 1, vocalCharacter: 'Same woman — slightly more warmth and looseness' },
    { ...base, label: 'VOICE C', territory: 'SAME WOMAN / MORE ATTITUDE', speed: base.speed + 0.05, pitch: base.pitch + 1, vocalCharacter: 'Same woman — more attitude, conversational edge' },
    { ...base, label: 'VOICE D', territory: 'SAME WOMAN / MORE GROUNDED', speed: base.speed - 0.03, pitch: base.pitch - 1, vocalCharacter: 'Same woman — more grounded cadence, adult weight' },
  ];
}

export function resolveNdxCastingTerritories(state: CharacterVoiceCalibrationState): {
  territories: NeuralCastingTerritory[];
  sessionMessage: string;
  roundQuestion: string;
} {
  const closeParent = state.neuralCandidates.find((c) => c.founderStatus === 'CLOSE' || c.founderStatus === 'YES');
  const neuralRoundCount = state.rounds.filter((r) => r.isNeuralRound).length;

  if (closeParent) {
    const territories =
      closeParent.providerVoiceId === 'Soft_Girl'
        ? NDX_SIBLING_TERRITORIES_FROM_SOFT_GIRL
        : ndxSiblingTerritoriesFromParent(closeParent.providerVoiceId);
    return {
      territories,
      sessionMessage: "I'M STARTING TO HEAR HER.",
      roundQuestion: 'Same line — refining the woman you kept. Which feels closer?',
    };
  }

  if (neuralRoundCount === 0) {
    return {
      territories: NDX_NEURAL_CASTING_ROUND_1,
      sessionMessage: "LET'S FIND HER ACTUAL VOICE.",
      roundQuestion: 'Which adult conversational presence feels closest — even if not her yet?',
    };
  }

  return {
    territories: NDX_NEURAL_CASTING_ROUND_1,
    sessionMessage: "LET'S FIND HER ACTUAL VOICE.",
    roundQuestion: 'New neural candidates — same line, different women.',
  };
}

export function applyNdxCastingTerritoryPlan(state: CharacterVoiceCalibrationState): CharacterVoiceCalibrationState {
  const plan = resolveNdxCastingTerritories(state);
  return {
    ...state,
    castingTerritoryPlan: plan.territories,
    sessionMessage: plan.sessionMessage,
    pendingRoundQuestion: plan.roundQuestion,
  };
}
