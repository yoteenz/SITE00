import pixelmatch from 'pixelmatch';
import sharp from 'sharp';
import {
  TWIN_V42_CRITICAL_REGION_DIFF_THRESHOLD,
  TWIN_V42_FULL_PAGE_DIFF_THRESHOLD,
  TWIN_V42_SECONDARY_REGION_DIFF_THRESHOLD,
} from './constants.js';
import type {
  TwinV4CanonicalViewport,
  TwinV4GoldenDiffReceipt,
  TwinV4RegionDiffReceipt,
} from './twinV42Types.js';
import { sha256Hex } from './sha256Hex.js';

export type TwinV4RegionMask = {
  regionId: TwinV4RegionDiffReceipt['regionId'];
  x: number;
  y: number;
  width: number;
  height: number;
  critical: boolean;
};

function defaultRegionMasks(width: number, height: number): TwinV4RegionMask[] {
  return [
    { regionId: 'TITLE_HEADER', x: 0, y: 0, width, height: Math.round(height * 0.1), critical: true },
    {
      regionId: 'LEFT_MAIN_BLUEPRINT',
      x: 0,
      y: Math.round(height * 0.1),
      width: Math.round(width * 0.62),
      height: Math.round(height * 0.65),
      critical: true,
    },
    {
      regionId: 'RIGHT_SPEC_TABLE',
      x: Math.round(width * 0.62),
      y: Math.round(height * 0.1),
      width: Math.round(width * 0.38),
      height: Math.round(height * 0.65),
      critical: true,
    },
    {
      regionId: 'LOWER_COLOR_PALETTE',
      x: 0,
      y: Math.round(height * 0.76),
      width,
      height: Math.round(height * 0.06),
      critical: true,
    },
    {
      regionId: 'LOWER_TYPOGRAPHY_KEY',
      x: 0,
      y: Math.round(height * 0.82),
      width,
      height: Math.round(height * 0.06),
      critical: true,
    },
    {
      regionId: 'LOWER_DIVIDER_SPECS',
      x: 0,
      y: Math.round(height * 0.88),
      width,
      height: Math.round(height * 0.06),
      critical: true,
    },
    {
      regionId: 'LOWER_NOTES_CONTEXT',
      x: 0,
      y: Math.round(height * 0.94),
      width,
      height: Math.max(1, height - Math.round(height * 0.94)),
      critical: true,
    },
  ];
}

async function normalizePngRaw(buffer: Buffer, viewport: TwinV4CanonicalViewport): Promise<Buffer> {
  return sharp(buffer)
    .resize(viewport.width, viewport.height, { fit: 'fill' })
    .ensureAlpha()
    .raw()
    .toBuffer();
}

export async function runTwinV4GoldenPixelDiff(input: {
  goldenPng: Buffer;
  livePng: Buffer;
  viewport: TwinV4CanonicalViewport;
  goldenHash: string;
  iteration: number;
  regionMasks?: TwinV4RegionMask[];
}): Promise<{
  fullDiff: TwinV4GoldenDiffReceipt;
  regionDiffs: TwinV4RegionDiffReceipt[];
  heatmapPng: Buffer;
  liveScreenshotHash: string;
}> {
  const refRaw = await normalizePngRaw(input.goldenPng, input.viewport);
  const liveRaw = await normalizePngRaw(input.livePng, input.viewport);
  const { width, height } = input.viewport;
  const diff = Buffer.alloc(width * height * 4);
  const mismatch = pixelmatch(refRaw, liveRaw, diff, width, height, { threshold: 0.1 });
  const totalPixels = width * height;
  const diffPercent = mismatch / totalPixels;
  const fullDiff: TwinV4GoldenDiffReceipt = {
    goldenHash: input.goldenHash,
    liveScreenshotHash: await sha256Hex(new Uint8Array(input.livePng)),
    viewport: input.viewport,
    differingPixels: mismatch,
    totalPixels,
    diffPercent,
    threshold: TWIN_V42_FULL_PAGE_DIFF_THRESHOLD,
    pass: diffPercent <= TWIN_V42_FULL_PAGE_DIFF_THRESHOLD,
    iteration: input.iteration,
  };

  const heatmapPng = await sharp(diff, {
    raw: { width, height, channels: 4 },
  })
    .png()
    .toBuffer();

  const masks = input.regionMasks ?? defaultRegionMasks(width, height);
  const regionDiffs: TwinV4RegionDiffReceipt[] = [];
  for (const mask of masks) {
    const cropW = Math.max(1, Math.min(mask.width, width - mask.x));
    const cropH = Math.max(1, Math.min(mask.height, height - mask.y));
    const refCrop = await sharp(input.goldenPng)
      .extract({ left: mask.x, top: mask.y, width: cropW, height: cropH })
      .resize(cropW, cropH, { fit: 'fill' })
      .ensureAlpha()
      .raw()
      .toBuffer();
    const liveCrop = await sharp(input.livePng)
      .extract({ left: mask.x, top: mask.y, width: cropW, height: cropH })
      .resize(cropW, cropH, { fit: 'fill' })
      .ensureAlpha()
      .raw()
      .toBuffer();
    const regionDiffBuf = Buffer.alloc(cropW * cropH * 4);
    const regionMismatch = pixelmatch(refCrop, liveCrop, regionDiffBuf, cropW, cropH, { threshold: 0.1 });
    const regionTotal = cropW * cropH;
    const regionDiffPercent = regionMismatch / regionTotal;
    const threshold =
      mask.critical ? TWIN_V42_CRITICAL_REGION_DIFF_THRESHOLD : TWIN_V42_SECONDARY_REGION_DIFF_THRESHOLD;
    regionDiffs.push({
      regionId: mask.regionId,
      differingPixels: regionMismatch,
      totalPixels: regionTotal,
      diffPercent: regionDiffPercent,
      threshold,
      pass: regionDiffPercent <= threshold,
    });
  }

  return { fullDiff, regionDiffs, heatmapPng, liveScreenshotHash: fullDiff.liveScreenshotHash };
}
