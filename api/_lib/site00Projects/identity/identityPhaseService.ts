/**
 * Identity Phase Service — P0.D generic project-scoped identity entry.
 */

import { getSupabaseAdmin } from '../../supabase.js';
import { resolveCanonicalProject } from '../canonicalProject.js';
import { listClientTruthForProject } from '../clientTruthService.js';
import type { Site00ProjectStatus } from '../../../../shared/site00-projects/projectTypes.js';
import type { IdentityPhaseStatus } from '../../../../shared/site00-identity/types.js';
import {
  ASTRAL_WORLD_IDENTITY_TERRITORY_SEEDS,
  ASTRAL_WORLD_HIERARCHY_SEED,
  ASTRAL_WORLD_FOUNDER_HIERARCHY_TRUTH,
} from '../../../../shared/site00-identity/astralWorldIdentity.js';
import { generateIdentityBrief } from './identityBriefService.js';
import { seedWorldHierarchy } from './worldHierarchyService.js';
import { assertNoHostIdentityInClientCanon } from '../../../../shared/site00-identity/hostFirewall.js';

export type IdentityPhaseRecord = {
  id: string;
  project_id: string;
  status: IdentityPhaseStatus;
  started_at: string | null;
  completed_at: string | null;
  metadata: Record<string, unknown>;
};

export async function getIdentityPhase(projectIdOrSlug: string): Promise<IdentityPhaseRecord | null> {
  const resolved = await resolveCanonicalProject({ slug: projectIdOrSlug, projectId: projectIdOrSlug });
  if (!resolved.ok) return null;

  const { data } = await getSupabaseAdmin()
    .from('site00_identity_phases')
    .select('*')
    .eq('project_id', resolved.project.id)
    .maybeSingle();

  return (data as IdentityPhaseRecord) ?? null;
}

export async function enterIdentityPhase(
  projectIdOrSlug: string,
  initiatedBy?: string,
): Promise<{
  phase: IdentityPhaseRecord;
  projectStatus: Site00ProjectStatus;
  briefId: string;
  territoryCount: number;
  hierarchyNodeCount: number;
}> {
  const resolved = await resolveCanonicalProject({ slug: projectIdOrSlug, projectId: projectIdOrSlug });
  if (!resolved.ok) throw new Error(resolved.error.message);

  if (resolved.project.status !== 'ORIGIN_INGESTED' && resolved.project.status !== 'IDENTITY_IN_PROGRESS') {
    throw new Error(`Cannot enter identity phase from status ${resolved.project.status}`);
  }

  const clientTruth = await listClientTruthForProject(resolved.project.slug);
  if (clientTruth.length === 0) {
    throw new Error('Cannot enter identity phase: no client truth records');
  }

  const now = new Date().toISOString();
  let phase = await getIdentityPhase(resolved.project.slug);

  if (!phase) {
    const { data, error } = await getSupabaseAdmin()
      .from('site00_identity_phases')
      .insert({
        project_id: resolved.project.id,
        status: 'IN_PROGRESS',
        started_at: now,
        metadata: { initiatedBy: initiatedBy ?? null, source: 'identity_phase_service' },
      })
      .select('*')
      .single();
    if (error) throw error;
    phase = data as IdentityPhaseRecord;
  } else if (phase.status === 'NOT_STARTED') {
    const { data, error } = await getSupabaseAdmin()
      .from('site00_identity_phases')
      .update({ status: 'IN_PROGRESS', started_at: phase.started_at ?? now, updated_at: now })
      .eq('id', phase.id)
      .select('*')
      .single();
    if (error) throw error;
    phase = data as IdentityPhaseRecord;
  }

  const brief = await generateIdentityBrief(resolved.project.slug);
  const hierarchyNodes = await seedWorldHierarchy(resolved.project.slug);
  const territories = await seedIdentityTerritories(resolved.project.slug);

  const { error: statusError } = await getSupabaseAdmin()
    .from('site00_projects')
    .update({
      status: 'IDENTITY_IN_PROGRESS',
      metadata: {
        ...resolved.project.metadata,
        identityPhaseEnteredAt: now,
      },
      updated_at: now,
    })
    .eq('id', resolved.project.id);

  if (statusError) throw statusError;

  return {
    phase,
    projectStatus: 'IDENTITY_IN_PROGRESS',
    briefId: brief.id,
    territoryCount: territories.length,
    hierarchyNodeCount: hierarchyNodes.length,
  };
}

export async function seedIdentityTerritories(projectIdOrSlug: string) {
  const resolved = await resolveCanonicalProject({ slug: projectIdOrSlug, projectId: projectIdOrSlug });
  if (!resolved.ok) throw new Error(resolved.error.message);

  if (resolved.project.slug !== 'astral-world') {
    throw new Error(`Territory seeds only defined for astral-world`);
  }

  const clientTruth = await listClientTruthForProject(resolved.project.slug);
  const sourceIds = clientTruth.map((r) => r.id);

  const { data: existing } = await getSupabaseAdmin()
    .from('site00_identity_territories')
    .select('id, territory_key')
    .eq('project_id', resolved.project.id);

  if ((existing ?? []).length >= ASTRAL_WORLD_IDENTITY_TERRITORY_SEEDS.length) {
    return existing ?? [];
  }

  const inserted = [];
  for (const seed of ASTRAL_WORLD_IDENTITY_TERRITORY_SEEDS) {
    const payload = seed.payload;
    if (!assertNoHostIdentityInClientCanon(payload as Record<string, unknown>)) {
      throw new Error(`Host identity leak detected in territory ${seed.territoryKey}`);
    }

    const { data, error } = await getSupabaseAdmin()
      .from('site00_identity_territories')
      .upsert(
        {
          project_id: resolved.project.id,
          territory_key: seed.territoryKey,
          working_label: seed.workingLabel,
          strategic_premise: seed.strategicPremise,
          payload,
          status: 'PROPOSED',
          source_truth_refs: sourceIds,
          creative_hypotheses: seed.creativeHypotheses,
          lineage: { seedSource: 'P0.D', truthLayer: 'CREATIVE_EXPLORATION' },
        },
        { onConflict: 'project_id,territory_key' },
      )
      .select('id, territory_key')
      .single();

    if (error) throw error;
    inserted.push(data);

    const { data: existingJudgment } = await getSupabaseAdmin()
      .from('site00_identity_judgments')
      .select('id')
      .eq('territory_id', data.id)
      .limit(1)
      .maybeSingle();

    if (!existingJudgment) {
      await getSupabaseAdmin().from('site00_identity_judgments').insert({
        project_id: resolved.project.id,
        territory_id: data.id,
        judgment: 'UNREVIEWED',
        approved_fields: {},
        metadata: { autoCreated: true },
      });
    }
  }

  return inserted;
}

export async function listIdentityTerritories(projectIdOrSlug: string) {
  const resolved = await resolveCanonicalProject({ slug: projectIdOrSlug, projectId: projectIdOrSlug });
  if (!resolved.ok) return [];

  const { data } = await getSupabaseAdmin()
    .from('site00_identity_territories')
    .select('*')
    .eq('project_id', resolved.project.id)
    .order('created_at', { ascending: true });

  return data ?? [];
}

export async function recordIdentityJudgment(input: {
  projectIdOrSlug: string;
  territoryId: string;
  judgment: 'SELECT' | 'REVISE' | 'REJECT' | 'UNREVIEWED' | 'HYBRIDIZE';
  approver?: string;
  approvedFields?: Record<string, boolean>;
  notes?: string;
}) {
  const resolved = await resolveCanonicalProject({ slug: input.projectIdOrSlug, projectId: input.projectIdOrSlug });
  if (!resolved.ok) throw new Error(resolved.error.message);

  const territoryStatus =
    input.judgment === 'SELECT'
      ? 'SELECTED'
      : input.judgment === 'REJECT'
        ? 'REJECTED'
        : input.judgment === 'REVISE'
          ? 'REVISED'
          : 'PROPOSED';

  await getSupabaseAdmin()
    .from('site00_identity_territories')
    .update({ status: territoryStatus, updated_at: new Date().toISOString() })
    .eq('id', input.territoryId)
    .eq('project_id', resolved.project.id);

  const { data, error } = await getSupabaseAdmin()
    .from('site00_identity_judgments')
    .insert({
      project_id: resolved.project.id,
      territory_id: input.territoryId,
      judgment: input.judgment,
      approver: input.approver ?? null,
      approved_fields: input.approvedFields ?? {},
      notes: input.notes ?? null,
      metadata: { recordedAt: new Date().toISOString() },
    })
    .select('*')
    .single();

  if (error) throw error;

  await getSupabaseAdmin()
    .from('site00_identity_phases')
    .update({ status: 'AWAITING_REVIEW', updated_at: new Date().toISOString() })
    .eq('project_id', resolved.project.id);

  return data;
}

export { ASTRAL_WORLD_FOUNDER_HIERARCHY_TRUTH, ASTRAL_WORLD_HIERARCHY_SEED };
