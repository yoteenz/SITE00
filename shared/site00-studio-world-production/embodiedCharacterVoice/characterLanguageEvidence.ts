/**
 * P0.5E.4B — Character Language Evidence (reclassified from P0.5E.4 Voice Lab).
 * Language Lab answers WHAT WORDS — not vocal identity.
 */

import { randomUUID } from 'node:crypto';
import { VOICE_LAB_CHANNELS } from '../embodiedCharacterFounderDiscovery/constants.js';
import type { VoiceLabSample } from '../embodiedCharacterFounderDiscovery/types.js';
import type { CharacterLanguageEvidence } from './types.js';
import type { VoiceLabChannel } from '../embodiedCharacterFounderDiscovery/types.js';

export function migrateVoiceLabSampleToLanguageEvidence(sample: VoiceLabSample): CharacterLanguageEvidence[] {
  const records: CharacterLanguageEvidence[] = [];
  const at = new Date().toISOString();
  for (const channel of VOICE_LAB_CHANNELS) {
    const spokenCopy = sample.expressions[channel];
    if (!spokenCopy) continue;
    records.push({
      evidenceId: randomUUID(),
      underlyingThought: sample.underlyingThought,
      channel,
      spokenCopy,
      context: null,
      audience: channelAudience(channel),
      emotionalState: null,
      intention: null,
      founderJudgment: sample.judgments[channel] ?? null,
      founderRevision: null,
      directFounderLanguageEvidence: null,
      immutable: true,
      migratedFromVoiceLabSampleId: sample.sampleId,
      at,
    });
  }
  return records;
}

function channelAudience(channel: VoiceLabChannel): string {
  switch (channel) {
    case 'TIKTOK':
      return 'public short-form audience';
    case 'TEXT_TO_FRIEND':
      return 'close friend';
    case 'MARGIN':
      return 'private annotation';
    case 'INNER_THOUGHT':
      return 'self';
    case 'SPOKEN_THOUGHT':
      return 'self out loud';
    case 'BOOK_IN_MOTION':
      return 'narrated scene';
    case 'PAGE':
      return 'published page reader';
    case 'CAPTION':
      return 'social caption reader';
    default:
      return 'general';
  }
}

export function languageLabSeparateFromVoiceLab(): true {
  return true;
}

export function preserveHistoricalLanguageEvidence(evidence: CharacterLanguageEvidence[]): boolean {
  return evidence.every((e) => e.immutable === true);
}

export function selectComparisonSpokenCopy(evidence: CharacterLanguageEvidence[]): string {
  const spoken = evidence.find((e) => e.channel === 'SPOKEN_THOUGHT');
  if (spoken) return spoken.spokenCopy.toUpperCase();
  const tiktok = evidence.find((e) => e.channel === 'TIKTOK');
  if (tiktok) return tiktok.spokenCopy.toUpperCase();
  if (evidence.length > 0) return evidence[0]!.spokenCopy.toUpperCase();
  return 'OKAY, SO... THAT CANNOT BE RIGHT. SOMEBODY WOULD HAVE SAID SOMETHING BY NOW.';
}

export function buildCharacterLanguageEvidence(params: {
  underlyingThought: string;
  channel: VoiceLabChannel;
  spokenCopy: string;
  context?: string;
  audience?: string;
  emotionalState?: string;
  intention?: string;
}): CharacterLanguageEvidence {
  return {
    evidenceId: randomUUID(),
    underlyingThought: params.underlyingThought,
    channel: params.channel,
    spokenCopy: params.spokenCopy,
    context: params.context ?? null,
    audience: params.audience ?? null,
    emotionalState: params.emotionalState ?? null,
    intention: params.intention ?? null,
    founderJudgment: null,
    founderRevision: null,
    directFounderLanguageEvidence: null,
    immutable: true,
    migratedFromVoiceLabSampleId: null,
    at: new Date().toISOString(),
  };
}
