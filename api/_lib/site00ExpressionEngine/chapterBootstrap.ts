/**
 * Sprint B2 — bootstrap chapter argument grammar system for NDXBOOK Chapter 01.
 */

import { buildChapter01FormatTranslationMap, formatTranslationDiffersAcrossFormats } from './chapterFormatTranslation.js';
import { buildChapter01ArgumentGrammar, buildChapter01Record, CHAPTER_01_ID } from './chapter01Canon.js';
import { validateEntryAgainstChapterGrammar } from './chapterGrammarValidation.js';
import { entryPairRepetitionSummary, runChapterRepetitionQA } from './chapterRepetitionQA.js';
import {
  assertChapterProjectBrandScoped,
  getChapterByNumber,
  getChapterGrammarForChapter,
  listEntriesForChapter,
  resetChapterStore,
  seedChapter01Canon,
} from './chapterStore.js';
import { closeEntry001Phase1 } from './entry001Close.js';
import { compileEntry002LockedEntry } from './entry002Blueprint.js';
import { saveEntry } from './entryStore.js';
import { evaluateEntryReadiness } from './entryReadiness.js';
import { genericEngineHasNoNdxbookDefault, resolveNdxbookProofContext } from './projectScope.js';
import { buildAlternateGrammarFixtureSequence } from './chapterEntryMappings.js';

export async function bootstrapB2ChapterSystem() {
  process.env.EXPRESSION_ENGINE_MEMORY_STORE = process.env.EXPRESSION_ENGINE_MEMORY_STORE ?? '1';

  resetChapterStore();
  const { chapter, grammar } = seedChapter01Canon();
  const brandContext = await resolveNdxbookProofContext();

  const entry001 = saveEntry(closeEntry001Phase1().entry);
  const entry002 = saveEntry(compileEntry002LockedEntry());

  const allMappings = listEntriesForChapter(CHAPTER_01_ID);
  const validation001 = validateEntryAgainstChapterGrammar({
    entry: entry001,
    mapping: allMappings[0],
    grammar,
    allMappings,
  });
  const validation002 = validateEntryAgainstChapterGrammar({
    entry: entry002,
    mapping: allMappings[1],
    grammar,
    allMappings,
  });

  const repetitionQA = runChapterRepetitionQA({ chapterId: CHAPTER_01_ID, mappings: allMappings });
  const pairSummary = entryPairRepetitionSummary(allMappings);
  const formatTranslation = buildChapter01FormatTranslationMap();

  return {
    brandContext,
    chapter,
    grammar,
    hierarchy: [
      'NDXBOOK',
      'CHAPTER',
      'ARGUMENT GRAMMAR',
      'ENTRY',
      'TOPIC / SUBJECT',
      'LENS',
      'WORLD',
      'ARTIFACT',
      'FORMAT EXPRESSION',
    ],
    entries: {
      entry001: {
        entry: entry001,
        mapping: allMappings[0],
        validation: validation001,
        readiness: evaluateEntryReadiness(entry001),
      },
      entry002: {
        entry: entry002,
        mapping: allMappings[1],
        validation: validation002,
        readiness: evaluateEntryReadiness(entry002),
        assetsGenerated: entry002.generationReceipts.length,
      },
    },
    repetitionQA,
    pairSummary,
    formatTranslation,
    formatTranslationDiffers: formatTranslationDiffersAcrossFormats(formatTranslation),
    alternateGrammarFixture: buildAlternateGrammarFixtureSequence(),
    scoped: assertChapterProjectBrandScoped(chapter, brandContext.brandId, brandContext.projectId),
    noGenericFallback: genericEngineHasNoNdxbookDefault(),
    assetsGeneratedEntry002: 0,
  };
}

export function getChapter01Snapshot() {
  seedChapter01Canon();
  return {
    chapter: getChapterByNumber('ndxbook', 'ndxbook', 1) ?? buildChapter01Record(),
    grammar: getChapterGrammarForChapter(CHAPTER_01_ID) ?? buildChapter01ArgumentGrammar(),
    mappings: listEntriesForChapter(CHAPTER_01_ID),
  };
}
