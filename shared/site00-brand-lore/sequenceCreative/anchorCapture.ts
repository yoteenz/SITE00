/**
 * Derive Sequence Creative System from Slide 01 / anchor frame.
 */

import type { CarouselSlideRecord, DirectionCarouselWorldBible } from '../canonicalCarouselExpansionTypes.js';
import { SEQUENCE_CREATIVE_METHODOLOGY_VERSION } from './constants.js';
import type { SequenceCreativeSystem } from './types.js';

export type AnchorCaptureInput = {
  sequenceId: string;
  sequenceType: SequenceCreativeSystem['sequenceType'];
  territoryId?: string | null;
  worldExpressionSystemId?: string | null;
  topicId?: string | null;
  topicName?: string | null;
  anchorSlide: CarouselSlideRecord;
  anchorAssetId: string;
  worldBible: DirectionCarouselWorldBible | null;
};

export function captureSequenceCreativeSystemFromAnchor(input: AnchorCaptureInput): SequenceCreativeSystem {
  const wb = input.worldBible;
  const dominant = wb?.dominant ?? 'BLACK';
  const secondary = wb?.secondary ?? 'OFF-WHITE';
  const accent = wb?.accent ?? 'LIME';

  return {
    sequenceCreativeSystemId: `seq-sys-${input.sequenceId}`,
    sequenceId: input.sequenceId,
    sequenceType: input.sequenceType,
    sequenceVersion: 1,
    territoryId: input.territoryId ?? null,
    worldExpressionSystemId: input.worldExpressionSystemId ?? null,
    topicId: input.topicId ?? null,
    topicName: input.topicName ?? null,
    anchorAssetId: input.anchorAssetId,
    anchorFrameIndex: input.anchorSlide.slideNumber,
    allowedPalette: [dominant, secondary, accent, wb?.functionalColors?.[0] ?? 'RED'].filter(Boolean),
    paletteUsageHierarchy: [
      {
        color: dominant,
        role: 'DOMINANT',
        proportionalGuidance: 'Majority field — perceptual anchor of the post',
        narrativePurpose: 'Authority and readability substrate',
      },
      {
        color: secondary,
        role: 'STRUCTURAL_SECONDARY',
        proportionalGuidance: 'Supporting fields and structural blocks',
        narrativePurpose: 'Breathing room and hierarchy separation',
      },
      {
        color: accent,
        role: 'ACCENT',
        proportionalGuidance: 'Sparse signal — not dominant unless deviation planned',
        narrativePurpose: 'Recognition accent established by cover/hook',
      },
    ],
    typographySystem: {
      displayFamily: input.anchorSlide.typography.fontRole || wb?.typographyBehavior || 'display voice from anchor',
      supportFamily: 'supporting editorial voice from world bible',
      metadataFamily: 'system/metadata voice',
      annotationFamily: wb?.annotationBehavior ? 'human annotation voice' : null,
      displayBehavior: input.anchorSlide.typography.typographyDevice || wb?.typographyBehavior || 'anchor-established',
      weightRelationships: 'display heaviest; metadata lightest',
      caseBehavior: 'as established on anchor',
      scaleRatios: input.anchorSlide.typography.typeScaleRole || 'anchor scale relationships',
      trackingBehavior: 'inherit anchor tracking discipline',
      alignmentBehavior: 'inherit anchor alignment grid',
      allowedExceptions: ['role-driven hierarchy shifts per frame — not new families'],
    },
    graphicGrammar: {
      primaryGraphicDevices: wb?.recurringDevices?.slice(0, 3) ?? ['anchor-established devices'],
      secondaryGraphicDevices: wb?.recurringDevices?.slice(3) ?? [],
      deviceFrequency: 'repeat for recognition; omit for variety — not every device every frame',
      lineBehavior: wb?.graphicGrammar ?? 'inherit anchor line language',
      frameBehavior: 'frames follow anchor grammar',
      annotationBehavior: wb?.annotationBehavior ?? 'as anchor',
      shapeLanguage: 'consistent with anchor',
      imageMaskBehavior: 'consistent treatment across sequence',
      textureRules: wb?.paletteBehavior ?? 'material memory from anchor',
    },
    imageTreatment: wb?.imageBehavior ?? input.anchorSlide.compositionMode,
    materialTreatment: wb?.artifactBehavior ?? 'inherit anchor material logic',
    textureBehavior: wb?.paletteBehavior ?? 'inherit anchor texture',
    spacingRhythm: wb?.recurringGridBehavior ?? 'anchor grid rhythm',
    densityProfile: input.anchorSlide.copy.copyPurpose || 'anchor density baseline',
    gridBehavior: wb?.recurringGridBehavior ?? 'anchor grid',
    edgeBehavior: 'consistent bleed/margin behavior from anchor',
    recurringDevices: wb?.recurringDevices ?? [],
    accentFrequency: 'sparse on anchor — accent is signal not field',
    visualTemperature: wb?.confidenceBehavior ?? 'anchor temperature',
    contrastBehavior: wb?.contrastRules ?? 'high legibility',
    brandRecognitionSignals: wb?.visualAnchors ?? [],
    worldRecognitionSignals: wb?.typographyAnchors?.concat(wb?.colorAnchors ?? []) ?? [],
    referenceStrategy: 'IDENTITY_REFERENCE',
    allowedVariation: [
      'compositional role change per frame',
      'hierarchy inversion within type system',
      'density shift with palette hierarchy preserved',
    ],
    prohibitedDrift: [
      'accent becoming dominant without deviation event',
      'new font family mid-sequence',
      'new graphic language mid-sequence',
      'layout clone of anchor slide',
    ],
    plannedDeviations: [],
    methodologyVersion: SEQUENCE_CREATIVE_METHODOLOGY_VERSION,
    createdAt: new Date().toISOString(),
  };
}
