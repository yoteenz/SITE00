/**
 * C1.1 — Thin blind-test Entry brief (no founder connective tissue).
 */

import { CHAPTER_01_ID } from '../chapter01Canon.js';
import { NDXBOOK_PROOF_BRAND_ID } from '../../../../shared/site00-expression-engine/constants.js';
import type { MinimalCreativeBrief } from '../../../../shared/site00-expression-engine/creative-director/types.js';
import { buildPriorEntryLineage } from './creativeDirectorContextBuilder.js';

export const BLIND_TEST_ENTRY_ID = 'entry-c1-blind' as const;

export function buildBlindTestCreativeBrief(): MinimalCreativeBrief {
  return {
    brandId: NDXBOOK_PROOF_BRAND_ID,
    entryId: BLIND_TEST_ENTRY_ID,
    chapterId: CHAPTER_01_ID,
    subject: 'CORPORATE WELLNESS / REST-AS-CONTENT CULTURE',
    topic: 'Hustle posting vs actual recovery metrics',
    thesis: 'WHEN REST IS MARKETED LIKE A PRODUCT BUT OVERWORK STILL WINS THE RECEIPTS',
    chapterArgumentGrammar: ['CLAIM', 'RECEIPT', 'CONTRADICTION', 'LENS', 'INTERJECTION', 'SYNTHESIS'],
    brandTruth: 'NDXBOOK documents cultural contradictions with receipts — not trend commentary.',
    brandPersonality: 'Sharp, observational, receipt-first, anti-generic wellness optimism.',
    founderCreativeAppetite: 'BOLD',
    priorEntryLineage: buildPriorEntryLineage(),
    sourceMaterial: null,
    culturalReferences: ['quiet quitting discourse', 'corporate wellness programs', 'LinkedIn hustle posts'],
    formatTarget: 'REEL',
  };
}
