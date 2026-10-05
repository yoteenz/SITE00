/**
 * Shared money reading for F03 TODAY and F04 ACTIVITY.
 * MOCK entries are preview data. DERIVED values are computed from those entries and the setup draft.
 * Nothing here is a live bank balance.
 */

import { useSyncExternalStore } from 'react';
import { getSetupDraft, type SetupDraft } from '../f02/setupDraft';

export { formatAmountInput, formatMoney, useCurrency, setCurrency, getCurrency, parseAmountInput, CURRENCIES } from './currency';
export type { CurrencyCode, CurrencyPreference } from './currency';

export type MoneySource = 'MOCK' | 'ADDED' | 'SETUP' | 'DERIVED';
export type Direction = 'INCOME' | 'EXPENSE';
export type Clearance = 'PENDING' | 'CLEARED';
export type ObligationKind = 'BILL' | 'SUBSCRIPTION';

export type UpcomingItem = {
  id: string;
  name: string;
  when: string;
  amount: number;
  kind: ObligationKind;
  source: 'MOCK' | 'SETUP';
};

export type LedgerEntry = {
  id: string;
  merchant: string;
  amount: number;
  direction: Direction;
  when: string;
  account: string;
  category: string;
  status: Clearance;
  recurring: boolean;
  memo: string;
  source: 'MOCK' | 'ADDED';
  related: { kind: ObligationKind; name: string } | null;
};

export const MOCK_CASH = 8420;

export const MOCK_UPCOMING: UpcomingItem[] = [
  { id: 'up-rent', name: 'RENT', when: 'THURSDAY', amount: 1800, kind: 'BILL', source: 'MOCK' },
  { id: 'up-groceries', name: 'GROCERIES', when: 'FRIDAY', amount: 120, kind: 'BILL', source: 'MOCK' },
];

export const MOCK_ENTRIES: LedgerEntry[] = [
  { id: 'tx-atelier', merchant: 'ATELIER', amount: 86, direction: 'EXPENSE', when: 'YESTERDAY', account: 'CHECKING', category: 'CLOTHING', status: 'CLEARED', recurring: false, memo: 'A QUIET PURCHASE', source: 'MOCK', related: null },
  { id: 'tx-market', merchant: 'MARKET', amount: 42, direction: 'EXPENSE', when: 'YESTERDAY', account: 'CHECKING', category: 'FOOD', status: 'CLEARED', recurring: false, memo: '', source: 'MOCK', related: null },
  { id: 'tx-pay', merchant: 'PAY', amount: 3200, direction: 'INCOME', when: 'FRIDAY', account: 'CHECKING', category: 'INCOME', status: 'CLEARED', recurring: true, memo: 'REGULAR PAY', source: 'MOCK', related: null },
  { id: 'tx-rent', merchant: 'RENT', amount: 1800, direction: 'EXPENSE', when: 'THURSDAY', account: 'CHECKING', category: 'HOUSING', status: 'PENDING', recurring: true, memo: 'EXPECTED, NOT YET MOVED', source: 'MOCK', related: { kind: 'BILL', name: 'RENT' } },
  { id: 'tx-studio', merchant: 'STUDIO', amount: 64, direction: 'EXPENSE', when: 'MONDAY', account: 'CARD', category: 'MEMBERSHIP', status: 'CLEARED', recurring: true, memo: '', source: 'MOCK', related: { kind: 'SUBSCRIPTION', name: 'STUDIO' } },
  { id: 'tx-coffee', merchant: 'COFFEE', amount: 6, direction: 'EXPENSE', when: 'MONDAY', account: 'CARD', category: 'FOOD', status: 'CLEARED', recurring: false, memo: '', source: 'MOCK', related: null },
];

export type TodayMode = 'LOADING' | 'EMPTY' | 'PARTIAL' | 'CONNECTED' | 'ERROR' | 'CAUGHT_UP' | 'ATTENTION' | 'STALE';

const listeners = new Set<() => void>();
let added: LedgerEntry[] = [];

export function addedEntries(): LedgerEntry[] {
  return added;
}

export function addLedgerEntry(entry: Omit<LedgerEntry, 'id' | 'source' | 'status' | 'related' | 'recurring' | 'memo'> & { memo?: string }): LedgerEntry {
  const next: LedgerEntry = {
    ...entry,
    id: `tx-add-${added.length + 1}`,
    status: 'CLEARED',
    recurring: false,
    memo: entry.memo ?? 'ADDED BY HAND',
    source: 'ADDED',
    related: null,
  };
  added = [next, ...added];
  listeners.forEach((l) => l());
  return next;
}

export function clearAddedEntries() {
  added = [];
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useAddedEntries(): LedgerEntry[] {
  return useSyncExternalStore(subscribe, addedEntries, addedEntries);
}

export function protectedAmount(draft: SetupDraft = getSetupDraft()): number {
  const raw = draft.protectedAmount.trim();
  if (!raw || draft.protectedSkipped) return 0;
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

export function upcomingFor(draft: SetupDraft = getSetupDraft()): UpcomingItem[] {
  if (draft.obligations.length) {
    return draft.obligations.map((o, i) => ({
      id: `up-setup-${i}`,
      name: o.name,
      when: o.cadence,
      amount: 0,
      kind: 'BILL' as const,
      source: 'SETUP' as const,
    }));
  }
  return MOCK_UPCOMING;
}

export function ledgerEntries(): LedgerEntry[] {
  return [...addedEntries(), ...MOCK_ENTRIES];
}

export function cashPosition(entries: LedgerEntry[] = ledgerEntries()): number {
  const addedDelta = entries
    .filter((e) => e.source === 'ADDED')
    .reduce((sum, e) => sum + (e.direction === 'INCOME' ? e.amount : -e.amount), 0);
  return MOCK_CASH + addedDelta;
}

export type SafeToSpend = {
  cash: number;
  upcoming: number;
  protected: number;
  value: number;
  cashSource: 'MOCK';
  upcomingSource: 'MOCK' | 'SETUP' | 'DERIVED';
  protectedSource: 'SETUP' | 'DERIVED';
  valueSource: 'DERIVED';
};

export function safeToSpend(draft: SetupDraft = getSetupDraft(), entries: LedgerEntry[] = ledgerEntries()): SafeToSpend {
  const upcomingItems = draft.obligations.length ? [] : MOCK_UPCOMING;
  const upcoming = upcomingItems.reduce((sum, item) => sum + item.amount, 0);
  const held = protectedAmount(draft);
  const cash = cashPosition(entries);
  return {
    cash,
    upcoming,
    protected: held,
    value: cash - upcoming - held,
    cashSource: 'MOCK',
    upcomingSource: draft.obligations.length ? 'SETUP' : 'DERIVED',
    protectedSource: held > 0 ? 'SETUP' : 'DERIVED',
    valueSource: 'DERIVED',
  };
}

export function todayModeFromQuery(state: string | null, draft: SetupDraft = getSetupDraft()): TodayMode {
  switch ((state ?? '').toLowerCase()) {
    case 'loading':
      return 'LOADING';
    case 'empty':
      return 'EMPTY';
    case 'partial':
      return 'PARTIAL';
    case 'error':
      return 'ERROR';
    case 'caught_up':
    case 'caught-up':
      return 'CAUGHT_UP';
    case 'attention':
      return 'ATTENTION';
    case 'stale':
      return 'STALE';
    case 'connected':
      return 'CONNECTED';
    default:
      break;
  }
  if (draft.accounts === 'SKIPPED') return 'PARTIAL';
  if (draft.started && !draft.cadence && !draft.amount) return 'PARTIAL';
  return 'CONNECTED';
}

export type ActivityFilter = {
  query: string;
  account: 'ALL' | string;
  direction: 'ALL' | Direction;
  status: 'ALL' | Clearance;
  when: 'ALL' | string;
};

export const EMPTY_FILTER: ActivityFilter = { query: '', account: 'ALL', direction: 'ALL', status: 'ALL', when: 'ALL' };

export function applyActivityFilter(entries: LedgerEntry[], filter: ActivityFilter): LedgerEntry[] {
  const q = filter.query.trim().toUpperCase();
  return entries.filter((entry) => {
    if (filter.account !== 'ALL' && entry.account !== filter.account) return false;
    if (filter.direction !== 'ALL' && entry.direction !== filter.direction) return false;
    if (filter.status !== 'ALL' && entry.status !== filter.status) return false;
    if (filter.when !== 'ALL' && entry.when !== filter.when) return false;
    if (!q) return true;
    const hay = `${entry.merchant} ${entry.category} ${entry.account} ${entry.memo} ${entry.when}`.toUpperCase();
    return hay.includes(q);
  });
}

export function filterIsActive(filter: ActivityFilter): boolean {
  return filter.account !== 'ALL' || filter.direction !== 'ALL' || filter.status !== 'ALL' || filter.when !== 'ALL';
}

/** Human reading of a narrowed ledger. Default filters stay quiet. */
export function filterSummary(filter: ActivityFilter): string | null {
  const parts: string[] = [];
  if (filter.account !== 'ALL') parts.push(filter.account);
  if (filter.direction === 'INCOME') parts.push('MONEY IN');
  if (filter.direction === 'EXPENSE') parts.push('MONEY OUT');
  if (filter.status === 'PENDING') parts.push('STILL MOVING');
  if (filter.status === 'CLEARED') parts.push('SETTLED');
  if (filter.when !== 'ALL') parts.push(filter.when);
  return parts.length ? parts.join(' · ') : null;
}
