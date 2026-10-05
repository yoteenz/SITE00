import { describe, it, expect, beforeEach } from 'vitest';
import {
  bootstrapB1Phase1,
  bootstrapB1Phase2,
  bootstrapB2ChapterSystem,
} from '../api/_lib/site00ExpressionEngine/expressionEngineService.js';
import { buildChapter01ArgumentGrammar } from '../api/_lib/site00ExpressionEngine/chapter01Canon.js';
import {
  buildEntry001ChapterMapping,
  buildEntry002ChapterMapping,
  buildAlternateGrammarFixtureSequence,
} from '../api/_lib/site00ExpressionEngine/chapterEntryMappings.js';
import {
  formatTranslationDiffersAcrossFormats,
  buildChapter01FormatTranslationMap,
} from '../api/_lib/site00ExpressionEngine/chapterFormatTranslation.js';
import { runChapterRepetitionQA } from '../api/_lib/site00ExpressionEngine/chapterRepetitionQA.js';
import { resetChapterStore } from '../api/_lib/site00ExpressionEngine/chapterStore.js';
import { resetExpressionEntryStore } from '../api/_lib/site00ExpressionEngine/entryStore.js';
import { resetExpressionEngineMemoryStore, genericEngineHasNoNdxbookDefault } from '../api/_lib/site00ExpressionEngine/projectScope.js';
import type { EntryChapterArgumentMapping } from '../shared/site00-expression-engine/chapterGrammarTypes.js';

process.env.EXPRESSION_ENGINE_MEMORY_STORE = '1';

function cloneMapping(m: EntryChapterArgumentMapping): EntryChapterArgumentMapping {
  return {
    ...m,
    expressionMechanisms: { ...m.expressionMechanisms },
    argumentBeats: [...m.argumentBeats],
  };
}

describe('Expression Engine Sprint B2 — Chapter Argument Grammar', () => {
  beforeEach(() => {
    resetExpressionEntryStore();
    resetExpressionEngineMemoryStore();
    resetChapterStore();
  });

  it('ChapterArgumentGrammar is project + brand scoped', async () => {
    const b2 = await bootstrapB2ChapterSystem();
    expect(b2.scoped).toBe(true);
    expect(b2.grammar.brandId).toBe('ndxbook');
    expect(b2.grammar.projectId).toBe('ndxbook');
    expect(b2.chapter.brandId).toBe('ndxbook');
  });

  it('no generic NDXBOOK fallback', () => {
    expect(genericEngineHasNoNdxbookDefault()).toBe(true);
  });

  it('Chapter 01 grammar sequence is CLAIM→RECEIPT→CONTRADICTION→LENS→INTERJECTION→SYNTHESIS', () => {
    const grammar = buildChapter01ArgumentGrammar();
    expect(grammar.argumentSequence).toEqual([
      'CLAIM',
      'RECEIPT',
      'CONTRADICTION',
      'LENS',
      'INTERJECTION',
      'SYNTHESIS',
    ]);
    expect(grammar.chapterTitle).toBe('WHICH ONE IS IT?');
    expect(grammar.status).toBe('LOCKED');
  });

  it('ENTRY 001 validates against Chapter 01', async () => {
    const b2 = await bootstrapB2ChapterSystem();
    expect(b2.entries.entry001.validation.valid).toBe(true);
    expect(b2.entries.entry001.mapping.interjection).toBe('WHO TF IS WE?');
  });

  it('ENTRY 002 validates against Chapter 01', async () => {
    const b2 = await bootstrapB2ChapterSystem();
    expect(b2.entries.entry002.validation.valid).toBe(true);
    expect(b2.entries.entry002.mapping.world).toBe('THE NOSTALGIA EDIT SUITE');
  });

  it('ENTRY 001 and ENTRY 002 may use different worlds', () => {
    const e1 = buildEntry001ChapterMapping();
    const e2 = buildEntry002ChapterMapping();
    expect(e1.worldId).not.toBe(e2.worldId);
    expect(e1.world).toBe('BROADCAST INTERRUPTION');
    expect(e2.world).toBe('THE NOSTALGIA EDIT SUITE');
  });

  it('ENTRY 001 and ENTRY 002 may use different artifacts', () => {
    const e1 = buildEntry001ChapterMapping();
    const e2 = buildEntry002ChapterMapping();
    expect(e1.artifactId).not.toBe(e2.artifactId);
    expect(e1.artifact).toContain('TELEVISION');
    expect(e2.artifact).toContain('RAZOR');
  });

  it('ENTRY 001 and ENTRY 002 may use different interjection devices', () => {
    const e1 = buildEntry001ChapterMapping();
    const e2 = buildEntry002ChapterMapping();
    expect(e1.interjectionDevice).not.toBe(e2.interjectionDevice);
    expect(e2.interjectionDevice).toBe('PHONE');
  });

  it('chapter does not force identical format structures', () => {
    const map = buildChapter01FormatTranslationMap();
    expect(formatTranslationDiffersAcrossFormats(map)).toBe(true);
    expect(map.sameGrammarNotSameStructure).toBe(true);
  });

  it('three entries sharing one expression mechanism triggers repetition block', () => {
    const base = buildEntry001ChapterMapping();
    const m1 = cloneMapping(base);
    const m2 = cloneMapping({ ...buildEntry002ChapterMapping(), entryId: 'entry-002' });
    const m3 = cloneMapping({ ...base, entryId: 'entry-003', entryNumber: 3 });
    m2.expressionMechanisms.worldMechanism = m1.expressionMechanisms.worldMechanism;
    m3.expressionMechanisms.worldMechanism = m1.expressionMechanisms.worldMechanism;

    const qa = runChapterRepetitionQA({
      chapterId: 'ndxbook-chapter-01',
      mappings: [m1, m2, m3],
    });
    expect(qa.blocking).toBe(true);
    expect(qa.matches.some((m) => m.severity === 'BLOCK')).toBe(true);
  });

  it('two distinct entries do not trigger false collapse block', async () => {
    const b2 = await bootstrapB2ChapterSystem();
    expect(b2.repetitionQA.blocking).toBe(false);
    expect(b2.repetitionQA.passed).toBe(true);
    expect(b2.pairSummary?.result).toContain('PASS');
  });

  it('future fixture grammar can use a completely different argument sequence', () => {
    const fixture = buildAlternateGrammarFixtureSequence();
    const canon = buildChapter01ArgumentGrammar().argumentSequence;
    expect(fixture).not.toEqual(canon);
    expect(fixture[0]).toBe('OBSERVATION');
  });

  it('no Entry 002 asset generation occurs in this sprint', async () => {
    const b2 = await bootstrapB2ChapterSystem();
    expect(b2.assetsGeneratedEntry002).toBe(0);
    expect(b2.entries.entry002.assetsGenerated).toBe(0);
  });

  it('existing Expression Engine B1 tests remain compatible', async () => {
    const b1 = await bootstrapB1Phase1();
    const b1p2 = await bootstrapB1Phase2();
    expect(b1.entry001.title).toBe('WHO TF IS WE?');
    expect(b1p2.entry002.generationReceipts.length).toBe(0);
  });
});
