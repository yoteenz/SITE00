/**
 * P0.VR.4R1 — Extract reference crop with sharp and upload for FAL access.
 */

import sharp from 'sharp';
import {
  PROJECTS_HEADER_PLANET_CROP,
  PROJECTS_INDEX_APPROVED_REFERENCE_PATH,
  type CropRegion,
} from './browserConstants.js';
import { buildCropStoragePath } from '../p0vr4/referenceCrop.js';
import { uploadCanonicalAsset } from './liveFalProvider.js';

export type { CropRegion };
export { PROJECTS_HEADER_PLANET_CROP, PROJECTS_INDEX_APPROVED_REFERENCE_PATH };

export async function extractAndUploadReferenceCrop(input: {
  referenceImagePath: string;
  projectId: string;
  pageId: string;
  regionId: string;
  crop: CropRegion;
  version?: number;
}): Promise<{ cropUrl: string; storagePath: string; width: number; height: number }> {
  const padding = input.crop.padding ?? 8;
  const left = Math.max(0, Math.round(input.crop.x - padding));
  const top = Math.max(0, Math.round(input.crop.y - padding));
  const width = Math.round(input.crop.width + padding * 2);
  const height = Math.round(input.crop.height + padding * 2);

  const buffer = await sharp(input.referenceImagePath)
    .extract({ left, top, width, height })
    .png()
    .toBuffer();

  const meta = await sharp(buffer).metadata();
  const version = input.version ?? 1;
  const storagePath = buildCropStoragePath({
    projectId: input.projectId,
    pageId: input.pageId,
    regionId: input.regionId,
    version,
  });

  const upload = await uploadCanonicalAsset({ storagePath, buffer, mimeType: 'image/png' });
  return {
    cropUrl: upload.publicUrl,
    storagePath: upload.storagePath,
    width: meta.width ?? width,
    height: meta.height ?? height,
  };
}

export function resolveReferenceImageAbsolutePath(repoRoot: string): string {
  return `${repoRoot}/public${PROJECTS_INDEX_APPROVED_REFERENCE_PATH}`;
}

export function buildCropRegionFromConstants(): {
  sourceScreenshotId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  padding: number;
  cropUrl: string | null;
  cropVersion: number;
} {
  const padding = PROJECTS_HEADER_PLANET_CROP.padding ?? 8;
  return {
    sourceScreenshotId: 'projects-approved-reference-v1',
    x: Math.max(0, PROJECTS_HEADER_PLANET_CROP.x - padding),
    y: Math.max(0, PROJECTS_HEADER_PLANET_CROP.y - padding),
    width: PROJECTS_HEADER_PLANET_CROP.width + padding * 2,
    height: PROJECTS_HEADER_PLANET_CROP.height + padding * 2,
    padding,
    cropUrl: null,
    cropVersion: 1,
  };
}
