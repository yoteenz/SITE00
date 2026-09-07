/**
 * Sprint B3.2 — annotation history persistence (in-memory, mirrors chapter store pattern).
 */

import type {
  CoverAnnotationHistoryRecord,
  CoverHeaderAnnotationPlan,
} from '../../../shared/site00-expression-engine/chapterCoverAnnotationTypes.js';

const historyStore = new Map<string, CoverAnnotationHistoryRecord>();

export function resetCoverAnnotationHistoryStore(): void {
  historyStore.clear();
}

function recordKey(chapterId: string, entryId: string): string {
  return `${chapterId}::${entryId}`;
}

export function recordCoverAnnotationHistory(
  plan: CoverHeaderAnnotationPlan,
  entryNumber: number,
): CoverAnnotationHistoryRecord {
  const record: CoverAnnotationHistoryRecord = {
    recordId: `ann-${plan.chapterId}-${plan.entryId}`,
    chapterId: plan.chapterId,
    entryId: plan.entryId,
    entryNumber,
    headline: plan.headline,
    annotationFamily: plan.annotationFamily,
    primaryMark: plan.primaryMark,
    secondaryMark: plan.secondaryMark,
    targetedWords: [plan.primaryTargetWord, plan.secondaryTargetWord].filter(Boolean) as string[],
    founderJudgment: plan.founderJudgment ?? 'LOVE_IT',
    recordedAt: new Date().toISOString(),
  };
  historyStore.set(recordKey(plan.chapterId, plan.entryId), record);
  return record;
}

export function getCoverAnnotationHistory(
  chapterId: string,
  entryId: string,
): CoverAnnotationHistoryRecord | null {
  return historyStore.get(recordKey(chapterId, entryId)) ?? null;
}

export function listCoverAnnotationHistoryForChapter(
  chapterId: string,
): CoverAnnotationHistoryRecord[] {
  return [...historyStore.values()]
    .filter((r) => r.chapterId === chapterId)
    .sort((a, b) => a.entryNumber - b.entryNumber);
}

export function getPriorEntryAnnotationHistory(
  chapterId: string,
  entryNumber: number,
): CoverAnnotationHistoryRecord | null {
  const chapterHistory = listCoverAnnotationHistoryForChapter(chapterId);
  return chapterHistory.find((r) => r.entryNumber === entryNumber - 1) ?? null;
}
