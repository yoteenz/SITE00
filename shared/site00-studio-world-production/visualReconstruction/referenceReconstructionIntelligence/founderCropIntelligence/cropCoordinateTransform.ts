/**
 * P0.VR.6R8 — CropCoordinateTransform: screen ↔ source-image pixel space.
 */

import type { NormalizedBbox } from '../types.js';
import { clampNormalizedBbox, normalizedToPixelBounds, pixelToNormalizedBounds } from './cropGeometry.js';
import type { PixelBounds } from './types.js';

export type ViewportTransform = {
  zoom: number;
  panX: number;
  panY: number;
};

export type ImageLayoutMetrics = {
  naturalWidth: number;
  naturalHeight: number;
  renderedWidth: number;
  renderedHeight: number;
  offsetX: number;
  offsetY: number;
  devicePixelRatio: number;
};

export function computeImageLayoutMetrics(
  img: { naturalWidth: number; naturalHeight: number },
  containerRect: DOMRect,
  transform: ViewportTransform,
): ImageLayoutMetrics {
  const renderedWidth = containerRect.width * transform.zoom;
  const renderedHeight = (img.naturalHeight / img.naturalWidth) * renderedWidth;
  const offsetX = containerRect.left + transform.panX + (containerRect.width - renderedWidth) / 2;
  const offsetY = containerRect.top + transform.panY;
  return {
    naturalWidth: img.naturalWidth,
    naturalHeight: img.naturalHeight,
    renderedWidth,
    renderedHeight,
    offsetX,
    offsetY,
    devicePixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
  };
}

/** Screen point → normalized source coords (0–1). */
export function screenPointToNormalized(
  clientX: number,
  clientY: number,
  metrics: ImageLayoutMetrics,
): { x: number; y: number } {
  const rx = (clientX - metrics.offsetX) / metrics.renderedWidth;
  const ry = (clientY - metrics.offsetY) / metrics.renderedHeight;
  return {
    x: Math.max(0, Math.min(1, rx)),
    y: Math.max(0, Math.min(1, ry)),
  };
}

/** Normalized bbox corner → screen pixel for overlay positioning (percent-based fallback). */
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

export function normalizedToSourcePixels(bbox: NormalizedBbox, naturalWidth: number, naturalHeight: number): PixelBounds {
  return normalizedToPixelBounds(bbox, naturalWidth, naturalHeight);
}

export function sourcePixelsToNormalized(pixel: PixelBounds, naturalWidth: number, naturalHeight: number): NormalizedBbox {
  return clampNormalizedBbox(pixelToNormalizedBounds(pixel, naturalWidth, naturalHeight));
}

/** Round-trip error check — used in tests. */
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
