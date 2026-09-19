/**
 * P0.5E.3 — Emotional range — cannot live permanently in cool/skeptical/sarcastic.
 */

import { randomId } from './id.js';
import type { EmbodiedCharacterEmotionalRange } from './types.js';

export const REQUIRED_EMOTIONAL_STATES = [
  'amused',
  'annoyed',
  'delighted',
  'confused',
  'curious',
  'embarrassed',
  'excited',
  'wrong',
  'quiet',
  'sad',
  'nostalgic',
  'impressed',
  'skeptical',
  'angry',
  'tender',
  'bored',
  'obsessed',
  'surprised',
  'uncomfortable',
  'proud',
] as const;

export function buildEmbodiedCharacterEmotionalRange(
  overrides: Partial<EmbodiedCharacterEmotionalRange> = {},
): EmbodiedCharacterEmotionalRange {
  return {
    rangeId: randomId('emo'),
    supportedStates: overrides.supportedStates ?? [...REQUIRED_EMOTIONAL_STATES],
    microReaction: overrides.microReaction ?? [],
    fullReaction: overrides.fullReaction ?? [],
    privateReaction: overrides.privateReaction ?? [],
    cameraAwareReaction: overrides.cameraAwareReaction ?? [],
    cameraForgottenReaction: overrides.cameraForgottenReaction ?? [],
  };
}

export function emotionalRangeRequired(range: EmbodiedCharacterEmotionalRange): boolean {
  return range.supportedStates.length >= 10;
}
