/**
 * P0.PAF.1 — Visual variation dependency map (skip non-visual axes).
 */

import type { VariationAxis } from './types.js';

/** Axes that require new raster output when changed. */
const VISUALLY_MEANINGFUL_AXES: VariationAxis[] = ['COLOR', 'STYLE', 'TEXTURE', 'LENGTH', 'FINISH'];

/** PART may compose in UI without always requiring new raster when style/color unchanged. */
const COMPOSABLE_AXES: VariationAxis[] = ['PART'];

export function axisRequiresRasterOutput(axis: VariationAxis): boolean {
  return VISUALLY_MEANINGFUL_AXES.includes(axis);
}

export function filterAxesForRasterGeneration(axes: VariationAxis[]): VariationAxis[] {
  return axes.filter((a) => axisRequiresRasterOutput(a) || a === 'PART');
}

export function shouldSkipDuplicateRaster(comboA: Record<string, string>, comboB: Record<string, string>): boolean {
  const visualKeys = ['COLOR', 'STYLE', 'TEXTURE', 'LENGTH', 'FINISH'];
  return visualKeys.every((k) => comboA[k] === comboB[k]);
}

export function getVisualVariationDependencyMap(): Record<VariationAxis, { requiresRaster: boolean; composable: boolean }> {
  const map = {} as Record<VariationAxis, { requiresRaster: boolean; composable: boolean }>;
  for (const axis of ['COLOR', 'STYLE', 'TEXTURE', 'PART', 'LENGTH', 'FINISH'] as VariationAxis[]) {
    map[axis] = {
      requiresRaster: axisRequiresRasterOutput(axis),
      composable: COMPOSABLE_AXES.includes(axis),
    };
  }
  return map;
}
