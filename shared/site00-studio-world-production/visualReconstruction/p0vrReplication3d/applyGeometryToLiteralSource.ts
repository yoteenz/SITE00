import type { LiteralRegionSpec } from '../p0vrReplication3b/types.js';
import type { GeneratedLiteralSource } from '../p0vrReplication3b/literalRegionSourceGenerator.js';
import { generateLiteralRegionSource } from '../p0vrReplication3b/literalRegionSourceGenerator.js';
import type { ReplicationAssetSlot } from '../p0vrReplication3c/types.js';
import type { AuthorityCoordinateMap, AuthorityGrid, GeometricExecutionPlan } from './types.js';
import { HERO_COLUMN_FRACTIONS } from './constants.js';
import { normToPx } from './normalize.js';

export function buildHeroGeometricExecutionPlan(input: {
  map: AuthorityCoordinateMap;
  grid: AuthorityGrid;
}): GeometricExecutionPlan {
  const targets = input.map.elements.filter((e) => e.regionId === 'hero-editorial' && !e.elementId.startsWith('band:'));

  return {
    planId: `gplan_hero_${Date.now()}`,
    regionId: 'hero-editorial',
    authorityGrid: input.grid,
    targetElements: targets.map((t) => ({
      elementId: t.elementId,
      authorityBounds: t,
      targetBoundsPx: {
        x: normToPx(t.x, input.map.authorityWidthPx),
        y: normToPx(t.y, input.map.authorityHeightPx),
        width: normToPx(t.width, input.map.authorityWidthPx),
        height: normToPx(t.height, input.map.authorityHeightPx),
      },
      tolerance: { positionPx: 4, sizePx: 4 },
      priority: 10,
      responsivePolicy: 'LOCK_TO_AUTHORITY',
    })),
    cssStrategy: 'CSS_GRID',
    overlayElements: ['lime_ndx_region'],
    dynamicContentPolicy: 'LINE_CLAMP',
    tolerancePolicy: {
      bandPositionPx: 4,
      bandSizePx: 6,
      internalPx: 4,
      navPx: 3,
      textPx: 3,
    },
  };
}

export function cssPatchFromGeometry(input: {
  map: AuthorityCoordinateMap;
  plan: GeometricExecutionPlan;
}): Record<string, string> {
  const heroBand = input.map.elements.find((e) => e.elementId === 'band:hero-editorial');
  const heroHeightPx = heroBand ? normToPx(heroBand.height, input.map.authorityHeightPx) : 200;
  const [c1, c2, c3] = HERO_COLUMN_FRACTIONS;
  return {
    '--vlt-content-margin-px': String(input.map.authorityContentViewportBounds.leftPx),
    '--vlt-hero-col-1-pct': String(Math.round(c1 * 100)),
    '--vlt-hero-col-2-pct': String(Math.round(c2 * 100)),
    '--vlt-hero-col-3-pct': String(Math.round(c3 * 100)),
    '--vlt-hero-min-height-px': String(heroHeightPx),
    '--vlt-hero-grid-template': `${c1}fr ${c2}fr ${c3}fr`,
    '--vlt-lime-left-pct': '38',
    '--vlt-lime-top-pct': '42',
    '--vlt-lime-width-pct': '22',
    '--vlt-lime-height-pct': '28',
  };
}

export function generateLiteralRegionSourceWithGeometry(input: {
  spec: LiteralRegionSpec;
  assetSlots: ReplicationAssetSlot[];
  map: AuthorityCoordinateMap;
  grid: AuthorityGrid;
  plan: GeometricExecutionPlan;
  cssPatch: Record<string, string>;
}): GeneratedLiteralSource & { geometryConsumed: boolean; cssPatch: Record<string, string> } {
  const base = generateLiteralRegionSource(input.spec);
  const cols = input.cssPatch['--vlt-hero-grid-template'] ?? '38fr 34fr 28fr';
  const minH = input.cssPatch['--vlt-hero-min-height-px'] ?? '200';
  const cssGridTemplate =
    input.spec.regionId === 'hero-editorial'
      ? `grid-template-columns: ${cols}; grid-template-rows: 1fr; min-height: ${minH}px; background: #0a0a0a`
      : base.cssGridTemplate;

  return {
    ...base,
    cssGridTemplate,
    geometryConsumed: true,
    cssPatch: input.cssPatch,
    domOutline: [
      ...base.domOutline,
      `<!-- geometry map ${input.map.mapId} -->`,
      ...input.assetSlots.map((s) => `<div data-asset-slot="${s.slotId}" data-geometry-lock="true" />`),
    ],
  };
}
