/**
 * Founder-facing review zones — four buckets for gallery + top pills (reduces mount churn vs 11 micro-groups).
 */
import type { DfReviewEntry, DfReviewGroupId } from './digitalFoundationReviewRegistry';
import { REVIEW_GROUP_ORDER, allReviewRegistryEntries, resolveReviewEntry } from './digitalFoundationReviewRegistry';

export type DfReviewZoneId = 'INTAKE' | 'BUILDER' | 'CLIENT' | 'FOUNDER';

export const REVIEW_ZONE_ORDER: DfReviewZoneId[] = ['INTAKE', 'BUILDER', 'CLIENT', 'FOUNDER'];

export const REVIEW_ZONE_LABELS: Record<DfReviewZoneId, string> = {
  INTAKE: 'Foundation intake',
  BUILDER: 'Builder',
  CLIENT: 'Client queue & portal',
  FOUNDER: 'Founder dashboard',
};

const GROUP_TO_ZONE: Record<DfReviewGroupId, DfReviewZoneId> = {
  INTAKE: 'INTAKE',
  FOUNDATION_BUILDER: 'BUILDER',
  POST_INTAKE: 'CLIENT',
  PROPOSAL_CHECKOUT: 'INTAKE',
  CLIENT_PORTAL: 'CLIENT',
  CLIENT_ACCESS: 'CLIENT',
  FOUNDER_WORKSPACE: 'FOUNDER',
  FOUNDER_REVIEW_QUEUE: 'FOUNDER',
  FOUNDER_OPERATIONS: 'FOUNDER',
  FOUNDER_OVERLAYS: 'FOUNDER',
  DEPRECATED: 'BUILDER',
};

export function reviewZoneForGroup(group: DfReviewGroupId): DfReviewZoneId {
  return GROUP_TO_ZONE[group];
}

export function reviewZoneForEntry(entry: DfReviewEntry): DfReviewZoneId {
  return reviewZoneForGroup(entry.group);
}

export function galleryEntriesForZone(zone: DfReviewZoneId): DfReviewEntry[] {
  const seen = new Set<string>();
  const out: DfReviewEntry[] = [];
  for (const groupId of REVIEW_GROUP_ORDER) {
    if (reviewZoneForGroup(groupId) !== zone) continue;
    for (const entry of allReviewRegistryEntries()) {
      if (entry.group !== groupId) continue;
      if (seen.has(entry.anchorId)) continue;
      seen.add(entry.anchorId);
      out.push(entry);
    }
  }
  return out;
}

export function galleryEntriesForZoneFilter(zoneFilter: DfReviewZoneId): DfReviewEntry[] {
  return galleryEntriesForZone(zoneFilter);
}

export function zoneForAnchorId(anchorId: string): DfReviewZoneId | null {
  const entry = resolveReviewEntry(anchorId);
  return entry ? reviewZoneForEntry(entry) : null;
}

export function defaultAnchorForZone(zone: DfReviewZoneId): string {
  return galleryEntriesForZone(zone)[0]?.anchorId ?? '';
}
