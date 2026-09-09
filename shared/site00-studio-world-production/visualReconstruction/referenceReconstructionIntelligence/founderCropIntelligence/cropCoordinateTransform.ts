/**
 * P0.VR.6R9 — CropCoordinateTransform: screen ↔ source pixel space with letterbox support.
 */

import type { NormalizedBbox } from '../types.js';
import type { CanonicalCropRect } from './canonicalCropRect.js';
import { clampCanonicalCrop, canonicalFromNormalized, normalizedFromCanonical } from './canonicalCropRect.js';
import { clampNormalizedBbox, normalizedToPixelBounds, pixelToNormalizedBounds } from './cropGeometry.js';
import type { RenderedImageGeometry, ViewportTransform } from './renderedImageGeometry.js';
import type { PixelBounds } from './types.js';

export type { ViewportTransform } from './renderedImageGeometry.js';

export type OverlayCssRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export type SourcePoint = { sourceX: number; sourceY: number };

/** Screen/client point → source image pixel (float, no early round). */
export function screenPointToSourcePoint(
  clientX: number,
  clientY: number,
  geometry: RenderedImageGeometry,
): SourcePoint {
  const localX = clientX - geometry.left;
  const localY = clientY - geometry.top;
  const sourceX = localX / geometry.scaleX;
  const sourceY = localY / geometry.scaleY;
  return { sourceX, sourceY };
}

/** Source pixel point → overlay CSS px relative to image stage (container-local). */
export function sourcePointToOverlayCss(
  sourceX: number,
  sourceY: number,
  geometry: RenderedImageGeometry,
): { x: number; y: number } {
  const localX = sourceX * geometry.scaleX;
  const localY = sourceY * geometry.scaleY;
  return {
    x: localX + geometry.letterboxX,
    y: localY + geometry.letterboxY,
  };
}

/** Canonical source rect → overlay CSS rect (container-local, not viewport). */
export function sourceRectToOverlayCss(
  canonical: CanonicalCropRect,
  geometry: RenderedImageGeometry,
): OverlayCssRect {
  const tl = sourcePointToOverlayCss(canonical.x, canonical.y, geometry);
  const br = sourcePointToOverlayCss(
    canonical.x + canonical.width,
    canonical.y + canonical.height,
    geometry,
  );
  return {
    left: tl.x,
    top: tl.y,
    width: Math.max(1, br.x - tl.x),
    height: Math.max(1, br.y - tl.y),
  };
}

/** Overlay CSS rect → canonical source rect (inverse). */
export function overlayCssToSourceRect(
  css: OverlayCssRect,
  geometry: RenderedImageGeometry,
): CanonicalCropRect {
  const sourceX = (css.left - geometry.letterboxX) / geometry.scaleX;
  const sourceY = (css.top - geometry.letterboxY) / geometry.scaleY;
  const sourceW = css.width / geometry.scaleX;
  const sourceH = css.height / geometry.scaleY;
  return clampCanonicalCrop({
    x: sourceX,
    y: sourceY,
    width: sourceW,
    height: sourceH,
    sourceNaturalWidth: geometry.naturalWidth,
    sourceNaturalHeight: geometry.naturalHeight,
    normalizedX: sourceX / geometry.naturalWidth,
    normalizedY: sourceY / geometry.naturalHeight,
    normalizedWidth: sourceW / geometry.naturalWidth,
    normalizedHeight: sourceH / geometry.naturalHeight,
  });
}

/** Screen point → normalized 0–1 (via source pixels). */
export function screenPointToNormalized(
  clientX: number,
  clientY: number,
  geometry: RenderedImageGeometry,
): { x: number; y: number } {
  const { sourceX, sourceY } = screenPointToSourcePoint(clientX, clientY, geometry);
  return {
    x: Math.max(0, Math.min(1, sourceX / geometry.naturalWidth)),
    y: Math.max(0, Math.min(1, sourceY / geometry.naturalHeight)),
  };
}

/** Normalized bbox → overlay percent style (legacy — prefer sourceRectToOverlayCss). */
export function normalizedBboxToPercentStyle(bbox: NormalizedBbox): {
  left: string;
  top: string;
  width: string;
  height: string;
} {
  return {
    left: `${bbox.x * 100}%`,
    top: `${bbox.y * 100}%`,
    width: `${bbox.width * 100}%`,
    height: `${bbox.height * 100}%`,
  };
}

export function overlayCssToPercentStyle(css: OverlayCssRect, containerWidth: number, containerHeight: number): {
  left: string;
  top: string;
  width: string;
  height: string;
} {
  return {
    left: `${(css.left / containerWidth) * 100}%`,
    top: `${(css.top / containerHeight) * 100}%`,
    width: `${(css.width / containerWidth) * 100}%`,
    height: `${(css.height / containerHeight) * 100}%`,
  };
}

export function normalizedToSourcePixels(bbox: NormalizedBbox, naturalWidth: number, naturalHeight: number): PixelBounds {
  return normalizedToPixelBounds(bbox, naturalWidth, naturalHeight);
}

export function sourcePixelsToNormalized(pixel: PixelBounds, naturalWidth: number, naturalHeight: number): NormalizedBbox {
  return clampNormalizedBbox(pixelToNormalizedBounds(pixel, naturalWidth, naturalHeight));
}

/** Round-trip: source → overlay CSS → source. */
export function roundTripSourceOverlayError(
  canonical: CanonicalCropRect,
  geometry: RenderedImageGeometry,
): { maxErrorPx: number } {
  const css = sourceRectToOverlayCss(canonical, geometry);
  const back = overlayCssToSourceRect(css, geometry);
  const maxErrorPx = Math.max(
    Math.abs(back.x - canonical.x),
    Math.abs(back.y - canonical.y),
    Math.abs(back.width - canonical.width),
    Math.abs(back.height - canonical.height),
  );
  return { maxErrorPx };
}

export function roundTripError(
  bbox: NormalizedBbox,
  sourceWidth: number,
  sourceHeight: number,
): { maxDelta: number } {
  const px = normalizedToPixelBounds(bbox, sourceWidth, sourceHeight);
  const back = pixelToNormalizedBounds(px, sourceWidth, sourceHeight);
  const maxDelta = Math.max(
    Math.abs(back.x - bbox.x),
    Math.abs(back.y - bbox.y),
    Math.abs(back.width - bbox.width),
    Math.abs(back.height - bbox.height),
  );
  return { maxDelta };
}

export function applySnapAssistSource(
  canonical: CanonicalCropRect,
  snapTargets: CanonicalCropRect[],
  toleranceSourcePx = 4,
): CanonicalCropRect {
  let next = { ...canonical };
  for (const target of snapTargets) {
    if (Math.abs(next.x - target.x) < toleranceSourcePx) next.x = target.x;
    if (Math.abs(next.y - target.y) < toleranceSourcePx) next.y = target.y;
    const nextRight = next.x + next.width;
    const targetRight = target.x + target.width;
    if (Math.abs(nextRight - targetRight) < toleranceSourcePx) next.x = targetRight - next.width;
    const nextBottom = next.y + next.height;
    const targetBottom = target.y + target.height;
    if (Math.abs(nextBottom - targetBottom) < toleranceSourcePx) next.y = targetBottom - next.height;
  }
  return clampCanonicalCrop(next);
}

export function resizeCanonicalFromHandle(
  canonical: CanonicalCropRect,
  handle: 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw',
  pointerSource: SourcePoint,
  minSizePx = 8,
): CanonicalCropRect {
  let { x, y, width, height } = canonical;
  const right = x + width;
  const bottom = y + height;

  if (handle.includes('w')) {
    x = Math.min(pointerSource.sourceX, right - minSizePx);
    width = right - x;
  }
  if (handle.includes('e')) {
    width = Math.max(minSizePx, pointerSource.sourceX - x);
  }
  if (handle.includes('n')) {
    y = Math.min(pointerSource.sourceY, bottom - minSizePx);
    height = bottom - y;
  }
  if (handle.includes('s')) {
    height = Math.max(minSizePx, pointerSource.sourceY - y);
  }
  return clampCanonicalCrop({ ...canonical, x, y, width, height });
}

export function moveCanonical(canonical: CanonicalCropRect, dxSource: number, dySource: number): CanonicalCropRect {
  return clampCanonicalCrop({ ...canonical, x: canonical.x + dxSource, y: canonical.y + dySource });
}

export function canonicalFromNormalizedBbox(
  bbox: NormalizedBbox,
  naturalWidth: number,
  naturalHeight: number,
): CanonicalCropRect {
  return canonicalFromNormalized(bbox, naturalWidth, naturalHeight);
}

export function normalizedBboxFromCanonical(canonical: CanonicalCropRect): NormalizedBbox {
  return normalizedFromCanonical(canonical);
}

/** Resize using normalized pointer (legacy compat). */
export function resizeBboxFromHandle(
  bbox: NormalizedBbox,
  handle: 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw',
  pointerNorm: { x: number; y: number },
  minSize = 0.02,
): NormalizedBbox {
  let { x, y, width, height } = bbox;
  const right = x + width;
  const bottom = y + height;

  if (handle.includes('w')) {
    x = Math.min(pointerNorm.x, right - minSize);
    width = right - x;
  }
  if (handle.includes('e')) {
    width = Math.max(minSize, pointerNorm.x - x);
  }
  if (handle.includes('n')) {
    y = Math.min(pointerNorm.y, bottom - minSize);
    height = bottom - y;
  }
  if (handle.includes('s')) {
    height = Math.max(minSize, pointerNorm.y - y);
  }
  return clampNormalizedBbox({ x, y, width, height });
}

export function moveBbox(bbox: NormalizedBbox, dx: number, dy: number): NormalizedBbox {
  return clampNormalizedBbox({ ...bbox, x: bbox.x + dx, y: bbox.y + dy });
}

export function applySnapAssist(
  bbox: NormalizedBbox,
  snapTargets: NormalizedBbox[],
  threshold = 0.008,
): NormalizedBbox {
  let next = { ...bbox };
  for (const target of snapTargets) {
    if (Math.abs(next.x - target.x) < threshold) next.x = target.x;
    if (Math.abs(next.y - target.y) < threshold) next.y = target.y;
    const nextRight = next.x + next.width;
    const targetRight = target.x + target.width;
    if (Math.abs(nextRight - targetRight) < threshold) next.x = targetRight - next.width;
    const nextBottom = next.y + next.height;
    const targetBottom = target.y + target.height;
    if (Math.abs(nextBottom - targetBottom) < threshold) next.y = targetBottom - next.height;
  }
  return clampNormalizedBbox(next);
}

/** @deprecated use measureRenderedImageGeometry */
export type ImageLayoutMetrics = {
  naturalWidth: number;
  naturalHeight: number;
  renderedWidth: number;
  renderedHeight: number;
  offsetX: number;
  offsetY: number;
  devicePixelRatio: number;
};

/** @deprecated */
export function computeImageLayoutMetrics(
  img: { naturalWidth: number; naturalHeight: number },
  containerRect: DOMRect,
  transform: ViewportTransform,
): ImageLayoutMetrics {
  return {
    naturalWidth: img.naturalWidth,
    naturalHeight: img.naturalHeight,
    renderedWidth: containerRect.width * transform.zoom,
    renderedHeight: (img.naturalHeight / img.naturalWidth) * containerRect.width * transform.zoom,
    offsetX: containerRect.left + transform.panX,
    offsetY: containerRect.top + transform.panY,
    devicePixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
  };
}
