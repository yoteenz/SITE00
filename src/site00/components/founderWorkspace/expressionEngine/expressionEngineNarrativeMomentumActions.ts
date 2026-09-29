import { apiFetch } from '../../../../utils/api.js';

export type NarrativeMomentumFounderAction =
  | 'APPROVE_NARRATIVE'
  | 'REFINE_NARRATIVE'
  | 'LOVE_IT'
  | 'PROMISING'
  | 'TOO_CLOSE'
  | 'NOT_NDXBOOK';

export async function postNarrativeMomentumJudgment(
  founderAction: NarrativeMomentumFounderAction,
  entryId = 'entry-002',
): Promise<void> {
  const res = await apiFetch('/api/site00/expression-engine', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'SET_NARRATIVE_MOMENTUM_JUDGMENT',
      founderAction,
      entryId,
    }),
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function postCompileNarrativeMomentum(entryId = 'entry-002'): Promise<void> {
  const res = await apiFetch('/api/site00/expression-engine', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'COMPILE_NARRATIVE_MOMENTUM', entryId }),
  });
  if (!res.ok) throw new Error(await res.text());
}
