/**
 * Supabase-backed Brand Lore profile store — durable system of record.
 * Mirrors api/_lib/site00Intakes/supabaseStore.ts conventions (table naming, mapRow shape,
 * getSupabaseAdmin() service-role access, server-mediated only — see
 * supabase/migrations/20260821050000_site00_brand_lore_profiles.sql).
 */
import { getSupabaseAdmin } from '../supabase.js';
import type { BrandLoreProfile } from '../../../shared/site00-brand-lore/types.js';

const TABLE = 'site00_brand_lore_profiles';

type Row = {
  id: string;
  organization_id: string | null;
  project_id: string | null;
  source_intake_type: 'IDENTITY' | 'BUILDER' | 'CONTENT_BRAIN';
  source_intake_id: string;
  profile_version: number;
  expression_context: string | null;
  readiness_state: string;
  readiness_missing_domains: unknown;
  profile: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

function mapRow(row: Row): BrandLoreProfile {
  // The full structured profile (every BrandLoreField with provenance) lives in `profile` —
  // organization_id/project_id/readiness/version columns exist for indexing/filtering only and
  // are kept in sync with the same values inside `profile` on every write (see toColumns()).
  return row.profile as unknown as BrandLoreProfile;
}

function toColumns(profile: BrandLoreProfile, version: number): Record<string, unknown> {
  return {
    organization_id: profile.organizationId ?? null,
    project_id: profile.projectId ?? null,
    source_intake_type: profile.sourceIntakeType ?? 'IDENTITY',
    source_intake_id: profile.sourceIntakeId ?? profile.id,
    profile_version: version,
    expression_context: profile.contextClassification ?? null,
    readiness_state: profile.readinessState,
    readiness_missing_domains: profile.readinessMissingDomains ?? [],
    profile: profile as unknown as Record<string, unknown>,
    updated_at: new Date().toISOString(),
  };
}

export async function saveBrandLoreProfile(profile: BrandLoreProfile): Promise<BrandLoreProfile> {
  if (!profile.sourceIntakeId) {
    throw new Error('BrandLoreProfile requires sourceIntakeId for durable persistence');
  }
  const sourceIntakeType = profile.sourceIntakeType ?? 'IDENTITY';

  const { data: existing, error: findErr } = await getSupabaseAdmin()
    .from(TABLE)
    .select('id, profile_version')
    .eq('source_intake_type', sourceIntakeType)
    .eq('source_intake_id', profile.sourceIntakeId)
    .maybeSingle();
  if (findErr) throw findErr;

  const nextVersion = existing ? Number(existing.profile_version ?? 1) + 1 : 1;
  const stamped: BrandLoreProfile = { ...profile, updatedAt: new Date().toISOString() };
  const columns = toColumns(stamped, nextVersion);

  if (existing) {
    const { data, error } = await getSupabaseAdmin()
      .from(TABLE)
      .update(columns)
      .eq('id', existing.id)
      .select('*')
      .single();
    if (error || !data) throw error ?? new Error('FAILED TO UPDATE BRAND LORE PROFILE');
    return mapRow(data as Row);
  }

  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .insert({ id: stamped.id, created_at: stamped.createdAt, ...columns })
    .select('*')
    .single();
  if (error || !data) throw error ?? new Error('FAILED TO CREATE BRAND LORE PROFILE');
  return mapRow(data as Row);
}

export async function getBrandLoreProfileById(id: string): Promise<BrandLoreProfile | null> {
  const { data, error } = await getSupabaseAdmin().from(TABLE).select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? mapRow(data as Row) : null;
}

export async function getBrandLoreProfileByIntake(
  intakeType: 'IDENTITY' | 'BUILDER' | 'CONTENT_BRAIN',
  intakeId: string,
): Promise<BrandLoreProfile | null> {
  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .select('*')
    .eq('source_intake_type', intakeType)
    .eq('source_intake_id', intakeId)
    .maybeSingle();
  if (error) throw error;
  return data ? mapRow(data as Row) : null;
}

/** Most-recently-updated Brand Lore profile for an organization (used by Creative Direction
 * readiness gating — see api/_lib/site00BrandLore/brandLoreBridge.ts). */
export async function getBrandLoreProfileByOrgId(orgId: string): Promise<BrandLoreProfile | null> {
  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .select('*')
    .eq('organization_id', orgId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? mapRow(data as Row) : null;
}

export async function confirmLoreField(
  profileId: string,
  fieldKey: keyof BrandLoreProfile,
): Promise<BrandLoreProfile | null> {
  const { data, error } = await getSupabaseAdmin().from(TABLE).select('*').eq('id', profileId).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const profile = mapRow(data as Row);
  const field = profile[fieldKey];
  if (!field || typeof field !== 'object' || !('founderConfirmationState' in field)) return profile;

  const updated: BrandLoreProfile = {
    ...profile,
    [fieldKey]: {
      ...(field as Record<string, unknown>),
      founderConfirmationState: 'CONFIRMED',
      classification: 'FOUNDER_CONFIRMED',
    },
  } as BrandLoreProfile;

  return saveBrandLoreProfile(updated);
}

export async function brandLoreTablesExist(): Promise<boolean> {
  try {
    const { error } = await getSupabaseAdmin().from(TABLE).select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
}
