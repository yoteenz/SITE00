/**
 * Visual difference heatmap generation.
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import type { MismatchKind, VisualDifferenceHeatmap } from '../types.js';

export type HeatmapInput = {
  diffBuffer: Buffer;
  width: number;
  height: number;
  comparisonId: string;
  outputDir: string;
  mismatchPixels: number;
  totalPixels: number;
};

export async function generateVisualDifferenceHeatmap(input: HeatmapInput): Promise<VisualDifferenceHeatmap> {
  mkdirSync(input.outputDir, { recursive: true });
  const outputPath = join(input.outputDir, `${input.comparisonId}-heatmap.png`);

  await sharp(input.diffBuffer, {
    raw: { width: input.width, height: input.height, channels: 4 },
  })
    .png()
    .toFile(outputPath);

  const mismatchRatio = input.mismatchPixels / Math.max(1, input.totalPixels);
  const hotspots = sampleHotspots(input.diffBuffer, input.width, input.height);

  return {
    heatmapId: `hm-${input.comparisonId}`,
    comparisonId: input.comparisonId,
    width: input.width,
    height: input.height,
    outputPath,
    mismatchPixels: input.mismatchPixels,
    totalPixels: input.totalPixels,
    mismatchRatio,
    hotspots,
  };
}

function sampleHotspots(
  diff: Buffer,
  width: number,
  height: number,
): Array<{ x: number; y: number; intensity: number; kind: MismatchKind }> {
  const hotspots: Array<{ x: number; y: number; intensity: number; kind: MismatchKind }> = [];
  const step = Math.max(8, Math.floor(width / 40));

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const i = (y * width + x) * 4;
      const intensity = (diff[i]! + diff[i + 1]! + diff[i + 2]!) / (3 * 255);
      if (intensity > 0.25) {
        hotspots.push({ x, y, intensity, kind: intensity > 0.6 ? 'GEOMETRY' : 'COLOR' });
      }
    }
  }

  return hotspots.slice(0, 24);
}

export function writeHeatmapManifest(heatmap: VisualDifferenceHeatmap, manifestPath: string): void {
  writeFileSync(manifestPath, JSON.stringify(heatmap, null, 2));
}
