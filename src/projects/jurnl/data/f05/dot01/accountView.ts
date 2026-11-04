/**
 * F05 DOT 01 — one place, read from its canonical owners only (no balance is computed here):
 *   position (held / owed, entered, updated, freshness)   ledger/accounting.computeLedgerPositions
 *   money moving (incoming, not left yet, in transit out)  ledger/transferSettlement (#1706) via computeMoneyPicture
 *   money set aside in this place                          F07 reservations (ACTIVE, held in this account)
 *   card terms (limit, minimum, due date)                  F12 credit attributes
 *   usual purposes                                         ledger/moneyPositions.usualPurposesFor
 */
import { accountById } from '../../foundation/accounts';
import type { JurnlAccountRecord } from '../../foundation/accounts';
import { addDays, getTodayKey, type CalendarDate } from '../../foundation/dates';
import { computeMoneyPicture } from '../../ledger/moneyPicture';
import type { AccountPosition } from '../../ledger/accounting';
import { toCents } from '../../ledger/accounting';
import { usualPurposesFor } from '../../ledger/moneyPositions';
import type { MoneyPurpose } from '../../ledger/purposes';
import { getRepository } from '../../repository/deviceRepository';
import { artFor, type MoneyPaperArt } from '../moneyParentReading';

export type Dot01Kind = MoneyPaperArt; // bank · payout (rideshare / payout card) · cash · credit

export type AccountView = {
  account: JurnlAccountRecord;
  kind: Dot01Kind;
  liability: boolean;
  position: AccountPosition | null;
  held: number;
  owed: number;
  entered: number;
  setAside: number;
  incoming: number;
  waitingToLeave: number;
  inTransitOut: number;
  creditLimit: number | null;
  availableCredit: number | null;
  minimumDue: number | null;
  dueDate: CalendarDate | null;
  purposes: MoneyPurpose[];
  updatedOn: CalendarDate | null;
  daysSinceUpdate: number | null;
  entryCount: number;
  archived: boolean;
};

export function kindOf(a: Pick<JurnlAccountRecord, 'account_type' | 'is_payout_card'>): Dot01Kind {
  return artFor(a.account_type, !!a.is_payout_card);
}

export function accountView(accountId: string, today: CalendarDate = getTodayKey()): AccountView | null {
  const account = accountById(accountId) ?? getRepository().listAccounts().find((a) => a.account_id === accountId) ?? null;
  if (!account) return null;
  const snap = getRepository().getSnapshot();
  const pic = computeMoneyPicture(snap.accounts, snap.creditAttributes, snap.transactions, today);
  const p = pic.positions.find((x) => x.account_id === accountId) ?? null;
  const t = pic.transferTotals.byAccount.get(accountId);
  const setAside = toCents((snap.reservations ?? []).filter((r) => r.status === 'ACTIVE' && r.account_id === accountId).reduce((s, r) => s + r.amount, 0));
  const terms = snap.creditAttributes.find((c) => c.account_id === accountId) ?? null;
  const liability = p?.nature === 'LIABILITY' || account.account_type === 'CREDIT_CARD' || account.account_type === 'LOAN';
  return {
    account,
    kind: kindOf(account),
    liability,
    position: p,
    held: p?.held ?? 0,
    owed: p?.owed ?? 0,
    entered: p?.entered ?? account.balance,
    setAside,
    incoming: t?.incoming ?? 0,
    waitingToLeave: t?.waitingToLeave ?? 0,
    inTransitOut: t?.inTransitOut ?? 0,
    creditLimit: p?.creditLimit ?? terms?.credit_limit ?? null,
    availableCredit: p?.availableCredit ?? null,
    minimumDue: terms?.minimum_payment ?? null,
    dueDate: (terms?.payment_due_date as CalendarDate | null) ?? null,
    purposes: usualPurposesFor(account),
    updatedOn: p?.updatedOn ?? null,
    daysSinceUpdate: p?.daysSinceUpdate ?? null,
    entryCount: p?.entryCount ?? 0,
    archived: account.status !== 'ACTIVE',
  };
}

/** Days until a date (negative = past), for due-date labels. */
export function daysFrom(today: CalendarDate, d: CalendarDate | null): number | null {
  if (!d) return null;
  const ms = Date.parse(`${d}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`);
  return Math.round(ms / 86_400_000);
}

export const KIND_TITLE: Record<Dot01Kind, string> = { bank: 'BANK ACCOUNT', payout: 'RIDESHARE CARD', cash: 'CASH ON HAND', credit: 'CREDIT CARD' };
export { addDays };
