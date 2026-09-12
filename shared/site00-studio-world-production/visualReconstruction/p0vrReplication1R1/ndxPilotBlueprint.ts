/**
 * P0.VR.REPLICATION.1R1 — NDXBOOK mobile overview pilot blueprint (authority-first).
 */

import { resolvePageRegionLayoutProfile } from '../p0vrDiag1/pageRegionLayoutProfiles.js';
import { NDX_LEGACY_OVERVIEW_STACK } from '../p0vrRebuild1/compositionDivergenceScore.js';
import { buildVisualPageBlueprint } from '../p0vrReplication1/visualPageBlueprint.js';
import type { DesignViewportClass } from '../p0vr2/types.js';
import type { VisualPageBlueprint } from '../p0vrReplication1/types.js';
import { NDX_PILOT_STACK_ORDER } from './constants.js';

export function buildNdxbookPilotBlueprint(input: {
  pageId: string;
  viewport: DesignViewportClass;
  authorityVersionId: string;
}): VisualPageBlueprint {
  const profile = resolvePageRegionLayoutProfile({
    pageArchetype: 'ndxbook-overview-mobile',
    screenId: 'overview',
  });
  const blueprint = buildVisualPageBlueprint(input);
  blueprint.regionOrder = [...NDX_PILOT_STACK_ORDER];
  if (blueprint.regions.length === 0) {
    blueprint.regions = profile.regions.map((r, order) => ({
      regionId: r.regionId,
      type: r.regionType,
      bounds: { y: r.normalizedY, height: r.normalizedHeight },
      relativeBounds: { y: r.normalizedY, height: r.normalizedHeight },
      order,
      hierarchyLevel: Math.round(r.hierarchyWeight * 10),
      layoutMode: 'STACK',
      children: [],
      alignment: 'stretch',
      spacing: 'ndx-mobile-14',
      assetSlots: r.category === 'ASSET' ? ['primary-media'] : [],
      contentSlots: [`${r.regionId}.primary`],
      interactionSlots: [],
      visualTokens: [r.category.toLowerCase()],
      confidence: 'HIGH',
    }));
  }
  blueprint.status = 'READY';
  blueprint.confidence = 'HIGH';
  return blueprint;
}

export function validateNdxPilotBlueprint(blueprint: VisualPageBlueprint): {
  pass: boolean;
  reason: string | null;
} {
  const order = NDX_PILOT_STACK_ORDER.join('|');
  const hasHero = blueprint.regions.some((r) => r.type === 'MEDIA' || r.regionId.includes('hero') || r.regionId.includes('production'));
  const hasNav = blueprint.regions.some((r) => r.regionId.includes('nav') || r.type === 'NAVIGATION');
  if (!hasHero) return { pass: false, reason: 'AUTHORITY_HERO_SLOT_MISSING' };
  if (!hasNav) return { pass: false, reason: 'AUTHORITY_NAV_SLOT_MISSING' };

  const orderedIds =
    blueprint.regionOrder ??
    [...blueprint.regions].sort((a, b) => a.order - b.order).map((r) => r.regionId);
  const explicitLegacyRegion = blueprint.regions.some((r) => r.regionId.startsWith('legacy-'));
  const stackMatchesLegacyPatchOrder =
    orderedIds.length >= NDX_LEGACY_OVERVIEW_STACK.length &&
    NDX_LEGACY_OVERVIEW_STACK.every((legacyId, index) => {
      const token = legacyId.replace('legacy-', '').split('-')[0] ?? '';
      return orderedIds[index]?.toLowerCase().includes(token);
    });
  const mediaBeforeLegacyTail = blueprint.regions.some(
    (r) => (r.type === 'MEDIA' || r.regionId.includes('production')) && r.order <= 4,
  );
  if (explicitLegacyRegion || (stackMatchesLegacyPatchOrder && !mediaBeforeLegacyTail)) {
    return { pass: false, reason: 'LEGACY_STACK_DOMINATES_BLUEPRINT' };
  }

  if (blueprint.regions.length < 6) {
    return { pass: false, reason: 'INSUFFICIENT_MAJOR_REGIONS' };
  }

  return { pass: true, reason: order ? null : 'OK' };
}
