/**
 * P0.5E.2 — NdxBookCulturalLanguageSystem
 */

import {
  NDXBOOK_CULTURAL_LANGUAGE_SYSTEM_ID,
  NDX_CANONICAL_BOOK_TERMS,
} from './constants.js';
import type { NdxBookCulturalLanguageSystem, NdxCanonicalBookTerm } from './types.js';

export const NDX_BOOK_TERM_DEFINITIONS: Record<NdxCanonicalBookTerm, string> = {
  PAGE: 'The fundamental published NDX thought/artifact.',
  TURN_THE_PAGE: 'Continue the thought or sequence.',
  BOOKMARK: 'Save/remember something.',
  BOOKMARKED: 'NDX has intentionally retained something in cultural memory.',
  FLIP_BACK: 'Return to something previously observed/published.',
  DOG_EAR: 'Mark something unresolved or worth watching.',
  DOG_EARED: 'A developing subject NDX intends to revisit.',
  MARGIN_NOTE: 'Immediate, smaller, conversational observation.',
  FOOTNOTE: 'Supporting context, provenance, qualification, source, or secondary detail.',
  ERRATA: 'Correction or explicit self-correction.',
  CHAPTER: 'Recurring subject, editorial franchise, or sustained area of inquiry.',
  OPEN_CHAPTER: 'Subject still developing.',
  THE_INDEX: 'Accumulated NDX cultural/editorial memory.',
  ADD_IT_TO_THE_BOOK: 'Audience/community submission behavior.',
  KEEP_READING: 'Follow/continue CTA where contextually appropriate.',
  BOOKMARK_THIS: 'Save CTA where contextually appropriate.',
  NEXT_PAGE: 'Continuation where useful.',
  PAGE_STILL_OPEN: 'Unresolved/developing thought.',
};

export function buildNdxBookCulturalLanguageSystem(projectId: string): NdxBookCulturalLanguageSystem {
  return {
    systemId: NDXBOOK_CULTURAL_LANGUAGE_SYSTEM_ID,
    projectId,
    canonicalTerms: [...NDX_CANONICAL_BOOK_TERMS],
    corePrinciple: 'THE_CAROUSEL_IS_THE_PAGE_THE_VIDEO_SHOWS_WHY_THE_PAGE_EXISTS',
  };
}

export function translateGenericTermToNdxPublic(genericTerm: string): string | null {
  const map: Record<string, string> = {
    WatchQueueEntry: 'DOG-EARED',
    EditorialMemoryMatch: 'FLIP BACK',
    SELF_CORRECTION: 'ERRATA',
    WATCH_QUEUE: 'DOG-EARED',
    CALLBACK: 'FLIP BACK',
    EDITORIAL_MEMORY: 'THE INDEX',
    COMMUNITY_CONTRIBUTION: 'ADD IT TO THE BOOK',
    SLIDE: 'PAGE',
    POST: 'PAGE',
    SERIES: 'CHAPTER',
    FOLLOW_UP: 'TURN THE PAGE',
    SOURCE: 'FOOTNOTE',
    SAVE: 'BOOKMARK',
  };
  return map[genericTerm] ?? null;
}

export function ndxPublicTerminologyUsesBookMetaphor(): true {
  return true;
}
