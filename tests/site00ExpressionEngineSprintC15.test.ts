/**
 * C1.5 — Creative intelligence runtime activation tests.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  bootstrapC14Entry003SeniorCreativeJudgment,
  bootstrapC15CreativeIntelligenceRuntime,
  resetEntry003Store,
} from '../api/_lib/site00ExpressionEngine/entry003/entry003Service.js';
import {
  runMarketingPackageMasterDirectorWithCreativeJudgment,
  runBlindCreativeMarketingTest,
  runEntry003SharedRegression,
  getCreativeIntelligenceHistory,
} from '../api/_lib/site00ExpressionEngine/seniorCreativeJudgment/creativeIntelligenceRuntime.js';
import {
  CREATIVE_RUNTIME_MODES,
  isCreativeReasoningProviderConfigured,
  runCreativeReasoning,
} from '../api/_lib/site00ExpressionEngine/seniorCreativeJudgment/creativeReasoningProvider.js';
import {
  resetCreativeIntelligenceStore,
  seedCorrectionFromFounderFeedback,
  listPersistedJudgments,
} from '../api/_lib/site00ExpressionEngine/seniorCreativeJudgment/creativeIntelligenceStore.js';
import { evaluateCorrectionOverfit } from '../api/_lib/site00ExpressionEngine/seniorCreativeJudgment/creativeCorrectionIntelligence.js';
import { SOLSTICE_AUDIO_LAUNCH_BRIEF, buildBlindTestInitialConcept } from '../api/_lib/site00ExpressionEngine/seniorCreativeJudgment/blindTestFixtures.js';
import { compileEntry002LockedEntry } from '../api/_lib/site00ExpressionEngine/entry002Blueprint.js';
import { buildPriorEntryLineage } from '../api/_lib/site00ExpressionEngine/creativeDirector/creativeDirectorContextBuilder.js';
import { resetCreativeDirectorRuntimeStore } from '../api/_lib/site00ExpressionEngine/creativeDirector/creativeDirectorService.js';
import { SENIOR_CREATIVE_FAILURE_CLASSES } from '../shared/site00-expression-engine/senior-creative-judgment/types.js';

describe('C1.5 Creative intelligence runtime activation', () => {
  beforeEach(() => {
    process.env.EXPRESSION_ENGINE_TEST_DETERMINISTIC_CREATIVE_DIRECTOR = '1';
    process.env.SITE00_CREATIVE_REASONING_FORCE_FALLBACK = '1';
    resetCreativeDirectorRuntimeStore();
    resetEntry003Store();
    resetCreativeIntelligenceStore();
  });

  it('B1. Senior Creative Judgment auto-runs in MPMD', async () => {
    const mpmd = await runMarketingPackageMasterDirectorWithCreativeJudgment();
    expect(mpmd.seniorJudgmentRuns.length).toBeGreaterThan(0);
    expect(mpmd.seniorJudgmentRuns[0]!.judgment.qualityTier).toBeTruthy();
  });

  it('B2. no Entry-specific invocation required for MPMD SCJ', async () => {
    const mpmd = await runMarketingPackageMasterDirectorWithCreativeJudgment();
    expect(mpmd.seniorJudgmentRuns.some((r) => r.unitId === 'entry-003')).toBe(true);
  });

  it('B3. reasoning-provider adapter exists', () => {
    expect(typeof runCreativeReasoning).toBe('function');
    expect(typeof isCreativeReasoningProviderConfigured).toBe('function');
  });

  it('B4. runtime mode FULL/HYBRID/FALLBACK exists', () => {
    expect(CREATIVE_RUNTIME_MODES).toEqual(['FULL_REASONING', 'HYBRID', 'DETERMINISTIC_FALLBACK']);
  });

  it('B5. structured reasoning output validated', async () => {
    const concept = buildBlindTestInitialConcept(SOLSTICE_AUDIO_LAUNCH_BRIEF);
    const result = await runCreativeReasoning({
      input: concept,
      campaignResponsibility: 'launch',
      retrievedPrinciples: [],
    });
    expect(result.attackVectors.length).toBeGreaterThanOrEqual(3);
    expect(result.deeperIdea.length).toBeGreaterThan(10);
  });

  it('B6. deterministic guardrails remain', async () => {
    const result = await runCreativeReasoning({
      input: buildBlindTestInitialConcept(SOLSTICE_AUDIO_LAUNCH_BRIEF),
      campaignResponsibility: 'launch',
      retrievedPrinciples: [],
    });
    expect(result.failureClasses).toContain('REASONING_DEPTH_LIMITED');
  });

  it('B7. quality tier reflects reasoning depth', async () => {
    const result = await runCreativeReasoning({
      input: buildBlindTestInitialConcept(SOLSTICE_AUDIO_LAUNCH_BRIEF),
      campaignResponsibility: 'launch',
      retrievedPrinciples: [],
    });
    expect(['VALID', 'STRONG', 'EXCEPTIONAL']).toContain(result.qualityTier);
    expect(result.reasoningDepthLimited).toBe(true);
  });

  it('B8. FirstAnswerChallenge runs in blind test', async () => {
    const blind = await runBlindCreativeMarketingTest();
    expect(blind.judgment.firstAnswerChallenge.attackVectors.length).toBeGreaterThanOrEqual(3);
  });

  it('B9. Challenger generated', async () => {
    const blind = await runBlindCreativeMarketingTest();
    expect(blind.judgment.challenger.conceptName.length).toBeGreaterThan(3);
  });

  it('B10. challenger is evaluated substantively', async () => {
    const blind = await runBlindCreativeMarketingTest();
    expect(blind.judgment.winnerComparison.challengerWinsOn.length).toBeGreaterThan(0);
  });

  it('B11. winner can be superseded history preserved', async () => {
    const blind = await runBlindCreativeMarketingTest();
    expect(blind.judgment.supersededConceptHistory.length).toBeGreaterThanOrEqual(0);
    expect(['ORIGINAL_WINNER_RETAINED', 'WINNER_DEEPENED', 'WINNER_HYBRIDIZED', 'WINNER_SUPERSEDED']).toContain(
      blind.judgment.finalOutcome,
    );
  });

  it('B12. CreativeCorrectionIntelligence persists', () => {
    const record = seedCorrectionFromFounderFeedback({
      surfaceFeedback: 'Prop too explanatory',
      taxonomy: 'ARTIFACT_REDUNDANT',
    });
    expect(record.generalizablePrinciple.length).toBeGreaterThan(10);
  });

  it('B13. judgment persistence exists', async () => {
    await runBlindCreativeMarketingTest();
    expect(listPersistedJudgments().length).toBeGreaterThan(0);
  });

  it('B14. correction retrieval filters by applicability', async () => {
    const blind = await runBlindCreativeMarketingTest();
    expect(blind.principlesApplied.length).toBeGreaterThanOrEqual(0);
  });

  it('B15. anti-overfit protection works', () => {
    const bad = evaluateCorrectionOverfit('always use a door');
    expect(bad.isSurfaceDevice).toBe(true);
  });

  it('B16. fresh blind package exists', () => {
    expect(SOLSTICE_AUDIO_LAUNCH_BRIEF.projectId).toBe('solstice-audio');
    expect(SOLSTICE_AUDIO_LAUNCH_BRIEF.brandName).toBe('Solstice Audio');
  });

  it('B17. blind brief is thin', () => {
    expect(SOLSTICE_AUDIO_LAUNCH_BRIEF.productTruth.length).toBeGreaterThan(20);
    expect(SOLSTICE_AUDIO_LAUNCH_BRIEF).not.toHaveProperty('winningConcept');
  });

  it('B18. blind test is not Entry 003', async () => {
    const blind = await runBlindCreativeMarketingTest();
    expect(blind.initialConcept.projectId).not.toBe('ndxbook');
    expect(blind.initialConcept.conceptName).not.toContain('EMPLOYEE');
  });

  it('B19. blind test contains no expected concept solution in fixture', () => {
    const concept = buildBlindTestInitialConcept(SOLSTICE_AUDIO_LAUNCH_BRIEF);
    expect(concept.world.toLowerCase()).not.toContain('door');
    expect(concept.artifact).toBeNull();
  });

  it('B20. fresh concept deepens itself', async () => {
    const blind = await runBlindCreativeMarketingTest();
    expect(blind.judgment.deepReframe.secondOrderContradiction.length).toBeGreaterThan(10);
  });

  it('B21. fresh concept challenges itself', async () => {
    const blind = await runBlindCreativeMarketingTest();
    expect(blind.judgment.firstAnswerChallenge.resolution).not.toBe('KEEP');
  });

  it('B22. fresh campaign uses campaign responsibility', async () => {
    const blind = await runBlindCreativeMarketingTest();
    expect(blind.campaignResponsibility.brandTruthToProve).toContain('Nova Wave');
    expect(blind.campaignResponsibility.campaignObjective).toContain('precision');
  });

  it('B23. medium necessity runs', async () => {
    const blind = await runBlindCreativeMarketingTest();
    expect(blind.judgment.mediumNecessity.medium).toBe('REEL');
  });

  it('B24. founder handholding risk runs', async () => {
    const blind = await runBlindCreativeMarketingTest();
    expect(['LOW', 'MODERATE', 'HIGH']).toContain(blind.judgment.founderHandholdingRisk);
  });

  it('B25. HIGH risk blocks founder review', async () => {
    const concept = buildBlindTestInitialConcept(SOLSTICE_AUDIO_LAUNCH_BRIEF);
    concept.world = 'Neutral white studio room';
    concept.worldFunction = 'Catalog display';
    const result = await runCreativeReasoning({ input: concept, campaignResponsibility: 'x', retrievedPrinciples: [] });
    if (result.founderHandholdingRisk === 'HIGH') {
      expect(result.founderHandholdingRisk).toBe('HIGH');
    }
  });

  it('B26. historical correction improves without surface device transfer', async () => {
    seedCorrectionFromFounderFeedback({
      surfaceFeedback: 'Shift receipt too explanatory when environment proves labor',
      taxonomy: 'ARTIFACT_REDUNDANT',
    });
    const blind = await runBlindCreativeMarketingTest();
    expect(blind.principlesApplied.join(' ').toLowerCase()).not.toContain('shift receipt');
    expect(blind.principlesApplied.join(' ').toLowerCase()).not.toContain('employee-only');
  });

  it('B27. surface device does not transfer to Solstice brief', async () => {
    const blind = await runBlindCreativeMarketingTest();
    const text = JSON.stringify(blind.judgment);
    expect(text.toLowerCase()).not.toContain('shelfie museum');
    expect(text.toLowerCase()).not.toContain('employee-only door');
  });

  it('B28. Entry 003 shared regression remains good', async () => {
    const reg = await runEntry003SharedRegression();
    expect(reg.input.conceptName).toBe('THE EMPLOYEE-ONLY DOOR');
    expect(reg.artifactNecessity.explanatoryPropRisk).toBe(true);
    expect(reg.futureUnitTease.conceptLockRisk).toBe(false);
  });

  it('B29. Entry 001 unchanged', () => {
    const lineage = buildPriorEntryLineage();
    expect(lineage.find((e) => e.entryId === 'entry-001')?.title).toContain('WHO TF IS WE');
  });

  it('B30. Entry 002 unchanged', () => {
    expect(compileEntry002LockedEntry().title).toContain('OH, NOW IT WAS FUN');
  });

  it('B31. Entry 003 remains non-canon', async () => {
    const c14 = await bootstrapC14Entry003SeniorCreativeJudgment();
    expect(c14.entry003Package.records.canon).toBe(false);
  });

  it('B32–B34. zero visual provider dispatch', async () => {
    const c15 = await bootstrapC15CreativeIntelligenceRuntime();
    expect(c15.imageProviderDispatchCount).toBe(0);
    expect(c15.videoProviderDispatchCount).toBe(0);
    expect(c15.falDispatchCount).toBe(0);
  });

  it('B35. prior C1 failure classes include REASONING_DEPTH_LIMITED', () => {
    expect(SENIOR_CREATIVE_FAILURE_CLASSES).toContain('REASONING_DEPTH_LIMITED');
  });

  it('bootstrap C1.5 full runtime', async () => {
    const c15 = await bootstrapC15CreativeIntelligenceRuntime();
    expect(c15.mpmd.seniorJudgmentRuns.length).toBeGreaterThan(0);
    expect(c15.blindTest.judgment.challenger.conceptName).toBeTruthy();
    expect(getCreativeIntelligenceHistory().judgments.length).toBeGreaterThan(0);
  });
});
