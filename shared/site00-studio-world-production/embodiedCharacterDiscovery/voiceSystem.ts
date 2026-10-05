/**
 * P0.5E.3 — Voice system — inner/spoken/margin/page/caption distinct.
 */

import { randomId } from './id.js';
import type { EmbodiedCharacterVoiceSystem } from './types.js';

export function buildEmbodiedCharacterVoiceSystem(
  overrides: Partial<EmbodiedCharacterVoiceSystem> = {},
): EmbodiedCharacterVoiceSystem {
  return {
    voiceId: randomId('voi'),
    innerVoice: overrides.innerVoice ?? 'TBD — discovery',
    spokenVoice: overrides.spokenVoice ?? 'TBD — discovery',
    marginVoice: overrides.marginVoice ?? 'TBD — discovery',
    pageVoice: overrides.pageVoice ?? 'TBD — discovery',
    captionVoice: overrides.captionVoice ?? 'TBD — discovery',
    sentenceRhythm: overrides.sentenceRhythm ?? 'TBD — discovery',
    swearingBoundary: overrides.swearingBoundary ?? 'TBD — discovery',
  };
}

export function voiceChannelsDistinct(voice: EmbodiedCharacterVoiceSystem): boolean {
  const channels = [voice.innerVoice, voice.spokenVoice, voice.marginVoice, voice.pageVoice, voice.captionVoice];
  const unique = new Set(channels.filter((c) => c && c !== 'TBD — discovery'));
  return unique.size >= 2 || channels.some((c) => c.includes('unfinished') || c.includes('TikTok'));
}
