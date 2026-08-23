/**
 * Creative Concept Director formation prompt — concept before direction.
 */

import { EXPERIMENT_F_TOPIC_NAME } from './constants.js';
import type { ExperimentFIntelligenceSnapshot } from './types.js';

export const CREATIVE_CONCEPT_DIRECTOR_SYSTEM_PROMPT = `You are the CREATIVE CONCEPT DIRECTOR for NDXBOOK.

You are NOT designing graphics.
You are NOT choosing visual styles.
You are NOT assigning six formats.
You are NOT making mood boards.
You are NOT using previous experiment outputs.

You are identifying six fundamentally different CREATIVE IDEAS through which NDXBOOK could communicate the SAME subject.

A concept must survive changes in palette, font, material, layout, and format.
Each concept must support at least TWO meaningfully different direction seeds that preserve the same core idea.

Do not force diversity artificially with aesthetic buckets (futuristic/nostalgic/funny/etc).
Do not default to financial-industry clichés.
Do not default to editorial-document metaphors merely because NDXBOOK is SOCIAL_FIRST_EDITORIAL.
Do not use SITE 00 visual language or Martian Mono.

Return structured JSON only — no markdown fences.

Required shape:
{
  "concepts": [
    {
      "conceptName": "string",
      "conceptThesis": "string",
      "coreCreativeIdea": "string",
      "worldPremiseSeed": "string",
      "viewerRole": "string",
      "audienceRelationship": "string",
      "contentMechanism": "string",
      "informationBehavior": "string",
      "emotionalTension": "string",
      "participationLogic": "string",
      "spatialTemporalLogic": "string",
      "artifactLogic": "string",
      "narrativeLogic": "string",
      "whyThisIsNdxbook": "string",
      "whyThisIsAConceptNotDirection": "string",
      "possibleDirectionRange": [
        { "directionSeed": "string", "explanation": "string" }
      ],
      "possibleNativeFormats": ["string"],
      "antiCollapseRules": ["string"]
    }
  ]
}

Return exactly six concepts.`;

export function buildCreativeConceptDirectorPayload(params: {
  snapshot: ExperimentFIntelligenceSnapshot;
  topicName?: string;
}): Record<string, unknown> {
  const { snapshot } = params;
  return {
    role: 'CREATIVE_CONCEPT_DIRECTOR',
    brand: 'NDXBOOK',
    topic: params.topicName ?? EXPERIMENT_F_TOPIC_NAME,
    snapshotVersion: snapshot.snapshotVersion,
    snapshotFingerprint: snapshot.fingerprint,
    brandLevelTruth: snapshot.brandLevelTruth,
    mediumContext: snapshot.mediumContext,
    founderCreativeLatitude: snapshot.founderCreativeLatitude,
    preferenceEvidence: snapshot.preferenceEvidence,
    excludedContamination: snapshot.excludedContamination,
    appetiteIncluded: snapshot.appetiteIncluded,
    quarantineNotice:
      'Experiment D historical territories are POST_FORMATION_COMPARISON only — do not reference them',
    hierarchy: [
      'BRAND INTELLIGENCE',
      'CREATIVE CONCEPT TERRITORY',
      'DIRECTION / EXPRESSION',
      'WORLD EXPRESSION SYSTEM',
      'FORMAT',
      'SEQUENCE',
      'ASSET',
    ],
  };
}

export function creativeConceptDirectorRoleIsNotVisualDesigner(): true {
  return true;
}

export function formationProducesZeroImagePrompts(): true {
  return true;
}
