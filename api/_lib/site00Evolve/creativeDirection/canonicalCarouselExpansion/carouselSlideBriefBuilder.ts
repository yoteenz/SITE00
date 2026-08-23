/**
 * Build identity-native V2 brief inputs from carousel slide + DNA envelope + world bible.
 * Experiment C slides reuse Experiment B DNA — no Sonnet re-run per slide.
 */

import type {
  CarouselDirectionCarousel,
  CarouselSlideRecord,
  SharedCarouselTopicContext,
} from '../../../../../shared/site00-brand-lore/canonicalCarouselExpansionTypes.js';
import type { DirectionDnaEnvelope } from '../../../../../shared/site00-brand-lore/canonicalCreativeRangeTypes.js';
import { buildDirectionDerivedTypographyRoles } from '../../../../../shared/site00-brand-lore/typographyProvenance.js';
import type { IdentityNativeArtDirection } from '../creativeIntelligence/identityNativeArtDirectionTypes.js';
import type {
  CopyQualityScores,
  CreativeExpressionSystem,
  HeroCreativeConcept,
} from '../creativeIntelligence/creativeExpressionTypes.js';
import type { SequenceCreativeSystem } from '../../../../../shared/site00-brand-lore/sequenceCreative/types.js';
import { buildCarouselSlideSequenceBrief } from '../../../../../shared/site00-brand-lore/sequenceCreative/integration.js';

function nowIso(): string {
  return new Date().toISOString();
}

function fallbackDna(direction: CarouselDirectionCarousel): DirectionDnaEnvelope {
  const wb = direction.worldBible!;
  return {
    directionId: direction.directionId,
    canonicalName: direction.directionName,
    comparisonIndex: direction.comparisonIndex,
    centralThesis: wb.carouselThesis,
    creativePremise: wb.whatTheReaderLearns,
    personalityTranslation: wb.confidenceBehavior,
    emotionalTerritory: wb.emotionalArc,
    socialBehavior: wb.revealBehavior,
    contentBehavior: wb.continuationBehavior,
    visualWorld: wb.visualAnchors[0] ?? direction.directionName,
    visualGrammar: wb.graphicGrammar,
    compositionLogic: wb.compositionSystem,
    typographicAttitude: wb.typographyBehavior,
    typographyRoleBehavior: wb.typographyAnchors[0] ?? 'display hierarchy',
    typographySelectionSource: 'direction',
    typographySelectionReason: 'carousel world bible',
    typographyDerivedFromDirection: true,
    hostTypographyExcluded: true,
    palette: wb.paletteBehavior,
    dominantColor: wb.dominant,
    supportingColors: wb.secondary,
    accentColors: wb.accent,
    colorHierarchy: `${wb.dominant} / ${wb.secondary} / ${wb.accent}`,
    colorBehavior: wb.paletteBehavior,
    paletteSource: 'direction',
    paletteReason: 'carousel world bible',
    paletteDerivedFromDirection: true,
    materialLanguage: wb.artifactBehavior,
    imageLanguage: wb.imageBehavior,
    annotationLanguage: wb.annotationBehavior,
    motionLanguage: 'swipe-native carousel',
    nativeFormat: 'CAROUSEL_SLIDE',
    nativeFormatBehavior: 'One editorial beat per swipe',
    signatureDevices: wb.recurringDevices,
    antiPatterns: wb.whatWouldMakeThisFeelLikeGenericCarouselDesign,
    mustNotResemble: wb.whatWouldMakeThisFeelLikeAnotherDirection,
    personalityLineage: [wb.confidenceBehavior],
    formatLineage: ['CAROUSEL_SLIDE from direction world bible'],
    directionLineage: [direction.directionName],
  };
}

export function buildCarouselSlideArtDirection(params: {
  direction: CarouselDirectionCarousel;
  slide: CarouselSlideRecord;
}): IdentityNativeArtDirection {
  const { direction, slide } = params;
  const dna = direction.dnaEnvelope ?? fallbackDna(direction);
  const wb = direction.worldBible!;
  const id = `carousel-iad-${direction.comparisonIndex}-s${slide.slideNumber}`;

  return {
    artDirectionId: id,
    directionId: direction.directionId,
    directionName: direction.directionName,
    expressionSystemId: `carousel-des-${direction.comparisonIndex}`,
    identityPremise: `${direction.directionName} carousel slide ${slide.slideNumber}: ${slide.slideRole}`,
    proprietaryVisualDNA: [
      dna.visualWorld,
      dna.visualGrammar,
      wb.carouselThesis,
      ...dna.signatureDevices.slice(0, 3),
    ],
    paletteSystem: [
      {
        role: 'dominant',
        colorDescription: dna.dominantColor,
        semanticUse: 'direction anchor across carousel',
        visualDominance: 'dominant',
      },
      {
        role: 'secondary',
        colorDescription: dna.supportingColors,
        semanticUse: 'support surfaces and paper tone',
        visualDominance: 'secondary',
      },
      {
        role: 'accent',
        colorDescription: dna.accentColors,
        semanticUse: 'intervention and emphasis moments',
        visualDominance: 'sparse-accent',
      },
    ],
    typographyBehavior: [
      slide.typography.typographyDevice,
      slide.typography.hierarchyRole,
      slide.typography.whyThisTypographyHere,
      dna.typographicAttitude,
    ],
    imageTreatment: dna.imageLanguage,
    photographicBehavior: 'Custom editorial artwork — not stock documentary photography',
    graphicGrammar: [dna.visualGrammar, wb.graphicGrammar, ...dna.signatureDevices.slice(0, 4)],
    annotationGrammar: [dna.annotationLanguage, wb.annotationBehavior, slide.copy.annotationCopy].filter(Boolean),
    materialBehavior: [dna.materialLanguage, wb.artifactBehavior],
    compositionalBehavior: [slide.compositionMode, dna.compositionLogic, wb.compositionSystem],
    textureBehavior: [wb.imageBehavior, 'direction-native surface treatment'],
    recurringDevices: dna.signatureDevices.length ? dna.signatureDevices : wb.recurringDevices,
    artifactDesignLanguage: `${direction.directionName} editorial artifact — slide role ${slide.slideRole}`,
    topicTransformationRules: wb.argumentProgression,
    customArtworkRequirements: [
      'Carousel-native composition — distinct from preserved cover layout',
      slide.slidePurpose,
      ...wb.restraintRules.slice(0, 2),
    ],
    forbiddenGenericBehaviors: [
      ...dna.antiPatterns,
      'identical layout to slide 01 cover',
      'hook-problem-solution template',
      'stock finance infographic',
    ],
    preOverlayRecognitionCriteria: [
      `Must read as ${direction.directionName} before any overlay`,
      'Direction-native palette and typography',
    ],
    referenceIdentityApplications: [
      {
        referenceId: 'PRESERVED_COVER',
        identityTrait: 'world tone and palette',
        application: 'Influence palette and attitude only — do not clone cover layout',
      },
    ],
    antiExampleCharacteristics: dna.mustNotResemble.length ? dna.mustNotResemble : wb.whatWouldMakeThisFeelLikeGenericCarouselDesign,
    provider: 'carousel-expansion',
    model: 'dna-envelope',
    promptVersion: 'carousel-slide-v1',
    createdAt: nowIso(),
  };
}

export function buildCarouselSlideCreativeExpression(params: {
  direction: CarouselDirectionCarousel;
  slide: CarouselSlideRecord;
}): CreativeExpressionSystem {
  const { direction, slide } = params;
  const wb = direction.worldBible!;
  const typographyRoles = buildDirectionDerivedTypographyRoles({
    typographyIdentityStatus: 'UNRESOLVED',
    provenance: 'DIRECTION_DERIVED',
  });

  return {
    expressionId: `carousel-ces-${direction.comparisonIndex}-s${slide.slideNumber}`,
    directionId: direction.directionId,
    directionName: direction.directionName,
    expressionSystemId: `carousel-des-${direction.comparisonIndex}`,
    artDirectionId: `carousel-iad-${direction.comparisonIndex}-s${slide.slideNumber}`,
    editorialPersonality: wb.confidenceBehavior,
    verbalPersonality: wb.humanityBehavior,
    witMechanics: [wb.witBehavior],
    headlineBehavior: [slide.typography.hierarchyRole],
    microcopyBehavior: [slide.copy.microcopy],
    annotationVoice: slide.copy.annotationCopy ? [slide.copy.annotationCopy] : [],
    typographyPersonality: [slide.typography.typographyDevice],
    compositionPersonality: [slide.compositionMode],
    graphicSurpriseRules: wb.escalationRules,
    secondReadDiscoveryRules: [wb.revealBehavior],
    restraintRules: wb.restraintRules,
    recurringEditorialJokes: [],
    culturalIntelligenceRules: [wb.observationBehavior],
    artifactPersonalityTest: [wb.memorabilityBehavior],
    antiGenericCreativeRules: wb.whatWouldMakeThisFeelLikeGenericCarouselDesign,
    typographyRoles,
    personalityLineage: [],
    formatLineage: [{ upstreamSource: 'carousel', upstreamValue: slide.slideRole, derivedFormatBehavior: slide.slidePurpose, targetFormat: 'CAROUSEL_SLIDE' }],
    provider: 'carousel-expansion',
    model: 'slide-plan',
    promptVersion: 'carousel-slide-v1',
    createdAt: nowIso(),
  };
}

export function buildCarouselSlideHeroConcept(params: {
  direction: CarouselDirectionCarousel;
  slide: CarouselSlideRecord;
  topic: SharedCarouselTopicContext;
}): HeroCreativeConcept {
  const { direction, slide, topic } = params;

  return {
    conceptId: `carousel-hero-${direction.comparisonIndex}-s${slide.slideNumber}`,
    centralEditorialArgument: slide.slidePurpose,
    dominantEvent: slide.slideRole.replace(/_/g, ' '),
    cleanClaim: slide.copy.headline,
    revisionMove: slide.copy.supportingCopy,
    replacementMove: slide.copy.visualPunchline || slide.copy.annotationCopy || topic.challengedClaim,
    marginCounterpoint: slide.copy.annotationCopy || slide.copy.supportingCopy,
    microcopyDiscovery: slide.copy.microcopy,
    evidenceDevice: slide.copy.sourceCopy,
    visualPunchline: slide.copy.visualPunchline || slide.whyThisSlideExists,
    dominantTypeBehavior: slide.typography.typeScaleRole,
    martianMonoApplication: [`SLIDE ${slide.slideNumber} metadata — direction-derived system voice only`],
    graphicInterventions: slide.worldSignals.map((signal) => ({
      device: signal,
      semanticPurpose: slide.slidePurpose,
    })),
    intentionalGridBreak: slide.compositionMode,
    quietZone: slide.compositionMode === 'MINIMAL_QUIET' ? 'Intentional quiet slide' : 'One clear focal hierarchy',
    readingSequence: [slide.copy.headline, slide.copy.supportingCopy, slide.copy.microcopy].filter(Boolean),
    restraintDecision: slide.whyThisSlideExists,
    primaryProofFormat: 'CAROUSEL_SEQUENCE',
  };
}

export function carouselSlideCopyQualityScores(): CopyQualityScores {
  return {
    editorialVoice: 8,
    wit: 7,
    specificity: 8,
    memorability: 7,
    directionFit: 9,
    pass: true,
    reasons: ['Carousel slide plan — copy pre-authored from direction world bible'],
  };
}

/** Merge sequence-native brief for v2+ carousel methodology — never mutates v1 frozen runs. */
export function buildCarouselSlideGenerationPayload(params: {
  direction: CarouselDirectionCarousel;
  slide: CarouselSlideRecord;
  carouselExperimentVersion: string;
  sequenceSystem?: SequenceCreativeSystem | null;
  anchorSlide?: CarouselSlideRecord | null;
  previousSlide?: CarouselSlideRecord | null;
  brandIntelligenceSummary?: string;
}): Record<string, unknown> {
  const artDirection = buildCarouselSlideArtDirection(params);
  const sequenceBrief = buildCarouselSlideSequenceBrief({
    carouselExperimentVersion: params.carouselExperimentVersion,
    sequenceSystem: params.sequenceSystem ?? null,
    direction: params.direction,
    slide: params.slide,
    anchorSlide: params.anchorSlide ?? null,
    previousSlide: params.previousSlide ?? null,
    brandIntelligenceSummary: params.brandIntelligenceSummary,
  });

  return {
    artDirection,
    sequenceCreativeBrief: sequenceBrief,
    carouselExperimentVersion: params.carouselExperimentVersion,
  };
}
