/**
 * P0.VR.UPGRADE.2 — LIVE / TWIN / ARCHIVE implementation pointers per page.
 */

import type {
  PageImplementationVersion,
  PageLiveRegistryEntry,
  PageImplementationState,
} from './types.js';

const liveRegistry = new Map<string, PageLiveRegistryEntry>();
const versions = new Map<string, PageImplementationVersion>();

function pageKey(projectId: string, pageId: string): string {
  return `${projectId}::${pageId}`;
}

export function ensureLivePageVersion(input: {
  projectId: string;
  pageId: string;
  route: string;
  buildRef?: string;
}): PageImplementationVersion {
  const key = pageKey(input.projectId, input.pageId);
  let entry = liveRegistry.get(key);
  if (!entry) {
    const versionId = `live_${input.projectId}_${Date.now()}`;
    const version: PageImplementationVersion = {
      versionId,
      commitSha: null,
      patchId: null,
      buildRef: input.buildRef ?? 'LIVE_BASELINE',
      pageId: input.pageId,
      route: input.route,
      sourceSessionId: null,
      authorityVersionId: null,
      captureId: null,
      reconstructionPlanId: null,
      status: 'LIVE',
      createdAt: new Date().toISOString(),
    };
    versions.set(versionId, version);
    entry = {
      projectId: input.projectId,
      pageId: input.pageId,
      route: input.route,
      implementationState: 'LIVE',
      liveVersionId: versionId,
      lastKnownGoodPageVersionId: versionId,
      activeTwinSessionId: null,
    };
    liveRegistry.set(key, entry);
  }
  return versions.get(entry.liveVersionId)!;
}

export function getLiveRegistryEntry(
  projectId: string,
  pageId: string,
): PageLiveRegistryEntry | null {
  return liveRegistry.get(pageKey(projectId, pageId)) ?? null;
}

export function getImplementationVersion(versionId: string): PageImplementationVersion | null {
  return versions.get(versionId) ?? null;
}

export function registerImplementationVersion(version: PageImplementationVersion): void {
  versions.set(version.versionId, version);
}

export function setActiveTwinSession(
  projectId: string,
  pageId: string,
  sessionId: string | null,
): PageLiveRegistryEntry | null {
  const entry = liveRegistry.get(pageKey(projectId, pageId));
  if (!entry) return null;
  const updated = { ...entry, activeTwinSessionId: sessionId, implementationState: 'TWIN' as PageImplementationState };
  liveRegistry.set(pageKey(projectId, pageId), updated);
  return updated;
}

export function promoteTwinToLive(
  projectId: string,
  pageId: string,
  twinVersionId: string,
): PageLiveRegistryEntry | null {
  const key = pageKey(projectId, pageId);
  const entry = liveRegistry.get(key);
  if (!entry) return null;
  const prior = versions.get(entry.liveVersionId);
  if (prior) {
    versions.set(prior.versionId, { ...prior, status: 'ARCHIVED' });
  }
  const twin = versions.get(twinVersionId);
  if (twin) {
    versions.set(twinVersionId, { ...twin, status: 'LIVE' });
  }
  const updated: PageLiveRegistryEntry = {
    ...entry,
    liveVersionId: twinVersionId,
    lastKnownGoodPageVersionId: entry.liveVersionId,
    activeTwinSessionId: null,
    implementationState: 'LIVE',
  };
  liveRegistry.set(key, updated);
  return updated;
}

export function resetPageImplementationRegistryForTest(): void {
  liveRegistry.clear();
  versions.clear();
}
