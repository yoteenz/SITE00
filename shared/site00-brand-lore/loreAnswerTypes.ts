/**
 * Canonical Brand Lore answer types — response modes and normalization.
 *
 * Raw intake storage remains `Record<string, string | string[]>` for JSONB compatibility.
 * Structured LoreRawAnswer is used at synthesis/review boundaries.
 */

import type { LoreQuestionOption, LoreQuestionStep } from './idnty-lore-questions.js';
import { getLoreQuestion } from './idnty-lore-questions.js';
import { isSkippedAnswer, LORE_NOT_SURE_VALUE, LORE_SKIP_VALUE } from './adaptivity.js';

export type LoreResponseMode =
  | 'SINGLE_SELECT'
  | 'MULTI_SELECT'
  | 'RANKED_MULTI_SELECT'
  | 'FREE_TEXT';

export type LoreRawAnswer = {
  questionId: string;
  responseMode: LoreResponseMode;
  selectedOptionIds?: string[];
  rankedOptionIds?: string[];
  freeText?: string;
};

export type LoreSelectionConstraints = {
  minSelections?: number;
  maxSelections?: number;
  recommendedMaxSelections?: number;
  allowOther?: boolean;
  allowFreeTextSupplement?: boolean;
};

/** Map legacy `type` → responseMode when responseMode omitted (backward compat). */
export function resolveResponseMode(step: Pick<LoreQuestionStep, 'responseMode' | 'type'>): LoreResponseMode {
  if (step.responseMode) return step.responseMode;
  switch (step.type) {
    case 'single':
      return 'SINGLE_SELECT';
    case 'multi':
      return 'MULTI_SELECT';
    case 'textarea':
    case 'language-samples':
      return 'FREE_TEXT';
    default:
      return 'FREE_TEXT';
  }
}

export function isMultiSelectMode(mode: LoreResponseMode): boolean {
  return mode === 'MULTI_SELECT' || mode === 'RANKED_MULTI_SELECT';
}

export function loreInteractionMode(step: LoreQuestionStep): 'single' | 'multi' {
  return resolveResponseMode(step) === 'SINGLE_SELECT' ? 'single' : 'multi';
}

export function selectionGuidanceCopy(step: LoreQuestionStep): string | null {
  if (step.selectionGuidance) return step.selectionGuidance;
  const mode = resolveResponseMode(step);
  if (mode === 'MULTI_SELECT') {
    if (step.recommendedMaxSelections) {
      return `CHOOSE UP TO ${step.recommendedMaxSelections} THAT FEEL ESSENTIAL.`;
    }
    return 'MORE THAN ONE CAN BE TRUE.';
  }
  if (mode === 'RANKED_MULTI_SELECT') return 'RANK WHAT MATTERS MOST — TOP FIRST.';
  return null;
}

/** Normalize persisted raw value → atomic option ids for a question. */
export function normalizeSelectedOptionIds(
  step: LoreQuestionStep,
  raw: string | string[] | undefined,
): string[] {
  if (raw === undefined || raw === null || isSkippedAnswer(raw)) return [];
  const mode = resolveResponseMode(step);

  if (mode === 'FREE_TEXT') return [];

  if (mode === 'SINGLE_SELECT') {
    if (typeof raw === 'string' && raw.trim()) return [raw.trim()];
    if (Array.isArray(raw) && raw.length > 0) return [String(raw[0])];
    return [];
  }

  if (Array.isArray(raw)) {
    return raw.filter((x) => typeof x === 'string' && x.trim() && x !== LORE_SKIP_VALUE && x !== LORE_NOT_SURE_VALUE);
  }
  if (typeof raw === 'string' && raw.trim()) return [raw.trim()];
  return [];
}

export function normalizeFreeText(raw: string | string[] | undefined): string | null {
  if (raw === undefined || raw === null || isSkippedAnswer(raw)) return null;
  if (typeof raw === 'string') return raw.trim() || null;
  if (Array.isArray(raw) && raw.length === 1 && typeof raw[0] === 'string') return raw[0].trim() || null;
  return null;
}

export function parseLoreRawAnswer(questionId: string, raw: string | string[] | undefined): LoreRawAnswer | null {
  const step = getLoreQuestion(questionId);
  if (!step) return null;
  const responseMode = resolveResponseMode(step);

  if (responseMode === 'FREE_TEXT') {
    const freeText = normalizeFreeText(raw);
    if (!freeText) return null;
    return { questionId, responseMode, freeText };
  }

  const selectedOptionIds = normalizeSelectedOptionIds(step, raw);
  if (selectedOptionIds.length === 0) return null;

  if (responseMode === 'RANKED_MULTI_SELECT') {
    return { questionId, responseMode, selectedOptionIds, rankedOptionIds: [...selectedOptionIds] };
  }

  return { questionId, responseMode, selectedOptionIds };
}

/** Serialize answer for persistence — arrays for multi, string for single/free-text. */
export function serializeLoreAnswer(step: LoreQuestionStep, value: string | string[]): string | string[] {
  const mode = resolveResponseMode(step);
  if (mode === 'FREE_TEXT') {
    return typeof value === 'string' ? value : Array.isArray(value) ? value.join('\n') : '';
  }
  if (mode === 'SINGLE_SELECT') {
    if (Array.isArray(value)) return value[0] ?? '';
    return value;
  }
  return Array.isArray(value) ? value : value ? [value] : [];
}

export function resolveOptionLabels(optionIds: string[], options: LoreQuestionOption[]): string[] {
  const map = new Map(options.map((o) => [o.id, o.label]));
  return optionIds.map((id) => map.get(id) ?? id.toUpperCase());
}

export function formatCompoundLabels(labels: string[], separator = ' + '): string {
  return labels.filter(Boolean).join(separator);
}

/** Migrate legacy scalar single-value multi-mode answers (already arrays of one). */
export function normalizeLoreAnswersRecord(
  answers: Record<string, string | string[]>,
): Record<string, string | string[]> {
  const out: Record<string, string | string[]> = { ...answers };
  for (const [questionId, raw] of Object.entries(answers)) {
    const step = getLoreQuestion(questionId);
    if (!step) continue;
    out[questionId] = serializeLoreAnswer(step, raw);
  }
  return out;
}

export function loreAnswersMateriallyChanged(
  before: Record<string, string | string[]>,
  after: Record<string, string | string[]>,
  questionId: string,
): boolean {
  const a = before[questionId];
  const b = after[questionId];
  return JSON.stringify(a ?? null) !== JSON.stringify(b ?? null);
}
