import {
  GROK_DESIGN_BENCH_EXECUTION_TIMEOUT_MS,
  GROK_DESIGN_BENCH_INFERENCE_METHOD,
  GROK_PROVIDER_MAX_ATTEMPTS,
  GROK_PROVIDER_MAX_RETRIES,
  GROK_PROVIDER_TIMEOUT,
  GROK_TWIN_TEST_A_PROVIDER_MODEL,
} from '../../../shared/site00-design-bench/grokTwinTestA/constants.js';
import { GROK_4_6_PROVIDER_BINDING_FAILED, type GrokDesignBenchProviderFailure } from '../../../shared/site00-design-bench/grokTwinTestA/modelContract.js';
import {
  classifyGrokProviderHttpStatus,
  computeGrokProviderRetryWaitMs,
  emptyGrokProviderRetryState,
  extractSafeProviderError,
  grokIncidentClassForHttp,
  grokProviderRetryUiCopy,
  isNonRetryableGrokProviderStatus,
  isTransientGrokProviderStatus,
  mapProviderClassificationToBenchmarkFailure,
  recordAttemptDuration,
  sanitizeProviderMessage,
  type GrokBenchmarkFailureClass,
  type GrokProviderCallEvidence,
  type GrokProviderHttpClassification,
  type GrokProviderRetryState,
} from '../../../shared/site00-design-bench/grokTwinTestA/providerErrors.js';

export { GROK_PROVIDER_MAX_ATTEMPTS, GROK_PROVIDER_MAX_RETRIES };

export class GrokProviderError extends Error {
  readonly httpStatus: number | null;
  readonly classification: GrokProviderHttpClassification;
  readonly benchmarkFailureClass: GrokBenchmarkFailureClass;
  readonly incidentClass: string;
  readonly attempts: number;
  readonly evidence: GrokProviderCallEvidence[];
  readonly retryState: GrokProviderRetryState;
  readonly providerFailure: GrokDesignBenchProviderFailure;

  constructor(args: {
    message: string;
    httpStatus: number | null;
    classification: GrokProviderHttpClassification;
    benchmarkFailureClass: GrokBenchmarkFailureClass;
    incidentClass: string;
    attempts: number;
    evidence: GrokProviderCallEvidence[];
    retryState: GrokProviderRetryState;
    providerFailure: GrokDesignBenchProviderFailure;
  }) {
    super(args.message);
    this.name = 'GrokProviderError';
    this.httpStatus = args.httpStatus;
    this.classification = args.classification;
    this.benchmarkFailureClass = args.benchmarkFailureClass;
    this.incidentClass = args.incidentClass;
    this.attempts = args.attempts;
    this.evidence = args.evidence;
    this.retryState = args.retryState;
    this.providerFailure = args.providerFailure;
  }
}

export interface GrokProviderRetryEvent {
  retryState: GrokProviderRetryState;
}

export interface FetchGrokResponsesWithRetryInput {
  runId: string;
  endpoint: string;
  apiKey: string;
  body: string;
  signal?: AbortSignal;
  deadlineMs?: number;
  fetchImpl?: typeof fetch;
  sleepImpl?: (ms: number, signal?: AbortSignal) => Promise<void>;
  nowImpl?: () => number;
  onEvent?: (event: GrokProviderRetryEvent) => void;
}

export interface FetchGrokResponsesWithRetryResult {
  response: Response;
  retryState: GrokProviderRetryState;
}

export function providerFailureCode(classification: GrokProviderHttpClassification): string {
  if (
    classification === 'PROVIDER_SERVICE_UNAVAILABLE' ||
    classification === 'PROVIDER_INTERNAL_ERROR' ||
    classification === 'PROVIDER_BAD_GATEWAY' ||
    classification === 'PROVIDER_GATEWAY_TIMEOUT' ||
    classification === 'PROVIDER_NETWORK_FAILURE' ||
    classification === 'RATE_LIMITED'
  ) {
    return grokIncidentClassForHttp(
      classification === 'RATE_LIMITED'
        ? 429
        : classification === 'PROVIDER_INTERNAL_ERROR'
          ? 500
          : classification === 'PROVIDER_BAD_GATEWAY'
            ? 502
            : classification === 'PROVIDER_SERVICE_UNAVAILABLE'
              ? 503
              : classification === 'PROVIDER_GATEWAY_TIMEOUT'
                ? 504
                : null,
    );
  }
  return GROK_4_6_PROVIDER_BINDING_FAILED;
}

function headerRecord(headers?: Headers): Record<string, string> {
  const out: Record<string, string> = {};
  if (!headers) return out;
  headers.forEach((value, key) => {
    out[key] = value;
  });
  return out;
}

function assertNoSecrets(value: string): void {
  if (/authorization/i.test(value) && /bearer\s+[a-z0-9]/i.test(value)) {
    throw new Error('PROVIDER_EVIDENCE_LEAKED_SECRET');
  }
}

export async function defaultSleep(ms: number, signal?: AbortSignal): Promise<void> {
  if (ms <= 0) return;
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(Object.assign(new Error('Aborted'), { name: 'AbortError' }));
    };
    if (signal?.aborted) {
      onAbort();
      return;
    }
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

function buildFailure(args: {
  runId: string;
  status: number | null;
  body: string;
  headers?: Headers | null;
  endpoint: string;
  attempt: number;
  attempts: number;
  startedAt: string;
  failedAt: string;
  duration: number;
  evidence: GrokProviderCallEvidence[];
  retryState: GrokProviderRetryState;
}): GrokProviderError {
  const classification = classifyGrokProviderHttpStatus(args.status, args.body);
  const benchmarkFailureClass = mapProviderClassificationToBenchmarkFailure(classification);
  const incidentClass = grokIncidentClassForHttp(args.status, args.body);
  const safe = extractSafeProviderError(args.body, args.headers ?? undefined);
  const last = args.evidence[args.evidence.length - 1];
  const providerFailure: GrokDesignBenchProviderFailure = {
    code: providerFailureCode(classification),
    providerResponseCode: args.status,
    classification,
    benchmarkFailureClass,
    incidentClass,
    runId: args.runId,
    detail: sanitizeProviderMessage(args.body) ?? classification,
    providerRequestId: last?.providerRequestId ?? safe.providerRequestId,
    providerErrorCode: last?.providerErrorCode ?? safe.providerErrorCode,
    providerErrorType: last?.providerErrorType ?? safe.providerErrorType,
    providerMessage: last?.providerMessage ?? safe.providerMessage,
    endpoint: args.endpoint,
    attempt: args.attempt,
    attempts: args.attempts,
    startedAt: args.startedAt,
    failedAt: args.failedAt,
    duration: args.duration,
    model: GROK_TWIN_TEST_A_PROVIDER_MODEL,
  };
  assertNoSecrets(JSON.stringify(providerFailure));
  const copy = grokProviderRetryUiCopy({
    attempt: args.attempts,
    httpStatus: args.status,
    exhausted: true,
  });
  const retryState: GrokProviderRetryState = {
    ...args.retryState,
    status: 'EXHAUSTED',
    attempt: args.attempts,
    retries: Math.max(0, args.attempts - 1),
    lastHttpStatus: args.status,
    lastClassification: classification,
    lastBenchmarkFailureClass: benchmarkFailureClass,
    incidentClass,
    uiHeadline: copy.headline,
    uiDetail: copy.detail,
  };
  const message = [
    providerFailure.code,
    `modelId=${GROK_TWIN_TEST_A_PROVIDER_MODEL}`,
    `runId=${args.runId}`,
    `providerResponseCode=${args.status ?? 'none'}`,
    `classification=${classification}`,
    `benchmarkFailureClass=${benchmarkFailureClass}`,
    `attempts=${args.attempts}`,
  ].join(' ');
  return new GrokProviderError({
    message,
    httpStatus: args.status,
    classification,
    benchmarkFailureClass,
    incidentClass,
    attempts: args.attempts,
    evidence: args.evidence,
    retryState,
    providerFailure,
  });
}

export async function fetchGrokResponsesWithRetry(
  input: FetchGrokResponsesWithRetryInput,
): Promise<FetchGrokResponsesWithRetryResult> {
  const fetchImpl = input.fetchImpl ?? fetch;
  const sleepImpl = input.sleepImpl ?? defaultSleep;
  const nowImpl = input.nowImpl ?? Date.now;
  const wallStart = nowImpl();
  const deadlineMs = input.deadlineMs ?? wallStart + GROK_DESIGN_BENCH_EXECUTION_TIMEOUT_MS;
  const retryState = emptyGrokProviderRetryState();
  const emit = () => input.onEvent?.({ retryState: { ...retryState, evidence: [...retryState.evidence], timing: { ...retryState.timing } } });

  for (let attempt = 1; attempt <= GROK_PROVIDER_MAX_ATTEMPTS; attempt += 1) {
    if (input.signal?.aborted) {
      throw Object.assign(new Error(GROK_PROVIDER_TIMEOUT), { name: 'AbortError' });
    }
    const remainingBeforeAttempt = deadlineMs - nowImpl();
    if (remainingBeforeAttempt <= 0) {
      throw new Error(GROK_PROVIDER_TIMEOUT);
    }

    retryState.status = attempt === 1 ? 'IN_FLIGHT' : 'RETRYING';
    retryState.attempt = attempt;
    retryState.retries = Math.max(0, attempt - 1);
    const copy = grokProviderRetryUiCopy({ attempt, exhausted: false });
    retryState.uiHeadline = attempt > 1 ? copy.headline : null;
    retryState.uiDetail = attempt > 1 ? copy.detail : null;
    emit();

    const startedAtMs = nowImpl();
    const startedAt = new Date(startedAtMs).toISOString();
    let response: Response | undefined;
    let networkError: Error | undefined;
    try {
      response = await fetchImpl(input.endpoint, {
        method: GROK_DESIGN_BENCH_INFERENCE_METHOD,
        signal: input.signal,
        headers: {
          Authorization: `Bearer ${input.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: input.body,
      });
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw err;
      }
      networkError = err instanceof Error ? err : new Error(String(err));
    }

    const failedAtMs = nowImpl();
    const duration = Math.max(failedAtMs - startedAtMs, 0);
    recordAttemptDuration(retryState.timing, attempt, duration);
    retryState.timing.totalProviderWallTime = failedAtMs - wallStart;

    if (response?.ok) {
      retryState.status = 'SUCCEEDED';
      retryState.timing.successfulAttempt = attempt;
      retryState.uiHeadline = null;
      retryState.uiDetail = null;
      emit();
      return { response, retryState };
    }

    const status = response?.status ?? null;
    const rawBody = response ? await response.text().catch(() => '') : networkError?.message ?? 'PROVIDER_NETWORK_FAILURE';
    const safe = extractSafeProviderError(rawBody, response?.headers);
    const evidence: GrokProviderCallEvidence = {
      runId: input.runId,
      httpStatus: status,
      providerRequestId: safe.providerRequestId,
      providerErrorCode: safe.providerErrorCode,
      providerErrorType: safe.providerErrorType,
      providerMessage: safe.providerMessage,
      model: GROK_TWIN_TEST_A_PROVIDER_MODEL,
      endpoint: input.endpoint,
      attempt,
      startedAt,
      failedAt: new Date(failedAtMs).toISOString(),
      duration,
    };
    assertNoSecrets(JSON.stringify(evidence));
    retryState.evidence.push(evidence);
    retryState.lastHttpStatus = status;
    retryState.lastClassification = classifyGrokProviderHttpStatus(status, rawBody);
    retryState.lastBenchmarkFailureClass = mapProviderClassificationToBenchmarkFailure(retryState.lastClassification);
    retryState.incidentClass = grokIncidentClassForHttp(status, rawBody);

    const transient = status == null || isTransientGrokProviderStatus(status);
    const blocked = isNonRetryableGrokProviderStatus(status);
    const hasRetryLeft = attempt < GROK_PROVIDER_MAX_ATTEMPTS;
    const remaining = deadlineMs - nowImpl();
    const retryAfter = response?.headers.get('retry-after');
    const wait = computeGrokProviderRetryWaitMs({
      nextAttempt: attempt + 1,
      retryAfterHeader: retryAfter,
      remainingBudgetMs: remaining,
      nowMs: nowImpl(),
    });

    if (blocked || !transient || !hasRetryLeft || !wait.canRetry) {
      throw buildFailure({
        runId: input.runId,
        status,
        body: rawBody,
        headers: response?.headers ?? null,
        endpoint: input.endpoint,
        attempt,
        attempts: attempt,
        startedAt,
        failedAt: evidence.failedAt,
        duration,
        evidence: retryState.evidence,
        retryState,
      });
    }

    retryState.status = 'WAITING_RETRY';
    const waitingCopy = grokProviderRetryUiCopy({ attempt: attempt + 1, exhausted: false });
    retryState.uiHeadline = waitingCopy.headline;
    retryState.uiDetail = waitingCopy.detail;
    emit();
    await sleepImpl(wait.waitMs, input.signal);
    retryState.timing.retryWaitDuration = (retryState.timing.retryWaitDuration ?? 0) + wait.waitMs;
    retryState.timing.totalProviderWallTime = nowImpl() - wallStart;
    emit();
  }

  throw new Error('GROK_PROVIDER_RETRY_EXHAUSTED');
}

export function headerRecordForTests(headers?: Headers): Record<string, string> {
  return headerRecord(headers);
}
