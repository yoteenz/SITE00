import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUser } from '../_lib/auth.js';
import { getSupabaseUser } from '../_lib/supabase.js';
import { fetchUserSnapshot, putUserSnapshotRevisioned, registerIdempotencyKey, type SnapshotDataMode } from '../_lib/jurnl/repositoryApi.js';

const SCHEMA_VERSION = 5;
const DATA_MODES: SnapshotDataMode[] = ['PRODUCTION', 'PROVIDER_SANDBOX'];

/**
 * GET/PUT /api/jurnl/repository — the signed-in user's financial snapshot (RLS: owner only).
 *
 * PUT is a compare-and-swap: the body must carry `expectedRevision` (the revision the device last read; 0 when it
 * read "no snapshot yet") and the deployment `dataMode`. A stale revision returns 409 and nothing is written, so a
 * device holding older data can never overwrite newer server data. A write without a revision is refused (428).
 * Design-preview data is never accepted (dataMode must be PRODUCTION or PROVIDER_SANDBOX).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Jurnl-Idempotency-Key');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const user = await getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized', code: 'AUTH_REQUIRED' });

  const supabase = getSupabaseUser(user.accessToken);

  try {
    if (req.method === 'GET') {
      const row = await fetchUserSnapshot(supabase, user.id);
      if (!row) return res.status(200).json({ snapshot: null, updatedAt: null, revision: 0, dataMode: null, schemaVersion: SCHEMA_VERSION });
      return res.status(200).json({
        snapshot: row.snapshot,
        updatedAt: row.updated_at,
        revision: Number(row.revision ?? 1),
        dataMode: row.data_mode ?? 'PRODUCTION',
        schemaVersion: row.schema_version,
      });
    }

    if (req.method === 'PUT') {
      const body = typeof req.body === 'object' && req.body !== null ? req.body : {};
      const snapshot = body.snapshot;
      if (!snapshot || typeof snapshot !== 'object') return res.status(400).json({ error: 'snapshot object required', code: 'SNAPSHOT_REQUIRED' });
      const expectedRevision = Number(body.expectedRevision);
      if (!Number.isInteger(expectedRevision) || expectedRevision < 0) {
        return res.status(428).json({ error: 'expectedRevision required', code: 'REVISION_REQUIRED' });
      }
      const dataMode = String(body.dataMode ?? '') as SnapshotDataMode;
      if (!DATA_MODES.includes(dataMode)) return res.status(400).json({ error: 'dataMode required', code: 'DATA_MODE_REQUIRED' });
      const snapMode = (snapshot as { dataMode?: string }).dataMode;
      if (snapMode && snapMode !== dataMode) return res.status(400).json({ error: 'snapshot dataMode mismatch', code: 'DATA_MODE_MISMATCH' });
      const snapUserId = String((snapshot as { userId?: string }).userId ?? '');
      if (snapUserId && snapUserId !== user.id) {
        return res.status(403).json({ error: 'snapshot userId mismatch', code: 'USER_SCOPE' });
      }
      (snapshot as { userId: string }).userId = user.id;

      const idempotencyKey = (req.headers['x-jurnl-idempotency-key'] as string | undefined)?.trim();
      if (idempotencyKey) {
        const dup = await registerIdempotencyKey(supabase, user.id, idempotencyKey, 'SNAPSHOT_UPSERT');
        if (dup === 'DUPLICATE') {
          const existing = await fetchUserSnapshot(supabase, user.id);
          return res.status(200).json({
            ok: true,
            idempotent: true,
            updatedAt: existing?.updated_at ?? null,
            revision: Number(existing?.revision ?? 0),
            schemaVersion: existing?.schema_version ?? SCHEMA_VERSION,
          });
        }
      }

      const row = await putUserSnapshotRevisioned(supabase, snapshot as Record<string, unknown>, SCHEMA_VERSION, dataMode, expectedRevision);
      return res.status(200).json({ ok: true, updatedAt: row.updated_at, revision: row.revision, schemaVersion: row.schema_version, dataMode: row.data_mode });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    const err = e as Error & { code?: string };
    if (err.code === 'SNAPSHOT_CONFLICT') return res.status(409).json({ error: 'Snapshot conflict', code: 'SNAPSHOT_CONFLICT' });
    if (err.code === 'DATA_MODE_MISMATCH') return res.status(409).json({ error: 'Data mode mismatch', code: 'DATA_MODE_MISMATCH' });
    return res.status(500).json({ error: 'Internal error', code: 'INTERNAL' });
  }
}
