/**
 * Brand Presentation Direction formation prompt — one parent concept → three directions.
 */

import { BRAND_PRESENTATION_DIRECTION_TERRITORY_V1, DIRECTIONS_PER_PARENT_CONCEPT } from './constants.js';
import type { FrozenParentConceptSnapshot } from './types.js';

export const DIRECTION_FORMATION_PROMPT_VERSION = 'BRAND_PRESENTATION_DIRECTION_V1';

export const BRAND_PRESENTATION_DIRECTION_SYSTEM_PROMPT = `You are the BRAND PRESENTATION DIRECTION DIRECTOR for NDXBOOK.

You are forming BRAND PRESENTATION DIRECTIONS beneath an already-approved parent BRAND PRESENTATION CONCEPT.

This is NOT visual generation.
Do NOT specify palettes, typography, exact compositions, mockups, interfaces, logos, or social post layouts.
Do NOT choose topics, campaigns, content pillars, or post formats.
Do NOT use CREDIT UTILIZATION or any specific financial topic.
Do NOT reference Experiment F content concepts, Experiment D imagery, Projects UX, Host Visual Memory, or prior workbench visuals.

A Brand Presentation Direction answers:
"Given this approved parent concept, what specific creative interpretation could govern how NDXBOOK presents itself, behaves, communicates, publishes, and becomes recognizable?"

Return exactly ${DIRECTIONS_PER_PARENT_CONCEPT} directions that are:
- faithful to the complete parent concept record (not the title alone)
- materially different from each other in brand behavior (not color/style alone)
- topic-independent and recurrence-capable
- each with at least 3 possibleExpressionSeeds proving visual latitude later

Return structured JSON only — no markdown fences.

Required shape:
{
  "directions": [
    {
      "directionName": "string",
      "directionThesis": "string",
      "directionInterpretation": "string",
      "brandPosture": "string",
      "audienceRelationship": "string",
      "brandBehavior": "string",
      "editorialBehavior": "string",
      "publishingBehavior": "string",
      "knowledgeBehavior": "string",
      "authorityBehavior": "string",
      "participationBehavior": "string",
      "recurrenceBehavior": "string",
      "artifactBehavior": "string",
      "temporalBehavior": "string",
      "informationRevelationLogic": "string",
      "emotionalTemperature": "string",
      "culturalPosture": "string",
      "socialNativeBehavior": "string",
      "recognitionMechanism": "string",
      "topicIndependence": "string",
      "expansionPotential": "string",
      "visualImplications": "string",
      "visualFreedom": "string",
      "possibleExpressionSeeds": [{ "seed": "string", "explanation": "string" }],
      "antiCollapseRules": ["string"],
      "notThis": ["string"]
    }
  ]
}`;

export function buildBrandPresentationDirectionPayload(params: {
  parent: FrozenParentConceptSnapshot;
}): Record<string, unknown> {
  const { parent } = params;
  return {
    role: 'BRAND_PRESENTATION_DIRECTION_DIRECTOR',
    brand: 'NDXBOOK',
    methodologyVersion: BRAND_PRESENTATION_DIRECTION_TERRITORY_V1,
    formationPromptVersion: DIRECTION_FORMATION_PROMPT_VERSION,
    parentConcept: parent,
    directionsRequired: DIRECTIONS_PER_PARENT_CONCEPT,
    topicBlind: true,
    visualGenerationBlocked: true,
    instructions: [
      'Maximize interpretation diversity among the three sibling directions',
      'Do not literalize parent metaphor unless earned by behavior',
      'Condition on complete parent concept — title alone is insufficient',
    ],
  };
}

export function directionFormationPromptExcludesCreditUtilization(): boolean {
  return !BRAND_PRESENTATION_DIRECTION_SYSTEM_PROMPT.toLowerCase().includes('credit utilization as subject');
}
