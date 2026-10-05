/**
 * P0.VR.PAGE-CONCEPT-SNAPSHOT-DURABILITY-FIX1 — durable snapshot lookup + byte load for Railway workers.
 */

import { createHash } from 'node:crypto';
import { registerImplementationSnapshot, getImplementationSnapshot } from './implementationSnapshotRegistry.js';
import {
  findPersistentImplementationSnapshotById,
  loadPersistentImplementationSnapshotRegistryDurable,
} from './implementationSnapshotPersistentStore.js';
import type { ImplementationSnapshotRecord } from './types.js';
import { buildImplementationSnapshotPublicUrl } from './implementationSnapshotStoragePaths.js';

export type ImplementationSnapshotResolveErrorCode =
  | 'SNAPSHOT_RECORD_MISSING'
  | 'SNAPSHOT_BYTES_MISSING'
  | 'SNAPSHOT_STORAGE_UNAVAILABLE'
  | 'SNAPSHOT_CHECKSUM_MISMATCH'
  | 'SNAPSHOT_DECODE_FAILED'
  | 'SNAPSHOT_QA_NOT_PASSED'
  | 'SNAPSHOT_STALE_UNREADABLE';

export type ImplementationSnapshotArtifact = {
  record: ImplementationSnapshotRecord;
  buffer: Buffer;
  base64: string;
  contentType: string;
};

function snapshotErrorCode(
  viewport: 'MOBILE' | 'DESKTOP' | null,
  code: ImplementationSnapshotResolveErrorCode,
): string {
  const prefix = viewport === 'MOBILE' ? 'BLOCKED_MOBILE_' : viewport === 'DESKTOP' ? 'BLOCKED_DESKTOP_' : 'BLOCKED_';
  switch (code) {
    case 'SNAPSHOT_RECORD_MISSING':
      return `${prefix}SNAPSHOT_MISSING`;
    case 'SNAPSHOT_BYTES_MISSING':
    case 'SNAPSHOT_STORAGE_UNAVAILABLE':
    case 'SNAPSHOT_CHECKSUM_MISMATCH':
    case 'SNAPSHOT_DECODE_FAILED':
    case 'SNAPSHOT_QA_NOT_PASSED':
    case 'SNAPSHOT_STALE_UNREADABLE':
      return `${prefix}SNAPSHOT_UNREADABLE`;
    default:
      return 'BLOCKED_CAPTURE_SNAPSHOT_UNREADABLE';
  }
}

function isLikelyImageBuffer(buf: Buffer): boolean {
  if (buf.length < 32) return false;
  if (buf[0] === 0x89 && buf[1] === 0x50) return true; // PNG
  if (buf[0] === 0xff && buf[1] === 0xd8) return true; // JPEG
  if (buf.slice(0, 4).toString('ascii') === 'RIFF') return true; // WEBP container
  return buf.length >= 512;
}

export async function resolveImplementationSnapshotRecord(
  snapshotId: string,
  repoRoot: string,
): Promise<ImplementationSnapshotRecord | null> {
  const trimmed = snapshotId.trim();
  if (!trimmed) return null;
  const inMemory = getImplementationSnapshot(trimmed);
  if (inMemory) return inMemory;
  const registry = await loadPersistentImplementationSnapshotRegistryDurable(repoRoot);
  const fromLedger = findPersistentImplementationSnapshotById(registry, trimmed);
  if (fromLedger) {
    registerImplementationSnapshot(fromLedger);
    return fromLedger;
  }
  return null;
}

export async function loadImplementationSnapshotArtifact(input: {
  snapshotId: string;
  repoRoot: string;
  viewport?: 'MOBILE' | 'DESKTOP' | null;
}): Promise<ImplementationSnapshotArtifact> {
  const viewport = input.viewport ?? null;
  const record = await resolveImplementationSnapshotRecord(input.snapshotId, input.repoRoot);
  if (!record) {
    throw new Error(snapshotErrorCode(viewport, 'SNAPSHOT_RECORD_MISSING'));
  }
  if (record.stale || record.captureStatus === 'STALE' || record.captureStatus === 'MISSING') {
    throw new Error(snapshotErrorCode(viewport, 'SNAPSHOT_STALE_UNREADABLE'));
  }
  if (!record.qaPassed) {
    throw new Error(snapshotErrorCode(viewport, 'SNAPSHOT_QA_NOT_PASSED'));
  }
  const storagePath = record.storagePath?.trim();
  if (!storagePath) {
    throw new Error(snapshotErrorCode(viewport, 'SNAPSHOT_BYTES_MISSING'));
  }

  let buffer: Buffer | null = null;
  try {
    const { downloadSite00StorageBuffer } = await import('../../../../api/_lib/site00Assts/storage.js');
    buffer = await downloadSite00StorageBuffer(storagePath);
  } catch {
    buffer = null;
  }

  if (!buffer?.length) {
    const url = record.publicUrl?.trim() || buildImplementationSnapshotPublicUrl(storagePath);
    const lower = url.toLowerCase();
    if (lower.includes('vitest.local')) {
      throw new Error(snapshotErrorCode(viewport, 'SNAPSHOT_STORAGE_UNAVAILABLE'));
    }
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('fetch failed');
      buffer = Buffer.from(await res.arrayBuffer());
    } catch {
      throw new Error(snapshotErrorCode(viewport, 'SNAPSHOT_STORAGE_UNAVAILABLE'));
    }
  }

  if (!isLikelyImageBuffer(buffer)) {
    throw new Error(snapshotErrorCode(viewport, 'SNAPSHOT_DECODE_FAILED'));
  }

  if (record.checksumSha256) {
    const digest = createHash('sha256').update(buffer).digest('hex');
    if (digest !== record.checksumSha256) {
      throw new Error(snapshotErrorCode(viewport, 'SNAPSHOT_CHECKSUM_MISMATCH'));
    }
  }

  const contentType =
    record.contentType ??
    (storagePath.endsWith('.png') ? 'image/png'
    : storagePath.endsWith('.jpg') || storagePath.endsWith('.jpeg') ? 'image/jpeg'
    : 'image/webp');

  return {
    record,
    buffer,
    base64: buffer.toString('base64'),
    contentType,
  };
}

export function sha256Hex(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex');
}
