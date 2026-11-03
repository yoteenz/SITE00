/**
 * Ledger write operations (pure builders → FinancialCommit). Every operation either returns one atomic commit or a
 * plain-language error; nothing is written on error. Thin repository wrappers live at the bottom.
 */

import type { JurnlAccountRecord } from '../foundation/accounts';
import type { TxnClass } from '../foundation/categories';
import { addDays, compareCalendarDates, daysUntil, getTodayKey, type CalendarDate } from '../foundation/dates';
import type { EntryLink, LedgerEntry } from '../home/moneyTypes';
import { formatMoney } from '../home/currency';
import { getRepository } from '../repository/deviceRepository';
import { newEntityId } from '../repository/ids';
import type { FinancialCommit } from '../repository/types';
import { accountNature, computeLedgerPositions, resolveEntryAccount, toCents } from './accounting';
import type { LegSettlement } from '../home/moneyTypes';
import { buildTransferAction, canRemoveTransfer, transferViews, TRANSFER_STATE_LABEL, type TransferAction, type TransferStart } from './transferSettlement';

export type OpResult<T = undefined> = { ok: true; commit: FinancialCommit; value: T } | { ok: false; error: string };

const AMOUNT_RE = /^\d+(\.\d{1,2})?$/;

/** Parses a user-entered amount. Empty → 0 when `allowZero`. Returns null for anything that is not a valid money amount. */
export function parseMoneyInput(raw: string, allowZero = false): number | null {
  const t = raw.trim().replace(/,/g, '');
  if (!t) return allowZero ? 0 : null;
  if (!AMOUNT_RE.test(t)) return null;
  const n = toCents(Number(t));
  if (!allowZero && n <= 0) return null;
  return n;
}

/** Money in the user's display currency (canonical USD converted by the shared formatter). */
export function money(n: number): string {
  return formatMoney(toCents(n));
}

type EntryInput = {
  merchant: string;
  amount: number;
  direction: LedgerEntry['direction'];
  account: JurnlAccountRecord;
  txn_class: TxnClass;
  category: string;
  occurred_on: CalendarDate;
  memo?: string;
  origin_family: string;
  link?: EntryLink | null;
  obligation_id?: string | null;
  occurrence_date?: CalendarDate | null;
  counterparty_account_id?: string | null;
  pending?: boolean;
  settlement?: LegSettlement;
  id?: string;
  recorded_at?: string;
};

export function buildEntry(input: EntryInput): LedgerEntry {
  return {
    id: input.id ?? newEntityId('tx'),
    merchant: input.merchant.trim().toUpperCase(),
    amount: toCents(Math.abs(input.amount)),
    direction: input.direction,
    when: input.occurred_on,
    account: input.account.display_name,
    account_id: input.account.account_id,
    category: input.category,
    status: input.pending || (input.settlement != null && input.settlement !== 'SETTLED') ? 'PENDING' : 'CLEARED',
    recurring: false,
    memo: (input.memo ?? '').trim().toUpperCase(),
    source: 'ADDED',
    related: null,
    txn_class: input.txn_class,
    occurred_on: input.occurred_on,
    recorded_at: input.recorded_at ?? new Date().toISOString(),
    confirmation: input.pending ? 'PENDING_CONFIRMATION' : 'RECORDED_BY_YOU',
    origin_family: input.origin_family,
    link: input.link ?? null,
    obligation_id: input.obligation_id ?? null,
    occurrence_date: input.occurrence_date ?? null,
    counterparty_account_id: input.counterparty_account_id ?? null,
    ...(input.settlement ? { settlement: input.settlement, settlement_history: [{ at: input.recorded_at ?? new Date().toISOString(), state: input.settlement, action: 'RECORDED' }] } : {}),
  };
}

function activeAccount(accounts: JurnlAccountRecord[], id: string | null | undefined): JurnlAccountRecord | null {
  if (!id) return null;
  return accounts.find((a) => a.account_id === id && a.status === 'ACTIVE') ?? null;
}

// ─── Spending ────────────────────────────────────────────────────────────────

export type ExpenseInput = { merchant: string; amount: number; account_id: string | null; category: string; occurred_on: CalendarDate; memo?: string; origin_family?: string };

/**
 * One purchase. Bank / debit / cash → EXPENSE (money held goes down). Credit card → CREDIT_PURCHASE (amount owed goes
 * up; no money leaves any asset account). Either way it is spending in its category, counted once.
 */
export function buildExpense(accounts: JurnlAccountRecord[], input: ExpenseInput): OpResult<LedgerEntry> {
  const account = activeAccount(accounts, input.account_id);
  if (!account) return { ok: false, error: 'CHOOSE THE ACCOUNT YOU PAID WITH.' };
  if (!(input.amount > 0)) return { ok: false, error: `ENTER AN AMOUNT ABOVE ${money(0)}.` };
  if (!input.merchant.trim()) return { ok: false, error: 'ENTER WHAT THIS WAS FOR.' };
  const liability = accountNature(account.account_type) === 'LIABILITY';
  const entry = buildEntry({
    merchant: input.merchant,
    amount: input.amount,
    direction: 'EXPENSE',
    account,
    txn_class: liability ? 'CREDIT_PURCHASE' : 'EXPENSE',
    category: input.category.trim().toUpperCase() || 'OTHER',
    occurred_on: input.occurred_on,
    memo: input.memo,
    origin_family: input.origin_family ?? 'F04',
  });
  return { ok: true, commit: { reason: 'EXPENSE_RECORDED', transactions: { upsert: [entry] } }, value: entry };
}

// ─── Transfers and card payments ─────────────────────────────────────────────

export type TransferInput = {
  from_account_id: string | null;
  to_account_id: string | null;
  amount: number;
  occurred_on: CalendarDate;
  memo?: string;
  /**
   * Where the money is when this is recorded (stabilization sprint):
   *   COMPLETED  — left the source and arrived (both legs apply);
   *   IN_TRANSIT — left the source, not arrived (source reduced; destination unchanged; amount in transit);
   *   PENDING    — started, has not left the source (no balance changes);
   *   SCHEDULED  — planned for the date (no balance changes).
   * Defaults to COMPLETED, or SCHEDULED for a future date.
   */
  start?: TransferStart;
  /** @deprecated pre-stabilization flag ("STILL ON ITS WAY"): treated as PENDING — it never proved the money left. */
  pending?: boolean;
  origin_family?: string;
  /** Re-uses an existing transfer id (edit). */
  link_id?: string;
  /** Allow a second identical record after a duplicate warning. */
  allowDuplicate?: boolean;
};

export type TransferValue = { linkId: string; legs: LedgerEntry[]; kind: 'TRANSFER' | 'CARD_PAYMENT'; duplicateOf: string | null };

/** Same amount, same accounts, within 3 days → probably the same event recorded twice. */
export function findDuplicateTransfer(entries: LedgerEntry[], fromId: string, toId: string, amount: number, on: CalendarDate, excludeLinkId?: string): LedgerEntry | null {
  return (
    entries.find(
      (e) =>
        e.source === 'ADDED'
        && e.link?.leg === 'OUT'
        && (e.link.kind === 'TRANSFER' || e.link.kind === 'CARD_PAYMENT')
        && e.link.id !== excludeLinkId
        && e.account_id === fromId
        && e.counterparty_account_id === toId
        && toCents(e.amount) === toCents(amount)
        && e.occurred_on != null
        && Math.abs(daysUntil(e.occurred_on, on)) <= 3,
    ) ?? null
  );
}

/**
 * Moves money between two owned accounts as two linked legs (OUT of the source, IN to the destination). Total owned
 * money is unchanged and it is never income or spending. When the destination is a credit card or loan, the same two
 * legs are a CARD PAYMENT (CREDIT_PAYMENT / DEBT_PAYMENT): the source goes down and the amount owed goes down.
 */
export function buildTransfer(accounts: JurnlAccountRecord[], entries: LedgerEntry[], input: TransferInput): OpResult<TransferValue> {
  const from = activeAccount(accounts, input.from_account_id);
  const to = activeAccount(accounts, input.to_account_id);
  if (!from) return { ok: false, error: 'CHOOSE THE ACCOUNT THE MONEY LEAVES.' };
  if (!to) return { ok: false, error: 'CHOOSE THE ACCOUNT THE MONEY GOES TO.' };
  if (from.account_id === to.account_id) return { ok: false, error: 'CHOOSE TWO DIFFERENT ACCOUNTS.' };
  if (!(input.amount > 0)) return { ok: false, error: `ENTER AN AMOUNT ABOVE ${money(0)}.` };
  if (accountNature(from.account_type) === 'LIABILITY') {
    return { ok: false, error: `${from.display_name} IS A CREDIT ACCOUNT. MONEY CANNOT BE MOVED OUT OF IT HERE. RECORD A PURCHASE INSTEAD.` };
  }
  const toLiability = accountNature(to.account_type) === 'LIABILITY';
  const kind: TransferValue['kind'] = toLiability ? 'CARD_PAYMENT' : 'TRANSFER';
  const cls: TxnClass = !toLiability ? 'TRANSFER' : to.account_type === 'LOAN' ? 'DEBT_PAYMENT' : 'CREDIT_PAYMENT';
  const today = getTodayKey();
  const start: TransferStart = input.start ?? (input.pending ? 'PENDING' : compareCalendarDates(input.occurred_on, today) > 0 ? 'SCHEDULED' : 'COMPLETED');
  if (start !== 'SCHEDULED' && compareCalendarDates(input.occurred_on, today) > 0) {
    return { ok: false, error: 'A FUTURE DATE CAN ONLY BE PLANNED. CHOOSE PLANNED, OR USE TODAY OR AN EARLIER DATE.' };
  }
  const outSettlement: LegSettlement = start === 'COMPLETED' || start === 'IN_TRANSIT' ? 'SETTLED' : start;
  const inSettlement: LegSettlement = start === 'COMPLETED' ? 'SETTLED' : start === 'IN_TRANSIT' ? 'PENDING' : start;
  const live = new Set(transferViews(entries, today).filter((v) => v.state !== 'CANCELLED' && v.state !== 'FAILED' && v.state !== 'REVERSED').map((v) => v.linkId));
  const duplicate = findDuplicateTransfer(entries.filter((e) => !e.link || live.has(e.link.id)), from.account_id, to.account_id, input.amount, input.occurred_on, input.link_id);
  if (duplicate && !input.allowDuplicate) {
    return {
      ok: false,
      error: `A ${money(input.amount)} ${toLiability ? 'PAYMENT' : 'TRANSFER'} FROM ${from.display_name} TO ${to.display_name} IS ALREADY RECORDED ON ${duplicate.occurred_on}. RECORD IT AGAIN ONLY IF IT HAPPENED TWICE.`,
    };
  }
  const linkId = input.link_id ?? newEntityId(toLiability ? 'pay' : 'xfer');
  const existing = entries.filter((e) => e.link?.id === linkId);
  const outId = existing.find((e) => e.link?.leg === 'OUT')?.id;
  const inId = existing.find((e) => e.link?.leg === 'IN')?.id;
  const label = toLiability ? `PAYMENT TO ${to.display_name}` : `TRANSFER TO ${to.display_name}`;
  const origin = input.origin_family ?? (toLiability ? 'F12' : 'F05');
  const out = buildEntry({
    id: outId,
    merchant: label,
    amount: input.amount,
    direction: 'EXPENSE',
    account: from,
    txn_class: cls,
    category: toLiability ? 'DEBT_PAYMENT' : 'TRANSFER',
    occurred_on: input.occurred_on,
    memo: input.memo,
    origin_family: origin,
    link: { kind, id: linkId, leg: 'OUT' },
    counterparty_account_id: to.account_id,
    settlement: outSettlement,
  });
  const inn = buildEntry({
    id: inId,
    merchant: toLiability ? `PAYMENT FROM ${from.display_name}` : `TRANSFER FROM ${from.display_name}`,
    amount: input.amount,
    direction: 'INCOME',
    account: to,
    txn_class: cls,
    category: toLiability ? 'DEBT_PAYMENT' : 'TRANSFER',
    occurred_on: input.occurred_on,
    memo: input.memo,
    origin_family: origin,
    link: { kind, id: linkId, leg: 'IN' },
    counterparty_account_id: from.account_id,
    settlement: inSettlement,
  });
  const stale = existing.map((e) => e.id).filter((id) => id !== out.id && id !== inn.id);
  return {
    ok: true,
    commit: { reason: kind === 'CARD_PAYMENT' ? 'CARD_PAYMENT_RECORDED' : 'TRANSFER_RECORDED', transactions: { upsert: [out, inn], remove: stale } },
    value: { linkId, legs: [out, inn], kind, duplicateOf: duplicate?.id ?? null },
  };
}

/**
 * Removes every leg of a linked event (transfer, card payment, balance correction) together. A transfer whose money
 * is between accounts (in transit, or failed and coming back) cannot be removed: that would recreate or erase money.
 */
export function buildRemoveLinkedEvent(entries: LedgerEntry[], linkId: string, today: CalendarDate = getTodayKey()): OpResult<string[]> {
  const ids = entries.filter((e) => e.link?.id === linkId).map((e) => e.id);
  if (!ids.length) return { ok: false, error: 'THIS ENTRY WAS ALREADY REMOVED.' };
  const view = transferViews(entries, today).find((v) => v.linkId === linkId);
  if (view && !canRemoveTransfer(view.state)) {
    return { ok: false, error: `THIS MONEY IS ${TRANSFER_STATE_LABEL[view.state]}. RECORD WHETHER IT ARRIVED OR CAME BACK FIRST.` };
  }
  return { ok: true, commit: { reason: 'LINKED_EVENT_REMOVED', transactions: { remove: ids } }, value: ids };
}

/** Marks a transfer as arrived: both legs settle once (repeating it changes nothing). */
export function buildConfirmTransferArrived(entries: LedgerEntry[], linkId: string, today: CalendarDate = getTodayKey()): OpResult {
  const r = buildTransferAction(entries, linkId, 'RECEIVED', today);
  return r.ok ? { ok: true, commit: r.commit, value: undefined } : r;
}

// ─── Balance correction ──────────────────────────────────────────────────────

/**
 * The user says an account now holds (or owes) `target`. Instead of overwriting the entered balance — which would
 * silently re-count every entry already recorded — JURNL records one BALANCE CORRECTION for the difference. History
 * stays intact and the account then shows exactly `target`.
 */
export function buildBalanceCorrection(
  accounts: JurnlAccountRecord[],
  creditAttributes: Parameters<typeof computeLedgerPositions>[1],
  entries: LedgerEntry[],
  accountId: string,
  target: number,
  today: CalendarDate,
): OpResult<LedgerEntry | null> {
  const account = activeAccount(accounts, accountId);
  if (!account) return { ok: false, error: 'ACCOUNT NOT FOUND.' };
  if (!Number.isFinite(target) || target < 0) return { ok: false, error: `ENTER A BALANCE OF ${money(0)} OR MORE.` };
  const pos = computeLedgerPositions(accounts, creditAttributes, entries, today).positions.find((p) => p.account_id === accountId);
  if (!pos) return { ok: false, error: 'ACCOUNT NOT FOUND.' };
  const diff = toCents(target - pos.position);
  if (diff === 0) return { ok: true, commit: { reason: 'NO_CHANGE' }, value: null };
  const liability = pos.nature === 'LIABILITY';
  // Assets: more money held → money in. Liabilities: more owed → a charge (EXPENSE direction).
  const direction: LedgerEntry['direction'] = liability ? (diff > 0 ? 'EXPENSE' : 'INCOME') : diff > 0 ? 'INCOME' : 'EXPENSE';
  const entry = buildEntry({
    merchant: `BALANCE CORRECTION · ${account.display_name}`,
    amount: Math.abs(diff),
    direction,
    account,
    txn_class: 'ADJUSTMENT',
    category: 'ADJUSTMENT',
    occurred_on: today,
    memo: `SET TO ${money(target)} BY YOU`,
    origin_family: 'F05',
    link: { kind: 'BALANCE_CORRECTION', id: newEntityId('adj'), leg: 'SINGLE' },
  });
  return { ok: true, commit: { reason: 'BALANCE_CORRECTED', transactions: { upsert: [entry] } }, value: entry };
}

/** Group id of the event an entry belongs to (its own id when it stands alone). */
export function eventIdOf(entry: LedgerEntry): string {
  return entry.link?.id ?? entry.id;
}

/** Entries of the same event (both legs of a transfer, both legs of a daily earnings save). */
export function linkedEntries(entries: LedgerEntry[], entry: LedgerEntry): LedgerEntry[] {
  if (!entry.link) return [entry];
  return entries.filter((e) => e.link?.id === entry.link!.id);
}

export function isScheduled(entry: LedgerEntry, today: CalendarDate): boolean {
  return entry.occurred_on != null && compareCalendarDates(entry.occurred_on, today) > 0;
}

export function defaultDate(): CalendarDate {
  return getTodayKey();
}

export function yesterday(today: CalendarDate = getTodayKey()): CalendarDate {
  return addDays(today, -1);
}

// ─── Repository wrappers ─────────────────────────────────────────────────────

export function applyOp<T>(result: OpResult<T>): OpResult<T> {
  if (result.ok && (result.commit.transactions || result.commit.dailyEarnings || result.commit.reservations || result.commit.obligations || result.commit.creditAttributes || result.commit.accounts)) {
    getRepository().commit(result.commit);
  }
  return result;
}

function snap() {
  return getRepository().getSnapshot();
}

export function recordExpense(input: ExpenseInput): OpResult<LedgerEntry> {
  return applyOp(buildExpense(snap().accounts, input));
}

export function recordTransfer(input: TransferInput): OpResult<TransferValue> {
  const s = snap();
  return applyOp(buildTransfer(s.accounts, s.transactions, input));
}

export function removeLinkedEvent(linkId: string): OpResult<string[]> {
  return applyOp(buildRemoveLinkedEvent(snap().transactions, linkId));
}

export function confirmTransferArrived(linkId: string): OpResult {
  return applyOp(buildConfirmTransferArrived(snap().transactions, linkId));
}

/** Records one settlement step (money left, arrived, cancelled, failed, came back, reversed). Idempotent. */
export function recordTransferStep(linkId: string, action: TransferAction, opts: { returned?: boolean } = {}, today: CalendarDate = getTodayKey()) {
  const r = buildTransferAction(snap().transactions, linkId, action, today, opts);
  if (r.ok && r.changed) getRepository().commit(r.commit);
  return r;
}

export function correctAccountBalance(accountId: string, target: number, today: CalendarDate = getTodayKey()): OpResult<LedgerEntry | null> {
  const s = snap();
  return applyOp(buildBalanceCorrection(s.accounts, s.creditAttributes, s.transactions, accountId, target, today));
}

/**
 * The user enters what an account holds (or owes) right now. With no recorded entries yet, that becomes the entered
 * balance. Once entries exist, a BALANCE CORRECTION records the difference instead (so nothing is counted twice).
 */
export function setAccountBalance(accountId: string, target: number, today: CalendarDate = getTodayKey()): OpResult<LedgerEntry | null> {
  const s = snap();
  const account = activeAccount(s.accounts, accountId);
  if (!account) return { ok: false, error: 'ACCOUNT NOT FOUND.' };
  if (!Number.isFinite(target) || target < 0) return { ok: false, error: `ENTER A BALANCE OF ${money(0)} OR MORE.` };
  const pos = computeLedgerPositions(s.accounts, s.creditAttributes, s.transactions, today).positions.find((p) => p.account_id === accountId);
  if (pos && pos.entryCount === 0) {
    const value = toCents(target);
    const now = new Date().toISOString();
    if (pos.nature === 'ASSET') {
      getRepository().commit({ reason: 'BALANCE_ENTERED', accounts: { upsert: [{ ...account, balance: value, available_balance: value, as_of: today, updated_at: now, balance_entered_by_user: true }] } });
    } else {
      const attrs = s.creditAttributes.find((c) => c.account_id === accountId);
      const base = attrs ?? { account_id: accountId, credit_limit: account.credit_limit, current_balance: null, minimum_payment: null, payment_due_day: null, statement_day: null, apr: null, updated_at: now };
      getRepository().commit({
        reason: 'BALANCE_ENTERED',
        creditAttributes: { upsert: [{ ...base, current_balance: value, terms_entered_at: now, updated_at: now }] },
        accounts: { upsert: [{ ...account, balance: value, as_of: today, updated_at: now, balance_entered_by_user: true }] },
      });
    }
    return { ok: true, commit: { reason: 'BALANCE_ENTERED' }, value: null };
  }
  const r = correctAccountBalance(accountId, target, today);
  if (r.ok && !account.balance_entered_by_user) {
    getRepository().commit({ reason: 'BALANCE_CONFIRMED', accounts: { upsert: [{ ...getRepository().getSnapshot().accounts.find((a) => a.account_id === accountId)!, balance_entered_by_user: true }] } });
  }
  return r;
}

/**
 * Renames an account. Older entries that point to it only by name get its stable id in the same commit, so a rename
 * never detaches history from the account.
 */
export function renameAccount(accountId: string, newName: string): OpResult<JurnlAccountRecord> {
  const s = snap();
  const account = activeAccount(s.accounts, accountId);
  const name = newName.trim().toUpperCase();
  if (!account) return { ok: false, error: 'ACCOUNT NOT FOUND.' };
  if (name.length < 2) return { ok: false, error: 'ENTER A NAME.' };
  if (s.accounts.some((a) => a.status === 'ACTIVE' && a.account_id !== accountId && a.display_name === name)) return { ok: false, error: `ANOTHER ACCOUNT IS ALREADY CALLED ${name}.` };
  const backfill = s.transactions
    .filter((t) => !t.account_id && resolveEntryAccount(t, s.accounts)?.account_id === accountId)
    .map((t) => ({ ...t, account_id: accountId, account: name }));
  const next = { ...account, display_name: name, updated_at: new Date().toISOString() };
  return applyOp({ ok: true, commit: { reason: 'ACCOUNT_RENAMED', accounts: { upsert: [next] }, transactions: backfill.length ? { upsert: backfill } : undefined }, value: next });
}

export { resolveEntryAccount };
