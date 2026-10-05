/**
 * P0.VR.6R2 — Visual convergence API client.
 */

import { apiFetch } from '../../../utils/api.js';
import type {
  DesignReferenceComparisonSession,
  DesignExecutionFidelityEnvelope,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr6r2/browserClient.js';

async function postConvergence<T>(body: Record<string, unknown>): Promise<T> {
  const res = await apiFetch('/api/site00/design-asset-reconstruction?action=' + String(body.action), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json() as Promise<T>;
}

export async function getConvergenceSession(input: {
  sessionId?: string;
  contractId?: string;
  referenceId?: string;
}): Promise<{ ok: boolean; session?: DesignReferenceComparisonSession; envelope?: DesignExecutionFidelityEnvelope }> {
  const params = new URLSearchParams({ action: 'convergence_get' });
  if (input.sessionId) params.set('sessionId', input.sessionId);
  if (input.contractId) params.set('contractId', input.contractId);
  if (input.referenceId) params.set('referenceId', input.referenceId);
  const res = await apiFetch(`/api/site00/design-asset-reconstruction?${params.toString()}`);
  return res.json() as Promise<{
    ok: boolean;
    session?: DesignReferenceComparisonSession;
    envelope?: DesignExecutionFidelityEnvelope;
  }>;
}

export async function listConvergenceSessions(projectId: string): Promise<{
  ok: boolean;
  sessions?: DesignReferenceComparisonSession[];
}> {
  const res = await apiFetch(
    `/api/site00/design-asset-reconstruction?action=convergence_list&projectId=${encodeURIComponent(projectId)}`,
  );
  return res.json() as Promise<{ ok: boolean; sessions?: DesignReferenceComparisonSession[] }>;
}

export async function startConvergence(contractId: string): Promise<{ ok: boolean; session?: DesignReferenceComparisonSession }> {
  return postConvergence({ action: 'convergence_start', contractId });
}

export async function runConvergenceComparison(input: {
  sessionId: string;
  referencePath: string;
  livePath: string;
  liveWidth: number;
  liveHeight: number;
  liveGeometryHints?: Record<string, unknown>;
}): Promise<{ ok: boolean; session?: DesignReferenceComparisonSession }> {
  return postConvergence({ action: 'convergence_run', ...input });
}

export async function founderVerifyConvergence(sessionId: string): Promise<{ ok: boolean; session?: DesignReferenceComparisonSession }> {
  return postConvergence({ action: 'convergence_founder_verify', sessionId });
}

export type { DesignReferenceComparisonSession, DesignExecutionFidelityEnvelope };
