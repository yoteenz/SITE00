/**
 * Crop geometry helpers — normalized ↔ pixel bounds.
 */

import type { NormalizedBbox } from '../types.js';
import type { PixelBounds } from './types.js';

export function normalizedToPixelBounds(bbox: NormalizedBbox, sourceWidth: number, sourceHeight: number): PixelBounds {
  return {
    x: Math.round(bbox.x * sourceWidth),
    y: Math.round(bbox.y * sourceHeight),
    width: Math.round(bbox.width * sourceWidth),
    height: Math.round(bbox.height * sourceHeight),
  };
}

export function pixelToNormalizedBounds(pixel: PixelBounds, sourceWidth: number, sourceHeight: number): NormalizedBbox {
  return {
    x: pixel.x / sourceWidth,
    y: pixel.y / sourceHeight,
    width: pixel.width / sourceWidth,
    height: pixel.height / sourceHeight,
  };
}

export function clampNormalizedBbox(bbox: NormalizedBbox): NormalizedBbox {
  const x = Math.max(0, Math.min(1, bbox.x));
  const y = Math.max(0, Math.min(1, bbox.y));
  const w = Math.max(0.01, Math.min(1 - x, bbox.width));
  const h = Math.max(0.01, Math.min(1 - y, bbox.height));
  return { x, y, width: w, height: h };
}

export function computeCropChecksum(candidateId: string, bbox: NormalizedBbox): string {
  const s = `${candidateId}:${bbox.x.toFixed(4)},${bbox.y.toFixed(4)},${bbox.width.toFixed(4)},${bbox.height.toFixed(4)}`;
  let hash = 0;
  for (let i = 0; i < s.length; i += 1) hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  return `crc-${hash.toString(16)}`;
}
