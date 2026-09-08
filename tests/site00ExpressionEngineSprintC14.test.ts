/**
 * C1.4 — Senior Creative Judgment Engine + Entry 003 regression.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  bootstrapC14Entry003SeniorCreativeJudgment,
  bootstrapC13Entry003CinematicContinuity,
  bootstrapC12Entry003AutonomousCreativeDirector,
  resetEntry003Store,
} from '../api/_lib/site00ExpressionEngine/entry003/entry003Service.js';
import {
  runSeniorCreativeJudgment,
  runSeniorCreativeJudgmentFromConcept,
  getSeniorCreativeJudgmentArchitectureStack,
  assessQualityTier,
} from '../api/_lib/site00ExpressionEngine/seniorCreativeJudgment/seniorCreativeJudgmentEngine.js';
import {
  abstractFounderCorrection,
  evaluateCorrectionOverfit,
  listCreativeCorrectionPrinciples,
  resetCreativeCorrectionStore,
} from '../api/_lib/site00ExpressionEngine/seniorCreativeJudgment/creativeCorrectionIntelligence.js';
import { runMarketingPackageMasterDirector } from '../api/_lib/site00ExpressionEngine/marketingPackageMasterDirector/marketingPackageMasterDirector.js';
import { compileEntry002LockedEntry } from '../api/_lib/site00ExpressionEngine/entry002Blueprint.js';
import { buildPriorEntryLineage } from '../api/_lib/site00ExpressionEngine/creativeDirector/creativeDirectorContextBuilder.js';
import { resetCreativeDirectorRuntimeStore } from '../api/_lib/site00ExpressionEngine/creativeDirector/creativeDirectorService.js';
import {
  CREATIVE_QUALITY_TIERS,
  SENIOR_CREATIVE_FAILURE_CLASSES,
  HANDOFF_MATURITY_TYPES,
  RECEIPT_MODES,
} from '../shared/site00-expression-engine/senior-creative-judgment/types.js';
import type { SeniorCreativeJudgmentInput } from '../shared/site00-expression-engine/senior-creative-judgment/types.js';
import { ENTRY_003_C13_GATE_ID, ENTRY_003_C14_GATE_ID } from '../shared/site00-expression-engine/entry-003/types.js';

function baseInput(overrides: Partial<SeniorCreativeJudgmentInput> = {}): SeniorCreativeJudgmentInput {
  return {
    projectId: 'generic-brand',
    campaignId: 'launch-q1',
    contentUnitId: 'unit-hero-reel',
    formatTarget: 'REEL',
    conceptName: 'THE EMPLOYEE-ONLY DOOR',
    oneSentenceIdea: 'Camera discovers classified labor behind a beauty ritual threshold',
    thesis: 'Effortless beauty hides invisible labor',
    world: 'Employee-only door separating front-stage vanity from back-stage maintenance',
    worldFunction: 'Separates public performance from classified labor infrastructure',
    artifact: 'STAFF SHIFT RECEIPT / SCHEDULE SLIP',
    artifactFunction: 'Timestamp proof of shift overlap',
    interjection: "YOU DIDN'T SKIP STEPS. YOU SKIPPED THE CAMERA.",
    openingImage: 'Vanity mirror → door edge in frame',
    centralReveal: 'Door opens — same face, different shift clock beyond threshold',
    turningPoint: 'Camera crosses employee-only threshold',
    climaxImage: 'Door signage reflected in vanity mirror',
    endingImage: 'Wellness notification tease — non-canon seed',
    handoffOut: 'Open question: wellness language vs behavior receipts',
    entry004Tease: 'Calendar notification tone — no subject lock',
    deeperContradiction: 'Culture made admitting labor unfashionable, not labor itself',
    culturalRead: 'Clean-girl aesthetic performs natural while infrastructure runs classified',
    ...overrides,
  };
}

describe('C1.4 Senior Creative Judgment Engine', () => {
  beforeEach(() => {
    process.env.EXPRESSION_ENGINE_TEST_DETERMINISTIC_CREATIVE_DIRECTOR = '1';
    resetCreativeDirectorRuntimeStore();
    resetEntry003Store();
    resetCreativeCorrectionStore();
  });

  it('1. SeniorCreativeJudgmentEngine exists', () => {
    const stack = getSeniorCreativeJudgmentArchitectureStack();
    expect(stack).toContain('SENIOR CREATIVE JUDGMENT');
    const out = runSeniorCreativeJudgment(baseInput());
    expect(out.engineVersion).toBe('1.4.0');
  });

  it('2. engine is generic beyond NDXBOOK', () => {
    const out = runSeniorCreativeJudgment(
      baseInput({
        projectId: 'acme-skincare',
        campaignId: 'product-launch-2026',
        contentUnitId: 'hero-film-01',
      }),
    );
    expect(out.input.projectId).toBe('acme-skincare');
    expect(out.input.campaignId).toBe('product-launch-2026');
  });

  it('3. CreativeQualityTier exists', () => {
    expect(CREATIVE_QUALITY_TIERS).toEqual(['VALID', 'STRONG', 'EXCEPTIONAL']);
  });

  it('4. VALID differs from STRONG', () => {
    const museum = runSeniorCreativeJudgment(
      baseInput({ conceptName: 'THE SHELFIE MUSEUM', world: 'Product count museum display room' }),
    );
    const door = runSeniorCreativeJudgment(baseInput());
    expect(museum.qualityTier).toBe('VALID');
    expect(['STRONG', 'EXCEPTIONAL']).toContain(door.qualityTier);
  });

  it('5. STRONG differs from EXCEPTIONAL', () => {
    const strongOnly = assessQualityTier({
      metaphor: {
        argumentIntegration: 70,
        narrativeNecessity: 70,
        physicalBehavior: 70,
        visualPotential: 70,
        surprise: 70,
        specificity: 70,
        depth: 70,
        discoverability: 70,
        nonLiteralness: 70,
        subjectOwnership: 70,
        classification: 'FUNCTIONAL',
        rationale: 'functional',
      },
      cinematic: {
        cinematicNecessity: 'HIGH',
        temporalDiscovery: 80,
        cameraDiscovery: 80,
        performance: 80,
        spatialReveal: 80,
        movement: 80,
        escalation: 80,
        staticEquivalentRisk: false,
        rationale: 'film',
      },
      gate: { passed: true, domains: {}, failureClasses: [], blocksFounderReview: false },
      handholding: 'MODERATE',
    });
    const exceptional = assessQualityTier({
      metaphor: {
        argumentIntegration: 90,
        narrativeNecessity: 90,
        physicalBehavior: 90,
        visualPotential: 90,
        surprise: 90,
        specificity: 90,
        depth: 90,
        discoverability: 90,
        nonLiteralness: 90,
        subjectOwnership: 90,
        classification: 'STRUCTURAL',
        rationale: 'structural',
      },
      cinematic: {
        cinematicNecessity: 'HIGH',
        temporalDiscovery: 90,
        cameraDiscovery: 90,
        performance: 90,
        spatialReveal: 90,
        movement: 90,
        escalation: 90,
        staticEquivalentRisk: false,
        rationale: 'film',
      },
      gate: { passed: true, domains: {}, failureClasses: [], blocksFounderReview: false },
      handholding: 'LOW',
    });
    expect(strongOnly).toBe('STRONG');
    expect(exceptional).toBe('EXCEPTIONAL');
  });

  it('6. first passing concept is challenged', () => {
    const out = runSeniorCreativeJudgment(baseInput());
    expect(out.firstAnswerChallenge.attackVectors.length).toBeGreaterThanOrEqual(3);
    expect(out.firstAnswerChallenge.resolution).not.toBe('KEEP');
  });

  it('7. FirstAnswerChallenge runs', () => {
    const out = runSeniorCreativeJudgment(baseInput());
    expect(out.firstAnswerChallenge.initialWinnerId).toBe('THE EMPLOYEE-ONLY DOOR');
    expect(out.firstAnswerChallenge.rationale.length).toBeGreaterThan(10);
  });

  it('8. CreativeRedTeamPass runs', () => {
    const out = runSeniorCreativeJudgment(baseInput());
    expect(out.redTeam.strongestCriticism.length).toBeGreaterThan(20);
    expect(out.redTeam.moreMemorableImage.length).toBeGreaterThan(10);
  });

  it('9. challenger concept is generated', () => {
    const out = runSeniorCreativeJudgment(baseInput());
    expect(out.challenger.conceptName).toContain('THRESHOLD');
    expect(out.challenger.scores.cinematicity).toBeGreaterThan(80);
  });

  it('10. winner vs challenger comparison occurs', () => {
    const out = runSeniorCreativeJudgment(baseInput());
    expect(out.winnerComparison.winnerId).toBe(out.input.conceptName);
    expect(out.winnerComparison.challengerId).toBe(out.challenger.challengerId);
    expect(out.winnerComparison.overallWinner).toBeTruthy();
  });

  it('11. concept can self-supersede', () => {
    const out = runSeniorCreativeJudgment(baseInput());
    expect(out.supersededConceptHistory.some((s) => s.reason.includes('SUPERSEDED_BY_DEEPER'))).toBe(true);
  });

  it('12. superseded concept history is preserved', () => {
    const out = runSeniorCreativeJudgment(baseInput());
    const shelfie = out.supersededConceptHistory.find((s) => s.conceptName.includes('SHELFIE'));
    expect(shelfie?.supersededAt).toBeTruthy();
  });

  it('13. deeper creative reframe exists', () => {
    const out = runSeniorCreativeJudgment(baseInput());
    expect(out.deepReframe.secondOrderContradiction.length).toBeGreaterThan(20);
    expect(out.deepReframe.mostInterestingLevel).toBeTruthy();
  });

  it('14. measurable receipt differs from human revelation', () => {
    const out = runSeniorCreativeJudgment(baseInput());
    expect(out.measurableVsHuman.measurableReceipt).toBeTruthy();
    expect(out.measurableVsHuman.humanRevelation).toBeTruthy();
    expect(out.measurableVsHuman.measurableReceipt).not.toBe(out.measurableVsHuman.humanRevelation);
  });

  it('15. METRIC_IS_THE_IDEA can fail', () => {
    const out = runSeniorCreativeJudgment(baseInput({ conceptName: 'THE SHELFIE MUSEUM' }));
    expect(out.measurableVsHuman.metricIsTheIdea).toBe(true);
    expect(SENIOR_CREATIVE_FAILURE_CLASSES).toContain('METRIC_IS_THE_IDEA');
  });

  it('16. MetaphorMaturityAssessment exists', () => {
    const out = runSeniorCreativeJudgment(baseInput());
    expect(out.metaphorMaturity.classification).toBeTruthy();
    expect(out.metaphorMaturity.depth).toBeGreaterThan(0);
  });

  it('17. decorative metaphor can fail', () => {
    const out = runSeniorCreativeJudgment(
      baseInput({ world: 'Shelfie museum product display', conceptName: 'THE SHELFIE MUSEUM' }),
    );
    expect(['DECORATIVE', 'ILLUSTRATIVE']).toContain(out.metaphorMaturity.classification);
  });

  it('18. structural metaphor scores stronger', () => {
    const structural = runSeniorCreativeJudgment(baseInput());
    const illustrative = runSeniorCreativeJudgment(
      baseInput({ world: 'Shelfie museum', conceptName: 'THE SHELFIE MUSEUM' }),
    );
    expect(structural.metaphorMaturity.depth).toBeGreaterThan(illustrative.metaphorMaturity.depth);
  });

  it('19. WorldArgumentAssessment exists', () => {
    const out = runSeniorCreativeJudgment(baseInput());
    expect(out.worldArgument.worldVerb).toBeTruthy();
    expect(typeof out.worldArgument.losesMeaningWithoutWorld).toBe('boolean');
  });

  it('20. decorative world can fail', () => {
    const out = runSeniorCreativeJudgment(
      baseInput({ world: 'Neutral white studio room', worldFunction: 'Stage products' }),
    );
    expect(out.worldArgument.decorativeRisk).toBe(true);
    expect(out.founderHandholdingRisk).toBe('HIGH');
  });

  it('21. ArtifactNecessityAssessment exists', () => {
    const out = runSeniorCreativeJudgment(baseInput());
    expect(out.artifactNecessity.outcome).toBeTruthy();
  });

  it('22. primary artifact is optional', () => {
    const out = runSeniorCreativeJudgment(baseInput({ artifact: null, artifactFunction: null }));
    expect(out.artifactNecessity.outcome).toBe('ENVIRONMENT_IS_RECEIPT');
  });

  it('23. EXPLANATORY_PROP can fail', () => {
    const out = runSeniorCreativeJudgment(baseInput());
    expect(out.artifactNecessity.explanatoryPropRisk).toBe(true);
    expect(out.failureClasses).toContain('EXPLANATORY_PROP');
  });

  it('24. ENVIRONMENT_IS_RECEIPT supported', () => {
    expect(RECEIPT_MODES).toContain('ENVIRONMENT');
    const out = runSeniorCreativeJudgment(baseInput());
    expect(out.receiptModes).toContain('ENVIRONMENT');
  });

  it('25. BEHAVIOR_IS_RECEIPT supported', () => {
    expect(RECEIPT_MODES).toContain('BEHAVIOR');
    const out = runSeniorCreativeJudgment(baseInput());
    expect(out.receiptModes).toContain('BEHAVIOR');
  });

  it('26. SPATIAL_REVEAL receipt supported', () => {
    expect(RECEIPT_MODES).toContain('SPATIAL_REVEAL');
    const out = runSeniorCreativeJudgment(baseInput());
    expect(out.receiptModes).toContain('SPATIAL_REVEAL');
  });

  it('27. CinematicNecessityAssessment exists', () => {
    const out = runSeniorCreativeJudgment(baseInput());
    expect(out.cinematicNecessity.cinematicNecessity).toBe('HIGH');
  });

  it('28. static-equivalent Reel can fail', () => {
    const out = runSeniorCreativeJudgment(baseInput({ conceptName: 'THE SHELFIE MUSEUM' }));
    expect(out.cinematicNecessity.staticEquivalentRisk).toBe(true);
    expect(out.cinematicNecessity.cinematicNecessity).toBe('LOW');
  });

  it('29. HeroMemoryImage required for film concepts', () => {
    const out = runSeniorCreativeJudgment(baseInput({ formatTarget: 'FILM' }));
    expect(out.heroMemoryImage.present).toBe(true);
    expect(out.heroMemoryImage.imageDescription.length).toBeGreaterThan(10);
  });

  it('30. CameraDiscoveryFunction exists', () => {
    const out = runSeniorCreativeJudgment(baseInput());
    expect(out.cameraDiscovery.function).toBe('CROSSES_THRESHOLD');
  });

  it('31. PerformanceLogic exists', () => {
    const out = runSeniorCreativeJudgment(baseInput());
    expect(out.performanceLogic.performanceChanges).toBe(true);
    expect(out.performanceLogic.passiveSubjectRisk).toBe(false);
  });

  it('32. visual wit differs from copy wit', () => {
    const out = runSeniorCreativeJudgment(baseInput());
    expect(out.visualWit.visualWit).not.toBe(out.visualWit.copyWit);
  });

  it('33. structural irony assessed', () => {
    const out = runSeniorCreativeJudgment(baseInput());
    expect(out.visualWit.structuralIrony).toBeGreaterThan(70);
  });

  it('34. FounderHandholdingRisk exists', () => {
    const out = runSeniorCreativeJudgment(baseInput());
    expect(['LOW', 'MODERATE', 'HIGH']).toContain(out.founderHandholdingRisk);
  });

  it('35. HIGH handholding risk blocks founder review', () => {
    const weak = runSeniorCreativeJudgment(
      baseInput({ world: 'Neutral catalog room', worldFunction: 'Display products evenly' }),
    );
    expect(weak.founderHandholdingRisk).toBe('HIGH');
    expect(weak.blocksFounderReview).toBe(true);
  });

  it('36. correction abstraction stores principles not surfaces', () => {
    const record = abstractFounderCorrection({
      surfaceFeedback: 'Shift receipt too explanatory',
      taxonomy: 'ARTIFACT_REDUNDANT',
    });
    expect(record.generalizablePrinciple).toContain('world behavior');
    expect(record.generalizablePrinciple.toLowerCase()).not.toContain('always remove');
  });

  it('37. correction overfit guard exists', () => {
    const bad = evaluateCorrectionOverfit('always use a door in every campaign');
    expect(bad.isSurfaceDevice).toBe(true);
    const good = evaluateCorrectionOverfit(
      'When world behavior already proves the contradiction, avoid redundant explanatory artifacts.',
    );
    expect(good.isPrinciple).toBe(true);
  });

  it('38. Entry 003 surface devices are not globally hardcoded', () => {
    const principles = listCreativeCorrectionPrinciples();
    const text = principles.map((p) => p.generalizablePrinciple).join(' ');
    expect(text.toLowerCase()).not.toContain('always use back-of-house');
    expect(text.toLowerCase()).not.toContain('always use a door');
    expect(text.toLowerCase()).not.toContain('avoid museums');
  });

  it('39. OPEN_HANDOFF supported', () => {
    expect(HANDOFF_MATURITY_TYPES).toContain('OPEN_HANDOFF');
    const out = runSeniorCreativeJudgment(baseInput());
    expect(out.handoffMaturity).toBe('OPEN_HANDOFF');
  });

  it('40. CLOSED_HANDOFF supported', () => {
    expect(HANDOFF_MATURITY_TYPES).toContain('CLOSED_HANDOFF');
  });

  it('41. future-unit tease has openness score', () => {
    const out = runSeniorCreativeJudgment(baseInput());
    expect(out.futureUnitTease.opennessScore).toBeGreaterThan(70);
    expect(out.futureUnitTease.nonCanon).toBe(true);
  });

  it('42. TEASER_BECAME_NEXT_BRIEF can fail', () => {
    expect(SENIOR_CREATIVE_FAILURE_CLASSES).toContain('TEASER_BECAME_NEXT_BRIEF');
    const out = runSeniorCreativeJudgment(baseInput());
    expect(out.futureUnitTease.conceptLockRisk).toBe(false);
  });

  it('43. sequence responsibility feeds subject discovery', () => {
    const out = runSeniorCreativeJudgment(baseInput());
    expect(out.campaignResponsibility.whatNextUnitMustAdd.length).toBeGreaterThanOrEqual(1);
    expect(out.campaignResponsibility.whatNextUnitMustAdd[0]!.length).toBeGreaterThan(10);
    expect(out.campaignResponsibility.whatNextUnitMustNotRepeat.some((s) => s.includes('example'))).toBe(true);
  });

  it('44. SAME ARGUMENT NEW EXAMPLE can fail', () => {
    expect(SENIOR_CREATIVE_FAILURE_CLASSES).toContain('EXAMPLE_ONLY_ESCALATION');
  });

  it('45. campaign escalation dimensions exist', () => {
    const out = runSeniorCreativeJudgment(baseInput());
    expect(out.campaignResponsibility.availableEscalationDirections.length).toBeGreaterThanOrEqual(3);
  });

  it('46. campaign cohesion differs from repetition', () => {
    const mpmd = runMarketingPackageMasterDirector();
    expect(mpmd.callbacks.length).toBeGreaterThan(0);
    expect(mpmd.creativePipelineStack).toContain('SENIOR CREATIVE JUDGMENT');
    const cohesionViaThesis = mpmd.campaignThesis.length > 10;
    const repetitionTrap = mpmd.heroMoments.every((h) => h === mpmd.heroMoments[0]);
    expect(cohesionViaThesis).toBe(true);
    expect(repetitionTrap).toBe(false);
  });

  it('47. medium necessity exists', () => {
    const out = runSeniorCreativeJudgment(baseInput());
    expect(out.mediumNecessity.necessityScore).toBeGreaterThan(0);
  });

  it('48. film uses cinematic-specific judgment', () => {
    const out = runSeniorCreativeJudgment(baseInput({ formatTarget: 'FILM' }));
    expect(out.mediumNecessity.medium).toBe('FILM');
    expect(out.cinematicNecessity.cinematicNecessity).toBe('HIGH');
  });

  it('49. carousel uses sequence-specific judgment', () => {
    const out = runSeniorCreativeJudgment(baseInput({ formatTarget: 'CAROUSEL' }));
    expect(out.mediumNecessity.medium).toBe('CAROUSEL');
    expect(out.mediumNecessity.whyThisMedium).toContain('Sequence');
  });

  it('50. story uses attention/progression judgment', () => {
    const out = runSeniorCreativeJudgment(baseInput({ formatTarget: 'STORY' }));
    expect(out.mediumNecessity.medium).toBe('STORY');
    expect(out.mediumNecessity.mediumExploited).toBe(false);
  });

  it('51. X uses rhetorical judgment', () => {
    const out = runSeniorCreativeJudgment(baseInput({ formatTarget: 'X' }));
    expect(out.mediumNecessity.medium).toBe('X');
    expect(out.mediumNecessity.whyThisMedium).toContain('compression');
  });

  it('52. Entry 003 regression identifies artifact redundancy possibility', async () => {
    const result = await bootstrapC14Entry003SeniorCreativeJudgment();
    expect(result.seniorCreativeJudgment.artifactNecessity.explanatoryPropRisk).toBe(true);
    expect(result.seniorCreativeJudgment.artifactNecessity.outcome).toBe('SUPPORTING_ARTIFACT_ONLY');
  });

  it('53. Entry 003 regression treats phone as bridge not world', async () => {
    const result = await bootstrapC14Entry003SeniorCreativeJudgment();
    const lineage = result.marketingPackageMasterDirector.artifactLineage.entries.find((e) => e.unitId === 'entry-002');
    expect(lineage?.rationale.toLowerCase()).toContain('bridge');
    expect(result.seniorCreativeJudgment.input.world.toLowerCase()).not.toContain('phone');
  });

  it('54. Entry 004 tease remains non-canon/open', async () => {
    const result = await bootstrapC14Entry003SeniorCreativeJudgment();
    expect(result.seniorCreativeJudgment.futureUnitTease.nonCanon).toBe(true);
    expect(result.seniorCreativeJudgment.futureUnitTease.conceptLockRisk).toBe(false);
    const e4 = result.entry003Package.chapterStoryMap.nodes.find((n) => n.entryId === 'entry-004');
    expect(e4?.nonCanon).toBe(true);
  });

  it('55. Entry 001 unchanged', () => {
    const lineage = buildPriorEntryLineage();
    expect(lineage.find((e) => e.entryId === 'entry-001')?.title).toContain('WHO TF IS WE');
  });

  it('56. Entry 002 unchanged', () => {
    const e2 = compileEntry002LockedEntry();
    expect(e2.title).toContain('OH, NOW IT WAS FUN');
  });

  it('57. Entry 003 remains non-canon until founder approval', async () => {
    const result = await bootstrapC14Entry003SeniorCreativeJudgment();
    expect(result.entry003Package.records.canon).toBe(false);
    expect(result.entry003Package.gateId).toBe(ENTRY_003_C14_GATE_ID);
  });

  it('58. no image/video/FAL dispatch', async () => {
    const result = await bootstrapC14Entry003SeniorCreativeJudgment();
    expect(result.imageProviderDispatchCount).toBe(0);
    expect(result.videoProviderDispatchCount).toBe(0);
    expect(result.falDispatchCount).toBe(0);
    expect(result.seniorCreativeJudgment.falDispatchCount).toBe(0);
  });

  it('59. prior C1.0–C1.3 tests remain green — gate progression', async () => {
    const c12 = await bootstrapC12Entry003AutonomousCreativeDirector();
    expect(c12.entry003Package.gateId).toBeTruthy();
    const c13 = await bootstrapC13Entry003CinematicContinuity();
    expect(c13.entry003Package.gateId).toBe(ENTRY_003_C13_GATE_ID);
    const c14 = await bootstrapC14Entry003SeniorCreativeJudgment();
    expect(c14.architectureLayer).toBe('SENIOR_CREATIVE_JUDGMENT_ENGINE');
    expect(c14.entry003Package.evolvedReview.winningConcept.conceptName).toBe('THE EMPLOYEE-ONLY DOOR');
  });

  it('Entry 003 director challenge — world structural', async () => {
    const result = await bootstrapC14Entry003SeniorCreativeJudgment();
    expect(result.seniorCreativeJudgment.worldArgument.losesMeaningWithoutWorld).toBe(true);
    expect(result.seniorCreativeJudgment.metaphorMaturity.classification).toBe('STRUCTURAL');
  });

  it('Entry 003 director challenge — final outcome deepened', async () => {
    const result = await bootstrapC14Entry003SeniorCreativeJudgment();
    expect(result.seniorCreativeJudgment.finalOutcome).toBe('WINNER_DEEPENED');
    expect(result.seniorCreativeJudgment.directorChallengeLoop.length).toBeGreaterThanOrEqual(2);
  });

  it('Entry 003 quality tier and handholding risk', async () => {
    const result = await bootstrapC14Entry003SeniorCreativeJudgment();
    expect(['STRONG', 'EXCEPTIONAL']).toContain(result.seniorCreativeJudgment.qualityTier);
    expect(['LOW', 'MODERATE']).toContain(result.seniorCreativeJudgment.founderHandholdingRisk);
  });

  it('runSeniorCreativeJudgmentFromConcept bridges directorial concept', async () => {
    const c13 = await bootstrapC13Entry003CinematicContinuity();
    const winning = c13.entry003Package.evolvedReview.winningConcept;
    const judgment = runSeniorCreativeJudgmentFromConcept(winning, {
      contentUnitId: 'entry-003',
      interjection: c13.entry003Package.evolvedReview.interjection,
      deeperContradiction: c13.entry003Package.evolvedReview.deeperContradiction,
      culturalRead: c13.entry003Package.evolvedReview.culturalRead,
      entry004Tease: c13.entry003Package.evolvedReview.entry004Tease.seedLine,
    });
    expect(judgment.seniorDirectorReview.initialWinner).toBe('THE EMPLOYEE-ONLY DOOR');
  });
});
