/**
 * Duplicate question prevention — search existing evidence before asking.
 */

import type { CharacterEvidenceInventory } from './evidenceInventory.js';
import type { BrandCharacterDeepeningAnswer, ExistingEvidenceSearchResult } from './types.js';
import { getQuestionById } from './questionLibrary.js';

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function tokenOverlap(a: string, b: string): number {
  const ta = new Set(normalize(a).split(' ').filter((w) => w.length > 3));
  const tb = new Set(normalize(b).split(' ').filter((w) => w.length > 3));
  if (ta.size === 0 || tb.size === 0) return 0;
  let overlap = 0;
  for (const t of ta) if (tb.has(t)) overlap++;
  return overlap / Math.max(ta.size, tb.size);
}

function allEvidenceTexts(inventory: CharacterEvidenceInventory, answers: BrandCharacterDeepeningAnswer[]): string[] {
  return [
    ...inventory.brandLore,
    ...inventory.brandPersonality,
    ...inventory.founderLanguage,
    ...inventory.humorWit,
    ...inventory.culturalReferences,
    ...inventory.socialInstinct,
    ...inventory.emotionalRange,
    ...inventory.hardBoundaries,
    ...answers.map((a) => a.rawAnswer),
    ...Object.values(inventory.rawPersonalityAnswers).flatMap((v) => (Array.isArray(v) ? v : [String(v)])),
  ];
}

export function findExistingEvidenceForCharacterQuestion(params: {
  questionId: string;
  inventory: CharacterEvidenceInventory;
  deepeningAnswers?: BrandCharacterDeepeningAnswer[];
}): {
  result: ExistingEvidenceSearchResult;
  matchedEvidence: string[];
} {
  const question = getQuestionById(params.questionId);
  if (!question) return { result: 'NO_RELEVANT_EVIDENCE', matchedEvidence: [] };

  const corpus = allEvidenceTexts(params.inventory, params.deepeningAnswers ?? []);
  const domainCorpus = corpus.filter(Boolean);
  if (domainCorpus.length === 0) return { result: 'NO_RELEVANT_EVIDENCE', matchedEvidence: [] };

  const promptKeywords = normalize(question.prompt);
  const matches = domainCorpus.filter((text) => tokenOverlap(text, promptKeywords) >= 0.35);

  if (matches.length >= 2) {
    const conflict = matches.some((m) => /never|not|avoid|unlike/i.test(m)) &&
      matches.some((m) => /always|must|should|love/i.test(m));
    if (conflict) return { result: 'CONFLICTING_ANSWER_EXISTS', matchedEvidence: matches.slice(0, 3) };
    return { result: 'ANSWER_ALREADY_EXISTS', matchedEvidence: matches.slice(0, 3) };
  }
  if (matches.length === 1) return { result: 'PARTIAL_ANSWER_EXISTS', matchedEvidence: matches };
  return { result: 'NO_RELEVANT_EVIDENCE', matchedEvidence: [] };
}

export function duplicateQuestionPrevented(result: ExistingEvidenceSearchResult): boolean {
  return result === 'ANSWER_ALREADY_EXISTS';
}
