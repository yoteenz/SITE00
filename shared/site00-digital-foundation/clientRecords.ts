import type { ClientDigitalFoundationPayload } from './clientProjection.js';
import type { OwnershipRecord } from './types.js';

export type ClientRecordCategory = 'ALL' | 'DOMAIN' | 'EMAIL' | 'SECURITY' | 'PAYMENTS' | 'PROJECT';

export type ClientRecordRow = {
  id: string;
  category: Exclude<ClientRecordCategory, 'ALL'>;
  title: string;
  status: string;
  date: string | null;
  summary: string;
};

function paymentRecord(payload: ClientDigitalFoundationPayload): ClientRecordRow | null {
  if (payload.artifact.payment_state !== 'PAID') return null;
  const q = payload.quote;
  return {
    id: 'payment-foundation',
    category: 'PAYMENTS',
    title: 'FOUNDATION PAYMENT',
    status: 'VERIFIED',
    date: payload.acceptance?.accepted_at ?? null,
    summary: q ? `QUOTE V${q.quote_version} ACCEPTED` : 'PAYMENT RECORDED',
  };
}

function ownershipRows(o: OwnershipRecord): ClientRecordRow[] {
  const rows: ClientRecordRow[] = [];
  if (o.domain) {
    rows.push({
      id: 'record-domain',
      category: 'DOMAIN',
      title: o.domain.toUpperCase(),
      status: (o.dns_status ?? 'ACTIVE').replace(/_/g, ' ').toUpperCase(),
      date: o.renewal_date,
      summary: o.registrar ? `REGISTRAR: ${o.registrar.toUpperCase()}` : 'DOMAIN OWNERSHIP',
    });
  }
  if (o.primary_mailbox) {
    rows.push({
      id: 'record-email',
      category: 'EMAIL',
      title: o.primary_mailbox,
      status: 'ACTIVE',
      date: null,
      summary: o.email_provider ? `PROVIDER: ${o.email_provider.toUpperCase()}` : 'PROFESSIONAL EMAIL',
    });
  }
  if (o.security_status || o.dns_status) {
    rows.push({
      id: 'record-security',
      category: 'SECURITY',
      title: 'EMAIL + DNS SECURITY',
      status: (o.security_status ?? o.dns_status ?? 'IN PROGRESS').replace(/_/g, ' ').toUpperCase(),
      date: null,
      summary: 'AUTHENTICATION AND SECURITY CONFIGURATION',
    });
  }
  return rows;
}

/** Client-safe record index — no fabricated documents. */
export function buildClientRecords(payload: ClientDigitalFoundationPayload): ClientRecordRow[] {
  const rows: ClientRecordRow[] = [];
  const pay = paymentRecord(payload);
  if (pay) rows.push(pay);
  if (payload.ownership_record) rows.push(...ownershipRows(payload.ownership_record));
  if (payload.stages.length) {
    rows.push({
      id: 'record-project-plan',
      category: 'PROJECT',
      title: 'FOUNDATION PROJECT PLAN',
      status: payload.artifact.completion_state === 'COMPLETE' ? 'COMPLETE' : 'IN PROGRESS',
      date: null,
      summary: `${payload.stages.filter((s) => s.status === 'COMPLETE').length} OF ${payload.stages.length} STAGES COMPLETE`,
    });
  }
  return rows;
}
