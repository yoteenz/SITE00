/** P0.VR.DESIGNBENCH.GROK1F5 — xAI HTTP classification + transient retry policy. */

import {
  GROK_DESIGN_BENCH_EXECUTION_TIMEOUT_MS,
  GROK_DESIGN_BENCH_INFERENCE_PATH,
  GROK_PROVIDER_MAX_ATTEMPTS,
  GROK_PROVIDER_RETRY_BACKOFF_MS,
  GROK_PROVIDER_SERVICE_UNAVAILABLE,
  GROK_TWIN_TEST_A_PROVIDER_MODEL,
  GROK_XAI_API_BASE,
} from './constants.js';

export type GrokProviderHttpClassification =
  | 'AUTHENTICATION_OR_ACCESS_FAILURE'
  | 'MODEL_NOT_FOUND'
  | 'MODEL_OR_ENDPOINT_REJECTED'
  | 'RATE_LIMITED'
  | 'PROVIDER_INTERNAL_ERROR'
  | 'PROVIDER_BAD_GATEWAY'
  | 'PROVIDER_SERVICE_UNAVAILABLE'
  | 'PROVIDER_GATEWAY_TIMEOUT'
  | 'PROVIDER_NETWORK_FAILURE'
  | 'INVALID_REQUEST'
  | 'UNKNOWN_PROVIDER_FAILURE';

export type GrokBenchmarkFailureClass =
  | 'MODEL_ACCESS_FAILURE'
  | 'INVALID_REQUEST'
  | 'RATE_LIMITED'
  | 'PROVIDER_TRANSIENT_FAILURE'
  | 'PROVIDER_TIMEOUT'
  | 'RUN_STALLED'
  | 'OUTPUT_TRUNCATED'
  | 'OUTPUT_VALIDATION_FAILED'
  | 'USER_CANCELLED'
  | 'UNKNOWN_PROVIDER_FAILURE';

export const GROK_PROVIDER_TRANSIENT_STATUSES = [429, 500, 502, 503, 504] as const;
export const GROK_PROVIDER_NO_RETRY_STATUSES = [400, 401, 403, 404, 410] as const;

export interface GrokProviderCallEvidence {
  runId: string;
  httpStatus: number | null;
  providerRequestId: string | null;
  providerErrorCode: string | null;
  providerErrorType: string | null;
  providerMessage: string | null;
  model: typeof GROK_TWIN_TEST_A_PROVIDER_MODEL;
  endpoint: string;
  attempt: number;
  startedAt: string;
  failedAt: string;
  duration: number;
}

export interface GrokProviderRetryTiming {
  attempt1Duration: number | null;
  retryWaitDuration: number | null;
  attempt2Duration: number | null;
  attempt3Duration: number | null;
  totalProviderWallTime: number | null;
  successfulAttempt: number | null;
}

export type GrokProviderRetryStatus = 'IDLE' | 'IN_FLIGHT' | 'WAITING_RETRY' | 'RETRYING' | 'SUCCEEDED' | 'EXHAUSTED';

export interface GrokProviderRetryState {
  status: GrokProviderRetryStatus;
  attempt: number;
  maxAttempts: typeof GROK_PROVIDER_MAX_ATTEMPTS;
  retries: number;
  lastHttpStatus: number | null;
  lastClassification: GrokProviderHttpClassification | null;
  lastBenchmarkFailureClass: GrokBenchmarkFailureClass | null;
  incidentClass: string | null;
  evidence: GrokProviderCallEvidence[];
  timing: GrokProviderRetryTiming;
  uiHeadline: string | null;
  uiDetail: string | null;
}

export function emptyGrokProviderRetryTiming(): GrokProviderRetryTiming {
  return {
    attempt1Duration: null,
    retryWaitDuration: null,
    attempt2Duration: null,
    attempt3Duration: null,
    totalProviderWallTime: null,
    successfulAttempt: null,
  };
}

export function emptyGrokProviderRetryState(): GrokProviderRetryState {
  return {
    status: 'IDLE',
    attempt: 0,
    maxAttempts: GROK_PROVIDER_MAX_ATTEMPTS,
    retries: 0,
    lastHttpStatus: null,
    lastClassification: null,
    lastBenchmarkFailureClass: null,
    incidentClass: null,
    evidence: [],
    timing: emptyGrokProviderRetryTiming(),
    uiHeadline: null,
    uiDetail: null,
  };
}

export function classifyGrokProviderHttpStatus(
  status: number | null,
  body = '',
): GrokProviderHttpClassification {
  if (status === 401 || status === 403) return 'AUTHENTICATION_OR_ACCESS_FAILURE';
  if (status === 429) return 'RATE_LIMITED';
  if (status === 500) return 'PROVIDER_INTERNAL_ERROR';
  if (status === 502) return 'PROVIDER_BAD_GATEWAY';
  if (status === 503) return 'PROVIDER_SERVICE_UNAVAILABLE';
  if (status === 504) return 'PROVIDER_GATEWAY_TIMEOUT';
  if (status === 410) return 'MODEL_OR_ENDPOINT_REJECTED';
  if (status === 404) return 'MODEL_NOT_FOUND';
  if (status === 400) return 'INVALID_REQUEST';
  if (status == null) return 'PROVIDER_NETWORK_FAILURE';

  const text = body.toLowerCase();
  if (status >= 400 && status < 500) {
    if (/\bmodel\b/.test(text) && /(not found|unknown|does not exist|unsupported)/.test(text)) {
      return 'MODEL_NOT_FOUND';
    }
    return 'INVALID_REQUEST';
  }
  if (status >= 500) return 'PROVIDER_INTERNAL_ERROR';
  return 'UNKNOWN_PROVIDER_FAILURE';
}

export function grokIncidentClassForHttp(status: number | null, body = ''): string {
  const classification = classifyGrokProviderHttpStatus(status, body);
  if (status === 503 || classification === 'PROVIDER_SERVICE_UNAVAILABLE') {
    return GROK_PROVIDER_SERVICE_UNAVAILABLE;
  }
  return classification;
}

export function mapProviderClassificationToBenchmarkFailure(
  classification: GrokProviderHttpClassification,
): GrokBenchmarkFailureClass {
  switch (classification) {
    case 'AUTHENTICATION_OR_ACCESS_FAILURE':
    case 'MODEL_NOT_FOUND':
    case 'MODEL_OR_ENDPOINT_REJECTED':
      return 'MODEL_ACCESS_FAILURE';
    case 'INVALID_REQUEST':
      return 'INVALID_REQUEST';
    case 'RATE_LIMITED':
      return 'RATE_LIMITED';
    case 'PROVIDER_INTERNAL_ERROR':
    case 'PROVIDER_BAD_GATEWAY':
    case 'PROVIDER_SERVICE_UNAVAILABLE':
    case 'PROVIDER_GATEWAY_TIMEOUT':
    case 'PROVIDER_NETWORK_FAILURE':
      return 'PROVIDER_TRANSIENT_FAILURE';
    default:
      return 'UNKNOWN_PROVIDER_FAILURE';
  }
}

export function isTransientGrokProviderStatus(status: number | null): boolean {
  return status != null && (GROK_PROVIDER_TRANSIENT_STATUSES as readonly number[]).includes(status);
}

export function isNonRetryableGrokProviderStatus(status: number | null): boolean {
  return status != null && (GROK_PROVIDER_NO_RETRY_STATUSES as readonly number[]).includes(status);
}

export function isGrokModelRejectionClassification(classification: GrokProviderHttpClassification): boolean {
  return classification === 'MODEL_NOT_FOUND' || classification === 'MODEL_OR_ENDPOINT_REJECTED';
}

export function sanitizeProviderMessage(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const cleaned = raw
    .replace(/bearer\s+[a-z0-9._\-+=/]+/gi, 'Bearer [REDACTED]')
    .replace(/authorization:\s*[^\s,;]+/gi, 'Authorization: [REDACTED]')
    .replace(/xai-[a-z0-9]+/gi, '[REDACTED]')
    .replace(/sk-[a-z0-9]+/gi, '[REDACTED]')
    .replace(/api[_-]?key["']?\s*[:=]\s*["']?[^"'\s]+/gi, 'api_key=[REDACTED]');
  return cleaned.slice(0, 400);
}

export function extractSafeProviderError(body: string, headers?: Headers | Record<string, string> | null): {
  providerRequestId: string | null;
  providerErrorCode: string | null;
  providerErrorType: string | null;
  providerMessage: string | null;
} {
  const headerGet = (name: string): string | null => {
    if (!headers) return null;
    if (typeof (headers as Headers).get === 'function') {
      return (headers as Headers).get(name);
    }
    const rec = headers as Record<string, string>;
    const hit = Object.entries(rec).find(([key]) => key.toLowerCase() === name.toLowerCase());
    return hit?.[1] ?? null;
  };
  const providerRequestId =
    headerGet('x-request-id') ||
    headerGet('x-xai-request-id') ||
    headerGet('request-id') ||
    null;
  let providerErrorCode: string | null = null;
  let providerErrorType: string | null = null;
  let providerMessage: string | null = sanitizeProviderMessage(body);
  try {
    const parsed = JSON.parse(body) as {
      code?: unknown;
      type?: unknown;
      error?: unknown;
      message?: unknown;
    };
    if (typeof parsed.code === 'string') providerErrorCode = parsed.code;
    if (typeof parsed.type === 'string') providerErrorType = parsed.type;
    if (typeof parsed.message === 'string') providerMessage = sanitizeProviderMessage(parsed.message);
    if (parsed.error && typeof parsed.error === 'object') {
      const err = parsed.error as { code?: unknown; type?: unknown; message?: unknown };
      if (typeof err.code === 'string') providerErrorCode = err.code;
      if (typeof err.type === 'string') providerErrorType = err.type;
      if (typeof err.message === 'string') providerMessage = sanitizeProviderMessage(err.message);
    } else if (typeof parsed.error === 'string') {
      providerMessage = sanitizeProviderMessage(parsed.error);
    }
  } catch {
    /* keep raw sanitized body */
  }
  return {
    providerRequestId,
    providerErrorCode,
    providerErrorType,
    providerMessage,
  };
}

export function parseRetryAfterMs(header: string | null | undefined, nowMs = Date.now()): number | null {
  if (!header) return null;
  const trimmed = header.trim();
  if (!trimmed) return null;
  if (/^\d+(\.\d+)?$/.test(trimmed)) {
    return Math.max(0, Math.round(Number(trimmed) * 1000));
  }
  const when = Date.parse(trimmed);
  if (!Number.isFinite(when)) return null;
  return Math.max(0, when - nowMs);
}

export function computeGrokProviderRetryWaitMs(args: {
  nextAttempt: number;
  retryAfterHeader?: string | null;
  remainingBudgetMs: number;
  nowMs?: number;
}): { waitMs: number; canRetry: boolean; honoredRetryAfter: boolean } {
  const defaultWait =
    args.nextAttempt === 2
      ? GROK_PROVIDER_RETRY_BACKOFF_MS[1]
      : args.nextAttempt === 3
        ? GROK_PROVIDER_RETRY_BACKOFF_MS[2]
        : GROK_PROVIDER_RETRY_BACKOFF_MS[1];
  const retryAfter = parseRetryAfterMs(args.retryAfterHeader, args.nowMs);
  const honoredRetryAfter = retryAfter != null;
  const waitMs = honoredRetryAfter ? retryAfter : defaultWait;
  const minRequestBudgetMs = 250;
  const canRetry = waitMs + minRequestBudgetMs <= args.remainingBudgetMs && args.remainingBudgetMs > 0;
  return { waitMs, canRetry, honoredRetryAfter };
}

export function remainingGrokExecutionBudgetMs(args: {
  startedAtMs: number;
  nowMs?: number;
  timeoutMs?: number;
}): number {
  const nowMs = args.nowMs ?? Date.now();
  const timeoutMs = args.timeoutMs ?? GROK_DESIGN_BENCH_EXECUTION_TIMEOUT_MS;
  return Math.max(0, timeoutMs - (nowMs - args.startedAtMs));
}

export function recordAttemptDuration(timing: GrokProviderRetryTiming, attempt: number, duration: number): void {
  if (attempt === 1) timing.attempt1Duration = duration;
  else if (attempt === 2) timing.attempt2Duration = duration;
  else if (attempt === 3) timing.attempt3Duration = duration;
}

export function grokProviderRetryUiCopy(args: {
  attempt: number;
  maxAttempts?: number;
  httpStatus?: number | null;
  exhausted?: boolean;
}): { headline: string; detail: string } {
  const maxAttempts = args.maxAttempts ?? GROK_PROVIDER_MAX_ATTEMPTS;
  const headline = 'GROK PROVIDER TEMPORARILY UNAVAILABLE';
  if (args.exhausted) {
    return {
      headline,
      detail: [
        `Provider returned: ${args.httpStatus ?? 'unknown'}`,
        `Attempts: ${args.attempt}`,
        'This benchmark run did not reach successful model inference.',
      ].join('\n'),
    };
  }
  return {
    headline,
    detail: `RETRYING…\nATTEMPT ${args.attempt} OF ${maxAttempts}`,
  };
}

export function defaultGrokResponsesEndpoint(): string {
  return `${GROK_XAI_API_BASE}${GROK_DESIGN_BENCH_INFERENCE_PATH}`;
}
