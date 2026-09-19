/**
 * Sequence drift detection — accent dominance, typography mutation, template cloning.
 */

import type { CarouselSlideRecord } from '../canonicalCarouselExpansionTypes.js';
import type { FrameAnchorComparison, SequenceCreativeSystem, SequenceDeviationEvent } from './types.js';

function slideUsesAccentDominantly(slide: CarouselSlideRecord, accent: string): boolean {
  const haystack = JSON.stringify({
    copy: slide.copy,
    colorLogic: slide.colorLogic,
    worldSignals: slide.worldSignals,
  }).toLowerCase();
  const accentLower = accent.toLowerCase();
  if (!haystack.includes(accentLower)) return false;
  const dominantHints = ['dominant', 'field', 'majority', 'full-bleed', 'hero'];
  return dominantHints.some((h) => haystack.includes(h));
}

export function detectAccentColorDrift(params: {
  anchorSlide: CarouselSlideRecord;
  subsequentSlides: CarouselSlideRecord[];
  sequenceSystem: SequenceCreativeSystem;
}): string[] {
  const accentEntry = params.sequenceSystem.paletteUsageHierarchy.find((p) => p.role === 'ACCENT');
  const accent = accentEntry?.color ?? 'LIME';
  const warnings: string[] = [];

  const anchorSparse = !slideUsesAccentDominantly(params.anchorSlide, accent);
  if (!anchorSparse) return warnings;

  for (const slide of params.subsequentSlides) {
    if (slideUsesAccentDominantly(slide, accent)) {
      const hasDeviation = params.sequenceSystem.plannedDeviations.some(
        (d) => d.frameIndex === slide.slideNumber && d.propertyBeingBroken.toLowerCase().includes('accent'),
      );
      if (!hasDeviation) {
        warnings.push(
          `Slide ${slide.slideNumber}: ${accent} reads dominant but anchor established sparse accent — DRIFT_WARNING`,
        );
      }
    }
  }
  return warnings;
}

export function detectResizeOnlySequenceFailure(slides: CarouselSlideRecord[]): boolean {
  if (slides.length < 3) return false;
  const nonAnchor = slides.filter((s) => s.slideNumber > 1);
  const sameComposition = nonAnchor.every(
    (s) => s.compositionMode === slides[0]?.compositionMode && s.typography.fontRole === slides[0]?.typography.fontRole,
  );
  const sameCopyStructure = nonAnchor.every((s) => s.copy.headline.length > 0 && s.slideRole === nonAnchor[0]?.slideRole);
  return sameComposition && sameCopyStructure;
}

export function compareFrameToSequenceAnchor(params: {
  frameIndex: number;
  slide: CarouselSlideRecord;
  anchorSlide: CarouselSlideRecord;
  sequenceSystem: SequenceCreativeSystem;
  deviation?: SequenceDeviationEvent | null;
}): FrameAnchorComparison {
  const overlapping: string[] = [];
  const drift: string[] = [];

  if (params.slide.typography.fontRole === params.anchorSlide.typography.fontRole) {
    overlapping.push('typography role continuity');
  } else {
    drift.push('typography role shift');
  }

  if (params.slide.compositionMode !== params.anchorSlide.compositionMode) {
    overlapping.push('compositional variety');
  }

  const accent = params.sequenceSystem.paletteUsageHierarchy.find((p) => p.role === 'ACCENT')?.color ?? '';
  if (accent && slideUsesAccentDominantly(params.slide, accent) && !slideUsesAccentDominantly(params.anchorSlide, accent)) {
    drift.push(`${accent} accent dominance drift`);
  }

  let result: FrameAnchorComparison['result'] = 'CONSISTENT';
  if (params.deviation?.intentionality === 'DELIBERATE') {
    result = 'CONSISTENT_WITH_INTENTIONAL_VARIATION';
  } else if (drift.length >= 2) {
    result = 'ART_DIRECTION_BREAK';
  } else if (drift.length === 1) {
    result = 'DRIFT_WARNING';
  }

  return {
    frameIndex: params.frameIndex,
    result,
    overlappingTraits: overlapping,
    driftTraits: drift,
    notes: drift.length ? drift : ['Within sequence art-direction contract'],
  };
}

export function detectSlide01Outlier(params: {
  anchorSlide: CarouselSlideRecord;
  subsequentSlides: CarouselSlideRecord[];
}): boolean {
  if (params.subsequentSlides.length === 0) return false;
  const anchorMode = params.anchorSlide.compositionMode;
  const laterModes = params.subsequentSlides.map((s) => s.compositionMode);
  const anchorUnique = laterModes.every((m) => m !== anchorMode) && new Set(laterModes).size === 1;
  return anchorUnique;
}
