/**
 * Durable internal grant persistence (Supabase service role + atomic RPC).
 */

import {
  INTERNAL_GRANT_SCHEMA_VERSION,
  type InternalGrantInput,
  type InternalGrantRecord,
  type InternalGrantType,
} from '../../../shared/site00-monetization/internalGrants.js';
import { getSupabaseAdminServiceRole, hasSupabaseServiceRole } from '../supabase.js';

export type GrantPersistenceError = { ok: false; code: 'PERSISTENCE_UNAVAILABLE' | 'PERSISTENCE_FAILED' | 'INVALID_PRINCIPAL'; error: string };
export type GrantPersistenceOk<T> = { ok: true; value: T };

export function grantsPersistenceConfigured(): boolean {
  return hasSupabaseServiceRole();
}

function rowToRecord(row: Record<string, unknown>): InternalGrantRecord {
  return {
    grant_id: String(row.grant_id),
    schema_version: (row.schema_version as InternalGrantRecord['schema_version']) ?? INTERNAL_GRANT_SCHEMA_VERSION,
    grant_type: row.grant_type as InternalGrantType,
    principal_id: String(row.principal_id),
    project_id: String(row.project_id),
    status: row.status as InternalGrantRecord['status'],
    granted_by: String(row.granted_by),
    reason: String(row.reason),
    created_at: new Date(String(row.created_at)).toISOString(),
    updated_at: new Date(String(row.updated_at)).toISOString(),
    revoked_at: row.revoked_at ? new Date(String(row.revoked_at)).toISOString() : null,
  };
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidPrincipalId(principalId: string): boolean {
  return UUID_RE.test(principalId.trim());
}

export async function listActiveGrantsFromDb(projectId: string, principalId: string): Promise<InternalGrantRecord[]> {
  const sb = getSupabaseAdminServiceRole();
  const { data, error } = await sb
    .from('jurnl_internal_grants')
    .select('*')
    .eq('project_id', projectId)
    .eq('principal_id', principalId)
    .eq('status', 'ACTIVE');
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => rowToRecord(r as Record<string, unknown>));
}

export async function upsertGrantInDb(input: InternalGrantInput & { granted_by: string }): Promise<GrantPersistenceOk<InternalGrantRecord> | GrantPersistenceError> {
  if (!isValidPrincipalId(input.principal_id)) {
    return { ok: false, code: 'INVALID_PRINCIPAL', error: 'principal_id must be a UUID' };
  }
  if (!isValidPrincipalId(input.granted_by)) {
    return { ok: false, code: 'INVALID_PRINCIPAL', error: 'granted_by must be a UUID' };
  }
  const sb = getSupabaseAdminServiceRole();
  const { data, error } = await sb.rpc('jurnl_internal_grant_upsert', {
    p_project_id: input.project_id,
    p_principal_id: input.principal_id,
    p_grant_type: input.grant_type,
    p_granted_by: input.granted_by,
    p_reason: input.reason,
    p_schema_version: INTERNAL_GRANT_SCHEMA_VERSION,
  });
  if (error) {
    const msg = error.message ?? 'RPC failed';
    if (msg.includes('INVALID_GRANT_TYPE')) return { ok: false, code: 'PERSISTENCE_FAILED', error: msg };
    return { ok: false, code: 'PERSISTENCE_FAILED', error: msg };
  }
  if (!data) return { ok: false, code: 'PERSISTENCE_FAILED', error: 'Empty RPC result' };
  return { ok: true, value: rowToRecord(data as Record<string, unknown>) };
}

export async function revokeGrantInDb(
  projectId: string,
  principalId: string,
  grantType: InternalGrantType,
  revokedBy: string,
  reason: string,
): Promise<GrantPersistenceOk<InternalGrantRecord> | GrantPersistenceError> {
  if (!isValidPrincipalId(revokedBy)) {
    return { ok: false, code: 'INVALID_PRINCIPAL', error: 'revoked_by must be a UUID' };
  }
  const sb = getSupabaseAdminServiceRole();
  const { data, error } = await sb.rpc('jurnl_internal_grant_revoke', {
    p_project_id: projectId,
    p_principal_id: principalId,
    p_grant_type: grantType,
    p_revoked_by: revokedBy,
    p_reason: reason,
  });
  if (error) {
    const msg = error.message ?? 'RPC failed';
    if (msg.includes('GRANT_NOT_FOUND')) return { ok: false, code: 'PERSISTENCE_FAILED', error: 'GRANT_NOT_FOUND' };
    return { ok: false, code: 'PERSISTENCE_FAILED', error: msg };
  }
  if (!data) return { ok: false, code: 'PERSISTENCE_FAILED', error: 'Empty RPC result' };
  return { ok: true, value: rowToRecord(data as Record<string, unknown>) };
}
