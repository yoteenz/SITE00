/**
 * Expression Engine V0 — in-memory entry store (mirrors Experience Engine pattern).
 */

import type { CreativeEntry, FounderJudgmentRecord } from '../../../shared/site00-expression-engine/types.js';

const entryStore = new Map<string, CreativeEntry>();

export function resetExpressionEntryStore(): void {
  entryStore.clear();
}

export function saveEntry(entry: CreativeEntry): CreativeEntry {
  entry.updatedAt = new Date().toISOString();
  entryStore.set(entry.id, entry);
  return entry;
}

export function getEntry(entryId: string): CreativeEntry | null {
  return entryStore.get(entryId) ?? null;
}

export function listEntriesForProject(projectId: string): CreativeEntry[] {
  return [...entryStore.values()].filter((e) => e.projectId === projectId);
}

export function recordFounderJudgment(params: {
  entry: CreativeEntry;
  scope: FounderJudgmentRecord['scope'];
  scopeId: string;
  action: FounderJudgmentRecord['action'];
}): CreativeEntry {
  const judgment: FounderJudgmentRecord = {
    judgmentId: `judgment-${Date.now()}`,
    scope: params.scope,
    scopeId: params.scopeId,
    action: params.action,
    canonImpact: params.action === 'LOVE_IT' ? 'PRODUCTION_CANDIDATE' : 'NON_CANON',
    preserveHistory: true,
    crossBrandPortable: params.action === 'NOT_FOR_ME' ? false : false,
    createdAt: new Date().toISOString(),
  };

  const updated: CreativeEntry = {
    ...params.entry,
    founderJudgments: [...params.entry.founderJudgments, judgment],
  };

  if (params.action === 'NOT_FOR_ME') {
    updated.generationReceipts = updated.generationReceipts.map((r) =>
      r.assetId === params.scopeId || params.scope === 'ENTRY'
        ? { ...r, judgmentState: 'NOT_FOR_ME', canonState: 'NON_CANON' }
        : r,
    );
  }

  return saveEntry(updated);
}
