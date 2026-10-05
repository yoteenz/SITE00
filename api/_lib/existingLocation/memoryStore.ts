import type {
  CaseAuditEvent,
  CourtesyRedemptionRecord,
  ExistingLocationCaseRecord,
  ExistingLocationQuote,
  ServiceCourtesyCodeRecord,
} from '../../../shared/site00-existing-location/types.js';

const cases = new Map<string, ExistingLocationCaseRecord>();
const quotes = new Map<string, ExistingLocationQuote>();
const events = new Map<string, CaseAuditEvent[]>();
const courtesyCodes = new Map<string, ServiceCourtesyCodeRecord>();
const redemptions = new Map<string, CourtesyRedemptionRecord>();

export function resetExistingLocationMemoryStore(): void {
  cases.clear();
  quotes.clear();
  events.clear();
  courtesyCodes.clear();
  redemptions.clear();
}

export function memListCases(): ExistingLocationCaseRecord[] {
  return [...cases.values()].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function memGetCase(id: string): ExistingLocationCaseRecord | undefined {
  return cases.get(id);
}

export function memSaveCase(record: ExistingLocationCaseRecord): void {
  cases.set(record.id, record);
}

export function memGetQuote(id: string): ExistingLocationQuote | undefined {
  return quotes.get(id);
}

export function memSaveQuote(quote: ExistingLocationQuote): void {
  quotes.set(quote.id, quote);
}

export function memAppendEvent(event: CaseAuditEvent): void {
  const list = events.get(event.case_id) ?? [];
  list.push(event);
  events.set(event.case_id, list);
}

export function memListEvents(caseId: string): CaseAuditEvent[] {
  return events.get(caseId) ?? [];
}

export function memSaveCourtesyCode(record: ServiceCourtesyCodeRecord): void {
  courtesyCodes.set(record.id, record);
}

export function memFindCourtesyByHash(hash: string): ServiceCourtesyCodeRecord | undefined {
  return [...courtesyCodes.values()].find((c) => c.code_hash === hash);
}

export function memListCourtesyCodes(): ServiceCourtesyCodeRecord[] {
  return [...courtesyCodes.values()];
}

export function memSaveRedemption(r: CourtesyRedemptionRecord): void {
  redemptions.set(r.id, r);
}
