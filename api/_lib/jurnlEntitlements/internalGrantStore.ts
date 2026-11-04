/**
 * Internal grant store facade — durable Supabase when configured; in-memory only for isolated tests.
 */

import {
  INTERNAL_GRANT_SCHEMA_VERSION,
  type InternalGrantInput,
  type InternalGrantRecord,
  type InternalGrantStatus,
  type InternalGrantType,
} from '../../../shared/site00-monetization/internalGrants.js';
import {
  grantsPersistenceConfigured,
  listActiveGrantsFromDb,
  revokeGrantInDb,
  upsertGrantInDb,
  type GrantPersistenceError,
  type GrantPersistenceOk,
} from './supabaseGrantStore.js';

const byPrincipal = new Map<string, InternalGrantRecord[]>();

function memoryMode(): boolean {
  return process.env.JURNL_INTERNAL_GRANTS_STORE === 'memory' || process.env.VITEST === 'true';
}

function shouldUseDatabase(): boolean {
  return !memoryMode() && grantsPersistenceConfigured();
}

function key(projectId: string, principalId: string) {
  return `${projectId}:${principalId}`;
}

function memoryList(projectId: string, principalId: string): InternalGrantRecord[] {
  return [...(byPrincipal.get(key(projectId, principalId)) ?? [])];
}

export async function listActiveInternalGrants(projectId: string, principalId: string): Promise<InternalGrantRecord[]> {
  if (shouldUseDatabase()) {
    return listActiveGrantsFromDb(projectId, principalId);
  }
  if (memoryMode()) {
    return memoryList(projectId, principalId).filter((g) => g.status === 'ACTIVE');
  }
  return [];
}

/** @deprecated tests — sync memory list */
export function listActiveInternalGrantsSync(projectId: string, principalId: string): InternalGrantRecord[] {
  return memoryList(projectId, principalId).filter((g) => g.status === 'ACTIVE');
}

export type GrantMutationResult = GrantPersistenceOk<InternalGrantRecord> | GrantPersistenceError;

function memoryUpsert(input: InternalGrantInput & { granted_by: string }): InternalGrantRecord {
  const now = new Date().toISOString();
  const k = key(input.project_id, input.principal_id);
  const rows = [...(byPrincipal.get(k) ?? [])];
  const existing = rows.find((r) => r.grant_type === input.grant_type);
  const next: InternalGrantRecord = {
    grant_id: existing?.grant_id ?? `mem-${Date.now()}`,
    schema_version: INTERNAL_GRANT_SCHEMA_VERSION,
    grant_type: input.grant_type,
    principal_id: input.principal_id,
    project_id: input.project_id,
    status: 'ACTIVE',
    granted_by: input.granted_by,
    created_at: existing?.created_at ?? now,
    updated_at: now,
    revoked_at: null,
    reason: input.reason,
  };
  const without = rows.filter((r) => r.grant_type !== input.grant_type);
  byPrincipal.set(k, [...without, next]);
  return next;
}

function memoryRevoke(projectId: string, principalId: string, grantType: InternalGrantType, revokedBy: string, reason: string): InternalGrantRecord | null {
  const k = key(projectId, principalId);
  const rows = byPrincipal.get(k);
  if (!rows) return null;
  const idx = rows.findIndex((r) => r.grant_type === grantType && r.status === 'ACTIVE');
  if (idx < 0) return null;
  const now = new Date().toISOString();
  const updated: InternalGrantRecord = {
    ...rows[idx],
    status: 'REVOKED' satisfies InternalGrantStatus,
    updated_at: now,
    revoked_at: now,
    reason: `${rows[idx].reason} · REVOKED: ${reason} (${revokedBy})`,
  };
  const copy = [...rows];
  copy[idx] = updated;
  byPrincipal.set(k, copy);
  return updated;
}

export async function upsertInternalGrant(input: InternalGrantInput & { granted_by: string }): Promise<GrantMutationResult> {
  if (shouldUseDatabase()) return upsertGrantInDb(input);
  if (memoryMode()) return { ok: true, value: memoryUpsert(input) };
  return { ok: false, code: 'PERSISTENCE_UNAVAILABLE', error: 'Internal grant persistence is not configured' };
}

export async function revokeInternalGrant(
  projectId: string,
  principalId: string,
  grantType: InternalGrantType,
  revokedBy: string,
  reason: string,
): Promise<GrantMutationResult> {
  if (shouldUseDatabase()) return revokeGrantInDb(projectId, principalId, grantType, revokedBy, reason);
  if (memoryMode()) {
    const row = memoryRevoke(projectId, principalId, grantType, revokedBy, reason);
    if (!row) return { ok: false, code: 'PERSISTENCE_FAILED', error: 'GRANT_NOT_FOUND' };
    return { ok: true, value: row };
  }
  return { ok: false, code: 'PERSISTENCE_UNAVAILABLE', error: 'Internal grant persistence is not configured' };
}

/** @internal test isolation */
export function resetInternalGrantStoreForTests() {
  byPrincipal.clear();
}

export function grantStoreMode(): 'memory' | 'supabase' | 'unconfigured' {
  if (shouldUseDatabase()) return 'supabase';
  if (memoryMode()) return 'memory';
  return 'unconfigured';
}
