/**
 * Cross-tab navigation: Character Fabrication ↔ Library Character Detail.
 */
import type { FabricationState } from './types.js';

export const CF_LIBRARY_RETURN_TO = 'expression-character-fabrication' as const;
export const CF_RETURN_STORAGE_KEY = 'site00.character-fabrication.library-return.v1';

export type FabricationLibraryReturnContext = {
  returnTo: typeof CF_LIBRARY_RETURN_TO;
  projectSlug: string;
  entryId: string;
  href: string;
  savedAt: string;
  selectedActorId: string;
  selectedActorCandidateId: string;
  activeStation: FabricationState['activeStation'];
  actorCatalogueOpen: boolean;
};

/** Matches realmRoutes library characters detail (`/production/libraries/characters/detail/:id`). */
export function libraryCharacterDetailHref(_projectSlug: string, residentCatalogueId: string): string {
  return `/production/libraries/characters/detail/${encodeURIComponent(residentCatalogueId)}?returnTo=${CF_LIBRARY_RETURN_TO}`;
}

export function saveFabricationLibraryReturn(ctx: FabricationLibraryReturnContext): void {
  try {
    sessionStorage.setItem(CF_RETURN_STORAGE_KEY, JSON.stringify(ctx));
  } catch {
    /* ignore */
  }
}

export function readFabricationLibraryReturn(): FabricationLibraryReturnContext | null {
  try {
    const raw = sessionStorage.getItem(CF_RETURN_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FabricationLibraryReturnContext;
    if (parsed?.returnTo !== CF_LIBRARY_RETURN_TO) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearFabricationLibraryReturn(): void {
  try {
    sessionStorage.removeItem(CF_RETURN_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function characterFabricationReturnHref(projectSlug: string, entryId: string): string {
  return `/production/${projectSlug}/expression/character-fabrication?entry=${encodeURIComponent(entryId)}&restore=${CF_LIBRARY_RETURN_TO}`;
}
