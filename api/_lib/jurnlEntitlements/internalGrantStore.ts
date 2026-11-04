/**
 * In-process internal grant store (isolated sprint — no production DB migration authorized).
 * Production activation loads grants via future trusted persistence; default store starts empty.
 */

import {
  INTERNAL_GRANT_SCHEMA_VERSION,
  type InternalGrantInput,
  type InternalGrantRecord,
  type InternalGrantStatus,
} from '../../../shared/site00-monetization/internalGrants.js';

const byPrincipal = new Map<string, InternalGrantRecord[]>();

function key(projectId: string, principalId: string) {
  return `${projectId}:${principalId}`;
}

export function listInternalGrants(projectId: string, principalId: string): InternalGrantRecord[] {
  return [...(byPrincipal.get(key(projectId, principalId)) ?? [])];
}

export function listActiveInternalGrants(projectId: string, principalId: string): InternalGrantRecord[] {
  return listInternalGrants(projectId, principalId).filter((g) => g.status === 'ACTIVE');
}

/** Test / admin tooling only — not exposed to ordinary clients. */
export function upsertInternalGrant(input: InternalGrantInput): InternalGrantRecord {
  const now = new Date().toISOString();
  const k = key(input.project_id, input.principal_id);
  const rows = [...(byPrincipal.get(k) ?? [])];
  const existing = rows.find((r) => r.grant_type === input.grant_type);
  const next: InternalGrantRecord = {
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

export function revokeInternalGrant(projectId: string, principalId: string, grantType: InternalGrantRecord['grant_type'], revokedBy: string, reason: string): InternalGrantRecord | null {
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

/** @internal test isolation */
export function resetInternalGrantStoreForTests() {
  byPrincipal.clear();
}
