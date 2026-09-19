/**
 * Sprint B2 — chapter-level repetition QA across active entries.
 */

import type {
  ChapterRepetitionQAResult,
  EntryChapterArgumentMapping,
  RepetitionMechanismMatch,
} from '../../../shared/site00-expression-engine/chapterGrammarTypes.js';

const MECHANISM_KEYS = [
  'contradictionMechanism',
  'worldMechanism',
  'artifactClass',
  'interjectionDevice',
  'compositionGrammar',
  'motionGrammar',
] as const;

type MechanismKey = (typeof MECHANISM_KEYS)[number];

function mechanismLabel(key: MechanismKey): string {
  return key.replace(/([A-Z])/g, ' $1').trim().toUpperCase();
}

function groupByMechanism(
  mappings: EntryChapterArgumentMapping[],
  key: MechanismKey,
): Map<string, string[]> {
  const groups = new Map<string, string[]>();
  for (const m of mappings) {
    const value = m.expressionMechanisms[key];
    const list = groups.get(value) ?? [];
    list.push(m.entryId);
    groups.set(value, list);
  }
  return groups;
}

export function runChapterRepetitionQA(input: {
  chapterId: string;
  mappings: EntryChapterArgumentMapping[];
  founderApprovedMechanisms?: string[];
}): ChapterRepetitionQAResult {
  const { chapterId, mappings, founderApprovedMechanisms = [] } = input;
  const matches: RepetitionMechanismMatch[] = [];
  const comparisons: ChapterRepetitionQAResult['comparisons'] = [];
  const notes: string[] = [];

  for (let i = 0; i < mappings.length; i++) {
    for (let j = i + 1; j < mappings.length; j++) {
      const a = mappings[i];
      const b = mappings[j];
      const shared: string[] = [];
      for (const key of MECHANISM_KEYS) {
        if (a.expressionMechanisms[key] === b.expressionMechanisms[key]) {
          shared.push(mechanismLabel(key));
        }
      }
      comparisons.push({ entryA: a.entryId, entryB: b.entryId, sharedMechanisms: shared });
    }
  }

  for (const key of MECHANISM_KEYS) {
    const groups = groupByMechanism(mappings, key);
    for (const [value, entryIds] of groups) {
      if (entryIds.length >= 3) {
        const label = `${mechanismLabel(key)}:${value}`;
        const approved = founderApprovedMechanisms.includes(label);
        matches.push({
          mechanism: label,
          entryIds,
          severity: approved ? 'WARN' : 'BLOCK',
          requiresFounderApproval: !approved,
        });
      } else if (entryIds.length === 2) {
        notes.push(`${mechanismLabel(key)} shared by 2 entries (${entryIds.join(', ')}) — WARN only`);
      }
    }
  }

  const blocking = matches.some((m) => m.severity === 'BLOCK' && m.requiresFounderApproval);

  if (mappings.length < 3) {
    notes.push('Fewer than 3 active entries — repetition BLOCK threshold not reached');
  }

  return {
    chapterId,
    passed: !blocking,
    blocking,
    matches,
    comparisons,
    notes,
  };
}

export function entryPairRepetitionSummary(
  mappings: EntryChapterArgumentMapping[],
): { entryA: string; entryB: string; result: string } | null {
  if (mappings.length !== 2) return null;
  const qa = runChapterRepetitionQA({ chapterId: mappings[0].chapterId, mappings });
  const shared = qa.comparisons[0]?.sharedMechanisms ?? [];
  return {
    entryA: mappings[0].entryId,
    entryB: mappings[1].entryId,
    result: shared.length === 0 ? 'DISTINCT EXPRESSION MECHANISMS — PASS' : `SHARED: ${shared.join(', ')} — PASS (2 entries, no block)`,
  };
}
