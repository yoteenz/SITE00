import { useSyncExternalStore } from 'react';
import { creditAccounts, type JurnlAccountRecord } from '../foundation/accounts';
import type { JurnlCreditAttributes } from '../foundation/creditAttributes';
import { getTodayKey, type CalendarDate } from '../foundation/dates';
import { computeLedgerPositions, type AccountPosition } from '../ledger/accounting';
import { cachedRepoView } from '../repository/cachedRepoView';
import { getRepository } from '../repository/deviceRepository';
import { cardFacts, type CardFacts } from './creditGuidance';

export function useCreditAccounts(): JurnlAccountRecord[] {
  return useSyncExternalStore((cb) => getRepository().subscribe(cb), () => creditAccounts(), () => []);
}

export function creditAttributesFor(accountId: string): JurnlCreditAttributes | null {
  return getRepository().getCreditAttributes(accountId);
}

type TermsPatch = Partial<Omit<JurnlCreditAttributes, 'account_id' | 'updated_at'>>;

function pick<K extends keyof TermsPatch>(patch: TermsPatch, existing: JurnlCreditAttributes | null, key: K): JurnlCreditAttributes[K] | null {
  if (key in patch) return (patch[key] ?? null) as JurnlCreditAttributes[K] | null;
  return (existing?.[key] ?? null) as JurnlCreditAttributes[K] | null;
}

/**
 * Saves card terms the user entered. Keys present in `patch` replace the stored value (null clears it); absent keys keep
 * the stored value. Terms are manual — `terms_entered_at` records when, never a bank confirmation.
 */
export function upsertCreditTerms(accountId: string, patch: TermsPatch): JurnlCreditAttributes {
  const existing = getRepository().getCreditAttributes(accountId);
  const now = new Date().toISOString();
  const next: JurnlCreditAttributes = {
    account_id: accountId,
    credit_limit: pick(patch, existing, 'credit_limit'),
    current_balance: pick(patch, existing, 'current_balance'),
    minimum_payment: pick(patch, existing, 'minimum_payment'),
    payment_due_day: pick(patch, existing, 'payment_due_day'),
    statement_day: pick(patch, existing, 'statement_day'),
    apr: pick(patch, existing, 'apr'),
    statement_balance: pick(patch, existing, 'statement_balance'),
    statement_closing_date: pick(patch, existing, 'statement_closing_date'),
    payment_due_date: pick(patch, existing, 'payment_due_date'),
    promo_apr: pick(patch, existing, 'promo_apr'),
    promo_apr_end_date: pick(patch, existing, 'promo_apr_end_date'),
    carries_interest_balance: pick(patch, existing, 'carries_interest_balance'),
    payment_account_id: pick(patch, existing, 'payment_account_id'),
    terms_entered_at: now,
    updated_at: now,
  };
  return getRepository().upsertCreditAttributes(next);
}

function positionsNow(today: CalendarDate): AccountPosition[] {
  return cachedRepoView(`f12.positions.${today}`, () => {
    const s = getRepository().getSnapshot();
    return computeLedgerPositions(s.accounts, s.creditAttributes, s.transactions, today).positions;
  });
}

/** Canonical card facts (owed from the ledger, terms as entered). */
export function cardFactsFor(account: JurnlAccountRecord, today: CalendarDate = getTodayKey()): CardFacts | null {
  const pos = positionsNow(today).find((p) => p.account_id === account.account_id);
  if (!pos) return null;
  const s = getRepository().getSnapshot();
  return cardFacts(pos, creditAttributesFor(account.account_id), s.transactions, s.reservations, s.accounts, s.settings.purposeAccounts, today);
}

export function allCardFacts(today: CalendarDate = getTodayKey()): CardFacts[] {
  return cachedRepoView(`f12.cardFacts.${today}`, () => creditAccounts().map((a) => cardFactsFor(a, today)).filter((f): f is CardFacts => f != null));
}

export function creditSummary(account: JurnlAccountRecord) {
  const attrs = creditAttributesFor(account.account_id);
  const facts = cardFactsFor(account);
  const limit = facts?.limit ?? null;
  const used = facts?.owed ?? 0;
  const util = limit != null && limit > 0 ? Math.round((used / limit) * 100) : null;
  const minPay = attrs?.minimum_payment ?? null;
  const dueDay = attrs?.payment_due_day ?? null;
  return { attrs, limit, used, util, minPay, dueDay, facts };
}

/** Next calendar due date from day-of-month (manual terms only). */
export function nextPaymentDueDate(dueDay: number | null, today: CalendarDate = getTodayKey()): CalendarDate | null {
  if (dueDay == null || dueDay < 1 || dueDay > 28) return null;
  const [y, m, d] = today.split('-').map(Number);
  const day = Math.min(dueDay, 28);
  if (d <= day) return `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}` as CalendarDate;
  const nextMonth = m === 12 ? 1 : m + 1;
  const nextYear = m === 12 ? y + 1 : y;
  return `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}` as CalendarDate;
}

/**
 * Card payments for UPCOMING and Safe to Spend — one commitment per card per billing cycle:
 *   amount = minimum − payments the card confirmed − payments already on their way (scheduled before the due date,
 *   submitted, or left the account). A paid minimum drops out; an extra payment never adds a second minimum.
 * `linked_obligation_id` names a tracked bill that describes this same payment (the bill is then not counted again).
 */
export function creditPaymentProjections(today: CalendarDate = getTodayKey()) {
  const items: {
    account_id: string;
    label: string;
    amount: number;
    due_date: CalendarDate;
    minimum: number;
    paid: number;
    pending: number;
    payment_account_id: string | null;
    cycle_key: string;
    linked_obligation_id: string | null;
  }[] = [];
  const linked = getRepository()
    .getSnapshot()
    .obligations.filter((o) => o.status === 'ACTIVE' && o.linked_card_account_id);
  for (const f of allCardFacts(today)) {
    if (!f.dueDate || f.minimum == null || f.minimum <= 0 || (f.remainingMinimumAfterPending ?? 0) <= 0) continue;
    items.push({
      account_id: f.account.account_id,
      label: `${f.account.display_name} PAYMENT`,
      amount: f.remainingMinimumAfterPending!,
      due_date: f.dueDate,
      minimum: f.minimum,
      paid: f.paidSinceStatement,
      pending: f.pendingPayments,
      payment_account_id: f.paymentAccount?.account_id ?? null,
      cycle_key: `${f.account.account_id}:${f.statementClosingDate ?? 'NO_STATEMENT'}:${f.dueDate}`,
      linked_obligation_id: linked.find((o) => o.linked_card_account_id === f.account.account_id)?.obligation_id ?? null,
    });
  }
  return items;
}

/** Cards whose minimum is known: a tracked bill linked to one of these is the same payment and is counted through the card. */
export function cardsWithKnownMinimum(today: CalendarDate = getTodayKey()): Set<string> {
  return new Set(allCardFacts(today).filter((f) => f.minimum != null && f.minimum > 0 && f.dueDate).map((f) => f.account.account_id));
}
