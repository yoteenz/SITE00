/**
 * P0.5E.4 — Voice lab — same thought, different channels.
 */

import { VOICE_LAB_CHANNELS } from './constants.js';
import type { FounderDiscoveryJudgment, VoiceLabChannel, VoiceLabSample } from './types.js';

export function buildVoiceLabSample(underlyingThought: string): VoiceLabSample {
  return {
    sampleId: 'voice-lab-sample-1',
    underlyingThought,
    expressions: {
      INNER_THOUGHT: underlyingThought,
      SPOKEN_THOUGHT: underlyingThought.replace(/\.$/, ' — out loud, quieter.'),
      MARGIN: 'wait. · ' + underlyingThought.split(' ').slice(0, 8).join(' ') + '…',
      TIKTOK: 'okay so — ' + underlyingThought,
      BOOK_IN_MOTION: 'She pauses mid-thought. ' + underlyingThought,
      PAGE: underlyingThought,
      CAPTION: underlyingThought.split(' ').slice(0, 12).join(' '),
      TEXT_TO_FRIEND: underlyingThought.toLowerCase().replace(/\.$/, ' lol'),
    },
    judgments: {},
  };
}

export function voiceLabPreservesCharacterIdentity(sample: VoiceLabSample): boolean {
  const channels = VOICE_LAB_CHANNELS.filter((c) => sample.expressions[c]);
  return channels.length >= 5;
}

export function applyVoiceLabJudgment(
  sample: VoiceLabSample,
  channel: VoiceLabChannel,
  judgment: FounderDiscoveryJudgment,
): VoiceLabSample {
  return {
    ...sample,
    judgments: { ...sample.judgments, [channel]: judgment },
  };
}
