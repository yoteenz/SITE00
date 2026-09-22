/**
 * P0.VR.DESIGN-WORKSPACE-CONCEPT-GALLERY-AND-GENERATOR-ENTRY-FIX1 —
 * Recover persisted generation state when storage pageId ≠ active DESIGN registry pageId.
 */

import {
  designPageIdsEquivalent,
  resolveDesignPageIdentity,
  type DesignPageIdentity,
} from '../designPageIdentity.js';
import { hydratePageConceptGenerationState } from './readiness.js';
import {
  loadPageConceptGenerationState,
  PAGE_CONCEPT_GENERATION_STORAGE_PREFIX,
  savePageConceptGenerationState,
} from './store.js';
import type { PageConceptGenerationState } from './types.js';
const PAGE_CONCEPT_ACTIVE_SERVER_RUN_KEY = 'site00:page-concept-server-run:v1';

function pageConceptActiveServerRunStorageKey(projectId: string, pageId: string): string {
  return `${PAGE_CONCEPT_ACTIVE_SERVER_RUN_KEY}:${projectId}:${pageId}`;
}

function normalizeProjectId(projectId: string): string {
  return projectId.trim().toLowerCase();
}

export function resolveDesignPageIdentityForGallery(input: {
  projectSlug: string;
  pageId: string;
  screenId?: string;
  route?: string | null;
}): DesignPageIdentity {
  return resolveDesignPageIdentity({
    projectSlug: input.projectSlug,
    pageId: input.pageId,
    screenId: input.screenId ?? '',
    route: input.route ?? null,
  });
}

function stateHasGallerySourceContent(state: PageConceptGenerationState): boolean {
  if (state.generationJobs.some((j) => j.provider === 'GPT2_MOBILE')) return true;
  if ((state.pipelineSet?.mobileConcepts?.length ?? 0) > 0) return true;
  if (state.pipelineSet?.pipelineLineage === 'GPT2_VIEWPORT_FAMILY_TWIN_PIPELINE') return true;
  return state.generationJobs.length > 0;
}

function remapStateToRegistryPage(state: PageConceptGenerationState, identity: DesignPageIdentity): PageConceptGenerationState {
  const projectId = normalizeProjectId(identity.projectId);
  const pageId = identity.registryPageId;
  if (state.projectId === projectId && state.pageId === pageId) return state;
  return hydratePageConceptGenerationState(projectId, pageId, {
    ...state,
    projectId,
    pageId,
  });
}

/** Enumerate v2 generation buckets for one project (browser only). */
export function enumeratePageConceptGenerationStoragePageIds(projectSlug: string): readonly string[] {
  if (typeof localStorage === 'undefined') return [];
  const slug = normalizeProjectId(projectSlug);
  const prefix = `${PAGE_CONCEPT_GENERATION_STORAGE_PREFIX}${slug}:`;
  const pageIds: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith(prefix)) continue;
    pageIds.push(key.slice(prefix.length));
  }
  return pageIds;
}

function loadFromStoragePageId(projectSlug: string, storagePageId: string): PageConceptGenerationState {
  const slug = normalizeProjectId(projectSlug);
  return loadPageConceptGenerationState(slug, storagePageId);
}

/**
 * Best persisted generation state for the active DESIGN page (registry pageId),
 * including canonical / legacy storage keys for the same page.
 */
export function loadPageConceptGenerationStateForDesignPage(input: {
  projectSlug: string;
  pageId: string;
  screenId?: string;
  route?: string | null;
}): PageConceptGenerationState {
  const identity = resolveDesignPageIdentityForGallery(input);
  const slug = identity.projectSlug;
  const registryPageId = identity.registryPageId;

  const candidatePageIds = [
    registryPageId,
    identity.canonicalPageId,
    ...enumeratePageConceptGenerationStoragePageIds(slug),
  ];

  const seen = new Set<string>();
  let best: PageConceptGenerationState | null = null;

  for (const storagePageId of candidatePageIds) {
    if (!storagePageId || seen.has(storagePageId)) continue;
    seen.add(storagePageId);
    if (!designPageIdsEquivalent(slug, registryPageId, storagePageId)) continue;

    const loaded = loadFromStoragePageId(slug, storagePageId);
    if (!stateHasGallerySourceContent(loaded)) continue;

    const remapped = remapStateToRegistryPage(loaded, identity);
    if (!best || remapped.generationJobs.length >= best.generationJobs.length) {
      best = remapped;
    }
  }

  if (best) {
    if (best.pageId !== registryPageId || best.projectId !== slug) {
      savePageConceptGenerationState(best);
    }
    return best;
  }

  return loadPageConceptGenerationState(slug, registryPageId);
}

/** Active server run id stored under any equivalent page bucket. */
export function loadPageConceptActiveServerRunIdForDesignPage(input: {
  projectSlug: string;
  pageId: string;
  screenId?: string;
  route?: string | null;
}): string | null {
  const identity = resolveDesignPageIdentityForGallery(input);
  const slug = identity.projectSlug;
  const registryPageId = identity.registryPageId;
  const ids = new Set<string>([
    registryPageId,
    identity.canonicalPageId,
    ...enumeratePageConceptGenerationStoragePageIds(slug),
  ]);
  for (const id of ids) {
    if (!designPageIdsEquivalent(slug, registryPageId, id)) continue;
    const runId = typeof localStorage !== 'undefined' ?
      localStorage.getItem(pageConceptActiveServerRunStorageKey(slug, id))
    : null;
    if (runId) return runId;
  }
  return null;
}
