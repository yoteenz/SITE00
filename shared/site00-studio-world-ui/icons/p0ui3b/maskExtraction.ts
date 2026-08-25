import type { ExactIconReferenceCrop, IconPixelMask } from './types.js';

export function isForegroundPixel(r: number, g: number, b: number, includeLime = false): boolean {
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  if (lum < 130) return true;
  if (includeLime && g > 165 && r < 210 && b < 140 && g > r + 20) return true;
  return false;
}

export function extractIconPixelMask(
  rgba: Buffer,
  width: number,
  height: number,
  channels: number,
  crop: ExactIconReferenceCrop,
): IconPixelMask {
  const includeLime = crop.activeState === 'active';
  const data = new Uint8Array(width * height);
  let foregroundPixelCount = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      const fg = isForegroundPixel(rgba[i], rgba[i + 1], rgba[i + 2], includeLime);
      const idx = y * width + x;
      data[idx] = fg ? 1 : 0;
      if (fg) foregroundPixelCount++;
    }
  }

  return {
    iconName: crop.iconName,
    width,
    height,
    data,
    foregroundPixelCount,
    extractionNotes: includeLime ? 'lime+graphite mask' : 'graphite mask',
  };
}

export function maskBoundingBox(mask: IconPixelMask): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
} | null {
  let minX = mask.width,
    minY = mask.height,
    maxX = 0,
    maxY = 0,
    found = false;
  for (let y = 0; y < mask.height; y++) {
    for (let x = 0; x < mask.width; x++) {
      if (mask.data[y * mask.width + x]) {
        found = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  return found ? { minX, minY, maxX, maxY } : null;
}

export function invertMask(mask: IconPixelMask): IconPixelMask {
  const data = new Uint8Array(mask.data.length);
  let count = 0;
  for (let i = 0; i < mask.data.length; i++) {
    data[i] = mask.data[i] ? 0 : 1;
    if (data[i]) count++;
  }
  return { ...mask, data, foregroundPixelCount: count };
}
