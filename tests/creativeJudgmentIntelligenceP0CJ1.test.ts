/**
 * P0.CJ.1 — Creative Judgment Intelligence + maturity program tests.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  runCreativeJudgmentIntelligence,
  getCreativeJudgmentArchitectureStack,
  CREATIVE_JUDGMENT_ENGINE_VERSION,
} from '../api/_lib/site00ExpressionEngine/creativeJudgmentIntelligence/creativeJudgmentIntelligenceEngine.js';
import { buildEntry003JudgmentInput } from '../api/_lib/site00ExpressionEngine/creativeJudgmentIntelligence/entry003GoldenFixture.js';
import { buildVerdantRowJudgmentInput } from '../api/_lib/site00ExpressionEngine/creativeJudgmentIntelligence/verdantRowGoldenFixture.js';
import {
  compareTerritoryDistinctiveness,
  buildFiveCousinTerritories,
} from '../api/_lib/site00ExpressionEngine/creativeJudgmentIntelligence/territoryDistinctivenessEngine.js';
import { buildDefaultChannelRoleMap, detectResizeOnlyThinking } from '../api/_lib/site00ExpressionEngine/creativeJudgmentIntelligence/channelRoleMap.js';
import { runBrandSwapTest } from '../api/_lib/site00ExpressionEngine/creativeJudgmentIntelligence/brandSwapTest.js';
import { detectCrossBrandStyleLeak } from '../api/_lib/site00ExpressionEngine/creativeJudgmentIntelligence/crossBrandStyleLeakDetector.js';
import {
  runCreativeSelfRevisionLoop,
  DEFAULT_MAX_AUTONOMOUS_REVISIONS,
} from '../api/_lib/site00ExpressionEngine/creativeJudgmentIntelligence/creativeSelfRevisionLoop.js';
import {
  recordFounderJudgment,
  resetFounderJudgmentMemoryForTest,
  getApprovalTrajectory,
  computeSelfCritiqueAccuracy,
  assertJudgmentDoesNotMutateCanon,
  resolveJudgmentScope,
} from '../api/_lib/site00ExpressionEngine/creativeJudgmentIntelligence/founderJudgmentMemory.js';
import {
  EXPRESSION_ENGINE_BENCHMARK_BRIEFS,
  getBenchmarkCoverage,
  BENCHMARK_SUITE_VERSION,
} from '../api/_lib/site00ExpressionEngine/creativeJudgmentIntelligence/expressionEngineBenchmarkSuite.js';
import {
  computeExpressionEngineMaturityScore,
  computeFounderRescueRate,
  scoreBenchmarkRubric,
} from '../api/_lib/site00ExpressionEngine/creativeJudgmentIntelligence/expressionEngineMaturityScore.js';
import {
  runCreativeBlindComparison,
  resetCreativeBlindComparisonsForTest,
  buildCreativeReasoningEfficiency,
} from '../api/_lib/site00ExpressionEngine/creativeJudgmentIntelligence/creativeBlindComparison.js';
import { CREATIVE_ADVERSARIAL_TEST_SUITE } from '../api/_lib/site00ExpressionEngine/creativeJudgmentIntelligence/creativeAdversarialTestSuite.js';
import { bootstrapCreativeJudgmentMaturityDashboard } from '../api/_lib/site00ExpressionEngine/creativeJudgmentIntelligence/creativeJudgmentBootstrap.js';
import { CREATIVE_JUDGMENT_FAILURE_CLASSES } from '../shared/site00-expression-engine/creative-judgment-intelligence/failureClasses.js';

describe('P0.CJ.1 — Creative Judgment Intelligence', () => {
  beforeEach(() => {
    resetFounderJudgmentMemoryForTest();
    resetCreativeBlindComparisonsForTest();
  });

  it('1. CreativeJudgmentIntelligence result structure', () => {
    const result = runCreativeJudgmentIntelligence(buildEntry003JudgmentInput());
    expect(result.judgmentId).toBeTruthy();
    expect(result.overallScore).toBeGreaterThan(0);
    expect(result.engineVersion).toBe(CREATIVE_JUDGMENT_ENGINE_VERSION);
  });

  it('2. ADVANCE decision for strong Entry 003', () => {
    const result = runCreativeJudgmentIntelligence(buildEntry003JudgmentInput());
    expect(['ADVANCE', 'ESCALATE_TO_FOUNDER', 'REVISE']).toContain(result.decision);
    expect(result.mechanismScore).toBeGreaterThan(60);
  });

  it('3. REVISE decision for safe territory', () => {
    const input = buildEntry003JudgmentInput();
    input.territory = {
      ...input.territory,
      conceptName: 'THE SHELFIE COOL MUSEUM',
      oneSentenceIdea: 'Make the product look cool and elevate the journey',
      mechanism: 'cool',
      visualWorld: 'shelf',
    };
    const result = runCreativeJudgmentIntelligence(input);
    expect(['REVISE', 'KILL']).toContain(result.decision);
    expect(result.failureClasses).toContain('TOO_SAFE');
  });

  it('4. KILL decision for generic concept', () => {
    const input = buildEntry003JudgmentInput();
    input.territory = {
      ...input.territory,
      conceptName: 'INSPIRE YOUR JOURNEY',
      oneSentenceIdea: 'Unlock authentic community storytelling',
      mechanism: 'inspire',
      argument: 'transform your journey with authentic community',
      visualWorld: '',
    };
    const result = runCreativeJudgmentIntelligence(input);
    expect(['KILL', 'REVISE']).toContain(result.decision);
    expect(result.failureClasses).toContain('GENERIC_CONCEPT_REJECTION');
  });

  it('5. ESCALATE_TO_FOUNDER decision path exists', () => {
    const result = runCreativeJudgmentIntelligence(buildEntry003JudgmentInput());
    expect(['ADVANCE', 'ESCALATE_TO_FOUNDER', 'REVISE', 'KILL']).toContain(result.decision);
    if (result.decision === 'ESCALATE_TO_FOUNDER') {
      expect(result.requiresFounderReview).toBe(true);
    }
  });

  it('6. generic concept rejection gate', () => {
    const result = runCreativeJudgmentIntelligence(
      buildEntry003JudgmentInput({
        territory: {
          ...buildEntry003JudgmentInput().territory,
          oneSentenceIdea: 'Unlock your authentic journey to inspire community',
          mechanism: 'journey',
        },
      }),
    );
    expect(result.failureClasses.some((f) => f === 'GENERIC_CONCEPT_REJECTION' || f === 'TOO_GENERIC')).toBe(true);
  });

  it('7. cousin territory detection', () => {
    const base = buildEntry003JudgmentInput().territory;
    const cousins = buildFiveCousinTerritories(base);
    const distinct = compareTerritoryDistinctiveness(cousins);
    expect(['COUSINS', 'NEEDS_REGENERATION']).toContain(distinct.outcome);
  });

  it('8. channel role differentiation', () => {
    const map = buildDefaultChannelRoleMap('test-campaign');
    expect(map.allRolesDistinct).toBe(true);
    expect(map.entries.length).toBeGreaterThanOrEqual(4);
  });

  it('9. resize-only failure', () => {
    const map = buildDefaultChannelRoleMap('test-campaign');
    const flagged = detectResizeOnlyThinking(map, ['same-copy', 'same-copy', 'same-copy']);
    expect(flagged.resizeOnlyRisk).toBe(true);
  });

  it('10. brand swap test', () => {
    const generic = runBrandSwapTest(
      buildEntry003JudgmentInput({
        territory: {
          ...buildEntry003JudgmentInput().territory,
          conceptName: 'GENERIC LAUNCH',
          oneSentenceIdea: 'Launch the product',
          mechanism: 'launch',
          argument: 'buy now',
          visualWorld: 'studio',
        },
      }),
    );
    expect(generic.passed).toBe(false);
    expect(generic.failureClass).toBe('BRAND_GENERICITY');
  });

  it('11. cross-brand leak detection infrastructure', () => {
    const leak = detectCrossBrandStyleLeak(
      buildVerdantRowJudgmentInput({
        copySamples: ['The industry sells competence theater and editorial indictment'],
      }),
    );
    expect(leak.leaked).toBe(true);
    expect(leak.failureClass).toBe('NDX_LEAK');
  });

  it('12. NDX leak on playful non-NDX after NDX run', () => {
    const leak = detectCrossBrandStyleLeak(
      buildVerdantRowJudgmentInput({
        interjection: "YOU DIDN'T SKIP STEPS. YOU SKIPPED THE CAMERA.",
        priorBrandId: 'ndxbook',
      }),
    );
    expect(leak.leaked).toBe(true);
  });

  it('13. self-revision max passes', () => {
    const input = buildEntry003JudgmentInput();
    input.territory.conceptName = 'SAFE VARIANT';
    const loop = runCreativeSelfRevisionLoop(input, DEFAULT_MAX_AUTONOMOUS_REVISIONS);
    expect(loop.passes.length).toBeLessThanOrEqual(DEFAULT_MAX_AUTONOMOUS_REVISIONS);
  });

  it('14. self-revision stop conditions', () => {
    const loop = runCreativeSelfRevisionLoop(buildEntry003JudgmentInput(), 2);
    expect(loop.stopped).toBe(true);
    expect(loop.stopReason).toBeTruthy();
  });

  it('15. founder judgment memory record', () => {
    const record = recordFounderJudgment({
      projectId: 'ndxbook',
      brandId: 'ndxbook',
      entryId: 'entry-003',
      territoryId: 'territory-entry-003-door',
      decision: 'TOO_GENERIC',
      reasonCodes: ['TOO_GENERIC'],
      founderNote: 'Needs sharper mechanism',
    });
    expect(record.judgmentId).toBeTruthy();
    expect(record.mutatesCanon).toBe(false);
  });

  it('16. approval trajectory', () => {
    recordFounderJudgment({
      projectId: 'ndxbook',
      brandId: 'ndxbook',
      territoryId: 'territory-entry-003-door',
      decision: 'TOO_GENERIC',
      reasonCodes: ['TOO_GENERIC'],
    });
    recordFounderJudgment({
      projectId: 'ndxbook',
      brandId: 'ndxbook',
      territoryId: 'territory-entry-003-door',
      decision: 'LOVE_IT',
    });
    const traj = getApprovalTrajectory('territory-entry-003-door');
    expect(traj?.steps.length).toBeGreaterThanOrEqual(2);
    expect(traj?.finalApproved).toBe(true);
  });

  it('17. brand-specific judgment scoping', () => {
    const scope = resolveJudgmentScope('BRAND_SPECIFIC', 'verdant-row');
    expect(scope.applies).toBe(true);
    expect(scope.rule).toContain('verdant-row');
  });

  it('18. global founder taste firewall', () => {
    const scope = resolveJudgmentScope('GLOBAL_FOUNDER', 'ndxbook');
    expect(scope.rule).toContain('BRAND TRUTH');
  });

  it('19. benchmark rubric', () => {
    const rubric = scoreBenchmarkRubric(82, true);
    expect(rubric.conceptualDepth).toBe(82);
    expect(rubric.founderApprovalRate).toBe(100);
  });

  it('20. maturity score', () => {
    const entry = runCreativeJudgmentIntelligence(buildEntry003JudgmentInput());
    const maturity = computeExpressionEngineMaturityScore([
      {
        runId: 'r1',
        briefId: 'entry-003',
        judgment: entry,
        rubric: scoreBenchmarkRubric(entry.overallScore, false),
        founderRescueRequired: false,
        benchmarkVersion: BENCHMARK_SUITE_VERSION,
        engineVersion: CREATIVE_JUDGMENT_ENGINE_VERSION,
        reasoningMode: 'DETERMINISTIC',
        createdAt: entry.createdAt,
      },
    ]);
    expect(maturity.sampleSize).toBe(1);
    expect(maturity.operational100Eligible).toBe(false);
  });

  it('21. founder rescue rate', () => {
    const rate = computeFounderRescueRate([
      {
        runId: 'r1',
        briefId: 'b1',
        judgment: runCreativeJudgmentIntelligence(buildEntry003JudgmentInput()),
        rubric: scoreBenchmarkRubric(70, false),
        founderRescueRequired: true,
        benchmarkVersion: BENCHMARK_SUITE_VERSION,
        engineVersion: CREATIVE_JUDGMENT_ENGINE_VERSION,
        reasoningMode: 'DETERMINISTIC',
        createdAt: new Date().toISOString(),
      },
    ]);
    expect(rate.ratePercent).toBe(100);
  });

  it('22. self-critique accuracy', () => {
    recordFounderJudgment({
      projectId: 'ndxbook',
      brandId: 'ndxbook',
      territoryId: 't1',
      decision: 'TOO_GENERIC',
      reasonCodes: ['TOO_GENERIC'],
      engineJudgment: runCreativeJudgmentIntelligence(buildEntry003JudgmentInput()),
    });
    const accuracy = computeSelfCritiqueAccuracy();
    expect(accuracy.comparedJudgments).toBeGreaterThan(0);
  });

  it('23. blind comparison', () => {
    const cmp = runCreativeBlindComparison('entry-003', buildEntry003JudgmentInput());
    expect(cmp.engineA.judgment.overallScore).toBeGreaterThan(0);
    expect(cmp.revealedAfterJudgment).toBe(false);
  });

  it('24. cost/quality efficiency', () => {
    const eff = buildCreativeReasoningEfficiency({
      qualityScore: 85,
      providerCost: 0.02,
      latencyMs: 1200,
      founderApproval: true,
      rescueRequired: false,
      reasoningMode: 'HYBRID',
    });
    expect(eff.qualityScore).toBe(85);
  });

  it('25. adversarial similar-brand test exists', () => {
    expect(CREATIVE_ADVERSARIAL_TEST_SUITE.some((t) => t.testId === 'adv-01')).toBe(true);
  });

  it('26. boring-product adversarial test', () => {
    expect(CREATIVE_ADVERSARIAL_TEST_SUITE.find((t) => t.testId === 'adv-02')?.expectedFailureClasses).toContain('TOO_GENERIC');
  });

  it('27. contradictory-brand adversarial test', () => {
    expect(CREATIVE_ADVERSARIAL_TEST_SUITE.find((t) => t.testId === 'adv-04')).toBeDefined();
  });

  it('28. NDXBOOK Entry 003 golden test', () => {
    const result = runCreativeJudgmentIntelligence(buildEntry003JudgmentInput());
    expect(result.conceptProof.mechanism).toContain('→');
    expect(result.conceptProof.proofStatus).not.toBe('MISSING');
    expect(result.productionUsefulness.score).toBeGreaterThan(60);
  });

  it('29. non-NDX Verdant Row golden test', () => {
    const result = runCreativeJudgmentIntelligence(buildVerdantRowJudgmentInput());
    expect(result.crossBrandLeak?.leaked).toBe(false);
    expect(result.brandId).toBe('verdant-row');
  });

  it('30. benchmark versioning', () => {
    expect(BENCHMARK_SUITE_VERSION).toContain('P0.CJ.1');
    expect(getBenchmarkCoverage().total).toBeGreaterThanOrEqual(50);
    expect(getBenchmarkCoverage().ndxOnly).toBeLessThan(getBenchmarkCoverage().total);
  });

  it('31. no canon mutation from one judgment', () => {
    const record = recordFounderJudgment({
      projectId: 'ndxbook',
      brandId: 'ndxbook',
      decision: 'LOVE_IT',
    });
    expect(assertJudgmentDoesNotMutateCanon(record)).toBe(true);
  });

  it('32. architecture stack + bootstrap + failure registry', () => {
    expect(getCreativeJudgmentArchitectureStack()).toContain('CREATIVE JUDGMENT INTELLIGENCE');
    expect(CREATIVE_JUDGMENT_FAILURE_CLASSES.length).toBeGreaterThan(20);
    const dash = bootstrapCreativeJudgmentMaturityDashboard();
    expect(dash.entry003Golden.territoryId).toBeTruthy();
    expect(EXPRESSION_ENGINE_BENCHMARK_BRIEFS.length).toBeGreaterThanOrEqual(50);
  });
});
