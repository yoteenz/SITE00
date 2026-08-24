/**
 * P0.5E.4 — Founder Character Discovery Room (45 requirements).
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  appendLedgerEntry,
  applyScenarioFounderResponse,
  applyVoiceLabJudgment,
  buildCharacterDiscoveryDomains,
  buildCharacterSynthesisPreview,
  buildDiscoveryScenario,
  buildEmptyFounderDiscoveryRun,
  buildStyleReasoning,
  buildVisualHypothesisReview,
  buildVoiceLabSample,
  castingBlockedBeforeFounderRecognition,
  evaluateCharacterCastingReadiness,
  evaluateExtendedHumanity,
  evaluateFounderRecognitionGate,
  founderRecognitionCannotBeInferred,
  founderRejectionIsData,
  genericStudioWorldHasNoIdentityAssumptions,
  intelligenceCannotDefaultUniversallyHigh,
  intelligenceHasShape,
  isGenericAdjectiveContradiction,
  isSecretlyFlatteringFlaw,
  limeWardrobeUniformNotRequired,
  meaningfulContradictionCount,
  noFalInFounderDiscovery,
  northStarRemainsNonCanon,
  rejectedIdeasRemainInLedger,
  scenarioSupportsItDepends,
  scenarioSupportsNoneOfThese,
  scenarioSupportsSomethingElse,
  seededTraitsRemainNonCanon,
  styleRequiresBehavioralReasoning,
  synthesisPreviewFailsIfBrandDeck,
  synthesisReadsLikeBrandDeck,
  validateCharacterContradiction,
  validateFlawEntry,
  voiceLabPreservesCharacterIdentity,
  blocksFabricatedLivedExperience,
  researchNotPretendSupported,
  FAL_REQUESTS,
  FOUNDER_I_KNOW_HER_CONFIRMED,
  READY_FOR_CHARACTER_CASTING_EXPLORATION,
  READY_FOR_CHARACTER_SYNTHESIS,
} from '../site00-studio-world-production/embodiedCharacterFounderDiscovery/index.js';
import {
  buildNdxEmbodiedCharacterDiscoveryRun,
} from '../site00-brand-lore/ndxEmbodiedCharacterDiscovery/index.js';
import {
  applyFounderTraitJudgment,
  applyScenarioResponse,
  auditNdxEmbodiedCharacterFoundation,
  buildNdxFounderCharacterDiscoveryRun,
  seededContentRemainsProposalUntilFounderReview,
} from '../site00-brand-lore/ndxEmbodiedCharacterFounderDiscovery/index.js';
import {
  brandCharacterImmutable,
  brandCanonUnchanged,
  productExpressionBlocked,
  worldFormationBlocked,
} from '../../api/_lib/site00Evolve/founderCharacterDiscovery/founderCharacterDiscoveryService.js';
import {
  resetFounderCharacterDiscoveryMemory,
  resetFounderCharacterDiscoveryStoreModeCache,
} from '../../api/_lib/site00Evolve/founderCharacterDiscovery/founderCharacterDiscoveryStoreAdapter.js';
import {
  getFounderCharacterDiscoveryState,
  initializeFounderCharacterDiscoveryRoom,
  previewFounderCharacterSynthesis,
  saveFounderCharacterDiscoveryTraitJudgment,
  saveFounderCharacterRecognition,
  saveFounderVisualHypothesisJudgment,
} from '../../api/_lib/site00Evolve/founderCharacterDiscovery/founderCharacterDiscoveryService.js';

const ROOT = join(process.cwd());

describe('P0.5E.4 — Founder Character Discovery Room', () => {
  beforeEach(() => {
    resetFounderCharacterDiscoveryMemory();
    resetFounderCharacterDiscoveryStoreModeCache();
  });

  it('1. Existing seeded character traits remain non-canon', () => {
    const run = buildNdxFounderCharacterDiscoveryRun();
    expect(seededTraitsRemainNonCanon(run.forensicReport.traits)).toBe(true);
    expect(run.forensicReport.totalSeededTraits).toBeGreaterThan(0);
    expect(run.forensicReport.founderConfirmedTraits).toBe(0);
    expect(seededContentRemainsProposalUntilFounderReview(run.forensicReport)).toBe(true);
  });

  it('2. Founder can confirm seeded traits', async () => {
    await initializeFounderCharacterDiscoveryRoom({ projectId: 'ndxbook' });
    const traitId = 'psych-notice-0';
    const updated = await saveFounderCharacterDiscoveryTraitJudgment({
      projectId: 'ndxbook',
      traitId,
      judgment: 'YES_EXACTLY',
    });
    const trait = updated.forensicReport.traits.find((t) => t.traitId === traitId);
    expect(trait?.authority).toBe('FOUNDER_CONFIRMED');
  });

  it('3. Founder can revise seeded traits', () => {
    const run = buildNdxFounderCharacterDiscoveryRun();
    const updated = applyFounderTraitJudgment(run, {
      traitId: 'psych-notice-0',
      judgment: 'CLOSE_BUT',
      revision: 'She notices tone before content.',
    });
    const trait = updated.forensicReport.traits.find((t) => t.traitId === 'psych-notice-0');
    expect(trait?.authority).toBe('FOUNDER_REVISED');
    expect(trait?.statement).toContain('tone');
  });

  it('4. Founder can reject seeded traits', () => {
    const run = buildNdxFounderCharacterDiscoveryRun();
    const updated = applyFounderTraitJudgment(run, {
      traitId: 'psych-notice-0',
      judgment: 'NO',
    });
    expect(updated.forensicReport.traits.find((t) => t.traitId === 'psych-notice-0')?.authority).toBe('FOUNDER_REJECTED');
  });

  it('5. Founder can add entirely new traits', () => {
    const run = buildNdxFounderCharacterDiscoveryRun();
    const updated = applyFounderTraitJudgment(run, {
      traitId: 'psych-notice-0',
      judgment: 'SOMETHING_ELSE',
      revision: 'She notices when someone is performing certainty.',
    });
    expect(updated.forensicReport.traits.find((t) => t.traitId === 'psych-notice-0')?.authority).toBe('FOUNDER_ADDED');
  });

  it('6. NONE OF THESE is supported', () => {
    const scenario = buildDiscoveryScenario({
      scenarioId: 'test',
      domain: 'CONFLICT',
      situation: 'Test',
      possibleResponses: ['A', 'B'],
      behavioralImplication: 'Test',
    });
    expect(scenarioSupportsNoneOfThese(scenario)).toBe(true);
  });

  it('7. SOMETHING_ELSE is supported', () => {
    const scenario = buildDiscoveryScenario({
      scenarioId: 'test',
      domain: 'CONFLICT',
      situation: 'Test',
      possibleResponses: ['A'],
      behavioralImplication: 'Test',
    });
    expect(scenarioSupportsSomethingElse(scenario)).toBe(true);
  });

  it('8. IT DEPENDS is supported', () => {
    const scenario = buildDiscoveryScenario({
      scenarioId: 'test',
      domain: 'CONFLICT',
      situation: 'Test',
      possibleResponses: ['A'],
      behavioralImplication: 'Test',
    });
    expect(scenarioSupportsItDepends(scenario)).toBe(true);
  });

  it('9. Unresolved character information is valid', () => {
    const run = buildNdxFounderCharacterDiscoveryRun();
    const updated = applyFounderTraitJudgment(run, {
      traitId: 'psych-notice-0',
      judgment: 'I_DONT_KNOW_YET',
    });
    const trait = updated.forensicReport.traits.find((t) => t.traitId === 'psych-notice-0');
    expect(trait?.authority).toBe('UNRESOLVED');
    expect(trait?.confidence).toBe('UNRESOLVED');
  });

  it('10. Scenario discovery records behavioral evidence', () => {
    const run = buildNdxFounderCharacterDiscoveryRun();
    const updated = applyScenarioResponse(run, {
      scenarioId: 'ndx-wrong-receipt',
      response: 'Sits there staring at the receipt in complete silence for 30 seconds first.',
      judgment: 'YES_EXACTLY',
    });
    const scenario = updated.scenarios.find((s) => s.scenarioId === 'ndx-wrong-receipt');
    expect(scenario?.founderResponse).toBeTruthy();
    expect(scenario?.characterEvidence).toBeTruthy();
  });

  it('11. Generic flattering flaws fail', () => {
    expect(isSecretlyFlatteringFlaw('She cares too much about everything')).toBe(true);
    expect(validateFlawEntry({
      flawId: 'x',
      category: 'ACTUAL_FLAW',
      description: 'Too passionate',
      founderAuthority: 'SYSTEM_SEEDED',
      secretlyFlattering: false,
    }).ok).toBe(false);
  });

  it('12. Genuine flaws are supported', () => {
    const run = buildNdxFounderCharacterDiscoveryRun();
    expect(run.flawProfile.flaws.every((f) => validateFlawEntry(f).ok)).toBe(true);
  });

  it('13. Contradictions require contextual explanation', () => {
    const run = buildNdxFounderCharacterDiscoveryRun();
    expect(run.contradictions.every((c) => validateCharacterContradiction(c).ok)).toBe(true);
  });

  it('14. Generic adjective contradictions fail', () => {
    expect(isGenericAdjectiveContradiction('smart', 'fun')).toBe(true);
    expect(isGenericAdjectiveContradiction('demands receipts', 'forms opinion too early')).toBe(false);
  });

  it('15. Intelligence cannot default universally high', () => {
    const run = buildNdxFounderCharacterDiscoveryRun();
    expect(intelligenceCannotDefaultUniversallyHigh(run.intelligenceMap)).toBe(true);
    expect(intelligenceHasShape(run.intelligenceMap)).toBe(true);
  });

  it('16. Cultural knowledge boundaries are represented', () => {
    const run = buildNdxFounderCharacterDiscoveryRun();
    expect(run.culturalBoundaries.some((b) => b.level === 'DO_NOT_PRETEND')).toBe(true);
    expect(researchNotPretendSupported(run.culturalBoundaries)).toBe(true);
  });

  it('17. False lived experience is blocked', () => {
    const run = buildNdxFounderCharacterDiscoveryRun();
    expect(run.culturalBoundaries.every((b) => blocksFabricatedLivedExperience(b))).toBe(true);
  });

  it('18. Private humanity is modeled', () => {
    const run = buildNdxFounderCharacterDiscoveryRun();
    expect(run.flawProfile.procrastinates.length).toBeGreaterThan(0);
    expect(run.publicPrivate.friendsKnow.length).toBeGreaterThan(0);
  });

  it('19. Relationships are modeled', () => {
    const run = buildNdxFounderCharacterDiscoveryRun();
    expect(run.relationships.classes.length).toBeGreaterThanOrEqual(3);
  });

  it('20. Public/private difference is modeled', () => {
    const run = buildNdxFounderCharacterDiscoveryRun();
    expect(run.publicPrivate.strangersThink.length).toBeGreaterThan(0);
    expect(run.publicPrivate.friendsKnow.length).toBeGreaterThan(0);
  });

  it('21. Same thought expressed across voice channels', () => {
    const sample = buildVoiceLabSample('That cannot be right.');
    expect(sample.expressions.INNER_THOUGHT).toBeTruthy();
    expect(sample.expressions.MARGIN).toBeTruthy();
    expect(sample.expressions.TIKTOK).toBeTruthy();
    expect(sample.expressions.TEXT_TO_FRIEND).toBeTruthy();
  });

  it('22. Platform voice variation preserves character identity', () => {
    const sample = buildVoiceLabSample('She noticed the contradiction.');
    expect(voiceLabPreservesCharacterIdentity(sample)).toBe(true);
    const judged = applyVoiceLabJudgment(sample, 'MARGIN', 'YES_EXACTLY');
    expect(judged.judgments.MARGIN).toBe('YES_EXACTLY');
  });

  it('23. Book relationship reveals psychology', () => {
    const run = buildNdxFounderCharacterDiscoveryRun();
    expect(run.bookDiscovery.whySheWritesThingsDown).toBeTruthy();
    expect(run.bookDiscovery.earnsDogEar.length).toBeGreaterThan(0);
  });

  it('24. Founder visual selections remain evidence not identity canon', () => {
    const run = buildNdxFounderCharacterDiscoveryRun();
    expect(run.visualHypothesisReviews.every((v) => northStarRemainsNonCanon(v))).toBe(true);
  });

  it('25. Individual visual tendencies can be rejected', async () => {
    const init = await initializeFounderCharacterDiscoveryRoom({ projectId: 'ndxbook' });
    const hyp = init.visualHypothesisReviews[0]!;
    const updated = await saveFounderVisualHypothesisJudgment({
      projectId: 'ndxbook',
      hypothesisId: hyp.hypothesisId,
      judgment: 'NO',
    });
    expect(updated.visualHypothesisReviews.find((v) => v.hypothesisId === hyp.hypothesisId)?.judgment).toBe('NO');
  });

  it('26. Style hypotheses require behavioral reasoning', () => {
    const reasoning = buildStyleReasoning('oversized blazer', 'She wears it when she needs armor before a hard conversation.');
    expect(styleRequiresBehavioralReasoning(reasoning)).toBe(true);
    expect(reasoning.costumeDisguisedAsPersonalStyle).toBe(false);
  });

  it('27. Lime wardrobe uniformity is not required', () => {
    const reasoning = buildStyleReasoning('lime accent tee', 'Occasional brand intervention, not uniform.');
    expect(limeWardrobeUniformNotRequired(reasoning)).toBe(true);
  });

  it('28. Character discovery decisions preserve lineage', () => {
    const run = buildNdxFounderCharacterDiscoveryRun();
    const updated = applyFounderTraitJudgment(run, {
      traitId: 'psych-notice-0',
      judgment: 'NO',
    });
    expect(updated.ledger.length).toBeGreaterThan(run.ledger.length);
  });

  it('29. Rejected character ideas remain historical evidence', () => {
    let ledger = appendLedgerEntry({
      ledger: [],
      proposal: 'She always confronts misinformation immediately.',
      source: 'SYSTEM_SEEDED',
      currentStatement: 'She tends to observe first.',
      authority: 'FOUNDER_REVISED',
      confidence: 'STRONG',
    });
    ledger = appendLedgerEntry({
      ledger,
      proposal: 'She always confronts misinformation immediately.',
      source: 'FOUNDER_REVISED',
      currentStatement: 'Rejected version',
      authority: 'FOUNDER_REJECTED',
      confidence: 'REJECTED',
      priorEntryId: ledger[0]!.entryId,
    });
    expect(rejectedIdeasRemainInLedger(ledger)).toBe(true);
  });

  it('30. Character truth confidence states work', () => {
    const run = buildNdxFounderCharacterDiscoveryRun();
    expect(run.forensicReport.traits.every((t) => t.confidence !== 'CANON')).toBe(true);
  });

  it('31. Humanity evaluation detects perfection', () => {
    const shell = buildEmptyFounderDiscoveryRun({ runId: 'x', projectId: 'p', brandId: 'b' });
    const evalFail = evaluateExtendedHumanity({
      contradictions: [],
      flawProfile: shell.flawProfile,
      intelligenceMap: shell.intelligenceMap,
      relationships: shell.relationships,
      culturalBoundaries: [],
      publicPrivate: shell.publicPrivate,
      privateHumanityPresent: false,
    });
    expect(evalFail.passes).toBe(false);
    expect(evalFail.failures).toContain('FAIL_TOO_PERFECT');
  });

  it('32. Humanity evaluation detects mascot collapse guard', () => {
    const run = buildNdxFounderCharacterDiscoveryRun();
    expect(run.humanityEvaluation.mascotRisk).toBe(false);
  });

  it('33. Humanity evaluation detects influencer collapse guard', () => {
    const run = buildNdxFounderCharacterDiscoveryRun();
    expect(run.humanityEvaluation.influencerRisk).toBe(false);
  });

  it('34. Humanity evaluation detects founder-clone collapse guard', () => {
    const run = buildNdxFounderCharacterDiscoveryRun();
    expect(run.humanityEvaluation.founderCloneRisk).toBe(false);
  });

  it('35. Humanity evaluation detects cultural omniscience', () => {
    const shell = buildEmptyFounderDiscoveryRun({ runId: 'x', projectId: 'p', brandId: 'b' });
    const evalFail = evaluateExtendedHumanity({
      contradictions: [],
      flawProfile: shell.flawProfile,
      intelligenceMap: shell.intelligenceMap,
      relationships: shell.relationships,
      culturalBoundaries: [],
      publicPrivate: shell.publicPrivate,
      privateHumanityPresent: false,
    });
    expect(evalFail.failures).toContain('FAIL_CULTURAL_OMNISCIENCE');
  });

  it('36. Character synthesis preview is founder-facing', async () => {
    await initializeFounderCharacterDiscoveryRoom({ projectId: 'ndxbook' });
    const updated = await previewFounderCharacterSynthesis({ projectId: 'ndxbook' });
    expect(updated.synthesisPreview?.whoSheIs).toBeTruthy();
    expect(updated.synthesisPreview?.readsLikeBrandDeck).toBe(false);
  });

  it('37. Synthesis fails when it reads like brand attributes', () => {
    const brandDeck = 'BRAND ATTRIBUTES: INTELLIGENT WITTY CULTURAL AUTHENTIC brand deck';
    expect(synthesisReadsLikeBrandDeck(brandDeck)).toBe(true);
    const run = buildNdxFounderCharacterDiscoveryRun();
    const preview = buildCharacterSynthesisPreview(run);
    expect(synthesisPreviewFailsIfBrandDeck(preview)).toBe(false);
  });

  it('38. Founder I KNOW HER gate cannot be inferred', () => {
    const run = buildNdxFounderCharacterDiscoveryRun();
    expect(founderRecognitionCannotBeInferred(run.founderRecognition)).toBe(true);
    expect(evaluateFounderRecognitionGate(null)).toBe(false);
  });

  it('39. Casting remains blocked before founder recognition', () => {
    const run = buildNdxFounderCharacterDiscoveryRun();
    expect(castingBlockedBeforeFounderRecognition(run.castingReadiness)).toBe(true);
    expect(run.castingReadiness.readyForCastingExploration).toBe(false);
  });

  it('40. No FAL generation occurs', () => {
    const run = buildNdxFounderCharacterDiscoveryRun();
    expect(noFalInFounderDiscovery(run)).toBe(true);
    expect(run.falRequests).toBe(0);
    expect(FAL_REQUESTS).toBe(0);
  });

  it('41. No final face is selected', () => {
    const run = buildNdxFounderCharacterDiscoveryRun();
    expect(run.system.finalFaceSelected).toBe(false);
  });

  it('42. Brand Character remains unchanged', () => {
    expect(brandCharacterImmutable()).toBe(true);
  });

  it('43. Brand Canon remains unchanged', () => {
    expect(brandCanonUnchanged()).toBe(true);
  });

  it('44. Existing P0.5C/P0.5D/P0.5E behavior remains unchanged', async () => {
    const audit = auditNdxEmbodiedCharacterFoundation(buildNdxEmbodiedCharacterDiscoveryRun('ndxbook'));
    expect(audit.startingCastingReadiness).toBe('BLOCKED_FOUNDER_DISCOVERY_REQUIRED');
    expect(productExpressionBlocked()).toBe(true);
    expect(worldFormationBlocked()).toBe(true);
    const state = await getFounderCharacterDiscoveryState({ projectId: 'ndxbook' });
    expect(state).toBeNull();
  });

  it('45. Generic Studio World contains no NDX-specific identity assumptions', () => {
    const domains = buildCharacterDiscoveryDomains();
    expect(domains).toHaveLength(28);
    const genericSource = readFileSync(
      join(ROOT, 'shared/site00-studio-world-production/embodiedCharacterFounderDiscovery/discoveryDomains.ts'),
      'utf8',
    );
    expect(genericStudioWorldHasNoIdentityAssumptions(genericSource)).toBe(true);
    expect(founderRejectionIsData('NONE_OF_THESE')).toBe(true);
    expect(READY_FOR_CHARACTER_SYNTHESIS).toBe(false);
    expect(READY_FOR_CHARACTER_CASTING_EXPLORATION).toBe(false);
    expect(FOUNDER_I_KNOW_HER_CONFIRMED).toBe(false);
    expect(meaningfulContradictionCount(buildNdxFounderCharacterDiscoveryRun().contradictions)).toBeGreaterThanOrEqual(3);
  });
});

describe('P0.5E.4 — Founder recognition unlock path', () => {
  beforeEach(() => {
    resetFounderCharacterDiscoveryMemory();
    resetFounderCharacterDiscoveryStoreModeCache();
  });

  it('recognition YES_I_KNOW_HER alone does not unlock casting without other gates', async () => {
    await initializeFounderCharacterDiscoveryRoom({ projectId: 'ndxbook' });
    const updated = await saveFounderCharacterRecognition({
      projectId: 'ndxbook',
      response: 'YES_I_KNOW_HER',
    });
    expect(updated.founderRecognition.response).toBe('YES_I_KNOW_HER');
    expect(updated.founderRecognition.inferred).toBe(false);
    expect(updated.castingReadiness.readyForCharacterSynthesis).toBe(false);
  });
});
