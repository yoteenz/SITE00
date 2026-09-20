import type { PageConceptGenerationState } from './types.js';
import { isPageConceptSourceCaptureRelatedNotice } from './pageConceptGenerationBlockingState.js';
import { hydratePageConceptGenerationState } from './readiness.js';

const STORAGE_PREFIX_V1 = 'site00:page-concept-generation:v1:';
export const PAGE_CONCEPT_GENERATION_STORAGE_PREFIX = 'site00:page-concept-generation:v2:';

function storageKey(projectId: string, pageId: string): string {
  return `${PAGE_CONCEPT_GENERATION_STORAGE_PREFIX}${projectId}:${pageId}`;
}

function v1Key(projectId: string, pageId: string): string {
  return `${STORAGE_PREFIX_V1}${projectId}:${pageId}`;
}

/** Drop persisted eligibility-era capture blockers — never rehydrate into v2 UI. */
export function sanitizePersistedPageConceptGenerationPartial(
  partial: Partial<PageConceptGenerationState>,
): Partial<PageConceptGenerationState> {
  if (!partial.lastFailure?.message) return partial;
  if (!isPageConceptSourceCaptureRelatedNotice(partial.lastFailure.message)) return partial;
  return { ...partial, lastFailure: null };
}

function readRaw(key: string): Partial<PageConceptGenerationState> | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PageConceptGenerationState>;
    return sanitizePersistedPageConceptGenerationPartial(parsed);
  } catch {
    return null;
  }
}

export function loadPageConceptGenerationState(
  projectId: string,
  pageId: string,
): PageConceptGenerationState {
  if (typeof localStorage === 'undefined') {
    return hydratePageConceptGenerationState(projectId, pageId);
  }
  try {
    let migratedFromV1 = false;
    let partial = readRaw(storageKey(projectId, pageId));
    if (!partial) {
      partial = readRaw(v1Key(projectId, pageId));
      if (partial) {
        migratedFromV1 = true;
        localStorage.removeItem(v1Key(projectId, pageId));
      }
    }
    if (!partial) return hydratePageConceptGenerationState(projectId, pageId);
    if (partial.targetType !== 'PAGE' || partial.projectId !== projectId || partial.pageId !== pageId) {
      return hydratePageConceptGenerationState(projectId, pageId);
    }
    const hydrated = hydratePageConceptGenerationState(projectId, pageId, partial);
    if (migratedFromV1) {
      savePageConceptGenerationState(hydrated);
    }
    return hydrated;
  } catch {
    return hydratePageConceptGenerationState(projectId, pageId);
  }
}

export function savePageConceptGenerationState(state: PageConceptGenerationState): void {
  if (typeof localStorage === 'undefined') return;
  const next = { ...state, ...sanitizePersistedPageConceptGenerationPartial(state) };
  localStorage.setItem(storageKey(state.projectId, state.pageId), JSON.stringify(next));
}
