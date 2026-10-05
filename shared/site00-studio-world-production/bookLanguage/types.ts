/**
 * Generic Studio World — book language types.
 */

import type { BOOK_LANGUAGE_CONTEXTS, GENERIC_BOOK_TERMS, GENERIC_MEMORY_BEHAVIORS } from './constants.js';

export type GenericBookTerm = (typeof GENERIC_BOOK_TERMS)[number];
export type BookLanguageContext = (typeof BOOK_LANGUAGE_CONTEXTS)[number];
export type GenericMemoryBehavior = (typeof GENERIC_MEMORY_BEHAVIORS)[number];

export type BookLanguageContextEvaluation = {
  evaluationId: string;
  term: string;
  context: BookLanguageContext;
  appropriate: boolean;
  reason: string | null;
};

export type GenericContentOntologyNode = {
  nodeId: string;
  kind:
    | 'CONTENT_INTELLIGENCE'
    | 'PRIMARY_EVENT'
    | 'PAGE'
    | 'PAGE_SEQUENCE'
    | 'MARGIN_NOTE'
    | 'MOTION_EXPRESSION'
    | 'SPOKEN_EXPRESSION'
    | 'CHAPTER'
    | 'BOOKMARK'
    | 'DOG_EAR'
    | 'FOOTNOTE'
    | 'ERRATA'
    | 'CALLBACK'
    | 'INDEX_ENTRY'
    | 'COMMUNITY_CONTRIBUTION';
  parentId: string | null;
  fingerprint: string;
};

export type CrossSurfaceBookProgression = {
  progressionId: string;
  stages: string[];
  flexible: true;
  reuseThinkingNotPosts: true;
};
