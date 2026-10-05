/**
 * Node-only sharp measurement for locked founder authority JPGs (vitest / server).
 * Browser builds must not statically import this module — use dynamic import from the browser-safe entry.
 */

import path from 'node:path';
import sharp from 'sharp';

export function resolveFounderAuthorityAbsolutePath(publicPath: string): string {
  const rel = publicPath.replace(/^\//, '');
  return path.join(process.cwd(), 'public', rel);
}

async function measureRowBands(imagePath: string, bandCount: number): Promise<number[]> {
  const { data, info } = await sharp(imagePath)
    .resize({ width: 160, withoutEnlargement: true })
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const rowEnergy: number[] = [];
  for (let y = 0; y < info.height; y++) {
    let sum = 0;
    for (let x = 0; x < info.width; x++) {
      sum += data[y * info.width + x] ?? 0;
    }
    rowEnergy.push(sum / info.width);
  }
  const edges: number[] = [];
  for (let i = 1; i < rowEnergy.length; i++) {
    edges.push(Math.abs(rowEnergy[i]! - rowEnergy[i - 1]!));
  }
  const threshold = edges.reduce((a, b) => a + b, 0) / edges.length;
  const bandYs: number[] = [];
  for (let i = 0; i < edges.length; i++) {
    if (edges[i]! > threshold * 1.35) {
      bandYs.push(i / edges.length);
    }
  }
  while (bandYs.length < bandCount) {
    bandYs.push(bandYs.length / bandCount);
  }
  return bandYs.slice(0, bandCount);
}

export async function measureLockedFounderAuthorityPixels(
  authorityImageUri: string,
  spec: { widthPx: number; heightPx: number },
  bandCount = 8,
): Promise<{ width: number; height: number; rowBandAdjustments: number[] }> {
  const imagePath = resolveFounderAuthorityAbsolutePath(authorityImageUri);
  const meta = await sharp(imagePath).metadata();
  const width = meta.width ?? spec.widthPx;
  const height = meta.height ?? spec.heightPx;
  const rowBandAdjustments = await measureRowBands(imagePath, bandCount);
  return { width, height, rowBandAdjustments };
}
