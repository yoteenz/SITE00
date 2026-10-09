import { ongoingServiceDisclosure, platformDisclosureForFeatures } from '../platform-economics/disclosure';
import { presentEstimate, presentInvestment, presentTimeline } from './presentation';
import { FEATURE_BY_ID, STRUCTURAL_ARCHETYPES, VISUAL_SYSTEM_BY_ID } from './registries';
import type { ClientBlueprintEstimate, ProjectEstimateConfig, ProjectEstimateResult } from './types';

export function formatInvestmentRange(low: number, high: number, expected = (low + high) / 2): string {
  return presentInvestment(low, high, expected).label;
}

export function formatProductionWindow(lowWeeks: number, highWeeks: number): string {
  return presentTimeline(lowWeeks, highWeeks).label;
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
  const presentation = presentEstimate(result);
  return {
    document: 'PROJECTED ESTIMATE',
    binding: false,
    projectType: config.projectType,
    buildLevel: config.buildLevel,
    selectedStructure: structure?.label ?? 'Not selected',
    selectedVisualSystem: visual?.label ?? 'Not selected',
    estimatedFamilyCount: config.families.length,
    complexity: result.complexityBand,
    productionWindow: presentation.timeline.label,
    investmentRange: presentation.investment.label,
    presentationPolicyVersion: presentation.policyVersion,
    canonicalWindowWeeks: { low: result.lowWeeks, high: result.highWeeks },
    canonicalInvestment: {
      low: result.investmentLow,
      expected: result.investmentExpected,
      high: result.investmentHigh,
    },
    timelineFounderReview: presentation.timeline.founderReview,
    investmentFounderReview: presentation.investment.founderReview,
    presentationNote: presentation.note,
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
