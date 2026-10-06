import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUser } from '../_lib/auth.js';
import { getSupabaseUser } from '../_lib/supabase.js';
import { fetchUserSnapshot, registerIdempotencyKey, upsertUserSnapshot } from '../_lib/jurnl/repositoryApi.js';

const SCHEMA_VERSION = 5;

/** GET/PUT /api/jurnl/repository — user-scoped snapshot (RLS). */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Jurnl-Idempotency-Key');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const user = await getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized', code: 'AUTH_REQUIRED' });

  const supabase = getSupabaseUser(user.accessToken);

  try {
    if (req.method === 'GET') {
      const row = await fetchUserSnapshot(supabase, user.id);
      if (!row) return res.status(200).json({ snapshot: null, updatedAt: null, schemaVersion: SCHEMA_VERSION });
      return res.status(200).json({
        snapshot: row.snapshot,
        updatedAt: row.updated_at,
        schemaVersion: row.schema_version,
      });
    }

    if (req.method === 'PUT') {
      const body = typeof req.body === 'object' && req.body !== null ? req.body : {};
      const snapshot = body.snapshot;
      if (!snapshot || typeof snapshot !== 'object') return res.status(400).json({ error: 'snapshot object required' });
      const snapUserId = String((snapshot as { userId?: string }).userId ?? '');
      if (snapUserId && snapUserId !== user.id && snapUserId.toUpperCase() !== user.email.toUpperCase()) {
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
            schemaVersion: existing?.schema_version ?? SCHEMA_VERSION,
          });
        }
      }

      const expectedUpdatedAt = body.expectedUpdatedAt ? String(body.expectedUpdatedAt) : null;
      const row = await upsertUserSnapshot(supabase, user.id, snapshot as Record<string, unknown>, SCHEMA_VERSION, expectedUpdatedAt);
      return res.status(200).json({ ok: true, updatedAt: row.updated_at, schemaVersion: row.schema_version });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    const err = e as Error & { code?: string };
    if (err.code === 'SNAPSHOT_CONFLICT') {
      return res.status(409).json({ error: 'Snapshot conflict', code: 'SNAPSHOT_CONFLICT' });
    }
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
}
