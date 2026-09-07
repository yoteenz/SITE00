/**
 * Sprint B2 — format-native translation of chapter argument grammar.
 */

import type {
  ChapterArgumentBeat,
  ChapterFormatTranslationMap,
  FormatArgumentTranslation,
} from '../../../shared/site00-expression-engine/chapterGrammarTypes.js';
import type { EntryFormat } from '../../../shared/site00-expression-engine/types.js';
import { CHAPTER_01_ID } from './chapter01Canon.js';

export function buildChapter01FormatTranslationMap(): ChapterFormatTranslationMap {
  const grammarSequence: ChapterArgumentBeat[] = [
    'CLAIM',
    'RECEIPT',
    'CONTRADICTION',
    'LENS',
    'INTERJECTION',
    'SYNTHESIS',
  ];

  const translations: FormatArgumentTranslation[] = [
    {
      format: 'REEL',
      beatFlow: ['CLAIM', 'RECEIPT', 'CONTRADICTION', 'INTERJECTION', 'SYNTHESIS'],
      behavior: 'CINEMATIC / TEMPORAL',
      nativeStructure: 'Arc-driven — claim surfaces through scene, receipt as broadcast/archive, contradiction as turn, interjection as title/thought beat, synthesis as closing frame',
    },
    {
      format: 'CAROUSEL',
      beatFlow: ['CLAIM', 'RECEIPT', 'CONTRADICTION', 'LENS', 'SYNTHESIS'],
      behavior: 'ARGUMENTATIVE / SEQUENTIAL',
      nativeStructure: 'Slide argument — each beat may occupy one or more slides; lens as interpretive frame slide',
    },
    {
      format: 'STORY',
      beatFlow: ['CLAIM', 'RECEIPT', 'INTERJECTION'],
      behavior: 'FAST / MARGINAL',
      nativeStructure: 'Margin annotation — claim or receipt hook, interjection as punchline margin',
    },
    {
      format: 'CTA_STORY',
      beatFlow: ['CONTRADICTION'],
      behavior: 'QUESTION DERIVED FROM CONTRADICTION',
      nativeStructure: 'Single question CTA derived from the contradiction — not full beat replay',
    },
    {
      format: 'TIKTOK',
      beatFlow: ['CONTRADICTION', 'RECEIPT', 'INTERJECTION', 'SYNTHESIS'],
      behavior: 'HOOK CONTRADICTION EARLY — NOT REEL REPOST',
      nativeStructure: 'Native re-edit — contradiction in first 2s, receipt as cultural evidence, not carousel repost',
    },
    {
      format: 'X',
      beatFlow: ['DROP', 'RECEIPT', 'CONTRADICTION', 'QUESTION', 'SYNTHESIS'],
      behavior: 'THREAD-NATIVE ARGUMENT',
      nativeStructure: 'DROP→RECEIPT→CONTRADICTION→QUESTION→SYNTHESIS — beats as thread posts, not reel transcript',
    },
  ];

  return {
    chapterId: CHAPTER_01_ID,
    grammarSequence,
    translations,
    sameGrammarNotSameStructure: true,
  };
}

export function formatTranslationDiffersAcrossFormats(map: ChapterFormatTranslationMap): boolean {
  const flows = map.translations.map((t) => t.beatFlow.join('→'));
  return new Set(flows).size === flows.length;
}

export function getFormatTranslation(
  map: ChapterFormatTranslationMap,
  format: EntryFormat,
): FormatArgumentTranslation | undefined {
  return map.translations.find((t) => t.format === format);
}
