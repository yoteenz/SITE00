/**
 * P0.VR.4R2 — Build + extract projects header planet crop with QA gate.
 */

import sharp from 'sharp';
import { buildCoordinateRecord, applyPaddingToBounds } from './coordinateSpace.js';
import { evaluateReferenceCropQA } from './referenceCropQA.js';
import { upsertCropRecord, lockApprovedCrop, getCropRecord } from './cropLineage.js';
import { extractAndUploadReferenceCropV2 } from './cropExtract.js';
import {
  PROJECTS_REFERENCE_SOURCE_WIDTH,
  PROJECTS_REFERENCE_SOURCE_HEIGHT,
  PROJECTS_HEADER_PLANET_OBJECT_BOUNDS,
  PROJECTS_HEADER_PLANET_PADDING_PERCENT,
} from './projectsHeaderPlanetGoldenCrop.js';
import type { CropCoordinateRecord } from './types.js';

export async function prepareProjectsHeaderPlanetCrop(input: {
  assetId: string;
  referenceImagePath: string;
  sourceScreenshotId: string;
  cropVersion?: number;
  founderAdjustedBounds?: { x: number; y: number; width: number; height: number } | null;
  upload: (storagePath: string, buffer: Buffer) => Promise<{ publicUrl: string; storagePath: string }>;
  buildStoragePath: (params: { projectId: string; pageId: string; regionId: string; version: number }) => string;
}): Promise<{
  coordinate: CropCoordinateRecord;
  qa: ReturnType<typeof evaluateReferenceCropQA>;
  cropUrl: string | null;
  checksum: string | null;
}> {
  const meta = await sharp(input.referenceImagePath).metadata();
  const sourceWidth = meta.width ?? PROJECTS_REFERENCE_SOURCE_WIDTH;
  const sourceHeight = meta.height ?? PROJECTS_REFERENCE_SOURCE_HEIGHT;

  const detectedBounds = PROJECTS_HEADER_PLANET_OBJECT_BOUNDS;
  const objectBounds = input.founderAdjustedBounds ?? detectedBounds;

  const base = buildCoordinateRecord({
    sourceWidth,
    sourceHeight,
    displayWidth: sourceWidth,
    displayHeight: sourceHeight,
    detectedBounds,
    founderAdjustedBounds: input.founderAdjustedBounds ?? null,
    paddingPercent: PROJECTS_HEADER_PLANET_PADDING_PERCENT,
    sourceScreenshotId: input.sourceScreenshotId,
    cropId: `crop-${input.assetId}`,
    cropVersion: input.cropVersion ?? 1,
  });

  const finalBounds = applyPaddingToBounds(objectBounds, PROJECTS_HEADER_PLANET_PADDING_PERCENT, sourceWidth, sourceHeight);

  let coordinate: CropCoordinateRecord = {
    ...base,
    finalBounds,
    normalizedBounds: {
      normalizedX: finalBounds.x / sourceWidth,
      normalizedY: finalBounds.y / sourceHeight,
      normalizedWidth: finalBounds.width / sourceWidth,
      normalizedHeight: finalBounds.height / sourceHeight,
    },
    qaStatus: 'CROP_DRAFT',
    qaFailures: [],
    cropChecksum: null,
    approvedAt: null,
    locked: false,
    generationIdsUsingCrop: [],
  };

  const qa = evaluateReferenceCropQA({ coordinate, assetType: 'HERO_OBJECT' });
  coordinate = { ...coordinate, qaStatus: qa.status, qaFailures: qa.failures };

  let cropUrl: string | null = null;
  let checksum: string | null = null;

  if (qa.pass || qa.status === 'CROP_QA_FAILED') {
    const extracted = await extractAndUploadReferenceCropV2({
      referenceImagePath: input.referenceImagePath,
      finalBounds,
      projectId: 'site00',
      pageId: 'projects-index',
      regionId: 'projects-header-planet',
      version: coordinate.cropVersion,
      upload: input.upload,
      buildStoragePath: input.buildStoragePath,
    });
    cropUrl = extracted.cropUrl;
    checksum = extracted.checksum;
    coordinate = { ...coordinate, cropChecksum: checksum };
  }

  upsertCropRecord(input.assetId, coordinate);

  return { coordinate, qa, cropUrl, checksum };
}

export function approveProjectsHeaderPlanetCrop(assetId: string, checksum: string): CropCoordinateRecord | null {
  return lockApprovedCrop(assetId, checksum);
}

export function getLockedCropForGeneration(assetId: string): CropCoordinateRecord | null {
  const record = getCropRecord(assetId);
  if (!record?.locked || !record.cropChecksum) return null;
  return record;
}
