/**
 * P0.CSI.1 — Upstream layer feeding CreativeConceptTerritory (does not replace it).
 */

import type {
  CampaignExpressionBrief,
  CampaignStrategyType,
  ConceptTerritorySeedHint,
} from './types.js';
import { getStrategyDefinition } from './strategyLibrary.js';

const TERRITORY_SEEDS: Partial<Record<CampaignStrategyType, Omit<ConceptTerritorySeedHint, 'strategySource'>>> = {
  LIVED_IN_ENVIRONMENTAL: {
    territoryName: 'Lived-In World Discovery',
    centralConcept: 'The audience enters a believable environment where the product is discovered, not announced.',
    worldPremise: 'A real or art-directed space carries narrative; product appears through details, hands, and motifs.',
    contentBehavior: 'Progressive visual sequence with low copy; recurring objects create cohesion.',
    primaryVisualMechanism: 'Environmental detail → indirect product → human presence → payoff reveal',
  },
  HERO_PRODUCT_REVEAL: {
    territoryName: 'Product as Protagonist',
    centralConcept: 'Every frame builds toward a definitive product reveal moment.',
    worldPremise: 'Controlled visual world in service of product suspense.',
    contentBehavior: 'Tight composition arc with delayed payoff.',
    primaryVisualMechanism: 'Tease → macro detail → hero reveal',
  },
  HIGH_CONCEPT_EDITORIAL: {
    territoryName: 'Concept-First Editorial World',
    centralConcept: 'A single visual metaphor organizes the entire campaign.',
    worldPremise: 'Stylized art direction where idea leads execution.',
    contentBehavior: 'Bold symbolic frames with editorial copy optional.',
    primaryVisualMechanism: 'Metaphor establishment → variation → signature image',
  },
  INTIMATE_DOCUMENTARY: {
    territoryName: 'Close Observation',
    centralConcept: 'Private, candid moments reveal brand truth without performance.',
    worldPremise: 'Imperfect, close framing feels observed rather than staged.',
    contentBehavior: 'Quiet beats; voice or caption minimal.',
    primaryVisualMechanism: 'Candid detail → human moment → soft product presence',
  },
  SOCIAL_OBSERVATION: {
    territoryName: 'Cultural Truth Lens',
    centralConcept: 'Campaign opens on a recognizable behavior or contradiction.',
    worldPremise: 'Commentary world where wit meets relatability.',
    contentBehavior: 'Observational hook → brand tie-in → payoff.',
    primaryVisualMechanism: 'Behavior frame → tension → brand resolution',
  },
};

export function generateConceptTerritorySeedsFromBrief(
  brief: CampaignExpressionBrief,
): ConceptTerritorySeedHint[] {
  const primary = brief.stack.primaryStrategy;
  const seed = TERRITORY_SEEDS[primary];
  const def = getStrategyDefinition(primary);

  const hints: ConceptTerritorySeedHint[] = [];

  if (seed) {
    hints.push({ ...seed, strategySource: primary });
  } else {
    hints.push({
      territoryName: def.name,
      centralConcept: def.description,
      worldPremise: `Campaign world driven by ${def.defaultEnvironmentRole.replace(/_/g, ' ').toLowerCase()}`,
      contentBehavior: def.traits.join('; '),
      primaryVisualMechanism: def.defaultShotRhythm.join(' → '),
      strategySource: primary,
    });
  }

  for (const secondary of brief.stack.secondaryStrategies.slice(0, 2)) {
    const secSeed = TERRITORY_SEEDS[secondary];
    if (secSeed) {
      hints.push({ ...secSeed, strategySource: secondary });
    }
  }

  return hints;
}

export function territoriesDifferByStrategy(
  a: CampaignStrategyType,
  b: CampaignStrategyType,
): boolean {
  return a !== b;
}
