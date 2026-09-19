/**
 * P0.VR.CAPTURE.1R3A — Persist page-scoped canonical references across reloads.
 */

import type { CanonicalVisualReference, VisualImplementationCanon } from './types.js';
import {
  listCanonicalReferences,
  listImplementationCanons,
  seedCanonicalRegistry,
  seedImplementationCanons,
} from './canonicalReferenceRegistry.js';
import { notifyFounderDesignWorkspaceCloudSync } from '../p0vrCapture1/founderDesignWorkspaceCloudSyncHook.js';

const LS_PREFIX = 'site00:canonical-registry:' as const;
const memorySnapshots = new Map<string, string>();

type RegistrySnapshot = {
  references: CanonicalVisualReference[];
  canons: VisualImplementationCanon[];
  savedAt: string;
};

function readSnapshot(projectId: string): RegistrySnapshot | null {
  const raw =
    typeof globalThis.localStorage !== 'undefined'
      ? globalThis.localStorage.getItem(`${LS_PREFIX}${projectId}`)
      : memorySnapshots.get(projectId);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as RegistrySnapshot;
  } catch {
    return null;
  }
}

function writeSnapshot(projectId: string, snapshot: RegistrySnapshot): void {
  const raw = JSON.stringify(snapshot);
  if (typeof globalThis.localStorage !== 'undefined') {
    try {
      globalThis.localStorage.setItem(`${LS_PREFIX}${projectId}`, raw);
      return;
    } catch {
      /* quota — fall through to memory */
    }
  }
  memorySnapshots.set(projectId, raw);
}

export function persistCanonicalRegistrySnapshot(projectId: string): void {
  const snapshot: RegistrySnapshot = {
    references: listCanonicalReferences(projectId),
    canons: listImplementationCanons(projectId),
    savedAt: new Date().toISOString(),
  };
  writeSnapshot(projectId, snapshot);
  notifyFounderDesignWorkspaceCloudSync(projectId);
}

export function hydrateCanonicalRegistryFromStorage(projectId: string): boolean {
  const snapshot = readSnapshot(projectId);
  if (!snapshot) return false;
  if (snapshot.references?.length) {
    seedCanonicalRegistry(snapshot.references);
  }
  if (snapshot.canons?.length) {
    seedImplementationCanons(snapshot.canons);
  }
  return Boolean(snapshot.references?.length || snapshot.canons?.length);
}

export function clearCanonicalRegistryStorageForTest(projectId?: string): void {
  if (projectId) {
    memorySnapshots.delete(projectId);
    if (typeof globalThis.localStorage !== 'undefined') {
      globalThis.localStorage.removeItem(`${LS_PREFIX}${projectId}`);
    }
    return;
  }
  memorySnapshots.clear();
  if (typeof globalThis.localStorage === 'undefined') return;
  for (let i = globalThis.localStorage.length - 1; i >= 0; i--) {
    const key = globalThis.localStorage.key(i);
    if (key?.startsWith(LS_PREFIX)) globalThis.localStorage.removeItem(key);
  }
}
