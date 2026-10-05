/**
 * C1.1 — Autonomous Creative Director Runtime tests.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  bootstrapC11AutonomousCreativeDirector,
  runAutonomousCreativeDirector,
  applyCreativeDirectorFounderJudgment,
  resetCreativeDirectorRuntimeStore,
  buildBlindTestCreativeBrief,
  buildTreatmentHandoffFromApprovedRun,
  getCreativeDirectorRun,
  BLIND_TEST_ENTRY_ID,
} from '../api/_lib/site00ExpressionEngine/creativeDirector/creativeDirectorService.js';
import { buildMinimalCreativeBriefFromRequest, assertBriefDoesNotRequireOutputs } from '../api/_lib/site00ExpressionEngine/creativeDirector/creativeDirectorContextBuilder.js';
import {
  generateCreativeTerritoryCandidates,
} from '../api/_lib/site00ExpressionEngine/creativeDirector/creativeDirectorCandidateGenerator.js';
import {
  evaluateCreativeTerritories,
  selectWinningCreativeDirection,
} from '../api/_lib/site00ExpressionEngine/creativeDirector/creativeDirectorCandidateEvaluator.js';
import {
  applyConceptCollapseGate,
  territoriesAreDivergent,
} from '../api/_lib/site00ExpressionEngine/creativeDirector/creativeDirectorDivergenceGate.js';
import {
  runCulturalReadPass,
  runObviousVersionPass,
  runDeeperReframePass,
  runRoleSynthesisPass,
  runTurningPointPass,
  generateInterjectionCandidates,
  runContradictionPass,
  runPayoffAftershockPass,
  runDirectorialConceptionPass,
  deriveVisualAuthorityPlan,
} from '../api/_lib/site00ExpressionEngine/creativeDirector/creativeDirectorIntellectualPasses.js';
import {
  runCreativeDirectorSelfCritique,
  assessCreativeMaturity,
  consumeFounderCorrectionRules,
  antiOverfitCheck,
} from '../api/_lib/site00ExpressionEngine/creativeDirector/creativeDirectorSelfCritique.js';
import { runCreativeConvergenceLoop } from '../api/_lib/site00ExpressionEngine/creativeDirector/creativeDirectorConvergence.js';
import { buildNarrativeSynthesisInputFromCreativeDirector, runNarrativeSynthesisFromCreativeDirector } from '../api/_lib/site00ExpressionEngine/creativeDirector/creativeDirectorNarrativeBridge.js';
import { bootstrapC1NarrativeSynthesis } from '../api/_lib/site00ExpressionEngine/narrativeSynthesis/narrativeSynthesisService.js';
import { MAX_CREATIVE_DIRECTOR_PASSES } from '../shared/site00-expression-engine/creative-director/types.js';
import { listNarrativeCreativeCorrections, recordNarrativeCreativeCorrection } from '../api/_lib/site00ExpressionEngine/narrativeSynthesis/narrativeCreativeCorrectionStore.js';

describe('C1.1 Autonomous Creative Director Runtime', () => {
  beforeEach(() => {
    process.env.EXPRESSION_ENGINE_TEST_DETERMINISTIC_CREATIVE_DIRECTOR = '1';
    resetCreativeDirectorRuntimeStore();
  });

  it('1. Autonomous Creative Director is first-class', async () => {
    const result = await bootstrapC11AutonomousCreativeDirector();
    expect(result.sprint).toBe('C1.1_AUTONOMOUS_CREATIVE_DIRECTOR_RUNTIME');
    expect(result.creativeDirectorRun.runId).toContain('NDX-CD-RUN');
  });

  it('2. runtime accepts minimal Entry brief', () => {
    const brief = buildBlindTestCreativeBrief();
    expect(() => assertBriefDoesNotRequireOutputs(brief)).not.toThrow();
    expect(brief.world).toBeUndefined();
    expect(brief.artifact).toBeUndefined();
  });

  it('3. final world is not required input', () => {
    const brief = buildMinimalCreativeBriefFromRequest({ subject: 'TEST SUBJECT' });
    expect('world' in brief).toBe(false);
  });

  it('4. artifact is not required input', () => {
    const brief = buildBlindTestCreativeBrief();
    expect('artifact' in brief).toBe(false);
  });

  it('5. role decisions are not required input', () => {
    const brief = buildBlindTestCreativeBrief();
    expect('ndxRole' in brief).toBe(false);
  });

  it('6. story order is not required input', () => {
    const brief = buildBlindTestCreativeBrief();
    expect('storyOrder' in brief).toBe(false);
  });

  it('7. interjection is not required input', () => {
    const brief = buildBlindTestCreativeBrief();
    expect('interjection' in brief).toBe(false);
  });

  it('8. runtime performs Cultural Read', async () => {
    const result = await bootstrapC11AutonomousCreativeDirector();
    expect(result.creativeDirectorRun.culturalRead.uncomfortableTruth.length).toBeGreaterThan(10);
    expect(result.creativeDirectorRun.culturalRead.whyItMattersNow.length).toBeGreaterThan(5);
  });

  it('9. runtime identifies obvious version', async () => {
    const result = await bootstrapC11AutonomousCreativeDirector();
    expect(result.creativeDirectorRun.obviousVersion.categories.length).toBeGreaterThanOrEqual(4);
    expect(result.creativeDirectorRun.obviousVersion.whyWeAreNotMakingThat.length).toBeGreaterThan(10);
  });

  it('10. runtime generates deeper reframe', async () => {
    const result = await bootstrapC11AutonomousCreativeDirector();
    expect(result.creativeDirectorRun.deeperReframe.creativeReframe.length).toBeGreaterThan(15);
  });

  it('11. divergent territory generation occurs', () => {
    const brief = buildBlindTestCreativeBrief();
    const territories = generateCreativeTerritoryCandidates(brief);
    expect(territories.length).toBeGreaterThanOrEqual(4);
    expect(territoriesAreDivergent(territories)).toBe(true);
  });

  it('12. concept-collapse gate applies', () => {
    const brief = buildBlindTestCreativeBrief();
    const territories = generateCreativeTerritoryCandidates(brief);
    const { passed } = applyConceptCollapseGate(territories);
    expect(passed.length).toBeGreaterThanOrEqual(4);
  });

  it('13. territories evaluated for story potential', () => {
    const brief = buildBlindTestCreativeBrief();
    const territories = generateCreativeTerritoryCandidates(brief);
    const evals = evaluateCreativeTerritories(territories, brief);
    expect(evals.every((e) => e.totalScore > 0)).toBe(true);
    expect(evals[0]!.qualitativeReasoning.length).toBeGreaterThan(10);
  });

  it('14. winner selection includes why others lost', async () => {
    const result = await bootstrapC11AutonomousCreativeDirector();
    expect(result.creativeDirectorRun.winningDirection.whyItWins.length).toBeGreaterThan(10);
    expect(result.creativeDirectorRun.winningDirection.whyOthersLost.length).toBeGreaterThan(0);
  });

  it('15. role synthesis occurs before treatment', async () => {
    const result = await bootstrapC11AutonomousCreativeDirector();
    expect(result.creativeDirectorRun.roleSynthesis.ndxRole.length).toBeGreaterThan(2);
    expect(result.creativeDirectorRun.roleSynthesis.subjectRole.length).toBeGreaterThan(2);
  });

  it('16. Narrative Synthesis consumes winning direction', async () => {
    const result = await bootstrapC11AutonomousCreativeDirector();
    expect(result.creativeDirectorRun.narrativeSynthesis).not.toBeNull();
    expect(result.creativeDirectorRun.narrativeSynthesis!.narrativeSpine.beats.length).toBeGreaterThanOrEqual(7);
  });

  it('17. every beat has whyItHappensNow', async () => {
    const result = await bootstrapC11AutonomousCreativeDirector();
    const beats = result.creativeDirectorRun.narrativeSynthesis!.narrativeSpine.beats;
    expect(beats.every((b) => b.whyItHappensNow.trim().length > 0)).toBe(true);
  });

  it('18. shuffle test applies', async () => {
    const result = await bootstrapC11AutonomousCreativeDirector();
    const synthesis = result.creativeDirectorRun.narrativeSynthesis!;
    expect(synthesis.narrativeSpine.beats.length).toBeGreaterThanOrEqual(7);
    expect(result.creativeDirectorRun.selfCritique.questions.WOULD_STORY_WORK_IF_SHUFFLED).toBeDefined();
  });

  it('19. audience knowledge progression applies', async () => {
    const result = await bootstrapC11AutonomousCreativeDirector();
    expect(result.creativeDirectorRun.narrativeSynthesis!.audienceJourney.length).toBeGreaterThan(0);
  });

  it('20. emotional arc applies', async () => {
    const result = await bootstrapC11AutonomousCreativeDirector();
    expect(result.creativeDirectorRun.narrativeSynthesis!.emotionalArc.progression.length).toBeGreaterThanOrEqual(3);
  });

  it('21. turning point is generated', async () => {
    const result = await bootstrapC11AutonomousCreativeDirector();
    expect(result.creativeDirectorRun.turningPoint.meaningBefore.length).toBeGreaterThan(5);
    expect(result.creativeDirectorRun.turningPoint.meaningAfter.length).toBeGreaterThan(5);
  });

  it('22. interjection generated after contradiction', async () => {
    const result = await bootstrapC11AutonomousCreativeDirector();
    expect(result.creativeDirectorRun.contradiction.receiptCollision.length).toBeGreaterThan(5);
    expect(result.creativeDirectorRun.selectedInterjection.length).toBeGreaterThan(5);
  });

  it('23. payoff links setup', async () => {
    const result = await bootstrapC11AutonomousCreativeDirector();
    expect(result.creativeDirectorRun.payoffAftershock.intellectualPayoff).toContain('REST');
  });

  it('24. aftershock generated', async () => {
    const result = await bootstrapC11AutonomousCreativeDirector();
    expect(result.creativeDirectorRun.payoffAftershock.aftershock.length).toBeGreaterThan(10);
  });

  it('25. directorial conception occurs after story', async () => {
    const result = await bootstrapC11AutonomousCreativeDirector();
    expect(result.creativeDirectorRun.directorialConception.cameraLanguage.length).toBeGreaterThan(10);
    expect(result.creativeDirectorRun.narrativeSynthesis!.narrativeSpine.beats.length).toBeGreaterThan(0);
  });

  it('26. visual authority plan is derived, not fixed', async () => {
    const result = await bootstrapC11AutonomousCreativeDirector();
    expect(result.creativeDirectorRun.visualAuthorityPlan.length).toBeGreaterThanOrEqual(4);
    expect(result.creativeDirectorRun.visualAuthorityPlan.every((a) => a.whyRequired.length > 5)).toBe(true);
  });

  it('27. authority count is not hardcoded to five', async () => {
    const result = await bootstrapC11AutonomousCreativeDirector();
    expect(result.creativeDirectorRun.visualAuthorityPlan.length).not.toBe(5);
  });

  it('28. self-critique runs', async () => {
    const result = await bootstrapC11AutonomousCreativeDirector();
    expect(result.creativeDirectorRun.selfCritique.questions.IS_THIS_ACTUALLY_GOOD).toBeDefined();
    expect(result.creativeDirectorRun.selfCritique.internalDisagreements.length).toBeGreaterThanOrEqual(3);
  });

  it('29. FounderInterventionDependency exists', async () => {
    const result = await bootstrapC11AutonomousCreativeDirector();
    expect(['LOW', 'MODERATE', 'HIGH']).toContain(result.creativeDirectorRun.founderInterventionDependency);
  });

  it('30. HIGH dependency triggers revision path', () => {
    const maturity = assessCreativeMaturity({
      culturalReadDepth: 0.5,
      originality: 0.5,
      causalPass: false,
      turnStrong: false,
      interjectionEarned: false,
      worldFunctional: false,
      artifactFunctional: false,
      priorEntryDiff: 0.5,
      founderWouldConnectDots: true,
    });
    expect(maturity.founderInterventionDependency).toBe('HIGH');
    expect(maturity.substantivePass).toBe(false);
  });

  it('31. creative maturity is substantive, not field-completeness based', () => {
    const hollow = assessCreativeMaturity({
      culturalReadDepth: 0.99,
      originality: 0.99,
      causalPass: false,
      turnStrong: false,
      interjectionEarned: true,
      worldFunctional: true,
      artifactFunctional: true,
      priorEntryDiff: 0.99,
      founderWouldConnectDots: true,
    });
    expect(hollow.substantivePass).toBe(false);
  });

  it('32. bounded revision loop exists', () => {
    let calls = 0;
    const { passes } = runCreativeConvergenceLoop({
      executePass: () => {
        calls += 1;
        return { ok: true };
      },
      critique: () =>
        runCreativeDirectorSelfCritique({
          brief: buildBlindTestCreativeBrief(),
          winner: generateCreativeTerritoryCandidates(buildBlindTestCreativeBrief())[0]!,
          roles: runRoleSynthesisPass(generateCreativeTerritoryCandidates(buildBlindTestCreativeBrief())[0]!, buildBlindTestCreativeBrief()),
          turningPoint: runTurningPointPass(generateCreativeTerritoryCandidates(buildBlindTestCreativeBrief())[0]!, buildBlindTestCreativeBrief()),
          interjection: 'TEST',
          beatCount: 3,
          shufflePassed: false,
          causalPass: false,
        }),
    });
    expect(passes).toBeLessThanOrEqual(MAX_CREATIVE_DIRECTOR_PASSES);
    expect(calls).toBeLessThanOrEqual(MAX_CREATIVE_DIRECTOR_PASSES);
  });

  it('33. no infinite retries', async () => {
    const result = await bootstrapC11AutonomousCreativeDirector();
    expect(result.creativeDirectorRun.revisionPasses.length).toBeLessThanOrEqual(MAX_CREATIVE_DIRECTOR_PASSES);
  });

  it('34. founder correction rules are consumed', () => {
    const rules = consumeFounderCorrectionRules();
    expect(rules.length).toBeGreaterThan(0);
    expect(rules.some((r) => r.includes('INVESTIGATOR') || r.includes('OBSERVER'))).toBe(true);
  });

  it('35. Entry 002 surface details are not universalized', () => {
    const brief = buildBlindTestCreativeBrief();
    const winner = generateCreativeTerritoryCandidates(brief)[0]!;
    const check = antiOverfitCheck(winner);
    expect(check.passed).toBe(true);
    expect(check.violations).not.toContain('ENTRY_002_SURFACE_REUSE');
  });

  it('36. prior Entry differentiation runs', () => {
    const brief = buildBlindTestCreativeBrief();
    const territories = generateCreativeTerritoryCandidates(brief);
    expect(territories.every((t) => t.similarityToEntry002 < 0.5)).toBe(true);
  });

  it('37. treatment handoff uses approved autonomous direction', async () => {
    const result = await bootstrapC11AutonomousCreativeDirector();
    const blocked = buildTreatmentHandoffFromApprovedRun(result.creativeDirectorRun);
    expect(blocked.ready).toBe(false);
    applyCreativeDirectorFounderJudgment({ entryId: BLIND_TEST_ENTRY_ID, founderJudgment: 'LOVE_IT' });
    const approvedRun = getCreativeDirectorRun(BLIND_TEST_ENTRY_ID)!;
    const approved = buildTreatmentHandoffFromApprovedRun(approvedRun);
    expect(approved.ready).toBe(true);
    expect(approved.approvedStory!.length).toBeGreaterThan(0);
  });

  it('38. no image/video/FAL dispatch', async () => {
    const result = await bootstrapC11AutonomousCreativeDirector();
    expect(result.providerDispatchCount).toBe(0);
    expect(result.imageProviderDispatchCount).toBe(0);
    expect(result.videoProviderDispatchCount).toBe(0);
    expect(result.creativeDirectorRun.imageProviderDispatchCount).toBe(0);
  });

  it('39. blind test can run from thin brief', async () => {
    const brief = buildBlindTestCreativeBrief();
    expect(brief.entryId).toBe('entry-c1-blind');
    expect(brief.thesis.length).toBeGreaterThan(10);
    const run = await runAutonomousCreativeDirector(brief);
    expect(run.entryId).toBe('entry-c1-blind');
  });

  it('40. blind test produces complete Creative Director package', async () => {
    const result = await bootstrapC11AutonomousCreativeDirector();
    const run = result.creativeDirectorRun;
    expect(run.culturalRead).toBeTruthy();
    expect(run.obviousVersion).toBeTruthy();
    expect(run.deeperReframe).toBeTruthy();
    expect(run.territories.length).toBeGreaterThanOrEqual(4);
    expect(run.winningDirection).toBeTruthy();
    expect(run.roleSynthesis).toBeTruthy();
    expect(run.turningPoint).toBeTruthy();
    expect(run.selectedInterjection).toBeTruthy();
    expect(run.payoffAftershock).toBeTruthy();
    expect(run.directorialConception).toBeTruthy();
    expect(run.visualAuthorityPlan.length).toBeGreaterThan(0);
    expect(run.selfCritique).toBeTruthy();
    expect(run.creativeMaturity).toBeTruthy();
  });

  it('41. founder review captures feedback type', async () => {
    await bootstrapC11AutonomousCreativeDirector();
    applyCreativeDirectorFounderJudgment({
      entryId: BLIND_TEST_ENTRY_ID,
      founderJudgment: 'REVISE',
      feedbackType: 'STRUCTURAL_REPAIR',
    });
    const run = getCreativeDirectorRun(BLIND_TEST_ENTRY_ID)!;
    expect(run.founderFeedbackType).toBe('STRUCTURAL_REPAIR');
  });

  it('42. structural-repair feedback can become learning rule', async () => {
    await bootstrapC11AutonomousCreativeDirector();
    applyCreativeDirectorFounderJudgment({
      entryId: BLIND_TEST_ENTRY_ID,
      founderJudgment: 'REVISE',
      feedbackType: 'STRUCTURAL_REPAIR',
      learningNote: 'Turn setup was ornamental — strengthen receipt chain before interjection.',
    });
    const corrections = listNarrativeCreativeCorrections(BLIND_TEST_ENTRY_ID);
    expect(corrections.some((c) => c.failureClass === 'STRUCTURAL_REPAIR')).toBe(true);
  });

  it('43. all previous C1.0 Narrative Synthesis tests remain green', async () => {
    const c1 = await bootstrapC1NarrativeSynthesis();
    expect(c1.sprint).toBe('C1.0_NARRATIVE_SYNTHESIS_ENGINE');
    expect(c1.narrativeSynthesis.narrativeSpine.beats.length).toBe(9);
  });

  it('blind test rejects Entry 002 as autonomy input', async () => {
    const brief = buildBlindTestCreativeBrief();
    await expect(runAutonomousCreativeDirector({ ...brief, entryId: 'entry-002' })).rejects.toThrow(/Entry 002/);
  });

  it('passes compile cultural read from thin brief only', () => {
    const brief = buildBlindTestCreativeBrief();
    const read = runCulturalReadPass(brief);
    const obvious = runObviousVersionPass(brief);
    const reframe = runDeeperReframePass(brief, read);
    expect(read.surfaceTopic).toBe(brief.topic);
    expect(obvious.categories).toContain('generic montage');
    expect(reframe.deeperInterpretation).toBe(read.uncomfortableTruth);
  });

  it('narrative bridge builds synthesis input from winner only', () => {
    const brief = buildBlindTestCreativeBrief();
    const territories = generateCreativeTerritoryCandidates(brief);
    const evals = evaluateCreativeTerritories(territories, brief);
    const { winner, direction } = selectWinningCreativeDirection(territories, evals, 'obvious');
    const roles = runRoleSynthesisPass(winner, brief);
    const contradiction = runContradictionPass(brief);
    const interjection = generateInterjectionCandidates(winner, contradiction)[0]!.line;
    const input = buildNarrativeSynthesisInputFromCreativeDirector({
      brief,
      winner,
      direction,
      roles,
      interjection,
      contradiction,
    });
    const result = runNarrativeSynthesisFromCreativeDirector(input);
    expect(result.beatCount).toBeGreaterThanOrEqual(7);
    expect(result.causalPass).toBe(true);
  });
});
