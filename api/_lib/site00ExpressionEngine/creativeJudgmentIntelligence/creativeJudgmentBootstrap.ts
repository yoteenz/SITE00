/**
 * Bootstrap + maturity dashboard payload.
 */

import type {
  BenchmarkRunResult,
  MaturityScoreHistoryEntry,
} from '../../../../shared/site00-expression-engine/creative-judgment-intelligence/types.js';
import { runCreativeJudgmentIntelligence, getCreativeJudgmentArchitectureStack, CREATIVE_JUDGMENT_ENGINE_VERSION } from './creativeJudgmentIntelligenceEngine.js';
import { buildEntry003JudgmentInput } from './entry003GoldenFixture.js';
import { buildVerdantRowJudgmentInput } from './verdantRowGoldenFixture.js';
import { computeExpressionEngineMaturityScore, computeFounderRescueRate, scoreBenchmarkRubric } from './expressionEngineMaturityScore.js';
import { getBenchmarkCoverage, EXPRESSION_ENGINE_BENCHMARK_BRIEFS, BENCHMARK_SUITE_VERSION } from './expressionEngineBenchmarkSuite.js';
import { computeSelfCritiqueAccuracy, listFounderJudgmentRecords } from './founderJudgmentMemory.js';
import { runCreativeSelfRevisionLoop } from './creativeSelfRevisionLoop.js';

const history: MaturityScoreHistoryEntry[] = [];

export function bootstrapCreativeJudgmentMaturityDashboard() {
  const entry003 = runCreativeJudgmentIntelligence(buildEntry003JudgmentInput());
  const verdantRow = runCreativeJudgmentIntelligence(buildVerdantRowJudgmentInput());
  const entry003Revision = runCreativeSelfRevisionLoop(buildEntry003JudgmentInput());

  const sampleRuns: BenchmarkRunResult[] = [entry003, verdantRow].map((judgment, i) => ({
    runId: `sample-${i}`,
    briefId: judgment.entryId ?? judgment.campaignId,
    judgment,
    rubric: scoreBenchmarkRubric(judgment.overallScore, judgment.decision === 'ADVANCE'),
    founderRescueRequired: judgment.decision === 'REVISE' && judgment.overallScore < 70,
    benchmarkVersion: BENCHMARK_SUITE_VERSION,
    engineVersion: CREATIVE_JUDGMENT_ENGINE_VERSION,
    reasoningMode: judgment.reasoningMode,
    createdAt: judgment.createdAt,
  }));

  const maturity = computeExpressionEngineMaturityScore(sampleRuns);
  history.push({
    date: maturity.computedAt,
    engineVersion: maturity.engineVersion,
    reasoningMode: maturity.reasoningMode,
    brandId: null,
    category: null,
    maturity,
  });

  return {
    engineVersion: CREATIVE_JUDGMENT_ENGINE_VERSION,
    architectureStack: getCreativeJudgmentArchitectureStack(),
    benchmarkCoverage: getBenchmarkCoverage(),
    benchmarkBriefCount: EXPRESSION_ENGINE_BENCHMARK_BRIEFS.length,
    entry003Golden: entry003,
    verdantRowGolden: verdantRow,
    entry003SelfRevision: entry003Revision,
    maturity,
    founderRescueRate: computeFounderRescueRate(sampleRuns),
    selfCritiqueAccuracy: computeSelfCritiqueAccuracy(),
    founderJudgmentCount: listFounderJudgmentRecords().length,
    maturityHistory: history.slice(-20),
    visualAuthority: 'VISUAL_AUTHORITY_REQUIRED',
  };
}
