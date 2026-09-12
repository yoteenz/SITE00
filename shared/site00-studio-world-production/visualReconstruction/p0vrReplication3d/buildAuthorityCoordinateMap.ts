/**
 * Build AuthorityCoordinateMap from measured shell blueprint + hero literal geometry.
 */

import type { AuthorityShellBlueprint } from '../p0vrReplication2/authorityShellBlueprint.js';
import type { LiteralRegionSpec } from '../p0vrReplication3b/types.js';
import { NDX_SECTION_NAV_LABELS, NDX_METRIC_STATUS_LABELS } from '../p0vrReplication2/constants.js';
import { HERO_COLUMN_FRACTIONS, METRIC_CELL_COUNT, MODULE_NAV_ITEM_COUNT, NORMALIZED_COORD_SCALE } from './constants.js';
import { rectFromPx } from './normalize.js';
import type { AuthorityCoordinateMap, AuthorityElementBounds } from './types.js';

function localHeroRect(
  heroBand: { topPx: number; heightPx: number; leftPx: number; widthPx: number },
  localXFrac: number,
  localYFrac: number,
  localWFrac: number,
  localHFrac: number,
  canvasW: number,
  canvasH: number,
): ReturnType<typeof rectFromPx> {
  const x = heroBand.leftPx + heroBand.widthPx * localXFrac;
  const y = heroBand.topPx + heroBand.heightPx * localYFrac;
  const width = heroBand.widthPx * localWFrac;
  const height = heroBand.heightPx * localHFrac;
  return rectFromPx({ x, y, width, height, canvasW, canvasH });
}

export function buildAuthorityCoordinateMap(input: {
  blueprint: AuthorityShellBlueprint;
  heroSpec: LiteralRegionSpec | null;
  sourceAuthorityId: string;
}): AuthorityCoordinateMap {
  const { blueprint } = input;
  const canvasW = blueprint.canvasWidth;
  const canvasH = blueprint.canvasHeight;

  const hostHeader = blueprint.bands.find((b) => b.bandId === 'host-header');
  const bottomNav = blueprint.bands.find((b) => b.bandId === 'bottom-nav');
  const contentTopPx = hostHeader ? hostHeader.topPx + hostHeader.heightPx : 52;
  const contentBottomPx = bottomNav ? bottomNav.topPx : canvasH - 56;
  const contentHeightPx = Math.max(1, contentBottomPx - contentTopPx);

  const authorityContentViewportBounds = {
    ...rectFromPx({
      x: blueprint.marginXPx,
      y: contentTopPx,
      width: canvasW - blueprint.marginXPx * 2,
      height: contentHeightPx,
      canvasW,
      canvasH,
    }),
    widthPx: canvasW - blueprint.marginXPx * 2,
    heightPx: contentHeightPx,
    leftPx: blueprint.marginXPx,
    topPx: contentTopPx,
  };

  const regions = blueprint.bands.map((band) => ({
    regionId: band.bandId,
    role: band.role,
    bounds: rectFromPx({
      x: band.leftPx,
      y: band.topPx,
      width: band.widthPx,
      height: band.heightPx,
      canvasW,
      canvasH,
    }),
  }));

  const elements: AuthorityElementBounds[] = [];

  for (const band of blueprint.bands) {
    elements.push({
      elementId: `band:${band.bandId}`,
      regionId: band.bandId,
      role: band.role,
      confidence: band.buildMode === 'MEASURED' ? 'HIGH' : 'MEDIUM',
      measurementSource: band.buildMode === 'MEASURED' ? 'DOM_REFERENCE' : 'MANUAL_NORMALIZATION',
      ...rectFromPx({
        x: band.leftPx,
        y: band.topPx,
        width: band.widthPx,
        height: band.heightPx,
        canvasW,
        canvasH,
      }),
    });
  }

  const heroBand = blueprint.bands.find((b) => b.bandId === 'hero-editorial');
  if (heroBand) {
    const [c1, c2, c3] = HERO_COLUMN_FRACTIONS;
    let xAcc = 0;
    const cols = [
      { id: 'left_copy_region', w: c1 },
      { id: 'center_image_region', w: c2 },
      { id: 'right_visual_region', w: c3 },
    ];
    for (const col of cols) {
      elements.push({
        elementId: col.id,
        regionId: 'hero-editorial',
        role: col.id,
        confidence: 'HIGH',
        measurementSource: 'RELATIONSHIP_INFERENCE',
        ...localHeroRect(heroBand, xAcc, 0, col.w, 1, canvasW, canvasH),
      });
      xAcc += col.w;
    }
    elements.push({
      elementId: 'lime_ndx_region',
      regionId: 'hero-editorial',
      role: 'lime overlay',
      confidence: 'HIGH',
      measurementSource: 'MANUAL_NORMALIZATION',
      ...localHeroRect(heroBand, c1 * 0.85, 0.35, c2 * 0.55, 0.28, canvasW, canvasH),
    });
    elements.push({
      elementId: 'hero_kicker',
      regionId: 'hero-editorial',
      role: 'kicker',
      confidence: 'HIGH',
      measurementSource: 'RELATIONSHIP_INFERENCE',
      ...localHeroRect(heroBand, 0, 0.55, c1, 0.12, canvasW, canvasH),
    });
    elements.push({
      elementId: 'hero_headline',
      regionId: 'hero-editorial',
      role: 'headline',
      confidence: 'HIGH',
      measurementSource: 'RELATIONSHIP_INFERENCE',
      ...localHeroRect(heroBand, 0, 0.68, c1, 0.2, canvasW, canvasH),
    });
    elements.push({
      elementId: 'hero_cta',
      regionId: 'hero-editorial',
      role: 'cta',
      confidence: 'HIGH',
      measurementSource: 'RELATIONSHIP_INFERENCE',
      ...localHeroRect(heroBand, 0, 0.82, c1 * 0.55, 0.12, canvasW, canvasH),
    });
    for (const sub of input.heroSpec?.subregions ?? []) {
      if (elements.some((e) => e.elementId === sub.id)) continue;
      elements.push({
        elementId: sub.id,
        regionId: 'hero-editorial',
        role: sub.role,
        confidence: 'MEDIUM',
        measurementSource: 'VISION',
        ...localHeroRect(heroBand, 0, 0, 1, 1, canvasW, canvasH),
      });
    }
  }

  const sectionNav = blueprint.bands.find((b) => b.bandId === 'section-nav');
  if (sectionNav) {
    const innerW = sectionNav.widthPx;
    const gap = 4;
    const itemW = (innerW - gap * (MODULE_NAV_ITEM_COUNT - 1)) / MODULE_NAV_ITEM_COUNT;
    NDX_SECTION_NAV_LABELS.forEach((label, i) => {
      const x = sectionNav.leftPx + i * (itemW + gap);
      elements.push({
        elementId: `module_nav:${label.toLowerCase()}`,
        regionId: 'section-nav',
        role: label,
        confidence: 'HIGH',
        measurementSource: 'MANUAL_NORMALIZATION',
        ...rectFromPx({ x, y: sectionNav.topPx, width: itemW, height: sectionNav.heightPx, canvasW, canvasH }),
      });
    });
  }

  const metrics = blueprint.bands.find((b) => b.bandId === 'metric-status-row');
  if (metrics) {
    const cellW = metrics.widthPx / METRIC_CELL_COUNT;
    for (let i = 0; i < METRIC_CELL_COUNT; i += 1) {
      const x = metrics.leftPx + i * cellW;
      elements.push({
        elementId: `metric_cell_${i}`,
        regionId: 'metric-status-row',
        role: NDX_METRIC_STATUS_LABELS[i] ?? `cell-${i}`,
        confidence: 'HIGH',
        measurementSource: 'MANUAL_NORMALIZATION',
        ...rectFromPx({ x, y: metrics.topPx, width: cellW, height: metrics.heightPx, canvasW, canvasH }),
      });
    }
  }

  const masthead = blueprint.bands.find((b) => b.bandId === 'masthead');
  const mastheadCtx = blueprint.bands.find((b) => b.bandId === 'masthead-context-column');
  if (masthead) {
    elements.push({
      elementId: 'masthead_title',
      regionId: 'masthead',
      role: 'NDXBOOK title',
      confidence: 'HIGH',
      measurementSource: 'DOM_REFERENCE',
      ...rectFromPx({
        x: masthead.leftPx,
        y: masthead.topPx,
        width: masthead.widthPx * 0.62,
        height: masthead.heightPx * 0.55,
        canvasW,
        canvasH,
      }),
    });
    elements.push({
      elementId: 'masthead_subtitle',
      regionId: 'masthead',
      role: 'subtitle',
      confidence: 'HIGH',
      measurementSource: 'DOM_REFERENCE',
      ...rectFromPx({
        x: masthead.leftPx,
        y: masthead.topPx + masthead.heightPx * 0.5,
        width: masthead.widthPx * 0.7,
        height: masthead.heightPx * 0.4,
        canvasW,
        canvasH,
      }),
    });
  }
  if (mastheadCtx) {
    elements.push({
      elementId: 'masthead_context_column',
      regionId: 'masthead-context-column',
      role: 'culture intelligence',
      confidence: 'HIGH',
      measurementSource: 'DOM_REFERENCE',
      ...rectFromPx({
        x: mastheadCtx.leftPx,
        y: mastheadCtx.topPx,
        width: mastheadCtx.widthPx,
        height: mastheadCtx.heightPx,
        canvasW,
        canvasH,
      }),
    });
  }

  const bottom = blueprint.bands.find((b) => b.bandId === 'bottom-nav');
  if (bottom) {
    const itemW = bottom.widthPx / 5;
    for (let i = 0; i < 5; i += 1) {
      elements.push({
        elementId: `host_nav_${i}`,
        regionId: 'bottom-nav',
        role: `nav-item-${i}`,
        confidence: 'HIGH',
        measurementSource: 'MANUAL_NORMALIZATION',
        ...rectFromPx({ x: i * itemW, y: bottom.topPx, width: itemW, height: bottom.heightPx, canvasW, canvasH }),
      });
    }
  }

  return {
    mapId: `acm_${blueprint.pageId}_${Date.now()}`,
    pageId: blueprint.pageId,
    viewport: blueprint.viewport,
    authorityWidthPx: canvasW,
    authorityHeightPx: canvasH,
    normalizedWidth: NORMALIZED_COORD_SCALE,
    normalizedHeight: NORMALIZED_COORD_SCALE,
    sourceAuthorityId: input.sourceAuthorityId,
    authorityContentViewportBounds,
    regions,
    elements,
    createdAt: new Date().toISOString(),
  };
}
