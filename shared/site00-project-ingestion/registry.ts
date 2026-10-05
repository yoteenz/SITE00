/**
 * Ingested project registry. Projects register their records (data only — no styles, no components).
 * The host reads from here; nothing here reaches into a project's runtime.
 */

import type { IngestedProjectRecord } from './types.js';

const RECORDS = new Map<string, IngestedProjectRecord>();

export function registerIngestedProject(record: IngestedProjectRecord): IngestedProjectRecord {
  if (record.slug !== record.slug.toLowerCase()) throw new Error(`ingested project slug must be lowercase: ${record.slug}`);
  RECORDS.set(record.slug, record);
  return record;
}

export function getIngestedProject(slug: string | null | undefined): IngestedProjectRecord | null {
  if (!slug) return null;
  return RECORDS.get(slug.toLowerCase()) ?? null;
}

export function listIngestedProjects(): IngestedProjectRecord[] {
  return [...RECORDS.values()];
}

export function isPersonalFounderProject(slug: string): boolean {
  const p = getIngestedProject(slug);
  return !!p && p.projectType === 'PERSONAL' && p.ownership === 'FOUNDER';
}
