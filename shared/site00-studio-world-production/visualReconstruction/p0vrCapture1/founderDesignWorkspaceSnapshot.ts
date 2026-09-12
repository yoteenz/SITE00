/**
 * P0.VR.CAPTURE.1R3B — Durable founder design workspace snapshot (authority + capture bindings).
 * Image bytes live in Supabase storage; this JSON is metadata + public URLs only (no data: URLs).
 */

import type { CanonicalVisualReference, VisualImplementationCanon } from '../p0vr2/types.js';
import {
  listCanonicalReferences,
  listImplementationCanons,
  seedCanonicalRegistry,
  seedImplementationCanons,
} from '../p0vr2/canonicalReferenceRegistry.js';
import { persistCanonicalRegistrySnapshot } from '../p0vr2/canonicalReferencePersistence.js';
import {
  exportAuthorityPointerMap,
  importAuthorityPointerMap,
} from '../p0vrCapture1R3a/currentAuthorityPointer.js';
import {
  hydrateDesignAuthorityVersionsFromStorage,
  listCurrentDesignAuthorityVersionsForProject,
  recordDesignAuthorityVersion,
  type DesignAuthorityVersion,
} from '../p0vrCapture1R3a/designAuthorityVersion.js';
import { syncAllFounderAuthorityVersionsForProject } from '../p0vrCapture1R3a/syncFounderAuthorityRegistry.js';
import {
  hydratePageViewportCapturesFromStorage,
  listPageViewportCaptures,
  savePageViewportCapture,
} from './pageViewportCapture.js';
import type { PageViewportCapture } from './types.js';

export const FOUNDER_DESIGN_WORKSPACE_SNAPSHOT_VERSION = 1 as const;

export type FounderDesignWorkspaceSnapshot = {
  version: typeof FOUNDER_DESIGN_WORKSPACE_SNAPSHOT_VERSION;
  projectId: string;
  savedAt: string;
  authorityVersions: DesignAuthorityVersion[];
  authorityPointers: Record<string, string>;
  captures: PageViewportCapture[];
  canonicalRegistry: {
    references: CanonicalVisualReference[];
    canons: VisualImplementationCanon[];
  };
};

const META_LS_PREFIX = 'site00:founder-design-snapshot-meta:' as const;
const LOCAL_SNAPSHOT_LS_PREFIX = 'site00:founder-design-workspace-local:' as const;
const localSnapshotMemory = new Map<string, string>();

function localProjectHasBindings(projectId: string): boolean {
  const authority = listCurrentDesignAuthorityVersionsForProject(projectId).length > 0;
  const captures = listPageViewportCaptures(projectId).some(
    (c) => c.status === 'CAPTURE_READY' && Boolean(c.imageRef),
  );
  return authority || captures;
}

function stripDataUrlsFromVersion(v: DesignAuthorityVersion): DesignAuthorityVersion {
  const assetRef = v.assetRef?.startsWith('data:') ? v.storagePath : v.assetRef;
  const storagePath = v.storagePath?.startsWith('data:') ? v.assetRef : v.storagePath;
  return {
    ...v,
    assetRef: assetRef?.startsWith('data:') ? '' : assetRef,
    storagePath: storagePath?.startsWith('data:') ? '' : storagePath,
  };
}

function stripDataUrlsFromCapture(c: PageViewportCapture): PageViewportCapture {
  const imageRef = c.imageRef?.startsWith('data:') ? null : c.imageRef;
  return { ...c, imageRef };
}

export function buildFounderDesignWorkspaceSnapshot(projectId: string): FounderDesignWorkspaceSnapshot {
  hydrateDesignAuthorityVersionsFromStorage();
  hydratePageViewportCapturesFromStorage(projectId);

  const authorityVersions = listCurrentDesignAuthorityVersionsForProject(projectId).map(stripDataUrlsFromVersion);
  const captures = listPageViewportCaptures(projectId)
    .filter((c) => c.status === 'CAPTURE_READY' && c.imageRef)
    .map(stripDataUrlsFromCapture);

  const references = listCanonicalReferences(projectId);
  const canons = listImplementationCanons(projectId);

  return {
    version: FOUNDER_DESIGN_WORKSPACE_SNAPSHOT_VERSION,
    projectId,
    savedAt: new Date().toISOString(),
    authorityVersions,
    authorityPointers: exportAuthorityPointerMap(),
    captures,
    canonicalRegistry: { references, canons },
  };
}

export function readLocalFounderDesignSnapshotSavedAt(projectId: string): string | null {
  if (typeof globalThis.localStorage === 'undefined') return null;
  try {
    const raw = globalThis.localStorage.getItem(`${META_LS_PREFIX}${projectId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { savedAt?: string };
    return parsed.savedAt ?? null;
  } catch {
    return null;
  }
}

export function writeLocalFounderDesignSnapshotSavedAt(projectId: string, savedAt: string): void {
  if (typeof globalThis.localStorage === 'undefined') return;
  try {
    globalThis.localStorage.setItem(`${META_LS_PREFIX}${projectId}`, JSON.stringify({ savedAt }));
  } catch {
    /* quota */
  }
}

export function applyFounderDesignWorkspaceSnapshot(
  snapshot: FounderDesignWorkspaceSnapshot,
  options?: { force?: boolean },
): { applied: boolean; reason?: string } {
  if (snapshot.version !== FOUNDER_DESIGN_WORKSPACE_SNAPSHOT_VERSION) {
    return { applied: false, reason: 'UNSUPPORTED_VERSION' };
  }

  const localSavedAt = readLocalFounderDesignSnapshotSavedAt(snapshot.projectId);
  if (!options?.force) {
    const localHasBindings = localProjectHasBindings(snapshot.projectId);
    if (localSavedAt && localSavedAt >= snapshot.savedAt && localHasBindings) {
      return { applied: false, reason: 'LOCAL_NEWER' };
    }
  }

  hydrateDesignAuthorityVersionsFromStorage();
  hydratePageViewportCapturesFromStorage(snapshot.projectId);

  for (const version of snapshot.authorityVersions) {
    if (!version.assetRef && !version.storagePath) continue;
    recordDesignAuthorityVersion(stripDataUrlsFromVersion(version));
  }

  if (snapshot.authorityPointers && Object.keys(snapshot.authorityPointers).length > 0) {
    importAuthorityPointerMap(snapshot.authorityPointers);
  }

  if (snapshot.canonicalRegistry.references.length) {
    seedCanonicalRegistry(snapshot.canonicalRegistry.references);
  }
  if (snapshot.canonicalRegistry.canons.length) {
    seedImplementationCanons(snapshot.canonicalRegistry.canons);
  }
  persistCanonicalRegistrySnapshot(snapshot.projectId);

  for (const capture of snapshot.captures) {
    if (!capture.imageRef) continue;
    savePageViewportCapture(stripDataUrlsFromCapture(capture));
  }

  syncAllFounderAuthorityVersionsForProject(snapshot.projectId);
  writeLocalFounderDesignSnapshotSavedAt(snapshot.projectId, snapshot.savedAt);

  return { applied: true };
}

/** Compact binding backup in localStorage (survives refresh when individual keys fragment). */
function readLocalSnapshotRaw(projectId: string): string | null {
  if (typeof globalThis.localStorage !== 'undefined') {
    try {
      return globalThis.localStorage.getItem(`${LOCAL_SNAPSHOT_LS_PREFIX}${projectId}`);
    } catch {
      /* quota */
    }
  }
  return localSnapshotMemory.get(projectId) ?? null;
}

function writeLocalSnapshotRaw(projectId: string, raw: string): void {
  if (typeof globalThis.localStorage !== 'undefined') {
    try {
      globalThis.localStorage.setItem(`${LOCAL_SNAPSHOT_LS_PREFIX}${projectId}`, raw);
      return;
    } catch {
      /* quota */
    }
  }
  localSnapshotMemory.set(projectId, raw);
}

export function persistLocalFounderDesignWorkspaceSnapshot(projectId: string): void {
  try {
    const snapshot = buildFounderDesignWorkspaceSnapshot(projectId);
    if (!snapshot.authorityVersions.length && !snapshot.captures.length) return;
    writeLocalSnapshotRaw(projectId, JSON.stringify(snapshot));
    writeLocalFounderDesignSnapshotSavedAt(projectId, snapshot.savedAt);
  } catch {
    /* quota */
  }
}

export function hydrateLocalFounderDesignWorkspaceSnapshot(projectId: string): boolean {
  try {
    const raw = readLocalSnapshotRaw(projectId);
    if (!raw) return false;
    const snapshot = JSON.parse(raw) as FounderDesignWorkspaceSnapshot;
    if (snapshot.projectId !== projectId) return false;
    const result = applyFounderDesignWorkspaceSnapshot(snapshot, { force: true });
    return result.applied;
  } catch {
    return false;
  }
}

export function founderDesignWorkspaceSnapshotStoragePath(projectId: string): string {
  const safe = projectId.replace(/[^a-zA-Z0-9-_]/g, '_');
  return `site00/founder-design-workspace/${safe}/snapshot-v1.json`;
}

/** @internal tests */
export function resetFounderDesignSnapshotMetaForTest(projectId?: string): void {
  if (typeof globalThis.localStorage === 'undefined') return;
  if (projectId) {
    localSnapshotMemory.delete(projectId);
    if (typeof globalThis.localStorage !== 'undefined') {
      globalThis.localStorage.removeItem(`${META_LS_PREFIX}${projectId}`);
      globalThis.localStorage.removeItem(`${LOCAL_SNAPSHOT_LS_PREFIX}${projectId}`);
    }
    return;
  }
  localSnapshotMemory.clear();
  for (let i = globalThis.localStorage.length - 1; i >= 0; i--) {
    const key = globalThis.localStorage.key(i);
    if (key?.startsWith(META_LS_PREFIX) || key?.startsWith(LOCAL_SNAPSHOT_LS_PREFIX)) {
      globalThis.localStorage.removeItem(key);
    }
  }
}
