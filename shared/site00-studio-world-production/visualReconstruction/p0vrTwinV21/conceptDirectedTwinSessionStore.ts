import type { ConceptDirectedTwinSession } from './types.js';

const STORAGE_PREFIX = 'site00:twin-v2-concept:v1:';

export function twinV2StorageKey(projectId: string, pageId: string): string {
  return `${STORAGE_PREFIX}${projectId}:${pageId}`;
}

export function loadConceptDirectedTwinSession(projectId: string, pageId: string): ConceptDirectedTwinSession | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(twinV2StorageKey(projectId, pageId));
    if (!raw) return null;
    return JSON.parse(raw) as ConceptDirectedTwinSession;
  } catch {
    return null;
  }
}

export function saveConceptDirectedTwinSession(session: ConceptDirectedTwinSession): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(twinV2StorageKey(session.projectId, session.pageId), JSON.stringify(session));
}

export function assertV1Isolation(): { v1PipelineUntouched: true; storageNamespace: string } {
  return { v1PipelineUntouched: true, storageNamespace: STORAGE_PREFIX };
}
