/**
 * B5.7 — Read intrinsic image/video dimensions for classification.
 */

import type { CampaignAssetMediaMetadata } from '../../../shared/site00-campaign-package/assetIngestion/types.js';
import { buildMediaMetadata, inferMediaType } from '../../../shared/site00-campaign-package/assetIngestion/aspectRatioClassification.js';

export async function readCampaignAssetMediaMetadata(file: File): Promise<CampaignAssetMediaMetadata> {
  const mediaType = inferMediaType(file.type);

  if (mediaType === 'VIDEO') {
    return readVideoMetadata(file);
  }
  if (mediaType === 'IMAGE' || mediaType === 'GIF') {
    return readImageMetadata(file);
  }

  return buildMediaMetadata({
    width: 1080,
    height: 1080,
    mimeType: file.type || 'application/octet-stream',
    fileSize: file.size,
  });
}

function readImageMetadata(file: File): Promise<CampaignAssetMediaMetadata> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(
        buildMediaMetadata({
          width: img.naturalWidth,
          height: img.naturalHeight,
          mimeType: file.type,
          fileSize: file.size,
        }),
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to read image dimensions'));
    };
    img.src = url;
  });
}

function readVideoMetadata(file: File): Promise<CampaignAssetMediaMetadata> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(
        buildMediaMetadata({
          width: video.videoWidth,
          height: video.videoHeight,
          mimeType: file.type,
          fileSize: file.size,
          duration: Number.isFinite(video.duration) ? video.duration : undefined,
        }),
      );
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to read video metadata'));
    };
    video.src = url;
  });
}
