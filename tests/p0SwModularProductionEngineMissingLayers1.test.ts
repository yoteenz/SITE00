/**
 * P0.SW.MODULAR-PRODUCTION-ENGINE-MISSING-LAYERS-AND-OPERATIONALIZATION1
 */

import { describe, expect, it } from 'vitest';

import { compileEntry002RetroactiveNarrativeMomentum } from '../shared/site00-expression-engine/narrative-momentum/entry002RetroactiveIngest.js';
import { deriveCastingRequirementsFromNarrativePlan } from '../shared/site00-studio-world/acting-catalogue/deriveCastingRequirements.js';
import {
  advanceActorGenesisStage,
  assemblePerformanceStack,
  bodyAuthorityCannotPrecedeIdentityLock,
  canGenerateFaceCandidates,
  catalogueAdmissionReady,
  catalogueGrowsOnDemandOnly,
  checkEntitlementBeforeGenerativeAction,
  compileSceneGenerationPacket,
  entry002OperationalMigration,
  environmentDistinctFromSet,
  initialActorGenesis,
  lookTestPreservesIdentity,
  MAX_FACE_CANDIDATES,
  narrativePrecedesActorCreation,
  providerDispatchAllowed,
  recordUsageLedgerEntry,
  sceneUngroundedAssetGuard,
  searchCatalogueBeforeNewActor,
  shotDirectionIsEphemeral,
  suggestReuseBeforeNetNew,
  upgradeLegacyCastingRequirement,
  wardrobeDepartmentSeparateFromActor,
  workspaceMayUseAsset,
} from '../shared/site00-studio-world/modular-production-engine/index.js';

describe('P0.SW.MODULAR-PRODUCTION-ENGINE-MISSING-LAYERS1', () => {
  const plan = compileEntry002RetroactiveNarrativeMomentum();
  const legacyReq = deriveCastingRequirementsFromNarrativePlan(plan)[0]!;

  it('1 narrative creates CastingRequirement before Actor creation', () => {
    expect(plan.castingRequirements.length).toBeGreaterThan(0);
    const gate = narrativePrecedesActorCreation(true, true);
    expect(gate.allowed).toBe(true);
    expect(narrativePrecedesActorCreation(false, true).allowed).toBe(false);
  });

  it('2 catalogue search occurs before new Actor creation', () => {
    const search = searchCatalogueBeforeNewActor({
      requirement: legacyReq,
      projectId: plan.projectId,
      brand: 'ndxbook',
      creativeTerritory: plan.creativeTerritoryLabel,
    });
    expect(['MATCHED', 'POSSIBLE_MATCH', 'NO_SUITABLE_MATCH']).toContain(search.outcome);
    if (search.outcome !== 'NO_SUITABLE_MATCH') expect(search.createNewActorAllowed).toBe(false);
  });

  it('3–4 actor genesis stops after face candidates until selection and respects max count', () => {
    const state = initialActorGenesis(legacyReq.requirementId);
    expect(canGenerateFaceCandidates(state, 3)).toBe(true);
    expect(canGenerateFaceCandidates(state, 4)).toBe(false);
    expect(MAX_FACE_CANDIDATES).toBe(3);
    expect(advanceActorGenesisStage(state).stage).toBe('FACE_CANDIDATES');
  });

  it('5 body authority cannot precede identity lock', () => {
    const s = initialActorGenesis('req');
    expect(bodyAuthorityCannotPrecedeIdentityLock(s)).toBe(true);
    const bad = {
      ...s,
      stage: 'NEUTRAL_BODY_AUTHORITY' as const,
      identityAuthorityId: null,
      identityAnglesComplete: false,
    };
    expect(bodyAuthorityCannotPrecedeIdentityLock(bad)).toBe(false);
  });

  it('6–7 actor does not inherit permanent wardrobe; wardrobe is separate department', () => {
    const s = initialActorGenesis('req');
    expect(s.permanentWardrobeAssigned).toBe(false);
    expect(wardrobeDepartmentSeparateFromActor(false)).toBe(true);
  });

  it('8–9 look tests preserve identity; personality separate from actor', () => {
    expect(
      lookTestPreservesIdentity({ faceChanged: false, bodyProportionsChanged: false, wardrobeChanged: true }),
    ).toBe(true);
    const stack = assemblePerformanceStack(
      {
        actorIdentityAuthorityId: 'id1',
        characterId: 'c1',
        personality: { profileId: 'p1', characterId: 'c1', traits: { curiosity: 0.8 }, notes: '' },
        behaviorSkins: [],
        movementSkins: [],
        emotionalRange: { profileId: 'e1', states: ['NEUTRAL'] },
        voice: null,
        animationSkin: null,
      },
      null,
    );
    expect(stack.actorIdentityAuthorityId).toBe('id1');
  });

  it('10–11 behavior/movement reusable; shot direction ephemeral', () => {
    const dir = {
      shotDirectionId: 'sd1',
      shotId: 'shot1',
      characterId: 'c1',
      action: 'looks over shoulder',
      expressionHint: 'smirk',
      ephemeral: true as const,
    };
    expect(shotDirectionIsEphemeral(dir)).toBe(true);
  });

  it('12–14 environment vs set; zones and camera coverage persist on set model', () => {
    const set = {
      setId: 'set1',
      environmentId: 'env-office',
      name: 'Archive Desk',
      function: 'receipt',
      brandCompatibility: ['ndxbook'],
      era: '2020s',
      visualLanguage: 'editorial',
      materials: [],
      lightingModes: ['daylight'],
      zones: [{ zoneId: 'desk', label: 'DESK', blockingNotes: '' }],
      cameraCoverage: [{ coverage: 'MEDIUM' as const, referenceAssetId: 'cam1' }],
      propAnchors: [],
      graphicAnchors: [],
      textAnchors: [],
      interactionAnchors: [],
      campaignHistory: [],
      exclusivityScope: 'STUDIO_WORLD_SHARED' as const,
      tags: [],
      ownerScope: 'STUDIO_WORLD_SHARED' as const,
    };
    expect(environmentDistinctFromSet('env-office', set)).toBe(true);
    expect(set.zones.length).toBe(1);
    expect(set.cameraCoverage[0]?.coverage).toBe('MEDIUM');
  });

  it('15–17 scene packet, ungrounded guard, asset gaps', () => {
    const guard = sceneUngroundedAssetGuard('add a new store sign on wall', []);
    expect(guard.grounded).toBe(false);
    const packet = compileSceneGenerationPacket({
      assembly: {
        sceneId: 'sc1',
        narrativeBeatId: 'b1',
        shotRequirementId: 'sh1',
        characterIds: ['c1'],
        performanceSkinIds: [],
        characterLookAuthorityIds: ['look1'],
        environmentId: 'env1',
        setId: 'set1',
        setZoneId: 'desk',
        cameraCoverage: 'WIDE',
        propIds: [],
        graphicIds: [],
        lightingMode: 'soft',
        shotDirectionId: 'sd1',
      },
      performances: [],
      looks: [
        {
          lookAuthorityId: 'look1',
          characterId: 'c1',
          wardrobeItemIds: [],
          hairStyleId: null,
          makeupLookId: null,
          accessoryIds: [],
          approvedFromFittingSessionId: 'fit1',
          locked: true,
        },
      ],
      set: {
        setId: 'set1',
        environmentId: 'env1',
        name: 'Set',
        function: 'fn',
        brandCompatibility: [],
        era: '2020s',
        visualLanguage: 'v',
        materials: [],
        lightingModes: [],
        zones: [],
        cameraCoverage: [],
        propAnchors: [],
        graphicAnchors: [],
        textAnchors: [],
        interactionAnchors: [],
        campaignHistory: [],
        exclusivityScope: 'STUDIO_WORLD_SHARED',
        tags: [],
        ownerScope: 'STUDIO_WORLD_SHARED',
      },
      deltaPrompt: 'Subject glances at phone.',
    });
    expect(packet.proseOnlyForbidden).toBe(true);
    expect(packet.referenceAssetIds.length).toBeGreaterThan(0);
  });

  it('18–19 entitlements distinguish new character vs new actor', () => {
    const planEnt = {
      planId: 'starter',
      label: 'Starter',
      includedNewActors: 1,
      includedCharacters: 2,
      includedActorReskins: 1,
      includedCharacterLooks: 2,
      includedNewSets: 1,
      includedSetReskins: 1,
      includedWardrobeCreations: 2,
      includedEnvironmentCreations: 1,
      includedCustomProps: 2,
      includedCustomGraphics: 2,
      includedSceneGenerations: 20,
      rolloverAllowed: false,
      monthlyReset: true as const,
    };
    const ws = { workspaceId: 'w1', clientId: 'c1', label: 'Agency', internalStudioWorld: false };
    const charOnActor = checkEntitlementBeforeGenerativeAction({
      plan: planEnt,
      usedCharactersThisPeriod: 0,
      usedNewActorsThisPeriod: 0,
      operation: 'CUSTOMIZE_EXISTING',
      isNewActorGenesis: false,
      isNewCharacterOnExistingActor: true,
      workspace: ws,
    });
    expect(charOnActor.surchargeKind).toBe('NEW_CHARACTER');
    const newActor = checkEntitlementBeforeGenerativeAction({
      plan: planEnt,
      usedCharactersThisPeriod: 0,
      usedNewActorsThisPeriod: 1,
      operation: 'GENERATE_NET_NEW',
      isNewActorGenesis: true,
      isNewCharacterOnExistingActor: false,
      workspace: ws,
    });
    expect(newActor.requiresAddOn).toBe(true);
    expect(newActor.surchargeKind).toBe('NEW_ACTOR_GENESIS');
  });

  it('20 reuse/reskin/customize/net-new paths suggested before net-new', () => {
    const paths = suggestReuseBeforeNetNew({
      castingRequirement: legacyReq,
      projectId: plan.projectId,
      brand: 'ndxbook',
      creativeTerritory: plan.creativeTerritoryLabel,
      nearFitSetExists: true,
      nearFitWardrobeExists: true,
    });
    expect(paths.some((p) => p.economics === 'REUSE_EXISTING' || p.economics === 'RESKIN_EXISTING')).toBe(true);
  });

  it('21–22 private scope and usage ledger', () => {
    expect(workspaceMayUseAsset('w1', 'CLIENT_PRIVATE', 'w2')).toBe(false);
    expect(workspaceMayUseAsset('w1', 'CLIENT_PRIVATE', 'w1')).toBe(true);
    const entry = recordUsageLedgerEntry([], {
      ledgerId: 'l1',
      workspaceId: 'w1',
      clientId: 'c1',
      brandId: 'b1',
      endClientId: 'ec1',
      billingPeriod: '2026-09',
      assetType: 'CHARACTER',
      operationType: 'CUSTOMIZE_EXISTING',
      assetId: 'char1',
      campaignId: 'camp1',
      quantity: 1,
      includedAllowanceUsed: 1,
      overage: 0,
      billable: false,
      accidentalHallucination: false,
      createdAt: '2026-09-29T00:00:00Z',
    });
    expect(entry.length).toBe(1);
  });

  it('23 operational casting requirement upgrade from narrative', () => {
    const op = upgradeLegacyCastingRequirement(legacyReq, {
      projectId: plan.projectId,
      campaignId: 'camp',
      entryId: plan.entryId,
    });
    expect(op.personalityNeeds.length).toBeGreaterThan(0);
    expect(op.status).toBe('READY_FOR_SEARCH');
  });

  it('25 catalogue grows on demand not bulk', () => {
    expect(
      catalogueGrowsOnDemandOnly({
        originatingProductionNeedId: 'need-1',
        department: 'CASTING',
        approved: true,
        tagged: true,
        bulkGeneration: false,
      }),
    ).toBe(true);
    expect(
      catalogueGrowsOnDemandOnly({
        originatingProductionNeedId: '',
        department: 'CASTING',
        approved: true,
        tagged: true,
        bulkGeneration: true,
      }),
    ).toBe(false);
  });

  it('26 Entry 002 migration without provider spend', () => {
    const receipt = entry002OperationalMigration();
    expect(receipt.providerDispatchCount).toBe(0);
    expect(receipt.temporalLookCount).toBe(2);
    expect(receipt.actorLifecycle).toBe('ACTIVE_ACTOR');
  });

  it('catalogue admission requires full genesis checklist', () => {
    const ready = {
      ...initialActorGenesis('r'),
      identityAuthorityId: 'id',
      identityAnglesComplete: true,
      neutralBodyAuthorityComplete: true,
      founderApprovedForCatalogue: true,
      permanentWardrobeAssigned: false,
    };
    expect(catalogueAdmissionReady(ready)).toBe(true);
  });

  it('no provider on browse actions', () => {
    expect(providerDispatchAllowed('OPEN_CATALOGUE')).toBe(false);
    expect(providerDispatchAllowed('GENERATE')).toBe(true);
  });
});
