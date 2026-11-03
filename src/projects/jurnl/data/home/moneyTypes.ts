import type { QuickAddQuote } from './currency';
import type { TxnClass } from '../foundation/categories';
import type { CalendarDate } from '../foundation/dates';

export type { TxnClass } from '../foundation/categories';

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
  /** Plain kind label for display (BILL, SUBSCRIPTION, CARD PAYMENT, INCOME). */
  kindLabel?: string;
  /** Plain funding fact for display, e.g. "95 OF 140 SET ASIDE" in the display currency. */
  fundingLabel?: string | null;
  direction?: 'MONEY_IN' | 'MONEY_OUT';
};

/**
 * How an entry was confirmed. JURNL has no bank connection in this build, so user entries are RECORDED_BY_YOU and
 * the preview scenario is SAMPLE. BANK_CONFIRMED is reserved for a future provider and is never produced today.
 */
export type EntryConfirmation = 'RECORDED_BY_YOU' | 'PENDING_CONFIRMATION' | 'BANK_CONFIRMED' | 'SAMPLE';

/** Groups the legs of one financial event (one daily earnings save, one transfer, one card payment, one bill payment). */
export type EntryLinkKind = 'DAILY_EARNINGS' | 'TRANSFER' | 'CARD_PAYMENT' | 'BILL_PAYMENT' | 'BALANCE_CORRECTION';
export type EntryLink = { kind: EntryLinkKind; id: string; leg?: 'OUT' | 'IN' | 'DIGITAL' | 'CASH' | 'SINGLE' };

export type LedgerEntry = {
  id: string;
  merchant: string;
  amount: number;
  direction: Direction;
  /** Display date. New entries also carry `occurred_on`; legacy entries carry relative labels (TODAY, FRIDAY). */
  when: string;
  /** Account display name (legacy reference). New entries also carry `account_id`. */
  account: string;
  category: string;
  status: Clearance;
  recurring: boolean;
  memo: string;
  source: 'MOCK' | 'ADDED';
  related: { kind: ObligationKind; name: string } | null;
  provenance?: QuickAddQuote;
  /** Stable account reference (canonical). Resolved by display name for legacy entries. */
  account_id?: string | null;
  /** Accounting class. Derived from direction + account nature for legacy entries. */
  txn_class?: TxnClass;
  /** Calendar date the money actually moved. Entries dated after today are scheduled and do not change balances. */
  occurred_on?: CalendarDate | null;
  /** ISO timestamp the entry was recorded. */
  recorded_at?: string | null;
  confirmation?: EntryConfirmation;
  /** Family that created the entry (F04 quick add, F05 transfer, F06 earnings, F07 bill payment, F12 card payment). */
  origin_family?: string | null;
  link?: EntryLink | null;
  /** Bill / subscription this entry paid (F07). */
  obligation_id?: string | null;
  /** Due date of the occurrence this entry paid. */
  occurrence_date?: CalendarDate | null;
  /** The other account in a transfer or card payment. */
  counterparty_account_id?: string | null;
};
