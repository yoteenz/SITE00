/**
 * Server snapshot transport (Wave 5 → connected banking hardening). UI never calls this directly — the sync
 * coordinator and the hydrate path do.
 *
 * Writes are compare-and-swap on the server revision: a device states the revision it last reconciled with, and a
 * stale revision is refused (409) instead of overwriting newer server data.
 */
import type { RepositorySnapshot } from './types';
import { getSupabase } from '../../../../utils/supabase';

export type ServerSyncResult =
  | { ok: true; updatedAt: string; revision: number }
  | { ok: false; code: 'OFFLINE' | 'AUTH' | 'CONFLICT' | 'SERVER' | 'NOT_CONFIGURED' | 'REVISION_REQUIRED' | 'DATA_MODE'; message: string };

export type PulledSnapshot = { snapshot: RepositorySnapshot | null; updatedAt: string | null; revision: number; dataMode: string | null };

export async function pullServerSnapshot(apiBase: string, accessToken: string): Promise<PulledSnapshot> {
  let res: Response;
  try {
    res = await fetch(`${apiBase}/api/jurnl/repository`, { headers: { Authorization: `Bearer ${accessToken}` } });
  } catch {
    throw new Error('OFFLINE');
  }
  if (res.status === 401) throw new Error('AUTH');
  if (!res.ok) throw new Error(`SERVER_${res.status}`);
  const body = (await res.json()) as { snapshot: RepositorySnapshot | null; updatedAt: string | null; revision?: number; dataMode?: string | null };
  return { snapshot: body.snapshot, updatedAt: body.updatedAt, revision: Number(body.revision ?? (body.snapshot ? 1 : 0)), dataMode: body.dataMode ?? null };
}

export async function pushServerSnapshot(
  apiBase: string,
  accessToken: string,
  snapshot: RepositorySnapshot,
  expectedRevision: number,
  idempotencyKey?: string,
): Promise<ServerSyncResult> {
  const headers: Record<string, string> = { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' };
  if (idempotencyKey) headers['X-Jurnl-Idempotency-Key'] = idempotencyKey;
  const dataMode = snapshot.dataMode;
  if (dataMode !== 'PRODUCTION' && dataMode !== 'PROVIDER_SANDBOX') return { ok: false, code: 'DATA_MODE', message: 'PREVIEW DATA IS NEVER SAVED TO AN ACCOUNT' };
  let res: Response;
  try {
    res = await fetch(`${apiBase}/api/jurnl/repository`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ snapshot: { ...snapshot, syncBase: undefined }, expectedRevision, dataMode }),
    });
  } catch {
    return { ok: false, code: 'OFFLINE', message: 'OFFLINE — SAVED ON THIS DEVICE, NOT YET IN YOUR ACCOUNT' };
  }
  if (res.status === 401) return { ok: false, code: 'AUTH', message: 'SESSION EXPIRED' };
  if (res.status === 409) return { ok: false, code: 'CONFLICT', message: 'DATA CHANGED ON ANOTHER DEVICE' };
  if (res.status === 428) return { ok: false, code: 'REVISION_REQUIRED', message: 'SAVE REFUSED' };
  if (!res.ok) return { ok: false, code: 'SERVER', message: `SAVE FAILED (${res.status})` };
  const body = (await res.json()) as { updatedAt?: string; revision?: number };
  return { ok: true, updatedAt: body.updatedAt ?? new Date().toISOString(), revision: Number(body.revision ?? expectedRevision + 1) };
}

export async function getAccessTokenForSync(): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.auth.getSession();
  return data.session?.access_token ?? null;
}
