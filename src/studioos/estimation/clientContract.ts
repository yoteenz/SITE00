import { ongoingServiceDisclosure, platformDisclosureForFeatures } from '../platform-economics/disclosure';
import { FEATURE_BY_ID, STRUCTURAL_ARCHETYPES, VISUAL_SYSTEM_BY_ID } from './registries';
import type { ClientBlueprintEstimate, ProjectEstimateConfig, ProjectEstimateResult } from './types';

function moneyThousands(value: number): number {
  return Math.max(1, Math.round(value / 1000));
}

export function formatInvestmentRange(low: number, high: number): string {
  const left = moneyThousands(low);
  const right = Math.max(left, moneyThousands(high));
  return `$${left}K–$${right}K`;
}

export function formatProductionWindow(lowWeeks: number, highWeeks: number): string {
  const low = Math.max(1, Math.round(lowWeeks));
  const high = Math.max(low, Math.round(highWeeks));
  if (high >= 20) {
    const lowMonths = Math.max(1, Math.round(low / 4.345));
    const highMonths = Math.max(lowMonths, Math.round(high / 4.345));
    return `${lowMonths}–${highMonths} MONTHS`;
  }
  return `${low}–${high} WEEKS`;
}

export function toClientBlueprintEstimate(
  config: ProjectEstimateConfig,
  result: ProjectEstimateResult,
): ClientBlueprintEstimate {
  const structure = STRUCTURAL_ARCHETYPES.find((item) => item.id === config.structuralArchetype);
  const visual = config.visualSystemId ? VISUAL_SYSTEM_BY_ID[config.visualSystemId] : null;
  const delivery =
    config.deliveryMode === 'PRIORITY'
      ? 'Priority production'
      : config.deliveryMode === 'CUSTOM_SCHEDULE'
        ? 'Custom schedule'
        : 'Standard';
  return {
    document: 'PROJECTED ESTIMATE',
    binding: false,
    projectType: config.projectType,
    buildLevel: config.buildLevel,
    selectedStructure: structure?.label ?? 'Not selected',
    selectedVisualSystem: visual?.label ?? 'Not selected',
    estimatedFamilyCount: config.families.length,
    complexity: result.complexityBand,
    productionWindow: formatProductionWindow(result.lowWeeks, result.highWeeks),
    investmentRange: formatInvestmentRange(result.investmentLow, result.investmentHigh),
    deliveryMode: delivery,
    includedSystems: config.featureIds.map((id) => FEATURE_BY_ID[id]?.label ?? id),
    dependencies: result.dependencies.map((edge) => `${edge.from} → ${edge.to}`),
    assumptions: result.assumptions.filter((line) => !line.toLowerCase().includes('family unit')).slice(0, 6),
    whatHappensNext: 'A founder reviews the blueprint. A commercial quote is a later, separate approval.',
    confidence: result.confidence,
    platformUsage: (() => {
      const disclosure = platformDisclosureForFeatures(config.featureIds);
      return {
        applicable: disclosure.platformFeeApplicable,
        rateLabel: disclosure.rateLabel,
        summary: disclosure.summary,
        includedInBuildInvestment: false as const,
        learnHowThisWorks: disclosure.learnHowThisWorks.body,
      };
    })(),
    ongoingService: {
      status: ongoingServiceDisclosure().status,
      summary: ongoingServiceDisclosure().summary,
    },
  };
}
