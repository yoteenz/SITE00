/**
 * JURNL canonical accounting engine (one ledger, derived balances).
 *
 * There is ONE ledger: `RepositorySnapshot.transactions` (F04). Every account balance is derived from it:
 *
 *   bookkeeping balance(account) = entered balance (the account's anchor) + Σ effect(recorded entries on that account)
 *
 * - Asset accounts (bank, savings, debit / payout card, cash): the position is money held. Money in adds, money out
 *   subtracts.
 * - Liability accounts (credit card, loan): the position is the amount owed. A purchase adds to what is owed; a payment
 *   or refund subtracts.
 * - Entries the user did not record (source MOCK, the preview scenario) are history already inside the entered
 *   balance, so they never change a balance (existing repository convention).
 * - Entries dated after today are scheduled and do not change balances until their date.
 *
 * Pure functions only. UI and stores read through `data/ledger/moneyPositions.ts`.
 */

import type { JurnlAccountRecord } from '../foundation/accounts';
import type { AccountType, TxnClass } from '../foundation/categories';
import type { JurnlCreditAttributes } from '../foundation/creditAttributes';
import { compareCalendarDates, daysUntil, normalizeDateInput, parseCalendarDate, type CalendarDate } from '../foundation/dates';
import type { LedgerEntry, LegSettlement } from '../home/moneyTypes';

export type AccountNature = 'ASSET' | 'LIABILITY';

/** What kind of place the money is in (presentation + purpose matching; accounting uses `AccountNature`). */
export type MoneyLocationKind = 'BANK' | 'SAVINGS' | 'DEBIT_CARD' | 'PAYOUT_CARD' | 'CASH' | 'CREDIT_CARD' | 'LOAN' | 'INVESTMENT' | 'OTHER';

/**
 * Where the account is held. EXTERNAL_ACCOUNT: an account at a bank, card issuer or payout provider (balance entered by
 * the user — no bank feed exists in this build). MANUAL_CASH_LOCATION: physical cash the user counts themselves.
 */
export type HoldingClass = 'EXTERNAL_ACCOUNT' | 'MANUAL_CASH_LOCATION';

/**
 * How sure a balance is. BANK_CONFIRMED is never produced in this build (no provider). ENTERED_BY_YOU: the user typed it.
 * NOT_VERIFIED: a registry or preview value nobody confirmed.
 */
export type BalanceBasis = 'ENTERED_BY_YOU' | 'NOT_VERIFIED' | 'SAMPLE' | 'BANK_CONFIRMED';

/** Accounts every new repository is seeded with (accountSeed.ts). Their balances are sample numbers until the user enters one. */
export const SAMPLE_ACCOUNT_IDS: ReadonlySet<string> = new Set(['acct-checking', 'acct-card']);

export const BALANCE_BASIS_LABEL: Record<BalanceBasis, string> = {
  ENTERED_BY_YOU: 'ENTERED BY YOU',
  SAMPLE: 'SAMPLE BALANCE',
  NOT_VERIFIED: 'NOT CONFIRMED BY A BANK',
  BANK_CONFIRMED: 'CONFIRMED BY YOUR BANK',
};

export const TXN_CLASS_LABEL: Record<TxnClass, string> = {
  INCOME: 'INCOME',
  EXPENSE: 'SPENDING',
  TRANSFER: 'TRANSFER',
  CREDIT_PURCHASE: 'CARD PURCHASE',
  CREDIT_PAYMENT: 'CARD PAYMENT',
  DEBT_PAYMENT: 'LOAN PAYMENT',
  REFUND: 'REFUND',
  ADJUSTMENT: 'BALANCE CORRECTION',
};

export function accountNature(type: AccountType): AccountNature {
  return type === 'CREDIT_CARD' || type === 'LOAN' ? 'LIABILITY' : 'ASSET';
}

export function locationKind(a: Pick<JurnlAccountRecord, 'account_type' | 'is_payout_card'>): MoneyLocationKind {
  if (a.is_payout_card && accountNature(a.account_type) === 'ASSET') return 'PAYOUT_CARD';
  switch (a.account_type) {
    case 'CHECKING':
    case 'BUSINESS':
      return 'BANK';
    case 'SAVINGS':
      return 'SAVINGS';
    case 'DEBIT_CARD':
      return 'DEBIT_CARD';
    case 'CASH':
      return 'CASH';
    case 'CREDIT_CARD':
      return 'CREDIT_CARD';
    case 'LOAN':
      return 'LOAN';
    case 'INVESTMENT':
      return 'INVESTMENT';
    default:
      return 'OTHER';
  }
}

export const LOCATION_KIND_LABEL: Record<MoneyLocationKind, string> = {
  BANK: 'BANK ACCOUNT',
  SAVINGS: 'SAVINGS',
  DEBIT_CARD: 'DEBIT CARD',
  PAYOUT_CARD: 'PAYOUT CARD',
  CASH: 'CASH',
  CREDIT_CARD: 'CREDIT CARD',
  LOAN: 'LOAN',
  INVESTMENT: 'INVESTMENT',
  OTHER: 'OTHER',
};

export function holdingClass(a: Pick<JurnlAccountRecord, 'account_type'>): HoldingClass {
  return a.account_type === 'CASH' ? 'MANUAL_CASH_LOCATION' : 'EXTERNAL_ACCOUNT';
}

export function balanceBasis(a: Pick<JurnlAccountRecord, 'is_manual' | 'is_connected'> & Partial<Pick<JurnlAccountRecord, 'account_id' | 'balance_entered_by_user'>>): BalanceBasis {
  // No bank aggregation provider exists (JURNL_BANK_CONNECTION_PROVIDER = PROVIDER_UNAVAILABLE). A "connected" preview
  // account is still not bank-confirmed.
  if (a.account_id && SAMPLE_ACCOUNT_IDS.has(a.account_id) && !a.balance_entered_by_user) return 'SAMPLE';
  if (a.is_manual) return 'ENTERED_BY_YOU';
  return 'NOT_VERIFIED';
}

/** Currency precision: every stored and derived amount is rounded to cents (half away from zero). */
export function toCents(n: number): number {
  if (!Number.isFinite(n)) return 0;
  // toPrecision(15) strips binary noise first (1.005 * 100 = 100.49999999999999 → 100.5 → 101 cents).
  return (Math.sign(n) * Math.round(Number((Math.abs(n) * 100).toPrecision(15)))) / 100;
}

/** Rounds a needed payment UP to the next cent so a suggestion never falls a fraction short. */
export function ceilCents(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.ceil(n * 100 - 1e-7) / 100;
}

export function sumCents(values: number[]): number {
  // Integer-cent accumulation avoids 0.1 + 0.2 drift across many entries.
  return values.reduce((t, v) => t + Math.round(toCents(v) * 100), 0) / 100;
}

/** Resolves the account an entry belongs to: stable id first, then legacy display name. */
export function resolveEntryAccount(entry: Pick<LedgerEntry, 'account_id' | 'account'>, accounts: JurnlAccountRecord[]): JurnlAccountRecord | null {
  if (entry.account_id) return accounts.find((a) => a.account_id === entry.account_id) ?? null;
  const name = (entry.account ?? '').trim().toUpperCase();
  if (!name) return null;
  return accounts.find((a) => a.status === 'ACTIVE' && a.display_name === name) ?? accounts.find((a) => a.display_name === name) ?? null;
}

/** Accounting class: explicit on new entries, derived for legacy ones. */
export function entryClass(entry: Pick<LedgerEntry, 'txn_class' | 'direction'>, account: JurnlAccountRecord | null): TxnClass {
  if (entry.txn_class) return entry.txn_class;
  const liability = account ? accountNature(account.account_type) === 'LIABILITY' : false;
  if (entry.direction === 'INCOME') return liability ? 'REFUND' : 'INCOME';
  return liability ? 'CREDIT_PURCHASE' : 'EXPENSE';
}

/** The calendar date an entry happened on, if it can be known. */
export function entryDate(entry: Pick<LedgerEntry, 'occurred_on' | 'when'>, today: CalendarDate): CalendarDate | null {
  if (entry.occurred_on) return entry.occurred_on;
  return normalizeDateInput(entry.when, today);
}

export function isTwoLegKind(e: Pick<LedgerEntry, 'link'>): boolean {
  return e.link?.kind === 'TRANSFER' || e.link?.kind === 'CARD_PAYMENT';
}

/**
 * Settlement of one leg, with the deterministic legacy mapping (see transferSettlement.ts):
 *  - explicit `settlement` wins;
 *  - dated after today → SCHEDULED (future entries never changed balances);
 *  - a two-leg transfer recorded before the stabilization sprint with status PENDING ("STILL ON ITS WAY") →
 *    NEEDS_RECONCILIATION: the old record cannot say whether money left the source, so neither leg applies;
 *  - everything else → SETTLED.
 */
export function legSettlement(e: Pick<LedgerEntry, 'settlement' | 'occurred_on' | 'status' | 'link'>, today: CalendarDate): LegSettlement {
  if (e.settlement) return e.settlement;
  const d = e.occurred_on ? parseCalendarDate(e.occurred_on) : null;
  if (d && compareCalendarDates(d, today) > 0) return 'SCHEDULED';
  if (isTwoLegKind(e) && e.status === 'PENDING') return 'NEEDS_RECONCILIATION';
  return 'SETTLED';
}

export function legApplies(e: Pick<LedgerEntry, 'settlement' | 'occurred_on' | 'status' | 'link'>, today: CalendarDate): boolean {
  return legSettlement(e, today) === 'SETTLED';
}

/** Recorded by the user, settled, and not scheduled for a later date. Only these change a balance. */
export function isEffective(entry: LedgerEntry, today: CalendarDate): boolean {
  if (entry.source !== 'ADDED') return false;
  const d = entry.occurred_on ? parseCalendarDate(entry.occurred_on) : null;
  if (d && compareCalendarDates(d, today) > 0) return false;
  return legApplies(entry, today);
}

/**
 * Signed change an entry makes to its own account position. Assets: + money in / − money out. Liabilities (amount
 * owed): + charges / − payments and refunds. Direction is always relative to the entry's own account.
 */
export function entryEffect(entry: Pick<LedgerEntry, 'amount' | 'direction'>, nature: AccountNature): number {
  const amt = toCents(Math.abs(entry.amount));
  if (nature === 'ASSET') return entry.direction === 'INCOME' ? amt : -amt;
  return entry.direction === 'EXPENSE' ? amt : -amt;
}

/** Entered (anchor) position: assets → entered available balance; liabilities → entered amount owed. */
export function anchorPosition(account: JurnlAccountRecord, attrs: JurnlCreditAttributes | null): number {
  if (accountNature(account.account_type) === 'ASSET') return toCents(account.available_balance);
  if (attrs?.current_balance != null && Number.isFinite(attrs.current_balance)) return toCents(Math.max(0, attrs.current_balance));
  return toCents(Math.max(0, account.balance));
}

export type BalanceFreshness = 'TODAY' | 'THIS_WEEK' | 'OLDER' | 'UNKNOWN';

export type AccountPosition = {
  account: JurnlAccountRecord;
  account_id: string;
  nature: AccountNature;
  kind: MoneyLocationKind;
  holding: HoldingClass;
  basis: BalanceBasis;
  /** Entered (anchor) amount: money held for assets, amount owed for liabilities. */
  entered: number;
  /** Σ effects of recorded entries. */
  recordedDelta: number;
  /** Bookkeeping position: money held (assets) or amount owed (liabilities). */
  position: number;
  /** Assets only: money held (same as position). 0 for liabilities. */
  held: number;
  /** Liabilities only: amount owed (same as position). 0 for assets. */
  owed: number;
  creditLimit: number | null;
  /** Credit still available on a card: limit − owed (never counted as money held). */
  availableCredit: number | null;
  entryCount: number;
  lastActivityOn: CalendarDate | null;
  /** Last date the balance was entered or changed by a recorded entry. */
  updatedOn: CalendarDate | null;
  freshness: BalanceFreshness;
  daysSinceUpdate: number | null;
};

export type LedgerPositions = {
  positions: AccountPosition[];
  /** Recorded entries that name no known account. Reported, never silently routed into one. */
  unassigned: { count: number; delta: number; ids: string[] };
};

function freshnessFor(updatedOn: CalendarDate | null, today: CalendarDate): { freshness: BalanceFreshness; days: number | null } {
  if (!updatedOn) return { freshness: 'UNKNOWN', days: null };
  const days = Math.max(0, daysUntil(updatedOn, today));
  return { freshness: days === 0 ? 'TODAY' : days <= 7 ? 'THIS_WEEK' : 'OLDER', days };
}

function maxDate(a: CalendarDate | null, b: CalendarDate | null): CalendarDate | null {
  if (!a) return b;
  if (!b) return a;
  return compareCalendarDates(a, b) >= 0 ? a : b;
}

export function computeLedgerPositions(
  accounts: JurnlAccountRecord[],
  creditAttributes: JurnlCreditAttributes[],
  entries: LedgerEntry[],
  today: CalendarDate,
): LedgerPositions {
  const byAccount = new Map<string, { delta: number[]; count: number; last: CalendarDate | null }>();
  const unassigned = { count: 0, deltaCents: [] as number[], ids: [] as string[] };
  for (const entry of entries) {
    if (!isEffective(entry, today)) continue;
    const account = resolveEntryAccount(entry, accounts);
    if (!account) {
      unassigned.count += 1;
      unassigned.ids.push(entry.id);
      unassigned.deltaCents.push(entryEffect(entry, 'ASSET'));
      continue;
    }
    const slot = byAccount.get(account.account_id) ?? { delta: [], count: 0, last: null };
    slot.delta.push(entryEffect(entry, accountNature(account.account_type)));
    slot.count += 1;
    slot.last = maxDate(slot.last, entryDate(entry, today));
    byAccount.set(account.account_id, slot);
  }
  const positions = accounts
    .filter((a) => a.status === 'ACTIVE')
    .map((account): AccountPosition => {
      const nature = accountNature(account.account_type);
      const attrs = creditAttributes.find((c) => c.account_id === account.account_id) ?? null;
      const entered = anchorPosition(account, attrs);
      const slot = byAccount.get(account.account_id);
      const recordedDelta = sumCents(slot?.delta ?? []);
      const position = toCents(entered + recordedDelta);
      const limitRaw = attrs?.credit_limit ?? account.credit_limit;
      const creditLimit = nature === 'LIABILITY' && limitRaw != null && limitRaw > 0 ? toCents(limitRaw) : null;
      const enteredOn = parseCalendarDate(attrs?.terms_entered_at ?? null) ?? parseCalendarDate(account.as_of) ?? parseCalendarDate(account.updated_at);
      const updatedOn = maxDate(enteredOn, slot?.last ?? null);
      const fresh = freshnessFor(updatedOn, today);
      return {
        account,
        account_id: account.account_id,
        nature,
        kind: locationKind(account),
        holding: holdingClass(account),
        basis: balanceBasis(account),
        entered,
        recordedDelta,
        position,
        held: nature === 'ASSET' ? position : 0,
        owed: nature === 'LIABILITY' ? Math.max(0, position) : 0,
        creditLimit,
        availableCredit: creditLimit != null ? toCents(creditLimit - Math.max(0, position)) : null,
        entryCount: slot?.count ?? 0,
        lastActivityOn: slot?.last ?? null,
        updatedOn,
        freshness: fresh.freshness,
        daysSinceUpdate: fresh.days,
      };
    });
  return { positions, unassigned: { count: unassigned.count, delta: sumCents(unassigned.deltaCents), ids: unassigned.ids } };
}

export type MoneySummary = {
  /** Σ money held in asset accounts. Credit available is never included. */
  ownedAssets: number;
  cashOnHand: number;
  /** Money held in non-cash asset accounts (bank, savings, debit / payout cards). */
  digitalBalances: number;
  /** Σ amount owed on cards and loans. */
  owed: number;
  /** Separate figure, only where labelled NET WORTH: owned assets − owed. */
  netWorth: number;
  availableCredit: number;
};

export function summarizePositions(positions: AccountPosition[]): MoneySummary {
  const assets = positions.filter((p) => p.nature === 'ASSET');
  const ownedAssets = sumCents(assets.map((p) => p.held));
  const cashOnHand = sumCents(assets.filter((p) => p.kind === 'CASH').map((p) => p.held));
  const owed = sumCents(positions.map((p) => p.owed));
  return {
    ownedAssets,
    cashOnHand,
    digitalBalances: toCents(ownedAssets - cashOnHand),
    owed,
    netWorth: toCents(ownedAssets - owed),
    availableCredit: sumCents(positions.map((p) => p.availableCredit ?? 0)),
  };
}

/** Classes that count as spending in category totals. Transfers and card / loan payments are never spending. */
export function countsAsSpending(cls: TxnClass): boolean {
  return cls === 'EXPENSE' || cls === 'CREDIT_PURCHASE';
}

/** Classes that count as income in income totals. Transfers, refunds and corrections are never income. */
export function countsAsIncome(cls: TxnClass): boolean {
  return cls === 'INCOME';
}

export type FlowTotals = { income: number; spending: number; refunds: number; transfers: number; cardPayments: number; adjustments: number };

/** Income / spending totals for a date range, with every event counted once in exactly one bucket. */
export function flowTotals(entries: LedgerEntry[], accounts: JurnlAccountRecord[], from: CalendarDate, through: CalendarDate, today: CalendarDate): FlowTotals {
  const buckets = { income: [] as number[], spending: [] as number[], refunds: [] as number[], transfers: [] as number[], cardPayments: [] as number[], adjustments: [] as number[] };
  for (const e of entries) {
    if (e.source !== 'ADDED') continue;
    const d = entryDate(e, today);
    if (!d || compareCalendarDates(d, from) < 0 || compareCalendarDates(d, through) > 0) continue;
    const cls = entryClass(e, resolveEntryAccount(e, accounts));
    const amt = toCents(Math.abs(e.amount));
    if (cls === 'INCOME') buckets.income.push(amt);
    else if (cls === 'EXPENSE' || cls === 'CREDIT_PURCHASE') buckets.spending.push(amt);
    else if (cls === 'REFUND') buckets.refunds.push(amt);
    // Two-leg events: count the OUT leg only, so one transfer is one amount.
    else if (cls === 'TRANSFER' && e.link?.leg !== 'IN') buckets.transfers.push(amt);
    else if ((cls === 'CREDIT_PAYMENT' || cls === 'DEBT_PAYMENT') && e.link?.leg !== 'IN') buckets.cardPayments.push(amt);
    else if (cls === 'ADJUSTMENT') buckets.adjustments.push(e.direction === 'INCOME' ? amt : -amt);
  }
  return {
    income: sumCents(buckets.income),
    spending: sumCents(buckets.spending),
    refunds: sumCents(buckets.refunds),
    transfers: sumCents(buckets.transfers),
    cardPayments: sumCents(buckets.cardPayments),
    adjustments: sumCents(buckets.adjustments),
  };
}
