import type { DesignPageAuthorityTerritoryGallery } from './types.js';

type AuthorityBatchLedgerEntry = {
  batchGeneration: number;
  savedAt: string;
  territoryGallery: DesignPageAuthorityTerritoryGallery;
};

const BATCH_LEDGER_KEY = 'site00:design-page-v3-authority:batch-ledger:v1';
const GALLERY_BACKUP_KEY = 'site00:design-page-v3-authority:gallery-backup:v1';

function readJsonStore<T>(key: string): T | null {
  for (const store of [typeof localStorage !== 'undefined' ? localStorage : null, typeof sessionStorage !== 'undefined' ? sessionStorage : null]) {
    if (!store) continue;
    try {
      const raw = store.getItem(key);
      if (raw) return JSON.parse(raw) as T;
    } catch {
      /* try next */
    }
  }
  return null;
}

function writeJsonStore(key: string, value: unknown): void {
  const payload = JSON.stringify(value);
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(key, payload);
  } catch {
    /* quota */
  }
  try {
    if (typeof sessionStorage !== 'undefined') sessionStorage.setItem(key, payload);
  } catch {
    /* quota */
  }
}

/** Drop ledger + gallery backup rows so merge loops cannot resurrect broken batches. */
export function purgeDesignPageAuthoritySideStores(projectId: string): void {
  const key = projectId.toLowerCase();
  const ledger = readJsonStore<Record<string, AuthorityBatchLedgerEntry[]>>(BATCH_LEDGER_KEY);
  if (ledger && key in ledger) {
    delete ledger[key];
    writeJsonStore(BATCH_LEDGER_KEY, ledger);
  }
  const backup = readJsonStore<Record<string, DesignPageAuthorityTerritoryGallery>>(GALLERY_BACKUP_KEY);
  if (backup && key in backup) {
    delete backup[key];
    writeJsonStore(GALLERY_BACKUP_KEY, backup);
  }
}
