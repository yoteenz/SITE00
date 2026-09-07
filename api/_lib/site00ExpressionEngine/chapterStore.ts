/**
 * Sprint B2 — chapter + grammar in-memory store (mirrors Supabase when persisted).
 */

import type {
  ChapterArgumentGrammar,
  CreativeChapter,
  EntryChapterArgumentMapping,
} from '../../../shared/site00-expression-engine/chapterGrammarTypes.js';
import { buildChapter01ArgumentGrammar, buildChapter01Record, CHAPTER_01_ID } from './chapter01Canon.js';
import {
  buildEntry001ChapterMapping,
  buildEntry002ChapterMapping,
  getChapterEntryMappings,
  getEntryChapterMapping,
} from './chapterEntryMappings.js';

const chapters = new Map<string, CreativeChapter>();
const grammars = new Map<string, ChapterArgumentGrammar>();
const entryMappings = new Map<string, EntryChapterArgumentMapping>();

export function resetChapterStore(): void {
  chapters.clear();
  grammars.clear();
  entryMappings.clear();
}

export function seedChapter01Canon(): {
  chapter: CreativeChapter;
  grammar: ChapterArgumentGrammar;
  mappings: EntryChapterArgumentMapping[];
} {
  const chapter = buildChapter01Record();
  const grammar = buildChapter01ArgumentGrammar();
  const mappings = [buildEntry001ChapterMapping(), buildEntry002ChapterMapping()];

  chapters.set(chapter.chapterId, chapter);
  grammars.set(grammar.grammarId, grammar);
  for (const m of mappings) {
    entryMappings.set(m.entryId, m);
  }

  return { chapter, grammar, mappings };
}

export function getChapter(chapterId: string): CreativeChapter | null {
  return chapters.get(chapterId) ?? null;
}

export function getChapterByNumber(
  brandId: string,
  projectId: string,
  chapterNumber: number,
): CreativeChapter | null {
  for (const ch of chapters.values()) {
    if (ch.brandId === brandId && ch.projectId === projectId && ch.chapterNumber === chapterNumber) {
      return ch;
    }
  }
  if (chapterNumber === 1 && brandId === 'ndxbook') {
    return seedChapter01Canon().chapter;
  }
  return null;
}

export function getChapterGrammar(grammarId: string): ChapterArgumentGrammar | null {
  return grammars.get(grammarId) ?? null;
}

export function getChapterGrammarForChapter(chapterId: string): ChapterArgumentGrammar | null {
  const chapter = getChapter(chapterId);
  if (!chapter) {
    if (chapterId === CHAPTER_01_ID) {
      return seedChapter01Canon().grammar;
    }
    return null;
  }
  return grammars.get(chapter.grammarId) ?? null;
}

export function listEntriesForChapter(chapterId: string): EntryChapterArgumentMapping[] {
  const stored = [...entryMappings.values()].filter((m) => m.chapterId === chapterId);
  if (stored.length) return stored;
  return getChapterEntryMappings(chapterId);
}

export function getStoredEntryMapping(entryId: string): EntryChapterArgumentMapping | null {
  return entryMappings.get(entryId) ?? null;
}

export function resolveEntryMapping(entryNumber: number): EntryChapterArgumentMapping | null {
  const id = `entry-${String(entryNumber).padStart(3, '0')}`;
  return entryMappings.get(id) ?? getEntryChapterMapping(entryNumber);
}

export function assertChapterProjectBrandScoped(
  chapter: CreativeChapter,
  expectedBrandId: string,
  expectedProjectId: string,
): boolean {
  return chapter.brandId === expectedBrandId && chapter.projectId === expectedProjectId;
}
