/**
 * Expression Engine V0 — campaign production API client.
 */

import { apiFetch } from '../../utils/api.js';
import type {
  ExpressionEngineB1Phase1Response,
  ExpressionEngineB1Phase2Response,
} from '../../../shared/site00-expression-engine/campaignClientTypes.js';
import type { CreativeEntry, EntryReadinessResult } from '../../../shared/site00-expression-engine/types.js';

async function expressionFetch<T>(path: string): Promise<T> {
  const res = await apiFetch(path);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Expression Engine request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export const expressionEngineApi = {
  phase1: () => expressionFetch<ExpressionEngineB1Phase1Response>('/api/site00/expression-engine?phase=B1'),
  phase2: () => expressionFetch<ExpressionEngineB1Phase2Response>('/api/site00/expression-engine?phase=B1P2'),
  phaseB45: (options?: { dispatchFal?: boolean }) => {
    const params = new URLSearchParams({ phase: 'B45' });
    if (options?.dispatchFal) params.set('dispatchFal', '1');
    return expressionFetch<Record<string, unknown>>(`/api/site00/expression-engine?${params.toString()}`);
  },
  entry: (brandId: string, entryNumber: number) =>
    expressionFetch<{ entry: CreativeEntry; readiness: EntryReadinessResult }>(
      `/api/site00/expression-engine?brandId=${encodeURIComponent(brandId)}&entryNumber=${entryNumber}`,
    ),
};
