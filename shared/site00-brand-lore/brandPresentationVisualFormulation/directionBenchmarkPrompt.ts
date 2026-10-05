/**
 * Anthropic direction benchmark formulation — semantic visual translation before FAL.
 */

import type { BrandPresentationDirectionCandidate } from '../brandPresentationDirectionTerritory/types.js';
import type { FrozenParentConceptSnapshot } from '../brandPresentationDirectionTerritory/types.js';
import { PARENT_CONCEPT_METAPHOR_GUARDS } from './constants.js';
import { DIRECTION_BENCHMARK_PROMPT_VERSION } from './promptCompiler.js';

export const DIRECTION_BENCHMARK_FORMATION_SYSTEM_PROMPT = `You are the Brand Presentation Direction Visual Benchmark director for NDXBOOK.
Your job is to formulate ONE visual benchmark contract for ONE locked Brand Presentation Direction.
You do NOT invent new directions. You do NOT change brand posture, audience relationship, publishing logic, or knowledge behavior.
You translate direction BEHAVIOR into a visual system the founder can judge — not metaphor illustration.
Do NOT literalize parent concept names (Room, Noticing, Collector) unless the specific direction independently justifies it.
Return strict JSON only — one benchmark object, not an image prompt for a provider.`;

export function buildDirectionBenchmarkFormationPayload(params: {
  parentConcept: FrozenParentConceptSnapshot;
  direction: BrandPresentationDirectionCandidate;
}): string {
  const metaphorGuards = PARENT_CONCEPT_METAPHOR_GUARDS[params.parentConcept.name] ?? [];

  return JSON.stringify(
    {
      task: 'Formulate one direction visual benchmark contract for founder review',
      promptVersion: DIRECTION_BENCHMARK_PROMPT_VERSION,
      parentConcept: {
        id: params.parentConcept.id,
        name: params.parentConcept.name,
        thesis: params.parentConcept.conceptThesis,
        brandBehavior: params.parentConcept.brandBehavior,
        recurrenceEngine: params.parentConcept.recurrenceEngine,
      },
      direction: {
        id: params.direction.directionId,
        name: params.direction.directionName,
        thesis: params.direction.directionThesis,
        brandBehavior: params.direction.brandBehavior,
        audienceRelationship: params.direction.audienceRelationship,
        publishingBehavior: params.direction.publishingBehavior,
        knowledgeBehavior: params.direction.knowledgeBehavior,
        recurrenceBehavior: params.direction.recurrenceBehavior,
        recognitionMechanism: params.direction.recognitionMechanism,
        antiCollapseRules: params.direction.antiCollapseRules,
        notThis: params.direction.notThis,
      },
      metaphorSanitation: {
        parentConceptName: params.parentConcept.name,
        doNotLiteralize: metaphorGuards,
        default: 'BEHAVIORAL_VISUAL_TRANSLATION not METAPHOR_ILLUSTRATION',
      },
      outputSchema: {
        benchmark: {
          benchmarkThesis: 'string — what this direction should look and feel like',
          visualTranslation: 'string — behavioral visual translation summary',
          compositionBehavior: 'string',
          typographyBehavior: 'string',
          imageryBehavior: 'string',
          graphicBehavior: 'string',
          artifactBehavior: 'string',
          informationBehavior: 'string',
          densityBehavior: 'string',
          rhythmBehavior: 'string',
          socialNativeBehavior: 'string',
          recognitionMechanism: 'string',
          recurrenceEvidence: 'string',
          directionFidelityRequirements: ['string'],
          antiLiteralizationRules: ['string'],
          negativeDirection: ['string'],
        },
      },
      constraints: [
        'Exactly 1 benchmark per direction',
        'Social-native presentation system IN ACTION — not logo board, moodboard, or platform chrome',
        'No raw direction JSON as art direction',
        'No SITE 00 host or Projects UX inheritance',
        'No Experiment F or D visual authority',
      ],
    },
    null,
    2,
  );
}

export type RawDirectionBenchmarkPayload = {
  benchmarkThesis: string;
  visualTranslation: string;
  compositionBehavior: string;
  typographyBehavior: string;
  imageryBehavior: string;
  graphicBehavior: string;
  artifactBehavior: string;
  informationBehavior: string;
  densityBehavior: string;
  rhythmBehavior: string;
  socialNativeBehavior: string;
  recognitionMechanism: string;
  recurrenceEvidence: string;
  directionFidelityRequirements: string[];
  antiLiteralizationRules: string[];
  negativeDirection: string[];
};
