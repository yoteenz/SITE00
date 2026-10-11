import type { DigitalFoundationQuote } from '../types.js';
import type { BlockerCategory, DigitalFoundationExecutionTask, ProjectForecast } from './types.js';

export function buildInitialForecast(quote: DigitalFoundationQuote, artifact_id: string): ProjectForecast {
  const now = new Date().toISOString();
  return {
    artifact_id,
    original_min_days: quote.projected_min_days,
    original_max_days: quote.projected_max_days,
    current_min_days: quote.projected_min_days,
    current_max_days: quote.projected_max_days,
    forecast_reason: null,
    updated_at: now,
  };
}

export function refineForecast(
  forecast: ProjectForecast,
  tasks: DigitalFoundationExecutionTask[],
  blocker: BlockerCategory | null,
): ProjectForecast {
  let addDays = 0;
  const reasons: string[] = [];
  if (blocker === 'CLIENT_AUTH_REQUIRED' || blocker === 'CLIENT_INFO_MISSING') {
    addDays += 2;
    reasons.push('Client delay');
  }
  if (blocker === 'PROVIDER_PENDING' || blocker === 'DNS_PROPAGATION') {
    addDays += 1;
    reasons.push('Provider / DNS propagation');
  }
  if (tasks.some((t) => t.task_type.includes('MIGRATION'))) {
    addDays += 2;
    reasons.push('Migration complexity');
  }
  if (tasks.some((t) => t.status === 'FAILED')) {
    addDays += 1;
    reasons.push('Verification failure recovery');
  }
  if (addDays === 0) return forecast;
  return {
    ...forecast,
    current_max_days: forecast.original_max_days + addDays,
    current_min_days: forecast.original_min_days,
    forecast_reason: reasons.join('; '),
    updated_at: new Date().toISOString(),
  };
}
