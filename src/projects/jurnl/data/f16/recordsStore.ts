import { useSyncExternalStore } from 'react';
import type { JurnlRecord, RecordType } from '../foundation/records';
import type { CalendarDate } from '../foundation/dates';
import { getRepository } from '../repository/deviceRepository';

let seq = 0;

export function useRecords(): JurnlRecord[] {
  return useSyncExternalStore((cb) => getRepository().subscribe(cb), () => listRecords(), () => []);
}

export function listRecords(query?: string): JurnlRecord[] {
  const all = getRepository().listRecords().filter((r) => r.status !== 'ARCHIVED');
  if (!query?.trim()) return all;
  const q = query.trim().toUpperCase();
  return all.filter((r) => r.title.includes(q) || r.record_type.includes(q));
}

export function recordById(id: string): JurnlRecord | null {
  return getRepository().listRecords().find((r) => r.record_id === id && r.status !== 'ARCHIVED') ?? null;
}

export function createRecord(input: {
  title: string;
  record_type: RecordType;
  document_date?: CalendarDate | null;
  linked_domain_type?: string | null;
  linked_domain_id?: string | null;
}): JurnlRecord {
  const now = new Date().toISOString();
  seq += 1;
  const record: JurnlRecord = {
    record_id: `rec-${seq}-${Date.now()}`,
    title: input.title.trim().toUpperCase(),
    record_type: input.record_type,
    file_ref: null,
    mime_type: null,
    size_bytes: null,
    source: 'DEVICE_METADATA',
    document_date: input.document_date ?? null,
    linked_domain_type: input.linked_domain_type ?? null,
    linked_domain_id: input.linked_domain_id ?? null,
    tags: [],
    status: 'READY',
    created_at: now,
    updated_at: now,
    archived_at: null,
  };
  return getRepository().upsertRecord(record);
}

export function updateRecord(record: JurnlRecord): JurnlRecord {
  return getRepository().upsertRecord(record);
}

export function archiveRecord(id: string): boolean {
  return getRepository().deleteRecord(id);
}
