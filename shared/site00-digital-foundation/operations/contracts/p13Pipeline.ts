import type { DigitalFoundationArtifact, DigitalFoundationLead, DigitalFoundationQuote, FoundationBuildCredit, ReferralSource } from '../../types.js';
import type { BlockerCategory, DigitalFoundationExecutionTask, ProjectForecast } from '../types.js';
import { extractBlockers } from '../blockers.js';

export type PipelineRow = {
  artifact_id: string;
  business_name: string | null;
  referral_label: string | null;
  artifact_state: DigitalFoundationArtifact['state'];
  quote_amount_minor: number | null;
  payment_state: DigitalFoundationArtifact['payment_state'];
  current_stage: string | null;
  next_action: string | null;
  projected_completion: string | null;
  blocker: BlockerCategory | null;
  build_interest: DigitalFoundationArtifact['build_interest'];
  credit_status: FoundationBuildCredit['status'] | null;
};

export function buildPipelineRows(input: {
  artifacts: DigitalFoundationArtifact[];
  leads: Map<string, DigitalFoundationLead>;
  quotes: Map<string, DigitalFoundationQuote>;
  referrals: ReferralSource[];
  tasksByArtifact: Map<string, DigitalFoundationExecutionTask[]>;
  forecasts: Map<string, ProjectForecast>;
  credits: Map<string, FoundationBuildCredit>;
}): PipelineRow[] {
  return input.artifacts.map((a) => {
    const lead = input.leads.get(a.lead_id);
    const quote = a.quote_id ? input.quotes.get(a.quote_id) : undefined;
    const referral = input.referrals.find((r) => r.referral_source_id === a.referral_source_id);
    const tasks = input.tasksByArtifact.get(a.artifact_id) ?? [];
    const blockers = extractBlockers(tasks);
    const ready = tasks.find((t) => t.status === 'READY');
    const waitingClient = tasks.find((t) => t.status === 'WAITING_CLIENT');
    const forecast = input.forecasts.get(a.artifact_id);
    const credit = a.foundation_credit_id ? input.credits.get(a.foundation_credit_id) : null;
    const activeStage = tasks.find((t) => t.status === 'IN_PROGRESS')?.project_stage ?? null;

    return {
      artifact_id: a.artifact_id,
      business_name: lead?.business_name ?? null,
      referral_label: referral?.label ?? null,
      artifact_state: a.state,
      quote_amount_minor: quote?.subtotal_minor ?? null,
      payment_state: a.payment_state,
      current_stage: activeStage,
      next_action: waitingClient?.title ?? ready?.title ?? null,
      projected_completion: forecast
        ? `${forecast.current_min_days}–${forecast.current_max_days} business days`
        : null,
      blocker: blockers[0]?.category ?? null,
      build_interest: a.build_interest,
      credit_status: credit?.status ?? null,
    };
  });
}

export function pipelineAttentionQueries(rows: PipelineRow[]) {
  return {
    needs_founder: rows.filter((r) => r.blocker || r.artifact_state === 'IN_PROGRESS'),
    waiting_clients: rows.filter((r) => r.next_action && r.payment_state === 'PAID'),
    waiting_providers: rows.filter((r) => r.blocker === 'PROVIDER_PENDING'),
    blocked: rows.filter((r) => r.blocker),
    ready_to_execute: rows.filter((r) => r.next_action && !r.blocker),
    ready_to_verify: rows.filter((r) => r.current_stage === '06_FINAL_VERIFICATION'),
    about_to_complete: rows.filter((r) => r.artifact_state === 'FINAL_VERIFICATION'),
  };
}
