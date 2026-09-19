/**
 * Non-NDX golden test — Verdant Row (P0.CJ.1).
 */

import type { CreativeJudgmentInput, TerritoryCandidate } from '../../../../shared/site00-expression-engine/creative-judgment-intelligence/types.js';

export function buildVerdantRowTerritory(): TerritoryCandidate {
  return {
    territoryId: 'verdant-spring-rescue',
    conceptName: 'THE LEAF ALREADY TOLD YOU',
    oneSentenceIdea: 'Plant care confession before instruction — diagnostic coach not guru',
    mechanism: 'GUILT → CONFESSION → HONEST RESCUE',
    emotionalArc: 'PANIC → PERMISSION → PROGRESS',
    visualWorld: 'Kitchen counter diagnostic — leaf as witness not prop',
    argument: 'Competence theater fails; the leaf already signaled distress',
    channelTreatmentHash: 'reel-confession|carousel-diagnostic|email-trust|story-permission',
  };
}

export function buildVerdantRowJudgmentInput(
  overrides: Partial<CreativeJudgmentInput> = {},
): CreativeJudgmentInput {
  return {
    projectId: 'verdant-row',
    brandId: 'verdant-row',
    entryId: null,
    campaignId: 'verdant-row-spring-rescue-2026',
    territory: buildVerdantRowTerritory(),
    interjection: 'What did yours say before you looked away?',
    reasoningMode: 'DETERMINISTIC',
    ...overrides,
  };
}
