/**
 * P0.VR.4R2 — Extract crop using final source-pixel bounds (no double padding).
 */

import sharp from 'sharp';
import { hashCropBuffer } from './cropChecksum.js';
import type { SourcePixelBounds } from './types.js';

export async function extractCropBuffer(input: {
  referenceImagePath: string;
  finalBounds: SourcePixelBounds;
}): Promise<{ buffer: Buffer; width: number; height: number; checksum: string }> {
  const { x, y, width, height } = input.finalBounds;
  const buffer = await sharp(input.referenceImagePath)
    .extract({ left: x, top: y, width, height })
    .png()
    .toBuffer();

  const meta = await sharp(buffer).metadata();
  const checksum = hashCropBuffer(buffer);
  return {
    buffer,
    width: meta.width ?? width,
    height: meta.height ?? height,
    checksum,
  };
}

export async function extractAndUploadReferenceCropV2(input: {
  referenceImagePath: string;
  finalBounds: SourcePixelBounds;
  projectId: string;
  pageId: string;
  regionId: string;
  version?: number;
  upload: (storagePath: string, buffer: Buffer) => Promise<{ publicUrl: string; storagePath: string }>;
  buildStoragePath: (params: { projectId: string; pageId: string; regionId: string; version: number }) => string;
}): Promise<{ cropUrl: string; storagePath: string; width: number; height: number; checksum: string }> {
  const extracted = await extractCropBuffer({
    referenceImagePath: input.referenceImagePath,
    finalBounds: input.finalBounds,
  });
  const version = input.version ?? 1;
  const storagePath = input.buildStoragePath({
    projectId: input.projectId,
    pageId: input.pageId,
    regionId: input.regionId,
    version,
  });
  const upload = await input.upload(storagePath, extracted.buffer);
  return {
    cropUrl: upload.publicUrl,
    storagePath: upload.storagePath,
    width: extracted.width,
    height: extracted.height,
    checksum: extracted.checksum,
  };
}
