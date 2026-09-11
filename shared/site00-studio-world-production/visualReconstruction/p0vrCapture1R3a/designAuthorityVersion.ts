/**
 * P0.VR.CAPTURE.1R3A — Versioned page-scoped design authority records.
 */

import type { DesignViewportClass } from '../p0vr2/types.js';
import { DESIGN_AUTHORITY_VERSION_LS_PREFIX } from './constants.js';

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
  storagePath: string;
  status: DesignAuthorityVersionStatus;
  approvedAt: string | null;
  supersededAt: string | null;
  supersededBy: string | null;
  source: DesignAuthoritySource;
  createdAt: string;
};

const versions = new Map<string, DesignAuthorityVersion>();

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

export function recordDesignAuthorityVersion(record: DesignAuthorityVersion): DesignAuthorityVersion {
  versions.set(record.authorityVersionId, record);
  persistVersion(record);
  return record;
}

export function supersedeDesignAuthorityVersions(input: {
  projectId: string;
  pageId: string;
  viewport: DesignViewportClass;
  supersededBy: string;
  at?: string;
}): void {
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
  return [...versions.values()]
    .filter((v) => v.projectId === projectId && v.pageId === pageId && v.viewport === viewport)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function resetDesignAuthorityVersionsForTest(): void {
  versions.clear();
}
