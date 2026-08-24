/**
 * Heuristic region decomposition for visual references.
 */

import type { NormalizedVisualReference, VisualReferenceRegion, VisualRegionRole } from '../types.js';

export type RegionDecompositionInput = {
  reference: NormalizedVisualReference;
  layoutHints?: Array<{ role: VisualRegionRole; normalizedY: number; normalizedHeight: number }>;
};

const DEFAULT_HUB_LAYOUT: Array<{ role: VisualRegionRole; y: number; h: number; contentRole: string }> = [
  { role: 'GLOBAL_SHELL', y: 0, h: 0.08, contentRole: 'site-header' },
  { role: 'OWNER_CONTROL', y: 0.08, h: 0.06, contentRole: 'owner-strip' },
  { role: 'LOCAL_NAV', y: 0.14, h: 0.08, contentRole: 'hub-nav' },
  { role: 'HERO', y: 0.22, h: 0.12, contentRole: 'page-title' },
  { role: 'METHOD_STAGE', y: 0.34, h: 0.28, contentRole: 'journey-stages' },
  { role: 'EXPERIMENT_GROUP', y: 0.62, h: 0.22, contentRole: 'recent-experiments' },
  { role: 'SECONDARY_NAV', y: 0.62, h: 0.22, contentRole: 'quick-actions' },
  { role: 'BOTTOM_NAV', y: 0.88, h: 0.12, contentRole: 'mobile-nav' },
];

export function decomposeReferenceRegions(input: RegionDecompositionInput): VisualReferenceRegion[] {
  const { reference } = input;
  const bounds = reference.usablePageBounds;
  const hints = input.layoutHints ?? DEFAULT_HUB_LAYOUT.map((h) => ({ role: h.role, normalizedY: h.y, normalizedHeight: h.h }));

  return hints.map((hint, index) => {
    const y = bounds.y + bounds.height * hint.normalizedY;
    const height = bounds.height * hint.normalizedHeight;
    const regionBounds = {
      x: bounds.x,
      y,
      width: bounds.width,
      height,
    };
    const layoutHint = DEFAULT_HUB_LAYOUT.find((d) => d.role === hint.role);

    return {
      regionId: `region-${hint.role.toLowerCase()}-${index}`,
      parentRegionId: hint.role === 'GLOBAL_SHELL' ? null : 'region-global-shell-0',
      bounds: regionBounds,
      normalizedBounds: {
        x: 0,
        y: hint.normalizedY,
        width: 1,
        height: hint.normalizedHeight,
      },
      zOrder: index,
      visualRole: hint.role,
      contentRole: layoutHint?.contentRole ?? hint.role.toLowerCase(),
      alignmentRelationships: ['content-rail-left'],
      spacingRelationships: [`gap-after-${index}`],
      colorEstimate: hint.role === 'METHOD_STAGE' ? '#161616' : null,
      surfaceEstimate: 'dark-editorial',
      typographyEstimate: 'mono-uppercase',
      confidence: 0.72,
    };
  });
}

export function buildVisualReferenceSet(
  primary: NormalizedVisualReference,
  additional: NormalizedVisualReference[] = [],
): { setId: string; primaryReferenceId: string; references: NormalizedVisualReference[] } {
  return {
    setId: `set-${primary.referenceId}`,
    primaryReferenceId: primary.referenceId,
    references: [primary, ...additional],
  };
}
