/**
 * P0.5E.4F — Canonical NDX visual identity gate + injection authority + pre-canon block tests.
 */

import { describe, expect, it } from 'vitest';
import {
  approveCanonicalAnchor,
  generateAnchorDependentCharacterBiblePackRound,
  generateCanonicalAnchorRound,
} from '../shared/site00-studio-world-production/characterVisualCasting/identityAnchorCasting.js';
import {
  approveCharacterBibleAssetPack,
} from '../shared/site00-studio-world-production/characterVisualCasting/referenceDrivenCasting.js';
import {
  decomposeFounderCastingReference,
  uploadFounderCastingReference,
} from '../shared/site00-studio-world-production/characterVisualCasting/founderReferenceIngestion.js';
import { buildCharacterTruthSnapshot } from '../shared/site00-studio-world-production/characterVisualCasting/characterTruthSnapshot.js';
import { buildEmptyVisualCastingState } from '../shared/site00-studio-world-production/characterVisualCasting/stateMachine.js';
import { buildNdxFounderCharacterDiscoveryRun } from '../shared/site00-brand-lore/ndxEmbodiedCharacterFounderDiscovery/ndxFounderDiscoveryRun.js';
import {
  autoUnblockPlannedAssetsAfterReadiness,
  buildCharacterAuthorityContext,
  buildCanonicalCharacterVisualAuthority,
  buildCanonicalCharacterVisualVersion,
  buildNdxAssetLineageRecord,
  buildNdxCharacterInjectionForSurface,
  characterTruthDistinctFromVisualReadiness,
  classifyPreCanonAsset,
  compileInjectionPromptSections,
  compileV23PromptWithCharacterAuthority,
  creditUtilizationPlanningAllowedBeforeLock,
  downstreamSystemsCanIndependentlyReinventNdx,
  evaluateCharacterCanonContamination,
  evaluateNDXCharacterTruthReadiness,
  evaluateNDXProductionReadiness,
  evaluateNDXVisualIdentityReadiness,
  evaluatePreCanonCharacterGenerationGuard,
  evaluateProductionCharacterGenerationGuard,
  filmCanPlanBeforeVisualLock,
  historicalAssetAutoPromotedToCanon,
  injectCharacterAuthorityIntoPrompt,
  meetNdxFinalPhotographyBlockedBeforeLock,
  ndxCharacterBehaviorAdapterDriven,
  placeholderCanEnterCharacterCanon,
  preCanonAssetAuditImplemented,
  realismLabPreCanonCannotBecomeNdxCanon,
  requestCharacterInjectionBundle,
  SYSTEM_CHARACTER_AUTHORITY_AUDIT,
  visualIdentityDistinctFromProductionReadiness,
  allowedCharacterVariationModelImplemented,
  variationRuleForDimension,
} from '../shared/site00-studio-world-production/characterAuthority/index.js';
import { assertFilmCharacterGenerationAllowed } from '../shared/site00-studio-world-production/characterAuthority/downstreamIntegration.js';
import { compileFilmShotPrompt } from '../shared/site00-studio-world-production/filmProduction/generation/promptCompiler.js';
import { buildNdxCharacterFilmAuthority } from '../shared/site00-studio-world-production/filmProduction/adapters/ndxbookFilmAdapter.js';
import { buildBrandFilmBible } from '../shared/site00-studio-world-production/filmProduction/authorities/brandFilmBible.js';
import { buildBrandCinematographyBible } from '../shared/site00-studio-world-production/filmProduction/authorities/cinematographyBible.js';
import { evaluateFilmReadiness } from '../shared/site00-studio-world-production/filmProduction/planning/readinessEvaluation.js';
import { dispatchPhotographyGeneration } from '../shared/site00-studio-world-production/founderCreativeIngestion/realismLabBridge.js';
import type { SlideReconstructionSpec } from '../shared/site00-studio-world-production/founderCreativeIngestion/types.js';
import {
  brandCharacterImmutable,
  brandCanonUnchanged,
} from '../api/_lib/site00Evolve/characterContinuity/characterContinuityService.js';

function seedCastingStateWithFullLook() {
  let state = buildEmptyVisualCastingState();
  const snapshot = buildCharacterTruthSnapshot({
    run: buildNdxFounderCharacterDiscoveryRun(),
    version: 1,
    lockedForCasting: true,
  });
  state = {
    ...state,
    visualCastingReady: true,
    founderIKnowHerConfirmed: true,
    characterTruthLockedForCasting: true,
    truthSnapshots: [snapshot],
    activeTruthSnapshotId: snapshot.snapshotId,
  };
  state = uploadFounderCastingReference(state, {
    previewUrl: 'https://example.test/full-look.webp',
    storagePath: 'site00/character-casting-references/ndxbook/full-look.webp',
    role: 'FULL_LOOK',
    label: 'North star full look',
  });
  state = decomposeFounderCastingReference(state, state.founderReferences[0]!.referenceId);
  return { state, snapshot };
}

function seedVisualIdentityReadyState() {
  let { state } = seedCastingStateWithFullLook();
  state = generateCanonicalAnchorRound({ state, falConfigured: false, dispatchFal: false });
  state = approveCanonicalAnchor(state);
  state = generateAnchorDependentCharacterBiblePackRound({ state, falConfigured: false, dispatchFal: false });
  state = approveCharacterBibleAssetPack(state);
  return state;
}

function seedProductionReadyState() {
  return { ...seedVisualIdentityReadyState(), continuityTestReady: true };
}

function minimalSlideSpec(overrides?: Partial<SlideReconstructionSpec>): SlideReconstructionSpec {
  return {
    slideId: 'slide-1',
    sequenceId: 'meet-ndx-intro',
    slideReferenceId: 'ref-1',
    referenceAssetIds: [],
    targetAspectRatio: '4:5',
    targetResolution: '1080x1350',
    copy: { headline: 'Meet NDX', body: '', cta: null, tone: 'editorial' },
    composition: { layout: 'hero', focalPoint: 'center', hierarchy: [] },
    surface: { finish: 'matte', texture: 'paper' },
    typography: { primary: 'serif', secondary: 'sans', scale: 'large' },
    photography: {
      required: true,
      role: 'hero',
      sourceMode: 'GENERATE_FROM_REFERENCE',
      referenceIds: [],
      canonicalAssetId: null,
      reconstructionPrompt: 'NDX portrait',
      promptEditedByFounder: false,
      selectedAssetId: null,
      candidateAssetIds: [],
      lineageAssetIds: [],
    },
    objects: [],
    annotations: [],
    brandSignals: [],
    reconstructionPrompt: 'Meet NDX slide',
    confidence: 0.9,
    founderOverrides: {},
    reviewStatus: 'PENDING',
    productionAssetId: null,
    productionMasterUrl: null,
    layerModel: {
      background: null,
      photograph: null,
      typography: null,
      annotations: null,
      decorativeObjects: null,
      overlays: null,
      texture: null,
    },
    ...overrides,
  };
}

describe('P0.5E.4F character authority + pre-canon generation block', () => {
  it('1. character truth readiness distinct from visual readiness', () => {
    const { state } = seedCastingStateWithFullLook();
    const truth = evaluateNDXCharacterTruthReadiness(state);
    const visual = evaluateNDXVisualIdentityReadiness(state);
    expect(truth.ready).toBe(true);
    expect(visual.ready).toBe(false);
    expect(characterTruthDistinctFromVisualReadiness(truth, visual)).toBe(true);
  });

  it('2. visual readiness distinct from production readiness', () => {
    const state = seedVisualIdentityReadyState();
    const visual = evaluateNDXVisualIdentityReadiness(state);
    const production = evaluateNDXProductionReadiness({ casting: state });
    expect(visual.ready).toBe(true);
    expect(production.readyForStillProduction).toBe(false);
    expect(visualIdentityDistinctFromProductionReadiness(visual, production)).toBe(true);
  });

  it('3. CanonicalCharacterVisualAuthority implemented', () => {
    const state = seedVisualIdentityReadyState();
    const authority = buildCanonicalCharacterVisualAuthority(state);
    expect(authority?.characterId).toBe('ndx');
    expect(authority?.identityLockId).toBeTruthy();
    expect(authority?.wardrobeLockId).toBeTruthy();
  });

  it('4. CharacterInjectionAuthority implemented', () => {
    const state = seedVisualIdentityReadyState();
    const bundle = requestCharacterInjectionBundle({
      request: {
        projectId: 'ndxbook',
        characterId: 'ndx',
        surface: 'CAROUSEL',
        requiresCharacterPhotography: true,
      },
      casting: state,
    });
    expect(bundle?.characterVisualVersion).toMatch(/^NDX_VISUAL_V/);
    expect(bundle?.providerReferencePack.length).toBeGreaterThan(0);
  });

  it('5. CharacterInjectionBundle prompt injection', () => {
    const state = seedVisualIdentityReadyState();
    const bundle = requestCharacterInjectionBundle({
      request: {
        projectId: 'ndxbook',
        characterId: 'ndx',
        surface: 'SLIDE',
        requiresCharacterPhotography: true,
      },
      casting: state,
    })!;
    const prompt = injectCharacterAuthorityIntoPrompt('base prompt', bundle);
    expect(prompt).toContain('CANONICAL CHARACTER INJECTION AUTHORITY');
    expect(compileInjectionPromptSections(bundle).length).toBeGreaterThan(3);
  });

  it('6. pre-canon guard blocks final NDX image generation', () => {
    const { state } = seedCastingStateWithFullLook();
    const guard = evaluatePreCanonCharacterGenerationGuard({
      casting: state,
      surface: 'CAROUSEL',
      requiresCharacterPhotography: true,
      allowReferenceOnly: false,
      allowPlaceholder: false,
    });
    expect(guard.allowed).toBe(false);
    expect(guard.failureCode).toBe('FAIL_CHARACTER_VISUAL_IDENTITY_NOT_READY');
  });

  it('7. planning remains possible before character lock', () => {
    const guard = evaluatePreCanonCharacterGenerationGuard({
      casting: null,
      surface: 'PAGE_ROLE',
      requiresCharacterPhotography: false,
    });
    expect(guard.allowed).toBe(true);
    expect(guard.mode).toBe('REFERENCE_ONLY');
    expect(creditUtilizationPlanningAllowedBeforeLock()).toBe(true);
    expect(filmCanPlanBeforeVisualLock()).toBe(true);
  });

  it('8. placeholder mode does not enter canon', () => {
    expect(placeholderCanEnterCharacterCanon()).toBe(false);
    const eval_ = evaluateCharacterCanonContamination({
      casting: null,
      assetPreviewUrl: '/api/placeholder/casting/1',
      assetClassification: 'PRE_CANON_CHARACTER_PLACEHOLDER',
      usedAsIdentityAuthority: true,
      isStaleCastingCandidate: false,
      isGenericVisualHypothesis: false,
      isPostLockHistoricalReuse: false,
      explicitlyApproved: false,
    });
    expect(eval_.passed).toBe(false);
    expect(eval_.failureCode).toBe('FAIL_PRECANON_CHARACTER_CONTAMINATION');
  });

  it('9. historical generated women do not auto-become character authority', () => {
    const classification = classifyPreCanonAsset({
      isFounderUpload: false,
      isApprovedAnchor: false,
      isApprovedBibleAsset: false,
      isHistoricalCastingRound: true,
      isPlaceholder: false,
      isNegativeEvidence: false,
    });
    expect(classification).toBe('HISTORICAL_EXPLORATION');
    expect(historicalAssetAutoPromotedToCanon(classification)).toBe(false);
  });

  it('10. contamination guard detects pre-canon misuse', () => {
    const eval_ = evaluateCharacterCanonContamination({
      casting: seedCastingStateWithFullLook().state,
      assetPreviewUrl: 'https://example.test/old-candidate.webp',
      assetClassification: 'HISTORICAL_EXPLORATION',
      usedAsIdentityAuthority: true,
      isStaleCastingCandidate: true,
      isGenericVisualHypothesis: false,
      isPostLockHistoricalReuse: false,
      explicitlyApproved: false,
    });
    expect(eval_.passed).toBe(false);
  });

  it('11. visual version persisted on downstream assets via lineage record', () => {
    const state = seedVisualIdentityReadyState();
    const bundle = requestCharacterInjectionBundle({
      request: {
        projectId: 'ndxbook',
        characterId: 'ndx',
        surface: 'MEET_NDX',
        requiresCharacterPhotography: true,
      },
      casting: state,
    })!;
    const lineage = buildNdxAssetLineageRecord({ bundle });
    expect(lineage.characterVisualVersion).toMatch(/^NDX_VISUAL_V/);
    expect(lineage.injectionBundleSnapshot?.bundleId).toBe(bundle.bundleId);
  });

  it('12. carousel generation consumes CharacterInjectionBundle', () => {
    const state = seedVisualIdentityReadyState();
    const result = compileV23PromptWithCharacterAuthority({
      basePrompt: 'carousel hero',
      casting: state,
      projectId: 'ndxbook',
      requiresCharacterPhotography: true,
    });
    expect(result.blocked).toBe(false);
    expect(result.bundle?.characterVisualVersion).toBeTruthy();
    expect(result.prompt).toContain('CANONICAL CHARACTER INJECTION AUTHORITY');
  });

  it('13. founder creative ingestion blocked before lock on generate', () => {
    const spec = minimalSlideSpec();
    expect(() =>
      dispatchPhotographyGeneration({
        spec,
        falConfigured: true,
        dispatchFal: false,
        casting: seedCastingStateWithFullLook().state,
      }),
    ).toThrow(/visual identity is not locked/i);
  });

  it('14. credit utilization can plan before lock but cannot invent NDX', () => {
    expect(creditUtilizationPlanningAllowedBeforeLock()).toBe(true);
    const blocked = compileV23PromptWithCharacterAuthority({
      basePrompt: 'credit slide',
      casting: seedCastingStateWithFullLook().state,
      projectId: 'ndxbook',
      requiresCharacterPhotography: true,
    });
    expect(blocked.bundle).toBeNull();
  });

  it('15. Meet NDX final photography blocked before lock', () => {
    expect(meetNdxFinalPhotographyBlockedBeforeLock(seedCastingStateWithFullLook().state)).toBe(true);
    expect(meetNdxFinalPhotographyBlockedBeforeLock(seedVisualIdentityReadyState())).toBe(false);
  });

  it('16. film planner can plan before lock', () => {
    expect(filmCanPlanBeforeVisualLock()).toBe(true);
    const readiness = evaluateFilmReadiness({
      filmId: 'ndx-reel-01',
      plan: null,
      generationPlan: null,
      hasCharacter: true,
      hasVoice: false,
      storyboardReady: true,
      casting: seedCastingStateWithFullLook().state,
    });
    expect(readiness.checks.StoryboardReady.ready).toBe(true);
  });

  it('17. film generation blocked appropriately', () => {
    const stillGuard = assertFilmCharacterGenerationAllowed({
      casting: seedCastingStateWithFullLook().state,
      requiresMotion: false,
    });
    expect(stillGuard.allowed).toBe(false);
  });

  it('18. still readiness distinct from motion readiness', () => {
    const stillReady = seedVisualIdentityReadyState();
    const productionStill = evaluateNDXProductionReadiness({
      casting: { ...stillReady, continuityTestReady: true },
    });
    const productionMotion = evaluateNDXProductionReadiness({
      casting: { ...stillReady, continuityTestReady: true },
      shortVideoContinuityPass: true,
    });
    expect(productionStill.readyForStillProduction).toBe(true);
    expect(productionStill.readyForMotionProduction).toBe(false);
    expect(productionMotion.readyForMotionProduction).toBe(true);
  });

  it('19. wardrobe continuity IDs consumed downstream', () => {
    const state = seedVisualIdentityReadyState();
    const bundle = requestCharacterInjectionBundle({
      request: { projectId: 'ndxbook', characterId: 'ndx', surface: 'FILM_SCENE', requiresCharacterPhotography: true },
      casting: state,
    })!;
    expect(bundle.wardrobeContinuityId).toBeTruthy();
    expect(bundle.wardrobeReferences.length).toBeGreaterThan(0);
  });

  it('20. HairBeauty authority consumed downstream via injection bundle', () => {
    const state = seedVisualIdentityReadyState();
    const bundle = requestCharacterInjectionBundle({
      request: { projectId: 'ndxbook', characterId: 'ndx', surface: 'EDITORIAL_PHOTO', requiresCharacterPhotography: true },
      casting: state,
    })!;
    expect(bundle.hairReferences.length).toBeGreaterThan(0);
    expect(variationRuleForDimension('HAIR_IDENTITY')?.mode).toBe('LOCKED');
  });

  it('21. environment authority consumed downstream', () => {
    const state = seedVisualIdentityReadyState();
    const bundle = requestCharacterInjectionBundle({
      request: { projectId: 'ndxbook', characterId: 'ndx', surface: 'CAMPAIGN_ARTWORK', requiresCharacterPhotography: true },
      casting: state,
    })!;
    expect(bundle.environmentAuthorityId).toBeTruthy();
  });

  it('22. auto-unblock works after readiness pass', () => {
    const unblock = autoUnblockPlannedAssetsAfterReadiness(true, false);
    expect(unblock.scriptsNeedRebuild).toBe(false);
    expect(unblock.storyboardsNeedRebuild).toBe(false);
    expect(unblock.visualGenerationUnblocked).toBe(true);
  });

  it('23. scripts/storyboards do not need rebuilding after unblock', () => {
    const ctx = buildCharacterAuthorityContext(seedVisualIdentityReadyState());
    const unblock = autoUnblockPlannedAssetsAfterReadiness(ctx.visualIdentityReadiness.ready, ctx.productionReadiness.readyForStillProduction);
    expect(unblock.scriptsNeedRebuild).toBe(false);
    expect(unblock.storyboardsNeedRebuild).toBe(false);
  });

  it('24. Realism Lab pre-canon character cannot become NDX identity evidence', () => {
    expect(realismLabPreCanonCannotBecomeNdxCanon(false, true)).toBe(true);
    expect(realismLabPreCanonCannotBecomeNdxCanon(true, true)).toBe(false);
  });

  it('25. existing historical assets preserved — audit registry non-destructive', () => {
    expect(preCanonAssetAuditImplemented()).toBe(true);
    expect(SYSTEM_CHARACTER_AUTHORITY_AUDIT.length).toBeGreaterThanOrEqual(10);
  });

  it('26. brand character unchanged', () => {
    expect(brandCharacterImmutable()).toBe(true);
  });

  it('27. brand canon unchanged', () => {
    expect(brandCanonUnchanged()).toBe(true);
  });

  it('28. autonomous publishing remains disabled', () => {
    expect(downstreamSystemsCanIndependentlyReinventNdx()).toBe(false);
  });

  it('29. film shot compiler uses injection bundle not manual reconstruction', () => {
    const state = seedVisualIdentityReadyState();
    const bundle = requestCharacterInjectionBundle({
      request: { projectId: 'ndxbook', characterId: 'ndx', surface: 'FILM_SCENE', requiresCharacterPhotography: true },
      casting: state,
    })!;
    const compiled = compileFilmShotPrompt({
      shot: {
        shotId: 's1',
        sceneId: 'sc1',
        shotClass: 'MEDIUM',
        action: 'reads book',
        microAction: 'turns page',
        expression: 'focused',
        gaze: 'down',
        hair: 'should not appear when bundle present',
        wardrobe: 'ndx-working',
        environment: 'studio',
        lighting: 'soft window',
        cameraPosition: 'eye level',
        cameraMovement: 'static',
        lens: '35mm',
        framing: 'medium',
        continuityIn: [],
        continuityOut: [],
        props: ['book'],
        negativeConstraints: [],
        realismRequirements: [],
        dialogue: null,
        sound: 'ambient',
        riskProfile: 'LOW',
      },
      brandBible: buildBrandFilmBible({ brandId: 'ndxbook' }),
      characterAuthority: buildNdxCharacterFilmAuthority(),
      cinematography: buildBrandCinematographyBible({ brandId: 'ndxbook' }),
      environment: null,
      wardrobe: null,
      characterInjectionBundle: bundle,
    });
    expect(compiled.sections.identity).toContain('CANONICAL INJECTION');
    expect(compiled.sections.identity).not.toContain('should not appear when bundle present');
  });

  it('30. canonical visual version + NDX adapter + variation model', () => {
    const state = seedProductionReadyState();
    const version = buildCanonicalCharacterVisualVersion(state);
    expect(version.versionLabel).toMatch(/^NDX_VISUAL_V/);
    expect(allowedCharacterVariationModelImplemented()).toBe(true);
    expect(ndxCharacterBehaviorAdapterDriven()).toBe(true);
    const injection = buildNdxCharacterInjectionForSurface({
      casting: state,
      projectId: 'ndxbook',
      surface: 'MEET_NDX',
      requiresCharacterPhotography: true,
    });
    expect(injection.guard.mode).toBe('PRODUCTION');
    expect(injection.bundle).toBeTruthy();
  });
});
