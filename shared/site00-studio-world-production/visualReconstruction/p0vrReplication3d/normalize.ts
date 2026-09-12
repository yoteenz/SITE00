import { NORMALIZED_COORD_SCALE } from './constants.js';
import type { NormRect } from './types.js';

export function pxToNorm(valuePx: number, totalPx: number): number {
  if (totalPx <= 0) return 0;
  return Math.round((valuePx / totalPx) * NORMALIZED_COORD_SCALE);
}

export function normToPx(valueNorm: number, totalPx: number): number {
  return Math.round((valueNorm / NORMALIZED_COORD_SCALE) * totalPx);
}

export function rectFromPx(input: {
  x: number;
  y: number;
  width: number;
  height: number;
  canvasW: number;
  canvasH: number;
}): NormRect {
  const { x, y, width, height, canvasW, canvasH } = input;
  const right = x + width;
  const bottom = y + height;
  return {
    x: pxToNorm(x, canvasW),
    y: pxToNorm(y, canvasH),
    width: pxToNorm(width, canvasW),
    height: pxToNorm(height, canvasH),
    centerX: pxToNorm(x + width / 2, canvasW),
    centerY: pxToNorm(y + height / 2, canvasH),
    left: pxToNorm(x, canvasW),
    right: pxToNorm(right, canvasW),
    top: pxToNorm(y, canvasH),
    bottom: pxToNorm(bottom, canvasH),
  };
}

export function rectToPx(bounds: NormRect, canvasW: number, canvasH: number): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  return {
    x: normToPx(bounds.x, canvasW),
    y: normToPx(bounds.y, canvasH),
    width: normToPx(bounds.width, canvasW),
    height: normToPx(bounds.height, canvasH),
  };
}
