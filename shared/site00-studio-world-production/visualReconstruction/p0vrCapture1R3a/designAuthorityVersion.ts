/**
 * P0.VR.CAPTURE.1R3A — Versioned page-scoped design authority records.
 */

import type { DesignViewportClass } from '../p0vr2/types.js';
import { DESIGN_AUTHORITY_VERSION_LS_PREFIX } from './constants.js';
import { getCurrentAuthorityPointer, setCurrentAuthorityPointer } from './currentAuthorityPointer.js';
import { notifyFounderDesignWorkspaceCloudSync } from '../p0vrCapture1/founderDesignWorkspaceCloudSyncHook.js';

export const DESIGN_AUTHORITY_VERSION_STATUSES = ['CURRENT', 'SUPERSEDED', 'DRAFT_PENDING'] as const;
export type DesignAuthorityVersionStatus = (typeof DESIGN_AUTHORITY_VERSION_STATUSES)[number];

export type DesignAuthoritySource = 'FOUNDER_UPLOAD' | 'SEED' | 'APPROVED_REFERENCE' | 'UNKNOWN';

export type DesignAuthorityVersion = {
  authorityVersionId: string;
  projectId: string;
  pageId: string;
  screenId: string;
  viewport: DesignViewportClass;
  route: string;
  referenceId: string;
  /** Canonical renderable asset ref (storage path or public URL). */
  assetRef: string;
  storagePath: string;
  status: DesignAuthorityVersionStatus;
  approvedAt: string | null;
  supersededAt: string | null;
  supersededBy: string | null;
  source: DesignAuthoritySource;
  createdAt: string;
};

const versions = new Map<string, DesignAuthorityVersion>();
let hydratedFromStorage = false;

function persistVersion(record: DesignAuthorityVersion): void {
  if (typeof globalThis.localStorage === 'undefined') return;
  try {
    globalThis.localStorage.setItem(
      `${DESIGN_AUTHORITY_VERSION_LS_PREFIX}${record.authorityVersionId}`,
      JSON.stringify(record),
    );
  } catch {
    /* quota */
  }
}

export function hydrateDesignAuthorityVersionsFromStorage(): void {
  if (hydratedFromStorage || typeof globalThis.localStorage === 'undefined') return;
  hydratedFromStorage = true;
  for (let i = 0; i < globalThis.localStorage.length; i++) {
    const key = globalThis.localStorage.key(i);
    if (!key?.startsWith(DESIGN_AUTHORITY_VERSION_LS_PREFIX)) continue;
    try {
      const raw = globalThis.localStorage.getItem(key);
      if (!raw) continue;
      const record = JSON.parse(raw) as DesignAuthorityVersion;
      versions.set(record.authorityVersionId, record);
    } catch {
      /* skip corrupt */
    }
  }
}

function ensureHydrated(): void {
  hydrateDesignAuthorityVersionsFromStorage();
}

export function recordDesignAuthorityVersion(record: DesignAuthorityVersion): DesignAuthorityVersion {
  ensureHydrated();
  const normalized: DesignAuthorityVersion = {
    ...record,
    assetRef: record.assetRef || record.storagePath,
    storagePath: record.storagePath || record.assetRef,
  };
  versions.set(normalized.authorityVersionId, normalized);
  persistVersion(normalized);
  if (normalized.status === 'CURRENT') {
    setCurrentAuthorityPointer({
      projectId: normalized.projectId,
      pageId: normalized.pageId,
      viewport: normalized.viewport,
      authorityVersionId: normalized.authorityVersionId,
    });
  }
  notifyFounderDesignWorkspaceCloudSync(normalized.projectId);
  return normalized;
}

export function supersedeDesignAuthorityVersions(input: {
  projectId: string;
  pageId: string;
  viewport: DesignViewportClass;
  supersededBy: string;
  at?: string;
}): void {
  ensureHydrated();
  const at = input.at ?? new Date().toISOString();
  for (const record of versions.values()) {
    if (
      record.projectId === input.projectId &&
      record.pageId === input.pageId &&
      record.viewport === input.viewport &&
      record.status === 'CURRENT'
    ) {
      const updated: DesignAuthorityVersion = {
        ...record,
        status: 'SUPERSEDED',
        supersededAt: at,
        supersededBy: input.supersededBy,
      };
      versions.set(record.authorityVersionId, updated);
      persistVersion(updated);
    }
  }
}

export function getCurrentDesignAuthorityVersion(
  projectId: string,
  pageId: string,
  viewport: DesignViewportClass,
): DesignAuthorityVersion | null {
  ensureHydrated();
  const pointerId = getCurrentAuthorityPointer(projectId, pageId, viewport);
  if (pointerId) {
    const pointed = versions.get(pointerId);
    if (
      pointed &&
      pointed.projectId === projectId &&
      pointed.pageId === pageId &&
      pointed.viewport === viewport &&
      pointed.status === 'CURRENT'
    ) {
      return pointed;
    }
  }
  return (
    [...versions.values()].find(
      (v) =>
        v.projectId === projectId &&
        v.pageId === pageId &&
        v.viewport === viewport &&
        v.status === 'CURRENT',
    ) ?? null
  );
}

export function listDesignAuthorityHistory(
  projectId: string,
  pageId: string,
  viewport: DesignViewportClass,
): DesignAuthorityVersion[] {
  ensureHydrated();
  return [...versions.values()]
    .filter((v) => v.projectId === projectId && v.pageId === pageId && v.viewport === viewport)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function listCurrentDesignAuthorityVersionsForProject(projectId: string): DesignAuthorityVersion[] {
  ensureHydrated();
  return [...versions.values()].filter((v) => v.projectId === projectId && v.status === 'CURRENT');
}

export function resetDesignAuthorityVersionsForTest(): void {
  versions.clear();
  hydratedFromStorage = false;
}
