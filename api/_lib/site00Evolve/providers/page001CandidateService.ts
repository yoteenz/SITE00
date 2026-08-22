/** Page 001 candidate — reference imported, not publication approved */

import { randomUUID } from 'node:crypto';
import { orgIdFromSlug } from '../orgRegistry.js';

export type Page001Candidate = {
  id: string;
  pageNumber: string;
  topic: string;
  volume: string;
  channel: string;
  contentState: 'DRAFT' | 'REFERENCE_IMPORTED';
  publicationApproval: 'NOT_APPROVED';
  visualApproval: 'NOT_APPROVED';
  scriptApproval: 'NOT_APPROVED';
  distribution: 'NOT_DISPATCHED';
  metadata: Record<string, unknown>;
};

const memPage001 = new Map<string, Page001Candidate>();

export function resetPage001Memory(): void {
  memPage001.clear();
}

export function getPage001Candidate(orgSlug: string): Page001Candidate | null {
  const orgId = orgIdFromSlug(orgSlug)!;
  return memPage001.get(orgId) ?? null;
}

export function upsertPage001Candidate(orgSlug: string, data: Partial<Page001Candidate>): Page001Candidate {
  const orgId = orgIdFromSlug(orgSlug)!;
  const existing = memPage001.get(orgId);
  const candidate: Page001Candidate = {
    id: existing?.id ?? randomUUID(),
    pageNumber: '001',
    topic: data.topic ?? existing?.topic ?? '',
    volume: data.volume ?? existing?.volume ?? 'MONEY',
    channel: data.channel ?? 'INSTAGRAM',
    contentState: 'REFERENCE_IMPORTED',
    publicationApproval: 'NOT_APPROVED',
    visualApproval: 'NOT_APPROVED',
    scriptApproval: 'NOT_APPROVED',
    distribution: 'NOT_DISPATCHED',
    metadata: {
      ...(existing?.metadata ?? {}),
      ...(data.metadata ?? {}),
      import_source: 'STUDIO_WORLD_HANDOFF',
      lineage: 'legacy recovery → founder confirmation → Page 001 candidate',
    },
  };
  memPage001.set(orgId, candidate);
  return candidate;
}
