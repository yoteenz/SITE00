/**
 * Sprint B3.1 — structured creative revision learning (B3 generated vs founder-refined).
 * Scope: CHAPTER 01 ONLY.
 */

import type { FounderCreativeRevisionLearning } from '../../../shared/site00-expression-engine/chapterCoverGrammarTypes.js';
import { CHAPTER_01_ID } from './chapter01Canon.js';
import { B3_GENERATED_ANCHOR_ASSET_ID } from './entry002B3FounderOverride.js';

const NOW = '2026-09-07T20:00:00.000Z';

export function buildEntry002CreativeRevisionLearning(): FounderCreativeRevisionLearning {
  return {
    revisionId: 'revision-entry-002-cover-b3-founder-override',
    chapterId: CHAPTER_01_ID,
    scope: 'CHAPTER_01_ONLY',
    supersededAssetId: B3_GENERATED_ANCHOR_ASSET_ID,
    authorityAssetId: null,
    failureTypes: ['ARTIFACT_HIERARCHY', 'CHAPTER_COHESION', 'TEXT_DISCIPLINE'],
    generatedProblem:
      'Environment + graphic composition overpowered hero artifact — cover read as edit-suite flyer rather than isolated object-first presentation.',
    founderCorrection:
      'Isolated single artifact on pure black field with lime glow and shared chapter hierarchy (title → artifact → entry number → subject).',
    entrySpecificChange: 'TV → PHONE (artifact class); circle/underline → asterisk/upward arrow (annotation language)',
    lesson:
      'CHAPTER COHESION LIVES IN PRESENTATION GRAMMAR, NOT REPEATED OBJECTS OR MARKS',
    recordedAt: NOW,
  };
}
