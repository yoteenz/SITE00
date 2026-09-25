import { getSupabaseAdmin } from '../supabase.js';
import { NDXBOOK_ORG_ID } from '../site00Evolve/creativeDirection/creativeIntelligence/founderComparisonSet.js';
import { PAGE_CONCEPT_CANONICAL_PIPELINE_ID } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptCanonicalPipeline.js';
import type { PageConceptServerRun } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptServerRun.js';
import { logPageConceptGpt2MobileEvent } from './pageConceptGpt2MobileObservability.js';

const TABLE = 'site00_page_concept_generation_runs';

export async function pageConceptGenerationRunTableExists(): Promise<boolean> {
  if (process.env.VITEST === 'true') return false;
  const { error } = await getSupabaseAdmin().from(TABLE).select('run_id').limit(1);
  return !error;
}

export async function upsertPageConceptServerRunDurable(run: PageConceptServerRun): Promise<void> {
  if (process.env.VITEST === 'true') return;
  const exists = await pageConceptGenerationRunTableExists();
  if (!exists) return;

  const row = {
    run_id: run.runId,
    organization_id: NDXBOOK_ORG_ID,
    project_id: run.projectId,
    page_id: run.pageId,
    pipeline_id: PAGE_CONCEPT_CANONICAL_PIPELINE_ID,
    status: run.status,
    run_json: run,
    updated_at: run.updatedAt,
    created_at: run.createdAt,
  };

  const { error } = await getSupabaseAdmin().from(TABLE).upsert(row, { onConflict: 'run_id' });
  if (error) {
    console.warn('[page-concept-run-durable] upsert failed', error.message);
  }
}

export async function loadPageConceptServerRunDurable(runId: string): Promise<PageConceptServerRun | null> {
  if (process.env.VITEST === 'true') return null;
  const exists = await pageConceptGenerationRunTableExists();
  if (!exists) return null;

  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .select('run_json')
    .eq('run_id', runId)
    .maybeSingle();

  if (error || !data?.run_json) return null;
  return data.run_json as PageConceptServerRun;
}

function pageConceptServerRunHasReadyMobileGallery(run: PageConceptServerRun): boolean {
  if (run.jobs.some((j) => j.provider === 'GPT2_MOBILE' && j.status === 'READY')) return true;
  if (run.pipelineSet?.mobileConcepts?.some((c) => c.status === 'READY')) return true;
  return false;
}

/** Newest durable run with READY GPT2 mobile artifacts (gallery parity across origins). */
export async function findLatestPageConceptServerRunForPage(input: {
  projectId: string;
  pageId: string;
  pageIds?: readonly string[];
  pipelineId?: string;
}): Promise<PageConceptServerRun | null> {
  if (process.env.VITEST === 'true') return null;
  const exists = await pageConceptGenerationRunTableExists();
  if (!exists) return null;

  const pipelineId = input.pipelineId ?? PAGE_CONCEPT_CANONICAL_PIPELINE_ID;
  const slug = input.projectId.trim().toLowerCase();
  const pageIds = [
    ...new Set(
      [input.pageId, ...(input.pageIds ?? [])].map((id) => id.trim()).filter(Boolean),
    ),
  ];
  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .select('run_json, updated_at')
    .eq('project_id', slug)
    .in('page_id', pageIds)
    .eq('pipeline_id', pipelineId)
    .order('updated_at', { ascending: false })
    .limit(40);

  if (error || !data?.length) return null;

  let best: PageConceptServerRun | null = null;
  let bestTs = 0;
  for (const row of data) {
    const run = row.run_json as PageConceptServerRun;
    if (!pageConceptServerRunHasReadyMobileGallery(run)) continue;
    const ts = Date.parse(run.updatedAt || row.updated_at || run.createdAt) || 0;
    if (!best || ts > bestTs) {
      best = run;
      bestTs = ts;
    }
  }
  return best;
}

export async function findActivePageConceptServerRunForPage(input: {
  projectId: string;
  pageId: string;
  pipelineId?: string;
}): Promise<PageConceptServerRun | null> {
  if (process.env.VITEST === 'true') return null;
  const exists = await pageConceptGenerationRunTableExists();
  if (!exists) return null;

  const pipelineId = input.pipelineId ?? PAGE_CONCEPT_CANONICAL_PIPELINE_ID;
  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .select('run_json, updated_at')
    .eq('project_id', input.projectId)
    .eq('page_id', input.pageId)
    .eq('pipeline_id', pipelineId)
    .order('updated_at', { ascending: false })
    .limit(5);

  if (error || !data?.length) return null;

  const terminal = new Set(['READY_FOR_REVIEW', 'FAILED', 'CANCELLED']);
  for (const row of data) {
    const run = row.run_json as PageConceptServerRun;
    if (terminal.has(run.status)) continue;
    if (run.generationStatus === 'GPT2_MOBILE_AWAITING_SELECTION') continue;
    logPageConceptGpt2MobileEvent('GPT2_MOBILE_RUN_RECOVERED', {
      runId: run.runId,
      message: 'active_run_for_page',
    });
    return run;
  }
  return null;
}
