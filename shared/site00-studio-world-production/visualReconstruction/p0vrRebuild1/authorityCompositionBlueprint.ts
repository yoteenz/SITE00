/**
 * P0.VR.REBUILD.1 — Authority-first composition blueprint (from authority profile, not current DOM).
 */

import { resolvePageRegionLayoutProfile } from '../p0vrDiag1/pageRegionLayoutProfiles.js';
import { CANONICAL_VIEWPORT_DIMENSIONS } from '../p0vr2/constants.js';
import type { DesignViewportClass } from '../p0vr2/types.js';
import type { AuthorityCompositionBlueprint, AuthorityRegionBlueprint } from './types.js';

export function buildAuthorityCompositionBlueprint(input: {
  pageId: string;
  viewport: DesignViewportClass;
  authorityVersionId: string;
  pageArchetype?: string;
  screenId?: string;
}): AuthorityCompositionBlueprint {
  const profile = resolvePageRegionLayoutProfile({
    pageArchetype: input.pageArchetype ?? 'ndxbook-overview-mobile',
    screenId: input.screenId ?? 'overview',
  });
  const dims = CANONICAL_VIEWPORT_DIMENSIONS[input.viewport];
  const regions: AuthorityRegionBlueprint[] = profile.regions.map((r, index) => ({
    regionId: r.regionId,
    regionType: r.regionType,
    regionName: r.regionName,
    order: profile.stackOrder.indexOf(profile.stackOrder[index] ?? r.regionId) >= 0 ? index : index,
    hierarchyLevel: Math.round(r.hierarchyWeight * 10),
    layoutMode:
      r.regionType === 'PERSISTENT_NAV' || r.shellBound === 'bottom-nav'
        ? 'PERSISTENT'
        : r.regionType === 'METRICS'
          ? 'GRID'
          : r.regionType === 'CARD_RAIL'
            ? 'RAIL'
            : 'STACK',
    bounds: { y: r.normalizedY, height: r.normalizedHeight },
    assetSlots: r.regionType === 'MEDIA' || r.category === 'ASSET' ? ['primary-media'] : [],
    contentSlots: [`${r.regionId}.primary`],
    interactionSlots: r.regionType === 'NAVIGATION' ? ['nav-item'] : [],
    visualTokens: [r.category.toLowerCase(), r.regionType.toLowerCase()],
    confidence: r.significance === 'MAJOR' ? 'HIGH' : 'MEDIUM',
  }));

  return {
    blueprintId: `acb_${input.pageId}_${input.viewport}_${Date.now()}`,
    pageId: input.pageId,
    viewport: input.viewport,
    authorityVersionId: input.authorityVersionId,
    canvas: { width: dims.width, height: dims.height },
    regions,
    regionOrder: profile.stackOrder,
    globalGrid: 'mobile-single-column',
    gutterProfile: 'ndx-mobile-14',
    verticalRhythm: 'authority-stack-v1',
    typographyHierarchy: ['masthead', 'display', 'title', 'label', 'meta', 'metric'],
    persistentControls: ['header', 'bottom-nav'],
    assetSlots: regions.flatMap((r) => r.assetSlots),
    interactionSlots: regions.flatMap((r) => r.interactionSlots),
    confidence: 'HIGH',
    status: 'READY',
  };
}
