/**
 * PageVisualDecomposition — structural extraction from reference screenshot.
 */

import { randomUUID } from 'node:crypto';
import { decomposeReferenceRegions } from '../regions/VisualReferenceRegion.js';
import type { NormalizedVisualReference, VisualReferenceRegion } from '../types.js';
import type {
  LayoutRegionGeometry,
  PageVisualDecomposition,
  PageVisualDecompositionGlobal,
  VisualRegionMapRole,
} from './types.js';

const ROLE_MAP: Record<string, VisualRegionMapRole> = {
  'site-header': 'TOP_NAV',
  'owner-strip': 'STATUS_LABEL',
  'hub-nav': 'TOP_NAV',
  'page-title': 'HEADER_LOGO',
  'journey-stages': 'CENTER_PANEL',
  'recent-experiments': 'LEFT_PANEL',
  'quick-actions': 'RIGHT_PANEL',
  'mobile-nav': 'BOTTOM_NAV',
};

function mapContentRoleToMapRole(contentRole: string): VisualRegionMapRole {
  return ROLE_MAP[contentRole] ?? 'OTHER';
}

function buildGlobal(reference: NormalizedVisualReference): PageVisualDecompositionGlobal {
  const b = reference.usablePageBounds;
  return {
    viewportWidth: reference.pixelWidth,
    viewportHeight: reference.pixelHeight,
    aspectRatio: reference.aspectRatio,
    visualCenter: { x: b.x + b.width / 2, y: b.y + b.height / 2 },
    contentBounds: b,
    backgroundEstimate: '#FAF8F5',
    cameraFraming: b.height / b.width > 1.4 ? 'mobile-portrait' : 'desktop-wide',
    density: 'balanced',
    whitespaceRatio: 0.22,
  };
}

function regionToLayoutGeometry(region: VisualReferenceRegion, index: number): LayoutRegionGeometry {
  const b = region.bounds;
  const parent = region.normalizedBounds;
  return {
    regionId: region.regionId,
    role: mapContentRoleToMapRole(region.contentRole),
    x: b.x,
    y: b.y,
    width: b.width,
    height: b.height,
    relativeX: parent.x,
    relativeY: parent.y,
    relativeWidth: parent.width,
    relativeHeight: parent.height,
    zIndexHint: region.zOrder ?? index,
    alignment: region.alignmentRelationships[0] ?? 'start',
    padding: 12,
    gap: 8,
    borderRadius: region.contentRole.includes('card') ? 8 : 0,
    rotation: 0,
    opacity: 1,
    shadowBehavior: region.surfaceEstimate?.includes('elevated') ? 'soft' : null,
  };
}

export function decomposePageVisual(input: {
  reference: NormalizedVisualReference;
  referenceAssetId: string;
  layoutHints?: Parameters<typeof decomposeReferenceRegions>[0]['layoutHints'];
}): PageVisualDecomposition {
  const regions = decomposeReferenceRegions({
    reference: input.reference,
    layoutHints: input.layoutHints,
  });
  const global = buildGlobal(input.reference);
  const layoutRegions = regions.map(regionToLayoutGeometry);
  return {
    decompositionId: randomUUID(),
    referenceAssetId: input.referenceAssetId,
    global,
    layoutRegions,
    derivedFrom: input.reference,
    regions,
    createdAt: new Date().toISOString(),
  };
}

export function textCannotOverrideGeometry(
  decomposition: PageVisualDecomposition,
  textClaim: { regionId: string; width: number; height: number },
): boolean {
  const region = decomposition.layoutRegions.find((r) => r.regionId === textClaim.regionId);
  if (!region) return false;
  const widthDrift = Math.abs(region.width - textClaim.width);
  const heightDrift = Math.abs(region.height - textClaim.height);
  return widthDrift > 24 || heightDrift > 24;
}
