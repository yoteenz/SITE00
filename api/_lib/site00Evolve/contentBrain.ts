/** Content Brain integration — IDEA must not silently become CANON */

import { getContentBrainByOrgId } from './memoryStore.js';
import { orgIdFromSlug } from './seedFixtures.js';
import type { ContentBrainEntryClass } from './types.js';

export type ContentBrainEntry = {
  id: string;
  organization_id: string;
  entry_type: string;
  entry_class: ContentBrainEntryClass;
  title: string;
  content: Record<string, unknown>;
  approval_state: string;
};

export function listContentBrain(orgSlug: string, opts?: { entryClass?: ContentBrainEntryClass }): ContentBrainEntry[] {
  const orgId = orgIdFromSlug(orgSlug)!;
  let entries = getContentBrainByOrgId(orgId) as ContentBrainEntry[];
  if (opts?.entryClass) {
    entries = entries.filter((e) => e.entry_class === opts.entryClass);
  }
  return entries;
}

export function canPromoteToCanon(entry: ContentBrainEntry): boolean {
  return entry.entry_class !== 'IDEA' || entry.approval_state === 'APPROVED';
}

export function promoteEntryClass(
  orgSlug: string,
  entryId: string,
  targetClass: ContentBrainEntryClass,
): { ok: boolean; error?: string; entry?: ContentBrainEntry } {
  const orgId = orgIdFromSlug(orgSlug)!;
  const entries = getContentBrainByOrgId(orgId) as ContentBrainEntry[];
  const entry = entries.find((e) => e.id === entryId);
  if (!entry) return { ok: false, error: 'Entry not found' };

  if (targetClass === 'CANONICAL' && entry.entry_class === 'IDEA' && entry.approval_state !== 'APPROVED') {
    return { ok: false, error: 'IDEA cannot become CANON without explicit approval' };
  }

  entry.entry_class = targetClass;
  if (targetClass === 'CANONICAL') entry.approval_state = 'APPROVED';
  return { ok: true, entry };
}

export function marketingRetrievalSummary(orgSlug: string): {
  canonical: number;
  reference: number;
  ideas: number;
  insights: number;
  available: boolean;
} {
  const entries = listContentBrain(orgSlug);
  return {
    canonical: entries.filter((e) => e.entry_class === 'CANONICAL').length,
    reference: entries.filter((e) => e.entry_class === 'REFERENCE').length,
    ideas: entries.filter((e) => e.entry_class === 'IDEA').length,
    insights: entries.filter((e) => e.entry_class === 'INSIGHT' || e.entry_class === 'PERFORMANCE_LEARNING').length,
    available: entries.length > 0,
  };
}
