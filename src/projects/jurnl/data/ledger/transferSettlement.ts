/**
 * Transfer and card-payment settlement (stabilization sprint).
 *
 * A transfer is still ONE event with two linked legs in the one ledger (OUT of the source, IN to the destination).
 * What changed: each leg now carries its own settlement, and only a SETTLED leg changes a balance. So money that has
 * left the source but not reached the destination is IN TRANSIT — out of the source, not yet spendable anywhere.
 *
 *   state            OUT leg      IN leg       source     destination   in transit
 *   SCHEDULED        SCHEDULED    SCHEDULED    unchanged  unchanged     0
 *   PENDING          PENDING      PENDING      unchanged  unchanged     0   (started; money has not left)
 *   IN_TRANSIT       SETTLED      PENDING      − amount   unchanged     amount
 *   COMPLETED        SETTLED      SETTLED      − amount   + amount      0
 *   CANCELLED        CANCELLED    CANCELLED    unchanged  unchanged     0   (only before money left)
 *   FAILED           FAILED|REV.  FAILED       unchanged  unchanged     0   (money never left, or came back)
 *   RETURNING        SETTLED      FAILED       − amount   unchanged     amount (failed after leaving; not back yet)
 *   REVERSED         REVERSED     REVERSED     unchanged  unchanged     0   (completed, then undone by the bank / issuer)
 *   NEEDS_RECONCILIATION (legacy) — neither leg applied until the user says what happened.
 *
 * Every state change is recorded by the user; none is bank- or issuer-confirmed (no provider exists).
 */

import { isSupersededByBank } from '../banking/activity';
import type { JurnlAccountRecord } from '../foundation/accounts';
import type { CalendarDate } from '../foundation/dates';
import type { LedgerEntry, LegSettlement, SettlementEvent } from '../home/moneyTypes';
import type { FinancialCommit } from '../repository/types';
import { accountNature, isTwoLegKind, legSettlement, resolveEntryAccount, sumCents, toCents } from './accounting';

export { isTwoLegKind, legSettlement, legApplies } from './accounting';

export type TransferState = 'SCHEDULED' | 'PENDING' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED' | 'FAILED' | 'RETURNING' | 'REVERSED' | 'NEEDS_RECONCILIATION';

/** The states a user can choose when recording a transfer. */
export type TransferStart = 'SCHEDULED' | 'PENDING' | 'IN_TRANSIT' | 'COMPLETED';

export const TRANSFER_STATE_LABEL: Record<TransferState, string> = {
  SCHEDULED: 'PLANNED',
  PENDING: 'STARTED · PENDING',
  IN_TRANSIT: 'IN TRANSIT',
  COMPLETED: 'ARRIVED',
  CANCELLED: 'CANCELLED',
  FAILED: 'FAILED',
  RETURNING: 'FAILED · MONEY COMING BACK',
  REVERSED: 'REVERSED',
  NEEDS_RECONCILIATION: 'NEEDS CONFIRMATION',
};

/** The same states in card-payment words. */
export const CARD_PAYMENT_STATE_LABEL: Record<TransferState, string> = {
  SCHEDULED: 'PAYMENT SCHEDULED',
  PENDING: 'PAYMENT SUBMITTED',
  IN_TRANSIT: 'PAID FROM ACCOUNT · CARD NOT CONFIRMED',
  COMPLETED: 'CARD CONFIRMED PAYMENT',
  CANCELLED: 'PAYMENT CANCELLED',
  FAILED: 'PAYMENT FAILED',
  RETURNING: 'PAYMENT FAILED · MONEY COMING BACK',
  REVERSED: 'PAYMENT REVERSED',
  NEEDS_RECONCILIATION: 'NEEDS CONFIRMATION',
};

export type TransferView = {
  linkId: string;
  kind: 'TRANSFER' | 'CARD_PAYMENT';
  state: TransferState;
  out: LedgerEntry | null;
  in: LedgerEntry | null;
  amount: number;
  fromId: string | null;
  toId: string | null;
  date: CalendarDate | null;
  /** Money that has left the source and not reached the destination. */
  inTransit: number;
  /** Money committed to leave the source that has not left yet (planned, started, or unconfirmed legacy). */
  waitingToLeave: number;
  history: SettlementEvent[];
};

export function deriveTransferState(out: LegSettlement | null, inn: LegSettlement | null): TransferState {
  if (out === 'NEEDS_RECONCILIATION' || inn === 'NEEDS_RECONCILIATION') return 'NEEDS_RECONCILIATION';
  if (out === 'SETTLED' && inn === 'SETTLED') return 'COMPLETED';
  if (out === 'SETTLED' && inn === 'FAILED') return 'RETURNING';
  if (out === 'SETTLED') return 'IN_TRANSIT';
  if (out === 'REVERSED' && inn === 'REVERSED') return 'REVERSED';
  if (out === 'CANCELLED') return 'CANCELLED';
  if (out === 'FAILED' || out === 'REVERSED' || inn === 'FAILED') return 'FAILED';
  if (out === 'SCHEDULED') return 'SCHEDULED';
  return 'PENDING';
}

export function transferViews(entries: LedgerEntry[], today: CalendarDate): TransferView[] {
  const groups = new Map<string, LedgerEntry[]>();
  for (const e of entries) {
    // A recorded transfer the bank already reports is counted through the bank's record (never committed twice).
    if (e.source !== 'ADDED' || !isTwoLegKind(e) || !e.link || isSupersededByBank(e)) continue;
    groups.set(e.link.id, [...(groups.get(e.link.id) ?? []), e]);
  }
  return [...groups.entries()].map(([linkId, legs]) => {
    const out = legs.find((l) => l.link?.leg === 'OUT') ?? null;
    const inn = legs.find((l) => l.link?.leg === 'IN') ?? null;
    const state = deriveTransferState(out ? legSettlement(out, today) : null, inn ? legSettlement(inn, today) : null);
    const amount = toCents(Math.abs(out?.amount ?? inn?.amount ?? 0));
    return {
      linkId,
      kind: (out ?? inn)!.link!.kind as 'TRANSFER' | 'CARD_PAYMENT',
      state,
      out,
      in: inn,
      amount,
      fromId: out?.account_id ?? inn?.counterparty_account_id ?? null,
      toId: inn?.account_id ?? out?.counterparty_account_id ?? null,
      date: out?.occurred_on ?? inn?.occurred_on ?? null,
      inTransit: state === 'IN_TRANSIT' || state === 'RETURNING' ? amount : 0,
      waitingToLeave: state === 'SCHEDULED' || state === 'PENDING' || state === 'NEEDS_RECONCILIATION' ? amount : 0,
      history: [...(out?.settlement_history ?? [])],
    };
  });
}

export type TransferAction = 'LEFT_SOURCE' | 'RECEIVED' | 'CANCEL' | 'FAIL' | 'MONEY_RETURNED' | 'REVERSE';

export const TRANSFER_ACTION_LABEL: Record<TransferAction, string> = {
  LEFT_SOURCE: 'MONEY LEFT THE ACCOUNT',
  RECEIVED: 'MONEY ARRIVED',
  CANCEL: 'CANCEL — IT DID NOT HAPPEN',
  FAIL: 'IT FAILED',
  MONEY_RETURNED: 'THE MONEY CAME BACK',
  REVERSE: 'IT WAS REVERSED',
};

/** Actions that make sense from each state (the UI offers exactly these). */
export function allowedActions(state: TransferState): TransferAction[] {
  switch (state) {
    case 'SCHEDULED':
    case 'PENDING':
    case 'NEEDS_RECONCILIATION':
      return ['LEFT_SOURCE', 'RECEIVED', 'CANCEL', 'FAIL'];
    case 'IN_TRANSIT':
      return ['RECEIVED', 'FAIL'];
    case 'RETURNING':
      return ['MONEY_RETURNED'];
    case 'COMPLETED':
      return ['REVERSE'];
    default:
      return [];
  }
}

function withState(e: LedgerEntry, state: LegSettlement, action: string, at: string): LedgerEntry {
  const settled = state === 'SETTLED';
  return {
    ...e,
    settlement: state,
    status: settled ? 'CLEARED' : 'PENDING',
    confirmation: 'RECORDED_BY_YOU',
    settlement_history: [...(e.settlement_history ?? []), { at, state, action }],
  };
}

export type TransferActionResult = { ok: true; commit: FinancialCommit; value: TransferState; changed: boolean } | { ok: false; error: string };

/**
 * Applies one user-recorded settlement step. Repeating a step that already happened is a no-op (idempotent), so a
 * double tap on "MONEY ARRIVED" can never credit the destination twice.
 */
export function buildTransferAction(entries: LedgerEntry[], linkId: string, action: TransferAction, today: CalendarDate, opts: { returned?: boolean } = {}): TransferActionResult {
  const view = transferViews(entries, today).find((v) => v.linkId === linkId);
  if (!view || !view.out || !view.in) return { ok: false, error: 'TRANSFER NOT FOUND.' };
  const at = new Date().toISOString();
  const noop: TransferActionResult = { ok: true, commit: { reason: 'TRANSFER_NO_CHANGE' }, value: view.state, changed: false };
  const set = (out: LegSettlement, inn: LegSettlement): TransferActionResult => {
    const legs = [withState(view.out!, out, action, at), withState(view.in!, inn, action, at)];
    return { ok: true, commit: { reason: `TRANSFER_${action}`, transactions: { upsert: legs } }, value: deriveTransferState(out, inn), changed: true };
  };
  const s = view.state;
  switch (action) {
    case 'LEFT_SOURCE':
      if (s === 'IN_TRANSIT' || s === 'COMPLETED') return noop;
      if (s === 'SCHEDULED' || s === 'PENDING' || s === 'NEEDS_RECONCILIATION') return set('SETTLED', 'PENDING');
      break;
    case 'RECEIVED':
      if (s === 'COMPLETED') return noop;
      // Arrival implies the money left the source; both legs settle once.
      if (s === 'SCHEDULED' || s === 'PENDING' || s === 'NEEDS_RECONCILIATION' || s === 'IN_TRANSIT') return set('SETTLED', 'SETTLED');
      break;
    case 'CANCEL':
      if (s === 'CANCELLED') return noop;
      if (s === 'SCHEDULED' || s === 'PENDING' || s === 'NEEDS_RECONCILIATION') return set('CANCELLED', 'CANCELLED');
      if (s === 'IN_TRANSIT') return { ok: false, error: 'THE MONEY ALREADY LEFT. MARK IT ARRIVED OR FAILED INSTEAD.' };
      break;
    case 'FAIL':
      if (s === 'FAILED' || s === 'RETURNING') return noop;
      if (s === 'SCHEDULED' || s === 'PENDING' || s === 'NEEDS_RECONCILIATION') return set('FAILED', 'FAILED');
      if (s === 'IN_TRANSIT') return opts.returned ? set('REVERSED', 'FAILED') : set('SETTLED', 'FAILED');
      break;
    case 'MONEY_RETURNED':
      if (s === 'FAILED') return noop;
      if (s === 'RETURNING') return set('REVERSED', 'FAILED');
      break;
    case 'REVERSE':
      if (s === 'REVERSED') return noop;
      if (s === 'COMPLETED') return set('REVERSED', 'REVERSED');
      break;
  }
  return { ok: false, error: `THIS CANNOT BE DONE NOW. THE ${view.kind === 'CARD_PAYMENT' ? 'PAYMENT' : 'TRANSFER'} IS ${TRANSFER_STATE_LABEL[s]}.` };
}

/** Removing both legs is only safe when it cannot recreate or erase money (nothing is between accounts). */
export function canRemoveTransfer(state: TransferState): boolean {
  return state !== 'IN_TRANSIT' && state !== 'RETURNING';
}

export type TransferTotals = {
  inTransit: number;
  waitingToLeave: number;
  needsConfirmation: number;
  byAccount: Map<string, { inTransitOut: number; incoming: number; waitingToLeave: number }>;
};

export function transferTotals(views: TransferView[]): TransferTotals {
  const byAccount = new Map<string, { inTransitOut: number; incoming: number; waitingToLeave: number }>();
  const slot = (id: string | null) => {
    if (!id) return null;
    const s = byAccount.get(id) ?? { inTransitOut: 0, incoming: 0, waitingToLeave: 0 };
    byAccount.set(id, s);
    return s;
  };
  for (const v of views) {
    const from = slot(v.fromId);
    const to = slot(v.toId);
    if (v.inTransit > 0) {
      if (from) from.inTransitOut = toCents(from.inTransitOut + v.inTransit);
      if (to && v.state === 'IN_TRANSIT') to.incoming = toCents(to.incoming + v.inTransit);
    }
    if (v.waitingToLeave > 0) {
      if (from) from.waitingToLeave = toCents(from.waitingToLeave + v.waitingToLeave);
      if (to) to.incoming = toCents(to.incoming + v.waitingToLeave);
    }
  }
  return {
    inTransit: sumCents(views.map((v) => v.inTransit)),
    waitingToLeave: sumCents(views.map((v) => v.waitingToLeave)),
    needsConfirmation: views.filter((v) => v.state === 'NEEDS_RECONCILIATION').length,
    byAccount,
  };
}

/** True when the destination of a transfer is an asset account (not a card or loan). */
export function destinationIsAsset(v: TransferView, accounts: JurnlAccountRecord[]): boolean {
  const to = v.in ? resolveEntryAccount(v.in, accounts) : accounts.find((a) => a.account_id === v.toId) ?? null;
  return to ? accountNature(to.account_type) === 'ASSET' : false;
}
