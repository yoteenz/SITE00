/**
 * Client-side reference board prep — keep uploads under API body limits.
 */

const TARGET_MAX_CHARS = 3_500_000;
const MAX_WIDTH = 2400;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('Could not read reference board file'));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not load reference board image'));
    img.src = src;
  });
}

async function compressDataUrl(dataUrl: string, quality: number): Promise<string> {
  const img = await loadImage(dataUrl);
  const scale = img.width > MAX_WIDTH ? MAX_WIDTH / img.width : 1;
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable');
  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL('image/jpeg', quality);
}

export async function prepareReferenceBoardUpload(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Reference board must be an image file (PNG or JPG)');
  }
  let dataUrl = await readFileAsDataUrl(file);
  if (dataUrl.length <= TARGET_MAX_CHARS) return dataUrl;

  for (const quality of [0.92, 0.85, 0.75, 0.65]) {
    dataUrl = await compressDataUrl(dataUrl, quality);
    if (dataUrl.length <= TARGET_MAX_CHARS) return dataUrl;
  }

  throw new Error(
    'Reference board is still too large after compression — export a smaller width (max ~2400px) and retry.',
  );
}
