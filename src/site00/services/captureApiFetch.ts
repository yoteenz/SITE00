/**
 * P0.VR.8R3R3 — Typed fetch wrapper for capture / page-mirror API.
 */

import { apiFetch } from '../../utils/api';
import { resolveSite00ApiBase, site00ApiUrl } from '../../utils/site00ApiBase';
import {
  classifyFetchFailure,
  classifyHttpStatus,
  classifyResponseBody,
} from '../../../shared/site00-studio-world-production/visualReconstruction/p0vr8r3/classifyCaptureTransportError.js';
import type {
  CaptureTransportErrorCode,
  CaptureTransportReceipt,
} from '../../../shared/site00-studio-world-production/visualReconstruction/p0vr8r3/captureTransportReceipt.js';

export const CAPTURE_API_TIMEOUT_MS = 30_000;
export const PAGE_MIRROR_PATH = '/api/site00/page-mirror';

export type CaptureApiFetchResult<T> = {
  ok: boolean;
  status: number;
  data: T | null;
  receipt: CaptureTransportReceipt;
  errorCode: CaptureTransportErrorCode | null;
};

function emptyReceipt(partial: Partial<CaptureTransportReceipt>): CaptureTransportReceipt {
  return {
    requestUrl: partial.requestUrl ?? '',
    method: partial.method ?? 'GET',
    origin: partial.origin ?? null,
    statusCode: partial.statusCode ?? null,
    responseReceived: partial.responseReceived ?? false,
    responseContentType: partial.responseContentType ?? null,
    corsHeader: partial.corsHeader ?? null,
    authHeaderPresent: partial.authHeaderPresent ?? false,
    requestDurationMs: partial.requestDurationMs ?? 0,
    apiBuild: partial.apiBuild ?? null,
    workerBuild: partial.workerBuild ?? null,
    contractVersion: partial.contractVersion ?? null,
    errorCode: partial.errorCode ?? null,
    errorMessage: partial.errorMessage ?? null,
  };
}

export function detectInvalidApiBaseUrl(): CaptureTransportErrorCode | null {
  const base = resolveSite00ApiBase();
  if (typeof window !== 'undefined') {
    const host = window.location.hostname.toLowerCase();
    const isProductionHost =
      host === 'site00.com' || host.endsWith('.site00.com') || host.includes('fsbw-dev.com');
    if (isProductionHost && !base) return 'INVALID_API_BASE_URL';
    if (window.location.protocol === 'https:' && base.startsWith('http://')) {
      return 'MIXED_CONTENT_BLOCKED';
    }
  }
  return null;
}

type CaptureApiFetchOptions = {
  method?: string;
  headers?: HeadersInit;
  timeoutMs?: number;
  authHeaderPresent?: boolean;
  body?: unknown;
};

export async function captureApiFetch<T = Record<string, unknown>>(
  path: string,
  options?: CaptureApiFetchOptions,
): Promise<CaptureApiFetchResult<T>> {
  const started = Date.now();
  const method = options?.method ?? 'GET';
  const requestUrl = site00ApiUrl(path);
  const origin = typeof window !== 'undefined' ? window.location.origin : null;
  const apiBase = resolveSite00ApiBase();

  const baseError = detectInvalidApiBaseUrl();
  if (baseError) {
    return {
      ok: false,
      status: 0,
      data: null,
      errorCode: baseError,
      receipt: emptyReceipt({
        requestUrl,
        method,
        origin,
        errorCode: baseError,
        errorMessage: baseError === 'INVALID_API_BASE_URL' ? 'API base URL is not configured for this host' : 'HTTPS page cannot call HTTP API',
        requestDurationMs: Date.now() - started,
        authHeaderPresent: options?.authHeaderPresent ?? false,
      }),
    };
  }

  const controller = new AbortController();
  const timeoutMs = options?.timeoutMs ?? CAPTURE_API_TIMEOUT_MS;
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await apiFetch(path, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timer);

    const contentType = res.headers.get('content-type');
    const corsHeader = res.headers.get('access-control-allow-origin');
    const raw = await res.text();
    const duration = Date.now() - started;

    const bodyError = classifyResponseBody(raw, contentType);
    const httpError = classifyHttpStatus(res.status);
    let errorCode = httpError ?? bodyError;
    let data: T | null = null;

    if (!errorCode && res.ok) {
      try {
        data = JSON.parse(raw) as T;
      } catch {
        errorCode = 'INVALID_API_RESPONSE';
      }
    }

    const apiBuild = data && typeof data === 'object' && 'apiBuild' in data ? String((data as { apiBuild?: string }).apiBuild ?? '') : null;
    const workerBuild =
      data && typeof data === 'object' && 'workerBuild' in data ? String((data as { workerBuild?: string }).workerBuild ?? '') : null;
    const contractVersion =
      data && typeof data === 'object' && 'contractVersion' in data
        ? String((data as { contractVersion?: string }).contractVersion ?? '')
        : null;

    if (!res.ok && !errorCode) {
      errorCode = 'UNKNOWN_TRANSPORT_ERROR';
    }

    return {
      ok: res.ok && !errorCode,
      status: res.status,
      data,
      errorCode,
      receipt: emptyReceipt({
        requestUrl,
        method,
        origin,
        statusCode: res.status,
        responseReceived: true,
        responseContentType: contentType,
        corsHeader,
        authHeaderPresent: options?.authHeaderPresent ?? false,
        requestDurationMs: duration,
        apiBuild,
        workerBuild,
        contractVersion,
        errorCode,
        errorMessage: errorCode ? raw.slice(0, 200) || res.statusText : null,
      }),
    };
  } catch (error) {
    clearTimeout(timer);
    const errorCode = classifyFetchFailure(error, {
      apiBaseUrl: apiBase,
      pageProtocol: typeof window !== 'undefined' ? window.location.protocol : undefined,
    });
    return {
      ok: false,
      status: 0,
      data: null,
      errorCode,
      receipt: emptyReceipt({
        requestUrl,
        method,
        origin,
        errorCode,
        errorMessage: error instanceof Error ? error.message : String(error),
        requestDurationMs: Date.now() - started,
        authHeaderPresent: options?.authHeaderPresent ?? false,
      }),
    };
  }
}
