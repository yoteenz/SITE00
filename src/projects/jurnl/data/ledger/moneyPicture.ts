/**
 * Account positions + transfer settlement in one reading.
 *
 *   AVAILABLE IN ACCOUNTS  = Σ settled money held in asset accounts (what can be spent or pay a bill from there)
 *   IN TRANSIT             = money that left a source and has not arrived (never spendable at the destination)
 *   TOTAL TRACKED ASSETS   = available in accounts + in transit (shown with that label, never as spendable)
 */

import type { JurnlAccountRecord } from '../foundation/accounts';
import type { JurnlCreditAttributes } from '../foundation/creditAttributes';
import type { CalendarDate } from '../foundation/dates';
import type { LedgerEntry } from '../home/moneyTypes';
import { computeLedgerPositions, summarizePositions, toCents, type LedgerPositions, type MoneySummary } from './accounting';
import { transferTotals, transferViews, type TransferTotals, type TransferView } from './transferSettlement';

export type MoneyPicture = LedgerPositions & {
  summary: MoneySummary;
  transfers: TransferView[];
  transferTotals: TransferTotals;
  availableInAccounts: number;
  inTransit: number;
  trackedAssets: number;
};

export function computeMoneyPicture(accounts: JurnlAccountRecord[], creditAttributes: JurnlCreditAttributes[], entries: LedgerEntry[], today: CalendarDate): MoneyPicture {
  const lp = computeLedgerPositions(accounts, creditAttributes, entries, today);
  const summary = summarizePositions(lp.positions);
  const transfers = transferViews(entries, today);
  const totals = transferTotals(transfers);
  return {
    ...lp,
    summary,
    transfers,
    transferTotals: totals,
    availableInAccounts: summary.ownedAssets,
    inTransit: totals.inTransit,
    trackedAssets: toCents(summary.ownedAssets + totals.inTransit),
  };
}
