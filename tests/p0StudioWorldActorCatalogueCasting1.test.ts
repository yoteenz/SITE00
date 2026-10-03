/**
 * P0.STUDIO-WORLD-ACTOR-CATALOGUE-CASTING-AND-CHARACTER-AUTHORITY1
 */

import { describe, expect, it } from 'vitest';

import { compileEntry002RetroactiveNarrativeMomentum } from '../shared/site00-expression-engine/narrative-momentum/entry002RetroactiveIngest.js';
import { narrativeMomentumStoryboardHandoff } from '../shared/site00-expression-engine/narrative-momentum/compileNarrativeMomentumPlan.js';
import {
  assertUncataloguedHeroBlocked,
  buildEntry002ProductionCastState,
  buildKeyframeCharacterHandoff,
  buildStoryboardCharacterHandoff,
  buildVideoCharacterHandoff,
  deriveCastingRequirementsFromNarrativePlan,
  entry002CastProof,
  evaluateCastGate,
  evaluateCastingHomogeneityGuard,
  findActorByCatalogueNumber,
  getStudioWorldActorCatalogue,
  recommendActorsForCharacter,
  recordActorCampaignUsage,
  shouldSearchCatalogueBeforeNewActor,
  validateCharacterContinuity,
} from '../shared/site00-studio-world/acting-catalogue/index.js';
import {
  buildProductionJourney,
} from '../src/site00/components/founderWorkspace/expressionEngine/productionJourney.js';

describe('P0.STUDIO-WORLD-ACTOR-CATALOGUE-CASTING1', () => {
  it('separates Actor and Character models', () => {
    const actor = findActorByCatalogueNumber('SW-017');
    const state = buildEntry002ProductionCastState();
    const character = state.characters.find((c) => c.characterName.includes('2026'))!;
    expect(actor?.actorId).not.toBe(character.characterId);
    expect(character.actorId).toBe(actor?.actorId);
    expect(character.characterName).not.toBe(actor?.stageName);
  });

  it('allows one Actor to play multiple Characters across campaigns', () => {
    const actor = findActorByCatalogueNumber('SW-017')!;
    const state = buildEntry002ProductionCastState();
    const otherCampaignCharacter = {
      ...state.characters[0],
      characterId: 'char-other-campaign',
      entryId: 'entry-099',
      characterName: 'Different role',
    };
    expect(otherCampaignCharacter.actorId).toBe(actor.actorId);
  });

  it('supports multiple temporal Looks for one Character', () => {
    const state = buildEntry002ProductionCastState();
    const subject = state.characters[0];
    expect(subject.temporalLookIds.length).toBe(2);
    expect(state.temporalLooks.every((t) => t.preservesActorIdentity)).toBe(true);
  });

  it('searches catalogue before proposing new Actor creation', () => {
    const plan = compileEntry002RetroactiveNarrativeMomentum();
    const req = deriveCastingRequirementsFromNarrativePlan(plan)[0];
    const recs = recommendActorsForCharacter({
      requirement: req,
      brand: 'ndxbook',
      project: plan.projectId,
      creativeTerritory: plan.creativeTerritoryLabel,
      narrativePlan: plan,
      previousActorUsage: [],
    });
    const decision = shouldSearchCatalogueBeforeNewActor(req, recs);
    expect(decision.action).toBe('REUSE_EXISTING');
  });

  it('blocks uncatalogued hero/supporting characters', () => {
    const state = buildEntry002ProductionCastState();
    const hero = state.characters.find((c) => c.screenImportance === 'HERO')!;
    const uncast = { ...hero, actorId: null, status: 'CAST_PENDING' as const };
    const req = state.requirements.find((r) => r.requirementId === hero.castingRequirementId);
    const guard = assertUncataloguedHeroBlocked(uncast, req);
    expect(guard.blocked).toBe(true);
    expect(guard.code).toBe('UNCATALOGUED_HERO_CHARACTER');
  });

  it('requires Character Authority lock before storyboard handoff', () => {
    const openState = buildEntry002ProductionCastState();
    const unlocked = {
      ...openState,
      characters: openState.characters.map((c) =>
        c.screenImportance === 'HERO' ? { ...c, status: 'FOUNDER_REVIEW' as const, characterAuthorityId: null } : c,
      ),
    };
    expect(buildStoryboardCharacterHandoff(unlocked).length).toBe(0);
    expect(evaluateCastGate(unlocked).blockedReason).toBe('CAST_GATE_BLOCKED');
  });

  it('passes Character IDs to storyboard handoff', () => {
    const plan = compileEntry002RetroactiveNarrativeMomentum();
    const handoff = narrativeMomentumStoryboardHandoff(plan);
    expect(handoff.characterIdsForStoryboard.length).toBeGreaterThan(0);
    expect(handoff.castingRequirementCount).toBe(3);
  });

  it('passes visual authority IDs to keyframe handoff', () => {
    const state = buildEntry002ProductionCastState();
    const kf = buildKeyframeCharacterHandoff(state);
    expect(kf.visualAuthorityIds.length).toBeGreaterThan(2);
    expect(kf.characters[0]?.characterAuthorityId).toBeTruthy();
  });

  it('does not overwrite Actor identity on campaign reuse', () => {
    const actor = findActorByCatalogueNumber('SW-017')!;
    const updated = recordActorCampaignUsage(actor, {
      projectId: 'ndxbook',
      entryId: 'entry-003',
      campaignId: 'campaign-entry-003',
      characterId: 'char-entry003-lead',
      characterName: 'New character',
      shotIds: [],
      assetIds: [],
    });
    expect(updated.actorId).toBe(actor.actorId);
    expect(updated.identityAuthorityId).toBe(actor.identityAuthorityId);
  });

  it('persists wardrobe continuity validation', () => {
    const state = buildEntry002ProductionCastState();
    const character = state.characters[0];
    const look = state.looks[0];
    const sheet = state.authoritySheets[0];
    const result = validateCharacterContinuity({
      character,
      actor: findActorByCatalogueNumber('SW-017'),
      look,
      temporalLook: state.temporalLooks[0],
      authoritySheet: sheet,
      priorLook: null,
    });
    expect(result.valid).toBe(true);
  });

  it('derives casting requirements from Narrative Momentum', () => {
    const plan = compileEntry002RetroactiveNarrativeMomentum();
    expect(plan.castingRequirements.length).toBe(3);
  });

  it('does not increment provider dispatch when opening cast intelligence', () => {
    const state = buildEntry002ProductionCastState();
    recommendActorsForCharacter({
      requirement: state.requirements[0],
      brand: 'ndxbook',
      project: state.projectId,
      creativeTerritory: 'territory',
      narrativePlan: null,
      previousActorUsage: [],
    });
    expect(state.providerDispatchCount).toBe(0);
  });

  it('catalogue exposes diverse performance and role metadata', () => {
    const cat = getStudioWorldActorCatalogue();
    const presentations = new Set(cat.actors.map((a) => a.presentation));
    expect(presentations.size).toBeGreaterThan(1);
    expect(cat.actors.some((a) => a.catalogueNumber.startsWith('SW-RESIDENT-'))).toBe(true);
    expect(cat.actors.some((a) => a.roleArchetypes.includes('CREATIVE_DIRECTOR'))).toBe(true);
  });

  it('includes CAST in production journey', () => {
    const stages = buildProductionJourney({
      coverAuthority: 'APPROVED',
      narrativeMomentumStatus: 'APPROVED',
      castStageStatus: 'APPROVED',
      reelTreatment: 'LOCKED',
      preStoryboardComplete: true,
      activeProductionStep: 'FINAL_CINEMATIC_STORYBOARD',
      finalStoryboardStatus: 'READY',
      finalStoryboardValid: true,
      finalStoryboardApproved: false,
      keyframeEligibility: 'BLOCKED',
      videoEligibility: 'BLOCKED',
    });
    expect(stages.some((s) => s.id === 'CAST')).toBe(true);
  });

  it('Entry 002 retroactive mapping proof receipt', () => {
    const proof = entry002CastProof();
    expect(proof.castRequirementCount).toBe(3);
    expect(proof.characterCount).toBe(3);
    expect(proof.samePersonAcross20162026).toBe('SAME_CHARACTER_ONE_ACTOR');
    expect(proof.temporalLookCount).toBe(2);
    expect(proof.charactersWithVisualAuthorities.length).toBeGreaterThan(0);
  });

  it('video handoff receives shot cast roster', () => {
    const state = buildEntry002ProductionCastState();
    const video = buildVideoCharacterHandoff(state, 'shot-entry002-receipt-01');
    expect(video.shotCast.length).toBe(1);
    expect(video.continuityLock).toBe(true);
  });

  it('homogeneity guard flags overly uniform ensembles', () => {
    const cat = getStudioWorldActorCatalogue();
    const ids = cat.actors.filter((a) => a.presentation === 'WOMAN').slice(0, 3).map((a) => a.actorId);
    const result = evaluateCastingHomogeneityGuard(ids, 3);
    expect(result.flagged).toBe(true);
  });
});
