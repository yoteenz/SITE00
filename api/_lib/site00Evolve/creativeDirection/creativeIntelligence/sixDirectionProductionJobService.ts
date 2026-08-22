/**
 * Background six-direction production jobs — Supabase-backed, non-blocking for mobile.
 */

import { randomUUID } from 'node:crypto';
import { getSupabaseAdmin } from '../../../supabase.js';
import { orgIdFromSlug } from '../../orgRegistry.js';
import { completeNdxbookV1Directions } from './directionCompletionService.js';
import { runSixDirectionProductionPipeline } from './sixDirectionProductionOrchestrator.js';
import { runMarkedUpCopyBoardPilotV4 } from './markedUpCopyBoardPilotV4.js';
import { runMarkedUpCopyBrandNativeVisualPilot } from './markedUpCopyBrandNativeVisualPilot.js';
import { resetCreativeDirectionMemory } from '../engagementService.js';

const TABLE = 'site00_creative_direction_production_jobs';

export type CreativeDirectionProductionJobType =
  | 'v1_completion'
  | 'six_direction_proofs'
  | 'full_pipeline'
  | 'marked_up_copy_board_v4'
  | 'marked_up_copy_brand_native_visual_pilot';

export type CreativeDirectionProductionJobStatus =
  | 'queued'
  | 'running'
  | 'completed'
  | 'failed';

export type CreativeDirectionProductionJobProgress = {
  current: number;
  total: number;
  label: string;
};

export type CreativeDirectionProductionJob = {
  id: string;
  organizationId: string;
  orgSlug: string;
  jobType: CreativeDirectionProductionJobType;
  status: CreativeDirectionProductionJobStatus;
  phase: string;
  progress: CreativeDirectionProductionJobProgress;
  options: Record<string, unknown>;
  result: Record<string, unknown> | null;
  errorMessage: string | null;
  requestedBy: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
};

type Row = {
  id: string;
  organization_id: string;
  org_slug: string;
  job_type: string;
  status: string;
  phase: string;
  progress: CreativeDirectionProductionJobProgress;
  options: Record<string, unknown>;
  result: Record<string, unknown> | null;
  error_message: string | null;
  requested_by: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
};

const runningJobIds = new Set<string>();

function mapRow(row: Row): CreativeDirectionProductionJob {
  return {
    id: row.id,
    organizationId: row.organization_id,
    orgSlug: row.org_slug,
    jobType: row.job_type as CreativeDirectionProductionJobType,
    status: row.status as CreativeDirectionProductionJobStatus,
    phase: row.phase,
    progress: row.progress ?? { current: 0, total: 1, label: 'Queued' },
    options: row.options ?? {},
    result: row.result,
    errorMessage: row.error_message,
    requestedBy: row.requested_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at,
  };
}

async function updateJob(
  jobId: string,
  patch: Partial<{
    status: CreativeDirectionProductionJobStatus;
    phase: string;
    progress: CreativeDirectionProductionJobProgress;
    result: Record<string, unknown> | null;
    errorMessage: string | null;
    completedAt: string | null;
  }>,
): Promise<void> {
  const now = new Date().toISOString();
  const { error } = await getSupabaseAdmin()
    .from(TABLE)
    .update({
      status: patch.status,
      phase: patch.phase,
      progress: patch.progress,
      result: patch.result,
      error_message: patch.errorMessage,
      completed_at: patch.completedAt,
      updated_at: now,
    })
    .eq('id', jobId);
  if (error) throw error;
}

export async function getLatestProductionJob(orgSlug: string): Promise<CreativeDirectionProductionJob | null> {
  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .select('*')
    .eq('org_slug', orgSlug)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? mapRow(data as Row) : null;
}

export async function getProductionJobById(jobId: string): Promise<CreativeDirectionProductionJob | null> {
  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .select('*')
    .eq('id', jobId)
    .maybeSingle();
  if (error) throw error;
  return data ? mapRow(data as Row) : null;
}

export async function startCreativeDirectionProductionJob(params: {
  orgSlug: string;
  jobType: CreativeDirectionProductionJobType;
  requestedBy: string;
  options?: {
    includeAllProofTypes?: boolean;
    completeV1InProofStep?: boolean;
    dryRun?: boolean;
  };
}): Promise<CreativeDirectionProductionJob> {
  if (params.orgSlug !== 'ndxbook') {
    throw new Error('NDXBOOK_ONLY');
  }

  const organizationId = orgIdFromSlug(params.orgSlug);
  if (!organizationId) throw new Error('ORG_NOT_FOUND');

  const active = await getLatestProductionJob(params.orgSlug);
  if (active && (active.status === 'queued' || active.status === 'running')) {
    return active;
  }

  const now = new Date().toISOString();
  const job: CreativeDirectionProductionJob = {
    id: randomUUID(),
    organizationId,
    orgSlug: params.orgSlug,
    jobType: params.jobType,
    status: 'queued',
    phase: 'queued',
    progress: { current: 0, total: params.jobType === 'full_pipeline' ? 2 : 1, label: 'Queued' },
    options: params.options ?? {},
    result: null,
    errorMessage: null,
    requestedBy: params.requestedBy,
    createdAt: now,
    updatedAt: now,
    completedAt: null,
  };

  const { error } = await getSupabaseAdmin().from(TABLE).insert({
    id: job.id,
    organization_id: job.organizationId,
    org_slug: job.orgSlug,
    job_type: job.jobType,
    status: job.status,
    phase: job.phase,
    progress: job.progress,
    options: job.options,
    requested_by: job.requestedBy,
    created_at: job.createdAt,
    updated_at: job.updatedAt,
  });
  if (error) throw error;

  queueMicrotask(() => {
    void executeProductionJob(job.id).catch((e) => {
      console.error('[cd-production-job] unhandled failure', job.id, e);
    });
  });

  return job;
}

async function executeProductionJob(jobId: string): Promise<void> {
  if (runningJobIds.has(jobId)) return;
  runningJobIds.add(jobId);

  const job = await getProductionJobById(jobId);
  if (!job || job.status === 'completed' || job.status === 'failed') {
    runningJobIds.delete(jobId);
    return;
  }

  await updateJob(jobId, {
    status: 'running',
    phase: 'starting',
    progress: { ...job.progress, label: 'Starting production job' },
  });

  try {
    const includeAllProofTypes = job.options.includeAllProofTypes !== false;
    const resultParts: Record<string, unknown> = {};

    if (job.jobType === 'v1_completion' || job.jobType === 'full_pipeline') {
      await updateJob(jobId, {
        status: 'running',
        phase: 'v1_completion',
        progress: {
          current: 0,
          total: job.jobType === 'full_pipeline' ? 2 : 1,
          label: 'Completing v1 directions 01–03 (Sonnet)',
        },
      });
      const v1 = await completeNdxbookV1Directions();
      resultParts.v1Completion = v1;
      resetCreativeDirectionMemory();
    }

    if (job.jobType === 'six_direction_proofs' || job.jobType === 'full_pipeline') {
      await updateJob(jobId, {
        status: 'running',
        phase: 'proof_production',
        progress: {
          current: job.jobType === 'full_pipeline' ? 1 : 0,
          total: job.jobType === 'full_pipeline' ? 2 : 1,
          label: 'Generating Stage A proofs (FAL — runs on server; safe to leave this page)',
        },
      });
      const production = await runSixDirectionProductionPipeline({
        completeV1:
          job.jobType === 'six_direction_proofs' && job.options.completeV1InProofStep === true,
        includeAllProofTypes,
      });
      resultParts.production = production;
      resetCreativeDirectionMemory();
    }

    if (job.jobType === 'marked_up_copy_board_v4') {
      await updateJob(jobId, {
        status: 'running',
        phase: 'marked_up_copy_board_v4',
        progress: {
          current: 0,
          total: 1,
          label: 'THE MARKED-UP COPY v4 — Expression System + Sonnet board production',
        },
      });
      const boardResult = await runMarkedUpCopyBoardPilotV4({
        orgSlug: job.orgSlug,
        dryRun: job.options.dryRun === true,
      });
      resultParts.markedUpCopyBoardV4 = { ...boardResult, credentialExposed: false };
      resetCreativeDirectionMemory();
    }

    if (job.jobType === 'marked_up_copy_brand_native_visual_pilot') {
      await updateJob(jobId, {
        status: 'running',
        phase: 'marked_up_copy_brand_native_visual_pilot',
        progress: {
          current: 0,
          total: 1,
          label: 'THE MARKED-UP COPY — Brand-native visual language pilot (ONE hero only)',
        },
      });
      const pilotResult = await runMarkedUpCopyBrandNativeVisualPilot({
        orgSlug: job.orgSlug,
        dryRun: job.options.dryRun === true,
      });
      resultParts.markedUpCopyBrandNativeVisualPilot = { ...pilotResult, credentialExposed: false };
      resetCreativeDirectionMemory();
    }

    const completedTotal =
      job.jobType === 'full_pipeline' ? 2 : 1;
    const completedCurrent =
      job.jobType === 'full_pipeline' ? 2 : 1;

    await updateJob(jobId, {
      status: 'completed',
      phase: 'completed',
      progress: {
        current: completedCurrent,
        total: completedTotal,
        label: 'Completed',
      },
      result: resultParts,
      errorMessage: null,
      completedAt: new Date().toISOString(),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Production job failed';
    await updateJob(jobId, {
      status: 'failed',
      phase: 'failed',
      progress: { current: 0, total: 1, label: 'Failed' },
      result: null,
      errorMessage: message,
      completedAt: new Date().toISOString(),
    });
  } finally {
    runningJobIds.delete(jobId);
  }
}
