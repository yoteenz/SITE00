/**
 * F07 bills and subscriptions — payment lifecycle.
 *
 * The obligation record (F07) is the plan: name, amount, cadence, next due date, paying account. A payment is ONE ledger
 * entry (F04) carrying obligation_id + occurrence_date; Activity shows that entry — it never copies the bill.
 *  - Paying the full occurrence advances next_due_date by the cadence (one-time bills become COMPLETED).
 *  - A partial payment keeps the occurrence open with the rest still due.
 *  - Skip / reschedule change dates only; no money moves and nothing is marked paid.
 *  - Recurrence only ever produces scheduled occurrences — never completed payments.
 */

import { isActivityEntry } from '../banking/activity';
import type { JurnlAccountRecord } from '../foundation/accounts';
import {
  addDays,
  compareCalendarDates,
  formatCalendarDate,
  getTodayKey,
  isCalendarDate,
  nextOccurrenceAfter,
  occurrencesThrough,
  type CalendarDate,
  type RecurrenceType,
} from '../foundation/dates';
import type { JurnlObligation, ObligationKind, ObligationOccurrenceLog } from '../foundation/obligations';
import type { JurnlReservation } from '../foundation/reservations';
import type { LedgerEntry } from '../home/moneyTypes';
import { accountNature, sumCents, toCents } from '../ledger/accounting';
import { applyOp, buildEntry, money, type OpResult } from '../ledger/ledgerOps';
import { getRepository } from '../repository/deviceRepository';
import { newEntityId } from '../repository/ids';
import type { FinancialCommit } from '../repository/types';
import { buildReleaseReservations, reservationsFor, reservedFor, settleReservationsForPayment } from './reservations';

/** Safe to Spend counts bill occurrences due within this many days from today (overdue included). */
export const STS_WINDOW_DAYS = 30;

export const CADENCE_LABEL: Record<RecurrenceType, string> = {
  NONE: 'ONE TIME',
  WEEKLY: 'WEEKLY',
  BIWEEKLY: 'EVERY 2 WEEKS',
  MONTHLY: 'MONTHLY',
  QUARTERLY: 'EVERY 3 MONTHS',
  ANNUAL: 'YEARLY',
  IRREGULAR: 'IRREGULAR',
};

export function anchorDayOf(ob: Pick<JurnlObligation, 'anchor_day' | 'next_due_date'>): number {
  return ob.anchor_day && ob.anchor_day >= 1 && ob.anchor_day <= 31 ? ob.anchor_day : Number(ob.next_due_date.slice(8, 10));
}

/** Σ recorded payments toward one occurrence of an obligation. */
export function paidTowardOccurrence(entries: LedgerEntry[], obligationId: string, occurrence: CalendarDate): number {
  return sumCents(entries.filter((e) => isActivityEntry(e) && e.obligation_id === obligationId && e.occurrence_date === occurrence).map((e) => Math.abs(e.amount)));
}

export function paymentsFor(entries: LedgerEntry[], obligationId: string): LedgerEntry[] {
  return entries
    .filter((e) => isActivityEntry(e) && e.obligation_id === obligationId)
    .sort((a, b) => (b.occurred_on ?? '').localeCompare(a.occurred_on ?? '') || (b.recorded_at ?? '').localeCompare(a.recorded_at ?? ''));
}

export type FundingState = 'PAID' | 'READY' | 'PARTLY_SET_ASIDE' | 'NOTHING_SET_ASIDE' | 'AMOUNT_UNKNOWN';

export type ObligationFunding = {
  obligation_id: string;
  occurrence_date: CalendarDate;
  amount: number;
  paid: number;
  /** Still due for this occurrence: amount − paid. */
  remaining: number;
  /** Set aside toward the remaining amount (part of it, never extra). */
  reserved: number;
  /** remaining − reserved. */
  stillNeeded: number;
  state: FundingState;
  /** Plain fact line, e.g. "95 OF 140 SET ASIDE · 45 STILL NEEDED" in the display currency. */
  label: string;
};

export function obligationFunding(ob: JurnlObligation, entries: LedgerEntry[], reservations: JurnlReservation[]): ObligationFunding {
  const occurrence = ob.next_due_date;
  const amount = toCents(Math.max(0, ob.amount));
  const paid = paidTowardOccurrence(entries, ob.obligation_id, occurrence);
  const remaining = toCents(Math.max(0, amount - paid));
  const reserved = Math.min(remaining, reservedFor(reservations, 'OBLIGATION', ob.obligation_id, occurrence));
  const stillNeeded = toCents(Math.max(0, remaining - reserved));
  let state: FundingState;
  let label: string;
  if (amount <= 0) {
    state = 'AMOUNT_UNKNOWN';
    label = 'ADD THE AMOUNT TO PLAN FOR THIS';
  } else if (remaining <= 0) {
    state = 'PAID';
    label = `${money(amount)} PAID`;
  } else if (reserved >= remaining) {
    state = 'READY';
    label = paid > 0 ? `${money(paid)} PAID · ${money(reserved)} SET ASIDE FOR THE REST` : `${money(reserved)} SET ASIDE · READY TO PAY`;
  } else if (reserved > 0) {
    state = 'PARTLY_SET_ASIDE';
    label = `${money(reserved)} OF ${money(remaining)} SET ASIDE · ${money(stillNeeded)} STILL NEEDED`;
  } else {
    state = 'NOTHING_SET_ASIDE';
    label = paid > 0 ? `${money(paid)} PAID · ${money(remaining)} STILL DUE` : `NOTHING SET ASIDE · ${money(remaining)} NEEDED`;
  }
  return { obligation_id: ob.obligation_id, occurrence_date: occurrence, amount, paid, remaining, reserved, stillNeeded, state, label };
}

export type ScheduledOccurrence = { obligation: JurnlObligation; due_date: CalendarDate; amount: number; paid: number; remaining: number; isCurrent: boolean };

/**
 * Scheduled occurrences of an ACTIVE obligation from its current due date through `through`. Only the current
 * occurrence can carry payments; later ones are plans (never completed payments).
 */
export function scheduledOccurrences(ob: JurnlObligation, entries: LedgerEntry[], through: CalendarDate): ScheduledOccurrence[] {
  if (ob.status !== 'ACTIVE') return [];
  const amount = toCents(Math.max(0, ob.amount));
  const dates = ob.cadence === 'NONE' || ob.cadence === 'IRREGULAR' ? (compareCalendarDates(ob.next_due_date, through) <= 0 ? [ob.next_due_date] : []) : occurrencesThrough(ob.next_due_date, ob.cadence, through, anchorDayOf(ob));
  return dates.map((d, i) => {
    const paid = i === 0 ? paidTowardOccurrence(entries, ob.obligation_id, d) : 0;
    return { obligation: ob, due_date: d, amount, paid, remaining: toCents(Math.max(0, amount - paid)), isCurrent: i === 0 };
  });
}

// ─── Create / edit ───────────────────────────────────────────────────────────

export type ObligationInput = {
  name: string;
  amount: number;
  cadence: RecurrenceType;
  next_due_date: CalendarDate;
  kind: ObligationKind;
  account_id: string | null;
  category?: string | null;
  trial_end_date?: CalendarDate | null;
  notes?: string;
  /** This bill is the payment of this credit card (counted once, through the card). */
  linked_card_account_id?: string | null;
};

export function validateObligationInput(input: ObligationInput): string | null {
  if (!input.name.trim()) return 'ENTER A NAME.';
  if (!Number.isFinite(input.amount) || input.amount < 0) return `ENTER AN AMOUNT OF ${money(0)} OR MORE.`;
  if (!isCalendarDate(input.next_due_date)) return 'ENTER THE NEXT DUE DATE AS YYYY-MM-DD.';
  if (input.trial_end_date && !isCalendarDate(input.trial_end_date)) return 'ENTER THE TRIAL END DATE AS YYYY-MM-DD.';
  return null;
}

export function buildCreateObligation(input: ObligationInput): OpResult<JurnlObligation> {
  const error = validateObligationInput(input);
  if (error) return { ok: false, error };
  const now = new Date().toISOString();
  const ob: JurnlObligation = {
    obligation_id: newEntityId('obl'),
    name: input.name.trim().toUpperCase(),
    amount: toCents(input.amount),
    currency: 'USD',
    cadence: input.cadence,
    next_due_date: input.next_due_date,
    kind: input.kind,
    account_id: input.account_id,
    status: 'ACTIVE',
    skipped_once: false,
    created_at: now,
    updated_at: now,
    archived_at: null,
    anchor_day: Number(input.next_due_date.slice(8, 10)),
    category: input.category?.trim().toUpperCase() || null,
    trial_end_date: input.trial_end_date ?? null,
    notes: (input.notes ?? '').trim().toUpperCase(),
    price_history: [],
    occurrence_log: [],
    linked_card_account_id: input.linked_card_account_id ?? null,
  };
  return { ok: true, commit: { reason: 'OBLIGATION_CREATED', obligations: { upsert: [ob] } }, value: ob };
}

/**
 * Edits a bill or subscription. A new amount is recorded in price history; a new next due date also becomes the new
 * anchor day (it changes the schedule going forward). Payments already recorded keep their own dates and amounts.
 */
export function buildEditObligation(entries: LedgerEntry[], reservations: JurnlReservation[], ob: JurnlObligation, input: ObligationInput): OpResult<JurnlObligation> {
  const error = validateObligationInput(input);
  if (error) return { ok: false, error };
  const now = new Date().toISOString();
  const amount = toCents(input.amount);
  const priceChanged = amount !== toCents(ob.amount);
  const dateChanged = input.next_due_date !== ob.next_due_date;
  const next: JurnlObligation = {
    ...ob,
    name: input.name.trim().toUpperCase(),
    amount,
    cadence: input.cadence,
    next_due_date: input.next_due_date,
    kind: input.kind,
    account_id: input.account_id,
    category: input.category?.trim().toUpperCase() || null,
    trial_end_date: input.trial_end_date ?? null,
    notes: (input.notes ?? '').trim().toUpperCase(),
    anchor_day: dateChanged ? Number(input.next_due_date.slice(8, 10)) : anchorDayOf(ob),
    linked_card_account_id: input.linked_card_account_id === undefined ? ob.linked_card_account_id ?? null : input.linked_card_account_id,
    price_history: priceChanged ? [...(ob.price_history ?? []), { at: now, from: toCents(ob.amount), to: amount, effective: input.next_due_date }] : ob.price_history ?? [],
    updated_at: now,
  };
  const commit: FinancialCommit = { reason: 'OBLIGATION_EDITED', obligations: { upsert: [next] } };
  if (dateChanged) {
    // Keep payments and set-asides attached to the occurrence that moved.
    const moved = entries.filter((e) => e.obligation_id === ob.obligation_id && e.occurrence_date === ob.next_due_date).map((e) => ({ ...e, occurrence_date: input.next_due_date }));
    const res = reservationsFor(reservations, 'OBLIGATION', ob.obligation_id, ob.next_due_date).map((r) => ({ ...r, occurrence_date: input.next_due_date }));
    if (moved.length) commit.transactions = { upsert: moved };
    if (res.length) commit.reservations = { upsert: res };
  }
  // Never hold more aside than the (possibly lower) new amount still needs.
  const remaining = toCents(Math.max(0, amount - paidTowardOccurrence(entries, ob.obligation_id, ob.next_due_date)));
  const held = reservedFor(reservations, 'OBLIGATION', ob.obligation_id, ob.next_due_date);
  if (held > remaining) {
    const settled = settleReservationsForPayment(
      (commit.reservations?.upsert ?? []).length ? commit.reservations!.upsert! : reservations,
      'OBLIGATION',
      ob.obligation_id,
      input.next_due_date,
      0,
      '',
      remaining,
      null,
    );
    const merged = new Map((commit.reservations?.upsert ?? []).map((r) => [r.reservation_id, r]));
    for (const r of settled.upsert) merged.set(r.reservation_id, r);
    commit.reservations = { upsert: [...merged.values()] };
  }
  return { ok: true, commit, value: next };
}

// ─── Pay ─────────────────────────────────────────────────────────────────────

export type PayInput = { amount: number; account_id: string | null; paid_on: CalendarDate; keepExtraSetAside?: boolean; memo?: string };

export type PayValue = { entry: LedgerEntry; settled: boolean; nextDue: CalendarDate | null; applied: number; released: number; carried: number };

export function buildMarkPaid(
  accounts: JurnlAccountRecord[],
  entries: LedgerEntry[],
  reservations: JurnlReservation[],
  ob: JurnlObligation,
  input: PayInput,
): OpResult<PayValue> {
  if (ob.status !== 'ACTIVE') return { ok: false, error: 'RESUME THIS BEFORE RECORDING A PAYMENT.' };
  if (ob.linked_card_account_id) {
    const card = accounts.find((a) => a.account_id === ob.linked_card_account_id);
    // Paying a card is a CARD PAYMENT (owed goes down), never spending — recorded through the card so it counts once.
    return { ok: false, error: `THIS IS THE ${card?.display_name ?? 'CARD'} PAYMENT. RECORD IT AS A CARD PAYMENT SO THE CARD BALANCE GOES DOWN.` };
  }
  const account = accounts.find((a) => a.account_id === input.account_id && a.status === 'ACTIVE');
  if (!account) return { ok: false, error: 'CHOOSE THE ACCOUNT THIS WAS PAID FROM.' };
  if (!isCalendarDate(input.paid_on)) return { ok: false, error: 'ENTER THE PAYMENT DATE AS YYYY-MM-DD.' };
  const funding = obligationFunding(ob, entries, reservations);
  const amount = toCents(input.amount);
  if (!(amount > 0)) return { ok: false, error: `ENTER AN AMOUNT ABOVE ${money(0)}.` };
  if (funding.amount > 0 && amount > funding.remaining) {
    return { ok: false, error: `ONLY ${money(funding.remaining)} IS STILL DUE FOR ${formatCalendarDate(ob.next_due_date)}. ENTER THAT OR LESS, OR EDIT THE AMOUNT FIRST.` };
  }
  const occurrence = ob.next_due_date;
  const liability = accountNature(account.account_type) === 'LIABILITY';
  const entry = buildEntry({
    merchant: ob.name,
    amount,
    direction: 'EXPENSE',
    account,
    // Paid with a credit card: the card owes more; no asset money moved. Otherwise money left the account.
    txn_class: liability ? 'CREDIT_PURCHASE' : 'EXPENSE',
    category: ob.category || (ob.kind === 'SUBSCRIPTION' ? 'SUBSCRIPTION' : 'BILLS'),
    occurred_on: input.paid_on,
    memo: input.memo ?? `${ob.kind === 'SUBSCRIPTION' ? 'SUBSCRIPTION' : 'BILL'} DUE ${occurrence}`,
    origin_family: 'F07',
    link: { kind: 'BILL_PAYMENT', id: newEntityId('billpay'), leg: 'SINGLE' },
    obligation_id: ob.obligation_id,
    occurrence_date: occurrence,
  });
  const paidAfter = toCents(funding.paid + amount);
  const remainingAfter = funding.amount > 0 ? toCents(Math.max(0, funding.amount - paidAfter)) : 0;
  const settled = remainingAfter <= 0;
  const now = new Date().toISOString();
  let next: JurnlObligation = ob;
  let nextDue: CalendarDate | null = ob.next_due_date;
  if (settled) {
    const log: ObligationOccurrenceLog = { due_date: occurrence, outcome: 'PAID', at: now };
    const origin = originalDateOf(ob);
    nextDue = nextOccurrenceAfter(origin, ob.cadence, anchorDayOf(ob));
    next = nextDue ?
      { ...ob, next_due_date: nextDue, skipped_once: false, occurrence_log: [...(ob.occurrence_log ?? []), log], updated_at: now }
    : { ...ob, status: 'COMPLETED', occurrence_log: [...(ob.occurrence_log ?? []), log], updated_at: now };
  }
  const carryTo = settled && input.keepExtraSetAside && nextDue ? nextDue : null;
  const res = settleReservationsForPayment(reservations, 'OBLIGATION', ob.obligation_id, occurrence, amount, account.account_id, remainingAfter, carryTo);
  const commit: FinancialCommit = {
    reason: 'OBLIGATION_PAID',
    transactions: { upsert: [entry] },
    obligations: next === ob ? undefined : { upsert: [next] },
    reservations: res.upsert.length ? { upsert: res.upsert } : undefined,
  };
  return { ok: true, commit, value: { entry, settled, nextDue: next.status === 'COMPLETED' ? null : nextDue, applied: res.applied, released: res.released, carried: res.carried } };
}

/** The scheduled (pre-reschedule) date of the current occurrence, so a moved occurrence does not shift the schedule. */
function originalDateOf(ob: JurnlObligation): CalendarDate {
  const moved = [...(ob.occurrence_log ?? [])].reverse().find((l) => l.outcome === 'RESCHEDULED' && l.moved_to === ob.next_due_date);
  return moved?.due_date ?? ob.next_due_date;
}

/**
 * Undoes one recorded payment (a mistake). The ledger entry is removed; if that payment had completed an occurrence, the
 * bill goes back to that due date. Only the current or most recently paid occurrence can be undone.
 */
export function buildUndoPayment(entries: LedgerEntry[], ob: JurnlObligation, entryId: string): OpResult<JurnlObligation> {
  const entry = entries.find((e) => e.id === entryId && e.obligation_id === ob.obligation_id && e.source === 'ADDED');
  if (!entry || !entry.occurrence_date) return { ok: false, error: 'PAYMENT NOT FOUND.' };
  const occ = entry.occurrence_date;
  const now = new Date().toISOString();
  const log = ob.occurrence_log ?? [];
  const lastPaid = [...log].reverse().find((l) => l.outcome === 'PAID');
  let next: JurnlObligation = ob;
  if (occ === ob.next_due_date && ob.status === 'ACTIVE') {
    // Current occurrence (partial payment) — nothing to roll back.
    next = { ...ob, updated_at: now };
  } else if (lastPaid && lastPaid.due_date === occ) {
    next = {
      ...ob,
      status: ob.status === 'COMPLETED' ? 'ACTIVE' : ob.status,
      next_due_date: occ,
      occurrence_log: [...log, { due_date: occ, outcome: 'PAYMENT_UNDONE', at: now }],
      updated_at: now,
    };
  } else {
    return { ok: false, error: 'ONLY THE MOST RECENT PAYMENT CAN BE UNDONE HERE. EDIT OLDER ONES IN ACTIVITY.' };
  }
  return { ok: true, commit: { reason: 'OBLIGATION_PAYMENT_UNDONE', transactions: { remove: [entry.id] }, obligations: { upsert: [next] } }, value: next };
}

// ─── Skip / reschedule / pause / cancel ──────────────────────────────────────

/** Skips the current occurrence: no payment is recorded and the bill moves to its next date. Set-asides move with it. */
export function buildSkipOccurrence(entries: LedgerEntry[], reservations: JurnlReservation[], ob: JurnlObligation): OpResult<JurnlObligation> {
  if (ob.status !== 'ACTIVE') return { ok: false, error: 'ONLY ACTIVE BILLS CAN SKIP A DATE.' };
  if (paidTowardOccurrence(entries, ob.obligation_id, ob.next_due_date) > 0) return { ok: false, error: 'PART OF THIS ONE IS PAID. RECORD THE REST OR UNDO THE PAYMENT FIRST.' };
  const nextDue = nextOccurrenceAfter(originalDateOf(ob), ob.cadence, anchorDayOf(ob));
  if (!nextDue) return { ok: false, error: 'A ONE-TIME BILL HAS NO NEXT DATE. CHANGE ITS DATE OR STOP TRACKING IT.' };
  const now = new Date().toISOString();
  const next: JurnlObligation = {
    ...ob,
    next_due_date: nextDue,
    skipped_once: true,
    occurrence_log: [...(ob.occurrence_log ?? []), { due_date: ob.next_due_date, outcome: 'SKIPPED', at: now }],
    updated_at: now,
  };
  const res = reservationsFor(reservations, 'OBLIGATION', ob.obligation_id, ob.next_due_date).map((r) => ({
    ...r,
    occurrence_date: nextDue,
    history: [...r.history, { at: now, action: 'CARRIED' as const, amount: r.amount, note: `TO ${nextDue}` }],
    updated_at: now,
  }));
  return { ok: true, commit: { reason: 'OCCURRENCE_SKIPPED', obligations: { upsert: [next] }, reservations: res.length ? { upsert: res } : undefined }, value: next };
}

/** Moves only the current occurrence to a new date; the schedule after it is unchanged. */
export function buildRescheduleOccurrence(entries: LedgerEntry[], reservations: JurnlReservation[], ob: JurnlObligation, newDate: CalendarDate): OpResult<JurnlObligation> {
  if (!isCalendarDate(newDate)) return { ok: false, error: 'ENTER THE NEW DATE AS YYYY-MM-DD.' };
  if (newDate === ob.next_due_date) return { ok: false, error: 'CHOOSE A DIFFERENT DATE.' };
  const now = new Date().toISOString();
  const original = originalDateOf(ob);
  const next: JurnlObligation = {
    ...ob,
    next_due_date: newDate,
    occurrence_log: [...(ob.occurrence_log ?? []), { due_date: original, outcome: 'RESCHEDULED', moved_to: newDate, at: now }],
    updated_at: now,
  };
  const moved = entries.filter((e) => e.obligation_id === ob.obligation_id && e.occurrence_date === ob.next_due_date).map((e) => ({ ...e, occurrence_date: newDate }));
  const res = reservationsFor(reservations, 'OBLIGATION', ob.obligation_id, ob.next_due_date).map((r) => ({ ...r, occurrence_date: newDate, updated_at: now }));
  return {
    ok: true,
    commit: { reason: 'OCCURRENCE_RESCHEDULED', obligations: { upsert: [next] }, transactions: moved.length ? { upsert: moved } : undefined, reservations: res.length ? { upsert: res } : undefined },
    value: next,
  };
}

/**
 * PAUSED: kept but not counted. CANCELLED: tracking stops in JURNL (this does not cancel anything with the merchant);
 * money set aside for it is released. ACTIVE: resumes.
 */
export function buildSetObligationStatus(reservations: JurnlReservation[], ob: JurnlObligation, status: 'ACTIVE' | 'PAUSED' | 'CANCELLED', today: CalendarDate): OpResult<JurnlObligation> {
  const now = new Date().toISOString();
  let next: JurnlObligation = { ...ob, status, updated_at: now };
  if (status === 'PAUSED') next = { ...next, paused_at: now };
  if (status === 'CANCELLED') next = { ...next, cancelled_at: now };
  if (status === 'ACTIVE') {
    next = { ...next, paused_at: null, cancelled_at: null };
    // A resumed bill whose date passed while paused restarts at its next date from today.
    if (compareCalendarDates(ob.next_due_date, today) < 0 && ob.cadence !== 'NONE' && ob.cadence !== 'IRREGULAR') {
      let d: CalendarDate | null = ob.next_due_date;
      let guard = 0;
      while (d && compareCalendarDates(d, today) < 0 && guard < 400) {
        d = nextOccurrenceAfter(d, ob.cadence, anchorDayOf(ob));
        guard += 1;
      }
      if (d) next = { ...next, next_due_date: d };
    }
  }
  const commit: FinancialCommit = { reason: `OBLIGATION_${status}`, obligations: { upsert: [next] } };
  if (status === 'CANCELLED') {
    const ids = reservationsFor(reservations, 'OBLIGATION', ob.obligation_id).map((r) => r.reservation_id);
    if (ids.length) {
      const rel = buildReleaseReservations(reservations, ids, 'TRACKING STOPPED');
      if (rel.ok) commit.reservations = rel.commit.reservations;
    }
  }
  return { ok: true, commit, value: next };
}

// ─── Repository wrappers ─────────────────────────────────────────────────────

function s() {
  return getRepository().getSnapshot();
}

export function allObligations(): JurnlObligation[] {
  return s().obligations;
}

export function createBillOrSubscription(input: ObligationInput): OpResult<JurnlObligation> {
  return applyOp(buildCreateObligation(input));
}

export function editBillOrSubscription(ob: JurnlObligation, input: ObligationInput): OpResult<JurnlObligation> {
  const snap = s();
  return applyOp(buildEditObligation(snap.transactions, snap.reservations, ob, input));
}

export function markObligationPaid(ob: JurnlObligation, input: PayInput): OpResult<PayValue> {
  const snap = s();
  return applyOp(buildMarkPaid(snap.accounts, snap.transactions, snap.reservations, ob, input));
}

export function undoObligationPayment(ob: JurnlObligation, entryId: string): OpResult<JurnlObligation> {
  return applyOp(buildUndoPayment(s().transactions, ob, entryId));
}

export function skipObligationOccurrence(ob: JurnlObligation): OpResult<JurnlObligation> {
  const snap = s();
  return applyOp(buildSkipOccurrence(snap.transactions, snap.reservations, ob));
}

export function rescheduleObligationOccurrence(ob: JurnlObligation, date: CalendarDate): OpResult<JurnlObligation> {
  const snap = s();
  return applyOp(buildRescheduleOccurrence(snap.transactions, snap.reservations, ob, date));
}

/** Links (or unlinks with null) a bill to the card whose payment it is. */
export function linkObligationToCard(ob: JurnlObligation, cardAccountId: string | null): OpResult<JurnlObligation> {
  const next: JurnlObligation = { ...ob, linked_card_account_id: cardAccountId, updated_at: new Date().toISOString() };
  return applyOp({ ok: true, commit: { reason: cardAccountId ? 'OBLIGATION_LINKED_TO_CARD' : 'OBLIGATION_UNLINKED', obligations: { upsert: [next] } }, value: next });
}

export function setObligationStatus(ob: JurnlObligation, status: 'ACTIVE' | 'PAUSED' | 'CANCELLED', today: CalendarDate = getTodayKey()): OpResult<JurnlObligation> {
  return applyOp(buildSetObligationStatus(s().reservations, ob, status, today));
}

export function windowEnd(today: CalendarDate = getTodayKey()): CalendarDate {
  return addDays(today, STS_WINDOW_DAYS);
}
