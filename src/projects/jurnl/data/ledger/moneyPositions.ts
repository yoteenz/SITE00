/** Repository-bound readers for the canonical accounting engine (F05 MONEY owns the account registry). */

import { useSyncExternalStore } from 'react';
import { getTodayKey, type CalendarDate } from '../foundation/dates';
import type { JurnlAccountRecord } from '../foundation/accounts';
import { cachedRepoView } from '../repository/cachedRepoView';
import { getRepository } from '../repository/deviceRepository';
import { computeLedgerPositions, summarizePositions, type AccountPosition, type LedgerPositions, type MoneySummary } from './accounting';
import { purposesForAccount, suggestAccountForPurpose, type MoneyPurpose, type PurposeSuggestion } from './purposes';

function subscribe(listener: () => void) {
  return getRepository().subscribe(listener);
}

export function ledgerPositions(today: CalendarDate = getTodayKey()): LedgerPositions {
  return cachedRepoView(`ledger.positions.${today}`, () => {
    const s = getRepository().getSnapshot();
    return computeLedgerPositions(s.accounts, s.creditAttributes, s.transactions, today);
  });
}

export function moneySummary(today: CalendarDate = getTodayKey()): MoneySummary {
  return cachedRepoView(`ledger.summary.${today}`, () => summarizePositions(ledgerPositions(today).positions));
}

export function positionFor(accountId: string, today: CalendarDate = getTodayKey()): AccountPosition | null {
  return ledgerPositions(today).positions.find((p) => p.account_id === accountId) ?? null;
}

export function useLedgerPositions(): LedgerPositions {
  const read = () => ledgerPositions();
  return useSyncExternalStore(subscribe, read, read);
}

export function useMoneySummary(): MoneySummary {
  const read = () => moneySummary();
  return useSyncExternalStore(subscribe, read, read);
}

export function purposeAccounts(): Partial<Record<string, string>> {
  return getRepository().getSettings().purposeAccounts ?? {};
}

export function suggestAccount(purpose: MoneyPurpose): PurposeSuggestion {
  return suggestAccountForPurpose(purpose, getRepository().listAccounts(), purposeAccounts());
}

export function usualPurposesFor(account: JurnlAccountRecord): MoneyPurpose[] {
  return purposesForAccount(account, getRepository().listAccounts(), purposeAccounts());
}

/** Saves (or clears with null) the usual account for a purpose. A preference only — it never moves money. */
export function setPurposeAccount(purpose: MoneyPurpose, accountId: string | null) {
  const current = { ...purposeAccounts() };
  if (accountId) current[purpose] = accountId;
  else delete current[purpose];
  getRepository().patchSettings({ purposeAccounts: current });
}
