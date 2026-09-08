/**
 * C1.6 — Supabase-backed creative intelligence persistence.
 */

import { getSupabaseAdmin, hasSupabaseServiceRole } from '../../supabase.js';
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

export async function listCorrectionsFromSupabase(projectId?: string): Promise<CreativeCorrectionRecord[]> {
  let query = getSupabaseAdmin().from('site00_creative_corrections').select('*').eq('active', true);
  if (projectId) query = query.eq('project_id', projectId);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map((row) => {
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
  });
}

export async function listJudgmentsFromSupabase(campaignId?: string) {
  let query = getSupabaseAdmin().from('site00_senior_creative_judgments').select('*');
  if (campaignId) query = query.eq('campaign_id', campaignId);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}
