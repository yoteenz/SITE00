/**
 * F05 DOT 01 — account histories and transaction search (authorities 07–10, 31). Reads the ledger only; the effect
 * of each entry on the place is the canonical accounting.entryEffect, and a leg that has not settled moves nothing
 * yet (#1706): it is listed with its state and no effect.
 */
import type { JurnlAccountRecord } from '../../foundation/accounts';
import { compareCalendarDates, getTodayKey, type CalendarDate } from '../../foundation/dates';
import type { LedgerEntry } from '../../home/moneyTypes';
import { accountNature, entryClass, entryDate, entryEffect, legSettlement, resolveEntryAccount } from '../../ledger/accounting';
import type { TxnClass } from '../../home/moneyTypes';
import { getRepository } from '../../repository/deviceRepository';

export type HistoryKind = 'SPENDING' | 'INCOME' | 'TRANSFER' | 'CARD PAYMENT' | 'ADJUSTMENT' | 'REFUND';
export type HistoryRow = {
  entry: LedgerEntry;
  id: string;
  account: JurnlAccountRecord | null;
  date: CalendarDate | null;
  label: string;
  category: string;
  kind: HistoryKind;
  cls: TxnClass;
  /** Effect on its place now (0 while the leg has not settled). Assets: + money in. Liabilities: + more owed. */
  effect: number;
  settled: boolean;
  state: string;
  linked: boolean;
  hasReceipt: boolean;
  corrected: boolean;
};

const KIND_OF: Record<string, HistoryKind> = {
  EXPENSE: 'SPENDING',
  CREDIT_PURCHASE: 'SPENDING',
  INCOME: 'INCOME',
  REFUND: 'REFUND',
  TRANSFER: 'TRANSFER',
  CREDIT_PAYMENT: 'CARD PAYMENT',
  DEBT_PAYMENT: 'CARD PAYMENT',
  ADJUSTMENT: 'ADJUSTMENT',
};
const STATE_WORD: Record<string, string> = { SETTLED: 'POSTED', PENDING: 'PENDING', SCHEDULED: 'SCHEDULED', FAILED: 'FAILED', CANCELLED: 'CANCELLED', NEEDS_RECONCILIATION: 'NEEDS CONFIRMATION' };

/**
 * A transfer or card-payment leg is titled with the other Pocket's name as it was when it was recorded
 * ("TRANSFER FROM BANK ACCOUNT", ledgerOps.buildTransfer). It is read with that Pocket's current name, by
 * `counterparty_account_id`, so a rename shows on every row; the stored entry is never rewritten. Any other title
 * (and a leg whose title was changed by hand) reads exactly as recorded. Display only: no amount or effect changes.
 */
const LEG_TITLE = /^(TRANSFER|PAYMENT) (TO|FROM) (.+)$/;
export function entryLabel(e: LedgerEntry, accounts: JurnlAccountRecord[]): string {
  const other = e.link && e.counterparty_account_id ? accounts.find((a) => a.account_id === e.counterparty_account_id) : null;
  const m = other ? LEG_TITLE.exec(e.merchant) : null;
  if (!other || !m || m[2] !== (e.link!.leg === 'OUT' ? 'TO' : 'FROM')) return e.merchant;
  return `${m[1]} ${m[2]} ${other.display_name}`;
}

export function historyRow(e: LedgerEntry, accounts: JurnlAccountRecord[], today: CalendarDate): HistoryRow {
  const account = resolveEntryAccount(e, accounts);
  const cls = entryClass(e, account);
  const settlement = legSettlement(e, today);
  const settled = settlement === 'SETTLED';
  const nature = account ? accountNature(account.account_type) : 'ASSET';
  return {
    entry: e,
    id: e.id,
    account,
    date: entryDate(e, today),
    label: entryLabel(e, accounts),
    category: e.category,
    kind: KIND_OF[cls] ?? 'SPENDING',
    cls,
    effect: settled ? entryEffect(e, nature) : 0,
    settled,
    state: STATE_WORD[settlement] ?? settlement,
    linked: !!e.link,
    hasReceipt: !!e.receipt,
    corrected: !!e.correction_history?.length,
  };
}

export type HistoryFilter = {
  accountId?: string | null;
  q?: string;
  from?: CalendarDate | null;
  to?: CalendarDate | null;
  kind?: HistoryKind | null;
  category?: string | null;
  state?: 'POSTED' | 'NOT POSTED' | null;
  sort?: 'NEWEST' | 'OLDEST' | 'LARGEST';
};

export function searchHistory(f: HistoryFilter = {}, today: CalendarDate = getTodayKey()): HistoryRow[] {
  const snap = getRepository().getSnapshot();
  const q = (f.q ?? '').trim().toUpperCase();
  const rows = snap.transactions
    .filter((e) => e.source === 'ADDED')
    .map((e) => historyRow(e, snap.accounts, today))
    .filter((r) => (f.accountId ? r.account?.account_id === f.accountId : true))
    .filter((r) => (q ? `${r.label} ${r.category} ${r.entry.memo ?? ''} ${r.account?.display_name ?? ''}`.toUpperCase().includes(q) : true))
    .filter((r) => (f.from && r.date ? compareCalendarDates(r.date, f.from) >= 0 : true))
    .filter((r) => (f.to && r.date ? compareCalendarDates(r.date, f.to) <= 0 : true))
    .filter((r) => (f.kind ? r.kind === f.kind : true))
    .filter((r) => (f.category ? r.category === f.category : true))
    .filter((r) => (f.state === 'POSTED' ? r.settled : f.state === 'NOT POSTED' ? !r.settled : true));
  const sort = f.sort ?? 'NEWEST';
  const key = (r: HistoryRow) => r.date ?? '0000-00-00';
  rows.sort((a, b) => {
    if (sort === 'LARGEST') return Math.abs(b.entry.amount) - Math.abs(a.entry.amount);
    const c = key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : (a.entry.recorded_at ?? '') < (b.entry.recorded_at ?? '') ? -1 : 1;
    return sort === 'OLDEST' ? c : -c;
  });
  return rows;
}

export function categoriesIn(rows: HistoryRow[]): string[] {
  return [...new Set(rows.map((r) => r.category).filter(Boolean))].sort();
}

export function entryById(id: string): LedgerEntry | null {
  return getRepository().getSnapshot().transactions.find((e) => e.id === id) ?? null;
}
