/**
 * P0.5E.3 — Embodied NDX Character Discovery (30+ requirements).
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  buildEmbodiedBrandCharacterDiscoverySystem,
  castingCannotOccurBeforeReadiness,
  castingCandidatesMustShareOneCharacter,
  embodiedCharacterDistinctFromBrandCharacter,
  embodiedCharacterDistinctFromFounder,
  evaluateArchetypeCollapse,
  evaluateBeautyRole,
  evaluateEmbodiedCharacterHumanity,
  evaluateScenarioContinuity,
  founderVisualSelectionsTreatedAsCanon,
  genericStudioWorldCulturallyNeutral,
  influencerCollapseFailsEvaluation,
  noFalRequiredForDiscovery,
  scenarioTestsRequireContinuity,
  synthesisIsNotArchetypeMashup,
  visualIdentityRemainsUnset,
  buildCulturalLifeFoundation,
  contradictionsMeetMinimumRequirements,
  emotionalRangeRequired,
  nonverbalHumorModeled,
  cameraRelationshipModeled,
  discoveryInterviewRoundCount,
} from '../site00-studio-world-production/embodiedCharacterDiscovery/index.js';
import {
  ARCHETYPE_COLLAPSE_GUARDS_IMPLEMENTED,
  BRAND_CANON_MUTATED,
  BRAND_CHARACTER_MUTATED,
  EMBODIED_CHARACTER_BOOK_RELATIONSHIP_MODELED,
  EMBODIED_CHARACTER_CAMERA_RELATIONSHIP_MODELED,
  EMBODIED_CHARACTER_CONTRADICTIONS_MODELED,
  EMBODIED_CHARACTER_CULTURAL_LIFE_MODELED,
  EMBODIED_CHARACTER_DISCOVERY_IMPLEMENTED,
  EMBODIED_CHARACTER_EMOTIONAL_RANGE_MODELED,
  EMBODIED_CHARACTER_HUMOR_MODELED,
  EMBODIED_CHARACTER_HUMANITY_EVALUATION_IMPLEMENTED,
  EMBODIED_CHARACTER_INTELLIGENCE_MODELED,
  EMBODIED_CHARACTER_PHYSICAL_BEHAVIOR_MODELED,
  EMBODIED_CHARACTER_PRIVATE_HUMANITY_MODELED,
  EMBODIED_CHARACTER_PSYCHOLOGY_MODELED,
  EMBODIED_CHARACTER_STYLE_HYPOTHESIS_MODELED,
  EMBODIED_CHARACTER_VOICE_MODELED,
  FINAL_CHARACTER_FACE_SELECTED,
  FINAL_CHARACTER_GENERATION_PERFORMED,
  FINAL_CHARACTER_VISUAL_IDENTITY_FINALIZED,
  FOUNDER_BOARD_01_SELECTIONS,
  FOUNDER_BOARD_02_SELECTIONS,
  FOUNDER_VISUAL_NORTH_STAR_EVIDENCE_CAPTURED,
  FOUNDER_VISUAL_SELECTIONS_TREATED_AS_CANON,
  INFLUENCER_COLLAPSE_GUARD_IMPLEMENTED,
  PRODUCT_EXPRESSION_IMPLEMENTED,
  READY_FOR_CHARACTER_CASTING_EXPLORATION,
  READY_FOR_EMBODIED_CHARACTER_SYNTHESIS,
  READY_FOR_FOUNDER_CHARACTER_DISCOVERY,
  WORLD_FORMATION_IMPLEMENTED,
  buildNdxEmbodiedCharacterDiscoveryRun,
  brandCharacterImmutable,
  brandCanonUnchanged,
  productExpressionBlocked,
  worldFormationBlocked,
  buildNdxFounderVisualNorthStarEvidence,
  buildNdxCharacterScenarioTests,
  africanAmericanCharacterContextIsNdxSpecific,
  culturalAuthenticityNotStereotypeDensity,
} from '../site00-brand-lore/ndxEmbodiedCharacterDiscovery/index.js';
import {
  burnBookCloneBehaviorFails,
  founderCloneBehaviorFails,
} from '../site00-studio-world-production/embodiedCharacterDiscovery/archetypeCollapseGuards.js';
import { resetEmbodiedCharacterDiscoveryMemory, resetEmbodiedCharacterDiscoveryStoreModeCache } from '../../api/_lib/site00Evolve/embodiedCharacterDiscovery/embodiedCharacterDiscoveryStoreAdapter.js';
import {
  initializeEmbodiedCharacterDiscovery,
  saveEmbodiedCharacterDiscoveryInterviewRound,
  synthesizeEmbodiedCharacterDiscovery,
} from '../../api/_lib/site00Evolve/embodiedCharacterDiscovery/embodiedCharacterDiscoveryService.js';

const ROOT = join(process.cwd());

describe('P0.5E.3 — Embodied Character Discovery', () => {
  beforeEach(() => {
    resetEmbodiedCharacterDiscoveryMemory();
    resetEmbodiedCharacterDiscoveryStoreModeCache();
  });

  it('1. Founder visual selections stored as evidence, not canon', () => {
    const evidence = buildNdxFounderVisualNorthStarEvidence();
    expect(evidence).toHaveLength(2);
    expect(evidence[0]!.selectionIds).toEqual([...FOUNDER_BOARD_01_SELECTIONS]);
    expect(evidence[1]!.selectionIds).toEqual([...FOUNDER_BOARD_02_SELECTIONS]);
    expect(evidence.every((e) => e.identityAuthority === 'NONE')).toBe(true);
    expect(founderVisualSelectionsTreatedAsCanon(evidence[0]!)).toBe(false);
    expect(visualIdentityRemainsUnset(evidence)).toBe(true);
    expect(FOUNDER_VISUAL_NORTH_STAR_EVIDENCE_CAPTURED).toBe(true);
    expect(FOUNDER_VISUAL_SELECTIONS_TREATED_AS_CANON).toBe(false);
  });

  it('2. Final visual identity unset; no FAL generation', () => {
    const run = buildNdxEmbodiedCharacterDiscoveryRun('ndxbook');
    expect(run.system.finalFaceSelected).toBe(false);
    expect(run.system.characterGenerationPerformed).toBe(false);
    expect(run.falRequests).toBe(0);
    expect(noFalRequiredForDiscovery()).toBe(true);
    expect(FINAL_CHARACTER_FACE_SELECTED).toBe(false);
    expect(FINAL_CHARACTER_VISUAL_IDENTITY_FINALIZED).toBe(false);
    expect(FINAL_CHARACTER_GENERATION_PERFORMED).toBe(false);
  });

  it('3. Embodied character separate from founder and Brand Character', () => {
    expect(embodiedCharacterDistinctFromFounder()).toBe(true);
    expect(embodiedCharacterDistinctFromBrandCharacter()).toBe(true);
    const run = buildNdxEmbodiedCharacterDiscoveryRun('ndxbook');
    expect(run.system.distinctFromFounder).toBe(true);
    expect(run.system.distinctFromBrandCharacter).toBe(true);
    expect(run.system.brandCharacterInheritance).toBe('SELECTED_PSYCHOLOGICAL_INHERITANCE');
  });

  it('4. Generic Studio World culturally neutral; NDX adapter specific', () => {
    const generic = buildCulturalLifeFoundation();
    expect(genericStudioWorldCulturallyNeutral(generic)).toBe(true);
    const ndx = buildNdxEmbodiedCharacterDiscoveryRun('ndxbook');
    expect(africanAmericanCharacterContextIsNdxSpecific(ndx.culturalLife)).toBe(true);
    expect(culturalAuthenticityNotStereotypeDensity()).toBe(true);
  });

  it('5. Psychology, intelligence, contradictions modeled with requirements', () => {
    const run = buildNdxEmbodiedCharacterDiscoveryRun('ndxbook');
    expect(run.psychology.whatSheNotices.length).toBeGreaterThan(0);
    expect(run.intelligence.blindSpots.length).toBeGreaterThan(0);
    expect(contradictionsMeetMinimumRequirements(run.contradictions)).toBe(true);
    expect(EMBODIED_CHARACTER_PSYCHOLOGY_MODELED).toBe(true);
    expect(EMBODIED_CHARACTER_INTELLIGENCE_MODELED).toBe(true);
    expect(EMBODIED_CHARACTER_CONTRADICTIONS_MODELED).toBe(true);
  });

  it('6. Humor, emotional range, voice modeled', () => {
    const run = buildNdxEmbodiedCharacterDiscoveryRun('ndxbook');
    expect(nonverbalHumorModeled(run.humor)).toBe(true);
    expect(emotionalRangeRequired(run.emotionalRange)).toBe(true);
    expect(run.voice.innerVoice).not.toBe(run.voice.pageVoice);
    expect(EMBODIED_CHARACTER_HUMOR_MODELED).toBe(true);
    expect(EMBODIED_CHARACTER_EMOTIONAL_RANGE_MODELED).toBe(true);
    expect(EMBODIED_CHARACTER_VOICE_MODELED).toBe(true);
  });

  it('7. Cultural life, private humanity, book relationship', () => {
    const run = buildNdxEmbodiedCharacterDiscoveryRun('ndxbook');
    expect(run.culturalLife.culturalBlindSpots.length).toBeGreaterThan(0);
    expect(run.everydayLife.guiltyPleasures.length).toBeGreaterThan(0);
    expect(run.bookRelationship.whySheKeepsIt.length).toBeGreaterThan(0);
    expect(run.bookRelationship.termMeanings.PAGE).toBeTruthy();
    expect(EMBODIED_CHARACTER_CULTURAL_LIFE_MODELED).toBe(true);
    expect(EMBODIED_CHARACTER_PRIVATE_HUMANITY_MODELED).toBe(true);
    expect(EMBODIED_CHARACTER_BOOK_RELATIONSHIP_MODELED).toBe(true);
  });

  it('8. Physical behavior, camera relationship, style hypothesis', () => {
    const run = buildNdxEmbodiedCharacterDiscoveryRun('ndxbook');
    expect(run.physicalBehavior.researchBehaviors.length).toBeGreaterThan(10);
    expect(cameraRelationshipModeled(run.cameraRelationship)).toBe(true);
    expect(run.styleHypothesis.uniformCollapseBlocked).toBe(true);
    expect(EMBODIED_CHARACTER_PHYSICAL_BEHAVIOR_MODELED).toBe(true);
    expect(EMBODIED_CHARACTER_CAMERA_RELATIONSHIP_MODELED).toBe(true);
    expect(EMBODIED_CHARACTER_STYLE_HYPOTHESIS_MODELED).toBe(true);
  });

  it('9. Platform expression — Stories/TikTok/Reels/Feed', () => {
    const run = buildNdxEmbodiedCharacterDiscoveryRun('ndxbook');
    expect(run.platformExpression.storiesAreMargins).toBe(true);
    expect(run.platformExpression.tiktokIsThoughtBeingWorkedOut).toBe(true);
    expect(run.platformExpression.reelsAreBookInMotion).toBe(true);
    expect(run.platformExpression.feedIsPages).toBe(true);
    expect(run.platformExpression.reuseThinkingNotPosts).toBe(true);
  });

  it('10. Archetype collapse + influencer collapse guards', () => {
    expect(
      evaluateArchetypeCollapse({
        adjectiveOnlyTraits: true,
        perfectCharacter: false,
        alwaysSnarky: false,
        alwaysUnbothered: false,
        alwaysCameraReady: false,
        influencerHost: false,
        brandMascot: false,
        founderClone: false,
        derivativeCharacterClone: false,
        aiPersonality: false,
        culturalReferenceMachine: false,
        coolGirlArchetype: false,
        sassyArchetype: false,
        smartGirlCostume: false,
      }).passes,
    ).toBe(false);
    expect(influencerCollapseFailsEvaluation(true)).toBe(true);
    expect(founderCloneBehaviorFails(true)).toBe(true);
    expect(burnBookCloneBehaviorFails(true)).toBe(true);
    expect(ARCHETYPE_COLLAPSE_GUARDS_IMPLEMENTED).toBe(true);
    expect(INFLUENCER_COLLAPSE_GUARD_IMPLEMENTED).toBe(true);
  });

  it('11. Beauty role — beauty incidental not primary', () => {
    expect(
      evaluateBeautyRole({
        beautyPrimaryReasonToWatch: true,
        permanentGlam: false,
        permanentEditorialPose: false,
        influencerCollapse: false,
        sexualizationAsPersonality: false,
      }).passes,
    ).toBe(false);
  });

  it('12. Scenario tests — 12 minimum with continuity', () => {
    const tests = buildNdxCharacterScenarioTests();
    expect(scenarioTestsRequireContinuity(tests)).toBe(true);
    expect(evaluateScenarioContinuity(tests)).toBe(true);
  });

  it('13. Humanity evaluation + casting readiness gate', () => {
    const run = buildNdxEmbodiedCharacterDiscoveryRun('ndxbook');
    expect(run.humanityEvaluation.contradictionPresent).toBe(true);
    expect(EMBODIED_CHARACTER_HUMANITY_EVALUATION_IMPLEMENTED).toBe(true);
    expect(castingCannotOccurBeforeReadiness(run.castingReadiness)).toBe(true);
    expect(castingCandidatesMustShareOneCharacter()).toBe(true);
    expect(run.nextCastingRoundSpec.sameWrittenCharacter).toBe(true);
    expect(run.nextCastingRoundSpec.generationPerformed).toBe(false);
    expect(READY_FOR_CHARACTER_CASTING_EXPLORATION).toBe(false);
  });

  it('14. Discovery interview — 12 rounds', () => {
    const run = buildNdxEmbodiedCharacterDiscoveryRun('ndxbook');
    expect(discoveryInterviewRoundCount()).toBe(12);
    expect(run.interviewRounds).toHaveLength(12);
  });

  it('15. Service — initialize, save round, synthesize', async () => {
    const init = await initializeEmbodiedCharacterDiscovery({ projectId: 'ndxbook' });
    expect(init.projectId).toBe('ndxbook');
    const saved = await saveEmbodiedCharacterDiscoveryInterviewRound({
      projectId: 'ndxbook',
      round: 'WHO_IS_SHE',
      answer: 'She is the friend who always has a receipt.',
      rawWording: 'She is the friend who always has a receipt.',
    });
    expect(saved.interviewRounds.find((r) => r.round === 'WHO_IS_SHE')?.founderAnswer).toBeTruthy();
    const syn = await synthesizeEmbodiedCharacterDiscovery({ projectId: 'ndxbook' });
    expect(syn.synthesis?.founderTriggered).toBe(true);
    expect(synthesisIsNotArchetypeMashup(syn.synthesis!.characterEssence)).toBe(true);
  });

  it('16. Integrity flags + UI wired', () => {
    expect(brandCharacterImmutable()).toBe(true);
    expect(brandCanonUnchanged()).toBe(true);
    expect(productExpressionBlocked()).toBe(true);
    expect(worldFormationBlocked()).toBe(true);
    expect(BRAND_CHARACTER_MUTATED).toBe(false);
    expect(BRAND_CANON_MUTATED).toBe(false);
    expect(PRODUCT_EXPRESSION_IMPLEMENTED).toBe(false);
    expect(WORLD_FORMATION_IMPLEMENTED).toBe(false);
    expect(EMBODIED_CHARACTER_DISCOVERY_IMPLEMENTED).toBe(true);
    expect(READY_FOR_FOUNDER_CHARACTER_DISCOVERY).toBe(true);
    expect(READY_FOR_EMBODIED_CHARACTER_SYNTHESIS).toBe(true);

    const page = readFileSync(join(ROOT, 'src/site00/pages/ProjectEmbodiedCharacterDiscoveryPage.tsx'), 'utf8');
    const api = readFileSync(join(ROOT, 'src/site00/services/site00ProjectsApi.ts'), 'utf8');
    expect(page).toContain('P0.5E.3');
    expect(page).toContain('NOT FINALIZED');
    expect(page).toContain('CHARACTER GENERATION');
    expect(api).toContain('embodied_character_discovery_initialize');
    expect(buildEmbodiedBrandCharacterDiscoverySystem('test').falRequired).toBe(false);
  });
});
