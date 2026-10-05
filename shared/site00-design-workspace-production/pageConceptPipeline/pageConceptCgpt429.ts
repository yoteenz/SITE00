/**
 * P0.VR.PAGE-CONCEPT-CGPT-429-RESILIENCE1 — Anthropic 429 classification + backoff.
 */

export const PAGE_CONCEPT_CGPT_MAX_429_ATTEMPTS = 4;

export type PageConceptCgptRateLimitClass =
  | 'RATE_LIMIT_REQUESTS'
  | 'RATE_LIMIT_INPUT_TOKENS'
  | 'RATE_LIMIT_OUTPUT_TOKENS'
  | 'ACCELERATION_LIMIT'
  | 'CONCURRENT_REQUEST_LIMIT'
  | 'USAGE_CREDIT_LIMIT'
  | 'ORGANIZATION_LIMIT'
  | 'TEMPORARY_THROTTLE'
  | 'UNKNOWN_429';

export type PageConceptCgptRateLimitHeaders = {
  retryAfterSec: number | null;
  requestLimit: string | null;
  requestRemaining: string | null;
  requestReset: string | null;
  tokenLimit: string | null;
  tokenRemaining: string | null;
  tokenReset: string | null;
};

export type PageConceptCgptProviderTelemetry = {
  provider: 'anthropic';
  model: string;
  httpStatus: number;
  errorType: string | null;
  errorCode: string | null;
  providerMessage: string | null;
  requestId: string | null;
  rateLimitClass: PageConceptCgptRateLimitClass | null;
  rateLimitHeaders: PageConceptCgptRateLimitHeaders;
  inputTokensEstimate: number | null;
  maxOutputTokens: number;
  attempt: number;
  retryable: boolean;
  hardQuota: boolean;
};

export function estimateJsonTokenCount(payload: unknown): number {
  try {
    const text = JSON.stringify(payload);
    return Math.ceil(text.length / 4);
  } catch {
    return 0;
  }
}

export function parseAnthropicRateLimitHeaders(headers: Headers): PageConceptCgptRateLimitHeaders {
  const get = (name: string) => headers.get(name) ?? headers.get(name.toLowerCase());
  const retryAfterRaw = get('retry-after');
  let retryAfterSec: number | null = null;
  if (retryAfterRaw) {
    const n = Number(retryAfterRaw);
    if (Number.isFinite(n)) retryAfterSec = n;
  }
  return {
    retryAfterSec,
    requestLimit: get('anthropic-ratelimit-requests-limit'),
    requestRemaining: get('anthropic-ratelimit-requests-remaining'),
    requestReset: get('anthropic-ratelimit-requests-reset'),
    tokenLimit: get('anthropic-ratelimit-tokens-limit'),
    tokenRemaining: get('anthropic-ratelimit-tokens-remaining'),
    tokenReset: get('anthropic-ratelimit-tokens-reset'),
  };
}

export function classifyAnthropic429(input: {
  errorType: string | null;
  errorMessage: string | null;
  rateLimitHeaders: PageConceptCgptRateLimitHeaders;
}): PageConceptCgptRateLimitClass {
  const type = (input.errorType ?? '').toLowerCase();
  const msg = (input.errorMessage ?? '').toLowerCase();
  if (msg.includes('credit') || msg.includes('billing') || msg.includes('purchase')) {
    return 'USAGE_CREDIT_LIMIT';
  }
  if (type.includes('rate_limit') && msg.includes('token')) {
    if (msg.includes('output')) return 'RATE_LIMIT_OUTPUT_TOKENS';
    return 'RATE_LIMIT_INPUT_TOKENS';
  }
  if (type.includes('rate_limit')) return 'RATE_LIMIT_REQUESTS';
  if (msg.includes('organization') || msg.includes('org')) return 'ORGANIZATION_LIMIT';
  if (msg.includes('concurrent')) return 'CONCURRENT_REQUEST_LIMIT';
  if (msg.includes('accelerat')) return 'ACCELERATION_LIMIT';
  if (input.rateLimitHeaders.tokenRemaining === '0') return 'RATE_LIMIT_INPUT_TOKENS';
  if (input.rateLimitHeaders.requestRemaining === '0') return 'RATE_LIMIT_REQUESTS';
  return 'TEMPORARY_THROTTLE';
}

export function isHardQuota429(rateLimitClass: PageConceptCgptRateLimitClass): boolean {
  return (
    rateLimitClass === 'USAGE_CREDIT_LIMIT' ||
    rateLimitClass === 'ORGANIZATION_LIMIT'
  );
}

export function computeCgpt429BackoffMs(input: {
  attempt: number;
  retryAfterSec: number | null;
  random?: () => number;
}): number {
  if (input.retryAfterSec != null && input.retryAfterSec > 0) {
    return input.retryAfterSec * 1000;
  }
  const rand = input.random ?? Math.random;
  const bases = [7_500, 22_500, 67_500, 120_000];
  const base = bases[Math.min(input.attempt - 1, bases.length - 1)] ?? 120_000;
  const jitter = 0.85 + rand() * 0.3;
  return Math.round(base * jitter);
}

export function formatCgptRetryWaitStage(attempt: number, maxAttempts: number, waitMs: number): string {
  const sec = Math.max(1, Math.ceil(waitMs / 1000));
  return `CGPT_RETRY_WAIT · ${attempt}/${maxAttempts} · RETRYING IN ${sec}S`;
}

export function founderMessageForCgptFailure(code: string): string {
  if (code === 'CGPT_FAILED_RATE_LIMIT') {
    return 'CGPT TEMPORARILY UNAVAILABLE — PROVIDER RATE LIMIT PERSISTED AFTER 4 ATTEMPTS. RETRY CGPT';
  }
  if (code === 'CGPT_ACCOUNT_LIMIT_REACHED' || code === 'CGPT_BILLING_USAGE_LIMIT') {
    return 'CGPT ACCOUNT LIMIT REACHED — CHECK ANTHROPIC BILLING / USAGE';
  }
  return code;
}

export function pageConceptCgptIdempotencyKeyForRun(runId: string): string {
  return `${runId}:CGPT`;
}

export function founderCodeForHardQuota429(rateLimitClass: PageConceptCgptRateLimitClass): string {
  if (rateLimitClass === 'USAGE_CREDIT_LIMIT') return 'CGPT_BILLING_USAGE_LIMIT';
  if (rateLimitClass === 'ORGANIZATION_LIMIT') return 'CGPT_ACCOUNT_LIMIT_REACHED';
  return 'CGPT_ACCOUNT_LIMIT_REACHED';
}

export function formatCgptProviderReceipt(telemetry: PageConceptCgptProviderTelemetry): string {
  const h = telemetry.rateLimitHeaders;
  return [
    `PROVIDER=${telemetry.provider}`,
    `MODEL=${telemetry.model}`,
    `HTTP=${telemetry.httpStatus}`,
    `ERROR_TYPE=${telemetry.errorType ?? '—'}`,
    `ERROR_CODE=${telemetry.errorCode ?? '—'}`,
    `REQUEST_ID=${telemetry.requestId ?? '—'}`,
    `RATE_LIMIT_CLASS=${telemetry.rateLimitClass ?? '—'}`,
    `RETRY_AFTER=${h.retryAfterSec ?? '—'}`,
    `REQ_LIMIT=${h.requestLimit ?? '—'}`,
    `REQ_REMAINING=${h.requestRemaining ?? '—'}`,
    `TOKEN_LIMIT=${h.tokenLimit ?? '—'}`,
    `TOKEN_REMAINING=${h.tokenRemaining ?? '—'}`,
    `INPUT_TOKENS_EST=${telemetry.inputTokensEstimate ?? '—'}`,
    `MAX_OUTPUT=${telemetry.maxOutputTokens}`,
    `ATTEMPT=${telemetry.attempt}`,
  ].join(' · ');
}

export function logPageConceptCgptProviderTelemetry(input: {
  generationRunId: string;
  stage: string;
  telemetry: PageConceptCgptProviderTelemetry;
  durationMs: number;
  nextRetryAt: string | null;
}): void {
  if (process.env.VITEST === 'true') return;
  const safe = {
    generationRunId: input.generationRunId,
    stage: input.stage,
    provider: input.telemetry.provider,
    model: input.telemetry.model,
    status: input.telemetry.httpStatus,
    errorType: input.telemetry.errorType,
    requestId: input.telemetry.requestId,
    attempt: input.telemetry.attempt,
    nextRetryAt: input.nextRetryAt,
    durationMs: input.durationMs,
    rateLimitClass: input.telemetry.rateLimitClass,
  };
  console.info('[page-concept-cgpt]', JSON.stringify(safe));
}
