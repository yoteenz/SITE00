/**
 * Client-side reference board prep — keep uploads under API body limits.
 * iOS Photos often yields HEIC or empty `file.type`; prefer object URLs for decode on Safari.
 */

const TARGET_MAX_CHARS = 3_500_000;
const MAX_WIDTH = 2400;

export function isLikelyReferenceBoardImageFile(file: File): boolean {
  if (file.type.startsWith('image/')) return true;
  return /\.(jpe?g|png|webp|heic|heif)$/i.test(file.name);
}

function isAppleMobileBrowser(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('Could not read photo from this device — try again or pick a JPG export.'));
    reader.readAsDataURL(file);
  });
}

function loadImageFromUrl(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(
        new Error(
          'Could not decode this image format — use PNG or JPG (iPhone: Settings → Camera → Formats → Most Compatible).',
        ),
      );
    img.src = src;
  });
}

function imagePixelSize(img: HTMLImageElement): { width: number; height: number } {
  const width = img.naturalWidth || img.width;
  const height = img.naturalHeight || img.height;
  if (!Number.isFinite(width) || !Number.isFinite(height) || width < 1 || height < 1) {
    throw new Error('Could not read image dimensions from photo — try exporting as JPG.');
  }
  return { width, height };
}

function drawToJpegDataUrl(
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  quality: number,
  closeBitmap?: () => void,
): string {
  if (!Number.isFinite(sourceWidth) || !Number.isFinite(sourceHeight) || sourceWidth < 1 || sourceHeight < 1) {
    throw new Error('Could not read image dimensions from photo — try exporting as JPG.');
  }
  const scale = sourceWidth > MAX_WIDTH ? MAX_WIDTH / sourceWidth : 1;
  const width = Math.max(1, Math.round(sourceWidth * scale));
  const height = Math.max(1, Math.round(sourceHeight * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable — try a smaller JPG or another browser.');
  ctx.drawImage(source, 0, 0, width, height);
  closeBitmap?.();
  return canvas.toDataURL('image/jpeg', quality);
}

async function decodeFileViaObjectUrl(file: File, quality: number): Promise<string> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImageFromUrl(objectUrl);
    const { width, height } = imagePixelSize(img);
    return drawToJpegDataUrl(img, width, height, quality);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function decodeFileViaDataUrl(file: File, quality: number): Promise<string> {
  const dataUrl = await readFileAsDataUrl(file);
  if (!dataUrl.startsWith('data:image/')) {
    throw new Error('Could not read image data — pick PNG or JPG from Photos.');
  }
  const img = await loadImageFromUrl(dataUrl);
  const { width, height } = imagePixelSize(img);
  return drawToJpegDataUrl(img, width, height, quality);
}

async function decodeFileViaImageBitmap(file: File, quality: number): Promise<string> {
  const bitmap = await createImageBitmap(file);
  if (!bitmap || typeof bitmap.width !== 'number' || typeof bitmap.height !== 'number') {
    bitmap?.close?.();
    throw new Error('Could not decode photo — try JPG export from Photos.');
  }
  if (bitmap.width < 1 || bitmap.height < 1) {
    bitmap.close();
    throw new Error('Could not read image dimensions from photo — try exporting as JPG.');
  }
  try {
    return drawToJpegDataUrl(bitmap, bitmap.width, bitmap.height, quality, () => bitmap.close());
  } catch (err) {
    bitmap.close();
    throw err;
  }
}

async function rasterizeFileToJpegDataUrl(file: File, quality: number): Promise<string> {
  const attempts: Array<() => Promise<string>> = [];

  if (isAppleMobileBrowser()) {
    attempts.push(() => decodeFileViaObjectUrl(file, quality));
    attempts.push(() => decodeFileViaDataUrl(file, quality));
  } else {
    if (typeof createImageBitmap !== 'undefined') {
      attempts.push(() => decodeFileViaImageBitmap(file, quality));
    }
    attempts.push(() => decodeFileViaObjectUrl(file, quality));
    attempts.push(() => decodeFileViaDataUrl(file, quality));
  }

  let lastError: Error | null = null;
  for (const attempt of attempts) {
    try {
      return await attempt();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }
  throw lastError ?? new Error('Could not prepare photo for upload — try a JPG export.');
}

async function compressDataUrl(dataUrl: string, quality: number): Promise<string> {
  const img = await loadImageFromUrl(dataUrl);
  const { width, height } = imagePixelSize(img);
  return drawToJpegDataUrl(img, width, height, quality);
}

function shouldRasterizeBeforeUpload(file: File): boolean {
  if (!file.type.trim()) return true;
  const lower = file.type.toLowerCase();
  if (lower.includes('heic') || lower.includes('heif')) return true;
  if (/\.heic$/i.test(file.name) || /\.heif$/i.test(file.name)) return true;
  if (file.size > 4_000_000) return true;
  if (isAppleMobileBrowser()) return true;
  return false;
}

export async function prepareReferenceBoardUpload(file: File): Promise<string> {
  if (!isLikelyReferenceBoardImageFile(file)) {
    throw new Error(
      'Reference board must be an image (PNG or JPG). iPhone: Settings → Camera → Formats → Most Compatible, then re-export the photo.',
    );
  }

  if (shouldRasterizeBeforeUpload(file)) {
    for (const quality of [0.92, 0.85, 0.75, 0.65, 0.55]) {
      const dataUrl = await rasterizeFileToJpegDataUrl(file, quality);
      if (dataUrl.length <= TARGET_MAX_CHARS) return dataUrl;
    }
    throw new Error(
      'Reference board is still too large after compression — export a smaller width (max ~2400px) and retry.',
    );
  }

  let dataUrl = await readFileAsDataUrl(file);
  if (!dataUrl.startsWith('data:image/')) {
    return rasterizeFileToJpegDataUrl(file, 0.85);
  }
  if (dataUrl.length <= TARGET_MAX_CHARS) return dataUrl;

  for (const quality of [0.92, 0.85, 0.75, 0.65]) {
    dataUrl = await compressDataUrl(dataUrl, quality);
    if (dataUrl.length <= TARGET_MAX_CHARS) return dataUrl;
  }

  throw new Error(
    'Reference board is still too large after compression — export a smaller width (max ~2400px) and retry.',
  );
}

/** Parse MIME from a data URL (for API upload after client prep). */
export function mimeTypeFromDataUrl(dataUrl: string): string {
  const match = /^data:([^;]+);/i.exec(dataUrl.trim());
  return match?.[1]?.toLowerCase() ?? 'image/jpeg';
}
