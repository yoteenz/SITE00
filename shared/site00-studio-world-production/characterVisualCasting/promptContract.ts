/**
 * P0.5E.4C — Character casting prompt contract (one truth, controlled variation axes).
 */

import { randomUUID } from 'node:crypto';
import { CASTING_NEGATIVE_CONSTRAINTS, CASTING_VARIATION_AXES } from './constants.js';
import type {
  CastingVariationAxis,
  CharacterCastingPromptContract,
  CharacterTruthSnapshot,
} from './types.js';

const CULTURAL_IDENTITY_BLOCK = `Contemporary African-American woman. Editorial ease, cultural fluency, non-stereotyped representation. Natural/protective hair possibilities. Lived-in styling — not generic luxury influencer.`;

export function compileCharacterCastingPromptContract(params: {
  snapshot: CharacterTruthSnapshot;
  variationAxis: CastingVariationAxis;
}): CharacterCastingPromptContract {
  const summary = params.snapshot.characterSummary?.text ?? 'Founder-confirmed character truth';
  const axisLabel = params.variationAxis.replace(/_/g, ' ').toLowerCase();

  return {
    contractId: randomUUID(),
    snapshotId: params.snapshot.snapshotId,
    variationAxis: params.variationAxis,
    sections: {
      characterTruth: summary,
      culturalIdentity: CULTURAL_IDENTITY_BLOCK,
      ageRange: 'Mid-30s editorial presence — believable, not teen glam',
      facePresence: 'Intelligent, approachable, camera-comfortable without performing',
      hair: 'Protective styles or natural texture — authentic, not fantasy',
      beauty: 'Premium but natural skin texture — no plastic gloss',
      wardrobe: 'Black and neutrals dominate; signature accent feels chosen',
      jewelry: 'Gold jewelry may feel lived-in, not costume',
      posture: 'Looks like she had somewhere to be whether camera showed up or not',
      cameraRelationship: params.snapshot.cameraBehavior.map((c) => c.text).join(' · ') || 'At ease, not performing for content',
      environment: 'Upscale but real-world interior or transit — not AI fantasy luxury',
      light: 'Premium natural editorial light — golden hour or soft window',
      realism: 'Photorealistic, socially native, nearly indistinguishable from real editorial still',
      negativeIdentityConstraints: CASTING_NEGATIVE_CONSTRAINTS.join('; '),
      variationAxis: `Controlled variation on ${axisLabel} only — same character truth`,
      continuityIntent: 'Plausible manifestation of the same psychological character — not six random women',
    },
  };
}

export function buildInitialCastingPromptMatrix(
  snapshot: CharacterTruthSnapshot,
): CharacterCastingPromptContract[] {
  return CASTING_VARIATION_AXES.slice(0, 6).map((axis) =>
    compileCharacterCastingPromptContract({ snapshot, variationAxis: axis }),
  );
}

export function promptContractsShareCharacterTruth(contracts: CharacterCastingPromptContract[]): boolean {
  if (contracts.length < 2) return true;
  const base = contracts[0]?.sections.characterTruth;
  return contracts.every((c) => c.sections.characterTruth === base);
}
