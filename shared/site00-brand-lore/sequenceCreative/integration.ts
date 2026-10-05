/**
 * Sequence Creative System — carousel and multi-frame integration helpers.
 */

import type {
  CarouselDirectionCarousel,
  CarouselSlideRecord,
} from '../canonicalCarouselExpansionTypes.js';
import { usesSequenceCreativeMethodology } from '../canonicalCarouselExpansionConstants.js';
import { captureSequenceCreativeSystemFromAnchor } from './anchorCapture.js';
import { compileSequenceFrameBrief } from './briefCompiler.js';
import { runSequenceCohesionGate } from './cohesionGate.js';
import type { SequenceCreativeSystem, SequenceLineageExtension } from './types.js';
import type { FrameRole } from './constants.js';
import { FRAME_ROLES } from './constants.js';

export function mapSlideRoleToFrameRole(slideRole: string): FrameRole {
  const normalized = slideRole.toUpperCase().replace(/\s+/g, '_') as FrameRole;
  if ((FRAME_ROLES as readonly string[]).includes(normalized)) return normalized;
  return 'OTHER';
}

export function resolveOrCreateSequenceCreativeSystem(params: {
  sequenceId: string;
  direction: CarouselDirectionCarousel;
  anchorSlide: CarouselSlideRecord;
  anchorAssetId: string;
  topicId?: string | null;
  topicName?: string | null;
  existing?: SequenceCreativeSystem | null;
}): SequenceCreativeSystem {
  if (params.existing) return params.existing;
  return captureSequenceCreativeSystemFromAnchor({
    sequenceId: params.sequenceId,
    sequenceType: 'CAROUSEL',
    territoryId: params.direction.directionId,
    worldExpressionSystemId: `carousel-des-${params.direction.comparisonIndex}`,
    topicId: params.topicId ?? null,
    topicName: params.topicName ?? null,
    anchorSlide: params.anchorSlide,
    anchorAssetId: params.anchorAssetId,
    worldBible: params.direction.worldBible,
  });
}

export function buildSequenceLineageExtension(params: {
  sequenceSystem: SequenceCreativeSystem;
  slide: CarouselSlideRecord;
  anchorAssetId: string;
  cohesionStatus?: SequenceLineageExtension['cohesionStatus'];
  intentionalDeviation?: boolean;
}): SequenceLineageExtension {
  return {
    sequenceId: params.sequenceSystem.sequenceId,
    sequenceType: params.sequenceSystem.sequenceType,
    sequenceVersion: params.sequenceSystem.sequenceVersion,
    sequenceCreativeSystemId: params.sequenceSystem.sequenceCreativeSystemId,
    frameIndex: params.slide.slideNumber,
    frameRole: mapSlideRoleToFrameRole(params.slide.slideRole),
    anchorAssetId: params.anchorAssetId,
    parentConceptTerritoryId: params.sequenceSystem.territoryId,
    worldExpressionSystemId: params.sequenceSystem.worldExpressionSystemId,
    intentionalDeviation: params.intentionalDeviation ?? false,
    cohesionStatus: params.cohesionStatus ?? 'NOT_EVALUATED',
  };
}

export function buildCarouselSlideSequenceBrief(params: {
  carouselExperimentVersion: string;
  sequenceSystem: SequenceCreativeSystem | null;
  direction: CarouselDirectionCarousel;
  slide: CarouselSlideRecord;
  anchorSlide: CarouselSlideRecord | null;
  previousSlide: CarouselSlideRecord | null;
  brandIntelligenceSummary?: string;
}): Record<string, unknown> | null {
  if (!usesSequenceCreativeMethodology(params.carouselExperimentVersion)) return null;
  if (!params.sequenceSystem) return null;

  const anchorSummary = params.anchorSlide
    ? `Slide ${params.anchorSlide.slideNumber} ${params.anchorSlide.slideRole}: ${params.anchorSlide.slidePurpose}`
    : 'anchor not established';

  return compileSequenceFrameBrief({
    brandIntelligenceSummary: params.brandIntelligenceSummary,
    conceptTerritorySummary: params.direction.directionName,
    worldExpressionSummary: params.direction.worldBible?.carouselThesis ?? undefined,
    sequenceSystem: params.sequenceSystem,
    frameContext: {
      frameIndex: params.slide.slideNumber,
      frameRole: mapSlideRoleToFrameRole(params.slide.slideRole),
      sequenceCreativeSystemId: params.sequenceSystem.sequenceCreativeSystemId,
      anchorSummary,
      previousFrameSummary: params.previousSlide
        ? `Slide ${params.previousSlide.slideNumber}: ${params.previousSlide.slidePurpose}`
        : null,
      controlledDeviation: null,
    },
  });
}

export function evaluateCarouselSequenceCohesion(params: {
  sequenceSystem: SequenceCreativeSystem;
  slides: CarouselSlideRecord[];
  visionAvailable?: boolean;
}) {
  return runSequenceCohesionGate({
    sequenceSystem: params.sequenceSystem,
    slides: params.slides,
    visionAvailable: params.visionAvailable ?? false,
  });
}
