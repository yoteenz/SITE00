/** F16 record metadata (DD.DOCUMENTS). No verification claims. */

import type { CalendarDate } from './dates';

export type RecordType = 'STATEMENT' | 'RECEIPT' | 'INVOICE' | 'PAYSTUB' | 'TAX' | 'OTHER';

export type RecordStatus = 'READY' | 'PROCESSING' | 'FAILED' | 'ARCHIVED';

export type JurnlRecord = {
  record_id: string;
  title: string;
  record_type: RecordType;
  file_ref: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  source: 'DEVICE_METADATA';
  document_date: CalendarDate | null;
  linked_domain_type: string | null;
  linked_domain_id: string | null;
  tags: string[];
  status: RecordStatus;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
};
