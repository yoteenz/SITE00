/**
 * Brand Presentation Concept Director formation prompt — topic-blind, brand-level.
 */

import { BRAND_PRESENTATION_CONCEPT_TERRITORY_V1 } from './constants.js';
import type { BrandPresentationIntelligenceSnapshot } from './types.js';

export const FORMATION_PROMPT_VERSION = 'BRAND_PRESENTATION_DIRECTOR_V1';

export const BRAND_PRESENTATION_DIRECTOR_SYSTEM_PROMPT = `You are the BRAND PRESENTATION DIRECTOR for NDXBOOK.

You are NOT inventing six posts.
You are NOT inventing six campaigns.
You are NOT explaining a topic six ways.
You are NOT selecting visual styles.
You are NOT selecting social formats.
You are NOT producing six editorial-document metaphors (book, notebook, encyclopedia, index, newspaper, magazine, journal, dossier, archive, publication).

You are proposing six fundamentally different answers to:

"What kind of persistent expressive social entity could NDXBOOK become?"

Each answer must be capable of governing a large body of future NDXBOOK communication across many unrelated subjects.

Brand Presentation formation is TOPIC-BLIND.
Do NOT use CREDIT UTILIZATION or any specific financial topic as the formation subject.
Do NOT reference Experiment F content concepts or Experiment D historical concepts.

A Brand Presentation Concept must:
- describe how NDXBOOK exists, behaves, communicates, and establishes audience relationship
- survive changes in subject matter (topic independence)
- support at least THREE materially different creative direction seeds beneath it
- support recurring publishing without exhausting after one campaign
- remain valid without a specific visual style, format, or editorial artifact

Return structured JSON only — no markdown fences.

Required shape:
{
  "concepts": [
    {
      "name": "string",
      "conceptThesis": "string",
      "brandExistenceModel": "string",
      "audienceRelationship": "string",
      "brandBehavior": "string",
      "publishingLogic": "string",
      "artifactLogic": "string",
      "knowledgeBehavior": "string",
      "authorityModel": "string",
      "participationLogic": "string",
      "recurrenceEngine": "string",
      "topicIndependence": "string",
      "socialNativeBehavior": "string",
      "expansionPotential": "string",
      "possibleDirectionRange": [
        { "directionSeed": "string", "explanation": "string" }
      ],
      "antiCollapseRules": ["string"],
      "notThis": ["string"]
    }
  ]
}

Return exactly six concepts.`;

export function buildBrandPresentationDirectorPayload(params: {
  snapshot: BrandPresentationIntelligenceSnapshot;
}): Record<string, unknown> {
  const { snapshot } = params;
  return {
    role: 'BRAND_PRESENTATION_DIRECTOR',
    brand: 'NDXBOOK',
    formationSubject: null,
    topicBlind: true,
    methodologyVersion: BRAND_PRESENTATION_CONCEPT_TERRITORY_V1,
    formationPromptVersion: FORMATION_PROMPT_VERSION,
    snapshotVersion: snapshot.snapshotVersion,
    snapshotFingerprint: snapshot.fingerprint,
    brandLevelTruth: snapshot.brandLevelTruth,
    brandPersonality: snapshot.brandPersonality,
    primaryExpressionContext: snapshot.primaryExpressionContext,
    founderCreativeLatitude: snapshot.founderCreativeLatitude,
    preferenceEvidence: snapshot.preferenceEvidence,
    referenceEvidence: snapshot.referenceEvidence,
    excludedHistoricalEvidence: snapshot.excludedHistoricalEvidence,
    calibrationNotice:
      'FOUNDER_REFERENCE_EVIDENCE for abstraction-level calibration only — not mandatory canon, not the answer, not a literal artifact requirement',
    hierarchy: [
      'BRAND INTELLIGENCE',
      'BRAND PRESENTATION CONCEPT TERRITORY',
      'BRAND / SOCIAL EXPRESSION SYSTEM',
      'CONTENT STRATEGY',
      'CONTENT CONCEPT TERRITORY',
      'TOPIC',
      'FORMAT',
      'SEQUENCE',
      'ASSETS',
    ],
    formationQuestion:
      'What are six genuinely different conceptual territories for how NDXBOOK itself could exist, present, behave, and become recognizable as a persistent social brand?',
  };
}

export function formationProducesZeroImagePrompts(): true {
  return true;
}

export function formationPromptExcludesCreditUtilization(text: string): boolean {
  return !text.toLowerCase().includes('credit utilization');
}
