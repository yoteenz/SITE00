/**
 * ExpressionEngineMaturityScore + FounderRescueRate
 */

import type {
  BenchmarkRunResult,
  BenchmarkRubricScores,
  ExpressionEngineMaturityScore,
  FounderRescueRate,
  MaturityThresholds,
} from '../../../../shared/site00-expression-engine/creative-judgment-intelligence/types.js';
import { DEFAULT_MATURITY_THRESHOLDS } from '../../../../shared/site00-expression-engine/creative-judgment-intelligence/types.js';
import { BENCHMARK_SUITE_VERSION } from './expressionEngineBenchmarkSuite.js';
import { CREATIVE_JUDGMENT_ENGINE_VERSION } from './creativeJudgmentIntelligenceEngine.js';

export function scoreBenchmarkRubric(judgmentOverall: number, founderApproved: boolean): BenchmarkRubricScores {
  const base = judgmentOverall;
  return {
    conceptualDepth: base,
    mechanismOriginality: base,
    brandSpecificity: base,
    channelDifferentiation: base,
    worldBuilding: base,
    copyAuthenticity: base,
    productionUsefulness: base,
    selfCritiqueAccuracy: base,
    territoryDistinctiveness: base,
    founderApprovalRate: founderApproved ? 100 : 0,
  };
}

export function computeExpressionEngineMaturityScore(
  runs: BenchmarkRunResult[],
  thresholds: MaturityThresholds = DEFAULT_MATURITY_THRESHOLDS,
): ExpressionEngineMaturityScore {
  const n = runs.length;
  const median = (arr: number[]) => {
    if (!arr.length) return 0;
    const s = [...arr].sort((a, b) => a - b);
    return s[Math.floor(s.length / 2)]!;
  };

  const conceptual = runs.map((r) => r.rubric.conceptualDepth);
  const packageArch = runs.map((r) => r.rubric.channelDifferentiation);
  const brandFid = runs.map((r) => r.rubric.brandSpecificity);
  const autonomous = runs.map((r) => r.rubric.selfCritiqueAccuracy);

  const genericFails = runs.filter((r) => r.judgment.failureClasses.includes('GENERIC_CONCEPT_REJECTION')).length;
  const resizeFails = runs.filter((r) => r.judgment.failureClasses.includes('RESIZE_ONLY_THINKING')).length;
  const swapFails = runs.filter((r) => r.judgment.failureClasses.includes('BRAND_GENERICITY')).length;
  const leakFails = runs.filter((r) => r.judgment.failureClasses.includes('NDX_LEAK')).length;
  const rescues = runs.filter((r) => r.founderRescueRequired).length;

  const genericFailureRate = n ? genericFails / n : 0;
  const resizeOnlyFailureRate = n ? resizeFails / n : 0;
  const brandSwapFailureRate = n ? swapFails / n : 0;
  const crossBrandLeakRate = n ? leakFails / n : 0;
  const founderRescueRate = n ? rescues / n : 0;

  const conceptualMedian = median(conceptual);
  const operational100Eligible =
    n >= 10 &&
    conceptualMedian >= thresholds.conceptualReasoningMedianMin &&
    genericFailureRate <= thresholds.genericFailureRateMax &&
    resizeOnlyFailureRate <= thresholds.resizeOnlyFailureRateMax &&
    brandSwapFailureRate <= thresholds.brandSwapFailureRateMax &&
    crossBrandLeakRate <= thresholds.crossBrandLeakRateMax &&
    founderRescueRate <= thresholds.founderRescueRateMax;

  const mean = conceptual.reduce((a, b) => a + b, 0) / Math.max(n, 1);
  const variance =
    n > 1 ? conceptual.reduce((acc, v) => acc + (v - mean) ** 2, 0) / (n - 1) : 0;

  return {
    maturityId: `maturity-${Date.now()}`,
    engineVersion: CREATIVE_JUDGMENT_ENGINE_VERSION,
    benchmarkVersion: BENCHMARK_SUITE_VERSION,
    reasoningMode: runs[0]?.reasoningMode ?? 'DETERMINISTIC',
    sampleSize: n,
    conceptualReasoningMedian: conceptualMedian,
    packageArchitectureMedian: median(packageArch),
    brandFidelityMedian: median(brandFid),
    autonomousJudgmentMedian: median(autonomous),
    genericFailureRate,
    resizeOnlyFailureRate,
    brandSwapFailureRate,
    crossBrandLeakRate,
    founderRescueRate,
    selfCritiqueAccuracy: median(runs.map((r) => r.rubric.selfCritiqueAccuracy)),
    operational100Eligible,
    variance,
    computedAt: new Date().toISOString(),
  };
}

export function computeFounderRescueRate(runs: BenchmarkRunResult[], period = 'all'): FounderRescueRate {
  const rescueRuns = runs.filter((r) => r.founderRescueRequired);
  return {
    period,
    totalRuns: runs.length,
    rescueRuns: rescueRuns.length,
    ratePercent: runs.length ? Math.round((rescueRuns.length / runs.length) * 100) : 0,
    rescueReasons: rescueRuns.flatMap((r) => r.judgment.failureClasses).slice(0, 10),
  };
}
