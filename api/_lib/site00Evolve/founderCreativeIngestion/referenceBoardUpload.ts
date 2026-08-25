/**
 * P0.CB.1A — Reference board image upload (Supabase storage, not inline JSON).
 */

import sharp from 'sharp';
import { getSite00AssetPublicUrl, uploadSite00AssetBuffer } from '../../site00Assts/storage.js';

const MAX_INPUT_BYTES = 20 * 1024 * 1024;

export function parseReferenceBoardImageData(imageData: string): Buffer {
  const trimmed = imageData.trim();
  const dataUrlMatch = /^data:([^;]+);base64,(.+)$/s.exec(trimmed);
  const base64 = dataUrlMatch ? dataUrlMatch[2] : trimmed;
  const buffer = Buffer.from(base64, 'base64');
  if (!buffer.length) throw new Error('Empty image data');
  if (buffer.length > MAX_INPUT_BYTES) {
    throw new Error('Reference board file is too large — use a smaller export (max ~20MB)');
  }
  return buffer;
}

export function buildReferenceBoardStoragePath(projectId: string, sequenceId: string): string {
  const safe = (value: string) => value.replace(/[^a-zA-Z0-9-_]/g, '_');
  return `site00/founder-creative-ingestion/${safe(projectId)}/references/${safe(sequenceId)}/draft-${Date.now()}.webp`;
}

export async function uploadFounderReferenceBoardImage(params: {
  projectId: string;
  sequenceId: string;
  imageData: string;
}): Promise<{ storagePath: string; previewUrl: string }> {
  const input = parseReferenceBoardImageData(params.imageData);
  const webp = await sharp(input).rotate().webp({ quality: 88 }).toBuffer();
  const storagePath = buildReferenceBoardStoragePath(params.projectId, params.sequenceId);

  if (process.env.VITEST === 'true') {
    return { storagePath, previewUrl: getSite00AssetPublicUrl(storagePath) };
  }

  const { publicUrl, storagePath: storedPath } = await uploadSite00AssetBuffer(
    storagePath,
    webp,
    'image/webp',
    { upsert: true },
  );
  return { storagePath: storedPath, previewUrl: publicUrl };
}
