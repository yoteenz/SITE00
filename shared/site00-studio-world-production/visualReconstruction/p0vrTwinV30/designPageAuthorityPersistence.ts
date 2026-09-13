import { normalizeDesignPageAuthoritySession } from './designPageAuthorityTerritoryGallery.js';
import type { DesignPageAuthorityGenerationResult, DesignPageAuthorityReviewSession } from './types.js';

const STORAGE_KEY = 'site00:design-page-v3-authority:v1';
const SESSION_STORAGE_KEY = 'site00:design-page-v3-authority:session-backup:v1';

function slimLastResultForStorage(
  lastResult: DesignPageAuthorityGenerationResult | null,
): DesignPageAuthorityGenerationResult | null {
  if (!lastResult) return null;
  return {
    ...lastResult,
    authorityGroundedAssetManifests: [],
    falProviderTrace: lastResult.falProviderTrace?.slice(0, 8) ?? [],
  };
}

function slimSessionForStorage(session: DesignPageAuthorityReviewSession): DesignPageAuthorityReviewSession {
  return {
    ...session,
    lastResult: slimLastResultForStorage(session.lastResult),
  };
}

function readParsedStore(raw: string | null): Record<string, DesignPageAuthorityReviewSession> | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Record<string, DesignPageAuthorityReviewSession>;
  } catch {
    return null;
  }
}

export function readDesignPageAuthoritySession(projectId: string): DesignPageAuthorityReviewSession | null {
  if (typeof localStorage === 'undefined' && typeof sessionStorage === 'undefined') return null;
  const key = projectId.toLowerCase();
  try {
    const localParsed = readParsedStore(typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null);
    const sessionParsed = readParsedStore(
      typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(SESSION_STORAGE_KEY) : null,
    );
    const localRow = localParsed?.[key] ?? null;
    const sessionRow = sessionParsed?.[key] ?? null;
    const pick =
      localRow && sessionRow ?
        new Date(localRow.updatedAt).getTime() >= new Date(sessionRow.updatedAt).getTime() ?
          localRow
        : sessionRow
      : localRow ?? sessionRow;
    return pick ? normalizeDesignPageAuthoritySession(pick) : null;
  } catch {
    return null;
  }
}

export function writeDesignPageAuthoritySession(session: DesignPageAuthorityReviewSession): boolean {
  if (typeof localStorage === 'undefined' && typeof sessionStorage === 'undefined') return true;
  const slim = slimSessionForStorage(session);
  const key = session.projectId.toLowerCase();
  let localOk = true;
  let sessionOk = true;
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as Record<string, DesignPageAuthorityReviewSession>) : {};
      parsed[key] = slim;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    }
  } catch (err) {
    localOk = false;
    console.error('site00:design-page-v3-authority localStorage persist failed', err);
  }
  try {
    if (typeof sessionStorage !== 'undefined') {
      const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as Record<string, DesignPageAuthorityReviewSession>) : {};
      parsed[key] = slim;
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(parsed));
    }
  } catch (err) {
    sessionOk = false;
    console.error('site00:design-page-v3-authority sessionStorage persist failed', err);
  }
  return localOk || sessionOk;
}
