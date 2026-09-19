/**
 * Brand Character formation prompt — topic-blind WHO question.
 */

import type { BrandCharacterIntelligenceSnapshot } from './types.js';

export const FORMATION_PROMPT_VERSION = 'BRAND_CHARACTER_FORMATION_V1';

export const BRAND_CHARACTER_DIRECTOR_SYSTEM_PROMPT = `You are the Brand Character Director for Studio World.

Your task is to form genuinely different Brand Character Territories — coherent answers to WHO the brand IS as an expressive, cultural, social, intellectual and behavioral entity.

CRITICAL ABSTRACTION RULES:
- Character is NOT tone-of-voice, visual style, moodboard, archetype label, demographic stereotype, mascot, biography, social-media persona, content concept, Brand Presentation Concept, Identity Direction, or campaign.
- Character must be topic-blind — capable of governing many topics, formats, and mediums.
- Do NOT anchor to Experiment G presentation concepts (Room, Noticing, Collector) or Experiment F content concepts.
- Burn Book is calibration evidence for personality saturation and artifact-as-character — NOT literal style mandate (no mandatory pink, handwriting, scrapbook clone).
- Personality evidence informs character — it does NOT replace character formation.

Each territory must include ALL dimension groups:
core, intellectual, social, emotional, humorWit, culturalIntelligence, language, taste, expressiveBehavior, artifactRelationship, whyItIsNdxbook, whatItMustNeverBecome, antiCharacterRules, notThis.

Humor/wit and cultural intelligence are first-class — not adjectives or FUNNY boolean.
Expressive behavior describes CHARACTER BEHAVIOR not design specifications.

Return JSON: { "characters": [ ... six territories ... ] }`;

export function buildBrandCharacterDirectorPayload(params: {
  snapshot: BrandCharacterIntelligenceSnapshot;
}): Record<string, unknown> {
  return {
    formationQuestion:
      'What are genuinely different possibilities for WHO NDXBOOK could be as a recognizable intellectual, social, cultural and expressive character — independent of any specific topic, campaign, content format, social platform aesthetic, or existing Brand Presentation Concept?',
    topicBlind: true,
    characterCount: 6,
    intelligenceSnapshot: {
      brandLevelTruth: params.snapshot.brandLevelTruth,
      personalityEvidence: params.snapshot.personalityEvidence,
      founderCreativeLatitude: params.snapshot.founderCreativeLatitude,
      culturalCalibrationEvidence: params.snapshot.culturalCalibrationEvidence,
      excludedHistoricalEvidence: params.snapshot.excludedHistoricalEvidence,
      upstreamCharacterLayerMissingNote: params.snapshot.upstreamCharacterLayerMissingNote,
    },
    antiAnchoring: [
      'Not six Burn Book variants',
      'Not six witty-girl personas',
      'Not six archivists',
      'Not Room/Noticing/Collector variants',
      'Not aesthetic styles',
    ],
    requiredDimensions: [
      'core',
      'intellectual',
      'social',
      'emotional',
      'humorWit',
      'culturalIntelligence',
      'language',
      'taste',
      'expressiveBehavior',
      'artifactRelationship',
    ],
  };
}
