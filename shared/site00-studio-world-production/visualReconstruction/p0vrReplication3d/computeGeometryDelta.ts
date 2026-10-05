import {
  TOLERANCE_BAND_POSITION_PX,
  TOLERANCE_BAND_SIZE_PX,
  TOLERANCE_INTERNAL_PX,
  TOLERANCE_NAV_PX,
} from './constants.js';
import { normToPx } from './normalize.js';
import type {
  AuthorityCoordinateMap,
  GeometryDelta,
  GeometricTarget,
  NormRect,
  RenderedElementBounds,
} from './types.js';

export function authorityBoundsToPx(bounds: NormRect, canvasW: number, canvasH: number): RenderedElementBounds {
  const x = normToPx(bounds.x, canvasW);
  const y = normToPx(bounds.y, canvasH);
  const width = normToPx(bounds.width, canvasW);
  const height = normToPx(bounds.height, canvasH);
  return {
    elementId: '',
    x,
    y,
    width,
    height,
    left: x,
    top: y,
    right: x + width,
    bottom: y + height,
  };
}

export function buildGeometricTargets(map: AuthorityCoordinateMap): GeometricTarget[] {
  return map.elements.map((el) => {
    const isBand = el.elementId.startsWith('band:');
    const isNav = el.regionId === 'section-nav' || el.regionId === 'bottom-nav';
    const isHeroInternal = el.regionId === 'hero-editorial' && !isBand;
    const tolerance = isBand
      ? { positionPx: TOLERANCE_BAND_POSITION_PX, sizePx: TOLERANCE_BAND_SIZE_PX }
      : isNav
        ? { positionPx: TOLERANCE_NAV_PX, sizePx: TOLERANCE_NAV_PX }
        : { positionPx: TOLERANCE_INTERNAL_PX, sizePx: TOLERANCE_INTERNAL_PX };

    const px = authorityBoundsToPx(el, map.authorityWidthPx, map.authorityHeightPx);
    return {
      elementId: el.elementId,
      authorityBounds: el,
      targetBoundsPx: { x: px.x, y: px.y, width: px.width, height: px.height },
      tolerance,
      priority: isHeroInternal ? 10 : isBand ? 8 : 5,
      responsivePolicy: 'LOCK_TO_AUTHORITY' as const,
    };
  });
}

export function computeGeometryDelta(input: {
  target: GeometricTarget;
  rendered: RenderedElementBounds;
  map: AuthorityCoordinateMap;
}): GeometryDelta {
  const auth = authorityBoundsToPx(input.target.authorityBounds, input.map.authorityWidthPx, input.map.authorityHeightPx);
  const ren = input.rendered;
  const deltaX = ren.x - auth.x;
  const deltaY = ren.y - auth.y;
  const deltaWidth = ren.width - auth.width;
  const deltaHeight = ren.height - auth.height;
  const leftEdgeError = Math.abs(ren.left - auth.left);
  const rightEdgeError = Math.abs(ren.right - auth.right);
  const topEdgeError = Math.abs(ren.top - auth.top);
  const bottomEdgeError = Math.abs(ren.bottom - auth.bottom);
  const centerError = Math.hypot(
    ren.x + ren.width / 2 - (auth.x + auth.width / 2),
    ren.y + ren.height / 2 - (auth.y + auth.height / 2),
  );
  const posErr = Math.max(leftEdgeError, topEdgeError);
  const sizeErr = Math.max(Math.abs(deltaWidth), Math.abs(deltaHeight));
  const withinTolerance =
    posErr <= input.target.tolerance.positionPx && sizeErr <= input.target.tolerance.sizePx;

  return {
    elementId: input.target.elementId,
    authority: input.target.authorityBounds,
    rendered: ren,
    deltaX,
    deltaY,
    deltaWidth,
    deltaHeight,
    leftEdgeError,
    rightEdgeError,
    topEdgeError,
    bottomEdgeError,
    centerError,
    baselineError: topEdgeError,
    gapError: 0,
    severity: posErr + sizeErr,
    withinTolerance,
  };
}

export function estimateRenderedBoundsFromCss(input: {
  map: AuthorityCoordinateMap;
  cssPatch: Record<string, string>;
  elementId: string;
}): RenderedElementBounds | null {
  const el = input.map.elements.find((e) => e.elementId === input.elementId);
  if (!el) return null;
  const base = authorityBoundsToPx(el, input.map.authorityWidthPx, input.map.authorityHeightPx);

  if (el.regionId === 'hero-editorial' && el.elementId.endsWith('_region')) {
    const col1 = parseFloat(input.cssPatch['--vlt-hero-col-1-pct'] ?? '38');
    const col2 = parseFloat(input.cssPatch['--vlt-hero-col-2-pct'] ?? '34');
    const col3 = parseFloat(input.cssPatch['--vlt-hero-col-3-pct'] ?? '28');
    const heroBand = input.map.elements.find((e) => e.elementId === 'band:hero-editorial');
    if (!heroBand) return { ...base, elementId: el.elementId };
    const heroPx = authorityBoundsToPx(heroBand, input.map.authorityWidthPx, input.map.authorityHeightPx);
    const margin = parseFloat(input.cssPatch['--vlt-content-margin-px'] ?? '14');
    const innerW = heroPx.width - margin * 0;
    let x = heroPx.x;
    let w = innerW;
    if (el.elementId === 'left_copy_region') w = innerW * (col1 / 100);
    else if (el.elementId === 'center_image_region') {
      x = heroPx.x + innerW * (col1 / 100);
      w = innerW * (col2 / 100);
    } else if (el.elementId === 'right_visual_region') {
      x = heroPx.x + innerW * ((col1 + col2) / 100);
      w = innerW * (col3 / 100);
    }
    const minH = parseFloat(input.cssPatch['--vlt-hero-min-height-px'] ?? String(heroPx.height));
    return {
      elementId: el.elementId,
      x,
      y: heroPx.y,
      width: w,
      height: minH,
      left: x,
      top: heroPx.y,
      right: x + w,
      bottom: heroPx.y + minH,
    };
  }

  return { ...base, elementId: el.elementId };
}
