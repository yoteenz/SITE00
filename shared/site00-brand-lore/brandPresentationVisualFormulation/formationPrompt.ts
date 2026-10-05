/**
 * Anthropic expression formulation prompt — semantic visual systems before FAL.
 */

import type { BrandPresentationDirectionCandidate } from '../brandPresentationDirectionTerritory/types.js';
import type { FrozenParentConceptSnapshot } from '../brandPresentationDirectionTerritory/types.js';
import { VISUAL_FORMULATION_PROMPT_VERSION } from './promptCompiler.js';

export const EXPRESSION_FORMATION_SYSTEM_PROMPT = `You are the Brand Presentation Visual Formulation director for NDXBOOK.
Your job is to formulate THREE genuinely different visual expression systems for ONE locked Brand Presentation Direction.
You do NOT invent new directions. You do NOT change brand posture, audience relationship, publishing logic, or knowledge behavior.
Each expression must embody the SAME direction through materially different visual logic.
Difference must span composition, information density, rhythm, image/text relationship, artifact behavior, typography, spatial organization, hierarchy, recurrence pattern, and graphic system — NOT palette or serif/sans swaps alone.
Return strict JSON only.`;

export function buildExpressionFormationPayload(params: {
  parentConcept: FrozenParentConceptSnapshot;
  direction: BrandPresentationDirectionCandidate;
}): string {
  return JSON.stringify(
    {
      task: 'Formulate three visual expression candidates (A, B, C) for the locked direction',
      promptVersion: VISUAL_FORMULATION_PROMPT_VERSION,
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
      outputSchema: {
        expressions: [
          {
            expressionLabel: 'A | B | C',
            expressionName: 'string',
            expressionThesis: 'string',
            directionInterpretation: 'string',
            visualBehavior: 'string',
            compositionBehavior: 'string',
            typographyBehavior: 'string',
            imageryBehavior: 'string',
            graphicLanguage: 'string',
            artifactLanguage: 'string',
            informationBehavior: 'string',
            densityBehavior: 'string',
            rhythmBehavior: 'string',
            recurrenceBehavior: 'string',
            socialSurfaceBehavior: 'string',
            motionPotential: 'string',
            materialPotential: 'string',
            recognitionMechanism: 'string',
            variationLogic: 'string',
            brandFidelity: 'string',
            directionFidelity: 'string',
            visualDistinctiveness: 'string',
            antiCollapseRules: ['string'],
            notThis: ['string'],
          },
        ],
      },
      constraints: [
        'Exactly 3 expressions',
        'Same direction fidelity for all three',
        'Material behavioral differences across multiple dimensions',
        'No FAL prompts — formulation only',
        'No SITE 00 host or Projects UX inheritance',
      ],
    },
    null,
    2,
  );
}

export type RawExpressionPayload = {
  expressionLabel: 'A' | 'B' | 'C';
  expressionName: string;
  expressionThesis: string;
  directionInterpretation: string;
  visualBehavior: string;
  compositionBehavior: string;
  typographyBehavior: string;
  imageryBehavior: string;
  graphicLanguage: string;
  artifactLanguage: string;
  informationBehavior: string;
  densityBehavior: string;
  rhythmBehavior: string;
  recurrenceBehavior: string;
  socialSurfaceBehavior: string;
  motionPotential: string;
  materialPotential: string;
  recognitionMechanism: string;
  variationLogic: string;
  brandFidelity: string;
  directionFidelity: string;
  visualDistinctiveness: string;
  antiCollapseRules: string[];
  notThis: string[];
};
