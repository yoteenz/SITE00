/**
 * P0.VR.4 — Reference crop workflow.
 */

import type { DetectedAssetRegion, ReferenceCropRegion } from './types.js';

export function buildReferenceCrop(input: {
  sourceScreenshotId: string;
  region: DetectedAssetRegion;
  screenshotBasePath: string;
  padding?: number;
  cropVersion?: number;
}): ReferenceCropRegion {
  const padding = input.padding ?? 8;
  const x = Math.max(0, input.region.bounds.x - padding);
  const y = Math.max(0, input.region.bounds.y - padding);
  const width = input.region.bounds.width + padding * 2;
  const height = input.region.bounds.height + padding * 2;
  const cropVersion = input.cropVersion ?? 1;

  const cropPath = `${input.screenshotBasePath}/crops/${input.region.regionId}-v${String(cropVersion).padStart(3, '0')}.png`;

  return {
    sourceScreenshotId: input.sourceScreenshotId,
    x,
    y,
    width,
    height,
    padding,
    cropUrl: cropPath,
    cropVersion,
  };
}

export function isValidReferenceCrop(crop: ReferenceCropRegion | null): boolean {
  if (!crop) return false;
  return crop.width > 0 && crop.height > 0 && Boolean(crop.cropUrl);
}

export function buildCropStoragePath(params: {
  projectId: string;
  pageId: string;
  regionId: string;
  version: number;
}): string {
  return `design-assets/${params.projectId}/${params.pageId}/crops/${params.regionId}/v${String(params.version).padStart(3, '0')}.png`;
}
