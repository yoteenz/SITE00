/**
 * Which ledger entries count as real activity, and as what — the single rule every total uses so an event that
 * appears twice (recorded by the user and reported by the bank) is counted once.
 */
import type { TxnClass } from '../foundation/categories';
import type { LedgerEntry } from '../home/moneyTypes';

/** The entry stands for an event that another entry already counts (bank-confirmed duplicate, payout matched to earnings). */
export function isSupersededByBank(e: Pick<LedgerEntry, 'bank_match'>): boolean {
  const m = e.bank_match;
  return Boolean(m?.superseded && (m.status === 'AUTO_MATCHED' || m.status === 'CONFIRMED'));
}

/** Real (non-sample) activity: the user's entries and live imported entries, minus anything superseded. */
export function isActivityEntry(e: LedgerEntry): boolean {
  if (e.source === 'MOCK') return false;
  if (isSupersededByBank(e)) return false;
  if (e.source === 'IMPORTED') return e.import?.provider_state === 'ACTIVE';
  return e.source === 'ADDED';
}

/** A reconciled movement between the user's own places is a transfer (or a card payment), whatever it was entered as. */
export function effectiveTxnClass(e: LedgerEntry, derived: TxnClass): TxnClass {
  const m = e.bank_match;
  if (!m || (m.status !== 'AUTO_MATCHED' && m.status !== 'CONFIRMED')) return derived;
  if (m.kind === 'CASH_WITHDRAWAL' || m.kind === 'TRANSFER') return 'TRANSFER';
  if (m.kind === 'CARD_PAYMENT') return derived === 'DEBT_PAYMENT' ? 'DEBT_PAYMENT' : 'CREDIT_PAYMENT';
  return derived;
}
