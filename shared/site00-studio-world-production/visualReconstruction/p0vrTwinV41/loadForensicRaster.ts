import { fnv1aHex } from '../p0vrTwinV30/mobileTwinPipeline/runGenerateMobileTwinPackageCore.js';
import { site00IsBrowser } from '../../runtime/site00RuntimeEnv.js';

export type ForensicRaster = {
  width: number;
  height: number;
  data: Uint8Array;
  sourcePixelHash: string;
};

function hashRasterData(data: Uint8Array): string {
  return fnv1aHex(data.subarray(0, Math.min(data.length, 65536)).toString());
}

async function parsePngBytesNode(buf: ArrayBuffer): Promise<ForensicRaster> {
  const { PNG } = await import('pngjs');
  const png = PNG.sync.read(Buffer.from(buf));
  const data = new Uint8Array(png.data);
  return {
    width: png.width,
    height: png.height,
    data,
    sourcePixelHash: hashRasterData(data),
  };
}

async function parsePngBytesBrowser(buf: ArrayBuffer): Promise<ForensicRaster> {
  const blob = new Blob([buf], { type: 'image/png' });
  const bitmap = await createImageBitmap(blob);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('TWIN_V41_CANVAS_UNAVAILABLE');
  ctx.drawImage(bitmap, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = new Uint8Array(imageData.data);
  bitmap.close();
  return {
    width: canvas.width,
    height: canvas.height,
    data,
    sourcePixelHash: hashRasterData(data),
  };
}

async function parsePngBytes(buf: ArrayBuffer): Promise<ForensicRaster> {
  return site00IsBrowser() ? parsePngBytesBrowser(buf) : parsePngBytesNode(buf);
}

async function readNodeFile(path: string): Promise<ArrayBuffer> {
  const { readFileSync } = await import('node:fs');
  const file = readFileSync(path);
  return file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength);
}

export async function loadForensicRasterFromUri(imageUri: string): Promise<ForensicRaster> {
  if (imageUri.startsWith('file://')) {
    if (site00IsBrowser()) {
      throw new Error('TWIN_V41_RASTER_FILE_URI_BROWSER_BLOCKED');
    }
    const path = decodeURIComponent(imageUri.slice('file://'.length));
    return parsePngBytes(await readNodeFile(path));
  }

  if (imageUri.startsWith('/') && !imageUri.startsWith('//')) {
    if (site00IsBrowser()) {
      const res = await fetch(imageUri);
      if (!res.ok) throw new Error(`FORENSIC_RASTER_FETCH_FAILED:${res.status}`);
      return parsePngBytes(await res.arrayBuffer());
    }
    const path = `${process.cwd()}${imageUri}`;
    return parsePngBytes(await readNodeFile(path));
  }

  if (imageUri.startsWith('http://') || imageUri.startsWith('https://')) {
    const res = await fetch(imageUri);
    if (!res.ok) throw new Error(`FORENSIC_RASTER_FETCH_FAILED:${res.status}`);
    return parsePngBytes(await res.arrayBuffer());
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
