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

import { orderAccounts } from './dot01/accountOrder';
import type { AccountType } from '../foundation/categories';
import { listActiveAccounts } from '../foundation/accounts';
import { getTodayKey, type CalendarDate } from '../foundation/dates';
import { computeSafeToSpend } from '../f09/safeToSpend';
import { summarizePositions, type AccountPosition, type BalanceBasis } from '../ledger/accounting';
import { computeMoneyPicture } from '../ledger/moneyPicture';
import { CARD_PAYMENT_STATE_LABEL, TRANSFER_STATE_LABEL, type TransferState, type TransferView } from '../ledger/transferSettlement';
import { getRepository } from '../repository/deviceRepository';
import { formatMoney } from '../home/money';

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
  /** One short line for the paper, from the canonical settlement state of its open transfers (null when none). */
  transferLine: string | null;
};

/** States that are not finished (the same set as #1706's OPEN TRANSFERS panel). */
export const OPEN_TRANSFER_STATES: TransferState[] = ['SCHEDULED', 'PENDING', 'IN_TRANSIT', 'RETURNING', 'NEEDS_RECONCILIATION'];

/** Short paper wording for each open state. A display mapping of the canonical state, never a state of its own. */
const PAPER_WORDS: Record<'TRANSFER' | 'CARD_PAYMENT', Partial<Record<TransferState, string>>> = {
  TRANSFER: { SCHEDULED: 'PLANNED', PENDING: 'PENDING', IN_TRANSIT: 'IN TRANSIT', RETURNING: 'COMING BACK', NEEDS_RECONCILIATION: 'NEEDS CONFIRMATION' },
  CARD_PAYMENT: { SCHEDULED: 'PAYMENT SCHEDULED', PENDING: 'PAYMENT SUBMITTED', IN_TRANSIT: 'CARD NOT CONFIRMED', RETURNING: 'PAYMENT FAILED', NEEDS_RECONCILIATION: 'NEEDS CONFIRMATION' },
};

export type MoneyParentTransfer = {
  linkId: string;
  kind: 'TRANSFER' | 'CARD_PAYMENT';
  state: TransferState;
  amount: number;
  fromId: string | null;
  toId: string | null;
  /** The canonical label (#1706) for this kind and state. */
  label: string;
  /** Every step is recorded by the person; JURNL never claims bank or card-issuer confirmation. */
  confirmation: 'RECORDED_BY_YOU';
};

export function openTransfers(views: TransferView[]): MoneyParentTransfer[] {
  return views
    .filter((v) => OPEN_TRANSFER_STATES.includes(v.state))
    .map((v) => ({
      linkId: v.linkId,
      kind: v.kind,
      state: v.state,
      amount: v.amount,
      fromId: v.fromId,
      toId: v.toId,
      label: (v.kind === 'CARD_PAYMENT' ? CARD_PAYMENT_STATE_LABEL : TRANSFER_STATE_LABEL)[v.state],
      confirmation: 'RECORDED_BY_YOU' as const,
    }));
}

/** "→ {amount} IN TRANSIT" (leaving this place) · "← {amount} CARD NOT CONFIRMED" (coming to it) · "+1" when there are more. */
export function paperTransferLine(accountId: string, transfers: MoneyParentTransfer[], money: (n: number) => string): string | null {
  const mine = transfers.filter((t) => t.fromId === accountId || t.toId === accountId);
  if (!mine.length) return null;
  const rank: Record<TransferState, number> = { IN_TRANSIT: 0, RETURNING: 1, NEEDS_RECONCILIATION: 2, PENDING: 3, SCHEDULED: 4, COMPLETED: 9, CANCELLED: 9, FAILED: 9, REVERSED: 9 };
  const t = [...mine].sort((a, b) => rank[a.state] - rank[b.state])[0]!;
  const arrow = t.fromId === accountId ? '→' : '←';
  const words = PAPER_WORDS[t.kind][t.state] ?? t.label;
  return `${arrow} ${money(t.amount)} ${words}${mine.length > 1 ? ` +${mine.length - 1}` : ''}`;
}

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
  /** Unfinished transfers and card payments, in canonical settlement states. */
  transfers: MoneyParentTransfer[];
  /** Every link's canonical state (finished ones included), so the page can tell COMPLETED from CANCELLED / FAILED. */
  transferStates: Record<string, TransferState>;
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
  const transfers = openTransfers(picture.transfers);
  const accounts = orderAccounts(listActiveAccounts()).map((a): MoneyParentAccount => {
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
      transferLine: paperTransferLine(a.account_id, transfers, formatMoney),
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
    transfers,
    transferStates: Object.fromEntries(picture.transfers.map((v) => [v.linkId, v.state])),
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
