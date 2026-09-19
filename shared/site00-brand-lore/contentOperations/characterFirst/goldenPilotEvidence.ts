/**
 * P0.5E.7A — Golden pilot visual evidence + negative collapse evidence.
 */

import {
  CHARACTER_FIRST_CREDIT_UTILIZATION_NORTH_STAR_ID,
  NEGATIVE_CHARACTER_COLLAPSE_EVIDENCE_ID,
} from './constants.js';

export type VisualEvidenceRegistration = {
  evidenceId: string;
  role: 'NORTH_STAR' | 'NEGATIVE_EVIDENCE';
  description: string;
  useAsLiteralTemplate: false;
  teaches: string[];
};

export const CHARACTER_FIRST_CREDIT_UTILIZATION_NORTH_STAR: VisualEvidenceRegistration = {
  evidenceId: CHARACTER_FIRST_CREDIT_UTILIZATION_NORTH_STAR_ID,
  role: 'NORTH_STAR',
  description:
    'Founder-approved credit utilization moodboard — personal premise, NDX participation, thought progression, hand-built notebook construction, evidence integration, first-person learning, behavior change, bookmark ending',
  useAsLiteralTemplate: false,
  teaches: [
    'personal premise',
    'NDX participation',
    'thought progression',
    'hand-built notebook construction',
    'evidence integration',
    'first-person learning',
    'behavior change',
    'bookmark ending',
  ],
};

export const NEGATIVE_CHARACTER_COLLAPSE_EVIDENCE: VisualEvidenceRegistration = {
  evidenceId: NEGATIVE_CHARACTER_COLLAPSE_EVIDENCE_ID,
  role: 'NEGATIVE_EVIDENCE',
  description:
    'Latest subscription-style genericized regeneration — notebook styling alone insufficient; NDX character collapsed to topic explainer',
  useAsLiteralTemplate: false,
  teaches: ['notebook styling alone is insufficient', 'character premise must survive regeneration'],
};

export function registerGoldenPilotEvidence(): VisualEvidenceRegistration[] {
  return [CHARACTER_FIRST_CREDIT_UTILIZATION_NORTH_STAR, NEGATIVE_CHARACTER_COLLAPSE_EVIDENCE];
}

export function creditUtilizationCharacterFirstNorthStarRegistered(): boolean {
  return CHARACTER_FIRST_CREDIT_UTILIZATION_NORTH_STAR.evidenceId === CHARACTER_FIRST_CREDIT_UTILIZATION_NORTH_STAR_ID;
}

export function genericizedRegenerationRegisteredAsNegativeEvidence(): boolean {
  return NEGATIVE_CHARACTER_COLLAPSE_EVIDENCE.role === 'NEGATIVE_EVIDENCE';
}

import { buildContentSeedFilmHandoff } from './filmHandoff.js';
import type { CharacterFirstRegenerationBundle, ContentSeedFilmHandoff, NDXContentSeed } from './types.js';

export function buildContentSeedFilmHandoffWithCharacterPremise(
  seed: NDXContentSeed,
  bundle: CharacterFirstRegenerationBundle,
): ContentSeedFilmHandoff {
  const base = buildContentSeedFilmHandoff(seed);
  return {
    ...base,
    openingBeat: bundle.premiseAuthority.characterBeat,
    reelArc: [
      bundle.premiseAuthority.incitingIncident,
      bundle.premiseAuthority.firstReaction,
      ...bundle.thoughtArcSnapshot.beats,
      bundle.premiseAuthority.currentView,
    ],
    payoff: bundle.premiseAuthority.bookTrace.replace(/_/g, ' '),
  };
}
