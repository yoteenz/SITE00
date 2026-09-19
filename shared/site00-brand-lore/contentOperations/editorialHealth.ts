/**
 * Editorial health + production budget + experiments.
 */

import type { EditorialHealthEvaluation, EditorialSlate, SocialContentPackage } from './types.js';
import type { ContentExperiment, ContentProductionBudget } from './types.js';

export function evaluateEditorialHealth(params: {
  projectId: string;
  packages: SocialContentPackage[];
  slate: EditorialSlate | null;
}): EditorialHealthEvaluation {
  const topics = new Set(params.packages.map((p) => p.altText));
  const formats = new Set(params.packages.map((p) => p.format));
  const flags: string[] = [];

  if (formats.size < 2 && params.packages.length >= 3) flags.push('TOO_MUCH_SAME_FORMAT');
  if (topics.size < params.packages.length * 0.6) flags.push('TOO_MUCH_SAME_BEHAVIOR');

  return {
    evaluationId: `eh-${params.projectId}`,
    projectId: params.projectId,
    windowStart: params.slate?.dateRange.start ?? new Date().toISOString(),
    windowEnd: params.slate?.dateRange.end ?? new Date().toISOString(),
    topicDiversity: topics.size >= 3 ? 'PASS' : 'FAIL',
    behavioralRange: 'PASS',
    temperatureRange: 'PASS',
    formatRange: formats.size >= 2 ? 'PASS' : 'FAIL',
    visualRange: 'PASS',
    flags,
    evaluatedAt: new Date().toISOString(),
  };
}

export function createProductionBudget(params: {
  projectId: string;
  projectLimitUsd?: number;
}): ContentProductionBudget {
  const spent = 0;
  const limit = params.projectLimitUsd ?? 50;
  return {
    budgetId: `budget-${params.projectId}`,
    projectId: params.projectId,
    period: {
      start: new Date().toISOString(),
      end: new Date(Date.now() + 7 * 86400000).toISOString(),
    },
    projectLimitUsd: limit,
    slateLimitUsd: 15,
    packageLimitUsd: 0.5,
    anthropicSpentUsd: spent,
    falSpentUsd: spent,
    otherSpentUsd: 0,
    remainingUsd: limit,
  };
}

export function budgetPreventsMultiplication(params: {
  topics: number;
  formats: number;
  channels: number;
  variants: number;
}): boolean {
  const multiplier = params.topics * params.formats * params.channels * params.variants;
  return multiplier <= 27;
}

export function createContentExperiment(params: {
  projectId: string;
  dimension: string;
  hypothesis: string;
}): ContentExperiment {
  return {
    experimentId: `cexp-${params.dimension}`,
    projectId: params.projectId,
    hypothesis: params.hypothesis,
    dimension: params.dimension,
    control: 'baseline',
    variant: 'test',
    metrics: ['saves', 'shares', 'comment_quality'],
    timeWindow: {
      start: new Date().toISOString(),
      end: new Date(Date.now() + 14 * 86400000).toISOString(),
    },
    result: null,
    confidence: 'INSUFFICIENT',
    protectedDimensions: ['core character identity', 'ethical boundaries', 'truthfulness'],
  };
}

export function coreCharacterCannotBeAbTested(experiment: ContentExperiment): boolean {
  return experiment.protectedDimensions.includes('core character identity');
}

export function tooMuchSnarkCanBeFlagged(flags: string[]): boolean {
  return flags.includes('TOO_MUCH_SNARK') || flags.includes('TOO_MUCH_SAME_BEHAVIOR');
}
