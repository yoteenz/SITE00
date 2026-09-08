/**
 * C1.1 — Build creative director runtime context from minimal brief + lineage.
 */

import {
  buildEntry001ChapterMapping,
  buildEntry002ChapterMapping,
} from '../chapterEntryMappings.js';
import type { MinimalCreativeBrief, PriorEntryLineageEntry } from '../../../../shared/site00-expression-engine/creative-director/types.js';
import { CHAPTER_01_ID } from '../chapter01Canon.js';
import { NDXBOOK_PROOF_BRAND_ID } from '../../../../shared/site00-expression-engine/constants.js';

export function buildPriorEntryLineage(): PriorEntryLineageEntry[] {
  const e1 = buildEntry001ChapterMapping();
  const e2 = buildEntry002ChapterMapping();
  return [
    {
      entryId: 'entry-001',
      title: 'WHO TF IS WE?',
      subject: e1.subject,
      coreContradiction: e1.contradiction,
      world: e1.world,
      artifact: e1.artifact,
      interjectionDevice: e1.interjectionDevice,
      surfaceMechanismsToAvoid: [
        'broadcast interruption',
        'vintage television',
        'celebrity rehabilitation montage',
        'media complicity explainer',
      ],
    },
    {
      entryId: 'entry-002',
      title: 'OH, NOW IT WAS FUN?',
      subject: e2.subject,
      coreContradiction: e2.contradiction,
      world: e2.world,
      artifact: e2.artifact,
      interjectionDevice: e2.interjectionDevice,
      surfaceMechanismsToAvoid: [
        'phone portal',
        'nostalgia edit suite',
        'same woman dual era',
        'archive scroll investigator',
        'temporal glitch snap-back',
        '2016 fashion nostalgia',
      ],
    },
  ];
}

export function buildMinimalCreativeBriefFromRequest(body: {
  entryId?: string;
  subject?: string;
  topic?: string;
  thesis?: string;
}): MinimalCreativeBrief {
  return {
    brandId: NDXBOOK_PROOF_BRAND_ID,
    entryId: body.entryId ?? 'entry-c1-blind',
    chapterId: CHAPTER_01_ID,
    subject: body.subject ?? 'CORPORATE WELLNESS / REST-AS-CONTENT CULTURE',
    topic: body.topic ?? 'Hustle posting vs actual recovery metrics',
    thesis: body.thesis ?? 'WHEN REST IS MARKETED LIKE A PRODUCT BUT OVERWORK STILL WINS THE RECEIPTS',
    chapterArgumentGrammar: ['CLAIM', 'RECEIPT', 'CONTRADICTION', 'LENS', 'INTERJECTION', 'SYNTHESIS'],
    brandTruth: 'NDXBOOK documents cultural contradictions with receipts — not trend commentary.',
    brandPersonality: 'Sharp, observational, receipt-first, anti-generic wellness optimism.',
    founderCreativeAppetite: 'BOLD',
    priorEntryLineage: buildPriorEntryLineage(),
  };
}

export function assertBriefDoesNotRequireOutputs(brief: MinimalCreativeBrief): void {
  const forbidden = ['world', 'artifact', 'ndxRole', 'storyOrder', 'interjection', 'visualAuthority'];
  for (const key of forbidden) {
    if (key in brief && (brief as Record<string, unknown>)[key]) {
      throw new Error(`Minimal brief must not include output field: ${key}`);
    }
  }
}
