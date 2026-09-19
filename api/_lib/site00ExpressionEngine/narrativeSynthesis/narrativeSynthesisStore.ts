/**
 * C1.0 — Narrative synthesis store + versioning.
 */

import type {
  NarrativeSynthesis,
  NarrativeSynthesisFounderJudgment,
} from '../../../../shared/site00-expression-engine/narrative-synthesis/types.js';

const currentByEntry = new Map<string, NarrativeSynthesis>();
const historyByEntry = new Map<string, NarrativeSynthesis[]>();

export function resetNarrativeSynthesisStore(): void {
  currentByEntry.clear();
  historyByEntry.clear();
}

export function saveNarrativeSynthesis(record: NarrativeSynthesis): NarrativeSynthesis {
  const existing = currentByEntry.get(record.entryId);
  if (existing && existing.version !== record.version) {
    const hist = historyByEntry.get(record.entryId) ?? [];
    hist.push({ ...existing, status: 'SUPERSEDED' });
    historyByEntry.set(record.entryId, hist);
  }
  currentByEntry.set(record.entryId, record);
  return record;
}

export function getNarrativeSynthesis(entryId: string): NarrativeSynthesis | null {
  return currentByEntry.get(entryId) ?? null;
}

export function listNarrativeSynthesisHistory(entryId: string): NarrativeSynthesis[] {
  return historyByEntry.get(entryId) ?? [];
}

export function applyNarrativeSynthesisFounderJudgment(params: {
  entryId: string;
  founderJudgment: Exclude<NarrativeSynthesisFounderJudgment, 'UNREVIEWED'>;
}): NarrativeSynthesis | null {
  const current = currentByEntry.get(params.entryId);
  if (!current) return null;

  const approved = params.founderJudgment === 'LOVE_IT';
  const updated: NarrativeSynthesis = {
    ...current,
    founderJudgment: params.founderJudgment,
    status: approved ? 'APPROVED' : current.status,
    narrativeAuthority: approved,
    canon: approved,
    approvedAt: approved ? new Date().toISOString() : null,
    updatedAt: new Date().toISOString(),
  };
  currentByEntry.set(params.entryId, updated);
  return updated;
}

export function isNarrativeAuthorityApproved(entryId: string): boolean {
  const current = currentByEntry.get(entryId);
  return Boolean(current?.narrativeAuthority && current.founderJudgment === 'LOVE_IT');
}
