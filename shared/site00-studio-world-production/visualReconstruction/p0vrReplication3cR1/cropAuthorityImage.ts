/**
 * Server / Node — authority PNG crop + pixel sanity (sharp).
 */

import type { MaterializationFailureCode } from './types.js';
import { HERO_AUTHORITY_NORM_CROPS, MIN_CROP_LUMA_STDDEV } from './constants.js';

export type CropAuthorityResult =
  | {
      ok: true;
      buffer: Buffer;
      width: number;
      height: number;
      mimeType: 'image/jpeg';
      lumaStdDev: number;
    }
  | { ok: false; code: MaterializationFailureCode; message: string };

function computeLumaStdDev(raw: Buffer, width: number, height: number, channels: number): number {
  const stepX = Math.max(1, Math.floor(width / 24));
  const stepY = Math.max(1, Math.floor(height / 24));
  const lumas: number[] = [];
  for (let y = 0; y < height; y += stepY) {
    for (let x = 0; x < width; x += stepX) {
      const i = (y * width + x) * channels;
      const r = raw[i] ?? 0;
      const g = raw[i + 1] ?? r;
      const b = raw[i + 2] ?? r;
      lumas.push(0.299 * r + 0.587 * g + 0.114 * b);
    }
  }
  if (lumas.length < 2) return 0;
  const mean = lumas.reduce((a, b) => a + b, 0) / lumas.length;
  const variance = lumas.reduce((a, b) => a + (b - mean) ** 2, 0) / lumas.length;
  return Math.sqrt(variance);
}

export async function cropAuthorityImageBuffer(input: {
  source: Buffer;
  slotId: string;
}): Promise<CropAuthorityResult> {
  const rect = HERO_AUTHORITY_NORM_CROPS[input.slotId];
  if (!rect) {
    return { ok: false, code: 'AUTHORITY_CROP_INVALID', message: `No norm crop for ${input.slotId}` };
  }

  let sharp: typeof import('sharp');
  try {
    sharp = (await import('sharp')).default;
  } catch {
    return { ok: false, code: 'ASSET_CREATION_FAILED', message: 'sharp unavailable' };
  }

  try {
    const meta = await sharp(input.source).metadata();
    const srcW = meta.width ?? 0;
    const srcH = meta.height ?? 0;
    if (srcW < 8 || srcH < 8) {
      return { ok: false, code: 'AUTHORITY_CROP_INVALID', message: 'Authority dimensions invalid' };
    }

    const left = Math.max(0, Math.floor(rect.left * srcW));
    const top = Math.max(0, Math.floor(rect.top * srcH));
    const width = Math.max(1, Math.min(srcW - left, Math.floor(rect.width * srcW)));
    const height = Math.max(1, Math.min(srcH - top, Math.floor(rect.height * srcH)));

    if (width < 2 || height < 2) {
      return { ok: false, code: 'AUTHORITY_CROP_INVALID', message: 'Crop dimensions zero' };
    }

    const cropped = sharp(input.source).extract({ left, top, width, height });
    const { data, info } = await cropped.raw().toBuffer({ resolveWithObject: true });
    const lumaStdDev = computeLumaStdDev(data, info.width, info.height, info.channels);
    if (lumaStdDev < MIN_CROP_LUMA_STDDEV) {
      return {
        ok: false,
        code: 'AUTHORITY_CROP_INVALID',
        message: `Crop luma variance too low (${lumaStdDev.toFixed(2)})`,
      };
    }

    const jpeg = await sharp(input.source)
      .extract({ left, top, width, height })
      .jpeg({ quality: 88 })
      .toBuffer();

    return {
      ok: true,
      buffer: jpeg,
      width,
      height,
      mimeType: 'image/jpeg',
      lumaStdDev,
    };
  } catch {
    return { ok: false, code: 'ASSET_CREATION_FAILED', message: 'sharp unavailable' };
  }
}

export function bufferToDataUrl(buffer: Buffer, mimeType: string): string {
  return `data:${mimeType};base64,${buffer.toString('base64')}`;
}
