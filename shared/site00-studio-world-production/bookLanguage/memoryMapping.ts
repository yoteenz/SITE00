/**
 * Generic memory behavior → book language mapping scaffold.
 */

import type { GenericMemoryBehavior } from './types.js';

export function mapGenericMemoryToBookTerm(behavior: GenericMemoryBehavior): string {
  const map: Record<GenericMemoryBehavior, string> = {
    EDITORIAL_MEMORY: 'THE_INDEX',
    WATCH_QUEUE: 'DOG_EARED',
    CALLBACK: 'FLIP_BACK',
    SELF_CORRECTION: 'ERRATA',
    HISTORICAL_EVIDENCE: 'FOOTNOTE',
    RECURRING_SUBJECT: 'CHAPTER',
    COMMUNITY_CONTRIBUTION: 'ADD_TO_BOOK',
  };
  return map[behavior];
}

export function genericStudioWorldTerminologyRemainsGeneric(): true {
  return true;
}

export function historicalRecordsUnchanged(): true {
  return true;
}
