/**
 * P0.VR.1D.7 — Scope-relative DOM measurement normalization.
 */

import type { RenderedDomMeasurement, RenderedDomMeasurementMap } from '../p0vr1d1/types.js';
import type { ScopeAwareVisualAuthority } from './types.js';

export function normalizeScopedDomMeasurements(
  domMeasurement: RenderedDomMeasurementMap,
  scopeRootRect: { x: number; y: number; width: number; height: number } | null,
  scopeAuthority: ScopeAwareVisualAuthority,
): RenderedDomMeasurementMap {
  if (!scopeRootRect || scopeAuthority.comparisonMode === 'FULL_ROUTE') {
    return domMeasurement;
  }

  const measurements: RenderedDomMeasurement[] = domMeasurement.measurements.map((m) => ({
    ...m,
    actualX: m.actualX - scopeRootRect.x,
    actualY: m.actualY - scopeRootRect.y,
  }));

  return {
    ...domMeasurement,
    measurements,
  };
}

export function scopedDomRegionSelector(scopeAuthority: ScopeAwareVisualAuthority): string {
  if (scopeAuthority.comparisonMode === 'FULL_ROUTE') {
    return '[data-vr-region], [data-visual-reconstruction]';
  }
  return `${scopeAuthority.rootSelector} [data-vr-region], ${scopeAuthority.rootSelector} [data-visual-reconstruction], ${scopeAuthority.rootSelector}`;
}
