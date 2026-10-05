/**
 * P0.VR.7 — Reference fidelity contract API client.
 */

import { apiFetch } from '../../../utils/api.js';
import type {
  DesignReferenceFidelityContract,
  ExecutionFidelityHandoff,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr7/browserClient.js';
import { formatInterpretationSummary } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr7/browserClient.js';

export type FidelityInterpretation = ReturnType<typeof formatInterpretationSummary>;

async function postFidelity<T>(body: Record<string, unknown>): Promise<T> {
  const res = await apiFetch('/api/site00/design-asset-reconstruction?action=' + String(body.action), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json() as Promise<T>;
}

export async function getFidelityContract(input: {
  contractId?: string;
  referenceId?: string;
}): Promise<{
  ok: boolean;
  contract?: DesignReferenceFidelityContract;
  interpretation?: FidelityInterpretation;
  handoff?: ExecutionFidelityHandoff;
}> {
  const params = new URLSearchParams({ action: 'fidelity_get' });
  if (input.contractId) params.set('contractId', input.contractId);
  if (input.referenceId) params.set('referenceId', input.referenceId);
  const res = await apiFetch(`/api/site00/design-asset-reconstruction?${params.toString()}`);
  return res.json() as Promise<{
    ok: boolean;
    contract?: DesignReferenceFidelityContract;
    interpretation?: FidelityInterpretation;
    handoff?: ExecutionFidelityHandoff;
  }>;
}

export async function listFidelityContracts(projectId: string): Promise<{
  ok: boolean;
  contracts?: DesignReferenceFidelityContract[];
}> {
  const res = await apiFetch(
    `/api/site00/design-asset-reconstruction?action=fidelity_list&projectId=${encodeURIComponent(projectId)}`,
  );
  return res.json() as Promise<{ ok: boolean; contracts?: DesignReferenceFidelityContract[] }>;
}

export async function confirmFidelityInterpretation(contractId: string): Promise<{
  ok: boolean;
  contract?: DesignReferenceFidelityContract;
}> {
  return postFidelity({ action: 'fidelity_confirm', contractId });
}

export async function runFidelityQa(input: {
  contractId: string;
  liveCaptureAvailable?: boolean;
  liveGeometryHints?: Record<string, unknown>;
}): Promise<{ ok: boolean; contract?: DesignReferenceFidelityContract }> {
  return postFidelity({ action: 'fidelity_qa', ...input });
}

export type { DesignReferenceFidelityContract, ExecutionFidelityHandoff };
