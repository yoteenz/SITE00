import { designPageIdsEquivalent } from '../designPageIdentity.js';
import type { PageConceptGenerationState } from './types.js';
import { isPageConceptStaleCaptureEligibilityNotice } from './pageConceptFounderNotice.js';
import { hydratePageConceptGenerationState } from './readiness.js';

const STORAGE_PREFIX_V1 = 'site00:page-concept-generation:v1:';
export const PAGE_CONCEPT_GENERATION_STORAGE_PREFIX = 'site00:page-concept-generation:v2:';

function normalizeProjectId(projectId: string): string {
  return projectId.trim().toLowerCase();
}

function storageKey(projectId: string, pageId: string): string {
  return `${PAGE_CONCEPT_GENERATION_STORAGE_PREFIX}${normalizeProjectId(projectId)}:${pageId}`;
}

function persistedIdentityMatches(
  partial: Partial<PageConceptGenerationState>,
  projectId: string,
  pageId: string,
): boolean {
  if (partial.targetType !== 'PAGE') return false;
  const slug = normalizeProjectId(projectId);
  const storedProject = normalizeProjectId(partial.projectId ?? '');
  if (storedProject !== slug) return false;
  const storedPageId = partial.pageId ?? '';
  return storedPageId === pageId || designPageIdsEquivalent(slug, storedPageId, pageId);
}

function v1Key(projectId: string, pageId: string): string {
  return `${STORAGE_PREFIX_V1}${projectId}:${pageId}`;
}

/** Drop persisted eligibility-era capture blockers — never rehydrate into v2 UI. */
export function sanitizePersistedPageConceptGenerationPartial(
  partial: Partial<PageConceptGenerationState>,
): Partial<PageConceptGenerationState> {
  if (!partial.lastFailure?.message) return partial;
  if (!isPageConceptStaleCaptureEligibilityNotice(partial.lastFailure.message)) return partial;
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
  const slug = normalizeProjectId(projectId);
  if (typeof localStorage === 'undefined') {
    return hydratePageConceptGenerationState(slug, pageId);
  }
  try {
    let migratedFromV1 = false;
    let partial = readRaw(storageKey(slug, pageId));
    if (!partial) {
      partial = readRaw(v1Key(slug, pageId));
      if (partial) {
        migratedFromV1 = true;
        localStorage.removeItem(v1Key(slug, pageId));
      }
    }
    if (!partial) return hydratePageConceptGenerationState(slug, pageId);
    if (!persistedIdentityMatches(partial, slug, pageId)) {
      return hydratePageConceptGenerationState(slug, pageId);
    }
    const hydrated = hydratePageConceptGenerationState(slug, pageId, partial);
    if (migratedFromV1) {
      savePageConceptGenerationState(hydrated);
    }
    return hydrated;
  } catch {
    return hydratePageConceptGenerationState(slug, pageId);
  }
}

export function savePageConceptGenerationState(state: PageConceptGenerationState): void {
  if (typeof localStorage === 'undefined') return;
  const next = {
    ...state,
    projectId: normalizeProjectId(state.projectId),
    ...sanitizePersistedPageConceptGenerationPartial(state),
  };
  localStorage.setItem(storageKey(next.projectId, next.pageId), JSON.stringify(next));
}
