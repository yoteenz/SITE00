/**
 * P0.5E.2 — NDX Book Cultural Language + Content Ontology + Motion Character System (spec).
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  filedNotCanonicalPublicCompletionLanguage,
  evaluateBookLanguageContext,
  platformNativeLabelsPreservedWhenUsabilityRequires,
} from '../site00-studio-world-production/bookLanguage/contextEvaluation.js';
import {
  mapGenericMemoryToBookTerm,
  genericStudioWorldTerminologyRemainsGeneric,
  historicalRecordsUnchanged,
} from '../site00-studio-world-production/bookLanguage/memoryMapping.js';
import { BOOK_LANGUAGE_SYSTEM_IMPLEMENTED } from '../site00-studio-world-production/bookLanguage/constants.js';
import {
  GENERIC_MOTION_CHARACTER_SYSTEM_IMPLEMENTED,
  HUMAN_MOTION_TRACE_SYSTEM_IMPLEMENTED,
  PHYSICAL_BOOK_BEHAVIOR_MODELED,
} from '../site00-studio-world-production/motionCharacter/constants.js';
import {
  buildMotionCharacterSystem,
  motionBehaviorDerivesFromCharacter,
  motionDoesNotDefaultToAnimatedCarousel,
  genericStudioWorldMotionNotHardcodedToNdx,
} from '../site00-studio-world-production/motionCharacter/motionCharacterSystem.js';
import {
  buildHumanMotionTraceSystem,
  failAiPresenter,
  failAnimatedCarousel,
  failFakeHumanImperfection,
  failGenericInfluencer,
  failMotionPoster,
  failStockBrollExplainer,
} from '../site00-studio-world-production/motionCharacter/humanMotionTrace.js';
import {
  evaluatePhysicalBookPresence,
  physicalBookNotMandatoryInEveryReel,
} from '../site00-studio-world-production/motionCharacter/physicalBookBehavior.js';
import {
  AUTONOMOUS_PUBLISHING_ENABLED,
  BRAND_CANON_MUTATED,
  BRAND_CHARACTER_MUTATED,
  CHARACTER_IMAGES_GENERATED,
  CHARACTER_VIDEO_GENERATED,
  COPYRIGHT_CHARACTER_CLONING_BLOCKED,
  CROSS_SURFACE_BOOK_PROGRESSION_IMPLEMENTED,
  EMBODIED_CHARACTER_DISTINCT_FROM_BRAND_CHARACTER,
  EMBODIED_CHARACTER_DISTINCT_FROM_FOUNDER,
  EMBODIED_CHARACTER_VISUAL_DESIGN_FINALIZED,
  EMBODIED_NDX_CHARACTER_FOUNDATION_IMPLEMENTED,
  INSTAGRAM_REEL_BEHAVIOR_IMPLEMENTED,
  NDX_BOOK_CULTURAL_LANGUAGE_IMPLEMENTED,
  NDX_CONTENT_ONTOLOGY_IMPLEMENTED,
  NDX_MOTION_BEHAVIOR_LIBRARY_IMPLEMENTED,
  NDX_MOTION_CHARACTER_SYSTEM_IMPLEMENTED,
  NDX_MOTION_THESIS_IMPLEMENTED,
  PRODUCT_EXPRESSION_IMPLEMENTED,
  READY_FOR_EMBODIED_CHARACTER_DISCOVERY,
  STORY_MARGIN_BEHAVIOR_IMPLEMENTED,
  TIKTOK_BEHAVIOR_IMPLEMENTED,
  WORLD_FORMATION_IMPLEMENTED,
} from '../site00-brand-lore/ndxBookCulturalLanguage/constants.js';
import {
  addItToTheBookSupportsCommunitySubmission,
  buildNdxAudienceBookBehaviors,
  doNotManufactureFakeCommunityBehavior,
} from '../site00-brand-lore/ndxBookCulturalLanguage/audienceBookBehavior.js';
import {
  buildNdxBookCulturalLanguageSystem,
  ndxPublicTerminologyUsesBookMetaphor,
  translateGenericTermToNdxPublic,
} from '../site00-brand-lore/ndxBookCulturalLanguage/culturalLanguageSystem.js';
import {
  buildNdxContentOntology,
  contentLineagePreserved,
  feedBehavesAsPages,
  reelsBehaveAsBookInMotion,
  storiesBehaveAsMargins,
  tiktokBehavesAsSpokenThought,
} from '../site00-brand-lore/ndxBookCulturalLanguage/contentOntology.js';
import {
  crossPlatformDuplicationGuard,
  crossPlatformIntelligenceLineagePreserved,
  reelsAndTikTokNotIdenticalExpressions,
  buildCrossSurfaceBookProgression,
} from '../site00-brand-lore/ndxBookCulturalLanguage/crossSurfaceBookProgression.js';
import {
  genericDomainTypesUnchanged,
  ndxAdapterTranslatesGenericInfrastructure,
  translateGenericMemoryBehavior,
} from '../site00-brand-lore/ndxBookCulturalLanguage/memoryBehaviorAdapter.js';
import {
  filedNotUsedAsPublicCompletionLanguage,
  getTerminologyForensic,
  historicalIdentifiersPreserved,
} from '../site00-brand-lore/ndxBookCulturalLanguage/terminologyForensic.js';
import {
  brandCharacterUnchanged,
  brandCanonUnchanged,
  buildEmbodiedBrandCharacterFoundation,
  copyrightedCharacterCloningBlocked,
  embodiedCharacterDistinctFromBrandCharacter,
  embodiedCharacterDistinctFromFounder,
} from '../site00-brand-lore/ndxMotionCharacter/embodiedBrandCharacterFoundation.js';
import {
  buildEmbodiedCharacterDiscoveryReadiness,
  noCharacterGenerationThisSprint,
  readyForEmbodiedCharacterDiscovery,
} from '../site00-brand-lore/ndxMotionCharacter/embodiedCharacterDiscoveryReadiness.js';
import {
  buildNdxMotionBehaviorLibrary,
  buildNdxMotionCharacterSystem,
  buildNdxMotionThesis,
  motionBehaviorsNotRigidTemplates,
  ndxVideoShowsBookBeingMade,
} from '../site00-brand-lore/ndxMotionCharacter/motionThesisAndBehaviors.js';
import {
  feedPagesBehavior,
  instagramReelBehavior,
  reelsAndTikTokDistinct,
  storyMarginBehavior,
  storiesNotMiniFeedPosts,
  tiktokBehavior,
  tiktokMayPrecedeFinalPage,
} from '../site00-brand-lore/ndxMotionCharacter/platformMotionBehavior.js';
import { buildNdxMotionCharacterBookLanguageRun } from '../site00-brand-lore/ndxMotionCharacter/index.js';
import { REUSE_THINKING_NOT_POSTS_ENFORCED } from '../site00-studio-world-production/dailyPublishingCadence/constants.js';
import {
  instagramReelMustNotDefaultToAnimatedCarousel,
  storiesMustNotBecomeMiniFeedPosts,
} from '../site00-studio-world-production/dailyPublishingCadence/contentSupply.js';
import {
  tiktokDoesNotDefaultToInstagramReelCopy,
} from '../site00-studio-world-production/dailyPublishingCadence/platformQA.js';
import { resetMotionCharacterBookLanguageMemory } from '../../api/_lib/site00Evolve/motionCharacterBookLanguage/motionCharacterBookLanguageMemoryStore.js';
import {
  getMotionCharacterBookLanguageState,
  initializeMotionCharacterBookLanguage,
} from '../../api/_lib/site00Evolve/motionCharacterBookLanguage/motionCharacterBookLanguageService.js';

describe('P0.5E.2 — Book Language + Motion Character System', () => {
  beforeEach(() => {
    resetMotionCharacterBookLanguageMemory();
  });

  it('1. Generic book language system implemented', () => {
    expect(BOOK_LANGUAGE_SYSTEM_IMPLEMENTED).toBe(true);
    expect(GENERIC_MOTION_CHARACTER_SYSTEM_IMPLEMENTED).toBe(true);
  });

  it('2. NDX public terminology uses book metaphor', () => {
    expect(ndxPublicTerminologyUsesBookMetaphor()).toBe(true);
    expect(translateGenericTermToNdxPublic('WatchQueueEntry')).toBe('DOG-EARED');
    expect(translateGenericTermToNdxPublic('EditorialMemoryMatch')).toBe('FLIP BACK');
    expect(translateGenericTermToNdxPublic('SLIDE')).toBe('PAGE');
  });

  it('3. FILED is not canonical public completion language', () => {
    expect(filedNotUsedAsPublicCompletionLanguage()).toBe(true);
    expect(filedNotCanonicalPublicCompletionLanguage()).toBe(true);
    const evalResult = evaluateBookLanguageContext({ term: 'FILED', context: 'PUBLIC_SOCIAL' });
    expect(evalResult.appropriate).toBe(false);
  });

  it('4. BOOKMARKED, FLIP BACK, DOG-EARED, ERRATA, MARGIN NOTE, FOOTNOTE supported', () => {
    const system = buildNdxBookCulturalLanguageSystem('ndxbook');
    expect(system.canonicalTerms).toContain('BOOKMARKED');
    expect(system.canonicalTerms).toContain('FLIP_BACK');
    expect(system.canonicalTerms).toContain('DOG_EARED');
    expect(system.canonicalTerms).toContain('ERRATA');
    expect(system.canonicalTerms).toContain('MARGIN_NOTE');
    expect(system.canonicalTerms).toContain('FOOTNOTE');
  });

  it('5. ADD IT TO THE BOOK supported with organic community behavior', () => {
    expect(addItToTheBookSupportsCommunitySubmission()).toBe(true);
    expect(doNotManufactureFakeCommunityBehavior()).toBe(true);
    const behaviors = buildNdxAudienceBookBehaviors();
    expect(behaviors.some((b) => b.behavior === 'ADD_IT_TO_THE_BOOK')).toBe(true);
  });

  it('6. Generic Studio World terminology remains generic', () => {
    expect(genericStudioWorldTerminologyRemainsGeneric()).toBe(true);
    expect(genericDomainTypesUnchanged()).toBe(true);
    expect(mapGenericMemoryToBookTerm('EDITORIAL_MEMORY')).toBe('THE_INDEX');
  });

  it('7. Historical records unchanged — forensic preserves immutable identifiers', () => {
    expect(historicalRecordsUnchanged()).toBe(true);
    expect(historicalIdentifiersPreserved()).toBe(true);
    const forensic = getTerminologyForensic();
    const caseFile = forensic.find((e) => e.term === 'CASE FILE');
    expect(caseFile?.classification).toBe('HISTORICAL_IMMUTABLE');
    expect(caseFile?.persistedIdentifier).toBe(true);
  });

  it('8. NDX adapter translates generic infrastructure', () => {
    expect(ndxAdapterTranslatesGenericInfrastructure()).toBe(true);
    expect(translateGenericMemoryBehavior('WatchQueueEntry')).toBe('DOG-EARED');
    expect(translateGenericMemoryBehavior('EditorialMemoryMatch')).toBe('FLIP BACK');
  });

  it('9. Content ontology — Feed=Pages, Stories=Margins, Reels=Book in Motion', () => {
    const ontology = buildNdxContentOntology('ndxbook');
    expect(feedBehavesAsPages()).toBe(true);
    expect(storiesBehaveAsMargins()).toBe(true);
    expect(reelsBehaveAsBookInMotion()).toBe(true);
    expect(tiktokBehavesAsSpokenThought()).toBe(true);
    expect(ontology.surfaces.FEED).toBe('THE_PAGES');
    expect(ontology.surfaces.STORIES).toBe('THE_MARGINS');
  });

  it('10. Content lineage preserved WORLD SIGNAL → MEMORY', () => {
    expect(contentLineagePreserved()).toBe(true);
    expect(crossPlatformIntelligenceLineagePreserved()).toBe(true);
  });

  it('11. Cross-surface progression + REUSE_THINKING_NOT_POSTS', () => {
    const progression = buildCrossSurfaceBookProgression();
    expect(progression.reuseThinkingNotPosts).toBe(true);
    expect(progression.flexible).toBe(true);
    expect(REUSE_THINKING_NOT_POSTS_ENFORCED).toBe(true);
    expect(reelsAndTikTokNotIdenticalExpressions()).toBe(true);
    expect(crossPlatformDuplicationGuard()).toBe(true);
  });

  it('12. Motion does not default to animated carousel', () => {
    expect(motionDoesNotDefaultToAnimatedCarousel()).toBe(true);
    expect(failAnimatedCarousel()).toBe(true);
    expect(
      instagramReelMustNotDefaultToAnimatedCarousel({
        id: 'test-reel',
        platform: 'INSTAGRAM',
        surface: 'REEL',
        visualStrategy: 'PROCESS_DOCUMENTATION',
        adaptationReasoning: 'VIDEO_NATIVE art-directed process',
        hook: 'test',
        primaryContentEventId: 'pce-1',
        intelligenceObjectId: 'ci-1',
        pacingProfile: 'DOCUMENTARY',
        emotionalTemperature: 'CURIOUS',
        characterBehaviorMode: 'RABBIT_HOLE',
        status: 'PLANNED',
        fingerprint: 'abc',
      }),
    ).toBe(true);
  });

  it('13. Motion behavior derives from character', () => {
    expect(motionBehaviorDerivesFromCharacter()).toBe(true);
    const system = buildNdxMotionCharacterSystem('ndxbook');
    expect(system.motionMustEmergeFromCharacter).toBe(true);
    expect(system.coreQuestion).toBe('HOW DOES THIS BRAND NATURALLY BEHAVE IN MOTION?');
  });

  it('14. NDX motion thesis — video shows book being made', () => {
    expect(ndxVideoShowsBookBeingMade()).toBe(true);
    const thesis = buildNdxMotionThesis();
    expect(thesis.compressed[0]).toBe('NOTICE');
    expect(thesis.compressed.at(-1)).toBe('DOCUMENT');
  });

  it('15. Motion behavior library — 12 modes, not rigid templates', () => {
    const library = buildNdxMotionBehaviorLibrary();
    expect(library.length).toBe(12);
    expect(motionBehaviorsNotRigidTemplates()).toBe(true);
    expect(library.every((b) => b.failureModes.length > 0)).toBe(true);
  });

  it('16. Platform behavior — Reels ≠ TikTok, Stories as margins', () => {
    expect(instagramReelBehavior()).toBe('ART_DIRECTED_PROCESS_DOCUMENTATION');
    expect(tiktokBehavior()).toBe('CONVERSATIONAL_DISCOVERY');
    expect(storyMarginBehavior()).toBe('THE_MARGINS');
    expect(feedPagesBehavior()).toBe('THE_PAGES');
    expect(reelsAndTikTokDistinct()).toBe(true);
    expect(
      tiktokDoesNotDefaultToInstagramReelCopy(
        {
          id: 'ig-reel',
          platform: 'INSTAGRAM',
          surface: 'REEL',
          hook: 'Art-directed process opening',
          visualStrategy: 'PROCESS_DOCUMENTATION',
          adaptationReasoning: 'REEL',
          primaryContentEventId: 'pce-1',
          intelligenceObjectId: 'ci-1',
          pacingProfile: 'DOCUMENTARY',
          emotionalTemperature: 'CURIOUS',
          characterBehaviorMode: 'RABBIT_HOLE',
          status: 'PLANNED',
          fingerprint: 'ig',
        },
        {
          id: 'tiktok-1',
          platform: 'TIKTOK',
          surface: 'SHORT_FORM',
          hook: 'Wait — I need to tell you what I just noticed',
          visualStrategy: 'CONVERSATIONAL',
          adaptationReasoning: 'TIKTOK',
          primaryContentEventId: 'pce-1',
          intelligenceObjectId: 'ci-1',
          pacingProfile: 'SPONTANEOUS',
          emotionalTemperature: 'CURIOUS',
          characterBehaviorMode: 'I_HAVE_A_THEORY',
          status: 'PLANNED',
          fingerprint: 'tt',
        },
      ),
    ).toBe(true);
    expect(tiktokMayPrecedeFinalPage()).toBe(true);
    expect(storiesNotMiniFeedPosts()).toBe(true);
    expect(
      storiesMustNotBecomeMiniFeedPosts({
        unitId: 'su-1',
        projectId: 'ndxbook',
        date: '2026-08-24',
        purpose: 'LIVE_REACTION',
        originType: 'SPONTANEOUS_STORY',
        primaryContentEventId: 'pce-1',
        hook: 'Margin note — looking into this',
        interactionMechanism: 'POLL_OR_QUESTION',
        status: 'PLANNED',
      }),
    ).toBe(true);
  });

  it('17. Human motion traces + failure modes', () => {
    expect(HUMAN_MOTION_TRACE_SYSTEM_IMPLEMENTED).toBe(true);
    const traces = buildHumanMotionTraceSystem();
    expect(traces.traces.length).toBeGreaterThanOrEqual(10);
    expect(traces.fakeImperfectionBlocked).toBe(true);
    expect(failAiPresenter()).toBe(true);
    expect(failGenericInfluencer()).toBe(true);
    expect(failMotionPoster()).toBe(true);
    expect(failStockBrollExplainer()).toBe(true);
    expect(failFakeHumanImperfection()).toBe(true);
  });

  it('18. Physical book optional — not mandatory every reel', () => {
    expect(PHYSICAL_BOOK_BEHAVIOR_MODELED).toBe(true);
    expect(physicalBookNotMandatoryInEveryReel()).toBe(true);
    const evalStory = evaluatePhysicalBookPresence({ motionMode: 'BE_SERIOUS', platform: 'STORY' });
    expect(evalStory.decision).not.toBe('CENTRAL');
  });

  it('19. Embodied character foundation — distinct from founder and brand character', () => {
    const foundation = buildEmbodiedBrandCharacterFoundation('ndxbook');
    expect(embodiedCharacterDistinctFromFounder()).toBe(true);
    expect(embodiedCharacterDistinctFromBrandCharacter()).toBe(true);
    expect(foundation.distinctFromFounder).toBe(true);
    expect(foundation.distinctFromBrandCharacter).toBe(true);
    expect(foundation.visualDesignFinalized).toBe(false);
    expect(foundation.characterGenerationPerformed).toBe(false);
  });

  it('20. Copyright character cloning blocked', () => {
    expect(copyrightedCharacterCloningBlocked()).toBe(true);
    expect(COPYRIGHT_CHARACTER_CLONING_BLOCKED).toBe(true);
    const foundation = buildEmbodiedBrandCharacterFoundation('ndxbook');
    expect(foundation.prohibitions.length).toBeGreaterThan(0);
  });

  it('21. No character generation this sprint', () => {
    expect(noCharacterGenerationThisSprint()).toBe(true);
    expect(EMBODIED_CHARACTER_VISUAL_DESIGN_FINALIZED).toBe(false);
    expect(CHARACTER_IMAGES_GENERATED).toBe(false);
    expect(CHARACTER_VIDEO_GENERATED).toBe(false);
    const readiness = buildEmbodiedCharacterDiscoveryReadiness();
    expect(readiness.characterImagesGenerated).toBe(false);
    expect(readiness.falCharacterTraining).toBe(false);
  });

  it('22. Ready for embodied character discovery sprint', () => {
    expect(readyForEmbodiedCharacterDiscovery()).toBe(true);
    expect(READY_FOR_EMBODIED_CHARACTER_DISCOVERY).toBe(true);
  });

  it('23. Generic motion system not hardcoded to NDX', () => {
    expect(genericStudioWorldMotionNotHardcodedToNdx()).toBe(true);
    const generic = buildMotionCharacterSystem({
      brandId: 'other-brand',
      behaviorChains: [{ chainId: '1', brandId: 'other-brand', stages: ['A', 'B'], description: 'test' }],
    });
    expect(generic.brandId).toBe('other-brand');
  });

  it('24. Platform-native labels preserved when usability requires', () => {
    expect(platformNativeLabelsPreservedWhenUsabilityRequires()).toBe(true);
    const save = evaluateBookLanguageContext({ term: 'SAVE', context: 'PLATFORM_NATIVE' });
    expect(save.appropriate).toBe(true);
  });

  it('25. Experimental integrity — brand character, canon, P0.5 cadence unchanged', () => {
    expect(brandCharacterUnchanged()).toBe(true);
    expect(brandCanonUnchanged()).toBe(true);
    expect(BRAND_CHARACTER_MUTATED).toBe(false);
    expect(BRAND_CANON_MUTATED).toBe(false);
    expect(PRODUCT_EXPRESSION_IMPLEMENTED).toBe(false);
    expect(WORLD_FORMATION_IMPLEMENTED).toBe(false);
    expect(AUTONOMOUS_PUBLISHING_ENABLED).toBe(false);
  });

  it('26. Full run builder + API service', async () => {
    const run = buildNdxMotionCharacterBookLanguageRun('ndxbook');
    expect(run.runId).toBe('ndxbook-motion-character-book-language');
    expect(run.motionBehaviors.length).toBe(12);
    expect(run.audienceBehaviors.length).toBeGreaterThan(0);

    expect(await getMotionCharacterBookLanguageState({ projectId: 'ndxbook' })).toBeNull();
    const initialized = await initializeMotionCharacterBookLanguage({ projectId: 'ndxbook' });
    expect(initialized.projectId).toBe('ndxbook');
    const stored = await getMotionCharacterBookLanguageState({ projectId: 'ndxbook' });
    expect(stored?.culturalLanguage.canonicalTerms.length).toBeGreaterThan(10);
  });

  it('27. UI route exists at /projects/ndxbook/motion-character', () => {
    const routesSource = readFileSync(join(process.cwd(), 'src/site00/config/routes.ts'), 'utf8');
    expect(routesSource).toContain('/projects/:projectSlug/motion-character');
    const pageSource = readFileSync(join(process.cwd(), 'src/site00/pages/ProjectMotionCharacterPage.tsx'), 'utf8');
    expect(pageSource).toContain('EMBODIED CHARACTER');
    expect(pageSource).toContain('BRAND CHARACTER');
  });

  it('28. Success criteria flags', () => {
    expect(NDX_BOOK_CULTURAL_LANGUAGE_IMPLEMENTED).toBe(true);
    expect(NDX_CONTENT_ONTOLOGY_IMPLEMENTED).toBe(true);
    expect(NDX_MOTION_CHARACTER_SYSTEM_IMPLEMENTED).toBe(true);
    expect(NDX_MOTION_THESIS_IMPLEMENTED).toBe(true);
    expect(NDX_MOTION_BEHAVIOR_LIBRARY_IMPLEMENTED).toBe(true);
    expect(INSTAGRAM_REEL_BEHAVIOR_IMPLEMENTED).toBe(true);
    expect(TIKTOK_BEHAVIOR_IMPLEMENTED).toBe(true);
    expect(STORY_MARGIN_BEHAVIOR_IMPLEMENTED).toBe(true);
    expect(CROSS_SURFACE_BOOK_PROGRESSION_IMPLEMENTED).toBe(true);
    expect(EMBODIED_NDX_CHARACTER_FOUNDATION_IMPLEMENTED).toBe(true);
    expect(EMBODIED_CHARACTER_DISTINCT_FROM_FOUNDER).toBe(true);
    expect(EMBODIED_CHARACTER_DISTINCT_FROM_BRAND_CHARACTER).toBe(true);
  });
});
