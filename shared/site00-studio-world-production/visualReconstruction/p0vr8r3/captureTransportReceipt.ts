/**
 * P0.VR.8R3R3 — Capture transport receipt (no secrets).
 */

export type CaptureTransportErrorCode =
  | 'API_UNREACHABLE'
  | 'DNS_RESOLUTION_FAILED'
  | 'TLS_ERROR'
  | 'CORS_REJECTED'
  | 'AUTH_FAILED'
  | 'SESSION_MISSING'
  | 'REQUEST_TIMEOUT'
  | 'ENDPOINT_NOT_FOUND'
  | 'METHOD_NOT_ALLOWED'
  | 'BACKEND_VERSION_MISMATCH'
  | 'CONTRACT_VERSION_MISMATCH'
  | 'WORKER_UNAVAILABLE'
  | 'MIXED_CONTENT_BLOCKED'
  | 'INVALID_API_BASE_URL'
  | 'INVALID_API_RESPONSE'
  | 'SERVER_5XX'
  | 'UNKNOWN_TRANSPORT_ERROR';

export type CaptureTransportReceipt = {
  requestUrl: string;
  method: string;
  origin: string | null;
  statusCode: number | null;
  responseReceived: boolean;
  responseContentType: string | null;
  corsHeader: string | null;
  authHeaderPresent: boolean;
  requestDurationMs: number;
  apiBuild: string | null;
  workerBuild: string | null;
  contractVersion: string | null;
  errorCode: CaptureTransportErrorCode | null;
  errorMessage: string | null;
};

export type CaptureTransportHealthStatus = 'HEALTHY' | 'DEGRADED' | 'UNAVAILABLE' | 'MISCONFIGURED';

export type CaptureTransportHealth = {
  frontendBuild: string;
  apiBuild: string | null;
  workerBuild: string | null;
  frontendGitSha: string | null;
  apiGitSha: string | null;
  workerGitSha: string | null;
  apiBaseUrl: string;
  captureEndpoint: string;
  healthEndpoint: string;
  apiReachable: boolean;
  corsAllowed: boolean;
  authValid: boolean;
  contractVersion: string | null;
  contractCompatible: boolean;
  workerStatus: string;
  latencyMs: number;
  lastCheckedAt: string;
  status: CaptureTransportHealthStatus;
  errors: CaptureTransportErrorCode[];
  workerId?: string | null;
  lastHeartbeat?: string | null;
  heartbeatAgeMs?: number | null;
  playwrightReady?: boolean;
  browserReady?: boolean;
  testJobPassed?: boolean;
  lastError?: string | null;
  browserBootErrorCode?: string | null;
  chromiumRevision?: string | null;
  chromiumExecutablePath?: string | null;
  missingLibraries?: string[];
  deploymentStrategy?: string | null;
  testScreenshotPath?: string | null;
};

export type CaptureTransportHealthResponse = {
  apiBuild: string;
  workerBuild: string;
  contractVersion: string;
  workerStatus: string;
  serverTime: string;
  captureServiceReady: boolean;
  gitSha: string | null;
  lastHeartbeat: string | null;
  lastAcceptedJobAt: string | null;
  workerId?: string;
  heartbeatAgeMs?: number | null;
  playwrightReady?: boolean;
  browserReady?: boolean;
  activeJobCount?: number;
  queueDepth?: number;
  lastError?: string | null;
  testJobPassed?: boolean;
  versionMismatch?: string | null;
  browserBootErrorCode?: string | null;
  chromiumRevision?: string | null;
  chromiumExecutablePath?: string | null;
  missingLibraries?: string[];
  deploymentStrategy?: string | null;
  systemDependenciesReady?: boolean;
  testScreenshotPath?: string | null;
};
