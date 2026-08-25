/**
 * P0.5E.4C — Founder character reference image upload for CAST NDX.
 */

import sharp from 'sharp';
import {
  getSite00AssetPublicUrl,
  uploadSite00AssetBuffer,
} from '../../site00Assts/storage.js';
import { parseReferenceBoardImageData } from '../founderCreativeIngestion/referenceBoardUpload.js';

export function buildCastingReferenceStoragePath(projectId: string, referenceId: string): string {
  const safe = (value: string) => value.replace(/[^a-zA-Z0-9-_]/g, '_');
  return `site00/character-casting-references/${safe(projectId)}/${safe(referenceId)}.webp`;
}

export async function uploadCastingReferenceImage(params: {
  projectId: string;
  referenceId: string;
  imageData: string;
}): Promise<{ storagePath: string; previewUrl: string }> {
  const input = parseReferenceBoardImageData(params.imageData);
  const storagePath = buildCastingReferenceStoragePath(params.projectId, params.referenceId);

  if (process.env.VITEST === 'true') {
    return { storagePath, previewUrl: `https://vitest.local/${storagePath}` };
  }

  const webp = await sharp(input).rotate().webp({ quality: 88 }).toBuffer();
  const { publicUrl, storagePath: storedPath } = await uploadSite00AssetBuffer(
    storagePath,
    webp,
    'image/webp',
    { upsert: true },
  );
  return { storagePath: storedPath, previewUrl: publicUrl };
}
