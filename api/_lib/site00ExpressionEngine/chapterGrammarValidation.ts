/**
 * Sprint B2 — validate entry against chapter argument grammar.
 */

import type {
  ChapterArgumentGrammar,
  ChapterGrammarValidationResult,
  EntryChapterArgumentMapping,
} from '../../../shared/site00-expression-engine/chapterGrammarTypes.js';
import type { CreativeEntry } from '../../../shared/site00-expression-engine/types.js';
import { getEntryChapterMapping } from './chapterEntryMappings.js';
import { runChapterRepetitionQA } from './chapterRepetitionQA.js';

function check(label: string, passed: boolean, detail?: string) {
  return { check: label, passed, detail };
}

export function validateEntryAgainstChapterGrammar(input: {
  entry: CreativeEntry;
  mapping: EntryChapterArgumentMapping;
  grammar: ChapterArgumentGrammar;
  allMappings: EntryChapterArgumentMapping[];
}): ChapterGrammarValidationResult {
  const { entry, mapping, grammar, allMappings } = input;
  const checks = [];
  const blockers: string[] = [];

  checks.push(
    check(
      'entry belongs to chapter',
      mapping.chapterId === grammar.chapterId && grammar.entryRequirements.includes('entry belongs to chapter'),
      mapping.chapterId,
    ),
  );

  checks.push(check('claim explicit', mapping.claim.trim().length > 0));
  checks.push(check('receipt exists', mapping.receipt.trim().length > 0));
  checks.push(check('contradiction explicit', mapping.contradiction.trim().length > 0));
  checks.push(check('lens exists', mapping.lens.trim().length > 0));
  checks.push(check('interjection exists', mapping.interjection.trim().length > 0));
  checks.push(check('synthesis exists', mapping.synthesis.trim().length > 0));

  checks.push(
    check(
      'world entry-specific',
      Boolean(mapping.worldId) && mapping.worldId === entry.worldExpressionId,
      `${mapping.worldId} vs ${entry.worldExpressionId ?? 'null'}`,
    ),
  );

  checks.push(
    check(
      'artifact entry-specific',
      Boolean(mapping.artifactId) && entry.artifact?.artifactId === mapping.artifactId,
      `${mapping.artifactId} vs ${entry.artifact?.artifactId ?? 'null'}`,
    ),
  );

  checks.push(
    check(
      'no forced chapter-level visual template',
      mapping.expressionMechanisms.compositionGrammar !== 'GENERIC_CHAPTER_TEMPLATE',
    ),
  );

  const requiredBeatsRepresented =
    grammar.argumentSequence.every((beat) => {
      const beatKey = beat.toLowerCase();
      return (
        mapping.argumentBeats.some((b) => b.label.toUpperCase().includes(beat)) ||
        (beatKey === 'claim' && mapping.claim) ||
        (beatKey === 'receipt' && mapping.receipt) ||
        (beatKey === 'contradiction' && mapping.contradiction) ||
        (beatKey === 'lens' && mapping.lens) ||
        (beatKey === 'interjection' && mapping.interjection) ||
        (beatKey === 'synthesis' && mapping.synthesis)
      );
    });

  checks.push(check('required argument beats represented', requiredBeatsRepresented));

  const repetition = runChapterRepetitionQA({
    chapterId: grammar.chapterId,
    mappings: allMappings,
  });

  checks.push(
    check(
      'repetition QA result',
      repetition.passed || !repetition.blocking,
      repetition.blocking ? repetition.matches.map((m) => m.mechanism).join(', ') : 'PASS',
    ),
  );

  for (const c of checks) {
    if (!c.passed) blockers.push(c.check);
  }

  return {
    entryId: entry.id,
    chapterId: grammar.chapterId,
    valid: blockers.length === 0,
    checks,
    blockers,
  };
}

export function validateEntryByNumber(
  entryNumber: number,
  entry: CreativeEntry,
  grammar: ChapterArgumentGrammar,
  allMappings: EntryChapterArgumentMapping[],
): ChapterGrammarValidationResult | null {
  const mapping = getEntryChapterMapping(entryNumber);
  if (!mapping) return null;
  return validateEntryAgainstChapterGrammar({ entry, mapping, grammar, allMappings });
}
