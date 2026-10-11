/**
 * C1.6 — Supabase-backed creative intelligence persistence.
 */

import { getSupabaseAdmin, hasSupabaseServiceRole } from '../../supabase.js';
import {
  boundedListMeta,
  fetchAllRowsInChunks,
  resolveBoundedListRange,
  SITE00_JUDGMENT_LIST_DEFAULT_LIMIT,
  SITE00_JUDGMENT_LIST_MAX_LIMIT,
  type BoundedListMeta,
} from '../../supabase/boundedListQuery.js';
import type { CreativeCorrectionRecord } from '../../../shared/site00-expression-engine/senior-creative-judgment/types.js';
import type { SeniorCreativeJudgmentOutput } from '../../../shared/site00-expression-engine/senior-creative-judgment/types.js';
import type { CreativeRuntimeMode } from './creativeReasoningProvider.js';

export async function creativeIntelligenceSchemaExists(): Promise<boolean> {
  if (!hasSupabaseServiceRole()) return false;
  try {
    const { error } = await getSupabaseAdmin()
      .from('site00_creative_corrections')
      .select('id')
      .limit(1);
    return !error;
  } catch {
    return false;
  }
}

export async function upsertCreativeCorrectionToSupabase(record: CreativeCorrectionRecord): Promise<void> {
  const key = record.correctionId;
  await getSupabaseAdmin()
    .from('site00_creative_corrections')
    .upsert(
      {
        correction_key: key,
        project_id: record.projectId,
        campaign_id: record.campaignId,
        content_unit_id: record.contentUnitId ?? null,
        feedback_type: record.feedbackType,
        surface_feedback: record.surfaceFeedback,
        underlying_issue: record.underlyingIssue,
        generalizable_principle: record.generalizablePrinciple,
        applicable_domains: record.applicableDomains,
        non_applicable_domains: record.nonApplicableDomains,
        overfit_risk: record.overfitRisk,
        confidence: record.confidence,
        active: record.active,
        record: record as unknown as Record<string, unknown>,
      },
      { onConflict: 'correction_key' },
    );
}

export async function upsertSeniorJudgmentToSupabase(args: {
  judgmentId: string;
  projectId: string;
  campaignId: string;
  contentUnitId: string;
  initialWinner: string;
  finalWinner: string;
  qualityTier: string;
  founderHandholdingRisk: string;
  runtimeMode: CreativeRuntimeMode;
  reasoningDepthLimited: boolean;
  record: SeniorCreativeJudgmentOutput;
}): Promise<void> {
  await getSupabaseAdmin()
    .from('site00_senior_creative_judgments')
    .upsert(
      {
        judgment_key: args.judgmentId,
        project_id: args.projectId,
        campaign_id: args.campaignId,
        content_unit_id: args.contentUnitId,
        initial_winner: args.initialWinner,
        final_winner: args.finalWinner,
        quality_tier: args.qualityTier,
        founder_handholding_risk: args.founderHandholdingRisk,
        runtime_mode: args.runtimeMode,
        reasoning_depth_limited: args.reasoningDepthLimited,
        record: args.record as unknown as Record<string, unknown>,
      },
      { onConflict: 'judgment_key' },
    );
}

const CORRECTION_LIST_COLUMNS =
  'correction_key, project_id, campaign_id, content_unit_id, surface_feedback, underlying_issue, generalizable_principle, applicable_domains, non_applicable_domains, overfit_risk, confidence, active, record';

export type ListCorrectionsOptions = {
  projectId?: string;
  page?: number;
  limit?: number;
  includeInactive?: boolean;
};

export async function listCorrectionsFromSupabasePage(
  options: ListCorrectionsOptions = {},
): Promise<{ items: CreativeCorrectionRecord[]; meta: BoundedListMeta }> {
  const { page, limit, from, to } = resolveBoundedListRange({
    page: options.page,
    limit: options.limit,
    defaultLimit: SITE00_JUDGMENT_LIST_DEFAULT_LIMIT,
    maxLimit: SITE00_JUDGMENT_LIST_MAX_LIMIT,
  });
  let query = getSupabaseAdmin()
    .from('site00_creative_corrections')
    .select(CORRECTION_LIST_COLUMNS)
    .order('created_at', { ascending: false })
    .range(from, to);
  if (!options.includeInactive) query = query.eq('active', true);
  if (options.projectId) query = query.eq('project_id', options.projectId);
  const { data, error } = await query;
  if (error) throw error;
  const items = (data ?? []).map((row) => mapCorrectionRow(row));
  return { items, meta: boundedListMeta(items.length, page, limit) };
}

export async function listCorrectionsFromSupabase(projectId?: string): Promise<CreativeCorrectionRecord[]> {
  const { rows } = await fetchAllRowsInChunks(async (from, to) => {
    let query = getSupabaseAdmin()
      .from('site00_creative_corrections')
      .select(CORRECTION_LIST_COLUMNS)
      .eq('active', true)
      .order('created_at', { ascending: false })
      .range(from, to);
    if (projectId) query = query.eq('project_id', projectId);
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map((row) => mapCorrectionRow(row as Record<string, unknown>));
  });
  return rows;
}

function mapCorrectionRow(row: Record<string, unknown>): CreativeCorrectionRecord {
  const record = (row.record as CreativeCorrectionRecord) ?? {};
  return {
    ...record,
    correctionId: String(row.correction_key),
    projectId: String(row.project_id),
    campaignId: String(row.campaign_id),
    contentUnitId: row.content_unit_id ? String(row.content_unit_id) : undefined,
    surfaceFeedback: String(row.surface_feedback),
    underlyingIssue: String(row.underlying_issue),
    generalizablePrinciple: String(row.generalizable_principle),
    applicableDomains: (row.applicable_domains as string[]) ?? [],
    nonApplicableDomains: (row.non_applicable_domains as string[]) ?? [],
    overfitRisk: row.overfit_risk as CreativeCorrectionRecord['overfitRisk'],
    confidence: Number(row.confidence),
    active: Boolean(row.active),
  };
}

const JUDGMENT_SUMMARY_COLUMNS =
  'judgment_key, project_id, campaign_id, content_unit_id, initial_winner, final_winner, quality_tier, founder_handholding_risk, runtime_mode, reasoning_depth_limited, created_at';

export type SeniorJudgmentSummary = {
  judgmentKey: string;
  projectId: string;
  campaignId: string;
  contentUnitId: string;
  initialWinner: string;
  finalWinner: string;
  qualityTier: string;
  founderHandholdingRisk: string;
  runtimeMode: string;
  reasoningDepthLimited: boolean;
  createdAt: string;
  record?: Record<string, unknown>;
};

export type ListJudgmentsOptions = {
  campaignId?: string;
  projectId?: string;
  page?: number;
  limit?: number;
  includeRecord?: boolean;
};

export async function listJudgmentsFromSupabasePage(
  options: ListJudgmentsOptions = {},
): Promise<{ items: SeniorJudgmentSummary[]; meta: BoundedListMeta }> {
  const { page, limit, from, to } = resolveBoundedListRange({
    page: options.page,
    limit: options.limit,
    defaultLimit: SITE00_JUDGMENT_LIST_DEFAULT_LIMIT,
    maxLimit: SITE00_JUDGMENT_LIST_MAX_LIMIT,
  });
  const columns = options.includeRecord ? `${JUDGMENT_SUMMARY_COLUMNS}, record` : JUDGMENT_SUMMARY_COLUMNS;
  let query = getSupabaseAdmin()
    .from('site00_senior_creative_judgments')
    .select(columns)
    .order('created_at', { ascending: false })
    .range(from, to);
  if (options.campaignId) query = query.eq('campaign_id', options.campaignId);
  if (options.projectId) query = query.eq('project_id', options.projectId);
  const { data, error } = await query;
  if (error) throw error;
  const items = (data ?? []).map((row) => mapJudgmentSummaryRow(row as Record<string, unknown>));
  return { items, meta: boundedListMeta(items.length, page, limit) };
}

function mapJudgmentSummaryRow(row: Record<string, unknown>): SeniorJudgmentSummary {
  return {
    judgmentKey: String(row.judgment_key),
    projectId: String(row.project_id),
    campaignId: String(row.campaign_id),
    contentUnitId: String(row.content_unit_id),
    initialWinner: String(row.initial_winner),
    finalWinner: String(row.final_winner),
    qualityTier: String(row.quality_tier),
    founderHandholdingRisk: String(row.founder_handholding_risk),
    runtimeMode: String(row.runtime_mode),
    reasoningDepthLimited: Boolean(row.reasoning_depth_limited),
    createdAt: String(row.created_at),
    record: row.record ? (row.record as Record<string, unknown>) : undefined,
  };
}

/** Loads judgments in bounded chunks; JSON `record` included when `includeRecord` is true (default). */
export async function listJudgmentsFromSupabase(
  campaignId?: string,
  options: Omit<ListJudgmentsOptions, 'campaignId'> = {},
): Promise<SeniorJudgmentSummary[]> {
  const includeRecord = options.includeRecord ?? true;
  const columns = includeRecord ? `${JUDGMENT_SUMMARY_COLUMNS}, record` : JUDGMENT_SUMMARY_COLUMNS;
  const { rows } = await fetchAllRowsInChunks(async (from, to) => {
    let query = getSupabaseAdmin()
      .from('site00_senior_creative_judgments')
      .select(columns)
      .order('created_at', { ascending: false })
      .range(from, to);
    if (campaignId) query = query.eq('campaign_id', campaignId);
    if (options.projectId) query = query.eq('project_id', options.projectId);
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map((row) => mapJudgmentSummaryRow(row as Record<string, unknown>));
  });
  return rows;
}
