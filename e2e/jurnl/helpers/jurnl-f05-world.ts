/**
 * Synthetic worlds for the F05 MONEY motion pilot (no real data). APPROVED mirrors the reference composition's four
 * places (names and amounts are inputs, not baked into any asset): BANK ACCOUNT $1,260 · RIDESHARE CARD $840 (payout
 * debit) · CASH ON HAND $350 · CREDIT CARD owes $780 of $2,000, minimum $35 due in 5 days.
 */
import type { JurnlAccountRecord } from '../../../src/projects/jurnl/data/foundation/accounts';
import { addDays, getTodayKey } from '../../../src/projects/jurnl/data/foundation/dates';
import { acct, financialWorld } from './jurnl-financial-world';

const TODAY = getTodayKey();

export type F05WorldKind = 'approved' | 'none' | 'one' | 'many';

function card(id: string, owed: number, limit: number, min: number) {
  const now = new Date().toISOString();
  return {
    account_id: id,
    credit_limit: limit,
    current_balance: owed,
    minimum_payment: min,
    payment_due_day: null,
    statement_day: null,
    apr: 24.9,
    statement_balance: owed,
    statement_closing_date: addDays(TODAY, -10),
    payment_due_date: addDays(TODAY, 5),
    carries_interest_balance: false,
    terms_entered_at: now,
    updated_at: now,
  };
}

export function f05Accounts(kind: F05WorldKind): JurnlAccountRecord[] {
  const approved = [
    acct('bank', 'BANK ACCOUNT', 'CHECKING', 1260),
    acct('ride', 'RIDESHARE CARD', 'DEBIT_CARD', 840, { is_payout_card: true }),
    acct('cash', 'CASH ON HAND', 'CASH', 350),
    acct('visa', 'CREDIT CARD', 'CREDIT_CARD', 780, { credit_limit: 2000, available_balance: 1220, include_in_safe_to_spend: false }),
  ];
  if (kind === 'none') return [];
  if (kind === 'one') return [approved[0]!];
  if (kind === 'many')
    return [
      ...approved,
      acct('save', 'EMERGENCY SAVINGS', 'SAVINGS', 2400, { include_in_safe_to_spend: false }),
      acct('long', 'NEIGHBOURHOOD CREDIT UNION EVERYDAY CHECKING', 'CHECKING', 95.5),
      acct('loan', 'CAR LOAN', 'LOAN', 6400, { include_in_safe_to_spend: false }),
    ];
  return approved;
}

export function f05World(kind: F05WorldKind = 'approved') {
  const base = financialWorld();
  const accounts = f05Accounts(kind);
  const cards = accounts.filter((a) => a.account_type === 'CREDIT_CARD').map((a) => card(a.account_id, a.balance, a.credit_limit ?? 2000, 35));
  return { ...base, snapshot: { ...base.snapshot, accounts, creditAttributes: cards, transactions: [], obligations: [] } };
}
