/**
 * P0.5E.7 — Character-first content operations tests.
 */

import { beforeEach, describe, expect, it } from 'vitest';
import {
  NDX_CONTENT_SEED_SOURCE_TYPES,
  NDX_THOUGHT_ARC_BEATS,
  BELIEF_REVISION_STATES,
  NDX_KNOWLEDGE_STATES,
  CHARACTER_BEAT_CONTRACTS,
  FOUNDER_PREMISE_JUDGMENTS,
  PAGE_NARRATIVE_ROLES,
  CHARACTER_FIRST_CONTENT_VERSION,
  CREDIT_UTILIZATION_GOLDEN_PILOT_ID,
  buildNDXContentSeed,
  seedCharacterFirstContentSeeds,
  getGoldenPilotSeed,
  CREDIT_UTILIZATION_PAGE_ROLES,
  formulateOpportunityFromContentSeed,
  buildCharacterFirstOpportunities,
  compileNDXFirstPersonCopy,
  evaluateHumorOpportunity,
  ndxAuthoredDisplayCopyUppercase,
  checkBookMemoryForSeed,
  buildContentOpsWorkspaceZones,
  buildBookNativeVisualHandoff,
  buildContentSeedFilmHandoff,
  buildTopicPipelineMigrationRecords,
  historicalTopicResearchPreserved,
  reformulateLiveSignalToNotice,
  SUBSCRIPTION_NORMALIZATION_NOTICE,
  seedCharacterFirstOpportunities,
  buildWeeklyEditorialSlate,
  buildCarouselSequencePlan,
  formulateCharacterEventFromOpportunity,
  seedPilotOpportunities,
  createEmptyContentMemoryIndex,
  autonomousPublishingEnabled,
  experimentFImmutable,
} from './contentOperations/index.js';
import {
  prepareContentOperations,
  compileContentOperations,
  discoverContentOpportunities,
  proposeWeeklySlate,
  noAutomaticPublishing,
} from '../../api/_lib/site00Evolve/contentOperationsExperiment/contentOperationsService.js';
import {
  resetContentOperationsMemory,
  resetContentOperationsStoreModeCache,
} from '../../api/_lib/site00Evolve/contentOperationsExperiment/contentOperationsStoreAdapter.js';
import { seedVitestContentOperationsPrerequisites } from '../../api/_lib/site00Evolve/contentOperationsExperiment/contentOperationsService.js';
import { getOpportunitySpokenPremise, getOpportunityTopicMetadata } from './founderWorkspace/contentOperationsDeskAdapter.js';

const PROJECT = 'ndxbook';

describe('P0.5E.7 — Character-first content operations', () => {
  beforeEach(async () => {
    resetContentOperationsStoreModeCache();
    resetContentOperationsMemory();
    await seedVitestContentOperationsPrerequisites();
  });

  it('implements NDXContentSeed with primary creative fields', () => {
    const seed = buildNDXContentSeed(PROJECT, {
      sourceType: 'PERSONAL_EXPERIENCE',
      legacyTopicSubject: 'test topic',
      spokenPremise: 'I NOTICED SOMETHING WEIRD.',
      topicMetadata: ['MONEY'],
      categoryMetadata: ['TEST'],
      notice: 'Something happened',
      firstReaction: 'WAIT.',
      initialBelief: 'I THOUGHT X',
      question: 'WHY?',
      whySheCares: 'Contradiction',
      investigationTrigger: 'Look at data',
      currentView: 'BALANCE + TIMING',
      characterBeat: 'WAIT',
      bookTrace: 'BOOKMARK',
      candidateSurface: 'PAGE',
    });
    expect(seed.seedId).toBeTruthy();
    expect(seed.notice).toBe('Something happened');
    expect(seed.firstReaction).toBe('WAIT.');
    expect(seed.premise.spokenPremise).toBe('I NOTICED SOMETHING WEIRD.');
    expect(seed.topicMetadata).toContain('MONEY');
  });

  it('keeps topic as metadata not primary premise', () => {
    const seeds = seedCharacterFirstContentSeeds(PROJECT);
    for (const seed of seeds) {
      expect(seed.premise.spokenPremise).not.toBe(seed.premise.internalTopic);
      expect(seed.premise.internalTopic).toBe(seed.legacyTopicSubject);
    }
    const opps = buildCharacterFirstOpportunities({ projectId: PROJECT, seeds });
    for (const opp of opps) {
      expect(opp.characterFirst?.topicIsPrimaryPremise).toBe(false);
      expect(opp.characterFirst?.spokenPremise).toBeTruthy();
      expect(opp.subject).toBe(opp.characterFirst?.firstPersonPremise.internalTopic);
    }
  });

  it('implements full NDXThoughtArc beats', () => {
    for (const beat of NDX_THOUGHT_ARC_BEATS) {
      expect(['NOTICE', 'REACT', 'ASSUME', 'QUESTION', 'INVESTIGATE', 'CONNECT', 'TEST', 'REVISE_OR_CONFIRM', 'DOCUMENT']).toContain(beat);
    }
    const seed = seedCharacterFirstContentSeeds(PROJECT)[0];
    expect(seed.thoughtArc.beatsPresent).toContain('NOTICE');
    expect(seed.thoughtArc.beatsPresent).toContain('REACT');
    expect(seed.thoughtArc.beatsPresent).toContain('ASSUME');
    expect(seed.thoughtArc.beatsPresent).toContain('QUESTION');
    expect(seed.thoughtArc.beatsPresent).toContain('INVESTIGATE');
    expect(seed.thoughtArc.beatsPresent).toContain('REVISE_OR_CONFIRM');
    expect(seed.thoughtArc.beatsPresent).toContain('DOCUMENT');
  });

  it('implements BeliefRevisionState and NDXKnowledgeState', () => {
    expect(BELIEF_REVISION_STATES).toContain('PARTIALLY_REVISED');
    expect(NDX_KNOWLEDGE_STATES).toContain('CHANGED_MIND');
    expect(NDX_KNOWLEDGE_STATES).toContain('DOES_NOT_KNOW_YET');
    const golden = getGoldenPilotSeed(seedCharacterFirstContentSeeds(PROJECT));
    expect(golden?.thoughtArc.beliefRevision).toBe('PARTIALLY_REVISED');
    expect(golden?.thoughtArc.knowledgeState).toBe('LEARNS');
  });

  it('implements CharacterBeatContract and founder judgments', () => {
    expect(CHARACTER_BEAT_CONTRACTS).toContain('THAT_CANNOT_BE_RIGHT');
    expect(FOUNDER_PREMISE_JUDGMENTS).toContain('YES_THAT_SOUNDS_LIKE_HER');
    expect(FOUNDER_PREMISE_JUDGMENTS).toContain('BUILD_THE_PAGE');
  });

  it('formulates opportunities with premise-first UI helpers', () => {
    const { opportunities } = seedCharacterFirstOpportunities(PROJECT);
    const opp = opportunities[0];
    expect(getOpportunitySpokenPremise(opp)).toBe(opp.characterFirst!.spokenPremise);
    expect(getOpportunityTopicMetadata(opp)).toContain('MONEY');
    expect(getOpportunitySpokenPremise(opp)).not.toBe(opp.subject.toUpperCase());
  });

  it('supports all content seed source types', () => {
    expect(NDX_CONTENT_SEED_SOURCE_TYPES).toContain('LIVE_WORLD_SIGNAL');
    expect(NDX_CONTENT_SEED_SOURCE_TYPES).toContain('AUDIENCE_QUESTION');
    expect(NDX_CONTENT_SEED_SOURCE_TYPES).toContain('DOG_EAR_FOLLOWUP');
    expect(NDX_CONTENT_SEED_SOURCE_TYPES.length).toBeGreaterThanOrEqual(15);
  });

  it('implements first-person copy compiler with uppercase authored display', () => {
    const golden = getGoldenPilotSeed(seedCharacterFirstContentSeeds(PROJECT))!;
    const pageCopy = compileNDXFirstPersonCopy({ seed: golden, platform: 'PAGE' });
    expect(pageCopy.uppercaseAuthored).toBe(true);
    expect(pageCopy.hooks[0]).toBe('I PAID IT DOWN. WHY DID MY SCORE DROP?');
    expect(ndxAuthoredDisplayCopyUppercase(pageCopy.captionDraft)).toBe(true);

    const margin = compileNDXFirstPersonCopy({ seed: golden, platform: 'MARGIN' });
    expect(margin.captionDraft).toBe('THAT CANNOT BE RIGHT.');

    const tiktok = compileNDXFirstPersonCopy({ seed: golden, platform: 'TIKTOK' });
    expect(tiktok.spokenLines[0]).toContain('APPARENTLY');

    const reel = compileNDXFirstPersonCopy({ seed: golden, platform: 'REEL' });
    expect(reel.spokenLines).toContain('THAT CANNOT BE RIGHT.');

    const thread = compileNDXFirstPersonCopy({ seed: golden, platform: 'THREAD' });
    expect(thread.captionDraft).toContain('RESPONSIBLE');
  });

  it('evaluates humor without mechanical joke append', () => {
    const seed = seedCharacterFirstContentSeeds(PROJECT).find((s) => s.characterBeat === 'WE_OWE_HER_AN_APOLOGY')!;
    const humor = evaluateHumorOpportunity(seed);
    expect(humor.mechanicalJokeAppended).toBe(false);
    expect(['NONE', 'SUBTLE', 'MODERATE', 'STRONG']).toContain(humor.level);
  });

  it('integrates book memory and workspace zones', () => {
    const seeds = seedCharacterFirstContentSeeds(PROJECT);
    const memory = createEmptyContentMemoryIndex(PROJECT);
    memory.coveredTopics.push('credit utilization');
    const hit = checkBookMemoryForSeed(seeds[0], memory);
    expect(hit.hasPriorCoverage).toBe(true);

    const zones = buildContentOpsWorkspaceZones(seeds);
    expect(zones.find((z) => z.zoneId === 'today-at-ndx')).toBeTruthy();
    expect(zones.find((z) => z.zoneId === 'rabbit-holes')).toBeTruthy();
    expect(zones.find((z) => z.zoneId === 'dog-eared')).toBeTruthy();
    expect(zones.find((z) => z.zoneId === 'audience-left')?.seedIds.length).toBeGreaterThan(0);
  });

  it('models credit utilization golden pilot with narrative page roles', () => {
    const golden = getGoldenPilotSeed(seedCharacterFirstContentSeeds(PROJECT));
    expect(golden?.seedId).toBe(CREDIT_UTILIZATION_GOLDEN_PILOT_ID);
    expect(golden?.isGoldenPilot).toBe(true);
    expect(golden?.premise.spokenPremise).toBe('I PAID IT DOWN. WHY DID MY SCORE DROP?');
    expect(CREDIT_UTILIZATION_PAGE_ROLES).toHaveLength(8);
    expect(CREDIT_UTILIZATION_PAGE_ROLES[0].role).toBe('HOOK');
    expect(CREDIT_UTILIZATION_PAGE_ROLES[7].role).toBe('BOOKMARK_CLOSING_TRACE');
    for (const role of PAGE_NARRATIVE_ROLES) {
      expect(CREDIT_UTILIZATION_PAGE_ROLES.some((s) => s.role === role) || role === 'CONTRADICTION' || role === 'WHY_IT_MATTERS').toBeTruthy();
    }
  });

  it('implements P0.5C.7 visual handoff and P0.FILM.1 film handoff', () => {
    const golden = getGoldenPilotSeed(seedCharacterFirstContentSeeds(PROJECT))!;
    const { opportunity, formulation } = formulateOpportunityFromContentSeed({ seed: golden });
    expect(formulation.visualHandoff.grammarAuthority).toBe('V2.3+P0.5C.7');
    expect(formulation.visualHandoff.pageRoles).toHaveLength(8);
    expect(formulation.filmHandoff.reelArc).toContain('RABBIT_HOLE');
    expect(formulation.filmHandoff.openingBeat).toBe('THAT_CANNOT_BE_RIGHT');

    const visual = buildBookNativeVisualHandoff(golden);
    expect(visual.constructionIntent).toBe('BOOK_NATIVE_PAGE_NOT_GENERIC_EDUCATION');
    const film = buildContentSeedFilmHandoff(golden);
    expect(film.contentSeedId).toBe(golden.seedId);
  });

  it('builds premise-first weekly slate', async () => {
    await prepareContentOperations({ projectId: PROJECT });
    await compileContentOperations({ projectId: PROJECT });
    const run = await discoverContentOpportunities({ projectId: PROJECT });
    const slateRun = await proposeWeeklySlate({ projectId: PROJECT });
    const slate = slateRun.activeSlate!;
    expect(slate.premiseFirstEntries?.length).toBeGreaterThan(0);
    expect(slate.premiseFirstEntries![0].spokenPremise).toContain('I PAID');
    expect(slate.premiseFirstEntries![0].topicMetadata).toContain('MONEY');
    expect(run.contentSeeds?.length).toBeGreaterThanOrEqual(8);
    expect(run.workspaceZones?.length).toBeGreaterThan(0);
    expect(run.characterFirstVersion).toBe(CHARACTER_FIRST_CONTENT_VERSION);
  });

  it('migrates existing topic pipeline preserving historical evidence', () => {
    const seeds = seedCharacterFirstContentSeeds(PROJECT);
    const migration = buildTopicPipelineMigrationRecords(seeds);
    expect(migration.length).toBe(seedPilotOpportunities(PROJECT).length);
    expect(historicalTopicResearchPreserved(migration)).toBe(true);
    const subscription = migration.find((m) => m.legacySubject.includes('subscription'));
    expect(subscription?.reformulatedPremise).toContain('SUBSCRIPTION');
    const layoffs = migration.find((m) => m.legacySubject.includes('layoff'));
    expect(layoffs?.reformulatedPremise).toContain('LAYOFF');
  });

  it('reformulates live intelligence to NDX notice not topic label', () => {
    const notice = reformulateLiveSignalToNotice(
      'Subscription prices increasing across streaming',
      'SUBSCRIPTION NORMALIZATION',
    );
    expect(notice.ndxNoticePremise).toBe('I SWEAR EVERYTHING USED TO JUST LET YOU BUY IT ONCE.');
    expect(notice.oldTopicLabel).toBe('SUBSCRIPTION NORMALIZATION');
    expect(SUBSCRIPTION_NORMALIZATION_NOTICE.ndxNoticePremise).toContain('BUY IT ONCE');
  });

  it('supports audience-triggered seeds with provenance', () => {
    const seeds = seedCharacterFirstContentSeeds(PROJECT);
    const audience = seeds.find((s) => s.sourceType === 'AUDIENCE_QUESTION');
    expect(audience?.audiencePrompt).toBeTruthy();
    expect(audience?.premise.experienceMode).toBe('AUDIENCE_TRIGGERED');
  });

  it('enforces personal != autobiographical via experience modes', () => {
    const seeds = seedCharacterFirstContentSeeds(PROJECT);
    const layoffs = seeds.find((s) => s.legacyTopicSubject.includes('layoff'));
    expect(layoffs?.premise.experienceMode).toBe('OBSERVED');
    const credit = seeds.find((s) => s.isGoldenPilot);
    expect(credit?.premise.experienceMode).toBe('PERSONALLY_EXPERIENCED');
  });

  it('uses narrative page roles in carousel when character-first present', () => {
    const { opportunities } = seedCharacterFirstOpportunities(PROJECT);
    const goldenOpp = opportunities.find((o) => o.characterFirst?.contentSeedId === CREDIT_UTILIZATION_GOLDEN_PILOT_ID)!;
    const plan = buildCarouselSequencePlan('pkg-test', goldenOpp);
    expect(plan.slideRoles).toHaveLength(8);
    expect(plan.sequenceThesis).toBe('I PAID IT DOWN. WHY DID MY SCORE DROP?');
    expect(plan.middleRoles).not.toContain('DEFINITION');
  });

  it('consumes character truth in character event formulation', () => {
    const { opportunities } = seedCharacterFirstOpportunities(PROJECT);
    const event = formulateCharacterEventFromOpportunity(opportunities[0]);
    expect(event.initialReaction).toBe(opportunities[0].characterFirst!.thoughtArc.firstReaction);
    expect(event.whatNdxSaw).toBe(opportunities[0].characterFirst!.thoughtArc.notice);
  });

  it('preserves brand character, canon, lineage, and no autonomous publishing', () => {
    expect(experimentFImmutable()).toBe(true);
    expect(autonomousPublishingEnabled()).toBe(false);
    expect(noAutomaticPublishing()).toBe(true);
    const legacy = seedPilotOpportunities(PROJECT);
    expect(legacy.length).toBeGreaterThan(0);
  });

  it('broad knowledge domains preserved across seeds', () => {
    const seeds = seedCharacterFirstContentSeeds(PROJECT);
    const domains = new Set(seeds.flatMap((s) => s.topicMetadata));
    expect(domains.size).toBeGreaterThanOrEqual(6);
    expect([...domains].some((d) => d.includes('MONEY') || d === 'MONEY')).toBe(true);
    expect([...domains].some((d) => d.includes('WORK') || d === 'WORK')).toBe(true);
    expect([...domains].some((d) => d.includes('TECHNOLOGY') || d.includes('INTERNET'))).toBe(true);
  });
});

describe('P0.5E.7 — weekly slate premise-first (unit)', () => {
  it('orders creative premise before category metadata', () => {
    const { opportunities } = seedCharacterFirstOpportunities(PROJECT);
    const slate = buildWeeklyEditorialSlate({ projectId: PROJECT, opportunities });
    expect(slate.premiseFirstEntries![0].spokenPremise.length).toBeGreaterThan(
      slate.premiseFirstEntries![0].topicMetadata.length / 2,
    );
  });
});
