/**
 * C1.3 — Chapter story map builder.
 */

import type {
  ChapterStoryMap,
  Entry004TeaseSeed,
} from '../../../../shared/site00-expression-engine/chapter-continuity/types.js';
import { CHAPTER_01_ID } from '../chapter01Canon.js';
import {
  buildNdxbookEntry002To003HandoffOptions,
  selectEntry002To003Handoff,
} from '../campaignNarrative/ndxbookCampaignNarrativeAdapter.js';
import type { DirectorialConcept } from '../../../../shared/site00-expression-engine/chapter-continuity/types.js';
import { buildEntry001ChapterMapping, buildEntry002ChapterMapping } from '../chapterEntryMappings.js';

export function buildEntry004TeaseSeed(winningConcept: DirectorialConcept): Entry004TeaseSeed {
  return {
    seedType: 'NOTIFICATION',
    seedObject: 'Wellness app reminder',
    seedQuestion: 'If healing language is everywhere, why do the behavior receipts still contradict it?',
    seedVisual: 'Calendar block: "MINDFUL MORNING" over conflicting behavior thumbnail',
    seedLine: 'YOU SCHEDULED PEACE. THE RECEIPTS DIDN\'T GET THE INVITE.',
    whyItExtendsChapter: 'Moves from invisible beauty labor to invisible emotional labor — therapy-speak vs behavior',
    constraints: ['nonCanon=true', 'Do not develop Entry 004', 'Seed only'],
    nonCanon: true,
  };
}

export function buildChapter01StoryMap(args: {
  entry003Title: string;
  entry003Question: string;
  entry003Contradiction: string;
  entry003World: string;
  entry003Artifact: string;
  entry003NdxRole: string;
  entry003Ending: string;
  entry003Handoff: string;
  entry004Seed: Entry004TeaseSeed;
}): ChapterStoryMap {
  const e1 = buildEntry001ChapterMapping();
  const e2 = buildEntry002ChapterMapping();
  const handoff = selectEntry002To003Handoff(buildNdxbookEntry002To003HandoffOptions());

  return {
    chapterId: CHAPTER_01_ID,
    chapterTitle: 'CHAPTER 01 — CULTURAL CONTRADICTION GRAMMAR',
    seriesContinuityStrength: 'STRONG',
    escalationSummary: 'Collective complicity → cultural revision → personal invisible labor',
    nodes: [
      {
        entryId: 'entry-001',
        title: 'WHO TF IS WE?',
        question: e1.contradiction,
        contradiction: e1.contradiction,
        world: e1.world,
        artifact: e1.artifact,
        ndxRole: 'INTERRUPTOR',
        ending: 'Media/public memory unresolved — TV shutoff',
        handoff: '↓ TV shutoff → phone era',
      },
      {
        entryId: 'entry-002',
        title: 'OH, NOW IT WAS FUN?',
        question: e2.contradiction,
        contradiction: e2.contradiction,
        world: e2.world,
        artifact: e2.artifact,
        ndxRole: 'ARCHIVIST / OBSERVER',
        ending: 'Phone crack / glitch / snap-back',
        handoff: `↓ ${handoff.handoffLine}`,
      },
      {
        entryId: 'entry-003',
        title: args.entry003Title,
        question: args.entry003Question,
        contradiction: args.entry003Contradiction,
        world: args.entry003World,
        artifact: args.entry003Artifact,
        ndxRole: args.entry003NdxRole,
        ending: args.entry003Ending,
        handoff: args.entry003Handoff,
        nonCanon: true,
      },
      {
        entryId: 'entry-004',
        title: 'UNKNOWN / SEED ONLY',
        question: args.entry004Seed.seedQuestion,
        contradiction: 'Therapy-speak vs behavioral receipts (seed)',
        world: 'TBD',
        artifact: args.entry004Seed.seedObject,
        ndxRole: 'TBD',
        ending: 'TBD',
        handoff: '↓ campaign continues',
        nonCanon: true,
      },
    ],
  };
}

export function evaluateSeriesContinuityStrength(
  handoffStrength: 'WEAK' | 'MODERATE' | 'STRONG',
  escalationLevel: number,
): 'WEAK' | 'MODERATE' | 'STRONG' {
  if (handoffStrength === 'STRONG' && escalationLevel >= 2) return 'STRONG';
  if (handoffStrength === 'MODERATE' || escalationLevel >= 1) return 'MODERATE';
  return 'WEAK';
}
