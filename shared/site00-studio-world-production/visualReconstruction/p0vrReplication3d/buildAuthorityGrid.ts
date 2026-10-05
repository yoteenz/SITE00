import type { AuthorityCoordinateMap, AuthorityGrid } from './types.js';
import { HERO_COLUMN_FRACTIONS } from './constants.js';
import { normToPx } from './normalize.js';

export function buildAuthorityGrid(map: AuthorityCoordinateMap): AuthorityGrid {
  const content = map.authorityContentViewportBounds;
  const marginLeft = content.leftPx;
  const marginRight = map.authorityWidthPx - content.leftPx - content.widthPx;

  const hero = map.elements.find((e) => e.elementId === 'center_image_region');
  const verticalGuides: number[] = [marginLeft, marginLeft + content.widthPx];
  if (hero) {
    verticalGuides.push(normToPx(hero.left, map.authorityWidthPx));
    verticalGuides.push(normToPx(hero.right, map.authorityWidthPx));
  }

  const bandTops = map.regions.map((r) => normToPx(r.bounds.top, map.authorityHeightPx));
  const horizontalGuides = [...new Set(bandTops)].sort((a, b) => a - b);

  return {
    gridId: `agrid_${map.mapId}`,
    outerMarginLeft: marginLeft,
    outerMarginRight: marginRight,
    columnCount: 3,
    columnWidths: [...HERO_COLUMN_FRACTIONS],
    gutters: [0],
    horizontalGuides,
    verticalGuides,
    baselineGuides: horizontalGuides.map((y) => y + 12),
  };
}
