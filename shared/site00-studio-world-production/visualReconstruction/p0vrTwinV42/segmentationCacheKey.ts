import { TWIN_V42_SEGMENTATION_VERSION, TWIN_V42_STORAGE_PREFIX } from './constants.js';

export function twinV42SegmentationCacheKey(goldenSha256: string): string {
  return `${TWIN_V42_STORAGE_PREFIX}segmentation:${goldenSha256}:${TWIN_V42_SEGMENTATION_VERSION}`;
}
