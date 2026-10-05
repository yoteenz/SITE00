/**
 * P0.VR.OPUS-NATIVE1 — browser client for the native Opus runtime.
 *
 * This module never sees a credential. It talks to the server endpoint, which
 * holds the Anthropic key; the only thing it learns about the credential is
 * whether the server reports the API as READY or BLOCKED.
 */

import { apiFetch } from '../../../../utils/api';
import { OPUS_NATIVE_API_PATH } from '../../../../../shared/site00-opus-native/contracts';
import type {
  OpusNativeAgentContextResponse,
  OpusNativeEstimateResponse,
  OpusNativeGapResponse,
  OpusNativeLedgerResponse,
  OpusNativeSurfacesResponse,
  OpusNativeTargetRef,
} from '../../../../../shared/site00-opus-native/contracts';
import type {
  DesignAgentIntent,
  FounderWriteGrant,
  WriteAuthorizationRequest,
} from '../../../../../shared/site00-opus-native/writePolicy';
import type {
  OpusNativeDiagnostics,
  OpusNativeMode,
  OpusNativeRun,
} from '../../../../../shared/site00-opus-native/types';

export interface OpusNativeServiceInfo {
  ok: true;
  service: string;
  model: string;
  diagnostics: OpusNativeDiagnostics;
  modes: Array<{
    mode: OpusNativeMode;
    purpose: string;
    useFor: string[];
    contextBudgetTokens: number;
    maxVisualLoops: number;
    defaultEffort: string;
    limits: Record<string, number>;
  }>;
  tools: Array<{ name: string; mutating: boolean }>;
  scriptedProvider: { enabled: boolean; transcripts: Array<{ id: string; description: string }> };
}

async function readJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  let payload: unknown;
  try {
    payload = JSON.parse(text);
  } catch {
    throw new Error(`Runtime returned a non-JSON response (${response.status})`);
  }
  const record = payload as Record<string, unknown>;
  if (!response.ok || record.ok === false) {
    throw new Error(String(record.detail ?? record.error ?? `request failed (${response.status})`));
  }
  return payload as T;
}

export async function fetchServiceInfo(): Promise<OpusNativeServiceInfo> {
  return readJson(await apiFetch(`${OPUS_NATIVE_API_PATH}?action=diagnostics`));
}

export async function fetchRunStatus(runId?: string): Promise<{ ok: true; run: OpusNativeRun }> {
  const query = runId ? `&runId=${encodeURIComponent(runId)}` : '';
  return readJson(await apiFetch(`${OPUS_NATIVE_API_PATH}?action=status${query}`));
}

export async function estimateRun(input: {
  mode: OpusNativeMode;
  task: string;
  target?: OpusNativeTargetRef;
  intent?: DesignAgentIntent;
  writeGrant?: FounderWriteGrant | null;
}): Promise<OpusNativeEstimateResponse> {
  return readJson(
    await apiFetch(OPUS_NATIVE_API_PATH, { method: 'POST', body: { action: 'estimate', ...input } }),
  );
}

export async function startRun(input: {
  mode: OpusNativeMode;
  task: string;
  target?: OpusNativeTargetRef;
  founderConfirmedSpend: boolean;
  scriptedProviderId?: string;
  intent?: DesignAgentIntent;
  writeGrant?: FounderWriteGrant | null;
  sessionId?: string | null;
}): Promise<{ ok: true; run: OpusNativeRun }> {
  return readJson(
    await apiFetch(OPUS_NATIVE_API_PATH, { method: 'POST', body: { action: 'start', ...input } }),
  );
}

/**
 * P0.VR.OPUS-NATIVE2 — Phase 23. Request changes and continue in one call, so
 * the founder's follow-up lands on the existing thread instead of starting a
 * cold run that has to rediscover everything.
 */
export async function continueRun(input: {
  runId: string;
  note: string;
  founderConfirmedSpend: boolean;
  scriptedProviderId?: string;
}): Promise<{ ok: true; run: OpusNativeRun }> {
  return readJson(
    await apiFetch(OPUS_NATIVE_API_PATH, { method: 'POST', body: { action: 'continue', ...input } }),
  );
}

export async function fetchSurfaces(): Promise<OpusNativeSurfacesResponse> {
  return readJson(await apiFetch(`${OPUS_NATIVE_API_PATH}?action=surfaces`));
}

/** Phase 32 — compiled operational context. Never reasoning. */
export async function fetchAgentContext(input: {
  route?: string;
  pageId?: string;
  mode?: OpusNativeMode;
  intent?: DesignAgentIntent;
}): Promise<OpusNativeAgentContextResponse> {
  const query = new URLSearchParams({ action: 'agent_context' });
  if (input.route) query.set('route', input.route);
  if (input.pageId) query.set('pageId', input.pageId);
  if (input.mode) query.set('mode', input.mode);
  if (input.intent) query.set('intent', input.intent);
  return readJson(await apiFetch(`${OPUS_NATIVE_API_PATH}?${query.toString()}`));
}

/**
 * Phase 7. A start that needs authorization comes back as a structured 409,
 * and `readJson` would flatten it to a message. This preserves the
 * authorization request so the panel can render the grant prompt.
 */
export class WriteAccessRequiredError extends Error {
  constructor(public readonly authorization: WriteAuthorizationRequest) {
    super(`WRITE_ACCESS_REQUIRED: ${authorization.requestedMode} needed on ${authorization.pageId}`);
    this.name = 'WriteAccessRequiredError';
  }
}

export async function startRunAuthorised(input: Parameters<typeof startRun>[0]) {
  const response = await apiFetch(OPUS_NATIVE_API_PATH, {
    method: 'POST',
    body: { action: 'start', ...input },
  });
  const text = await response.text();
  const payload = JSON.parse(text) as Record<string, unknown>;
  if (payload.error === 'WRITE_ACCESS_REQUIRED' && payload.writeAuthorization) {
    throw new WriteAccessRequiredError(payload.writeAuthorization as WriteAuthorizationRequest);
  }
  if (!response.ok || payload.ok === false) {
    throw new Error(String(payload.detail ?? payload.error ?? `request failed (${response.status})`));
  }
  return payload as { ok: true; run: OpusNativeRun };
}

export async function runAction(
  action: 'cancel' | 'approve' | 'request_changes' | 'revert',
  runId: string,
  extra: Record<string, unknown> = {},
): Promise<{ ok: true; run: OpusNativeRun }> {
  return readJson(
    await apiFetch(OPUS_NATIVE_API_PATH, { method: 'POST', body: { action, runId, ...extra } }),
  );
}

export async function fetchLedger(): Promise<OpusNativeLedgerResponse> {
  return readJson(await apiFetch(`${OPUS_NATIVE_API_PATH}?action=ledger`));
}

export async function fetchGap(): Promise<OpusNativeGapResponse> {
  return readJson(await apiFetch(`${OPUS_NATIVE_API_PATH}?action=gap`));
}

/** Terminal states stop the panel's status polling. */
export const TERMINAL_STATUSES = new Set([
  'WAITING_FOR_FOUNDER_REVIEW',
  'APPROVED',
  'REVERTED',
  'CANCELLED',
  'ERROR',
]);
