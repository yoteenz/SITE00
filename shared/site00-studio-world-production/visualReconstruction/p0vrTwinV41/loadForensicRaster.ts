import { PNG } from 'pngjs';
import { fnv1aHex } from '../p0vrTwinV30/mobileTwinPipeline/runGenerateMobileTwinPackageCore.js';
import { site00IsBrowser } from '../../runtime/site00RuntimeEnv.js';

export type ForensicRaster = {
  width: number;
  height: number;
  data: Buffer;
  sourcePixelHash: string;
};

function parsePngBuffer(buf: Buffer): ForensicRaster {
  const png = PNG.sync.read(buf);
  const data = Buffer.from(png.data);
  return {
    width: png.width,
    height: png.height,
    data,
    sourcePixelHash: fnv1aHex(data.subarray(0, Math.min(data.length, 65536)).toString('base64')),
  };
}

async function readNodeFile(path: string): Promise<Buffer> {
  const { readFileSync } = await import('node:fs');
  return readFileSync(path);
}

export async function loadForensicRasterFromUri(imageUri: string): Promise<ForensicRaster> {
  if (imageUri.startsWith('file://')) {
    if (site00IsBrowser()) {
      throw new Error('TWIN_V41_RASTER_FILE_URI_BROWSER_BLOCKED');
    }
    const path = decodeURIComponent(imageUri.slice('file://'.length));
    return parsePngBuffer(await readNodeFile(path));
  }

  if (imageUri.startsWith('/') && !imageUri.startsWith('//')) {
    if (site00IsBrowser()) {
      const res = await fetch(imageUri);
      if (!res.ok) throw new Error(`FORENSIC_RASTER_FETCH_FAILED:${res.status}`);
      return parsePngBuffer(Buffer.from(await res.arrayBuffer()));
    }
    const path = `${process.cwd()}${imageUri}`;
    return parsePngBuffer(await readNodeFile(path));
  }

  if (imageUri.startsWith('http://') || imageUri.startsWith('https://')) {
    const res = await fetch(imageUri);
    if (!res.ok) throw new Error(`FORENSIC_RASTER_FETCH_FAILED:${res.status}`);
    const ab = await res.arrayBuffer();
    return parsePngBuffer(Buffer.from(ab));
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
