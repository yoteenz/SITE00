/**
 * P0.VR.DIAG.1R1 — Stack-based region layout for authority vs current comparison.
 */

import { buildNormalizedViewportGeometry } from './normalizedViewportGeometry.js';
import type { PageRegionLayoutDefinition } from './pageRegionLayoutProfiles.js';
import type { DomRegionMeasurement, NormalizedViewportGeometry, VisualRegionBounds } from './types.js';

export type StackLayoutContext = {
  usableWidth: number;
  usableHeight: number;
  headerHeightPx: number;
  bottomNavHeightPx: number;
  sectionGapPx: number;
  contentPaddingX: number;
};

function parseCssNumber(value: string | number | undefined | null): number | null {
  if (value == null) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const match = /^([\d.]+)/.exec(String(value).trim());
  return match ? Number(match[1]) : null;
}

export function resolveStackLayoutContext(input: {
  usableWidth: number;
  usableHeight: number;
  shell: {
    headerHeightPx: number;
    bottomNavHeightPx: number;
    sectionGap: number;
    contentPaddingX: number;
  } | null;
  cssSnapshot?: Record<string, string | number>;
  domMap: Map<string, DomRegionMeasurement>;
}): StackLayoutContext {
  const shell = input.shell;
  const headerFromDom = input.domMap.get(
    [...input.domMap.keys()].find((k) => k.includes('header-shell')) ?? '',
  );
  const bottomFromDom = input.domMap.get(
    [...input.domMap.keys()].find((k) => k.includes('bottom-nav')) ?? '',
  );

  const headerHeightPx =
    headerFromDom?.actualHeight ??
    parseCssNumber(input.cssSnapshot?.headerHeightPx ?? input.cssSnapshot?.['--ndx-mobile-header-h']) ??
    shell?.headerHeightPx ??
    Math.round(input.usableHeight * 0.062);

  const bottomNavHeightPx =
    bottomFromDom?.actualHeight ??
    parseCssNumber(input.cssSnapshot?.bottomNavHeightPx ?? input.cssSnapshot?.['--ndx-mobile-bottom-nav-h']) ??
    shell?.bottomNavHeightPx ??
    Math.round(input.usableHeight * 0.12);

  const sectionGapPx =
    parseCssNumber(input.cssSnapshot?.sectionGap ?? input.cssSnapshot?.['--ndx-mobile-section-gap']) ??
    shell?.sectionGap ??
    10;

  const contentPaddingX =
    parseCssNumber(input.cssSnapshot?.contentPaddingX ?? input.cssSnapshot?.['--ndx-mobile-content-px']) ??
    shell?.contentPaddingX ??
    14;

  return {
    usableWidth: input.usableWidth,
    usableHeight: input.usableHeight,
    headerHeightPx,
    bottomNavHeightPx,
    sectionGapPx,
    contentPaddingX,
  };
}

export function buildStackedRegionBounds(input: {
  def: PageRegionLayoutDefinition;
  ctx: StackLayoutContext;
  middleRegions: PageRegionLayoutDefinition[];
  dom?: DomRegionMeasurement;
  side: 'authority' | 'current';
  shell: {
    headerHeightPx: number;
    bottomNavHeightPx: number;
    sectionGap: number;
    contentPaddingX: number;
  } | null;
}): VisualRegionBounds {
  const { def, ctx, middleRegions, dom, side, shell } = input;

  if (dom) {
    return {
      regionId: def.regionId,
      regionName: def.regionName,
      category: def.category,
      geometry: buildNormalizedViewportGeometry({
        x: dom.actualX,
        y: dom.actualY,
        width: dom.actualWidth,
        height: dom.actualHeight,
        viewportWidth: ctx.usableWidth,
        viewportHeight: ctx.usableHeight,
      }),
      componentId: dom.componentId ?? def.componentId ?? null,
      selectorHint: def.selectorHint ?? null,
    };
  }

  if (def.shellBound === 'header') {
    const height = side === 'authority' ? (shell?.headerHeightPx ?? ctx.headerHeightPx) : ctx.headerHeightPx;
    return boundsFromGeometry(def, 0, 0, ctx.usableWidth, height, ctx);
  }

  if (def.shellBound === 'bottom-nav') {
    const height = side === 'authority' ? (shell?.bottomNavHeightPx ?? ctx.bottomNavHeightPx) : ctx.bottomNavHeightPx;
    const y = ctx.usableHeight - height;
    return boundsFromGeometry(def, 0, y, ctx.usableWidth, height, ctx);
  }

  const headerH = side === 'authority' ? (shell?.headerHeightPx ?? ctx.headerHeightPx) : ctx.headerHeightPx;
  const bottomH = side === 'authority' ? (shell?.bottomNavHeightPx ?? ctx.bottomNavHeightPx) : ctx.bottomNavHeightPx;
  const gap = side === 'authority' ? (shell?.sectionGap ?? ctx.sectionGapPx) : ctx.sectionGapPx;
  const contentTop = headerH;
  const contentBottom = ctx.usableHeight - bottomH;
  const contentHeight = Math.max(0, contentBottom - contentTop);
  const totalNorm = middleRegions.reduce((sum, r) => sum + r.normalizedHeight, 0) || 1;

  let cursor = contentTop;
  for (const region of middleRegions) {
    const regionHeight = Math.max(8, (region.normalizedHeight / totalNorm) * contentHeight);
    if (region.regionId === def.regionId) {
      const padX = side === 'authority' ? (shell?.contentPaddingX ?? ctx.contentPaddingX) : ctx.contentPaddingX;
      const width = ctx.usableWidth - padX * 2;
      return boundsFromGeometry(def, padX, cursor, width, regionHeight, ctx);
    }
    cursor += regionHeight + gap;
  }

  const fallbackY = ctx.usableHeight * def.normalizedY;
  const fallbackH = ctx.usableHeight * def.normalizedHeight;
  return boundsFromGeometry(def, ctx.contentPaddingX, fallbackY, ctx.usableWidth - ctx.contentPaddingX * 2, fallbackH, ctx);
}

function boundsFromGeometry(
  def: PageRegionLayoutDefinition,
  x: number,
  y: number,
  width: number,
  height: number,
  ctx: StackLayoutContext,
): VisualRegionBounds {
  return {
    regionId: def.regionId,
    regionName: def.regionName,
    category: def.category,
    geometry: buildNormalizedViewportGeometry({
      x,
      y,
      width,
      height,
      viewportWidth: ctx.usableWidth,
      viewportHeight: ctx.usableHeight,
    }),
    componentId: def.componentId ?? null,
    selectorHint: def.selectorHint ?? null,
  };
}

export function geometryMetrics(geo: NormalizedViewportGeometry): Record<string, number> {
  return {
    x: geo.xPx,
    y: geo.yPx,
    width: geo.widthPx,
    height: geo.heightPx,
    aspectRatio: geo.aspectRatio,
    topOffset: geo.topOffsetPx,
    leftOffset: geo.leftOffsetPx,
    rightOffset: geo.rightOffsetPx,
    bottomOffset: geo.bottomOffsetPx,
    viewportWidthPct: geo.widthPct,
    viewportHeightPct: geo.heightPct,
    occupiedAreaPct: round((geo.widthPct * geo.heightPct) / 100),
  };
}

function round(n: number): number {
  return Math.round(n * 10) / 10;
}
