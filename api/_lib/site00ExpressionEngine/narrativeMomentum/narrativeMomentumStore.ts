import type { NarrativeMomentumPlan, NarrativeMomentumStatus } from '../../../../shared/site00-expression-engine/narrative-momentum/types.js';

const currentByEntry = new Map<string, NarrativeMomentumPlan>();
const historyByEntry = new Map<string, NarrativeMomentumPlan[]>();

export function resetNarrativeMomentumStore(): void {
  currentByEntry.clear();
  historyByEntry.clear();
}

export function saveNarrativeMomentumPlan(plan: NarrativeMomentumPlan): NarrativeMomentumPlan {
  const existing = currentByEntry.get(plan.entryId);
  if (existing && existing.id !== plan.id) {
    const hist = historyByEntry.get(plan.entryId) ?? [];
    hist.push({ ...existing, founderStatus: 'SUPERSEDED' });
    historyByEntry.set(plan.entryId, hist);
  }
  currentByEntry.set(plan.entryId, plan);
  return plan;
}

export function getNarrativeMomentumPlan(entryId: string): NarrativeMomentumPlan | null {
  return currentByEntry.get(entryId) ?? null;
}

export function listNarrativeMomentumHistory(entryId: string): NarrativeMomentumPlan[] {
  return historyByEntry.get(entryId) ?? [];
}

export function applyNarrativeMomentumFounderStatus(input: {
  entryId: string;
  founderStatus: NarrativeMomentumStatus;
}): NarrativeMomentumPlan | null {
  const current = currentByEntry.get(input.entryId);
  if (!current) return null;
  const updated: NarrativeMomentumPlan = {
    ...current,
    founderStatus: input.founderStatus,
    updatedAt: new Date().toISOString(),
  };
  currentByEntry.set(input.entryId, updated);
  return updated;
}
