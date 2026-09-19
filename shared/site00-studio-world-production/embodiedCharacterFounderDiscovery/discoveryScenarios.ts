/**
 * P0.5E.4 — Scenario builder with escape options.
 */

import { SCENARIO_ESCAPE_OPTIONS } from './constants.js';
import type { CharacterDiscoveryScenario, DiscoveryDomainId, FounderDiscoveryJudgment } from './types.js';

export function buildDiscoveryScenario(params: {
  scenarioId: string;
  domain: DiscoveryDomainId;
  situation: string;
  possibleResponses: string[];
  behavioralImplication: string;
}): CharacterDiscoveryScenario {
  return {
    scenarioId: params.scenarioId,
    domain: params.domain,
    situation: params.situation,
    possibleResponses: params.possibleResponses,
    escapeOptions: SCENARIO_ESCAPE_OPTIONS,
    behavioralImplication: params.behavioralImplication,
    characterEvidence: null,
    founderResponse: null,
    founderJudgment: null,
    confidence: 'UNRESOLVED',
    notes: null,
    followUpPotential: null,
  };
}

export function scenarioSupportsNoneOfThese(scenario: CharacterDiscoveryScenario): boolean {
  return scenario.escapeOptions.includes('NONE_OF_THESE');
}

export function scenarioSupportsSomethingElse(scenario: CharacterDiscoveryScenario): boolean {
  return scenario.escapeOptions.includes('SOMETHING_ELSE');
}

export function scenarioSupportsItDepends(scenario: CharacterDiscoveryScenario): boolean {
  return scenario.escapeOptions.includes('IT_DEPENDS');
}

export function applyScenarioFounderResponse(
  scenario: CharacterDiscoveryScenario,
  response: string,
  judgment: FounderDiscoveryJudgment,
  notes?: string,
): CharacterDiscoveryScenario {
  const isEscape = SCENARIO_ESCAPE_OPTIONS.includes(response as (typeof SCENARIO_ESCAPE_OPTIONS)[number]);
  return {
    ...scenario,
    founderResponse: response,
    founderJudgment: judgment,
    characterEvidence: isEscape ? `Founder rejected options: ${response}` : response,
    confidence: isEscape ? 'UNRESOLVED' : judgment === 'YES_EXACTLY' ? 'STRONG' : 'EMERGING',
    notes: notes ?? null,
  };
}

export function founderRejectionIsData(judgment: FounderDiscoveryJudgment): boolean {
  return ['NO', 'ABSOLUTELY_NOT', 'NONE_OF_THESE', 'TOO_PERFECT', 'TOO_BRAND_LIKE', 'TOO_GENERIC'].includes(judgment);
}
