/**
 * Sync device repository snapshot to server (Wave 5). UI never calls this directly — repository hooks only.
 */
import type { RepositorySnapshot } from './types';
import { getSupabase } from '../../../../utils/supabase';

export type ServerSyncResult =
  | { ok: true; updatedAt: string }
  | { ok: false; code: 'OFFLINE' | 'AUTH' | 'CONFLICT' | 'SERVER' | 'NOT_CONFIGURED'; message: string };

export async function pullServerSnapshot(apiBase: string, accessToken: string): Promise<{ snapshot: RepositorySnapshot | null; updatedAt: string | null }> {
  const res = await fetch(`${apiBase}/api/jurnl/repository`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (res.status === 401) throw new Error('AUTH');
  if (!res.ok) throw new Error(`SERVER_${res.status}`);
  const body = (await res.json()) as { snapshot: RepositorySnapshot | null; updatedAt: string | null };
  return { snapshot: body.snapshot, updatedAt: body.updatedAt };
}

export async function pushServerSnapshot(
  apiBase: string,
  accessToken: string,
  snapshot: RepositorySnapshot,
  expectedUpdatedAt?: string | null,
  idempotencyKey?: string,
): Promise<ServerSyncResult> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };
  if (idempotencyKey) headers['X-Jurnl-Idempotency-Key'] = idempotencyKey;

  const res = await fetch(`${apiBase}/api/jurnl/repository`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ snapshot, expectedUpdatedAt: expectedUpdatedAt ?? null }),
  });

  if (res.status === 401) return { ok: false, code: 'AUTH', message: 'SESSION EXPIRED' };
  if (res.status === 409) return { ok: false, code: 'CONFLICT', message: 'DATA CHANGED ON ANOTHER DEVICE' };
  if (!res.ok) return { ok: false, code: 'SERVER', message: `SAVE FAILED (${res.status})` };

  const body = (await res.json()) as { updatedAt?: string };
  return { ok: true, updatedAt: body.updatedAt ?? new Date().toISOString() };
}

export async function getAccessTokenForSync(): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.auth.getSession();
  return data.session?.access_token ?? null;
}
