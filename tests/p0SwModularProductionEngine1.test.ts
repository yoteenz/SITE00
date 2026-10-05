/**
 * P0.SW.MODULAR-PRODUCTION-ENGINE1 — architecture schema + rules
 */

import { describe, expect, it } from 'vitest';

import { findActorByCatalogueNumber } from '../shared/site00-studio-world/acting-catalogue/seedCatalogue.js';
import {
  actorToCatalogueEntry,
  canEnterActingCatalogue,
  canUseAssetWithinAllowance,
  initialCastingPipeline,
  pricingTierForEconomics,
  PRODUCTION_LAYERS,
  sceneAssemblyReadyForGeneration,
  STUDIO_WORLD_WORKSPACE_MODULES,
  validateModularProductionRules,
  type SceneAssemblyPacket,
} from '../shared/site00-studio-world/modular-production-engine/index.js';

describe('P0.SW.MODULAR-PRODUCTION-ENGINE1', () => {
  it('defines five canonical production layers', () => {
    expect(PRODUCTION_LAYERS).toEqual([
      'PERFORMER',
      'ENVIRONMENT',
      'PROP_GRAPHIC',
      'WARDROBE',
      'MOTION_PERFORMANCE',
    ]);
  });

  it('bridges acting catalogue actor into library entry without baking wardrobe into identity', () => {
    const actor = findActorByCatalogueNumber('SW-017')!;
    const entry = actorToCatalogueEntry(actor);
    expect(entry.libraryKind).toBe('ACTING_CATALOGUE');
    expect(entry.identityAuthorityId).toBe(actor.identityAuthorityId);
    expect(entry.wardrobeCompatibility.length).toBeGreaterThan(0);
    expect(entry.approvalStatus).toBe('APPROVED');
  });

  it('only allows catalogue insertion after founder-approved casting stage', () => {
    const state = initialCastingPipeline({
      campaignContext: 'NDXBOOK',
      roleFunction: 'Lead subject',
      personalityRequirement: 'Expressive',
      demographicGuidance: 'Woman late 20s',
      referenceAssetIds: [],
    });
    expect(canEnterActingCatalogue(state)).toBe(false);
    const approved = {
      ...state,
      stage: 'CANONICAL_ACTOR_CREATION' as const,
      approved: true,
    };
    expect(canEnterActingCatalogue(approved)).toBe(true);
  });

  it('ranks reuse cheaper than net-new generation', () => {
    expect(pricingTierForEconomics('REUSE_EXISTING')).toBe('LOWEST');
    expect(pricingTierForEconomics('GENERATE_NET_NEW')).toBe('PREMIUM');
  });

  it('enforces allowance vs billable expansion for net-new character', () => {
    const ledger = {
      clientId: 'client-a',
      billingPeriod: '2026-09',
      allowance: {
        characterCastsPerMonth: 2,
        environmentOrSetAdaptationsPerMonth: 1,
        unlimitedApprovedSharedReuse: true,
        reskinsIncludedPerMonth: 1,
      },
      usedCharacterCasts: 2,
      usedEnvironmentAdaptations: 0,
      usedReskins: 0,
      billableExpansions: [],
    };
    const within = canUseAssetWithinAllowance(ledger, 'GENERATE_NET_NEW', 'EXTRA_CHARACTER_CAST');
    expect(within.requiresBillable).toBe(true);
    const reuse = canUseAssetWithinAllowance(ledger, 'REUSE_EXISTING');
    expect(reuse.requiresBillable).toBe(false);
  });

  it('blocks scene generation when wardrobe is baked into identity', () => {
    const packet: SceneAssemblyPacket = {
      pipeline: 'SCENE_ASSEMBLY',
      stage: 'ASSEMBLE_SHOT_BRIEF',
      characterId: 'c1',
      actorId: 'a1',
      actorIdentityAuthorityId: 'id1',
      environmentId: 'env1',
      setId: 'set1',
      zoneId: 'z1',
      wardrobeLinkIds: ['w1'],
      performanceSkinIds: ['p1'],
      propGraphicAssetIds: [],
      generationDeltaPrompt: 'Subject holds phone; skeptical expression only.',
      libraryAssemblyFirst: true,
      providerDispatchAllowed: false,
    };
    const result = validateModularProductionRules(
      {
        actorIdentityLocked: true,
        wardrobeBakedIntoIdentity: true,
        personalitySwappable: true,
      },
      [],
      packet,
    );
    expect(result.valid).toBe(false);
    expect(result.violations.some((v) => v.ruleId === 'PERFORMER_WARDROBE_NOT_IDENTITY')).toBe(true);
  });

  it('requires library assembly before provider dispatch', () => {
    const packet: SceneAssemblyPacket = {
      pipeline: 'SCENE_ASSEMBLY',
      stage: 'SELECT_PERFORMER',
      characterId: 'c1',
      actorId: 'a1',
      actorIdentityAuthorityId: 'id1',
      environmentId: 'env1',
      setId: 'set1',
      zoneId: null,
      wardrobeLinkIds: [],
      performanceSkinIds: [],
      propGraphicAssetIds: [],
      generationDeltaPrompt: 'delta',
      libraryAssemblyFirst: true,
      providerDispatchAllowed: true,
    };
    const result = validateModularProductionRules(
      { actorIdentityLocked: true, wardrobeBakedIntoIdentity: false, personalitySwappable: true },
      [],
      packet,
    );
    expect(result.violations.some((v) => v.ruleId === 'NO_PREMATURE_PROVIDER')).toBe(true);
  });

  it('marks scene assembly ready only with actor, set, and delta prompt', () => {
    const packet: SceneAssemblyPacket = {
      pipeline: 'SCENE_ASSEMBLY',
      stage: 'ASSEMBLE_SHOT_BRIEF',
      characterId: 'c1',
      actorId: 'a1',
      actorIdentityAuthorityId: 'id1',
      environmentId: 'env1',
      setId: 'set1',
      zoneId: 'z1',
      wardrobeLinkIds: [],
      performanceSkinIds: [],
      propGraphicAssetIds: [],
      generationDeltaPrompt: 'Add receipt moment expression.',
      libraryAssemblyFirst: true,
      providerDispatchAllowed: false,
    };
    expect(sceneAssemblyReadyForGeneration(packet)).toBe(true);
  });

  it('registers workspace modules including partial casting UI', () => {
    const casting = STUDIO_WORLD_WORKSPACE_MODULES.find((m) => m.id === 'CASTING');
    expect(casting?.status).toBe('PARTIAL');
    expect(casting?.existingUi).toBe('ExpressionEngineCastPanel');
  });
});
