import {
  downloadSite00StorageText,
  getSite00AssetPublicUrl,
  uploadSite00AssetBuffer,
} from '../site00Assts/storage.js';

export type TwinV2ConceptLedgerEntry = {
  entryId: string;
  projectId: string;
  pageId: string;
  sessionId: string;
  imageUrl: string | null;
  imageStorageRef: string | null;
  createdAt: string;
  provider: string;
  model: string;
};

function ledgerPath(projectId: string): string {
  const safe = projectId.replace(/[^a-zA-Z0-9-_]/g, '_');
  return `site00/twin-v2-ledger/${safe}.json`;
}

export async function readTwinV2ConceptLedger(projectId: string): Promise<TwinV2ConceptLedgerEntry[]> {
  const raw = await downloadSite00StorageText(ledgerPath(projectId));
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as TwinV2ConceptLedgerEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function appendTwinV2ConceptLedger(entry: TwinV2ConceptLedgerEntry): Promise<void> {
  const existing = await readTwinV2ConceptLedger(entry.projectId);
  const key = entry.imageStorageRef ?? entry.imageUrl ?? entry.entryId;
  if (existing.some((e) => (e.imageStorageRef ?? e.imageUrl) === key)) return;
  const next = [...existing, entry].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const buf = Buffer.from(JSON.stringify(next, null, 0), 'utf8');
  await uploadSite00AssetBuffer(ledgerPath(entry.projectId), buf, 'application/json', { upsert: true });
}

export function ledgerEntryToRemoteRecord(entry: TwinV2ConceptLedgerEntry) {
  const imageUrl =
    entry.imageUrl ?? (entry.imageStorageRef ? getSite00AssetPublicUrl(entry.imageStorageRef) : '');
  return {
    generationId: entry.entryId,
    imageUrl,
    imageStorageRef: entry.imageStorageRef,
    createdAt: entry.createdAt,
    sessionId: entry.sessionId,
  };
}
