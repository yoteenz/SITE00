import {
  maxBatchGenerationInGallery,
  mergeTerritoryGalleries,
  normalizeDesignPageAuthoritySession,
  territoryGalleryHasCandidates,
} from './designPageAuthorityTerritoryGallery.js';
import {
  appendAuthorityBatchLedger,
  mergeGalleryFromBatchLedger,
  maxBatchGenerationFromLedger,
} from './designPageAuthorityBatchLedger.js';
import { recoverDesignPageAuthorityGalleryIfBroken } from './recoverDesignPageAuthorityGallery.js';
import { galleryHasUnviewableAuthorityImages } from './repairAuthorityPrototypeUrls.js';
import { createDesignPageAuthorityReviewSession } from './designPageAuthorityReviewState.js';
import { writeMobileTwinAuthorityImageSnapshot } from './mobileTwinPipeline/mobileTwinAuthorityImageSnapshot.js';
import {
  attachMobileTwinPipelineFromBrowserStore,
  writeMobileTwinPipelineToBrowser,
} from './mobileTwinPipeline/mobileTwinPipelinePersistence.js';
import { mergeMobileTwinPipelineRich } from './mobileTwinPipeline/reconcileMobileTwinPipelineState.js';
import type {
  DesignPageAuthorityGenerationResult,
  DesignPageAuthorityReviewSession,
  DesignPageAuthorityTerritoryGallery,
} from './types.js';

const STORAGE_KEY = 'site00:design-page-v3-authority:v1';
const SESSION_STORAGE_KEY = 'site00:design-page-v3-authority:session-backup:v1';
const GALLERY_BACKUP_KEY = 'site00:design-page-v3-authority:gallery-backup:v1';

function slimLastResultForStorage(
  lastResult: DesignPageAuthorityGenerationResult | null,
  galleryHasCandidates: boolean,
): DesignPageAuthorityGenerationResult | null {
  if (!lastResult) return null;
  const slim: DesignPageAuthorityGenerationResult = {
    ...lastResult,
    authorityGroundedAssetManifests: [],
    falProviderTrace: lastResult.falProviderTrace?.slice(0, 8) ?? [],
  };
  if (galleryHasCandidates) {
    slim.territories = [];
  }
  return slim;
}

function slimSessionForStorage(session: DesignPageAuthorityReviewSession): DesignPageAuthorityReviewSession {
  const galleryHasCandidates = territoryGalleryHasCandidates(session.territoryGallery);
  return {
    ...session,
    lastResult: slimLastResultForStorage(session.lastResult, galleryHasCandidates),
  };
}

function mergeStoredAuthoritySessions(
  projectId: string,
  localRow: DesignPageAuthorityReviewSession | null,
  sessionRow: DesignPageAuthorityReviewSession | null,
  galleryBackup: DesignPageAuthorityTerritoryGallery | null,
): DesignPageAuthorityReviewSession | null {
  const rows = [localRow, sessionRow].filter(Boolean) as DesignPageAuthorityReviewSession[];
  if (!rows.length && !galleryBackup) return null;
  if (!rows.length && galleryBackup) {
    return normalizeDesignPageAuthoritySession(createMinimalSessionFromGalleryBackup(galleryBackup, projectId));
  }
  const sorted = [...rows].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
  let merged = sorted[0]!;
  for (let i = 1; i < sorted.length; i++) {
    const row = sorted[i]!;
    merged = {
      ...merged,
      territoryGallery: mergeTerritoryGalleries(merged.territoryGallery, row.territoryGallery),
      candidateGeneration: Math.max(merged.candidateGeneration, row.candidateGeneration),
      selectedCandidateByTerritory: { ...row.selectedCandidateByTerritory, ...merged.selectedCandidateByTerritory },
      authorityPipeline: merged.authorityPipeline ?? row.authorityPipeline,
      featureAuthority: merged.featureAuthority ?? row.featureAuthority,
      mobileTwinPipeline: mergeMobileTwinPipelineRich(merged.mobileTwinPipeline, row.mobileTwinPipeline),
    };
  }
  if (galleryBackup && !galleryHasUnviewableAuthorityImages(galleryBackup)) {
    merged = {
      ...merged,
      territoryGallery: mergeTerritoryGalleries(merged.territoryGallery, galleryBackup),
      candidateGeneration: Math.max(
        merged.candidateGeneration,
        maxBatchGenerationInGallery(galleryBackup),
      ),
    };
  }
  merged.candidateGeneration = Math.max(
    merged.candidateGeneration,
    maxBatchGenerationInGallery(merged.territoryGallery),
    maxBatchGenerationFromLedger(projectId),
  );
  merged.territoryGallery = mergeGalleryFromBatchLedger(projectId, merged.territoryGallery);
  return merged;
}

function createMinimalSessionFromGalleryBackup(
  gallery: DesignPageAuthorityTerritoryGallery,
  projectId: string,
): DesignPageAuthorityReviewSession {
  const now = new Date().toISOString();
  const base = createDesignPageAuthorityReviewSession({ projectId });
  return {
    ...base,
    candidateGeneration: maxBatchGenerationInGallery(gallery),
    territoryGallery: gallery,
    updatedAt: now,
  };
}

function readGalleryBackup(projectId: string): DesignPageAuthorityTerritoryGallery | null {
  const parsed = readGalleryBackupRaw();
  return parsed?.[projectId.toLowerCase()] ?? null;
}

function writeGalleryBackup(projectId: string, gallery: DesignPageAuthorityTerritoryGallery): boolean {
  const key = projectId.toLowerCase();
  const payload = JSON.stringify({
    ...(readGalleryBackupRaw() ?? {}),
    [key]: gallery,
  });
  let ok = false;
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(GALLERY_BACKUP_KEY, payload);
      ok = true;
    }
  } catch {
    /* quota */
  }
  try {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(GALLERY_BACKUP_KEY, payload);
      ok = true;
    }
  } catch {
    /* quota */
  }
  return ok;
}

function readGalleryBackupRaw(): Record<string, DesignPageAuthorityTerritoryGallery> | null {
  for (const store of [typeof localStorage !== 'undefined' ? localStorage : null, typeof sessionStorage !== 'undefined' ? sessionStorage : null]) {
    if (!store) continue;
    try {
      const raw = store.getItem(GALLERY_BACKUP_KEY);
      if (raw) return JSON.parse(raw) as Record<string, DesignPageAuthorityTerritoryGallery>;
    } catch {
      /* try next */
    }
  }
  return null;
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
    const galleryBackup = readGalleryBackup(key);
    const merged = mergeStoredAuthoritySessions(key, localRow, sessionRow, galleryBackup);
    if (!merged) return null;
    const normalized = normalizeDesignPageAuthoritySession(merged);
    const recovered = recoverDesignPageAuthorityGalleryIfBroken(normalized);
    const withMobileTwin: DesignPageAuthorityReviewSession = {
      ...recovered,
      mobileTwinPipeline: attachMobileTwinPipelineFromBrowserStore(key, recovered.mobileTwinPipeline),
    };
    if (
      JSON.stringify(recovered.territoryGallery) !== JSON.stringify(normalized.territoryGallery) ||
      recovered.buildRef !== normalized.buildRef
    ) {
      writeDesignPageAuthoritySession(withMobileTwin);
    }
    return withMobileTwin;
  } catch {
    return null;
  }
}

export function writeDesignPageAuthoritySession(session: DesignPageAuthorityReviewSession): boolean {
  if (typeof localStorage === 'undefined' && typeof sessionStorage === 'undefined') return true;
  const prepared = recoverDesignPageAuthorityGalleryIfBroken(normalizeDesignPageAuthoritySession(session));
  const slim = slimSessionForStorage(prepared);
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
  writeGalleryBackup(key, prepared.territoryGallery);
  appendAuthorityBatchLedger(key, prepared.territoryGallery, prepared.candidateGeneration);
  if (prepared.mobileTwinPipeline) {
    writeMobileTwinPipelineToBrowser(key, prepared.mobileTwinPipeline);
    writeMobileTwinAuthorityImageSnapshot(key, prepared.mobileTwinPipeline);
  }
  return localOk || sessionOk;
}
