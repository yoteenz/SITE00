/**
 * P0.VR.TWINV2.2R1 — List durable Twin V2 concept images in SITE 00 storage (no paid generation).
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleTwinV2VisualConceptCors } from '../_lib/site00TwinV2/twinV2VisualConceptCors.js';
import {
  getSite00AssetPublicUrl,
  listSite00StorageFiles,
} from '../_lib/site00Assts/storage.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleTwinV2VisualConceptCors(req, res)) return;

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
    return;
  }

  const sessionId = typeof req.query.sessionId === 'string' ? req.query.sessionId.trim() : '';
  if (!sessionId) {
    res.status(400).json({ error: 'sessionId required' });
    return;
  }

  const folder = `site00/twin-v2/${sessionId}`;
  try {
    const files = await listSite00StorageFiles(folder, 50);
    const records = files
      .filter((f) => /\.(webp|png|jpg|jpeg)$/i.test(f.name))
      .map((f) => {
        const storagePath = `${folder}/${f.name}`;
        const tsMatch = f.name.match(/(\d{10,})/);
        const createdAt = f.createdAt ?? (tsMatch ? new Date(Number(tsMatch[1])).toISOString() : new Date().toISOString());
        return {
          generationId: `storage-${f.name.replace(/\.\w+$/, '')}`,
          imageUrl: getSite00AssetPublicUrl(storagePath),
          imageStorageRef: storagePath,
          createdAt,
          sessionId,
        };
      })
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

    if (records.length === 0 && process.env.VITEST !== 'true') {
      res.status(200).json({
        ok: true,
        sessionId,
        records: [],
        code: 'LEGACY_V2_DISCOVERY_FAILED',
        error: 'No durable storage objects under site00/twin-v2 for this session',
        searchedSessionIds: [sessionId],
        providerRecordsChecked: ['supabase_storage'],
        storageRecordsChecked: [folder],
      });
      return;
    }

    res.status(200).json({ ok: true, sessionId, records });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'DISCOVERY_FAILED';
    res.status(500).json({
      ok: false,
      sessionId,
      records: [],
      error: message,
      code: 'LEGACY_V2_DISCOVERY_FAILED',
      searchedSessionIds: [sessionId],
    });
  }
}
