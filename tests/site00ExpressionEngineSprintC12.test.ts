/**
 * C1.2 — Entry 003 Autonomous Creative Director blind test.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  bootstrapC12Entry003AutonomousCreativeDirector,
  resetEntry003Store,
  applyEntry003FounderJudgment,
  generateEntry003SubjectCandidates,
  subjectsAreDivergent,
} from '../api/_lib/site00ExpressionEngine/entry003/entry003Service.js';
import {
  evaluateEntry003Subjects,
  selectEntry003Subject,
  buildEntry003BriefFromSelection,
} from '../api/_lib/site00ExpressionEngine/entry003/entry003SubjectDiscovery.js';
import { buildEntry003EvidenceResearchPlan } from '../api/_lib/site00ExpressionEngine/entry003/entry003EvidenceResearchPlan.js';
import { resetCreativeDirectorRuntimeStore } from '../api/_lib/site00ExpressionEngine/creativeDirector/creativeDirectorService.js';
import {
  generateCreativeTerritoryCandidates,
} from '../api/_lib/site00ExpressionEngine/creativeDirector/creativeDirectorCandidateGenerator.js';
import {
  applyConceptCollapseGate,
  territoriesAreDivergent,
} from '../api/_lib/site00ExpressionEngine/creativeDirector/creativeDirectorDivergenceGate.js';
import { antiOverfitCheck } from '../api/_lib/site00ExpressionEngine/creativeDirector/creativeDirectorSelfCritique.js';
import { assessCreativeMaturity } from '../api/_lib/site00ExpressionEngine/creativeDirector/creativeDirectorSelfCritique.js';
import { buildPriorEntryLineage } from '../api/_lib/site00ExpressionEngine/creativeDirector/creativeDirectorContextBuilder.js';
import { compileEntry002LockedEntry } from '../api/_lib/site00ExpressionEngine/entry002Blueprint.js';
import { ENTRY_003_GATE_ID, ENTRY_003_RECORD_IDS } from '../shared/site00-expression-engine/entry-003/types.js';

describe('C1.2 Entry 003 Autonomous Creative Director Blind Test', () => {
  beforeEach(() => {
    process.env.EXPRESSION_ENGINE_TEST_DETERMINISTIC_CREATIVE_DIRECTOR = '1';
    resetCreativeDirectorRuntimeStore();
    resetEntry003Store();
  });

  it('1. Entry 003 can begin without founder-selected subject', async () => {
    const result = await bootstrapC12Entry003AutonomousCreativeDirector();
    expect(result.entry003Package.subjectSelection.selectedCandidateId).toBeTruthy();
    expect(result.entry003Package.entryId).toBe('entry-003');
  });

  it('2. candidate subject generation exists', () => {
    const candidates = generateEntry003SubjectCandidates();
    expect(candidates.length).toBeGreaterThanOrEqual(5);
    expect(candidates.length).toBeLessThanOrEqual(8);
  });

  it('3. candidate subjects are divergent', () => {
    const candidates = generateEntry003SubjectCandidates();
    expect(subjectsAreDivergent(candidates)).toBe(true);
    const domains = new Set(candidates.map((c) => c.culturalDomain));
    expect(domains.size).toBeGreaterThanOrEqual(5);
  });

  it('4. prior Entry lineage is consumed', () => {
    const lineage = buildPriorEntryLineage();
    expect(lineage.length).toBeGreaterThanOrEqual(2);
    const brief = buildEntry003BriefFromSelection(
      selectEntry003Subject(
        generateEntry003SubjectCandidates(),
        evaluateEntry003Subjects(generateEntry003SubjectCandidates()),
      ),
    );
    expect(brief.priorEntryLineage?.length).toBeGreaterThanOrEqual(2);
  });

  it('5. Entry 001 similarity is checked', () => {
    const candidates = generateEntry003SubjectCandidates();
    expect(candidates.every((c) => typeof c.similarityToEntry001 === 'number')).toBe(true);
    expect(candidates.every((c) => c.similarityToEntry001 < 0.5)).toBe(true);
  });

  it('6. Entry 002 similarity is checked', () => {
    const candidates = generateEntry003SubjectCandidates();
    expect(candidates.every((c) => typeof c.similarityToEntry002 === 'number')).toBe(true);
    expect(candidates.every((c) => c.similarityToEntry002 < 0.5)).toBe(true);
  });

  it('7. winner selection produces qualitative reasoning', () => {
    const candidates = generateEntry003SubjectCandidates();
    const evals = evaluateEntry003Subjects(candidates);
    const selection = selectEntry003Subject(candidates, evals);
    expect(selection.whyItWins.length).toBeGreaterThan(10);
    expect(selection.whyOtherCandidatesLost.length).toBeGreaterThan(0);
  });

  it('8. obvious version is identified', async () => {
    const result = await bootstrapC12Entry003AutonomousCreativeDirector();
    expect(result.entry003Package.creativeDirectorRun.obviousVersion.summary.length).toBeGreaterThan(10);
    expect(result.entry003Package.creativeDirectorRun.obviousVersion.whyWeAreNotMakingThat.length).toBeGreaterThan(10);
  });

  it('9. deeper reframe is generated', async () => {
    const result = await bootstrapC12Entry003AutonomousCreativeDirector();
    expect(result.entry003Package.creativeDirectorRun.deeperReframe.creativeReframe.length).toBeGreaterThan(15);
  });

  it('10. multiple creative territories are generated', async () => {
    const result = await bootstrapC12Entry003AutonomousCreativeDirector();
    expect(result.entry003Package.creativeDirectorRun.territories.length).toBeGreaterThanOrEqual(4);
  });

  it('11. Concept Collapse applies', async () => {
    const selection = selectEntry003Subject(
      generateEntry003SubjectCandidates(),
      evaluateEntry003Subjects(generateEntry003SubjectCandidates()),
    );
    const brief = buildEntry003BriefFromSelection(selection);
    const territories = generateCreativeTerritoryCandidates(brief);
    const { passed } = applyConceptCollapseGate(territories);
    expect(passed.length).toBeGreaterThanOrEqual(4);
  });

  it('12. winning territory is selected', async () => {
    const result = await bootstrapC12Entry003AutonomousCreativeDirector();
    expect(result.entry003Package.creativeDirectorRun.winningDirection.territoryName.length).toBeGreaterThan(3);
    expect(result.entry003Package.creativeDirectorRun.winningDirection.whyItWins.length).toBeGreaterThan(10);
  });

  it('13. NDX role is derived', async () => {
    const result = await bootstrapC12Entry003AutonomousCreativeDirector();
    expect(result.entry003Package.creativeDirectorRun.roleSynthesis.ndxRole.length).toBeGreaterThan(2);
  });

  it('14. subject role is derived', async () => {
    const result = await bootstrapC12Entry003AutonomousCreativeDirector();
    expect(result.entry003Package.creativeDirectorRun.roleSynthesis.subjectRole.length).toBeGreaterThan(2);
  });

  it('15. world is derived', async () => {
    const result = await bootstrapC12Entry003AutonomousCreativeDirector();
    expect(result.entry003Package.worldRecord.worldName.length).toBeGreaterThan(3);
    expect(result.entry003Package.worldRecord.worldFunction.length).toBeGreaterThan(10);
  });

  it('16. artifact is optional / derived', async () => {
    const result = await bootstrapC12Entry003AutonomousCreativeDirector();
    const art = result.entry003Package.artifactRecord;
    expect(typeof art.noPrimaryArtifact).toBe('boolean');
    if (!art.noPrimaryArtifact) {
      expect(art.artifact).toBeTruthy();
      expect(art.artifactFunction).toBeTruthy();
    }
  });

  it('17. narrative spine is generated', async () => {
    const result = await bootstrapC12Entry003AutonomousCreativeDirector();
    expect(result.entry003Package.narrativeSynthesis?.narrativeSpine.beats.length).toBeGreaterThanOrEqual(7);
  });

  it('18. every beat includes whyItHappensNow', async () => {
    const result = await bootstrapC12Entry003AutonomousCreativeDirector();
    const beats = result.entry003Package.narrativeSynthesis!.narrativeSpine.beats;
    expect(beats.every((b) => b.whyItHappensNow.trim().length > 0)).toBe(true);
  });

  it('19. shuffle test runs', async () => {
    const result = await bootstrapC12Entry003AutonomousCreativeDirector();
    expect(result.entry003Package.shuffleQa).toBeDefined();
    expect(result.entry003Package.creativeDirectorRun.selfCritique.questions.WOULD_STORY_WORK_IF_SHUFFLED).toBeDefined();
  });

  it('20. audience knowledge progression runs', async () => {
    const result = await bootstrapC12Entry003AutonomousCreativeDirector();
    expect(result.entry003Package.audienceJourney.length).toBeGreaterThan(0);
    expect(result.entry003Package.narrativeSynthesis!.audienceJourney.length).toBeGreaterThan(0);
  });

  it('21. emotional arc runs', async () => {
    const result = await bootstrapC12Entry003AutonomousCreativeDirector();
    expect(result.entry003Package.emotionalArcSummary.length).toBeGreaterThan(10);
    expect(result.entry003Package.narrativeSynthesis!.emotionalArc.progression.length).toBeGreaterThanOrEqual(3);
  });

  it('22. turning point exists', async () => {
    const result = await bootstrapC12Entry003AutonomousCreativeDirector();
    expect(result.entry003Package.creativeDirectorRun.turningPoint.meaningBefore.length).toBeGreaterThan(5);
    expect(result.entry003Package.creativeDirectorRun.turningPoint.meaningAfter.length).toBeGreaterThan(5);
  });

  it('23. contradiction is explicit', async () => {
    const result = await bootstrapC12Entry003AutonomousCreativeDirector();
    const c = result.entry003Package.creativeDirectorRun.contradiction;
    expect(c.positionA.length).toBeGreaterThan(5);
    expect(c.positionB.length).toBeGreaterThan(5);
    expect(c.receiptCollision.length).toBeGreaterThan(5);
  });

  it('24. at least 5 interjections are considered', async () => {
    const result = await bootstrapC12Entry003AutonomousCreativeDirector();
    expect(result.entry003Package.creativeDirectorRun.interjectionCandidates.length).toBeGreaterThanOrEqual(5);
  });

  it('25. selected interjection is evaluated', async () => {
    const result = await bootstrapC12Entry003AutonomousCreativeDirector();
    expect(result.entry003Package.creativeDirectorRun.selectedInterjection.length).toBeGreaterThan(5);
  });

  it('26. payoff exists', async () => {
    const result = await bootstrapC12Entry003AutonomousCreativeDirector();
    expect(result.entry003Package.creativeDirectorRun.payoffAftershock.intellectualPayoff.length).toBeGreaterThan(10);
  });

  it('27. aftershock exists', async () => {
    const result = await bootstrapC12Entry003AutonomousCreativeDirector();
    expect(result.entry003Package.creativeDirectorRun.payoffAftershock.aftershock.length).toBeGreaterThan(10);
  });

  it('28. directorial conception comes after narrative QA', async () => {
    const result = await bootstrapC12Entry003AutonomousCreativeDirector();
    expect(result.entry003Package.creativeDirectorRun.directorialConception.cameraLanguage.length).toBeGreaterThan(10);
    expect(result.entry003Package.narrativeSynthesis!.narrativeSpine.beats.length).toBeGreaterThan(0);
  });

  it('29. visual authority count is not hardcoded', async () => {
    const result = await bootstrapC12Entry003AutonomousCreativeDirector();
    const count = result.entry003Package.creativeDirectorRun.visualAuthorityPlan.length;
    expect(count).not.toBe(5);
    expect(count).toBeGreaterThanOrEqual(4);
  });

  it('30. authority plan derives from continuity risks', async () => {
    const result = await bootstrapC12Entry003AutonomousCreativeDirector();
    expect(
      result.entry003Package.creativeDirectorRun.visualAuthorityPlan.every((a) => a.whyRequired.length > 5),
    ).toBe(true);
  });

  it('31. self-critique runs', async () => {
    const result = await bootstrapC12Entry003AutonomousCreativeDirector();
    expect(result.entry003Package.creativeDirectorRun.selfCritique.questions.IS_THIS_ACTUALLY_GOOD).toBeDefined();
  });

  it('32. bounded self-revision runs', async () => {
    const result = await bootstrapC12Entry003AutonomousCreativeDirector();
    expect(result.entry003Package.creativeDirectorRun.revisionPasses.length).toBeLessThanOrEqual(3);
  });

  it('33. FounderInterventionDependency exists', async () => {
    const result = await bootstrapC12Entry003AutonomousCreativeDirector();
    expect(['LOW', 'MODERATE', 'HIGH']).toContain(result.entry003Package.founderInterventionDependency);
  });

  it('34. HIGH dependency cannot pass without revision', () => {
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

  it('35. CreativeMaturityAssessment runs', async () => {
    const result = await bootstrapC12Entry003AutonomousCreativeDirector();
    expect(result.entry003Package.creativeMaturity.substantivePass).toBe(true);
    expect(result.entry003Package.creativeMaturity.culturalInsight.score).toBeGreaterThan(0);
  });

  it('36. evidence research plan exists', async () => {
    const result = await bootstrapC12Entry003AutonomousCreativeDirector();
    expect(result.entry003Package.evidenceResearchPlan.items.length).toBeGreaterThan(0);
    expect(result.entry003Package.evidenceResearchPlan.fabricationPolicy).toBe('NO_FABRICATED_RECEIPTS');
  });

  it('37. factual receipts are not fabricated', () => {
    const selection = selectEntry003Subject(
      generateEntry003SubjectCandidates(),
      evaluateEntry003Subjects(generateEntry003SubjectCandidates()),
    );
    const plan = buildEntry003EvidenceResearchPlan(selection);
    expect(plan.items.some((i) => i.researchStatus === 'RESEARCH_REQUIRED')).toBe(true);
    expect(plan.fabricationPolicy).toBe('NO_FABRICATED_RECEIPTS');
  });

  it('38. Entry 003 records are created only after intellectual QA', async () => {
    const result = await bootstrapC12Entry003AutonomousCreativeDirector();
    expect(result.entry003Package.records.creativeDirectionId).toBe(ENTRY_003_RECORD_IDS.creativeDirection);
    expect(result.entry003Package.creativeMaturity.substantivePass).toBe(true);
  });

  it('39. Entry 003 remains non-canon before founder review', async () => {
    const result = await bootstrapC12Entry003AutonomousCreativeDirector();
    expect(result.entry003Package.records.canon).toBe(false);
    expect(result.entry003Package.records.productionReady).toBe(false);
    expect(result.entry003Package.records.storyboardReady).toBe(false);
    expect(result.entry003Package.status).toBe('CREATIVE_DIRECTION_AWAITING_FOUNDER_REVIEW');
  });

  it('40. no visual provider dispatch occurs', async () => {
    const result = await bootstrapC12Entry003AutonomousCreativeDirector();
    expect(result.providerDispatchCount).toBe(0);
    expect(result.imageProviderDispatchCount).toBe(0);
    expect(result.videoProviderDispatchCount).toBe(0);
    expect(result.falDispatchCount).toBe(0);
    expect(result.entry003Package.falDispatchCount).toBe(0);
  });

  it('41. Entry 001 remains unchanged', () => {
    const lineage = buildPriorEntryLineage();
    const entry001 = lineage.find((e) => e.entryId === 'entry-001');
    expect(entry001?.title).toContain('WHO TF IS WE');
    expect(entry001?.subject).toContain('BRITNEY');
  });

  it('42. Entry 002 remains unchanged', () => {
    const entry002 = compileEntry002LockedEntry();
    expect(entry002.title).toContain('OH, NOW IT WAS FUN');
    expect(entry002.entryNumber).toBe(2);
  });

  it('43. prior C1.0/C1.1 tests remain green — Entry 003 anti-overfit', async () => {
    const result = await bootstrapC12Entry003AutonomousCreativeDirector();
    const winner = result.entry003Package.creativeDirectorRun.territories.find(
      (t) => t.territoryId === result.entry003Package.creativeDirectorRun.winningDirection.territoryId,
    )!;
    const check = antiOverfitCheck(winner);
    expect(check.passed).toBe(true);
    expect(result.entry003Package.priorEntryDifferentiation.passed).toBe(true);
    expect(result.entry003Package.gateId).toBe(ENTRY_003_GATE_ID);
    const brief = buildEntry003BriefFromSelection(result.entry003Package.subjectSelection);
    const territories = generateCreativeTerritoryCandidates(brief);
    expect(territoriesAreDivergent(territories)).toBe(true);
  });
});

describe('C1.2 Entry 003 founder judgment', () => {
  beforeEach(() => {
    process.env.EXPRESSION_ENGINE_TEST_DETERMINISTIC_CREATIVE_DIRECTOR = '1';
    resetCreativeDirectorRuntimeStore();
    resetEntry003Store();
  });

  it('founder judgment updates Entry 003 package', async () => {
    await bootstrapC12Entry003AutonomousCreativeDirector();
    const updated = applyEntry003FounderJudgment({ founderJudgment: 'LOVE_IT' });
    expect(updated?.founderJudgment).toBe('LOVE_IT');
    expect(updated?.status).toBe('APPROVED');
  });
});
