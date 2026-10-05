/**
 * Shared money reading for F03 TODAY and F04 ACTIVITY.
 * Persistence goes through the repository adapter (W0.3). MOCK data is seeded at repository init.
 */

import { useSyncExternalStore } from 'react';
import { getSetupDraft, type SetupDraft } from '../f02/setupDraft';
import { computeSafeToSpend, setupObligationsAsUpcoming } from '../f09/safeToSpend';
import { projectUpcoming } from '../foundation/upcomingProjection';
import { getRepository } from '../repository/deviceRepository';
import type { QuickAddQuote } from './currency';
import { MOCK_UPCOMING } from './mockScenario';
import type { Clearance, Direction, LedgerEntry, UpcomingItem } from './moneyTypes';
export type { MoneySource, Direction, Clearance, ObligationKind, UpcomingItem, LedgerEntry } from './moneyTypes';
export { MOCK_CASH, MOCK_ENTRIES, MOCK_UPCOMING } from './mockScenario';

export {
  formatAmountInput,
  formatMoney,
  useCurrency,
  useExchangeState,
  setCurrency,
  getCurrency,
  getExchangeState,
  parseAmountInput,
  quoteQuickAdd,
  CURRENCIES,
  CURRENCY_ROW_PX,
  VISIBLE_CURRENCY_ROWS,
  scrollTopToReveal,
} from './currency';
export type { CurrencyCode, CurrencyPreference, QuickAddQuote } from './currency';

export { computeSafeToSpend, safeToSpend, protectedAmountFromSetup as protectedAmount, type SafeToSpend, type SafeToSpendBreakdown } from '../f09/safeToSpend';

export type TodayMode = 'LOADING' | 'EMPTY' | 'PARTIAL' | 'CONNECTED' | 'ERROR' | 'CAUGHT_UP' | 'ATTENTION' | 'STALE';

function subscribeRepo(listener: () => void) {
  return getRepository().subscribe(listener);
}

export function addedEntries(): LedgerEntry[] {
  return getRepository().listTransactions().filter((e) => e.source === 'ADDED');
}

export function addLedgerEntry(entry: Omit<LedgerEntry, 'id' | 'source' | 'status' | 'related' | 'recurring' | 'memo'> & { memo?: string; provenance?: QuickAddQuote }): LedgerEntry {
  return getRepository().appendTransaction(entry);
}

export function updateLedgerEntry(id: string, patch: Partial<Pick<LedgerEntry, 'merchant' | 'amount' | 'direction' | 'when' | 'account' | 'category' | 'memo'>>): LedgerEntry | null {
  return getRepository().updateTransaction(id, patch);
}

export function deleteLedgerEntry(id: string): boolean {
  return getRepository().deleteTransaction(id);
}

export function clearAddedEntries() {
  getRepository().clearAddedTransactions();
}

export function useAddedEntries(): LedgerEntry[] {
  return useSyncExternalStore(subscribeRepo, addedEntries, addedEntries);
}

export function upcomingFor(draft: SetupDraft = getSetupDraft()): UpcomingItem[] {
  const income = getRepository().listIncomeSources();
  const obligations = getRepository().listObligations();
  if (income.length || obligations.length) {
    return projectUpcoming(income, obligations).map((p) => ({
      id: p.upcoming_id,
      name: p.label,
      when: p.due_date,
      amount: p.amount,
      kind: p.source_domain === 'OBLIGATION' ? 'BILL' : 'BILL',
      source: 'SETUP' as const,
    }));
  }
  if (draft.obligations.length) return setupObligationsAsUpcoming(draft);
  return MOCK_UPCOMING;
}

export function ledgerEntries(): LedgerEntry[] {
  return getRepository().listTransactions();
}

export function cashPosition(entries: LedgerEntry[] = ledgerEntries()): number {
  return computeSafeToSpend(getSetupDraft(), entries).cash;
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
