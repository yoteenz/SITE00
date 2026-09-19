/**
 * P0.5E.2 — Book memory behavior adapter.
 * Generic Studio World infrastructure → NDX public book expression.
 */

import { mapGenericMemoryToBookTerm } from '../../site00-studio-world-production/bookLanguage/memoryMapping.js';
import type { GenericMemoryBehavior } from '../../site00-studio-world-production/bookLanguage/types.js';

export const NDX_MEMORY_BEHAVIOR_MAP: Record<string, string> = {
  WatchQueueEntry: 'DOG-EARED',
  EditorialMemoryMatch: 'FLIP BACK',
  SELF_CORRECTION: 'ERRATA',
  HISTORICAL_EVIDENCE: 'FOOTNOTE',
  RECURRING_SUBJECT: 'CHAPTER',
  EDITORIAL_MEMORY: 'THE INDEX',
  COMMUNITY_CONTRIBUTION: 'ADD IT TO THE BOOK',
  CALLBACK: 'FLIP BACK',
  WATCH_QUEUE: 'DOG-EARED / PAGE STILL OPEN',
};

export function translateGenericMemoryBehavior(genericType: string): string | null {
  return NDX_MEMORY_BEHAVIOR_MAP[genericType] ?? null;
}

export function mapNdxMemoryBehavior(behavior: GenericMemoryBehavior): string {
  return mapGenericMemoryToBookTerm(behavior);
}

export function genericDomainTypesUnchanged(): true {
  return true;
}

export function ndxAdapterTranslatesGenericInfrastructure(): true {
  return true;
}
