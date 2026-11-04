/**
 * Synthetic world for F05 DOT 01 (ACCOUNTS) browser tests — no real data. It starts from the F05 CAROUSEL world (the
 * four approved places, a transfer in transit, one pending, one scheduled, bills, a goal and an expected paycheck)
 * and adds a recorded spending history on each place, in the same shape ledgerOps.buildExpense writes (the
 * Playwright loader cannot import ledgerOps itself):
 *   BANK ACCOUNT   TRATTORIA LUCIA 84.20 DINING (−5d) · UTILITY CO 120.00 UTILITIES (−12d) · BOOKSHOP 18.75 SHOPPING (−20d)
 *   CASH ON HAND   MARKET STALL 12.00 FOOD (−2d) · COFFEE CART 4.50 DINING (today)
 *   CREDIT CARD    CAFFE VESUVIO 42.50 DINING (−3d, credit purchase) · FUEL STATION 55.00 FUEL (−7d, credit purchase)
 * plus the CAROUSEL world's GROCER 42.50 (bank, today) and FUEL 38.00 (rideshare, −1d).
 */
import type { JurnlAccountRecord } from '../../../src/projects/jurnl/data/foundation/accounts';
import { addDays, getTodayKey } from '../../../src/projects/jurnl/data/foundation/dates';
import type { LedgerEntry } from '../../../src/projects/jurnl/data/home/moneyTypes';
import { f05World } from './jurnl-f05-world';

const TODAY = getTodayKey();

export function purchase(id: string, account: JurnlAccountRecord, merchant: string, amount: number, category: string, daysAgo: number, at: string): LedgerEntry {
  const occurred_on = addDays(TODAY, -daysAgo);
  const card = account.account_type === 'CREDIT_CARD';
  return {
    id,
    merchant,
    amount,
    direction: 'EXPENSE',
    when: occurred_on,
    account: account.display_name,
    account_id: account.account_id,
    category,
    status: 'CLEARED',
    recurring: false,
    memo: '',
    source: 'ADDED',
    related: null,
    txn_class: card ? 'CREDIT_PURCHASE' : 'EXPENSE',
    occurred_on,
    recorded_at: at,
    confirmation: 'RECORDED_BY_YOU',
    origin_family: 'F04',
    link: null,
    obligation_id: null,
    occurrence_date: null,
    counterparty_account_id: null,
  } as LedgerEntry;
}

export function dot01World() {
  const w = f05World('carousel');
  const now = new Date().toISOString();
  const byId = (id: string) => w.snapshot.accounts.find((a) => a.account_id === id)!;
  const extra: LedgerEntry[] = [
    purchase('tx-d01-trattoria', byId('bank'), 'TRATTORIA LUCIA', 84.2, 'DINING', 5, now),
    purchase('tx-d01-utility', byId('bank'), 'UTILITY CO', 120, 'UTILITIES', 12, now),
    purchase('tx-d01-books', byId('bank'), 'BOOKSHOP', 18.75, 'SHOPPING', 20, now),
    purchase('tx-d01-market', byId('cash'), 'MARKET STALL', 12, 'FOOD', 2, now),
    purchase('tx-d01-coffee', byId('cash'), 'COFFEE CART', 4.5, 'DINING', 0, now),
    purchase('tx-d01-vesuvio', byId('visa'), 'CAFFE VESUVIO', 42.5, 'DINING', 3, now),
    purchase('tx-d01-fuel', byId('visa'), 'FUEL STATION', 55, 'FUEL', 7, now),
  ];
  return { ...w, snapshot: { ...w.snapshot, transactions: [...w.snapshot.transactions, ...extra] } };
}
