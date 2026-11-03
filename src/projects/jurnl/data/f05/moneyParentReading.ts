/**
 * F05 MONEY parent (motion pilot) — the four figures and the account papers, read from the canonical model only.
 *
 * HELD       Σ money held in active asset accounts (bank, debit, cash, savings…), settled entries only. Money in transit
 *            between accounts is in no account and is reported separately (inTransit). Card credit is never held.
 * OWED       Σ owed on cards and loans (liabilities). Never netted against HELD.
 * COMMITTED  What Safe to Spend holds back over its 30-day period: bills and subscriptions due, card minimums still
 *            due, transfers not sent yet, protected money, safety buffer, plan / goal / purchase / trip set-asides.
 * AVAILABLE  F09 Safe to Spend for the next 30 days (computeSafeToSpend). Not a second formula.
 *            AVAILABLE = Safe to Spend cash − COMMITTED, where Safe to Spend cash counts only accounts marked for it, so
 *            HELD − COMMITTED differs from AVAILABLE whenever an account is outside Safe to Spend.
 */

import type { AccountType } from '../foundation/categories';
import { listActiveAccounts } from '../foundation/accounts';
import { getTodayKey, type CalendarDate } from '../foundation/dates';
import { computeSafeToSpend } from '../f09/safeToSpend';
import { summarizePositions, type AccountPosition, type BalanceBasis } from '../ledger/accounting';
import { computeMoneyPicture } from '../ledger/moneyPicture';
import { getRepository } from '../repository/deviceRepository';

export type MoneyPaperArt = 'bank' | 'payout' | 'cash' | 'credit';

export type MoneyParentAccount = {
  account_id: string;
  name: string;
  /** Two display lines (BANK / ACCOUNT, CASH / ON HAND); one line when the name is one word. */
  lines: [string] | [string, string];
  type: AccountType;
  art: MoneyPaperArt;
  nature: 'ASSET' | 'LIABILITY';
  /** Held for assets, owed for liabilities (never signed together). */
  amount: number;
  basis: BalanceBasis | null;
  /** Transfer money for this account that is not settled here yet (state-bound, from the settlement model). */
  incoming: number;
  inTransitOut: number;
  waitingToLeave: number;
};

export type MoneyParentReading = {
  held: number;
  owed: number;
  committed: number;
  available: number;
  availableBasis: 'SAFE_TO_SPEND_NEXT_30_DAYS';
  windowEnd: CalendarDate;
  /** MOCK when Safe to Spend is reading the sample preview (no real accounts yet). */
  cashSource: 'MOCK' | 'ACCOUNTS' | 'DERIVED';
  inTransit: number;
  committedParts: { bills: number; cardMinimums: number; transfersNotSent: number; heldBack: number };
  accounts: MoneyParentAccount[];
};

/** Card artwork by kind of place. Artwork is decoration: the name, amount and id are always the account's own. */
export function artFor(type: AccountType, isPayout: boolean): MoneyPaperArt {
  if (type === 'CREDIT_CARD' || type === 'LOAN') return 'credit';
  if (type === 'CASH') return 'cash';
  if (type === 'DEBIT_CARD' || isPayout) return 'payout';
  return 'bank';
}

/**
 * Two balanced lines for a place name: BANK / ACCOUNT, RIDESHARE / CARD, CASH / ON HAND, CREDIT / CARD.
 * The split that makes the longer line shortest wins; a tie goes to the earlier split (CASH / ON HAND).
 */
export function nameLines(raw: string): [string] | [string, string] {
  const name = raw.trim().toUpperCase().replace(/\s+/g, ' ');
  const words = name.split(' ').filter(Boolean);
  if (words.length <= 1) return [name];
  let best = 1;
  let bestLen = Infinity;
  for (let i = 1; i < words.length; i += 1) {
    const len = Math.max(words.slice(0, i).join(' ').length, words.slice(i).join(' ').length);
    if (len < bestLen) {
      best = i;
      bestLen = len;
    }
  }
  return [words.slice(0, best).join(' '), words.slice(best).join(' ')];
}

export function computeMoneyParentReading(today: CalendarDate = getTodayKey()): MoneyParentReading {
  const snap = getRepository().getSnapshot();
  const picture = computeMoneyPicture(snap.accounts, snap.creditAttributes, snap.transactions, today);
  const positions: AccountPosition[] = picture.positions;
  const totals = summarizePositions(positions);
  const sts = computeSafeToSpend();
  const heldBack = sts.protected + sts.safetyBuffer + sts.assigned + sts.goalReserved + sts.purchaseReserved + sts.tripReserved;
  const committed = Math.round((sts.upcoming + sts.cardPayments + sts.committedTransfers + heldBack) * 100) / 100;
  const accounts = listActiveAccounts().map((a): MoneyParentAccount => {
    const p = positions.find((x) => x.account_id === a.account_id);
    const nature = p?.nature ?? (a.account_type === 'CREDIT_CARD' || a.account_type === 'LOAN' ? 'LIABILITY' : 'ASSET');
    const t = picture.transferTotals.byAccount.get(a.account_id);
    return {
      account_id: a.account_id,
      name: a.display_name,
      lines: nameLines(a.display_name),
      type: a.account_type,
      art: artFor(a.account_type, Boolean(a.is_payout_card)),
      nature,
      amount: p ? (nature === 'LIABILITY' ? p.owed : p.held) : a.available_balance,
      basis: p?.basis ?? null,
      incoming: t?.incoming ?? 0,
      inTransitOut: t?.inTransitOut ?? 0,
      waitingToLeave: t?.waitingToLeave ?? 0,
    };
  });
  return {
    held: totals.ownedAssets,
    owed: totals.owed,
    committed,
    available: sts.value,
    availableBasis: 'SAFE_TO_SPEND_NEXT_30_DAYS',
    windowEnd: sts.windowEnd,
    cashSource: sts.cashSource,
    inTransit: picture.inTransit,
    committedParts: { bills: sts.upcoming, cardMinimums: sts.cardPayments, transfersNotSent: sts.committedTransfers, heldBack: Math.round(heldBack * 100) / 100 },
    accounts,
  };
}

/** Pages of account papers. Each page holds `perPage` accounts; the order is the registry's own. */
export function pageAccounts<T>(accounts: T[], perPage: number): T[][] {
  const n = Math.max(1, perPage);
  if (!accounts.length) return [[]];
  const pages: T[][] = [];
  for (let i = 0; i < accounts.length; i += n) pages.push(accounts.slice(i, i + n));
  return pages;
}
