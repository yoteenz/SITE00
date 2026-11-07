import type { QuickAddQuote } from './currency';
import type { TxnClass } from '../foundation/categories';
import type { CalendarDate } from '../foundation/dates';

export type { TxnClass } from '../foundation/categories';

export type MoneySource = 'MOCK' | 'ADDED' | 'IMPORTED' | 'SETUP' | 'DERIVED';
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

/**
 * Settlement of one ledger leg (transfers and card payments). Only SETTLED legs change a balance.
 *   SCHEDULED: planned for a date; nothing has moved.
 *   PENDING: started, money has not left (OUT) / not arrived (IN).
 *   SETTLED: money left the source (OUT) / arrived at the destination (IN).
 *   CANCELLED: did not happen (only before any money moved).
 *   FAILED: did not complete.
 *   REVERSED: had moved, then came back (effect removed; history kept).
 *   NEEDS_RECONCILIATION: legacy record that cannot say whether money moved (pre-stabilization "STILL ON ITS WAY").
 * Entries without the field are SETTLED, except legacy PENDING transfer legs (NEEDS_RECONCILIATION) and future dates (SCHEDULED).
 */
export type LegSettlement = 'SCHEDULED' | 'PENDING' | 'SETTLED' | 'CANCELLED' | 'FAILED' | 'REVERSED' | 'NEEDS_RECONCILIATION';

export type SettlementEvent = { at: string; state: LegSettlement; action: string };
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
  /**
   * MOCK: design-preview sample. ADDED: recorded by the user. IMPORTED: delivered by a connected institution (the
   * provider's original values live in `import.original`; the display fields above are derived from them plus the
   * user's corrections, which are stored separately in `RepositorySnapshot.bank.overrides`).
   */
  source: 'MOCK' | 'ADDED' | 'IMPORTED';
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
  /** Settlement of this leg (see LegSettlement). */
  settlement?: LegSettlement;
  settlement_history?: SettlementEvent[];
  /** F05 DOT 01: every correction of this entry, oldest first (the values before each change). Never rewritten. */
  correction_history?: EntryCorrection[];
  /** F05 DOT 01: the receipt this purchase was recorded from (extracted values kept as read; the image stays on the device). */
  receipt?: EntryReceipt;
  /** F05 DOT 01: what the user typed, kept as entered (the display fields above are the canonical uppercase form). */
  source_values?: { merchant?: string; memo?: string };
  /** Connected banking: provenance of an IMPORTED entry (never edited by the user). */
  import?: ImportProvenance;
  /** Finer label inside the JURNL category (GROCERIES, DINING, GAS, SHOPPING, FEES, SUBSCRIPTION …). */
  category_detail?: string | null;
  /** How the current category / class was decided, and the provider's own confidence when it gave one. */
  classification?: { basis: ClassificationBasis; provider_confidence: string | null; rule_id?: string | null };
  /**
   * Reconciliation with a connected institution. On a user entry: the imported record that confirmed it (the user
   * entry then stops counting, so the event is counted once). On an imported entry: what it was matched to.
   */
  bank_match?: BankMatchRef | null;
};

export type ClassificationBasis = 'YOUR_CORRECTION' | 'YOUR_RULE' | 'KNOWN_PAYER' | 'BANK_CATEGORY' | 'ACCOUNT_TYPE' | 'MERCHANT_PATTERN' | 'UNCLASSIFIED';

export type ImportProvenance = {
  provider: 'PLAID';
  item_id: string;
  provider_account_id: string;
  /** Current provider id. A posted transaction replaces its pending one under the same JURNL entry. */
  provider_transaction_id: string;
  /** The first provider id this JURNL entry was created from (stable across pending → posted). */
  root_transaction_id: string;
  pending: boolean;
  provider_state: 'ACTIVE' | 'REMOVED';
  revision: number;
  /** Provider sign convention (Plaid: + = money out of the account). */
  provider_amount: number;
  /** The provider's values exactly as last delivered (source truth; never edited). */
  original: {
    name: string | null;
    merchant_name: string | null;
    counterparty_names: string[] | null;
    date: string;
    authorized_date: string | null;
    amount: number;
    pfc_primary: string | null;
    pfc_detailed: string | null;
    pfc_confidence: string | null;
    payment_channel: string | null;
    pending: boolean;
    pending_transaction_id: string | null;
  };
  history: { at: string; change: 'ADDED' | 'MODIFIED' | 'POSTED' | 'REMOVED' | 'RESTORED'; from_id?: string; before?: { amount: number; date: string; name: string | null; pending: boolean } }[];
  last_changed_at: string;
};

export type BankMatchKind = 'TRANSFER' | 'CARD_PAYMENT' | 'EARNINGS_PAYOUT' | 'CASH_WITHDRAWAL' | 'BILL_PAYMENT' | 'RECEIPT' | 'MANUAL_DUPLICATE';
export type BankMatchStatus = 'AUTO_MATCHED' | 'SUGGESTED' | 'CONFIRMED' | 'REJECTED';

export type BankMatchRef = {
  match_id: string;
  kind: BankMatchKind;
  status: BankMatchStatus;
  /** This entry no longer counts on its own: the event is counted once, through `counted_by`. */
  superseded: boolean;
  counted_by: string | null;
  other_ids: string[];
};

export type EntryCorrection = {
  at: string;
  reason: string;
  before: { amount: number; merchant: string; category: string; account_id: string | null; occurred_on: string | null; memo: string };
};

export type EntryReceipt = {
  receipt_id: string;
  /** Where the image is kept. DEVICE: this device's private storage only (never uploaded). */
  stored: 'DEVICE';
  source: 'CAMERA' | 'UPLOAD';
  mime: string;
  captured_at: string;
  /** SHA-256 of the image bytes (duplicate detection). */
  image_sha256: string;
  /** What the scan read, before the user's edits (null = not read). */
  extracted: { merchant: string | null; date: string | null; total: number | null; subtotal: number | null; tax: number | null; tip: number | null; items: { name: string; amount: number }[] };
  /** Fields the user changed or filled in during review. */
  edited: string[];
  ocr_confidence: number | null;
};
