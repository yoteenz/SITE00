/**
 * Internal authorization grants — not public plans, not billing products, not checkout items.
 */

export const INTERNAL_GRANT_SCHEMA_VERSION = 'SITE00.INTERNAL_GRANT.V1' as const;

export const INTERNAL_GRANT_TYPES = ['FOUNDER_FULL'] as const;
export type InternalGrantType = (typeof INTERNAL_GRANT_TYPES)[number];

export type InternalGrantStatus = 'ACTIVE' | 'REVOKED';

/** Trusted grant row — principal_id is immutable auth user id (never email). */
export type InternalGrantRecord = {
  grant_id?: string;
  schema_version: typeof INTERNAL_GRANT_SCHEMA_VERSION;
  grant_type: InternalGrantType;
  principal_id: string;
  project_id: string;
  status: InternalGrantStatus;
  granted_by: string;
  created_at: string;
  updated_at: string;
  revoked_at: string | null;
  reason: string;
};

export type InternalGrantInput = Pick<
  InternalGrantRecord,
  'grant_type' | 'principal_id' | 'project_id' | 'granted_by' | 'reason'
>;

/** Metadata attached to authoritative resolutions when an internal grant influenced capabilities. */
export type InternalGrantResolutionMeta = {
  active: InternalGrantType[];
  enforcementSource: 'INTERNAL_GRANT' | 'SUBSCRIPTION_ONLY';
};

export function activeInternalGrants(grants: InternalGrantRecord[] | undefined, projectId: string): InternalGrantRecord[] {
  return (grants ?? []).filter((g) => g.project_id === projectId && g.status === 'ACTIVE' && g.grant_type === 'FOUNDER_FULL');
}

export function hasActiveFounderFull(grants: InternalGrantRecord[] | undefined, projectId: string): boolean {
  return activeInternalGrants(grants, projectId).length > 0;
}
