/**
 * Node/vitest-only forensic raster loader (pngjs). Never import from `src/` or browser client barrels.
 */

import { readFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { fnv1aHex } from '../p0vrTwinV30/mobileTwinPipeline/runGenerateMobileTwinPackageCore.js';

export type ForensicRaster = {
  width: number;
  height: number;
  data: Uint8Array;
  sourcePixelHash: string;
};

function hashRasterData(data: Uint8Array): string {
  return fnv1aHex(data.subarray(0, Math.min(data.length, 65536)).toString());
}

function parsePngBytesNode(buf: ArrayBuffer): ForensicRaster {
  const png = PNG.sync.read(Buffer.from(buf));
  const data = new Uint8Array(png.data);
  return {
    width: png.width,
    height: png.height,
    data,
    sourcePixelHash: hashRasterData(data),
  };
}

function readNodeFile(path: string): ArrayBuffer {
  const file = readFileSync(path);
  return file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength);
}

export async function loadForensicRasterFromUri(imageUri: string): Promise<ForensicRaster> {
  if (imageUri.startsWith('file://')) {
    const path = decodeURIComponent(imageUri.slice('file://'.length));
    return parsePngBytesNode(readNodeFile(path));
  }

  if (imageUri.startsWith('/') && !imageUri.startsWith('//')) {
    const path = `${process.cwd()}${imageUri}`;
    return parsePngBytesNode(readNodeFile(path));
  }

  if (imageUri.startsWith('http://') || imageUri.startsWith('https://')) {
    const res = await fetch(imageUri);
    if (!res.ok) throw new Error(`FORENSIC_RASTER_FETCH_FAILED:${res.status}`);
    return parsePngBytesNode(await res.arrayBuffer());
  }

  throw new Error('TWIN_V41_RASTER_URI_UNSUPPORTED');
}

export function rgbaAt(raster: ForensicRaster, x: number, y: number): [number, number, number, number] {
  const xi = Math.max(0, Math.min(raster.width - 1, Math.floor(x)));
  const yi = Math.max(0, Math.min(raster.height - 1, Math.floor(y)));
  const i = (yi * raster.width + xi) * 4;
  return [raster.data[i]!, raster.data[i + 1]!, raster.data[i + 2]!, raster.data[i + 3]!];
}

export function rgbToHex(r: number, g: number, b: number): string {
  const h = (n: number) => n.toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`;
}
