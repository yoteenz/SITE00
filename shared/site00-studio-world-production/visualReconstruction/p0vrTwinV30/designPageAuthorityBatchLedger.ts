import type { DesignPageAuthorityTerritoryGallery } from './types.js';
import { mergeTerritoryGalleries, maxBatchGenerationInGallery } from './designPageAuthorityTerritoryGallery.js';

const BATCH_LEDGER_KEY = 'site00:design-page-v3-authority:batch-ledger:v1';
const MAX_LEDGER_ENTRIES = 12;

export type AuthorityBatchLedgerEntry = {
  batchGeneration: number;
  savedAt: string;
  territoryGallery: DesignPageAuthorityTerritoryGallery;
};

function readLedgerStore(): Record<string, AuthorityBatchLedgerEntry[]> {
  if (typeof localStorage === 'undefined' && typeof sessionStorage === 'undefined') return {};
  for (const store of [localStorage, sessionStorage]) {
    if (!store) continue;
    try {
      const raw = store.getItem(BATCH_LEDGER_KEY);
      if (raw) return JSON.parse(raw) as Record<string, AuthorityBatchLedgerEntry[]>;
    } catch {
      /* try next */
    }
  }
  return {};
}

function writeLedgerStore(parsed: Record<string, AuthorityBatchLedgerEntry[]>): void {
  const payload = JSON.stringify(parsed);
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(BATCH_LEDGER_KEY, payload);
  } catch {
    /* quota */
  }
  try {
    if (typeof sessionStorage !== 'undefined') sessionStorage.setItem(BATCH_LEDGER_KEY, payload);
  } catch {
    /* quota */
  }
}

export function galleryCandidateCount(gallery: DesignPageAuthorityTerritoryGallery): number {
  return gallery.A.length + gallery.B.length + gallery.C.length;
}

/** Latest batch only — replaces prior ledger entries (batch 1 discarded when batch 2 lands). */
export function appendAuthorityBatchLedger(
  projectId: string,
  gallery: DesignPageAuthorityTerritoryGallery,
  candidateGeneration: number,
): void {
  if (!galleryCandidateCount(gallery)) return;
  const key = projectId.toLowerCase();
  const store = readLedgerStore();
  const entry: AuthorityBatchLedgerEntry = {
    batchGeneration: candidateGeneration,
    savedAt: new Date().toISOString(),
    territoryGallery: gallery,
  };
  store[key] = [entry];
  writeLedgerStore(store);
}

export function mergeGalleryFromBatchLedger(
  projectId: string,
  gallery: DesignPageAuthorityTerritoryGallery,
): DesignPageAuthorityTerritoryGallery {
  const key = projectId.toLowerCase();
  const list = readLedgerStore()[key] ?? [];
  if (!list.length) return gallery;
  const latest = list.reduce((a, b) => (a.batchGeneration >= b.batchGeneration ? a : b));
  return mergeTerritoryGalleries(gallery, latest.territoryGallery);
}

export function maxBatchGenerationFromLedger(projectId: string): number {
  const key = projectId.toLowerCase();
  const list = readLedgerStore()[key] ?? [];
  let max = 0;
  for (const entry of list) {
    max = Math.max(max, entry.batchGeneration, maxBatchGenerationInGallery(entry.territoryGallery));
  }
  return max;
}
