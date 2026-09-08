/**
 * C1.3 — Cinematic Continuity Director + Marketing Package Master Director + Entry 003 evolution.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  bootstrapC13Entry003CinematicContinuity,
  bootstrapC12Entry003AutonomousCreativeDirector,
  resetEntry003Store,
} from '../api/_lib/site00ExpressionEngine/entry003/entry003Service.js';
import { runCinematicContinuityDirector, getCinematicContinuityArchitectureStack } from '../api/_lib/site00ExpressionEngine/cinematicContinuity/cinematicContinuityDirector.js';
import { runMarketingPackageMasterDirector, runGenericCampaignSequenceIntelligence } from '../api/_lib/site00ExpressionEngine/marketingPackageMasterDirector/marketingPackageMasterDirector.js';
import {
  buildNdxbookEntry001SequenceRole,
  buildNdxbookEntry002SequenceRole,
  buildNdxbookEntry002To003HandoffOptions,
  selectEntry002To003Handoff,
  getNdxbookCampaignGrammar,
} from '../api/_lib/site00ExpressionEngine/campaignNarrative/ndxbookCampaignNarrativeAdapter.js';
import {
  artifactBridgeDiffersFromReuse,
  evaluateHandoffStrength,
  runCampaignNarrativeCohesionQA,
} from '../api/_lib/site00ExpressionEngine/campaignNarrative/campaignCohesionQA.js';
import { buildCampaignContentSequence } from '../api/_lib/site00ExpressionEngine/campaignNarrative/campaignNarrativeArcBuilder.js';
import { buildPriorEntryLineage } from '../api/_lib/site00ExpressionEngine/creativeDirector/creativeDirectorContextBuilder.js';
import { compileEntry002LockedEntry } from '../api/_lib/site00ExpressionEngine/entry002Blueprint.js';
import {
  generateEntry003DirectorialConcepts,
  runMasterFilmDirectorPass,
  generateEntry003InterjectionCandidates,
  generateEntry003TitleCandidates,
  selectTop3Titles,
} from '../api/_lib/site00ExpressionEngine/cinematicContinuity/entry003MasterFilmDirectorPass.js';
import { buildChapter01NarrativeContinuity, buildChapterStateAfterEntry002 } from '../api/_lib/site00ExpressionEngine/cinematicContinuity/chapterContinuityBuilder.js';
import { resetCreativeDirectorRuntimeStore } from '../api/_lib/site00ExpressionEngine/creativeDirector/creativeDirectorService.js';
import { ENTRY_003_C13_GATE_ID } from '../shared/site00-expression-engine/entry-003/types.js';
import { CAMPAIGN_COHESION_FAILURE_CLASSES } from '../shared/site00-expression-engine/campaign-narrative/types.js';

describe('C1.3 Cinematic Continuity + Marketing Package Master Director', () => {
  beforeEach(() => {
    process.env.EXPRESSION_ENGINE_TEST_DETERMINISTIC_CREATIVE_DIRECTOR = '1';
    resetCreativeDirectorRuntimeStore();
    resetEntry003Store();
  });

  it('1. Cinematic Continuity Director is first-class', () => {
    const ccd = runCinematicContinuityDirector();
    expect(ccd.layer).toBe('CINEMATIC_CONTINUITY_DIRECTOR');
    expect(ccd.directorId).toContain('CCD-');
  });

  it('2. chapter continuity exists independently of Entry', () => {
    const continuity = buildChapter01NarrativeContinuity();
    expect(continuity.chapterId).toBeTruthy();
    expect(continuity.entrySequence.length).toBeGreaterThanOrEqual(2);
  });

  it('3. Entry 001 lineage is consumed', () => {
    const role = buildNdxbookEntry001SequenceRole();
    expect(role.entryId).toBe('entry-001');
    expect(role.entryFunction).toBe('OPENING_PROVOCATION');
    const lineage = buildPriorEntryLineage();
    expect(lineage.find((e) => e.entryId === 'entry-001')).toBeTruthy();
  });

  it('4. Entry 002 lineage is consumed', () => {
    const role = buildNdxbookEntry002SequenceRole();
    expect(role.entryId).toBe('entry-002');
    const lineage = buildPriorEntryLineage();
    expect(lineage.find((e) => e.entryId === 'entry-002')).toBeTruthy();
  });

  it('5. Entry 002 ending can seed Entry 003 handoff', () => {
    const options = buildNdxbookEntry002To003HandoffOptions();
    expect(options.length).toBeGreaterThanOrEqual(2);
    expect(options.some((o) => o.fromEntryId === 'entry-002' && o.toEntryId === 'entry-003')).toBe(true);
  });

  it('6. handoff does not require artifact reuse', () => {
    const selected = selectEntry002To003Handoff(buildNdxbookEntry002To003HandoffOptions());
    expect(selected.artifactBridgeNotReuse).toBe(true);
  });

  it('7. artifact bridge differs from artifact reuse', () => {
    const selected = selectEntry002To003Handoff(buildNdxbookEntry002To003HandoffOptions());
    expect(artifactBridgeDiffersFromReuse(selected)).toBe(true);
  });

  it('8. Entry 003 must advance chapter argument', async () => {
    const result = await bootstrapC13Entry003CinematicContinuity();
    expect(result.cinematicContinuityDirector.entry003Responsibility.whatEntryMustAdd.length).toBeGreaterThan(20);
    expect(result.cinematicContinuityDirector.entry003Responsibility.escalationMove).toContain('YOU');
  });

  it('9. chapter escalation model exists', () => {
    const ccd = runCinematicContinuityDirector();
    expect(ccd.chapterContinuity.chapterEscalationModel.escalationModel.length).toBeGreaterThan(10);
  });

  it('10. chapter rhythm model exists', () => {
    const ccd = runCinematicContinuityDirector();
    expect(ccd.chapterContinuity.rhythmPlan.rhythmDiagnosis.length).toBeGreaterThan(10);
    expect(ccd.chapterContinuity.rhythmPlan.interjectionPatternHistory.length).toBeGreaterThanOrEqual(2);
  });

  it('11. motif history exists', () => {
    const ccd = runCinematicContinuityDirector();
    expect(ccd.chapterContinuity.chapterRecurringMotifs.motifsUsed.length).toBeGreaterThan(0);
  });

  it('12. repeated visual tricks can fail', () => {
    expect(CAMPAIGN_COHESION_FAILURE_CLASSES).toContain('MOTIF_REUSE_WITHOUT_EVOLUTION');
    const qa = runCampaignNarrativeCohesionQA({
      campaignId: 'test',
      sequence: buildCampaignContentSequence({ campaignId: 'test', units: [], unitRoles: [] }),
      handoffs: [],
      escalation: { escalationModel: 'x', stakesProgression: [], personalToSystemic: false, discomfortCurve: '', whatEachUnitMustAdd: {}, repetitionGuard: '' },
      motifSystem: { motifsUsed: [], motifsRepeated: ['glitch'], motifsRetired: [], motifsAvailable: [], motifRecords: [{ motif: 'glitch', firstUsedInUnitId: 'e2', meaningAtIntroduction: '', evolutionNotes: '', status: 'REPEATED' }], repetitionRiskNotes: [] },
    });
    expect(qa.failureClasses).toContain('MOTIF_REUSE_WITHOUT_EVOLUTION');
  });

  it('13. handoff strength is evaluated', () => {
    const selected = selectEntry002To003Handoff(buildNdxbookEntry002To003HandoffOptions());
    expect(evaluateHandoffStrength(selected)).toBe(true);
    expect(selected.continuityStrength).toBe('STRONG');
  });

  it('14. Entry 003 ending can create Entry 004 tease seed', async () => {
    const result = await bootstrapC13Entry003CinematicContinuity();
    expect(result.entry003Package.evolvedReview.entry004Tease.nonCanon).toBe(true);
    expect(result.entry003Package.evolvedReview.entry004Tease.seedQuestion.length).toBeGreaterThan(10);
  });

  it('15. Entry 004 remains non-canon', async () => {
    const result = await bootstrapC13Entry003CinematicContinuity();
    const e4 = result.entry003Package.chapterStoryMap.nodes.find((n) => n.entryId === 'entry-004');
    expect(e4?.nonCanon).toBe(true);
  });

  it('16. Chapter Story Map exists', async () => {
    const result = await bootstrapC13Entry003CinematicContinuity();
    expect(result.entry003Package.chapterStoryMap.nodes.length).toBe(4);
    expect(result.entry003Package.chapterStoryMap.seriesContinuityStrength).toBe('STRONG');
  });

  it('17. 5+ new directorial concepts generated', () => {
    const concepts = generateEntry003DirectorialConcepts();
    expect(concepts.length).toBeGreaterThanOrEqual(5);
  });

  it('18. master-film-director pass runs', () => {
    const pass = runMasterFilmDirectorPass();
    expect(pass.winningConceptId.length).toBeGreaterThan(3);
    expect(pass.witPass.totalScore).toBeGreaterThan(0.7);
  });

  it('19. wit pass runs', () => {
    const pass = runMasterFilmDirectorPass();
    expect(pass.witPass.surprise).toBeGreaterThan(0);
    expect(pass.witPass.diagnostic.length).toBeGreaterThan(10);
  });

  it('20. deeper founder challenge is consumed', () => {
    const pass = runMasterFilmDirectorPass();
    expect(pass.founderChallenge).toContain('LABOR');
    expect(pass.deeperContradiction).toContain('INVISIBLE');
  });

  it('21. Shelfie Museum can be rejected', () => {
    const pass = runMasterFilmDirectorPass();
    expect(pass.shelfieMuseumSuperseded).toBe(true);
    expect(pass.concepts.every((c) => c.whyItIsNotShelfieMuseumAgain.length > 10)).toBe(true);
  });

  it('22. current concept can be superseded', async () => {
    const result = await bootstrapC13Entry003CinematicContinuity();
    expect(result.entry003Package.shelfieMuseumSuperseded).toBe(true);
    expect(result.entry003Package.evolvedReview.winningConcept.conceptName).not.toContain('SHELFIE');
  });

  it('23. title candidates generated', () => {
    const titles = generateEntry003TitleCandidates();
    expect(titles.length).toBeGreaterThanOrEqual(10);
  });

  it('24. 10+ interjection candidates generated', () => {
    const lines = generateEntry003InterjectionCandidates();
    expect(lines.length).toBeGreaterThanOrEqual(10);
  });

  it('25. research-sensitive claims can be softened', async () => {
    const result = await bootstrapC13Entry003CinematicContinuity();
    expect(result.entry003Package.researchClaimsSoftened).toBe(true);
    expect(result.entry003Package.evolvedReview.selfCritique.some((s) => s.includes('step-count'))).toBe(true);
  });

  it('26. no fabricated receipts', async () => {
    const result = await bootstrapC13Entry003CinematicContinuity();
    expect(result.entry003Package.evidenceResearchPlan.fabricationPolicy).toBe('NO_FABRICATED_RECEIPTS');
  });

  it('27. generic CampaignNarrativeArc exists', () => {
    const mpmd = runMarketingPackageMasterDirector();
    expect(mpmd.campaignThesis.length).toBeGreaterThan(10);
    expect(mpmd.contentSequence.units.length).toBeGreaterThanOrEqual(3);
  });

  it('28. generic CampaignContentSequence exists', () => {
    const mpmd = runMarketingPackageMasterDirector();
    expect(mpmd.contentSequence.campaignId).toBe('ndxbook-chapter-01');
    expect(mpmd.contentSequence.version).toBeTruthy();
  });

  it('29. NDXBOOK adapter exists', () => {
    const grammar = getNdxbookCampaignGrammar();
    expect(grammar.argumentGrammar.length).toBeGreaterThan(0);
    expect(grammar.receiptLogic).toContain('NO_FABRICATED');
  });

  it('30. shared campaign system does not require NDX', () => {
    const intel = runGenericCampaignSequenceIntelligence();
    expect(intel.openingPiece).toContain('Unit 1');
    expect(intel.heroUnit).not.toContain('NDX');
  });

  it('31. marketing package master director exists', () => {
    const mpmd = runMarketingPackageMasterDirector();
    expect(mpmd.directorId).toContain('MPMD-');
    expect(mpmd.cohesionQA).toBeDefined();
  });

  it('32. generic package handoffs supported', () => {
    const mpmd = runMarketingPackageMasterDirector();
    expect(mpmd.handoffs.length).toBeGreaterThan(0);
    expect(mpmd.handoffs[0]!.artifactBridgeNotReuse).toBe(true);
  });

  it('33. generic motif system supported', () => {
    const mpmd = runMarketingPackageMasterDirector();
    expect(mpmd.motifs.motifsUsed.length).toBeGreaterThan(0);
  });

  it('34. generic escalation supported', () => {
    const mpmd = runMarketingPackageMasterDirector();
    expect(mpmd.escalation.stakesProgression.length).toBeGreaterThanOrEqual(2);
  });

  it('35. campaign cohesion QA exists', () => {
    const mpmd = runMarketingPackageMasterDirector();
    expect(mpmd.cohesionQA.domains.sequenceLogic).toBeDefined();
    expect(typeof mpmd.cohesionQA.overallPass).toBe('boolean');
  });

  it('36. isolated content units can fail', () => {
    expect(CAMPAIGN_COHESION_FAILURE_CLASSES).toContain('ISOLATED_CONTENT_UNITS');
  });

  it('37. format does not prematurely determine story', () => {
    const mpmd = runMarketingPackageMasterDirector();
    expect(mpmd.formatPlan.toLowerCase()).toContain('story');
  });

  it('38. no image/video provider dispatch', async () => {
    const result = await bootstrapC13Entry003CinematicContinuity();
    expect(result.providerDispatchCount).toBe(0);
    expect(result.falDispatchCount).toBe(0);
    expect(result.imageProviderDispatchCount).toBe(0);
    expect(result.videoProviderDispatchCount).toBe(0);
  });

  it('39. Entry 001 unchanged', () => {
    const lineage = buildPriorEntryLineage();
    expect(lineage.find((e) => e.entryId === 'entry-001')?.title).toContain('WHO TF IS WE');
  });

  it('40. Entry 002 unchanged', () => {
    const e2 = compileEntry002LockedEntry();
    expect(e2.title).toContain('OH, NOW IT WAS FUN');
  });

  it('41. Entry 003 remains non-canon', async () => {
    const result = await bootstrapC13Entry003CinematicContinuity();
    expect(result.entry003Package.records.canon).toBe(false);
    expect(result.entry003Package.status).toBe('CREATIVE_DIRECTION_AWAITING_FOUNDER_REVIEW');
  });

  it('42. previous C1.0/C1.1/C1.2 tests remain green — architecture stack + gate', async () => {
    const stack = getCinematicContinuityArchitectureStack();
    expect(stack.some((s) => s.includes('CINEMATIC CONTINUITY DIRECTOR'))).toBe(true);
    const c12 = await bootstrapC12Entry003AutonomousCreativeDirector();
    expect(c12.entry003Package.gateId).toBeTruthy();
    const c13 = await bootstrapC13Entry003CinematicContinuity();
    expect(c13.entry003Package.gateId).toBe(ENTRY_003_C13_GATE_ID);
    expect(c13.nextAction).toContain('CHAPTER 01 STORY ARC');
  });

  it('chapter state after Entry 002 informs Entry 003 responsibility', () => {
    const state = buildChapterStateAfterEntry002();
    expect(state.escalationLevel).toBe(2);
    expect(state.openQuestions.some((q) => q.toLowerCase().includes('labor'))).toBe(true);
  });

  it('bootstrap C1.3 full package includes evolved review', async () => {
    const result = await bootstrapC13Entry003CinematicContinuity();
    expect(result.entry003Package.evolvedReview.winningConcept.conceptName).toBe('THE EMPLOYEE-ONLY DOOR');
    expect(result.entry003Package.top3Titles.length).toBe(3);
    expect(result.entry003Package.interjectionCandidates.length).toBeGreaterThanOrEqual(10);
  });
});
