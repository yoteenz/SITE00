/**
 * Character Development formation prompt — full dimensional discovery.
 */

import type { BrandCharacterIntelligenceSnapshot, BrandCharacterTerritory } from './types.js';
import type { BrandCharacterDevelopmentDelta } from './developmentTypes.js';
import { extractTerritoryDistillation } from './providerSchemaMapping.js';

export const DEVELOPMENT_PROMPT_VERSION = 'BRAND_CHARACTER_DEVELOPMENT_V1';

export const BRAND_CHARACTER_DEVELOPMENT_SYSTEM_PROMPT = `You are the Brand Character Development Director for Studio World.

A promising Brand Character TERRITORY has been selected. Discover the FULL dimensional character —
how this entity actually thinks, jokes, reacts, relates, exercises taste, participates in culture,
and leaves evidence on artifacts.

Use the immutable parent territory as governing seed. Do NOT use presentation concepts as answers.
Force behavioral specificity — not adjectives.

Return JSON with: coreCharacter, intellectualCharacter, socialCharacter, emotionalCharacter,
humorSystem (behaviorally modeled), culturalIntelligence (behaviorally modeled),
languageCharacter, tasteCharacter, expressiveBehavior, artifactBehavior,
productiveTension, allowedRange, antiDirections.

Humor system must include: humorSource, humorTarget, humorMechanism, humorTemperature,
timingBehavior, crueltyBoundary, seriousnessBoundary, culturalDependency.
Cultural intelligence must be behavioral — reference insertion alone is insufficient.
Artifact behavior describes what the character DOES to artifacts — not visual style prescription.`;

export function buildCharacterDevelopmentPayload(params: {
  territory: BrandCharacterTerritory;
  snapshot: BrandCharacterIntelligenceSnapshot;
  founderDelta?: BrandCharacterDevelopmentDelta | null;
  parentJudgment?: string | null;
}): Record<string, unknown> {
  const distillation = extractTerritoryDistillation(params.territory);
  return {
    developmentLevel: 'BRAND_CHARACTER_DEVELOPMENT',
    parentTerritory: {
      id: params.territory.id,
      name: params.territory.name,
      distillation,
      mustNeverBecome: params.territory.whatItMustNeverBecome,
    },
    founderDevelopmentDelta: params.founderDelta ?? null,
    parentFounderJudgment: params.parentJudgment ?? null,
    intelligenceSnapshotFingerprint: params.snapshot.fingerprint,
    behavioralQuestions: [
      'What makes this character change its mind?',
      'What makes it immediately suspicious?',
      'What does it notice that others miss?',
      'What genuinely delights vs irritates it?',
      'How does it behave when right vs when wrong?',
      'What does it find funny and WHY?',
      'Where does humor stop?',
      'How does culture affect what it notices, assumes, finds funny?',
      'What would its fingerprints look like on a touched artifact?',
    ],
    antiDirections: [
      'Do not collapse into generic expert/rebel/observer archetypes',
      'Do not prescribe visual style (handwriting, collage, scrapbook)',
      'Do not use presentation concepts as character answers',
    ],
  };
}
