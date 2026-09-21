/**
 * P0.VR.3J.1 — Durable implementation snapshot metadata (P0.VR.3E companion to Supabase bytes).
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import type { DesignViewportClass } from '../p0vr2/types.js';
import type { ImplementationSnapshotRecord } from './types.js';
import {
  IMPLEMENTATION_SNAPSHOT_PERSISTENT_REGISTRY_RELATIVE_PATH,
  IMPLEMENTATION_SNAPSHOT_PERSISTENT_REGISTRY_STORAGE_PATH,
} from './constants.js';

export type ImplementationSnapshotPersistentRegistry = {
  schemaVersion: 'site00-implementation-snapshot-persistent@1';
  updatedAt: string;
  records: ImplementationSnapshotRecord[];
};

function defaultRegistry(): ImplementationSnapshotPersistentRegistry {
  return {
    schemaVersion: 'site00-implementation-snapshot-persistent@1',
    updatedAt: new Date().toISOString(),
    records: [],
  };
}

export function resolvePersistentRegistryPath(repoRoot: string): string {
  return join(repoRoot, IMPLEMENTATION_SNAPSHOT_PERSISTENT_REGISTRY_RELATIVE_PATH);
}

export function loadPersistentImplementationSnapshotRegistry(
  repoRoot: string,
): ImplementationSnapshotPersistentRegistry {
  const path = resolvePersistentRegistryPath(repoRoot);
  if (!existsSync(path)) return defaultRegistry();
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as ImplementationSnapshotPersistentRegistry;
  } catch {
    return defaultRegistry();
  }
}

export function savePersistentImplementationSnapshotRegistry(
  repoRoot: string,
  registry: ImplementationSnapshotPersistentRegistry,
): void {
  const path = resolvePersistentRegistryPath(repoRoot);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify({ ...registry, updatedAt: new Date().toISOString() }, null, 2), 'utf8');
}

function pointerKey(
  projectId: string,
  designScreenId: string,
  viewportClass: DesignViewportClass,
  visualStateId: string | null,
): string {
  return `${projectId}:${designScreenId}:${viewportClass}:${visualStateId ?? 'base'}`;
}

export function findPersistentImplementationSnapshotById(
  registry: ImplementationSnapshotPersistentRegistry,
  snapshotId: string,
): ImplementationSnapshotRecord | null {
  const id = snapshotId.trim();
  if (!id) return null;
  const matches = registry.records.filter((r) => r.snapshotId === id);
  if (matches.length === 0) return null;
  return [...matches].sort((a, b) => b.capturedAt.localeCompare(a.capturedAt))[0]!;
}

export async function loadPersistentImplementationSnapshotRegistryDurable(
  repoRoot: string,
): Promise<ImplementationSnapshotPersistentRegistry> {
  const local = loadPersistentImplementationSnapshotRegistry(repoRoot);
  if (process.env.VITEST === 'true') return local;
  try {
    const { downloadSite00StorageText } = await import('../../../../api/_lib/site00Assts/storage.js');
    const remoteText = await downloadSite00StorageText(IMPLEMENTATION_SNAPSHOT_PERSISTENT_REGISTRY_STORAGE_PATH);
    if (!remoteText?.trim()) return local;
    const remote = JSON.parse(remoteText) as ImplementationSnapshotPersistentRegistry;
    if (!remote.records?.length) return local;
    const byId = new Map<string, ImplementationSnapshotRecord>();
    for (const record of local.records) byId.set(record.snapshotId, record);
    for (const record of remote.records) {
      const existing = byId.get(record.snapshotId);
      if (!existing || record.capturedAt >= existing.capturedAt) {
        byId.set(record.snapshotId, record);
      }
    }
    return {
      schemaVersion: 'site00-implementation-snapshot-persistent@1',
      updatedAt: new Date().toISOString(),
      records: [...byId.values()],
    };
  } catch {
    return local;
  }
}

export async function persistRegistryToSupabaseStorage(
  repoRoot: string,
  registry: ImplementationSnapshotPersistentRegistry,
): Promise<void> {
  if (process.env.VITEST === 'true') return;
  try {
    const { uploadSite00AssetBuffer } = await import('../../../../api/_lib/site00Assts/storage.js');
    const body = Buffer.from(JSON.stringify(registry, null, 2), 'utf8');
    await uploadSite00AssetBuffer(IMPLEMENTATION_SNAPSHOT_PERSISTENT_REGISTRY_STORAGE_PATH, body, 'application/json', {
      upsert: true,
    });
  } catch {
    /* Supabase unavailable in some environments */
  }
}

export function appendPersistentImplementationSnapshot(
  repoRoot: string,
  record: ImplementationSnapshotRecord,
): ImplementationSnapshotPersistentRegistry {
  const registry = loadPersistentImplementationSnapshotRegistry(repoRoot);
  registry.records.push(record);
  savePersistentImplementationSnapshotRegistry(repoRoot, registry);
  void persistRegistryToSupabaseStorage(repoRoot, registry);
  return registry;
}

export function resolveLatestPersistentSnapshots(
  registry: ImplementationSnapshotPersistentRegistry,
): Map<string, ImplementationSnapshotRecord> {
  const byKey = new Map<string, ImplementationSnapshotRecord[]>();
  for (const record of registry.records) {
    const key = pointerKey(record.projectId, record.designScreenId, record.viewportClass, record.visualStateId);
    const list = byKey.get(key) ?? [];
    list.push(record);
    byKey.set(key, list);
  }

  const latest = new Map<string, ImplementationSnapshotRecord>();
  for (const [key, records] of byKey) {
    const sorted = [...records].sort((a, b) => b.capturedAt.localeCompare(a.capturedAt));
    const current = sorted.find((r) => r.captureStatus === 'CURRENT' && r.qaPassed) ?? sorted[0]!;
    latest.set(key, current);
  }
  return latest;
}
