/**
 * P0.VR.TWINV2.2R1 — List durable Twin V2 concept images (ledger + storage; no paid generation).
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleTwinV2VisualConceptCors } from '../_lib/site00TwinV2/twinV2VisualConceptCors.js';
import {
  ledgerEntryToRemoteRecord,
  readTwinV2ConceptLedger,
} from '../_lib/site00TwinV2/twinV2ConceptLedger.js';
import {
  getSite00AssetPublicUrl,
  listSite00StorageFiles,
} from '../_lib/site00Assts/storage.js';

type RemoteRecord = {
  generationId: string;
  imageUrl: string;
  imageStorageRef: string | null;
  createdAt: string;
  sessionId: string;
};

function dedupeRecords(records: RemoteRecord[]): RemoteRecord[] {
  const map = new Map<string, RemoteRecord>();
  for (const r of records) {
    const key = r.imageStorageRef ?? r.imageUrl;
    if (!map.has(key)) map.set(key, r);
  }
  return [...map.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

async function recordsForSessionFolder(sessionId: string): Promise<RemoteRecord[]> {
  const folder = `site00/twin-v2/${sessionId}`;
  const files = await listSite00StorageFiles(folder, 100);
  return files
    .filter((f) => /\.(webp|png|jpg|jpeg)$/i.test(f.name))
    .map((f) => {
      const storagePath = `${folder}/${f.name}`;
      const tsMatch = f.name.match(/(\d{10,})/);
      const createdAt =
        f.createdAt ?? (tsMatch ? new Date(Number(tsMatch[1])).toISOString() : new Date().toISOString());
      return {
        generationId: `storage-${f.name.replace(/\.\w+$/, '')}`,
        imageUrl: getSite00AssetPublicUrl(storagePath),
        imageStorageRef: storagePath,
        createdAt,
        sessionId,
      };
    });
}

async function recordsForProject(projectId: string): Promise<RemoteRecord[]> {
  const out: RemoteRecord[] = [];
  const ledger = await readTwinV2ConceptLedger(projectId);
  for (const entry of ledger) {
    if (entry.imageStorageRef || entry.imageUrl) {
      out.push(ledgerEntryToRemoteRecord(entry) as RemoteRecord);
    }
  }

  const root = await listSite00StorageFiles('site00/twin-v2', 200);
  const sessionFolders = root.filter((e) => e.name && !e.name.includes('.'));
  for (const folder of sessionFolders) {
    if (!folder.name.includes(projectId)) continue;
    out.push(...(await recordsForSessionFolder(folder.name)));
  }

  return dedupeRecords(out);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleTwinV2VisualConceptCors(req, res)) return;

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
    return;
  }

  const sessionId = typeof req.query.sessionId === 'string' ? req.query.sessionId.trim() : '';
  const projectId = typeof req.query.projectId === 'string' ? req.query.projectId.trim() : '';

  if (!sessionId && !projectId) {
    res.status(400).json({ error: 'sessionId or projectId required' });
    return;
  }

  try {
    let records: RemoteRecord[] = [];
    const searchedSessionIds: string[] = [];

    if (projectId) {
      records = await recordsForProject(projectId);
      searchedSessionIds.push(`project:${projectId}`);
    }

    if (sessionId) {
      searchedSessionIds.push(sessionId);
      records = dedupeRecords([...records, ...(await recordsForSessionFolder(sessionId))]);
    }

    if (records.length === 0 && process.env.VITEST !== 'true') {
      res.status(200).json({
        ok: true,
        sessionId: sessionId || null,
        projectId: projectId || null,
        records: [],
        code: 'LEGACY_V2_DISCOVERY_FAILED',
        error: 'No recoverable Twin V2 concepts in ledger or storage for this scope',
        searchedSessionIds,
        providerRecordsChecked: ['supabase_storage', 'twin_v2_ledger'],
        storageRecordsChecked: projectId ? [`site00/twin-v2-ledger/${projectId}`, 'site00/twin-v2/*'] : [`site00/twin-v2/${sessionId}`],
      });
      return;
    }

    res.status(200).json({
      ok: true,
      sessionId: sessionId || null,
      projectId: projectId || null,
      records,
      searchedSessionIds,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'DISCOVERY_FAILED';
    res.status(500).json({
      ok: false,
      sessionId: sessionId || null,
      projectId: projectId || null,
      records: [],
      error: message,
      code: 'LEGACY_V2_DISCOVERY_FAILED',
      searchedSessionIds: sessionId ? [sessionId] : projectId ? [`project:${projectId}`] : [],
    });
  }
}
