/**
 * Durable internal grant persistence (Supabase service role).
 */

import { randomUUID } from 'node:crypto';
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
  const sb = getSupabaseAdminServiceRole();
  const now = new Date().toISOString();

  const { data: existing, error: readErr } = await sb
    .from('jurnl_internal_grants')
    .select('*')
    .eq('project_id', input.project_id)
    .eq('principal_id', input.principal_id)
    .eq('grant_type', input.grant_type)
    .eq('status', 'ACTIVE')
    .maybeSingle();
  if (readErr) return { ok: false, code: 'PERSISTENCE_FAILED', error: readErr.message };

  if (existing) {
    const { data: updated, error: updErr } = await sb
      .from('jurnl_internal_grants')
      .update({ reason: input.reason, updated_at: now, granted_by: input.granted_by })
      .eq('grant_id', existing.grant_id)
      .select('*')
      .single();
    if (updErr) return { ok: false, code: 'PERSISTENCE_FAILED', error: updErr.message };
    await sb.from('jurnl_internal_grant_audit').insert({
      grant_id: existing.grant_id,
      action: 'GRANT',
      actor_id: input.granted_by,
      reason: `IDEMPOTENT_UPDATE: ${input.reason}`,
    });
    return { ok: true, value: rowToRecord(updated as Record<string, unknown>) };
  }

  const grantId = randomUUID();
  const { data: inserted, error: insErr } = await sb
    .from('jurnl_internal_grants')
    .insert({
      grant_id: grantId,
      project_id: input.project_id,
      principal_id: input.principal_id,
      grant_type: input.grant_type,
      status: 'ACTIVE',
      granted_by: input.granted_by,
      reason: input.reason,
      schema_version: INTERNAL_GRANT_SCHEMA_VERSION,
      created_at: now,
      updated_at: now,
      revoked_at: null,
    })
    .select('*')
    .single();
  if (insErr) return { ok: false, code: 'PERSISTENCE_FAILED', error: insErr.message };

  await sb.from('jurnl_internal_grant_audit').insert({
    grant_id: grantId,
    action: 'GRANT',
    actor_id: input.granted_by,
    reason: input.reason,
  });
  return { ok: true, value: rowToRecord(inserted as Record<string, unknown>) };
}

export async function revokeGrantInDb(
  projectId: string,
  principalId: string,
  grantType: InternalGrantType,
  revokedBy: string,
  reason: string,
): Promise<GrantPersistenceOk<InternalGrantRecord> | GrantPersistenceError> {
  const sb = getSupabaseAdminServiceRole();
  const { data: active, error: readErr } = await sb
    .from('jurnl_internal_grants')
    .select('*')
    .eq('project_id', projectId)
    .eq('principal_id', principalId)
    .eq('grant_type', grantType)
    .eq('status', 'ACTIVE')
    .maybeSingle();
  if (readErr) return { ok: false, code: 'PERSISTENCE_FAILED', error: readErr.message };
  if (!active) return { ok: false, code: 'PERSISTENCE_FAILED', error: 'GRANT_NOT_FOUND' };

  const now = new Date().toISOString();
  const { data: updated, error: updErr } = await sb
    .from('jurnl_internal_grants')
    .update({
      status: 'REVOKED',
      updated_at: now,
      revoked_at: now,
      reason: `${active.reason} · REVOKED: ${reason}`,
    })
    .eq('grant_id', active.grant_id)
    .select('*')
    .single();
  if (updErr) return { ok: false, code: 'PERSISTENCE_FAILED', error: updErr.message };

  await sb.from('jurnl_internal_grant_audit').insert({
    grant_id: active.grant_id,
    action: 'REVOKE',
    actor_id: revokedBy,
    reason,
  });
  return { ok: true, value: rowToRecord(updated as Record<string, unknown>) };
}
