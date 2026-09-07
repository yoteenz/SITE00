/**
 * Sprint B2 — Chapter 01 canon: WHICH ONE IS IT?
 */

import {
  CHAPTER_ARGUMENT_BEATS,
  type ChapterArgumentGrammar,
  type CreativeChapter,
} from '../../../shared/site00-expression-engine/chapterGrammarTypes.js';
import {
  NDXBOOK_PROOF_BRAND_ID,
  NDXBOOK_PROOF_PROJECT_KEY,
} from '../../../shared/site00-expression-engine/constants.js';

export const CHAPTER_01_ID = 'ndxbook-chapter-01';
export const CHAPTER_01_GRAMMAR_ID = 'grammar-ndxbook-chapter-01';

const NOW = '2026-09-07T18:00:00.000Z';

export function buildChapter01ArgumentGrammar(): ChapterArgumentGrammar {
  return {
    grammarId: CHAPTER_01_GRAMMAR_ID,
    chapterId: CHAPTER_01_ID,
    brandId: NDXBOOK_PROOF_BRAND_ID,
    projectId: NDXBOOK_PROOF_PROJECT_KEY,
    chapterNumber: 1,
    chapterTitle: 'WHICH ONE IS IT?',
    status: 'LOCKED',
    coreQuestion:
      'WHAT HAPPENS WHEN CULTURE HOLDS TWO POSITIONS THAT CANNOT BOTH SURVIVE THE RECEIPTS?',
    argumentSequence: [...CHAPTER_ARGUMENT_BEATS],
    sequenceDefinitions: [
      {
        beat: 'CLAIM',
        definition:
          'THE STATEMENT, ASSUMPTION, OR CURRENT CULTURAL POSITION BEING PRESENTED.',
      },
      {
        beat: 'RECEIPT',
        definition:
          'THE PRIOR BEHAVIOR, LANGUAGE, EVIDENCE, ARTIFACT, ARCHIVE, OR CULTURAL RECORD THAT TESTS THE CLAIM.',
      },
      {
        beat: 'CONTRADICTION',
        definition: 'THE POINT WHERE THE CLAIM AND THE RECEIPT STOP COHERING.',
      },
      {
        beat: 'LENS',
        definition:
          'THE SPECIFIC INTERPRETIVE FRAME THROUGH WHICH THE CONTRADICTION IS EXAMINED.',
        examples: [
          'MEDIA COMPLICITY',
          'NOSTALGIA',
          'CLASS',
          'GENDER',
          'TECHNOLOGY',
          'STATUS',
          'AESTHETICS',
          'PRIVACY',
          'AUTHENTICITY',
          'ACCESS',
        ],
      },
      {
        beat: 'INTERJECTION',
        definition:
          'THE DISTINCT NDX RESPONSE TO THE CONTRADICTION — CONCISE, OBSERVATIONAL, ENTRY-SPECIFIC.',
      },
      {
        beat: 'SYNTHESIS',
        definition:
          'THE DEEPER CULTURAL POINT THAT EXPANDS THE ENTRY BEYOND THE ORIGINAL SUBJECT.',
      },
    ],
    recurringEditorialBehavior:
      'SOMEONE / CULTURE STATES SOMETHING → NDX TESTS IT AGAINST THE RECORD → THE CONTRADICTION SURFACES → THE ENTRY EXPLORES WHY → NDX INTERJECTS → THE ENTRY ENDS ON THE DEEPER THING THE ORIGINAL CLAIM DID NOT ACCOUNT FOR',
    interjectionBehavior:
      'CONCISE, OBSERVATIONAL, ENTRY-SPECIFIC. MAY APPEAR THROUGH TV, PHONE, MARGIN NOTE, VOICE, OBJECT, TEXT MESSAGE, SCREEN, LABEL, ANNOTATION, OR PHYSICAL ARTIFACT — NOT ONE FORCED DEVICE ACROSS THE CHAPTER.',
    receiptBehavior:
      'RECEIPTS MUST TEST THE CLAIM WITH PRIOR RECORD — BEHAVIOR, LANGUAGE, ARTIFACT, ARCHIVE, OR CULTURAL EVIDENCE.',
    synthesisBehavior:
      'SYNTHESIS EXPANDS BEYOND THE ORIGINAL SUBJECT — THE DEEPER CULTURAL MECHANISM THE CLAIM DID NOT ACCOUNT FOR.',
    allowedVariations: [
      'subject',
      'cultural lens',
      'world',
      'artifact',
      'visual grammar',
      'materials',
      'composition',
      'narrative device',
      'motion language',
      'audio language',
      'interjection device',
    ],
    prohibitedRepetition: [
      'television in every entry',
      'phone in every entry',
      'comment UI in every entry',
      'torn paper in every entry',
      'lime collage in every entry',
      'identical title cards',
      'identical carousel composition',
      'identical reel arcs',
      'identical interjection wording',
      'identical artifact classes',
      'identical world mechanics',
    ],
    artifactRules: [
      'ARTIFACT REMAINS ENTRY-SPECIFIC — NOT A CHAPTER TEMPLATE',
      'ARTIFACT CLASS MAY VARY ACROSS ENTRIES IN THE SAME CHAPTER',
    ],
    worldRules: [
      'WORLD REMAINS ENTRY-SPECIFIC — NOT A CHAPTER TEMPLATE',
      'WORLD MECHANISM MAY VARY ACROSS ENTRIES IN THE SAME CHAPTER',
      'INTERJECTION DEVICE IS NOT THE WORLD',
    ],
    formatTranslationRules: [
      'SAME ARGUMENT GRAMMAR ≠ SAME FORMAT STRUCTURE',
      'EACH FORMAT TRANSLATES BEATS NATIVELY — NOT COPY-PASTE ACROSS FORMATS',
    ],
    entryRequirements: [
      'entry belongs to chapter',
      'claim explicit',
      'receipt exists',
      'contradiction explicit',
      'lens exists',
      'interjection exists',
      'synthesis exists',
      'world entry-specific',
      'artifact entry-specific',
      'no forced chapter-level visual template',
    ],
    canonState: 'CANON',
    founderJudgment: 'LOVE_IT',
    createdAt: NOW,
    updatedAt: NOW,
  };
}

export function buildChapter01Record(): CreativeChapter {
  return {
    chapterId: CHAPTER_01_ID,
    brandId: NDXBOOK_PROOF_BRAND_ID,
    projectId: NDXBOOK_PROOF_PROJECT_KEY,
    chapterNumber: 1,
    chapterTitle: 'WHICH ONE IS IT?',
    grammarId: CHAPTER_01_GRAMMAR_ID,
    entryIds: ['entry-001', 'entry-002'],
    status: 'LOCKED',
    canonState: 'CANON',
    founderJudgment: 'LOVE_IT',
    createdAt: NOW,
    updatedAt: NOW,
  };
}
