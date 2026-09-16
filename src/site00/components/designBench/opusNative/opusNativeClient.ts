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
  OpusNativeEstimateResponse,
  OpusNativeGapResponse,
  OpusNativeLedgerResponse,
  OpusNativeTargetRef,
} from '../../../../../shared/site00-opus-native/contracts';
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
}): Promise<{ ok: true; run: OpusNativeRun }> {
  return readJson(
    await apiFetch(OPUS_NATIVE_API_PATH, { method: 'POST', body: { action: 'start', ...input } }),
  );
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
