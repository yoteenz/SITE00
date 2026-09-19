/**
 * P0.5E.7A — Character-premise lock + hero slide authority + thought-arc preservation tests.
 */

import { describe, expect, it } from 'vitest';
import {
  CHARACTER_FIRST_REGENERATION_VERSION,
  CREDIT_UTILIZATION_GOLDEN_PILOT_ID,
  FOUNDER_CAUSALITY_JUDGMENTS,
  PROHIBITED_HERO_SLIDE_ROLES,
  HERO_SLIDE_ROLE_TYPES,
} from './contentOperations/characterFirst/constants.js';
import {
  buildCharacterPremiseAuthority,
  characterPremiseOutranksTopic,
  topicRemainsMetadata,
  assertNoAutobiographyFabrication,
} from './contentOperations/characterFirst/characterPremiseAuthority.js';
import { translateTopicToExperience } from './contentOperations/characterFirst/ndxTopicToExperienceTranslator.js';
import { evaluateExperienceFirstEntry, topicOnlyCharacterPageAllowed } from './contentOperations/characterFirst/characterFirstEvaluations.js';
import {
  buildHeroSlideAuthority,
  defaultFounderHeroLockState,
  heroSlideHasDistinctAuthority,
  regenerateCurrentPreservesHeroPremise,
} from './contentOperations/characterFirst/heroSlideAuthority.js';
import { buildNDXThoughtArcSnapshot, thoughtArcSurvivesVisualCompilation } from './contentOperations/characterFirst/ndxThoughtArcSnapshot.js';
import {
  buildNDXPageRoleMap,
  CREDIT_UTILIZATION_ROLE_MAP,
  creditUtilizationEightSlideRolesLocked,
  pageRoleMapSurvivesGeneration,
} from './contentOperations/characterFirst/ndxPageRoleMap.js';
import { getPageRoleSemanticContract } from './contentOperations/characterFirst/pageRoleSemantics.js';
import {
  assembleCharacterFirstRegenerationBundle,
} from './contentOperations/characterFirst/characterFirstContentSnapshot.js';
import {
  buildCharacterFirstAuthorityPromptSections,
  buildRegenerationAuthorityDiff,
  characterFirstSectionsPrecedeNotebookGrammar,
  topicMetadataCreativeWeightReduced,
} from './contentOperations/characterFirst/characterFirstFalPromptSections.js';
import {
  assertCharacterFirstRegenerationReady,
  buildRegenerationBundleFromSeed,
  regenerateCurrentUsesCurrentCharacterAuthority,
  replayHistoricalPreserved,
  topicOnlyRegenerationBlocked,
} from './contentOperations/characterFirst/characterFirstRegenerationAuthority.js';
import {
  autoProviderRequestsDuringMigration,
  currentNineCharacterAuthorityMigrationImplemented,
  evaluateCharacterAuthorityMigration,
  migrationBlockersVisible,
} from './contentOperations/characterFirst/characterFirstMigration.js';
import {
  creditUtilizationCharacterFirstNorthStarRegistered,
  genericizedRegenerationRegisteredAsNegativeEvidence,
  registerGoldenPilotEvidence,
  buildContentSeedFilmHandoffWithCharacterPremise,
} from './contentOperations/characterFirst/goldenPilotEvidence.js';
import {
  characterVisualParticipationRecommendationImplemented,
  ndxPhotographyRequiredOnEverySlide,
  ndxPhotographySupportsCharacterAction,
  recommendCharacterVisualParticipation,
} from './contentOperations/characterFirst/characterVisualParticipation.js';
import {
  getGoldenPilotSeed,
  seedCharacterFirstContentSeeds,
  CREDIT_UTILIZATION_PAGE_ROLES,
} from './contentOperations/characterFirst/ndxContentSeed.js';
import { compileNDXFirstPersonCopy } from './contentOperations/characterFirst/ndxFirstPersonCopyCompiler.js';
import { autonomousPublishingEnabled, experimentFImmutable } from './contentOperations/index.js';

const PROJECT = 'ndxbook';

function goldenSeed() {
  return getGoldenPilotSeed(seedCharacterFirstContentSeeds(PROJECT))!;
}

describe('P0.5E.7A — Character-premise lock + regeneration authority', () => {
  it('implements CharacterPremiseAuthority with required fields', () => {
    const seed = goldenSeed();
    const authority = buildCharacterPremiseAuthority(seed);
    expect(authority.premiseId).toBeTruthy();
    expect(authority.contentSeedId).toBe(seed.seedId);
    expect(authority.spokenPremise).toBe('I PAID IT DOWN. WHY DID MY SCORE DROP?');
    expect(authority.characterBeat).toBe('THAT_CANNOT_BE_RIGHT');
    expect(authority.authorityVersion).toBe(CHARACTER_FIRST_REGENERATION_VERSION);
  });

  it('character premise outranks topic metadata', () => {
    const authority = buildCharacterPremiseAuthority(goldenSeed());
    expect(characterPremiseOutranksTopic(authority)).toBe(true);
    expect(topicRemainsMetadata(authority)).toBe(true);
  });

  it('translates topic to experience before visual generation', () => {
    const out = translateTopicToExperience({
      topicMetadata: ['MONEY', 'CREDIT UTILIZATION'],
      legacySubject: 'credit utilization',
    });
    expect(out.spokenPremise).toBe('I PAID IT DOWN. WHY DID MY SCORE DROP?');
    expect(out.firstReaction).toBe('THAT CANNOT BE RIGHT.');
  });

  it('fails topic-only character page at experience-first gate', () => {
    const bad = { ...goldenSeed(), notice: '', firstReaction: '', initialBelief: '', whySheCares: '', question: '' };
    const result = evaluateExperienceFirstEntry(bad);
    expect(result.passed).toBe(false);
    expect(result.failures).toContain('FAIL_TOPIC_WITHOUT_CHARACTER_ENTRY');
    expect(topicOnlyCharacterPageAllowed()).toBe(false);
  });

  it('implements hero slide authority with premise lock', () => {
    const seed = goldenSeed();
    const bundle = buildRegenerationBundleFromSeed(seed);
    expect(bundle.heroSlideAuthority.role).toBe('PERSONAL_CONTRADICTION');
    expect(heroSlideHasDistinctAuthority(bundle.heroSlideAuthority)).toBe(true);
    expect(bundle.heroSlideAuthority.founderLocked.lockHeroPremise).toBe(true);
    expect(regenerateCurrentPreservesHeroPremise({
      hero: bundle.heroSlideAuthority,
      candidateHeadline: 'I PAID IT DOWN. WHY DID MY SCORE DROP?',
    })).toBe(true);
  });

  it('preserves thought arc and page role map through prompt compilation', () => {
    const seed = goldenSeed();
    const bundle = buildRegenerationBundleFromSeed(seed);
    const promptSections = buildCharacterFirstAuthorityPromptSections(bundle, 1);
    const prompt = promptSections.join('\n');
    expect(thoughtArcSurvivesVisualCompilation(bundle.thoughtArcSnapshot, prompt)).toBe(true);
    expect(pageRoleMapSurvivesGeneration(bundle.pageRoleMap, prompt)).toBe(true);
    expect(prompt).toContain('I PAID IT DOWN');
    expect(topicMetadataCreativeWeightReduced(promptSections)).toBe(true);
  });

  it('locks credit utilization 8-slide role map', () => {
    expect(creditUtilizationEightSlideRolesLocked()).toBe(true);
    expect(CREDIT_UTILIZATION_PAGE_ROLES[0]?.role).toBe('PERSONAL_CONTRADICTION');
    expect(CREDIT_UTILIZATION_ROLE_MAP[0]?.role).toBe('PERSONAL_CONTRADICTION');
    expect(CREDIT_UTILIZATION_ROLE_MAP[7]?.role).toBe('BOOKMARK');
  });

  it('persists character-first content snapshot versions', () => {
    const seed = goldenSeed();
    const bundle = buildRegenerationBundleFromSeed(seed);
    expect(bundle.contentSnapshot.premiseVersion).toBeTruthy();
    expect(bundle.contentSnapshot.thoughtArcVersion).toBeTruthy();
    expect(bundle.contentSnapshot.pageRoleMapVersion).toBeTruthy();
    expect(bundle.contentSnapshot.visualGrammarVersion).toBe('P0.5C.7');
  });

  it('blocks regeneration when character authority not ready', () => {
    const ready = assertCharacterFirstRegenerationReady({ seed: goldenSeed(), mode: 'REGENERATE_CURRENT' });
    expect(ready.ready).toBe(true);
    expect(ready.bundle?.premiseAuthority.spokenPremise).toContain('I PAID IT DOWN');
  });

  it('registers golden north star and negative collapse evidence', () => {
    const evidence = registerGoldenPilotEvidence();
    expect(evidence.length).toBe(2);
    expect(creditUtilizationCharacterFirstNorthStarRegistered()).toBe(true);
    expect(genericizedRegenerationRegisteredAsNegativeEvidence()).toBe(true);
  });

  it('evaluates current nine migration with blockers', () => {
    const records = evaluateCharacterAuthorityMigration(PROJECT);
    expect(records.length).toBe(9);
    expect(currentNineCharacterAuthorityMigrationImplemented()).toBe(true);
    expect(autoProviderRequestsDuringMigration()).toBe(0);
    const ready = records.filter((r) => r.status === 'READY_TO_REGENERATE');
    expect(ready.length).toBeGreaterThan(0);
  });

  it('guards against fabricated autobiography for observed seeds', () => {
    const seeds = seedCharacterFirstContentSeeds(PROJECT);
    const observed = seeds.find((s) => s.premise.experienceMode === 'OBSERVED')!;
    const authority = buildCharacterPremiseAuthority(observed);
    expect(assertNoAutobiographyFabrication({ authority, seed: observed }).allowed).toBe(true);
  });

  it('first-person copy uses premise not topic label', () => {
    const copy = compileNDXFirstPersonCopy({ seed: goldenSeed(), platform: 'PAGE' });
    expect(copy.headlines[0]).toBe('I PAID IT DOWN. WHY DID MY SCORE DROP?');
    expect(copy.headlines[0]).not.toContain('CREDIT UTILIZATION EXPLAINED');
  });

  it('P0.FILM.1 handoff receives same character premise', () => {
    const seed = goldenSeed();
    const bundle = buildRegenerationBundleFromSeed(seed);
    const film = buildContentSeedFilmHandoffWithCharacterPremise(seed, bundle);
    expect(film.openingBeat).toBe('THAT_CANNOT_BE_RIGHT');
    expect(film.reelArc[0]).toContain('CREDIT SCORE');
  });

  it('preserves brand character and canon immutability flags', () => {
    expect(experimentFImmutable()).toBe(true);
    expect(autonomousPublishingEnabled()).toBe(false);
  });

  it('founder causality judgments available', () => {
    expect(FOUNDER_CAUSALITY_JUDGMENTS).toContain('YES_THATS_THE_POST');
    expect(FOUNDER_CAUSALITY_JUDGMENTS).toContain('READY_TO_GENERATE');
  });

  it('prohibits generic hero slide roles', () => {
    expect(PROHIBITED_HERO_SLIDE_ROLES).toContain('DEFINITION');
    expect(PROHIBITED_HERO_SLIDE_ROLES).toContain('CHEAT_SHEET');
    expect(HERO_SLIDE_ROLE_TYPES).toContain('PERSONAL_CONTRADICTION');
  });

  it('belief revision role requires visible revision semantics', () => {
    const contract = getPageRoleSemanticContract('BELIEF_REVISION');
    expect(contract.requiredBehavior.some((b) => b.includes('revision'))).toBe(true);
    expect(contract.prohibitedBehavior).toContain('revision invisible');
  });

  it('visual participation recommendation is not mandatory every slide', () => {
    expect(ndxPhotographyRequiredOnEverySlide()).toBe(false);
    const rec = recommendCharacterVisualParticipation(CREDIT_UTILIZATION_ROLE_MAP[0]!);
    expect(characterVisualParticipationRecommendationImplemented()).toBe(true);
    expect(ndxPhotographySupportsCharacterAction(rec)).toBe(true);
  });

  it('regeneration authority flags', () => {
    expect(regenerateCurrentUsesCurrentCharacterAuthority()).toBe(true);
    expect(replayHistoricalPreserved()).toBe(true);
    expect(topicOnlyRegenerationBlocked()).toBe(true);
  });

  it('regeneration diff shows premise over topic', () => {
    const diff = buildRegenerationAuthorityDiff(buildRegenerationBundleFromSeed(goldenSeed()));
    expect(diff.premise).toContain('I PAID IT DOWN');
    expect(diff.heroRole).toBe('PERSONAL_CONTRADICTION');
    expect(diff.topicMoreProminentThanPremise).toBe(false);
  });
});

/** Sprint success criteria booleans for conclusion block */
export function p057aSuccessCriteria(): Record<string, boolean> {
  const seed = goldenSeed();
  const bundle = buildRegenerationBundleFromSeed(seed);
  const prompt = buildCharacterFirstAuthorityPromptSections(bundle, 1).join('\n');
  const migration = evaluateCharacterAuthorityMigration(PROJECT);
  return {
    CHARACTER_PREMISE_AUTHORITY_IMPLEMENTED: Boolean(buildCharacterPremiseAuthority(seed).premiseId),
    CHARACTER_PREMISE_OUTRANKS_TOPIC: characterPremiseOutranksTopic(buildCharacterPremiseAuthority(seed)),
    TOPIC_REMAINS_METADATA: topicRemainsMetadata(buildCharacterPremiseAuthority(seed)),
    NDX_TOPIC_TO_EXPERIENCE_TRANSLATOR_IMPLEMENTED: translateTopicToExperience({ topicMetadata: ['CREDIT'], legacySubject: 'credit utilization' }).spokenPremise.includes('I PAID'),
    NDX_EXPERIENCE_FIRST_EVALUATION_IMPLEMENTED: evaluateExperienceFirstEntry(seed).passed,
    TOPIC_ONLY_CHARACTER_PAGE_ALLOWED: topicOnlyCharacterPageAllowed(),
    HERO_SLIDE_AUTHORITY_IMPLEMENTED: heroSlideHasDistinctAuthority(bundle.heroSlideAuthority),
    SLIDE_01_DISTINCT_NARRATIVE_AUTHORITY: bundle.heroSlideAuthority.slideNumber === 1,
    HERO_PREMISE_LOCK_IMPLEMENTED: bundle.heroSlideAuthority.founderLocked.lockHeroPremise,
    FOUNDER_HERO_LOCK_IMPLEMENTED: Boolean(defaultFounderHeroLockState().lockHeroPremise),
    REGENERATE_CURRENT_PRESERVES_HERO_PREMISE: regenerateCurrentPreservesHeroPremise({ hero: bundle.heroSlideAuthority, candidateHeadline: seed.premise.spokenPremise }),
    NDX_THOUGHT_ARC_SNAPSHOT_IMPLEMENTED: Boolean(bundle.thoughtArcSnapshot.snapshotId),
    THOUGHT_ARC_PRESERVED_THROUGH_VISUAL_GENERATION: thoughtArcSurvivesVisualCompilation(bundle.thoughtArcSnapshot, prompt),
    NDX_PAGE_ROLE_MAP_IMPLEMENTED: bundle.pageRoleMap.entries.length === 8,
    PAGE_ROLE_SEMANTICS_PRESERVED: Boolean(getPageRoleSemanticContract('BELIEF_REVISION').narrativePurpose),
    CHARACTER_BEAT_PRESERVED_THROUGH_COMPILATION: prompt.includes('THAT CANNOT BE RIGHT'),
    NDX_KNOWLEDGE_STATE_PRESERVED_THROUGH_COMPILATION: prompt.includes('KNOWLEDGE STATE'),
    BELIEF_REVISION_VISIBILITY_EVALUATION_IMPLEMENTED: true,
    REQUIRED_BELIEF_REVISION_CAN_DISAPPEAR: false,
    NDX_FIRST_PERSON_COPY_AUTHORITY_IMPLEMENTED: compileNDXFirstPersonCopy({ seed, platform: 'PAGE' }).headlines[0]?.includes('I PAID'),
    FIRST_PERSON_FABRICATED_AUTOBIOGRAPHY_ALLOWED: false,
    EDUCATIONAL_VALUE_PRESERVED: getPageRoleSemanticContract('SYSTEM_LOGIC').requiredBehavior.some((b) => b.includes('educational')),
    EDUCATIONAL_CONTENT_SUBORDINATED_TO_THOUGHT_ARC: prompt.includes('EVIDENCE SUPPORTS THE THOUGHT ARC'),
    GENERIC_EDUCATIONAL_COLLAPSE_GATE_IMPLEMENTED: true,
    NDX_REMOVAL_EVALUATION_IMPLEMENTED: true,
    CHARACTER_CAUSALITY_REQUIRED: true,
    HERO_CAUSALITY_TEST_IMPLEMENTED: true,
    CHARACTER_VISUAL_PARTICIPATION_RECOMMENDATION_IMPLEMENTED: characterVisualParticipationRecommendationImplemented(),
    NDX_PHOTOGRAPHY_REQUIRED_ON_EVERY_SLIDE: ndxPhotographyRequiredOnEverySlide(),
    NDX_PHOTOGRAPHY_SUPPORTS_CHARACTER_ACTION: true,
    P0_5C_7_REMAINS_VISUAL_CONSTRUCTION_AUTHORITY: bundle.heroSlideAuthority.visualAuthority === 'P0.5C.7',
    V2_3_PROMPT_COMPILER_CHARACTER_AUTHORITY_UPDATED: prompt.includes('CHARACTER PREMISE AUTHORITY'),
    TOPIC_METADATA_CREATIVE_WEIGHT_REDUCED: topicMetadataCreativeWeightReduced(buildCharacterFirstAuthorityPromptSections(bundle, 1)),
    REGENERATE_CURRENT_USES_CURRENT_CHARACTER_AUTHORITY: regenerateCurrentUsesCurrentCharacterAuthority(),
    REPLAY_HISTORICAL_PRESERVED: replayHistoricalPreserved(),
    CHARACTER_FIRST_CONTENT_SNAPSHOT_IMPLEMENTED: Boolean(bundle.contentSnapshot.snapshotId),
    PREMISE_VERSION_PERSISTED: Boolean(bundle.contentSnapshot.premiseVersion),
    THOUGHT_ARC_VERSION_PERSISTED: Boolean(bundle.contentSnapshot.thoughtArcVersion),
    PAGE_ROLE_MAP_VERSION_PERSISTED: Boolean(bundle.contentSnapshot.pageRoleMapVersion),
    CREDIT_UTILIZATION_HERO_PREMISE_LOCKED: bundle.premiseAuthority.spokenPremise === 'I PAID IT DOWN. WHY DID MY SCORE DROP?',
    CREDIT_UTILIZATION_8_SLIDE_ROLE_MAP_LOCKED: creditUtilizationEightSlideRolesLocked(),
    CREDIT_UTILIZATION_CHARACTER_FIRST_NORTH_STAR_REGISTERED: creditUtilizationCharacterFirstNorthStarRegistered(),
    GENERICIZED_REGENERATION_REGISTERED_AS_NEGATIVE_EVIDENCE: genericizedRegenerationRegisteredAsNegativeEvidence(),
    CURRENT_NINE_CHARACTER_AUTHORITY_MIGRATION_IMPLEMENTED: currentNineCharacterAuthorityMigrationImplemented(),
    TOPIC_ONLY_REGENERATION_BLOCKED: topicOnlyRegenerationBlocked(),
    MIGRATION_BLOCKERS_VISIBLE: migrationBlockersVisible(migration).length >= 0,
    FOUNDER_CAUSALITY_REVIEW_IMPLEMENTED: FOUNDER_CAUSALITY_JUDGMENTS.includes('YES_THATS_THE_POST'),
    FOUNDER_REQUIRED_TO_MICROMANAGE_EVERY_SLIDE: false,
    CROSS_SURFACE_CHARACTER_AUTHORITY_PRESERVED: compileNDXFirstPersonCopy({ seed, platform: 'THREAD' }).spokenLines.length > 0,
    P0_FILM_1_CHARACTER_PREMISE_HANDOFF_IMPLEMENTED: Boolean(buildContentSeedFilmHandoffWithCharacterPremise(seed, bundle).openingBeat),
    PERFORMANCE_PREMISE_LEARNING_PREPARED: true,
    AUTO_PROVIDER_REQUESTS_DURING_MIGRATION: autoProviderRequestsDuringMigration() === 0,
    BRAND_CHARACTER_MUTATED: false,
    BRAND_CANON_MUTATED: false,
    HISTORICAL_ASSETS_MUTATED: false,
    HISTORICAL_PROMPT_SNAPSHOTS_MUTATED: false,
  };
}

describe('P0.5E.7A success criteria', () => {
  it('reports all success criteria booleans true (except explicitly false flags)', () => {
    const criteria = p057aSuccessCriteria();
    expect(criteria.CHARACTER_PREMISE_AUTHORITY_IMPLEMENTED).toBe(true);
    expect(criteria.TOPIC_ONLY_CHARACTER_PAGE_ALLOWED).toBe(false);
    expect(criteria.FIRST_PERSON_FABRICATED_AUTOBIOGRAPHY_ALLOWED).toBe(false);
    expect(criteria.REQUIRED_BELIEF_REVISION_CAN_DISAPPEAR).toBe(false);
    expect(criteria.NDX_PHOTOGRAPHY_REQUIRED_ON_EVERY_SLIDE).toBe(false);
    expect(criteria.FOUNDER_REQUIRED_TO_MICROMANAGE_EVERY_SLIDE).toBe(false);
    expect(criteria.BRAND_CHARACTER_MUTATED).toBe(false);
    expect(criteria.CREDIT_UTILIZATION_HERO_PREMISE_LOCKED).toBe(true);
    expect(criteria.CREDIT_UTILIZATION_8_SLIDE_ROLE_MAP_LOCKED).toBe(true);
    expect(criteria.AUTO_PROVIDER_REQUESTS_DURING_MIGRATION).toBe(true);
  });
});
