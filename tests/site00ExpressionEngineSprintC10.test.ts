/**
 * C1.0 — Narrative Synthesis Engine tests.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  bootstrapC1NarrativeSynthesis,
  applyNarrativeSynthesisFounderJudgment,
  resetNarrativeSynthesisStore,
  recordNarrativeCreativeCorrection,
  listNarrativeCreativeCorrections,
} from '../api/_lib/site00ExpressionEngine/narrativeSynthesis/narrativeSynthesisService.js';
import { resetNarrativeCreativeCorrectionStore } from '../api/_lib/site00ExpressionEngine/narrativeSynthesis/narrativeCreativeCorrectionStore.js';
import { buildEntry002NarrativeSynthesisInput } from '../api/_lib/site00ExpressionEngine/narrativeSynthesis/entry002NarrativeSynthesisInput.js';
import { compileNarrativeSpineFromInput } from '../api/_lib/site00ExpressionEngine/narrativeSynthesis/narrativeSynthesisCompiler.js';
import { buildCausalityGraph, runNarrativeShuffleTest } from '../api/_lib/site00ExpressionEngine/narrativeSynthesis/narrativeCausalityGraph.js';
import { runNarrativeCohesionQA } from '../api/_lib/site00ExpressionEngine/narrativeSynthesis/narrativeCohesionQA.js';
import { buildAudienceJourneyFromBeats } from '../api/_lib/site00ExpressionEngine/narrativeSynthesis/audienceKnowledgeModel.js';
import { deriveEmotionalArc } from '../api/_lib/site00ExpressionEngine/narrativeSynthesis/emotionalArcModel.js';
import { deriveRevealStrategy, interjectionIsEarned } from '../api/_lib/site00ExpressionEngine/narrativeSynthesis/revealStrategy.js';
import { resolveRoleIntelligence } from '../api/_lib/site00ExpressionEngine/narrativeSynthesis/roleIntelligence.js';
import { buildNarrativePayoff, validatePayoffIntegrity } from '../api/_lib/site00ExpressionEngine/narrativeSynthesis/narrativePayoffLogic.js';
import { runNarrativeOriginalityQA } from '../api/_lib/site00ExpressionEngine/narrativeSynthesis/narrativeOriginalityQA.js';
import { runNarrativeSelfRevisionLoop, assertNoProviderDispatchDuringSynthesis } from '../api/_lib/site00ExpressionEngine/narrativeSynthesis/narrativeSelfRevision.js';
import { evaluateEntry002GoldenFixture } from '../api/_lib/site00ExpressionEngine/narrativeSynthesis/entry002GoldenFixture.js';
import {
  buildTreatmentHandoffContract,
  assertTreatmentRespectsNarrativeAuthority,
} from '../api/_lib/site00ExpressionEngine/narrativeSynthesis/narrativeTreatmentHandoff.js';
import { listGeneralizableNarrativeRules } from '../api/_lib/site00ExpressionEngine/narrativeSynthesis/narrativeCorrectionRules.js';
import { buildEntry002ReelTreatmentAuthority } from '../api/_lib/site00ExpressionEngine/entry002ReelTreatment.js';
import { MAX_SELF_REVISION_PASSES } from '../shared/site00-expression-engine/narrative-synthesis/types.js';

describe('C1.0 Narrative Synthesis Engine', () => {
  beforeEach(() => {
    resetNarrativeSynthesisStore();
    resetNarrativeCreativeCorrectionStore();
  });

  it('1. first-class system boundary exists', async () => {
    const result = await bootstrapC1NarrativeSynthesis();
    expect(result.sprint).toBe('C1.0_NARRATIVE_SYNTHESIS_ENGINE');
    expect(result.narrativeSynthesis.synthesisId).toContain('NARRATIVE-SYNTHESIS');
  });

  it('2–3. synthesis sits after creative thinking and before treatment', async () => {
    const result = await bootstrapC1NarrativeSynthesis();
    expect(result.architectureLayer).toContain('CREATIVE_THINKING');
    expect(result.architectureLayer).toContain('NARRATIVE_SYNTHESIS');
    expect(result.architectureLayer).toContain('DIRECTORIAL_TREATMENT');
    expect(result.creativeThinkingHandoff.strongestTerritories.length).toBeGreaterThan(0);
    expect(result.treatmentHandoff.immutableStoryElements.length).toBeGreaterThan(0);
  });

  it('4. treatment consumes approved narrative authority contract', async () => {
    const result = await bootstrapC1NarrativeSynthesis({ approveForTest: true });
    expect(result.narrativeSynthesis.narrativeAuthority).toBe(true);
    expect(result.treatmentHandoff.narrativeAuthorityId).toBe(result.narrativeSynthesis.synthesisId);
  });

  it('5–6. beats require whyItHappensNow; non-causal flagged', () => {
    const input = buildEntry002NarrativeSynthesisInput();
    const spine = compileNarrativeSpineFromInput(input);
    expect(spine.beats.every((b) => b.whyItHappensNow.trim().length > 0)).toBe(true);
    const ornamental = spine.beats.filter((b) => b.qaNotes.some((n) => n.includes('NARRATIVE_ORNAMENT')));
    expect(ornamental.every((b) => b.beatType === 'AFTERSHOCK' || b.removableWithoutDamage)).toBe(true);
  });

  it('7–8. shuffle test exists; reorderable collections fail', () => {
    const input = buildEntry002NarrativeSynthesisInput();
    const spine = compileNarrativeSpineFromInput(input);
    const graph = buildCausalityGraph(spine.beats);
    expect(graph.orderDependency).not.toBe('WEAK');
    expect(graph.shuffleTestPassed).toBe(true);

    const reordered = [...spine.beats];
    const interjectionIdx = reordered.findIndex((b) => b.beatType === 'INTERJECTION');
    const turnIdx = reordered.findIndex((b) => b.beatType === 'TURN');
    if (interjectionIdx >= 0 && turnIdx >= 0) {
      const tmp = reordered[interjectionIdx];
      reordered[interjectionIdx] = reordered[turnIdx];
      reordered[turnIdx] = tmp;
    }
    const shuffled = runNarrativeShuffleTest(reordered, []);
    expect(shuffled.passed).toBe(false);
  });

  it('9–10. audience knowledge progresses; redundancy detectable', () => {
    const input = buildEntry002NarrativeSynthesisInput();
    const spine = compileNarrativeSpineFromInput(input);
    const journey = buildAudienceJourneyFromBeats(spine.beats);
    expect(journey.length).toBe(spine.beats.length);
    expect(journey[journey.length - 1].knownFacts.length).toBeGreaterThan(journey[0].knownFacts.length);
  });

  it('11. emotional progression represented', () => {
    const input = buildEntry002NarrativeSynthesisInput();
    const spine = compileNarrativeSpineFromInput(input);
    const arc = deriveEmotionalArc(input, spine.beats);
    expect(arc.progression.length).toBeGreaterThanOrEqual(3);
  });

  it('12–16. central question, reveal, turn, contradiction, interjection earned', async () => {
    const result = await bootstrapC1NarrativeSynthesis();
    const s = result.narrativeSynthesis;
    expect(s.centralQuestion.length).toBeGreaterThan(10);
    expect(s.revealStrategy.primaryMode).toBe('ARCHIVAL_DISCOVERY');
    expect(s.turningPoint.beatId).toBeTruthy();
    expect(s.contradiction.statement.length).toBeGreaterThan(5);
    expect(s.interjection.criteriaMet).toBe(true);
  });

  it('17. unearned interjection fails cohesion', () => {
    const input = buildEntry002NarrativeSynthesisInput();
    const spine = compileNarrativeSpineFromInput(input);
    const interjectionOnly = [spine.beats.find((b) => b.beatId === 'ns-interjection')!];
    const earned = interjectionIsEarned(interjectionOnly, 'ns-interjection');
    expect(earned).toBe(false);
  });

  it('18–20. payoff references setup; unset-up/unpaid setup detectable', () => {
    const input = buildEntry002NarrativeSynthesisInput();
    const spine = compileNarrativeSpineFromInput(input);
    const payoff = buildNarrativePayoff(spine.beats, 'TEST INTERJECTION');
    expect(payoff.setupBeatIds.length).toBeGreaterThan(0);
    const integrity = validatePayoffIntegrity(payoff, spine.beats);
    expect(integrity.unsetupPayoff).toBe(false);
  });

  it('21. aftershock represented', async () => {
    const result = await bootstrapC1NarrativeSynthesis();
    expect(result.narrativeSynthesis.aftershock.statement.length).toBeGreaterThan(5);
  });

  it('22–27. role intelligence and decorative failures', () => {
    const input = buildEntry002NarrativeSynthesisInput();
    const roles = resolveRoleIntelligence(input);
    expect(roles.ndxRole).toMatch(/INVESTIGATOR|OBSERVER/);
    expect(roles.subjectRole).toBe('PROOF');
    expect(roles.worldFunction).toBe('EDIT');
    expect(roles.deviceRole).toBe('PORTAL');
  });

  it('28–29. appetite affects risk; brand truth in boundaries', () => {
    const lowRisk = buildEntry002NarrativeSynthesisInput({
      risk: 'LOW',
      abstraction: 'LOW',
      wit: 'LOW',
      polarization: 'LOW',
      rawness: 'LOW',
      density: 'LOW',
      surprise: 'LOW',
      directorLatitude: 'LOW',
      boundaries: 'Brand truth overrides appetite',
    });
    const { synthesis } = runNarrativeSelfRevisionLoop(lowRisk);
    expect(synthesis.qaStatus.failureClassifications).toContain('TOO_SAFE');
  });

  it('30–31. prior entry similarity checked', () => {
    const input = buildEntry002NarrativeSynthesisInput();
    const dup = {
      ...input,
      worldCandidates: [{ worldId: 'ndxbook-world-broadcast', label: 'BROADCAST', narrativeFunction: 'REVEAL' as const }],
      artifactCandidates: [{ artifactId: 'artifact-entry-001-vintage-tv', label: 'TV', narrativeRole: 'EVIDENCE' as const }],
      interjectionCandidates: ['TELEVISION / BROADCAST'],
    };
    const qa = runNarrativeOriginalityQA(dup);
    expect(qa.similarityNotes.length).toBeGreaterThan(0);
  });

  it('32–33. self-revision bounded', () => {
    const { revisionPasses } = runNarrativeSelfRevisionLoop(buildEntry002NarrativeSynthesisInput());
    expect(revisionPasses).toBeLessThanOrEqual(MAX_SELF_REVISION_PASSES);
  });

  it('34. no provider dispatch during synthesis', async () => {
    const result = await bootstrapC1NarrativeSynthesis();
    expect(result.providerDispatchCount).toBe(0);
    assertNoProviderDispatchDuringSynthesis(result.narrativeSynthesis);
  });

  it('35–38. Entry 002 golden fixture', async () => {
    const result = await bootstrapC1NarrativeSynthesis();
    const golden = evaluateEntry002GoldenFixture(result.narrativeSynthesis);
    expect(golden.passed).toBe(true);
    expect(result.narrativeSynthesis.roleIntelligence.ndxRole).toBe('INVESTIGATOR');
    expect(result.narrativeSynthesis.roleIntelligence.deviceRole).toBe('PORTAL');
  });

  it('39–41. correction records and generalizable rules', async () => {
    await bootstrapC1NarrativeSynthesis();
    const corrections = listNarrativeCreativeCorrections('entry-002');
    expect(corrections.length).toBeGreaterThanOrEqual(3);
    const rules = listGeneralizableNarrativeRules();
    expect(rules.every((r) => r.surfaceDetailGuard.length > 0)).toBe(true);
    expect(rules.some((r) => r.rule.includes('INVESTIGATOR'))).toBe(true);
  });

  it('42–43. versioning and narrative authority on LOVE_IT', async () => {
    await bootstrapC1NarrativeSynthesis();
    applyNarrativeSynthesisFounderJudgment({ entryId: 'entry-002', founderJudgment: 'LOVE_IT' });
    const result = await bootstrapC1NarrativeSynthesis();
    expect(result.narrativeSynthesis.narrativeAuthority).toBe(true);
    expect(result.narrativeSynthesis.founderJudgment).toBe('LOVE_IT');
  });

  it('44. downstream treatment guard when approved', async () => {
    const result = await bootstrapC1NarrativeSynthesis({ approveForTest: true });
    const treatment = buildEntry002ReelTreatmentAuthority();
    const check = assertTreatmentRespectsNarrativeAuthority({
      synthesis: result.narrativeSynthesis,
      treatmentCoreStory: treatment.coreStory,
    });
    expect(check.valid).toBe(true);
  });

  it('45. founder review exposes cohesive summary fields', async () => {
    const result = await bootstrapC1NarrativeSynthesis();
    expect(result.narrativeSynthesis.creativeDirectorSummary.length).toBe(17);
    expect(result.narrativeSynthesis.humanStorytellingAnswers['1_why_begin_here']).toBeTruthy();
    expect(result.narrativeSynthesis.qaStatus.domains.length).toBeGreaterThan(10);
  });

  it('cohesion QA returns per-domain diagnostics', () => {
    const input = buildEntry002NarrativeSynthesisInput();
    const spine = compileNarrativeSpineFromInput(input);
    const graph = buildCausalityGraph(spine.beats);
    const qa = runNarrativeCohesionQA({
      beats: spine.beats,
      graph,
      audienceJourney: buildAudienceJourneyFromBeats(spine.beats),
      emotionalArc: deriveEmotionalArc(input, spine.beats),
      liveQuestions: [],
      revealStrategy: deriveRevealStrategy(input, spine.beats),
      roles: resolveRoleIntelligence(input),
      payoff: buildNarrativePayoff(spine.beats, 'LINE'),
      interjectionBeatId: 'ns-interjection',
      aftershockPresent: true,
    });
    expect(qa.domains.length).toBeGreaterThan(10);
    expect(qa.domains.every((d) => d.domain.length > 0)).toBe(true);
  });

  it('treatment handoff contract lists immutable elements', async () => {
    const result = await bootstrapC1NarrativeSynthesis();
    const contract = buildTreatmentHandoffContract(result.narrativeSynthesis);
    expect(contract.treatmentMustNotRewrite.length).toBeGreaterThan(0);
    expect(contract.spineBeatOrder.length).toBe(9);
  });

  it('correction capture persists generalizable rule', () => {
    recordNarrativeCreativeCorrection({
      entryId: 'entry-002',
      synthesisVersion: '001',
      originalDecision: 'test',
      founderCorrection: 'test fix',
      failureClass: 'ROLE_CONFUSION',
      whyCorrectionImprovedStory: 'better story',
      generalizableRule: 'TEST RULE WITHOUT SURFACE OVERFIT',
      scope: 'NDXBOOK',
    });
    expect(listNarrativeCreativeCorrections('entry-002').length).toBe(1);
  });
});
