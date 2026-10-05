/**
 * P0.VR.4R2 — Crop byte checksum for provider input proof.
 */

import { createHash } from 'node:crypto';

export function hashCropBuffer(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex').slice(0, 16);
}

export function cropChecksumMatches(stored: string | null, actual: string): boolean {
  if (!stored) return false;
  return stored === actual;
}
