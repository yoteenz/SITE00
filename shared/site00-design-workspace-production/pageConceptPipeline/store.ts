import type { PageConceptGenerationState } from './types.js';
import { hydratePageConceptGenerationState } from './readiness.js';

const STORAGE_PREFIX = 'site00:page-concept-generation:v1:';

function storageKey(projectId: string, pageId: string): string {
  return `${STORAGE_PREFIX}${projectId}:${pageId}`;
}

export function loadPageConceptGenerationState(
  projectId: string,
  pageId: string,
): PageConceptGenerationState {
  if (typeof localStorage === 'undefined') {
    return hydratePageConceptGenerationState(projectId, pageId);
  }
  try {
    const raw = localStorage.getItem(storageKey(projectId, pageId));
    if (!raw) return hydratePageConceptGenerationState(projectId, pageId);
    const parsed = JSON.parse(raw) as PageConceptGenerationState;
    if (parsed.targetType !== 'PAGE' || parsed.projectId !== projectId || parsed.pageId !== pageId) {
      return hydratePageConceptGenerationState(projectId, pageId);
    }
    return hydratePageConceptGenerationState(projectId, pageId, parsed);
  } catch {
    return hydratePageConceptGenerationState(projectId, pageId);
  }
}

export function savePageConceptGenerationState(state: PageConceptGenerationState): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(storageKey(state.projectId, state.pageId), JSON.stringify(state));
}
