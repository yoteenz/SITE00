/**
 * P0.VR.CAPTURE.1R3 — Artifact byte validation guards (Node / vitest only).
 */

import { createHash } from 'node:crypto';
import type { ImageArtifactReceipt } from './types.js';

export function computeArtifactChecksum(buffer: Buffer | Uint8Array): string {
  return createHash('sha256').update(buffer).digest('hex').slice(0, 16);
}

export function validateImageArtifactBuffer(input: {
  artifactId: string;
  sourceType: string;
  sourceId: string;
  buffer: Buffer | Uint8Array | null;
  mimeType?: string;
  width?: number | null;
  height?: number | null;
}): ImageArtifactReceipt {
  const createdAt = new Date().toISOString();
  if (!input.buffer || input.buffer.length === 0) {
    return {
      artifactId: input.artifactId,
      sourceType: input.sourceType,
      sourceId: input.sourceId,
      byteSize: 0,
      mimeType: input.mimeType ?? 'application/octet-stream',
      width: input.width ?? null,
      height: input.height ?? null,
      checksum: null,
      createdAt,
      status: 'ARTIFACT_EMPTY',
    };
  }

  const byteSize = input.buffer.length;
  const mimeType = input.mimeType ?? sniffImageMime(input.buffer) ?? 'application/octet-stream';
  const isImage = mimeType.startsWith('image/') && hasImageMagicBytes(input.buffer);

  return {
    artifactId: input.artifactId,
    sourceType: input.sourceType,
    sourceId: input.sourceId,
    byteSize,
    mimeType,
    width: input.width ?? null,
    height: input.height ?? null,
    checksum: computeArtifactChecksum(input.buffer),
    createdAt,
    status: isImage ? 'VALID' : 'ARTIFACT_INVALID',
  };
}

function sniffImageMime(buffer: Buffer | Uint8Array): string | null {
  if (buffer.length >= 8 && buffer[0] === 0x89 && buffer[1] === 0x50) return 'image/png';
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8) return 'image/jpeg';
  if (buffer.length >= 4 && buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46) {
    return 'image/webp';
  }
  return null;
}

function hasImageMagicBytes(buffer: Buffer | Uint8Array): boolean {
  return sniffImageMime(buffer) != null;
}

export { isInvalidPersistedAssetRef, isPersistableCaptureUrl } from './persistableCaptureUrl.js';
