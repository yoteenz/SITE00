/**
 * Node-only ROI edge refinement for locked founder authority JPGs.
 */

import path from 'node:path';
import sharp from 'sharp';
import type { VisualBounds } from './geometryFidelityTypes.js';

export function resolveFounderAuthorityAbsolutePath(publicPath: string): string {
  const rel = publicPath.replace(/^\//, '');
  return path.join(process.cwd(), 'public', rel);
}

/** Shrink ROI toward high-contrast edges (deterministic grayscale scan). */
export async function refineBoundsFromPixelEdges(
  authorityImageUri: string,
  roi: VisualBounds,
  imageWidth: number,
  imageHeight: number,
): Promise<{ bounds: VisualBounds; edgeAlignmentConfidence: number }> {
  const imagePath = resolveFounderAuthorityAbsolutePath(authorityImageUri);
  const x0 = Math.max(0, Math.min(imageWidth - 2, Math.floor(roi.x)));
  const y0 = Math.max(0, Math.min(imageHeight - 2, Math.floor(roi.y)));
  const w0 = Math.max(4, Math.min(imageWidth - x0, Math.floor(roi.w)));
  const h0 = Math.max(4, Math.min(imageHeight - y0, Math.floor(roi.h)));

  const { data, info } = await sharp(imagePath)
    .extract({ left: x0, top: y0, width: w0, height: h0 })
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = info.width;
  const h = info.height;
  const px = (x: number, y: number) => data[y * w + x] ?? 128;

  const rowEnergy = (y: number) => {
    let s = 0;
    for (let x = 0; x < w; x++) s += px(x, y);
    return s / w;
  };
  const colEnergy = (x: number) => {
    let s = 0;
    for (let y = 0; y < h; y++) s += px(x, y);
    return s / h;
  };

  const rowE = Array.from({ length: h }, (_, y) => rowEnergy(y));
  const colE = Array.from({ length: w }, (_, x) => colEnergy(x));
  const rowGrad = rowE.map((v, i) => (i === 0 ? 0 : Math.abs(v - rowE[i - 1]!)));
  const colGrad = colE.map((v, i) => (i === 0 ? 0 : Math.abs(v - colE[i - 1]!)));
  const rowT = rowGrad.reduce((a, b) => a + b, 0) / h;
  const colT = colGrad.reduce((a, b) => a + b, 0) / w;

  let top = 0;
  let bottom = h - 1;
  let left = 0;
  let right = w - 1;
  for (let y = 1; y < h - 1; y++) {
    if (rowGrad[y]! > rowT * 1.2) {
      top = y;
      break;
    }
  }
  for (let y = h - 2; y > top; y--) {
    if (rowGrad[y]! > rowT * 1.2) {
      bottom = y;
      break;
    }
  }
  for (let x = 1; x < w - 1; x++) {
    if (colGrad[x]! > colT * 1.2) {
      left = x;
      break;
    }
  }
  for (let x = w - 2; x > left; x--) {
    if (colGrad[x]! > colT * 1.2) {
      right = x;
      break;
    }
  }

  const shrinkMargin = 2;
  top = Math.max(0, top - shrinkMargin);
  left = Math.max(0, left - shrinkMargin);
  bottom = Math.min(h - 1, bottom + shrinkMargin);
  right = Math.min(w - 1, right + shrinkMargin);

  const refinedW = Math.max(2, right - left + 1);
  const refinedH = Math.max(2, bottom - top + 1);
  const bounds: VisualBounds = {
    x: x0 + left,
    y: y0 + top,
    w: refinedW,
    h: refinedH,
  };
  const areaBefore = w0 * h0;
  const areaAfter = refinedW * refinedH;
  const edgeAlignmentConfidence = areaBefore > 0 ? Math.min(1, Math.max(0.35, areaAfter / areaBefore)) : 0.5;
  return { bounds, edgeAlignmentConfidence };
}
