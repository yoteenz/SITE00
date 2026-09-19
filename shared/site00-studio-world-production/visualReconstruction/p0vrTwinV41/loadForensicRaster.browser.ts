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

export async function loadForensicRasterFromUri(imageUri: string): Promise<ForensicRaster> {
  if (imageUri.startsWith('file://')) {
    throw new Error('TWIN_V41_RASTER_FILE_URI_BROWSER_BLOCKED');
  }

  const fetchUri =
    imageUri.startsWith('/') && !imageUri.startsWith('//') ? imageUri
    : imageUri.startsWith('http://') || imageUri.startsWith('https://') ? imageUri
    : null;

  if (!fetchUri) throw new Error('TWIN_V41_RASTER_URI_UNSUPPORTED');

  const res = await fetch(fetchUri);
  if (!res.ok) throw new Error(`FORENSIC_RASTER_FETCH_FAILED:${res.status}`);
  return parsePngBytesBrowser(await res.arrayBuffer());
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
