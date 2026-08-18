import type { CompositionStudioDocument } from './types';

const STORAGE_PREFIX = 'site00-composition-studio:';

export function compositionStorageKey(environmentId: string): string {
  return `${STORAGE_PREFIX}${environmentId}`;
}

export function loadCompositionDocument(environmentId: string): CompositionStudioDocument | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(compositionStorageKey(environmentId));
    if (!raw) return null;
    return JSON.parse(raw) as CompositionStudioDocument;
  } catch {
    return null;
  }
}

export function saveCompositionDocument(doc: CompositionStudioDocument): void {
  if (typeof window === 'undefined') return;
  const payload = { ...doc, updatedAt: new Date().toISOString() };
  localStorage.setItem(compositionStorageKey(doc.environmentId), JSON.stringify(payload));
}

export function getLockedCompositionDocument(environmentId: string): CompositionStudioDocument | null {
  const doc = loadCompositionDocument(environmentId);
  if (!doc || doc.status !== 'COMPOSITION_LOCKED') return null;
  return doc;
}

export function clearCompositionDraft(environmentId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(compositionStorageKey(environmentId));
}
