/**
 * Money set aside toward one upcoming payment (bill, subscription or card payment).
 *
 * Invariants (tested in tests/jurnlFinancialInvariants.test.ts):
 *  R1. A reservation is bookkeeping only. It never creates a ledger entry, never moves money between accounts and never
 *      changes an account balance.
 *  R2. Money set aside for a payment is PART of that payment, never in addition to it: total reserved for a target is
 *      capped at what is still due, and Safe to Spend deducts the payment's remaining amount once (not amount + reserved).
 *  R3. Money is set aside from a specific account. One account's set-asides cannot exceed what it holds. A request that
 *      would over-commit the same dollars is refused with the exact shortfall; if spending later pushes an account
 *      below its set-asides, the over-commitment is reported, never hidden.
 */

import type { JurnlAccountRecord } from '../foundation/accounts';
import type { CalendarDate } from '../foundation/dates';
import type { JurnlReservation, ReservationChange, ReservationTargetKind } from '../foundation/reservations';
import type { AccountPosition } from '../ledger/accounting';
import { accountNature, sumCents, toCents } from '../ledger/accounting';
import { money, type OpResult } from '../ledger/ledgerOps';
import { newEntityId } from '../repository/ids';

export type ReservationTarget = { kind: ReservationTargetKind; id: string; occurrence_date: CalendarDate | null; name: string; cap: number };

export function activeReservations(list: JurnlReservation[]): JurnlReservation[] {
  return list.filter((r) => r.status === 'ACTIVE' && r.amount > 0);
}

export function reservationsFor(list: JurnlReservation[], kind: ReservationTargetKind, targetId: string, occurrence?: CalendarDate | null): JurnlReservation[] {
  return activeReservations(list).filter(
    (r) => r.target_kind === kind && r.target_id === targetId && (occurrence === undefined || r.occurrence_date === occurrence),
  );
}

export function reservedFor(list: JurnlReservation[], kind: ReservationTargetKind, targetId: string, occurrence?: CalendarDate | null): number {
  return sumCents(reservationsFor(list, kind, targetId, occurrence).map((r) => r.amount));
}

export function reservedInAccount(list: JurnlReservation[], accountId: string, exceptReservationId?: string): number {
  return sumCents(activeReservations(list).filter((r) => r.account_id === accountId && r.reservation_id !== exceptReservationId).map((r) => r.amount));
}

export type AccountReservationHealth = { account_id: string; name: string; held: number; reserved: number; notSetAside: number; overBy: number };

/** Per-account: held, set aside, not yet set aside, and any over-commitment (set aside more than the account holds). */
export function accountReservationHealth(positions: AccountPosition[], list: JurnlReservation[]): AccountReservationHealth[] {
  return positions
    .filter((p) => p.nature === 'ASSET')
    .map((p) => {
      const reserved = reservedInAccount(list, p.account_id);
      return {
        account_id: p.account_id,
        name: p.account.display_name,
        held: p.held,
        reserved,
        notSetAside: toCents(Math.max(0, p.held - reserved)),
        overBy: toCents(Math.max(0, reserved - Math.max(0, p.held))),
      };
    });
}

function change(action: ReservationChange['action'], amount: number, note?: string): ReservationChange {
  return { at: new Date().toISOString(), action, amount: toCents(amount), note };
}

export type SetAsideInput = { target: ReservationTarget; account_id: string | null; amount: number };

/**
 * Adds `amount` from one account toward a target. Refused when it would exceed what is still due (R2) or what the
 * account holds outside its other set-asides (R3).
 */
export function buildSetAside(
  accounts: JurnlAccountRecord[],
  positions: AccountPosition[],
  list: JurnlReservation[],
  input: SetAsideInput,
): OpResult<JurnlReservation> {
  const account = accounts.find((a) => a.account_id === input.account_id && a.status === 'ACTIVE');
  if (!account) return { ok: false, error: 'CHOOSE THE ACCOUNT THAT HOLDS THIS MONEY.' };
  if (accountNature(account.account_type) === 'LIABILITY') return { ok: false, error: `${account.display_name} IS A CREDIT ACCOUNT. SET ASIDE MONEY FROM AN ACCOUNT THAT HOLDS IT.` };
  const amount = toCents(input.amount);
  if (!(amount > 0)) return { ok: false, error: `ENTER AN AMOUNT ABOVE ${money(0)}.` };
  const { target } = input;
  const already = reservedFor(list, target.kind, target.id, target.occurrence_date);
  const room = toCents(Math.max(0, target.cap - already));
  if (amount > room) {
    return {
      ok: false,
      error: room > 0 ? `${target.name} NEEDS ${money(room)} MORE. SET ASIDE ${money(room)} OR LESS.` : `${target.name} ALREADY HAS EVERYTHING IT NEEDS SET ASIDE.`,
    };
  }
  const held = positions.find((p) => p.account_id === account.account_id)?.held ?? 0;
  const free = toCents(Math.max(0, held - reservedInAccount(list, account.account_id)));
  if (amount > free) {
    return {
      ok: false,
      error: `${account.display_name} HAS ${money(free)} NOT ALREADY SET ASIDE. SETTING ASIDE ${money(amount)} WOULD BE ${money(amount - free)} MORE THAN IT HOLDS.`,
    };
  }
  const existing = reservationsFor(list, target.kind, target.id, target.occurrence_date).find((r) => r.account_id === account.account_id);
  const now = new Date().toISOString();
  const next: JurnlReservation = existing ?
    { ...existing, amount: toCents(existing.amount + amount), history: [...existing.history, change('ADDED', amount)], updated_at: now }
  : {
      reservation_id: newEntityId('res'),
      target_kind: target.kind,
      target_id: target.id,
      occurrence_date: target.occurrence_date,
      account_id: account.account_id,
      amount,
      status: 'ACTIVE',
      history: [change('SET', amount)],
      created_at: now,
      updated_at: now,
    };
  return { ok: true, commit: { reason: 'MONEY_SET_ASIDE', reservations: { upsert: [next] } }, value: next };
}

/** Lowers one reservation by `amount` (or releases it entirely when amount ≥ its value). */
export function buildReduceReservation(list: JurnlReservation[], reservationId: string, amount: number): OpResult<JurnlReservation> {
  const r = activeReservations(list).find((x) => x.reservation_id === reservationId);
  if (!r) return { ok: false, error: 'THIS SET-ASIDE NO LONGER EXISTS.' };
  const cut = toCents(Math.min(r.amount, Math.max(0, amount)));
  if (!(cut > 0)) return { ok: false, error: `ENTER AN AMOUNT ABOVE ${money(0)}.` };
  const now = new Date().toISOString();
  const remaining = toCents(r.amount - cut);
  const next: JurnlReservation =
    remaining > 0 ?
      { ...r, amount: remaining, history: [...r.history, change('REDUCED', cut)], updated_at: now }
    : { ...r, amount: 0, status: 'RELEASED', history: [...r.history, change('RELEASED', cut)], updated_at: now };
  return { ok: true, commit: { reason: 'SET_ASIDE_REDUCED', reservations: { upsert: [next] } }, value: next };
}

export function buildReleaseReservations(list: JurnlReservation[], ids: string[], note = 'RELEASED BY YOU'): OpResult<JurnlReservation[]> {
  const now = new Date().toISOString();
  const targets = activeReservations(list).filter((r) => ids.includes(r.reservation_id));
  if (!targets.length) return { ok: false, error: 'NOTHING IS SET ASIDE HERE.' };
  const next = targets.map((r) => ({ ...r, amount: 0, status: 'RELEASED' as const, history: [...r.history, change('RELEASED', r.amount, note)], updated_at: now }));
  return { ok: true, commit: { reason: 'SET_ASIDE_RELEASED', reservations: { upsert: next } }, value: next };
}

/**
 * Moves set-aside money from one target to another (same account). The money stays where it is; only its purpose
 * changes. Refused if the new target does not need that much.
 */
export function buildReassignReservation(list: JurnlReservation[], reservationId: string, to: ReservationTarget, amount: number): OpResult<JurnlReservation[]> {
  const r = activeReservations(list).find((x) => x.reservation_id === reservationId);
  if (!r) return { ok: false, error: 'THIS SET-ASIDE NO LONGER EXISTS.' };
  const moved = toCents(Math.min(r.amount, Math.max(0, amount)));
  if (!(moved > 0)) return { ok: false, error: `ENTER AN AMOUNT ABOVE ${money(0)}.` };
  if (to.kind === r.target_kind && to.id === r.target_id && to.occurrence_date === r.occurrence_date) return { ok: false, error: 'CHOOSE A DIFFERENT PAYMENT.' };
  const room = toCents(Math.max(0, to.cap - reservedFor(list, to.kind, to.id, to.occurrence_date)));
  if (moved > room) return { ok: false, error: `${to.name} NEEDS ${money(room)} MORE. MOVE ${money(room)} OR LESS.` };
  const now = new Date().toISOString();
  const left = toCents(r.amount - moved);
  const source: JurnlReservation =
    left > 0 ?
      { ...r, amount: left, history: [...r.history, change('MOVED_OUT', moved, to.name)], updated_at: now }
    : { ...r, amount: 0, status: 'RELEASED', history: [...r.history, change('MOVED_OUT', moved, to.name)], updated_at: now };
  const existing = reservationsFor(list, to.kind, to.id, to.occurrence_date).find((x) => x.account_id === r.account_id);
  const dest: JurnlReservation = existing ?
    { ...existing, amount: toCents(existing.amount + moved), history: [...existing.history, change('MOVED_IN', moved)], updated_at: now }
  : {
      reservation_id: newEntityId('res'),
      target_kind: to.kind,
      target_id: to.id,
      occurrence_date: to.occurrence_date,
      account_id: r.account_id,
      amount: moved,
      status: 'ACTIVE',
      history: [change('MOVED_IN', moved)],
      created_at: now,
      updated_at: now,
    };
  return { ok: true, commit: { reason: 'SET_ASIDE_MOVED', reservations: { upsert: [source, dest] } }, value: [source, dest] };
}

/**
 * After a payment: money set aside for it is used (from the paying account first), and any set-aside above what is
 * still due is released — or carried to the next occurrence when asked. Returns the updated reservations and a summary.
 */
export function settleReservationsForPayment(
  list: JurnlReservation[],
  kind: ReservationTargetKind,
  targetId: string,
  occurrence: CalendarDate | null,
  paidAmount: number,
  paidFromAccountId: string,
  remainingDueAfter: number,
  carryTo: CalendarDate | null,
): { upsert: JurnlReservation[]; applied: number; released: number; carried: number } {
  const now = new Date().toISOString();
  const mine = reservationsFor(list, kind, targetId, occurrence).sort((a, b) => (a.account_id === paidFromAccountId ? -1 : b.account_id === paidFromAccountId ? 1 : 0));
  let toApply = toCents(paidAmount);
  const updated = new Map<string, JurnlReservation>();
  let applied = 0;
  // 1. Use money set aside in the paying account (it is the money that just left).
  for (const r of mine) {
    if (r.account_id !== paidFromAccountId || toApply <= 0) continue;
    const use = toCents(Math.min(r.amount, toApply));
    toApply = toCents(toApply - use);
    applied = toCents(applied + use);
    const left = toCents(r.amount - use);
    updated.set(r.reservation_id, { ...r, amount: left, status: left > 0 ? 'ACTIVE' : 'APPLIED', history: [...r.history, change('APPLIED', use)], updated_at: now });
  }
  // 2. Keep no more set aside than is still due (R2); release or carry the excess, other accounts first.
  const current = mine.map((r) => updated.get(r.reservation_id) ?? r).filter((r) => r.status === 'ACTIVE');
  let excess = toCents(Math.max(0, sumCents(current.map((r) => r.amount)) - Math.max(0, remainingDueAfter)));
  let released = 0;
  let carried = 0;
  for (const r of [...current].sort((a, b) => (a.account_id === paidFromAccountId ? 1 : b.account_id === paidFromAccountId ? -1 : 0))) {
    if (excess <= 0) break;
    const cut = toCents(Math.min(r.amount, excess));
    excess = toCents(excess - cut);
    const left = toCents(r.amount - cut);
    if (carryTo && remainingDueAfter <= 0) {
      // Occurrence settled: move the leftover to the next occurrence instead of releasing it.
      carried = toCents(carried + cut);
      updated.set(r.reservation_id, { ...r, occurrence_date: carryTo, amount: cut + left, history: [...r.history, change('CARRIED', cut, `TO ${carryTo}`)], updated_at: now });
      continue;
    }
    released = toCents(released + cut);
    updated.set(r.reservation_id, {
      ...r,
      amount: left,
      status: left > 0 ? 'ACTIVE' : 'RELEASED',
      history: [...r.history, change('RELEASED', cut, 'NO LONGER NEEDED AFTER PAYMENT')],
      updated_at: now,
    });
  }
  return { upsert: [...updated.values()], applied, released, carried };
}
