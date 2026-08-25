/**
 * Origin + Client Truth ingestion service — P0.C
 * CLIENT INPUT → STORED AS CLIENT TRUTH (never auto-canonized)
 */

import { getSupabaseAdmin } from '../supabase.js';
import { resolveCanonicalProject } from './canonicalProject.js';
import {
  storeClientTruth,
  listClientTruthForProject,
  isNonCanonicalClientTruth,
  type ClientTruthRecord,
} from './clientTruthService.js';
import { buildProjectIsolationHealthReport } from './projectHealth.js';
import { projectAssetStoragePath } from '../../../shared/site00-projects/storagePaths.js';
import {
  ORIGIN_CATEGORIES,
  type OriginCategory,
  type OriginIngestionSessionStatus,
  type OriginSummaryLabel,
} from '../../../shared/site00-origin/categories.js';
import {
  ASTRAL_WORLD_TRUTH_SEEDS,
  ASTRAL_WORLD_SOURCE_REFERENCES,
} from '../../../shared/site00-origin/astralWorldSeed.js';
import type { Site00ProjectStatus } from '../../../shared/site00-projects/projectTypes.js';

export type OriginIngestionSession = {
  id: string;
  project_id: string;
  status: OriginIngestionSessionStatus;
  started_at: string | null;
  completed_at: string | null;
  initiated_by: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type OriginSummary = {
  id: string;
  project_id: string;
  session_id: string | null;
  summary: OriginSummaryPayload;
  source_record_ids: string[];
  is_canonical: boolean;
  generated_at: string;
};

export type OriginSummaryPayload = {
  projectSlug: string;
  projectType: string | null;
  generatedAt: string;
  sections: Partial<
    Record<
      OriginCategory,
      Array<{ title: string | null; label: OriginSummaryLabel; excerpt: string }>
    >
  >;
  unresolvedCount: number;
  clientTruthCount: number;
  sourceReferenceCount: number;
  canonRecordCountFromOrigin: number;
  note: string;
};

export type OriginIngestionHealth = {
  projectSlug: string;
  projectStatus: Site00ProjectStatus;
  originStatus: OriginIngestionSessionStatus | 'NOT_STARTED';
  clientTruthRecordCount: number;
  sourceReferenceCount: number;
  unresolvedDecisionCount: number;
  canonRecordCountCreatedByOrigin: number;
  crossProjectLeakCount: number;
  ingestionSessionCount: number;
  originSummaryGenerated: boolean;
};

export type OriginIngestResult = {
  session: OriginIngestionSession;
  clientTruthRecords: ClientTruthRecord[];
  sourceReferences: Array<{ id: string; asset_key: string; project_id: string }>;
  summary: OriginSummary;
  projectStatusAfter: Site00ProjectStatus;
};

const BLOCKED_POST_ORIGIN_STATUSES: Site00ProjectStatus[] = ['PRODUCTION', 'ARCHIVED'];

function excerptFromPayload(payload: Record<string, unknown>): string {
  if (typeof payload.content === 'string') return payload.content.slice(0, 280);
  if (payload.content && typeof payload.content === 'object') {
    return JSON.stringify(payload.content).slice(0, 280);
  }
  return JSON.stringify(payload).slice(0, 280);
}

function labelFromPayload(payload: Record<string, unknown>): OriginSummaryLabel {
  const label = payload.truthLabel as string | undefined;
  if (label === 'CLIENT_CONFIRMED') return 'CLIENT_CONFIRMED';
  if (payload.category === 'UNRESOLVED_DECISIONS') return 'UNRESOLVED';
  return 'CLIENT_PROPOSED';
}

export async function getOrCreateIngestionSession(
  projectIdOrSlug: string,
  initiatedBy?: string | null,
): Promise<OriginIngestionSession> {
  const resolved = await resolveCanonicalProject({ slug: projectIdOrSlug, projectId: projectIdOrSlug });
  if (!resolved.ok) throw new Error(resolved.error.message);

  const { data: existing } = await getSupabaseAdmin()
    .from('site00_origin_ingestion_sessions')
    .select('*')
    .eq('project_id', resolved.project.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) return existing as OriginIngestionSession;

  const now = new Date().toISOString();
  const { data, error } = await getSupabaseAdmin()
    .from('site00_origin_ingestion_sessions')
    .insert({
      project_id: resolved.project.id,
      status: 'NOT_STARTED',
      initiated_by: initiatedBy ?? null,
      metadata: { source: 'origin_ingestion_service' },
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as OriginIngestionSession;
}

export async function generateOriginSummary(
  projectIdOrSlug: string,
  sessionId?: string | null,
): Promise<OriginSummary> {
  const resolved = await resolveCanonicalProject({ slug: projectIdOrSlug, projectId: projectIdOrSlug });
  if (!resolved.ok) throw new Error(resolved.error.message);

  const records = await listClientTruthForProject(resolved.project.slug);
  const sourceRecordIds = records.map((r) => r.id);

  const sections: OriginSummaryPayload['sections'] = {};
  for (const cat of ORIGIN_CATEGORIES) {
    sections[cat] = [];
  }

  for (const record of records) {
    const payload = record.payload as Record<string, unknown>;
    const category = (payload.category as OriginCategory) ?? 'PROJECT_OVERVIEW';
    if (!sections[category]) sections[category] = [];
    sections[category]!.push({
      title: record.title,
      label: labelFromPayload(payload),
      excerpt: excerptFromPayload(payload),
    });
  }

  const { count: refCount } = await getSupabaseAdmin()
    .from('site00_logical_assets')
    .select('id', { count: 'exact', head: true })
    .eq('project_id', resolved.project.id)
    .eq('asset_type', 'source_reference');

  const unresolvedCount = records.filter(
    (r) => (r.payload as Record<string, unknown>).category === 'UNRESOLVED_DECISIONS',
  ).length;

  const summaryPayload: OriginSummaryPayload = {
    projectSlug: resolved.project.slug,
    projectType: resolved.project.projectType,
    generatedAt: new Date().toISOString(),
    sections,
    unresolvedCount,
    clientTruthCount: records.length,
    sourceReferenceCount: refCount ?? 0,
    canonRecordCountFromOrigin: 0,
    note: 'Derived summary — does not replace source client truth records. Non-canonical.',
  };

  const { data, error } = await getSupabaseAdmin()
    .from('site00_origin_summaries')
    .insert({
      project_id: resolved.project.id,
      session_id: sessionId ?? null,
      summary: summaryPayload,
      source_record_ids: sourceRecordIds,
      is_canonical: false,
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as OriginSummary;
}

export async function getLatestOriginSummary(projectIdOrSlug: string): Promise<OriginSummary | null> {
  const resolved = await resolveCanonicalProject({ slug: projectIdOrSlug, projectId: projectIdOrSlug });
  if (!resolved.ok) return null;

  const { data } = await getSupabaseAdmin()
    .from('site00_origin_summaries')
    .select('*')
    .eq('project_id', resolved.project.id)
    .order('generated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return (data as OriginSummary) ?? null;
}

async function storeSourceReference(input: {
  projectId: string;
  assetKey: string;
  displayName: string;
  description: string;
  referenceType: string;
}): Promise<{ id: string; asset_key: string; project_id: string }> {
  const storagePath = projectAssetStoragePath(input.projectId, 'origin', 'references', input.assetKey);

  const { data: existing } = await getSupabaseAdmin()
    .from('site00_logical_assets')
    .select('id, asset_key, project_id')
    .eq('asset_key', input.assetKey)
    .maybeSingle();

  if (existing) {
    return existing as { id: string; asset_key: string; project_id: string };
  }

  const { data: existingTruth } = await getSupabaseAdmin()
    .from('site00_client_truth_records')
    .select('id')
    .eq('project_id', input.projectId)
    .eq('title', input.displayName)
    .maybeSingle();

  const { data, error } = await getSupabaseAdmin()
    .from('site00_logical_assets')
    .insert({
      asset_key: input.assetKey,
      display_name: input.displayName,
      asset_type: 'source_reference',
      category: 'origin_client_reference',
      status: 'REFERENCE',
      required: false,
      project_id: input.projectId,
      ownership_status: 'SCOPED',
    })
    .select('id, asset_key, project_id')
    .single();

  if (error) throw error;

  if (!existingTruth) {
    await getSupabaseAdmin()
      .from('site00_client_truth_records')
      .insert({
        project_id: input.projectId,
        truth_class: 'CLIENT_SUPPLIED',
        status: 'RAW',
        title: input.displayName,
        source: 'origin_source_reference',
        payload: {
          category: 'SOURCE_REFERENCES',
          content: {
            description: input.description,
            referenceType: input.referenceType,
            storagePath,
            canonState: 'NON_CANONICAL',
          },
          truthLabel: 'CLIENT_PROPOSED',
        },
      });
  }

  return data as { id: string; asset_key: string; project_id: string };
}

export async function ingestAstralWorldOrigin(initiatedBy?: string): Promise<OriginIngestResult> {
  return ingestProjectOrigin('astral-world', initiatedBy);
}

export async function ingestProjectOrigin(
  projectIdOrSlug: string,
  initiatedBy?: string,
): Promise<OriginIngestResult> {
  const resolved = await resolveCanonicalProject({ slug: projectIdOrSlug, projectId: projectIdOrSlug });
  if (!resolved.ok) throw new Error(resolved.error.message);

  if (resolved.project.slug !== 'astral-world') {
    throw new Error(`Initial seed data only defined for astral-world; got ${resolved.project.slug}`);
  }

  let session = await getOrCreateIngestionSession(resolved.project.slug, initiatedBy);
  const now = new Date().toISOString();

  if (session.status !== 'INGESTED') {
    await getSupabaseAdmin()
      .from('site00_origin_ingestion_sessions')
      .update({ status: 'IN_PROGRESS', started_at: session.started_at ?? now, updated_at: now })
      .eq('id', session.id);

    session = { ...session, status: 'IN_PROGRESS', started_at: session.started_at ?? now };
  }

  const existing = await listClientTruthForProject(resolved.project.slug);
  const clientTruthRecords: ClientTruthRecord[] = [...existing];

  if (existing.length === 0) {
    for (const seed of ASTRAL_WORLD_TRUTH_SEEDS) {
      const record = await storeClientTruth({
        projectIdOrSlug: resolved.project.slug,
        title: seed.title,
        source: seed.source,
        payload: {
          category: seed.category,
          content: seed.content,
          truthLabel: seed.truthLabel,
          isCanonical: false,
        },
      });
      clientTruthRecords.push(record);
    }
  }

  const sourceReferences: Array<{ id: string; asset_key: string; project_id: string }> = [];
  for (const ref of ASTRAL_WORLD_SOURCE_REFERENCES) {
    const stored = await storeSourceReference({
      projectId: resolved.project.id,
      assetKey: ref.assetKey,
      displayName: ref.displayName,
      description: ref.description,
      referenceType: ref.referenceType,
    });
    sourceReferences.push(stored);
  }

  let summaryRecord = await getLatestOriginSummary(resolved.project.slug);
  if (!summaryRecord) {
    summaryRecord = await generateOriginSummary(resolved.project.slug, session.id);
  }
  const summary = summaryRecord;

  const completedAt = new Date().toISOString();
  await getSupabaseAdmin()
    .from('site00_origin_ingestion_sessions')
    .update({ status: 'INGESTED', completed_at: completedAt, updated_at: completedAt })
    .eq('id', session.id);

  session = { ...session, status: 'INGESTED', completed_at: completedAt };

  const projectStatusAfter =
    resolved.project.status === 'ORIGIN_INGESTED'
      ? resolved.project.status
      : await transitionToOriginIngested(resolved.project.slug);

  return {
    session,
    clientTruthRecords,
    sourceReferences,
    summary,
    projectStatusAfter,
  };
}

export async function transitionToOriginIngested(projectIdOrSlug: string): Promise<Site00ProjectStatus> {
  const resolved = await resolveCanonicalProject({ slug: projectIdOrSlug, projectId: projectIdOrSlug });
  if (!resolved.ok) throw new Error(resolved.error.message);

  const records = await listClientTruthForProject(resolved.project.slug);
  if (records.length === 0) {
    throw new Error('Cannot transition: no client truth records persisted');
  }

  const leakCount = await countCrossProjectLeakage(resolved.project.id, resolved.project.slug);
  if (leakCount > 0) {
    throw new Error(`Cannot transition: cross-project leakage detected (${leakCount})`);
  }

  const targetStatus: Site00ProjectStatus = 'ORIGIN_INGESTED';

  const { error } = await getSupabaseAdmin()
    .from('site00_projects')
    .update({
      status: targetStatus,
      metadata: {
        ...resolved.project.metadata,
        originIngestedAt: new Date().toISOString(),
        originStatus: 'INGESTED',
      },
      updated_at: new Date().toISOString(),
    })
    .eq('id', resolved.project.id);

  if (error) throw error;
  return targetStatus;
}

export function assertOriginCannotSkipToProduction(currentStatus: Site00ProjectStatus): boolean {
  return !BLOCKED_POST_ORIGIN_STATUSES.includes(currentStatus);
}

export async function countCrossProjectLeakage(
  projectId: string,
  projectSlug: string,
): Promise<number> {
  const { count: truthLeak } = await getSupabaseAdmin()
    .from('site00_client_truth_records')
    .select('id', { count: 'exact', head: true })
    .eq('project_id', projectId)
    .filter('payload->>content', 'ilike', '%ndxbook%');

  const { data: ndxProject } = await getSupabaseAdmin()
    .from('site00_projects')
    .select('id')
    .eq('slug', 'ndxbook')
    .maybeSingle();

  let ndxLeak = 0;
  if (ndxProject?.id && projectSlug === 'astral-world') {
    const { count } = await getSupabaseAdmin()
      .from('site00_client_truth_records')
      .select('id', { count: 'exact', head: true })
      .eq('project_id', ndxProject.id)
      .filter('payload->>content', 'ilike', '%astral%');
    ndxLeak = count ?? 0;
  }

  return (truthLeak ?? 0) + ndxLeak;
}

export async function buildOriginIngestionHealth(
  projectIdOrSlug: string,
): Promise<OriginIngestionHealth> {
  const resolved = await resolveCanonicalProject({ slug: projectIdOrSlug, projectId: projectIdOrSlug });
  if (!resolved.ok) throw new Error(resolved.error.message);

  const records = await listClientTruthForProject(resolved.project.slug);

  const { count: refCount } = await getSupabaseAdmin()
    .from('site00_logical_assets')
    .select('id', { count: 'exact', head: true })
    .eq('project_id', resolved.project.id)
    .eq('asset_type', 'source_reference');

  const { count: sessionCount } = await getSupabaseAdmin()
    .from('site00_origin_ingestion_sessions')
    .select('id', { count: 'exact', head: true })
    .eq('project_id', resolved.project.id);

  const { data: latestSession } = await getSupabaseAdmin()
    .from('site00_origin_ingestion_sessions')
    .select('status')
    .eq('project_id', resolved.project.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const summary = await getLatestOriginSummary(resolved.project.slug);
  const unresolvedDecisionCount = records.filter(
    (r) => (r.payload as Record<string, unknown>).category === 'UNRESOLVED_DECISIONS',
  ).length;

  const leakCount = await countCrossProjectLeakage(resolved.project.id, resolved.project.slug);

  return {
    projectSlug: resolved.project.slug,
    projectStatus: resolved.project.status,
    originStatus: (latestSession?.status as OriginIngestionSessionStatus) ?? 'NOT_STARTED',
    clientTruthRecordCount: records.length,
    sourceReferenceCount: refCount ?? 0,
    unresolvedDecisionCount,
    canonRecordCountCreatedByOrigin: 0,
    crossProjectLeakCount: leakCount,
    ingestionSessionCount: sessionCount ?? 0,
    originSummaryGenerated: summary !== null,
  };
}

export async function verifyAllClientTruthNonCanonical(projectIdOrSlug: string): Promise<boolean> {
  const records = await listClientTruthForProject(projectIdOrSlug);
  return records.every(isNonCanonicalClientTruth);
}

export async function runProjectIsolationHealthCheck() {
  return buildProjectIsolationHealthReport();
}

export { ASTRAL_WORLD_TRUTH_SEEDS, ORIGIN_CATEGORIES };
