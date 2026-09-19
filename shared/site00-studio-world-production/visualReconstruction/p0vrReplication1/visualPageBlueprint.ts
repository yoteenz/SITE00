/**
 * P0.VR.REPLICATION.1 — VisualPageBlueprint from design authority profile.
 */

import { buildAuthorityCompositionBlueprint } from '../p0vrRebuild1/authorityCompositionBlueprint.js';
import type { DesignViewportClass } from '../p0vr2/types.js';
import type { BlueprintRelationship, VisualBlueprintRegion, VisualPageBlueprint } from './types.js';

function buildRelationships(regionOrder: string[]): BlueprintRelationship[] {
  const rels: BlueprintRelationship[] = [];
  for (let i = 0; i < regionOrder.length; i++) {
    const id = regionOrder[i]!;
    const next = regionOrder[i + 1];
    rels.push({ type: 'dominant', fromRegionId: regionOrder[0]!, toRegionId: id, value: i === 0 ? 1 : 0 });
    if (next) {
      rels.push({ type: 'above', fromRegionId: id, toRegionId: next });
      rels.push({ type: 'below', fromRegionId: next, toRegionId: id });
      rels.push({ type: 'spaced_by', fromRegionId: id, toRegionId: next, value: 'authority-stack' });
    }
    if (id.includes('nav') || id.includes('bottom')) {
      rels.push({ type: 'persistent', fromRegionId: id, toRegionId: id });
    }
  }
  return rels;
}

export function buildVisualPageBlueprint(input: {
  pageId: string;
  viewport: DesignViewportClass;
  authorityVersionId: string;
  pageArchetype?: string;
  screenId?: string;
}): VisualPageBlueprint {
  const authority = buildAuthorityCompositionBlueprint(input);
  const regions: VisualBlueprintRegion[] = authority.regions.map((r, index) => ({
    regionId: r.regionId,
    type: r.regionType,
    bounds: r.bounds,
    relativeBounds: r.bounds,
    order: index,
    hierarchyLevel: r.hierarchyLevel,
    layoutMode: r.layoutMode,
    children: [],
    alignment: 'stretch',
    spacing: 'authority-stack-v1',
    assetSlots: r.assetSlots,
    contentSlots: r.contentSlots,
    interactionSlots: r.interactionSlots,
    visualTokens: r.visualTokens,
    confidence: r.confidence,
  }));

  return {
    blueprintId: `vpb_${authority.blueprintId}`,
    pageId: input.pageId,
    viewport: input.viewport,
    authorityVersionId: input.authorityVersionId,
    canvas: authority.canvas,
    globalGrid: authority.globalGrid,
    regions,
    relationships: buildRelationships(authority.regionOrder),
    typographySystem: authority.typographyHierarchy,
    surfaceSystem: ['ndx-mobile-dark', 'editorial-hero', 'metric-grid'],
    assetSlots: authority.assetSlots,
    interactionSlots: authority.interactionSlots,
    persistentControls: authority.persistentControls,
    confidence: authority.confidence,
    status: authority.status,
  };
}
