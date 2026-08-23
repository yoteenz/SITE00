/**
 * Format helpers for personality review — shared with personalitySummary.
 */

import { getPersonalityQuestion } from './idnty-personality-questions.js';
import {
  formatCompoundLabels,
  normalizeFreeText,
  normalizeSelectedOptionIds,
  resolveOptionLabels,
  resolveResponseMode,
} from './loreAnswerTypes.js';

export function formatRawAnswerForPersonalityReview(
  stepId: string,
  raw: string | string[] | undefined,
): string | null {
  if (raw === undefined || raw === null) return null;
  const step = getPersonalityQuestion(stepId);
  if (!step) return null;

  const mode = resolveResponseMode(step);
  if (mode === 'FREE_TEXT') {
    const text = normalizeFreeText(raw);
    return text || null;
  }

  const ids = normalizeSelectedOptionIds(step, raw);
  if (ids.length === 0) return null;
  const labels = resolveOptionLabels(ids, step.options ?? []);
  return formatCompoundLabels(labels, ' + ');
}
