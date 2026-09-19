/**
 * Preserve Experiment B heroes as immutable Slide 01 covers.
 */

import type { CanonicalCreativeRangeRun } from './canonicalCreativeRangeTypes.js';
import type { PreservedCarouselCover } from './canonicalCarouselExpansionTypes.js';
import { CANONICAL_SIX_DIRECTION_SPEC } from './canonicalCreativeRangeConstants.js';

export function resolvePreservedCoversFromRangeRun(
  rangeRun: CanonicalCreativeRangeRun | null,
): PreservedCarouselCover[] {
  if (!rangeRun) return [];
  const covers: PreservedCarouselCover[] = [];
  for (const spec of CANONICAL_SIX_DIRECTION_SPEC) {
    const dir = rangeRun.directions.find((d) => d.comparisonIndex === spec.comparisonIndex);
    if (!dir?.heroAsset?.storagePath) continue;
    covers.push({
      directionId: dir.directionId,
      directionName: spec.canonicalName,
      comparisonIndex: spec.comparisonIndex,
      existingHeroAssetId: dir.heroAsset.assetId,
      existingHeroStoragePath: dir.heroAsset.storagePath,
      existingHeroPromptLineage: dir.generationReceipt?.firstGenerationPromptHash ?? null,
      existingHeroFormat: dir.formatSelection?.nativeFormat ?? 'CAROUSEL_COVER',
      existingHeroGenerationReceipt: dir.generationReceipt as unknown as Record<string, unknown>,
      carouselSlideNumber: 1,
      role: 'CANONICAL_CAROUSEL_COVER',
      preserved: true,
    });
  }
  return covers.sort((a, b) => a.comparisonIndex - b.comparisonIndex);
}

export function runCanonicalCarouselCoverPreservationTest(covers: PreservedCarouselCover[]): {
  passed: boolean;
  resolved: number;
  required: 6;
  notes: string[];
} {
  const notes: string[] = [];
  if (covers.length !== 6) notes.push(`Expected 6 covers, resolved ${covers.length}`);
  for (const cover of covers) {
    if (!cover.preserved) notes.push(`Cover ${cover.comparisonIndex} not marked preserved`);
    if (cover.carouselSlideNumber !== 1) notes.push(`Cover ${cover.comparisonIndex} wrong slide number`);
    if (cover.role !== 'CANONICAL_CAROUSEL_COVER') notes.push(`Cover ${cover.comparisonIndex} wrong role`);
    if (!cover.existingHeroStoragePath) notes.push(`Cover ${cover.comparisonIndex} missing storage path`);
  }
  return { passed: notes.length === 0, resolved: covers.length, required: 6, notes };
}

export function runNoCoverRegenerationTest(slides: Array<{ slideNumber: number; preserved: boolean }>): {
  passed: boolean;
  notes: string[];
} {
  const cover = slides.find((s) => s.slideNumber === 1);
  if (!cover) return { passed: false, notes: ['Slide 01 missing'] };
  if (!cover.preserved) return { passed: false, notes: ['Slide 01 was regenerated — forbidden'] };
  return { passed: true, notes: [] };
}

export function runCoverWorldInfluenceNotLayoutCloneTest(brief: Record<string, unknown> | null): {
  passed: boolean;
  notes: string[];
} {
  if (!brief) return { passed: true, notes: ['No brief yet — N/A'] };
  const prompt = JSON.stringify(brief).toLowerCase();
  const forbidden = ['exact layout', 'same composition', 'clone cover', 'identical crop'];
  const hits = forbidden.filter((f) => prompt.includes(f));
  const hasGuard = prompt.includes('do not copy') || prompt.includes('forbidden') || prompt.includes('world context');
  return {
    passed: hits.length === 0 && hasGuard,
    notes: hits.length ? [`Forbidden layout language: ${hits.join(', ')}`] : ['Cover influence contract present'],
  };
}
