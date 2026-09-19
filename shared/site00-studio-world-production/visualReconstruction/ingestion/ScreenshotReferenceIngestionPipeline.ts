/**
 * Ingest screenshot reference into NormalizedVisualReference.
 */

import { createHash } from 'node:crypto';
import type { NormalizedVisualReference } from '../types.js';
import { evaluateBrowserChrome } from './BrowserChromeDetectionEvaluation.js';

export type IngestScreenshotInput = {
  sourceAsset: string;
  buffer: Buffer;
  referenceAuthority?: 'PRIMARY' | 'SECONDARY';
  forceMobileChrome?: boolean;
};

export async function ingestScreenshotReference(input: IngestScreenshotInput): Promise<NormalizedVisualReference> {
  const fingerprint = createHash('sha256').update(input.buffer).digest('hex');
  const referenceId = `ref-${fingerprint.slice(0, 16)}`;

  const dimensions = readPngDimensions(input.buffer);
  const chrome = evaluateBrowserChrome(dimensions.width, dimensions.height, {
    forceMobileChrome: input.forceMobileChrome,
  });

  const aspectRatio = dimensions.width / dimensions.height;
  const orientation =
    aspectRatio > 1.05 ? 'landscape' : aspectRatio < 0.95 ? 'portrait' : ('square' as const);

  return {
    referenceId,
    sourceAsset: input.sourceAsset,
    pixelWidth: dimensions.width,
    pixelHeight: dimensions.height,
    aspectRatio,
    orientation,
    detectedDeviceClass: chrome.detectedDeviceClass,
    estimatedViewportWidth: chrome.estimatedViewportWidth,
    estimatedViewportHeight: chrome.estimatedViewportHeight,
    browserChromePresent: chrome.browserChromePresent,
    browserChromeBounds: chrome.browserChromeBounds,
    usablePageBounds: chrome.usablePageBounds,
    croppingState: chrome.browserChromePresent ? 'chrome-excluded' : 'none',
    scrollPositionConfidence: chrome.scrollPositionConfidence,
    referenceAuthority: input.referenceAuthority ?? 'PRIMARY',
    sourceFingerprint: fingerprint,
    ingestedAt: new Date().toISOString(),
  };
}

function readPngDimensions(buffer: Buffer): { width: number; height: number } {
  if (buffer.length >= 24 && buffer[0] === 0x89 && buffer[1] === 0x50) {
    return {
      width: buffer.readUInt32BE(16),
      height: buffer.readUInt32BE(20),
    };
  }
  throw new Error('Unsupported image format — PNG required for ingestion');
}
