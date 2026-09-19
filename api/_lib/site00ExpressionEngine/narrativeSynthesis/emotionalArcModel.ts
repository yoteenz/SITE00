/**
 * C1.0 — Emotional arc derivation from subject and beats.
 */

import type {
  EmotionalArc,
  EmotionalArcState,
  NarrativeBeat,
  NarrativeSynthesisInput,
} from '../../../../shared/site00-expression-engine/narrative-synthesis/types.js';

const DEFAULT_CURIOSITY_ARC: EmotionalArcState[] = [
  'CURIOSITY',
  'RECOGNITION',
  'UNEASE',
  'ANTICIPATION',
  'SURPRISE',
  'DISBELIEF',
  'REALIZATION',
  'SATISFACTION',
  'AFTERSHOCK',
];

export function deriveEmotionalArc(
  input: NarrativeSynthesisInput,
  beats: NarrativeBeat[],
): EmotionalArc {
  const isContradictionEntry =
    input.thesis.toLowerCase().includes('contradiction') ||
    input.thesis.toLowerCase().includes('cringe') ||
    input.lockedPremise?.toLowerCase().includes('tacky');

  const progression =
    beats.length > 0
      ? beats.map((b) => b.emotionalStateAfter)
      : isContradictionEntry
        ? DEFAULT_CURIOSITY_ARC.slice(0, Math.min(beats.length || 9, 9))
        : DEFAULT_CURIOSITY_ARC;

  return {
    progression,
    rationale: isContradictionEntry
      ? 'Contradiction-discovery subject — curiosity through archival unease to realization and aftershock.'
      : 'Derived from beat emotional transitions and subject tone.',
  };
}

export function emotionalArcIsFlat(progression: EmotionalArcState[]): boolean {
  const unique = new Set(progression);
  return unique.size < 3;
}
