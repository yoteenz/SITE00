import { normalizeDesignPageAuthoritySession } from './designPageAuthorityTerritoryGallery.js';
import type { DesignPageAuthorityReviewSession } from './types.js';

const STORAGE_KEY = 'site00:design-page-v3-authority:v1';

export function readDesignPageAuthoritySession(projectId: string): DesignPageAuthorityReviewSession | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, DesignPageAuthorityReviewSession>;
    const row = parsed[projectId.toLowerCase()];
    return row ? normalizeDesignPageAuthoritySession(row) : null;
  } catch {
    return null;
  }
}

export function writeDesignPageAuthoritySession(session: DesignPageAuthorityReviewSession): boolean {
  if (typeof localStorage === 'undefined') return true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, DesignPageAuthorityReviewSession>) : {};
    parsed[session.projectId.toLowerCase()] = session;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    return true;
  } catch (err) {
    console.error('site00:design-page-v3-authority persist failed', err);
    return false;
  }
}
