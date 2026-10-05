/**
 * P0.CSI.1 — Strategy stacking + conflict detection.
 */

import type {
  CampaignExpressionLanguage,
  CampaignStrategyStack,
  CampaignStrategyType,
  StrategyConflict,
} from './types.js';
import { getStrategyDefinition } from './strategyLibrary.js';

const CONFLICT_PAIRS: Array<[CampaignStrategyType, CampaignStrategyType, string]> = [
  [
    'INTIMATE_DOCUMENTARY',
    'HERO_PRODUCT_REVEAL',
    'Intimate documentary + max-intensity hero product may feel over-staged',
  ],
  ['ANTI_CAMPAIGN_DEADPAN', 'EVENTIZED_DROP', 'Deadpan restraint conflicts with launch hype energy'],
  ['RECEIPT_PROOF', 'WORLD_BUILDING', 'Proof-first documentation may undermine fictional world logic'],
];

export function buildCampaignStrategyStack(input: {
  primaryStrategy: CampaignStrategyType;
  secondaryStrategies?: CampaignStrategyType[];
  expressionLanguages?: CampaignExpressionLanguage[];
}): CampaignStrategyStack {
  const primary = getStrategyDefinition(input.primaryStrategy);
  const secondary = (input.secondaryStrategies ?? []).filter((s) => s !== input.primaryStrategy);
  const langs =
    input.expressionLanguages ??
    primary.compatibleExpressionLanguages.slice(0, 4);

  const conflicts = detectStrategyConflicts(input.primaryStrategy, secondary);
  const synergies = detectSynergies(input.primaryStrategy, secondary);

  const risk =
    conflicts.length > 0
      ? ('HIGH' as const)
      : primary.defaultProfile.visualRisk === 'EXPERIMENTAL'
        ? ('EXPERIMENTAL' as const)
        : primary.defaultProfile.visualRisk;

  return {
    primaryStrategy: input.primaryStrategy,
    secondaryStrategies: secondary,
    expressionLanguages: langs,
    conflicts,
    synergies,
    risk,
    recommendedUse: buildRecommendedUse(input.primaryStrategy, secondary),
  };
}

function detectStrategyConflicts(
  primary: CampaignStrategyType,
  secondary: CampaignStrategyType[],
): StrategyConflict[] {
  const all = [primary, ...secondary];
  const conflicts: StrategyConflict[] = [];

  for (const [a, b, msg] of CONFLICT_PAIRS) {
    if (all.includes(a) && all.includes(b)) {
      conflicts.push({
        kind: 'EXPRESSION_CONFLICT',
        message: msg,
        strategies: [a, b],
      });
    }
  }

  const primaryDef = getStrategyDefinition(primary);
  for (const sec of secondary) {
    const secDef = getStrategyDefinition(sec);
    if (
      primaryDef.defaultProfile.polishLevel === 'HIGH' &&
      secDef.defaultProfile.polishLevel === 'LOW' &&
      primaryDef.defaultProductRole === 'HERO' &&
      secDef.defaultHumanRole === 'NO_HUMAN'
    ) {
      conflicts.push({
        kind: 'INTENSITY_CONFLICT',
        message: 'Polished hero product + raw object-only secondary may feel disjointed',
        strategies: [primary, sec],
      });
    }
  }

  return conflicts;
}

function detectSynergies(primary: CampaignStrategyType, secondary: CampaignStrategyType[]): string[] {
  const synergies: string[] = [];
  const all = new Set([primary, ...secondary]);

  if (all.has('LIVED_IN_ENVIRONMENTAL') && all.has('MICRO_NARRATIVE_SERIES')) {
    synergies.push('Environmental world + episodic beats create breadcrumb discovery');
  }
  if (all.has('LIVED_IN_ENVIRONMENTAL') && all.has('EVENTIZED_DROP')) {
    synergies.push('Lived-in setting + drop timing builds anticipation inside the world');
  }
  if (all.has('ONE_LOCATION_STUDY') && all.has('LIVED_IN_ENVIRONMENTAL')) {
    synergies.push('Single location maximizes production efficiency for environmental narrative');
  }
  if (all.has('FOUND_OBJECT_DISCOVERY') && all.has('VISUAL_GAME')) {
    synergies.push('Discovery mechanics + visual game increase audience participation');
  }

  return synergies;
}

function buildRecommendedUse(primary: CampaignStrategyType, secondary: CampaignStrategyType[]): string {
  const parts = [`Lead with ${primary.replace(/_/g, ' ').toLowerCase()}`];
  if (secondary.length) {
    parts.push(`layer ${secondary.map((s) => s.replace(/_/g, ' ').toLowerCase()).join(' + ')}`);
  }
  return parts.join('; ');
}
