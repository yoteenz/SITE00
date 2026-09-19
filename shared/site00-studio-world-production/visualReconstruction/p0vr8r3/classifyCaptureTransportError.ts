/**
 * P0.VR.8R3R3 — Classify fetch failures into specific transport error codes.
 */

import type { CaptureTransportErrorCode } from './captureTransportReceipt.js';

export function classifyFetchFailure(error: unknown, context?: { apiBaseUrl?: string; pageProtocol?: string }): CaptureTransportErrorCode {
  const message = error instanceof Error ? error.message : String(error);
  const name = error instanceof Error ? error.name : '';

  if (name === 'AbortError' || /timeout|timed out/i.test(message)) {
    return 'REQUEST_TIMEOUT';
  }
  if (/mixed content/i.test(message)) {
    return 'MIXED_CONTENT_BLOCKED';
  }
  if (context?.pageProtocol === 'https:' && context.apiBaseUrl?.startsWith('http://')) {
    return 'MIXED_CONTENT_BLOCKED';
  }
  if (/failed to fetch|networkerror|load failed|network request failed/i.test(message)) {
    return 'API_UNREACHABLE';
  }
  if (/cors|cross-origin|access-control/i.test(message)) {
    return 'CORS_REJECTED';
  }
  if (/certificate|ssl|tls|cert/i.test(message)) {
    return 'TLS_ERROR';
  }
  if (/getaddrinfo|enotfound|dns|name not resolved/i.test(message)) {
    return 'DNS_RESOLUTION_FAILED';
  }
  return 'UNKNOWN_TRANSPORT_ERROR';
}

export function classifyHttpStatus(status: number): CaptureTransportErrorCode | null {
  if (status === 401 || status === 403) return 'AUTH_FAILED';
  if (status === 404) return 'ENDPOINT_NOT_FOUND';
  if (status === 405) return 'METHOD_NOT_ALLOWED';
  if (status >= 500) return 'SERVER_5XX';
  return null;
}

export function classifyResponseBody(raw: string, contentType: string | null): CaptureTransportErrorCode | null {
  const trimmed = raw.trim();
  if (!trimmed) return 'INVALID_API_RESPONSE';
  if (trimmed.startsWith('<!') || trimmed.startsWith('<html') || trimmed.startsWith('<HTML')) {
    return 'INVALID_API_RESPONSE';
  }
  if (contentType && !contentType.toLowerCase().includes('json')) {
    return 'INVALID_API_RESPONSE';
  }
  return null;
}

export function deriveTransportHealthStatus(errors: CaptureTransportErrorCode[]): 'HEALTHY' | 'DEGRADED' | 'UNAVAILABLE' | 'MISCONFIGURED' {
  if (errors.length === 0) return 'HEALTHY';
  if (errors.includes('INVALID_API_BASE_URL') || errors.includes('MIXED_CONTENT_BLOCKED')) {
    return 'MISCONFIGURED';
  }
  if (errors.includes('WORKER_UNAVAILABLE') && !errors.includes('API_UNREACHABLE')) {
    return 'DEGRADED';
  }
  if (errors.includes('BACKEND_VERSION_MISMATCH') || errors.includes('CONTRACT_VERSION_MISMATCH')) {
    return 'DEGRADED';
  }
  return 'UNAVAILABLE';
}
