/**
 * Founder Creative Appetite + Sequence Creative System — methodology tests.
 */

import { describe, expect, it } from 'vitest';
import { synthesizeFounderCreativeAppetiteProfile } from './founderCreativeAppetite/synthesis.js';
import { synthesizeBrandPersonalityProfile } from './personalitySynthesis.js';
import {
  assertCreativeAppetiteNotInjectedIntoFrozenExperiment,
  shouldIncludeCreativeAppetiteInFormation,
  stripCreativeAppetiteFromPayload,
} from './founderCreativeAppetite/experimentExclusion.js';
import { resolveBrandFounderCreativeConflict } from './founderCreativeAppetite/brandConflict.js';
import { buildCoreDirectionFormationInput } from '../../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/formationInputBuilder.js';
import type { BrandLoreProfile } from './types.js';
import { captureSequenceCreativeSystemFromAnchor } from './sequenceCreative/anchorCapture.js';
import {
  detectAccentColorDrift,
  detectResizeOnlySequenceFailure,
  compareFrameToSequenceAnchor,
  detectSlide01Outlier,
} from './sequenceCreative/driftDetection.js';
import { runSequenceCohesionGate, runTypographySequenceRecognitionTest } from './sequenceCreative/cohesionGate.js';
import { compileSequenceFrameBrief, buildRevisionSequenceLockContext } from './sequenceCreative/briefCompiler.js';
import { sequenceReferenceDoesNotRequireLayoutClone } from './sequenceCreative/referenceStrategy.js';
import { buildSequenceLineageExtension, buildCarouselSlideSequenceBrief } from './sequenceCreative/integration.js';
import {
  CAROUSEL_EXPERIMENT_VERSION,
  CAROUSEL_SEQUENCE_METHODOLOGY_VERSION,
  usesSequenceCreativeMethodology,
} from './canonicalCarouselExpansionConstants.js';
import type { CarouselSlideRecord } from './canonicalCarouselExpansionTypes.js';
import { compileCreativeRevision } from './creativeLineage/revisionCompiler.js';
import type { CreativeRevisionSpec } from './creativeLineage/revisionTypes.js';
import type { CreativeAssetRecord } from './creativeLineage/types.js';
import { buildConceptFirstHeroBrief } from '../../api/_lib/site00Evolve/creativeDirection/conceptTerritoryExperiment/experimentDService.js';

function sampleSlide(n: number, overrides: Partial<CarouselSlideRecord> = {}): CarouselSlideRecord {
  return {
    slideNumber: n,
    slideRole: n === 1 ? 'HOOK' : 'EVIDENCE',
    slidePurpose: `Purpose ${n}`,
    readerQuestion: 'Q',
    readerTakeaway: 'T',
    whyThisSlideExists: 'Why',
    relationshipToPreviousSlide: 'prev',
    relationshipToNextSlide: 'next',
    compositionMode: n === 1 ? 'EDITORIAL_SPLIT' : `MODE_${n}`,
    copy: {
      headline: `Headline ${n}`,
      supportingCopy: 'support',
      microcopy: 'micro',
      annotationCopy: '',
      sourceCopy: '',
      visualPunchline: '',
      copyPurpose: 'inform',
    },
    typography: {
      fontRole: 'DISPLAY',
      typographyDevice: 'condensed',
      hierarchyRole: 'headline',
      typeScaleRole: 'large',
      whyThisTypographyHere: 'anchor',
    },
    colorLogic: n === 1 ? 'LIME sparse accent' : 'LIME dominant field full-bleed',
    worldSignals: n === 1 ? ['sparse lime accent'] : ['lime dominant hero field'],
    visualBrief: null,
    asset: null,
    generationReceipt: null,
    preserved: n === 1,
    idempotencyKey: `slide-${n}`,
    founderJudgment: null,
    ...overrides,
  };
}

function minimalProfile(overrides: Partial<BrandLoreProfile> = {}): BrandLoreProfile {
  return {
    id: 'profile-1',
    organizationId: 'org-1',
    projectId: 'ndxbook',
    sourceIntakeId: 'intake-1',
    sourceIntakeType: 'IDENTITY',
    brandWorld: { value: 'world', classification: 'SYNTHESIZED', confidence: 'HIGH', sourceAnswerIds: [], sourceType: 'IDENTITY_LORE', founderConfirmationState: 'PENDING', updatedAt: '' },
    audienceRelationship: { value: [], classification: 'SYNTHESIZED', confidence: 'HIGH', sourceAnswerIds: [], sourceType: 'IDENTITY_LORE', founderConfirmationState: 'PENDING', updatedAt: '' },
    brandBelief: { value: null, classification: 'SYNTHESIZED', confidence: 'NONE', sourceAnswerIds: [], sourceType: 'IDENTITY_LORE', founderConfirmationState: 'PENDING', updatedAt: '' },
    culturalOpposition: { value: [], classification: 'SYNTHESIZED', confidence: 'HIGH', sourceAnswerIds: [], sourceType: 'IDENTITY_LORE', founderConfirmationState: 'PENDING', updatedAt: '' },
    coreObsessions: { value: null, classification: 'SYNTHESIZED', confidence: 'NONE', sourceAnswerIds: [], sourceType: 'IDENTITY_LORE', founderConfirmationState: 'PENDING', updatedAt: '' },
    emotionalPromise: { value: [], classification: 'SYNTHESIZED', confidence: 'HIGH', sourceAnswerIds: [], sourceType: 'IDENTITY_LORE', founderConfirmationState: 'PENDING', updatedAt: '' },
    creativeTensions: { value: [], classification: 'SYNTHESIZED', confidence: 'HIGH', sourceAnswerIds: [], sourceType: 'IDENTITY_LORE', founderConfirmationState: 'PENDING', updatedAt: '' },
    worldMetaphor: { value: null, classification: 'SYNTHESIZED', confidence: 'NONE', sourceAnswerIds: [], sourceType: 'IDENTITY_LORE', founderConfirmationState: 'PENDING', updatedAt: '' },
    materialVocabulary: { value: [], classification: 'SYNTHESIZED', confidence: 'HIGH', sourceAnswerIds: [], sourceType: 'IDENTITY_LORE', founderConfirmationState: 'PENDING', updatedAt: '' },
    symbolicVocabulary: { value: [], classification: 'SYNTHESIZED', confidence: 'HIGH', sourceAnswerIds: [], sourceType: 'IDENTITY_LORE', founderConfirmationState: 'PENDING', updatedAt: '' },
    referenceLineage: { value: null, classification: 'SYNTHESIZED', confidence: 'NONE', sourceAnswerIds: [], sourceType: 'IDENTITY_LORE', founderConfirmationState: 'PENDING', updatedAt: '' },
    currentReferenceSignals: { value: null, classification: 'SYNTHESIZED', confidence: 'NONE', sourceAnswerIds: [], sourceType: 'IDENTITY_LORE', founderConfirmationState: 'PENDING', updatedAt: '' },
    authenticLanguageSamples: { value: [], classification: 'SYNTHESIZED', confidence: 'HIGH', sourceAnswerIds: [], sourceType: 'IDENTITY_LORE', founderConfirmationState: 'PENDING', updatedAt: '' },
    antiLanguage: { value: [], classification: 'SYNTHESIZED', confidence: 'HIGH', sourceAnswerIds: [], sourceType: 'IDENTITY_LORE', founderConfirmationState: 'PENDING', updatedAt: '' },
    socialSignal: { value: null, classification: 'SYNTHESIZED', confidence: 'NONE', sourceAnswerIds: [], sourceType: 'IDENTITY_LORE', founderConfirmationState: 'PENDING', updatedAt: '' },
    audienceRitual: { value: [], classification: 'SYNTHESIZED', confidence: 'HIGH', sourceAnswerIds: [], sourceType: 'IDENTITY_LORE', founderConfirmationState: 'PENDING', updatedAt: '' },
    memoryGoal: { value: null, classification: 'SYNTHESIZED', confidence: 'NONE', sourceAnswerIds: [], sourceType: 'IDENTITY_LORE', founderConfirmationState: 'PENDING', updatedAt: '' },
    desiredMythology: { value: null, classification: 'SYNTHESIZED', confidence: 'NONE', sourceAnswerIds: [], sourceType: 'IDENTITY_LORE', founderConfirmationState: 'PENDING', updatedAt: '' },
    futureWorld: { value: null, classification: 'SYNTHESIZED', confidence: 'NONE', sourceAnswerIds: [], sourceType: 'IDENTITY_LORE', founderConfirmationState: 'PENDING', updatedAt: '' },
    creativeAntiPatterns: { value: [], classification: 'SYNTHESIZED', confidence: 'HIGH', sourceAnswerIds: [], sourceType: 'IDENTITY_LORE', founderConfirmationState: 'PENDING', updatedAt: '' },
    signatureDeviceSeeds: { value: null, classification: 'SYNTHESIZED', confidence: 'NONE', sourceAnswerIds: [], sourceType: 'IDENTITY_LORE', founderConfirmationState: 'PENDING', updatedAt: '' },
    rawLoreAnswers: {},
    referenceEvidence: [],
    contextClassification: 'SOCIAL_FIRST_EDITORIAL',
    readinessState: 'READY',
    readinessMissingDomains: [],
    profileVersion: 1,
    createdAt: '',
    updatedAt: '',
    ...overrides,
  };
}

describe('Founder Creative Appetite + Sequence Creative System', () => {
  it('CREATIVE_APPETITE_IS_NOT_BRAND_PERSONALITY_TEST', () => {
    const appetite = synthesizeFounderCreativeAppetiteProfile({
      organizationId: 'org-1',
      appetiteAnswers: { 'creative-risk': 'open' },
    });
    const personality = synthesizeBrandPersonalityProfile({
      personalityAnswers: { 'social-instinct': ['needs-clarity'] },
    });
    expect(appetite.profileVersion).toContain('CREATIVE_APPETITE');
    expect(personality.profileVersion).not.toContain('CREATIVE_APPETITE');
    expect(appetite.creativeRiskTolerance.value).toBe('OPEN');
    expect(personality.socialInstinct.value).toBeTruthy();
  });

  it('CREATIVE_APPETITE_IS_NOT_VISUAL_CANON_TEST', () => {
    const appetite = synthesizeFounderCreativeAppetiteProfile({
      appetiteAnswers: { 'visual-experimentation': 'high' },
    });
    expect(appetite.visualExperimentationTolerance.value).toBe('HIGH_EXPERIMENTATION');
    expect(appetite).not.toHaveProperty('paletteSystem');
    expect(appetite).not.toHaveProperty('typographySystem');
  });

  it('CREATIVE_APPETITE_CURRENT_NDX_EXPERIMENT_EXCLUSION_TEST', () => {
    expect(
      shouldIncludeCreativeAppetiteInFormation({
        experimentId: 'ndxbook-six-concept-hero-range',
        intelligenceSnapshotVersion: 1,
      }),
    ).toBe(false);
  });

  it('CREATIVE_APPETITE_SERIALIZED_PAYLOAD_CONTAMINATION_TEST', () => {
    const clean = JSON.stringify({ role: 'CONCEPT_TERRITORY_HERO', topic: 'CREDIT' });
    expect(() => assertCreativeAppetiteNotInjectedIntoFrozenExperiment(clean)).not.toThrow();
    const dirty = JSON.stringify({
      concept_territory_hero: true,
      founderCreativeAppetite: { creativeRiskTolerance: 'HIGH' },
    });
    expect(() => assertCreativeAppetiteNotInjectedIntoFrozenExperiment(dirty)).toThrow(
      /CREATIVE_APPETITE_CONTAMINATION/,
    );
  });

  it('FUTURE_EXPERIMENT_CREATIVE_APPETITE_INHERITANCE_TEST', () => {
    const profile = minimalProfile({
      founderCreativeAppetite: synthesizeFounderCreativeAppetiteProfile({
        organizationId: 'org-1',
        appetiteAnswers: { 'creative-risk': 'adventurous' },
      }),
    });
    const input = buildCoreDirectionFormationInput({
      profile,
      intelligenceSnapshotVersion: 2,
      experimentId: 'future-experiment',
    });
    expect(input.founderCreativeAppetiteSummary).toContain('creative-risk');
    expect(input.creativeAppetiteFingerprint).toBeTruthy();
  });

  it('BRAND_OVERRIDES_FOUNDER_TASTE_CONFLICT_TEST', () => {
    const personality = synthesizeBrandPersonalityProfile({
      personalityAnswers: { 'social-instinct': ['needs-clarity'] },
    });
    personality.restraintBehavior.value = ['quiet authority'];
    personality.edgeBehavior.value = 'authority';
    const profile = minimalProfile({
      brandPersonality: personality,
      founderCreativeAppetite: synthesizeFounderCreativeAppetiteProfile({
        appetiteAnswers: {
          'density-vs-restraint': 'high',
          'visual-experimentation': 'high',
        },
      }),
    });
    const resolution = resolveBrandFounderCreativeConflict({
      profile,
      appetite: profile.founderCreativeAppetite!,
    });
    expect(resolution.resolution).toBe('BRAND_WINS');
  });

  it('SEQUENCE_CREATIVE_SYSTEM_CREATED_TEST', () => {
    const anchor = sampleSlide(1);
    const system = captureSequenceCreativeSystemFromAnchor({
      sequenceId: 'seq-1',
      sequenceType: 'CAROUSEL',
      anchorSlide: anchor,
      anchorAssetId: 'asset-01',
      worldBible: {
        directionId: 'dir-1',
        directionName: 'THE LEDGER',
        carouselThesis: 'thesis',
        whatTheReaderLearns: 'learn',
        emotionalArc: 'arc',
        editorialArc: 'arc',
        whyThisDirectionNeedsMultipleSlides: 'why',
        coverBehavior: 'cover',
        continuationBehavior: 'cont',
        evidenceBehavior: 'ev',
        transitionBehavior: 'tr',
        revealBehavior: 'rev',
        payoffBehavior: 'pay',
        argumentProgression: 'arg',
        confidenceBehavior: 'confident',
        humanityBehavior: 'human',
        witBehavior: 'wit',
        observationBehavior: 'obs',
        memorabilityBehavior: 'mem',
        escalationRules: 'esc',
        restraintRules: 'restraint',
        dominant: 'BLACK',
        secondary: 'OFF-WHITE',
        accent: 'LIME',
        functionalColors: ['RED'],
        paletteBehavior: 'disciplined',
        typographyBehavior: 'editorial',
        typographyAnchors: ['condensed display'],
        colorAnchors: ['black field'],
        visualAnchors: ['grid'],
        graphicGrammar: 'lines',
        compositionSystem: 'grid',
        imageBehavior: 'illustration',
        artifactBehavior: 'paper',
        annotationBehavior: 'margin notes',
        recurringDevices: ['rules', 'frames'],
        recurringGridBehavior: '8-col',
        whatWouldMakeThisFeelLikeGenericCarouselDesign: ['template'],
        whatWouldMakeThisFeelLikeAnotherDirection: ['clone'],
        contrastRules: 'high',
      },
    });
    expect(system.sequenceCreativeSystemId).toContain('seq-sys-');
    expect(system.paletteUsageHierarchy.some((p) => p.role === 'ACCENT')).toBe(true);
  });

  it('SLIDE_01_ANCHOR_CAPTURE_TEST', () => {
    const system = captureSequenceCreativeSystemFromAnchor({
      sequenceId: 'seq-anchor',
      sequenceType: 'CAROUSEL',
      anchorSlide: sampleSlide(1),
      anchorAssetId: 'anchor-asset',
      worldBible: null,
    });
    expect(system.anchorFrameIndex).toBe(1);
    expect(system.anchorAssetId).toBe('anchor-asset');
    expect(system.referenceStrategy).toBe('IDENTITY_REFERENCE');
  });

  it('PALETTE_USAGE_HIERARCHY_TEST', () => {
    const system = captureSequenceCreativeSystemFromAnchor({
      sequenceId: 'seq-palette',
      sequenceType: 'CAROUSEL',
      anchorSlide: sampleSlide(1),
      anchorAssetId: 'a1',
      worldBible: null,
    });
    const accent = system.paletteUsageHierarchy.find((p) => p.color === 'LIME');
    expect(accent?.role).toBe('ACCENT');
    expect(accent?.proportionalGuidance.toLowerCase()).toContain('sparse');
  });

  it('ACCENT_COLOR_DRIFT_TEST', () => {
    const anchor = sampleSlide(1, { colorLogic: 'LIME sparse accent signal' });
    const slide2 = sampleSlide(2, { colorLogic: 'LIME dominant full-bleed field' });
    const system = captureSequenceCreativeSystemFromAnchor({
      sequenceId: 'seq-drift',
      sequenceType: 'CAROUSEL',
      anchorSlide: anchor,
      anchorAssetId: 'a1',
      worldBible: null,
    });
    const warnings = detectAccentColorDrift({
      anchorSlide: anchor,
      subsequentSlides: [slide2],
      sequenceSystem: system,
    });
    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings[0]).toMatch(/DRIFT_WARNING/);
  });

  it('TYPOGRAPHY_SEQUENCE_RECOGNITION_TEST', () => {
    const slides = [sampleSlide(1), sampleSlide(2), sampleSlide(3)];
    expect(runTypographySequenceRecognitionTest(slides)).toBe(true);
  });

  it('GRAPHIC_GRAMMAR_CONTINUITY_TEST', () => {
    const system = captureSequenceCreativeSystemFromAnchor({
      sequenceId: 'seq-grammar',
      sequenceType: 'CAROUSEL',
      anchorSlide: sampleSlide(1),
      anchorAssetId: 'a1',
      worldBible: null,
    });
    expect(system.graphicGrammar.primaryGraphicDevices.length).toBeGreaterThan(0);
    expect(system.prohibitedDrift).toContain('new graphic language mid-sequence');
  });

  it('COMPOSITIONAL_VARIETY_TEST', () => {
    const slides = [sampleSlide(1), sampleSlide(2), sampleSlide(3)];
    const system = captureSequenceCreativeSystemFromAnchor({
      sequenceId: 'seq-variety',
      sequenceType: 'CAROUSEL',
      anchorSlide: slides[0]!,
      anchorAssetId: 'a1',
      worldBible: null,
    });
    const report = runSequenceCohesionGate({ sequenceSystem: system, slides, visionAvailable: false });
    const variety = report.dimensions.find((d) => d.dimension === 'COMPOSITIONAL_VARIETY');
    expect(variety?.result).toBe('PASS');
  });

  it('RESIZE_ONLY_SEQUENCE_FAILURE_TEST', () => {
    const slides = [
      sampleSlide(1, { compositionMode: 'SAME', slideRole: 'HOOK' }),
      sampleSlide(2, { compositionMode: 'SAME', slideRole: 'HOOK' }),
      sampleSlide(3, { compositionMode: 'SAME', slideRole: 'HOOK' }),
    ];
    expect(detectResizeOnlySequenceFailure(slides)).toBe(true);
  });

  it('CONTROLLED_DEVIATION_TEST', () => {
    const system = captureSequenceCreativeSystemFromAnchor({
      sequenceId: 'seq-dev',
      sequenceType: 'CAROUSEL',
      anchorSlide: sampleSlide(1),
      anchorAssetId: 'a1',
      worldBible: null,
    });
    system.plannedDeviations.push({
      frameIndex: 5,
      propertyBeingBroken: 'accent dominance',
      baselineBehavior: 'sparse accent',
      deviation: 'full lime field',
      narrativeReason: 'argument flip',
      returnBehavior: 'return to baseline',
      intentionality: 'DELIBERATE',
    });
    const comparison = compareFrameToSequenceAnchor({
      frameIndex: 5,
      slide: sampleSlide(5, { colorLogic: 'LIME dominant full-bleed' }),
      anchorSlide: sampleSlide(1),
      sequenceSystem: system,
      deviation: system.plannedDeviations[0],
    });
    expect(comparison.result).toBe('CONSISTENT_WITH_INTENTIONAL_VARIATION');
  });

  it('UNEXPLAINED_DEVIATION_FAILURE_TEST', () => {
    const system = captureSequenceCreativeSystemFromAnchor({
      sequenceId: 'seq-unexplained',
      sequenceType: 'CAROUSEL',
      anchorSlide: sampleSlide(1),
      anchorAssetId: 'a1',
      worldBible: null,
    });
    system.plannedDeviations.push({
      frameIndex: 4,
      propertyBeingBroken: 'accent',
      baselineBehavior: 'sparse',
      deviation: 'dominant',
      narrativeReason: '',
      returnBehavior: '',
      intentionality: 'UNEXPLAINED',
    });
    const report = runSequenceCohesionGate({
      sequenceSystem: system,
      slides: [sampleSlide(1), sampleSlide(2), sampleSlide(3)],
      visionAvailable: false,
    });
    const dim = report.dimensions.find((d) => d.dimension === 'CONTROLLED_DEVIATION_VALIDITY');
    expect(dim?.result).toBe('FAIL');
  });

  it('SLIDE_01_OUTLIER_TEST', () => {
    const anchor = sampleSlide(1, { compositionMode: 'UNIQUE' });
    const rest = [
      sampleSlide(2, { compositionMode: 'SHARED' }),
      sampleSlide(3, { compositionMode: 'SHARED' }),
    ];
    expect(detectSlide01Outlier({ anchorSlide: anchor, subsequentSlides: rest })).toBe(true);
  });

  it('SEQUENCE_REFERENCE_DOES_NOT_REQUIRE_LAYOUT_CLONE_TEST', () => {
    expect(sequenceReferenceDoesNotRequireLayoutClone()).toBe(true);
    const system = captureSequenceCreativeSystemFromAnchor({
      sequenceId: 'seq-ref',
      sequenceType: 'CAROUSEL',
      anchorSlide: sampleSlide(1),
      anchorAssetId: 'a1',
      worldBible: null,
    });
    const brief = compileSequenceFrameBrief({
      sequenceSystem: system,
      frameContext: {
        frameIndex: 2,
        frameRole: 'EVIDENCE',
        sequenceCreativeSystemId: system.sequenceCreativeSystemId,
        anchorSummary: 'anchor',
        previousFrameSummary: null,
        controlledDeviation: null,
      },
    });
    expect(JSON.stringify(brief)).toContain('Do not copy Slide 01 composition');
  });

  it('SINGLE_FRAME_REVISION_PRESERVES_SEQUENCE_TEST', () => {
    const system = captureSequenceCreativeSystemFromAnchor({
      sequenceId: 'seq-rev',
      sequenceType: 'CAROUSEL',
      anchorSlide: sampleSlide(1),
      anchorAssetId: 'a1',
      worldBible: null,
    });
    const lock = buildRevisionSequenceLockContext(system);
    expect(lock.preserveSequenceIdentity).toBe(true);
    const parent: CreativeAssetRecord = {
      assetId: 'parent-1',
      orgId: 'org',
      projectId: 'ndxbook',
      brandSlug: 'ndxbook',
      brandDisplayName: 'NDXBOOK',
      assetType: 'CAROUSEL_SLIDE',
      sourceType: 'GENERATED',
      creativeStage: 'VALIDATION',
      directionLineage: {} as never,
      contentLineage: { slideNumber: 4, format: 'CAROUSEL_SEQUENCE' } as never,
      intelligenceLineage: {} as never,
      generationLineage: {} as never,
      reviewState: 'PENDING',
      creativeValue: 'UNKNOWN',
      productionState: 'EXPERIMENTAL',
      productionDestiny: null,
      reuseState: 'REUSABLE_WITH_ADAPTATION',
      canonStatus: 'DIRECTION_CANON',
      relationship: { parentAssetId: null, derivedAssetIds: [], adaptationType: null },
      creativeFamilyId: null,
      brandCanonVersionAtGeneration: 1,
      contentCanonVersionAtGeneration: 1,
      founderNotes: null,
      internalNotes: null,
      salvageClassification: null,
      publishingReadiness: null,
      historicalSourceRef: null,
      immutable: true,
      brandLineageMembership: 'ACTIVE',
      excludedFromBrandAt: null,
      crossBrandPortable: false,
      ideaPortabilityEligible: false,
      exactAssetCrossBrandReuse: false,
      launchSeedReviewRequired: false,
      revisionPending: false,
      brandDisposition: 'IN_BRAND_LIBRARY',
      crossBrandReuseEligibility: 'NOT_EVALUATED',
      rootAssetId: null,
      revisionNumber: 0,
      currentRevisionId: null,
      createdAt: '',
      updatedAt: '',
    };
    const spec: CreativeRevisionSpec = {
      parentAssetId: 'parent-1',
      severity: 'TARGETED',
      lockedElements: ['COMPOSITION'],
      mutableElements: ['COLOR'],
      elementStates: {},
      categoryNotes: { color: 'reduce lime dominance' },
      preserveUnspecified: true,
      requestedCopyChanges: [],
      requestedColorChanges: [],
      requestedTypographyChanges: [],
      requestedAssetExchange: [],
      founderOriginalNote: '',
    };
    const brief = compileCreativeRevision(spec, {
      parentAsset: parent,
      directionName: 'THE LEDGER',
      worldId: 'world-1',
      sequenceLockContext: lock,
    });
    expect(brief.deltaPrompt).toContain('SEQUENCE IDENTITY LOCK');
  });

  it('SEQUENCE_LINEAGE_PERSISTENCE_TEST', () => {
    const system = captureSequenceCreativeSystemFromAnchor({
      sequenceId: 'seq-lineage',
      sequenceType: 'CAROUSEL',
      anchorSlide: sampleSlide(2),
      anchorAssetId: 'anchor',
      worldBible: null,
    });
    const lineage = buildSequenceLineageExtension({
      sequenceSystem: system,
      slide: sampleSlide(2),
      anchorAssetId: 'anchor',
    });
    expect(lineage.frameIndex).toBe(2);
    expect(lineage.sequenceCreativeSystemId).toBe(system.sequenceCreativeSystemId);
  });

  it('VISION_UNAVAILABLE_RETURNS_NOT_EVALUATED_TEST', () => {
    const system = captureSequenceCreativeSystemFromAnchor({
      sequenceId: 'seq-vision',
      sequenceType: 'CAROUSEL',
      anchorSlide: sampleSlide(1, { colorLogic: 'neutral palette' }),
      anchorAssetId: 'a1',
      worldBible: null,
    });
    const report = runSequenceCohesionGate({
      sequenceSystem: system,
      slides: [
        sampleSlide(1, { colorLogic: 'neutral palette' }),
        sampleSlide(2, { colorLogic: 'neutral palette', compositionMode: 'MODE_B' }),
      ],
      visionAvailable: false,
    });
    expect(report.dimensions.some((d) => d.result === 'NOT_EVALUATED')).toBe(true);
    expect(report.visionEvaluated).toBe(false);
  });

  it('HISTORICAL_SEQUENCE_VERSION_PRESERVATION_TEST', () => {
    expect(usesSequenceCreativeMethodology(CAROUSEL_EXPERIMENT_VERSION)).toBe(false);
    expect(usesSequenceCreativeMethodology(CAROUSEL_SEQUENCE_METHODOLOGY_VERSION)).toBe(true);
    expect(
      buildCarouselSlideSequenceBrief({
        carouselExperimentVersion: CAROUSEL_EXPERIMENT_VERSION,
        sequenceSystem: null,
        direction: { directionName: 'X', worldBible: null } as never,
        slide: sampleSlide(2),
        anchorSlide: sampleSlide(1),
        previousSlide: null,
      }),
    ).toBeNull();
  });

  it('experiment D hero brief passes contamination assertion', () => {
    const brief = buildConceptFirstHeroBrief({
      comparisonIndex: 1,
      directionName: 'THE LEDGER',
      territory: {
        directionName: 'THE LEDGER',
        forbiddenSignals: [],
      } as never,
      expressionSystem: {
        typographySystem: 'type',
        paletteSystem: 'palette',
        materialSystem: 'mat',
        imagerySystem: 'img',
        compositionSystem: 'comp',
        graphicGrammar: 'grammar',
        nativeProofFormat: 'CAROUSEL',
        forbiddenSiblingBehaviors: [],
      } as never,
      previousMethodologyHeroStoragePath: null,
      heroAsset: null,
      generationReceipt: null,
      founderJudgment: null,
      tooCloseSibling: null,
    });
    expect(() => assertCreativeAppetiteNotInjectedIntoFrozenExperiment(JSON.stringify(brief))).not.toThrow();
    expect(stripCreativeAppetiteFromPayload({ ...brief, founderCreativeAppetite: {} })).not.toHaveProperty(
      'founderCreativeAppetite',
    );
  });
});
