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
  type PageViewportCapture,
} from './pageViewportCapture.js';

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

function localWorkspaceActivityIso(projectId: string): string | null {
  hydrateDesignAuthorityVersionsFromStorage();
  hydratePageViewportCapturesFromStorage(projectId);
  const stamps: string[] = [];
  for (const v of listCurrentDesignAuthorityVersionsForProject(projectId)) {
    if (v.approvedAt) stamps.push(v.approvedAt);
    if (v.createdAt) stamps.push(v.createdAt);
  }
  for (const c of listPageViewportCaptures(projectId)) {
    if (c.capturedAt) stamps.push(c.capturedAt);
  }
  if (!stamps.length) return null;
  return stamps.sort().at(-1) ?? null;
}

export function applyFounderDesignWorkspaceSnapshot(
  snapshot: FounderDesignWorkspaceSnapshot,
  options?: { force?: boolean },
): { applied: boolean; reason?: string } {
  if (snapshot.version !== FOUNDER_DESIGN_WORKSPACE_SNAPSHOT_VERSION) {
    return { applied: false, reason: 'UNSUPPORTED_VERSION' };
  }

  const localSavedAt = readLocalFounderDesignSnapshotSavedAt(snapshot.projectId);
  const localActivity = localWorkspaceActivityIso(snapshot.projectId);
  if (!options?.force) {
    if (localSavedAt && localSavedAt >= snapshot.savedAt) {
      return { applied: false, reason: 'LOCAL_NEWER' };
    }
    if (!localSavedAt && localActivity && localActivity >= snapshot.savedAt) {
      return { applied: false, reason: 'LOCAL_ACTIVITY_NEWER' };
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

export function founderDesignWorkspaceSnapshotStoragePath(projectId: string): string {
  const safe = projectId.replace(/[^a-zA-Z0-9-_]/g, '_');
  return `site00/founder-design-workspace/${safe}/snapshot-v1.json`;
}

/** @internal tests */
export function resetFounderDesignSnapshotMetaForTest(projectId?: string): void {
  if (typeof globalThis.localStorage === 'undefined') return;
  if (projectId) {
    globalThis.localStorage.removeItem(`${META_LS_PREFIX}${projectId}`);
    return;
  }
  for (let i = globalThis.localStorage.length - 1; i >= 0; i--) {
    const key = globalThis.localStorage.key(i);
    if (key?.startsWith(META_LS_PREFIX)) globalThis.localStorage.removeItem(key);
  }
}
