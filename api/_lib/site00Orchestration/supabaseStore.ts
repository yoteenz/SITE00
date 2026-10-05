/** Supabase-backed orchestration persistence */

import { getSupabaseAdmin } from '../supabase.js';
import type {
  LaunchManifestRow,
  ManifestRequirementRow,
  OrganizationRow,
  RequirementDependencyRow,
  WorkstreamRow,
} from './types.js';

export type EvidenceInsert = {
  organization_id: string;
  workstream_id?: string | null;
  requirement_id?: string | null;
  evidence_type: string;
  title: string;
  description?: string | null;
  source: string;
  repository?: string | null;
  source_identifier?: string | null;
  source_commit?: string | null;
  source_path?: string | null;
  external_ref?: string | null;
  confidence?: string;
  validation_type?: string;
  metadata?: Record<string, unknown>;
};

export async function orchestrationTablesExist(): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('site00_organizations').select('id').limit(1);
  return !error;
}

export async function loadOrganizations(): Promise<OrganizationRow[]> {
  const { data, error } = await getSupabaseAdmin().from('site00_organizations').select('*').order('name');
  if (error) throw error;
  return (data ?? []) as OrganizationRow[];
}

export async function upsertOrganization(org: Partial<OrganizationRow> & { slug: string; name: string; classification: string }) {
  const { data, error } = await getSupabaseAdmin()
    .from('site00_organizations')
    .upsert(org, { onConflict: 'slug' })
    .select('*')
    .single();
  if (error) throw error;
  return data as OrganizationRow;
}

export async function loadManifests(orgId?: string): Promise<LaunchManifestRow[]> {
  let q = getSupabaseAdmin().from('site00_launch_manifests').select('*');
  if (orgId) q = q.eq('organization_id', orgId);
  const { data, error } = await q.order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as LaunchManifestRow[];
}

export async function loadRequirements(manifestId: string): Promise<ManifestRequirementRow[]> {
  const { data, error } = await getSupabaseAdmin()
    .from('site00_manifest_requirements')
    .select('*')
    .eq('manifest_id', manifestId)
    .order('sort_order');
  if (error) throw error;
  return (data ?? []) as ManifestRequirementRow[];
}

export async function loadAllRequirements(orgId?: string): Promise<ManifestRequirementRow[]> {
  const manifests = orgId ? await loadManifests(orgId) : await loadManifests();
  const ids = manifests.map((m) => m.id);
  if (!ids.length) return [];
  const { data, error } = await getSupabaseAdmin()
    .from('site00_manifest_requirements')
    .select('*')
    .in('manifest_id', ids);
  if (error) throw error;
  return (data ?? []) as ManifestRequirementRow[];
}

export async function loadDependencies(manifestId: string): Promise<RequirementDependencyRow[]> {
  const { data, error } = await getSupabaseAdmin()
    .from('site00_requirement_dependencies')
    .select('*')
    .eq('manifest_id', manifestId);
  if (error) throw error;
  return (data ?? []) as RequirementDependencyRow[];
}

export async function loadWorkstreams(orgId: string): Promise<WorkstreamRow[]> {
  const { data, error } = await getSupabaseAdmin()
    .from('site00_workstreams')
    .select('*')
    .eq('organization_id', orgId);
  if (error) throw error;
  return (data ?? []) as WorkstreamRow[];
}

export async function loadOverrides(): Promise<Set<string>> {
  const { data, error } = await getSupabaseAdmin().from('site00_launch_overrides').select('requirement_id');
  if (error) throw error;
  return new Set((data ?? []).map((r) => r.requirement_id as string));
}

export async function insertEvidenceBatch(rows: EvidenceInsert[]) {
  if (!rows.length) return [];
  const { data, error } = await getSupabaseAdmin()
    .from('site00_evidence_records')
    .insert(rows.map((r) => ({ ...r, does_not_imply_completion: true, recorded_by: 'RECONCILIATION' })))
    .select('*');
  if (error) throw error;
  return data ?? [];
}

export async function loadEvidence(orgId: string) {
  const { data, error } = await getSupabaseAdmin()
    .from('site00_evidence_records')
    .select('*')
    .eq('organization_id', orgId)
    .order('observed_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function insertReconciliation(record: Record<string, unknown>) {
  const { data, error } = await getSupabaseAdmin()
    .from('site00_reconciliation_records')
    .insert(record)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function updateReconciliation(id: string, patch: Record<string, unknown>) {
  const { data, error } = await getSupabaseAdmin()
    .from('site00_reconciliation_records')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function loadReconciliations(orgId: string, pendingOnly = false) {
  let q = getSupabaseAdmin().from('site00_reconciliation_records').select('*').eq('organization_id', orgId);
  if (pendingOnly) q = q.is('admin_decision', null);
  const { data, error } = await q.order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function upsertExternalConnection(input: Record<string, unknown>) {
  const { data, error } = await getSupabaseAdmin()
    .from('site00_external_connections')
    .upsert(input, { onConflict: 'organization_id,external_system_id,logical_name' })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function getExternalSystemByKey(systemKey: string) {
  const { data, error } = await getSupabaseAdmin()
    .from('site00_external_systems')
    .select('*')
    .eq('system_key', systemKey)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function loadExternalConnections(orgId?: string) {
  let q = getSupabaseAdmin().from('site00_external_connections').select('*, site00_external_systems(*)');
  if (orgId) q = q.eq('organization_id', orgId);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function insertOrchestrationEvent(input: Record<string, unknown>) {
  const { data, error } = await getSupabaseAdmin().from('site00_orchestration_events').insert(input).select('*').single();
  if (error) throw error;
  return data;
}

export async function loadOrchestrationEvents(orgId?: string, limit = 50) {
  let q = getSupabaseAdmin().from('site00_orchestration_events').select('*').order('created_at', { ascending: false }).limit(limit);
  if (orgId) q = q.eq('organization_id', orgId);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function upsertWorkstream(input: Record<string, unknown>) {
  const { data, error } = await getSupabaseAdmin()
    .from('site00_workstreams')
    .upsert(input, { onConflict: 'organization_id,workstream_key' })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function upsertManifest(input: Record<string, unknown>) {
  const { data, error } = await getSupabaseAdmin()
    .from('site00_launch_manifests')
    .insert(input)
    .select('*')
    .single();
  if (error) throw error;
  return data as LaunchManifestRow;
}

export async function upsertRequirements(manifestId: string, reqs: Array<Record<string, unknown>>) {
  const rows = reqs.map((r) => ({ ...r, manifest_id: manifestId }));
  const { data, error } = await getSupabaseAdmin()
    .from('site00_manifest_requirements')
    .upsert(rows, { onConflict: 'manifest_id,requirement_key' })
    .select('*');
  if (error) throw error;
  return data as ManifestRequirementRow[];
}

export async function updateOrganizationHealth(orgId: string, health: string, reconciliationState?: string) {
  const patch: Record<string, unknown> = { project_health: health, updated_at: new Date().toISOString() };
  if (reconciliationState) patch.reconciliation_state = reconciliationState;
  const { error } = await getSupabaseAdmin().from('site00_organizations').update(patch).eq('id', orgId);
  if (error) throw error;
}

export async function updateRequirement(id: string, patch: Record<string, unknown>) {
  const { data, error } = await getSupabaseAdmin()
    .from('site00_manifest_requirements')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as ManifestRequirementRow;
}

export async function loadEvolveItems(orgId: string) {
  const { data, error } = await getSupabaseAdmin()
    .from('site00_evolve_roadmap_items')
    .select('*')
    .eq('organization_id', orgId);
  if (error) throw error;
  return data ?? [];
}

export async function insertEvolveItem(input: Record<string, unknown>) {
  const { data, error } = await getSupabaseAdmin().from('site00_evolve_roadmap_items').insert(input).select('*').single();
  if (error) throw error;
  return data;
}

export async function insertDriftEvent(input: Record<string, unknown>) {
  const { data, error } = await getSupabaseAdmin().from('site00_drift_events').insert(input).select('*').single();
  if (error) throw error;
  return data;
}

export async function upsertOrganizationRelationship(input: Record<string, unknown>) {
  const { data, error } = await getSupabaseAdmin()
    .from('site00_organization_relationships')
    .upsert(input, { onConflict: 'source_organization_id,target_organization_id,relationship_type' })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function approveManifestDb(manifestId: string, approverEmail: string) {
  const supabase = getSupabaseAdmin();
  const { data: manifest } = await supabase.from('site00_launch_manifests').select('*').eq('id', manifestId).single();
  if (!manifest) throw new Error('Manifest not found');

  await supabase
    .from('site00_launch_manifests')
    .update({ is_active: false, manifest_state: 'SUPERSEDED' })
    .eq('organization_id', manifest.organization_id)
    .eq('is_active', true);

  const { data, error } = await supabase
    .from('site00_launch_manifests')
    .update({
      approval_state: 'APPROVED',
      manifest_state: 'ACTIVE',
      is_active: true,
      is_provisional: false,
      approved_at: new Date().toISOString(),
      metadata: { ...(manifest.metadata as object), approved_by_email: approverEmail },
    })
    .eq('id', manifestId)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function countOrganizations(): Promise<number> {
  const { count, error } = await getSupabaseAdmin()
    .from('site00_organizations')
    .select('*', { count: 'exact', head: true });
  if (error) throw error;
  return count ?? 0;
}
