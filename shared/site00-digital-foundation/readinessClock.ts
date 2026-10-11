import type { DigitalFoundationArtifact, DigitalFoundationQuote, ProjectStageRecord } from './types.js';

export type ReadinessRequirement =
  | 'INTAKE_COMPLETE'
  | 'QUOTE_ACCEPTED'
  | 'PAYMENT_CONFIRMED'
  | 'DOMAIN_APPROVED'
  | 'ACCESS_RECEIVED';

export type ProjectReadinessState = {
  readiness_satisfied: boolean;
  missing_requirements: ReadinessRequirement[];
  readiness_satisfied_at: string | null;
  production_started_at: string | null;
  service_window_label: string;
  forecast_min_days: number | null;
  forecast_max_days: number | null;
};

function missingForArtifact(
  artifact: DigitalFoundationArtifact,
  quote: DigitalFoundationQuote | null,
  stages: ProjectStageRecord[],
): ReadinessRequirement[] {
  const missing: ReadinessRequirement[] = [];
  if (artifact.intake_state !== 'COMPLETE') missing.push('INTAKE_COMPLETE');
  if (!quote || quote.status !== 'ACCEPTED' && quote.status !== 'PAID') missing.push('QUOTE_ACCEPTED');
  if (artifact.payment_state !== 'PAID') missing.push('PAYMENT_CONFIRMED');

  const domainStage = stages.find((s) => s.stage_code === '02_DOMAIN');
  if (domainStage && domainStage.status === 'NEEDS_CLIENT') {
    missing.push('DOMAIN_APPROVED');
  }
  const details = stages.find((s) => s.stage_code === '01_DETAILS_RECEIVED');
  if (details && details.status === 'NEEDS_CLIENT') {
    missing.push('ACCESS_RECEIVED');
  }
  return missing;
}

export function computeReadinessState(input: {
  artifact: DigitalFoundationArtifact;
  quote: DigitalFoundationQuote | null;
  stages: ProjectStageRecord[];
  production_started_at?: string | null;
  readiness_satisfied_at?: string | null;
  projected_min_days?: number | null;
  projected_max_days?: number | null;
}): ProjectReadinessState {
  const missing = missingForArtifact(input.artifact, input.quote, input.stages);
  const paid = input.artifact.payment_state === 'PAID';
  const intakeDone = input.artifact.intake_state === 'COMPLETE';
  const quoteOk = Boolean(input.quote && (input.quote.status === 'ACCEPTED' || input.quote.status === 'PAID'));

  let readiness_satisfied_at = input.readiness_satisfied_at ?? null;
  if (!readiness_satisfied_at && paid && intakeDone && quoteOk && missing.length === 0) {
    readiness_satisfied_at = new Date().toISOString();
  }

  let production_started_at = input.production_started_at ?? null;
  if (!production_started_at && readiness_satisfied_at) {
    production_started_at = readiness_satisfied_at;
  }

  const forecast_min_days =
    production_started_at && input.projected_min_days != null ? input.projected_min_days : null;
  const forecast_max_days =
    production_started_at && input.projected_max_days != null ? input.projected_max_days : null;

  const service_window_label =
    'Estimated 2–3 business days after required information, access, approvals, and payment are received.';

  return {
    readiness_satisfied: Boolean(readiness_satisfied_at),
    missing_requirements: missing,
    readiness_satisfied_at,
    production_started_at,
    service_window_label,
    forecast_min_days,
    forecast_max_days,
  };
}
