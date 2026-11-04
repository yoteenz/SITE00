/**
 * F05 DOT 01 — balance review, reconciliation and review issues (authorities 13, 23, 35).
 *
 *   TRACKED BALANCE        the canonical position (ledger)
 *   ACTUAL BALANCE         what the user reads from the bank, card or wallet (typed in; never stored as a balance)
 *   UNRECONCILED DIFFERENCE  actual − tracked (assets) / actual owed − tracked owed (cards)
 *   ACCOUNTING ADJUSTMENT  only if the user confirms: ledgerOps.correctAccountBalance records a BALANCE CORRECTION
 *                          (class ADJUSTMENT: never income, never spending), and the history keeps it
 * A place is marked reconciled only when there is no difference; the mark (date + balance) lives in settings and goes
 * stale as soon as the tracked balance moves.
 */
import { getTodayKey, type CalendarDate } from '../../foundation/dates';
import { toCents } from '../../ledger/accounting';
import { applyOp, buildBalanceCorrection } from '../../ledger/ledgerOps';
import { transferViews } from '../../ledger/transferSettlement';
import { getRepository } from '../../repository/deviceRepository';
import { accountView } from './accountView';
import type { Done } from './result';

export type Reconciliation = { tracked: number; liability: boolean; status: 'RECONCILED' | 'NOT RECONCILED' | 'NEVER REVIEWED'; on: string | null };

export function reconciliationOf(accountId: string, today: CalendarDate = getTodayKey()): Reconciliation | null {
  const v = accountView(accountId, today);
  if (!v) return null;
  const tracked = v.liability ? v.owed : v.held;
  const mark = getRepository().getSettings().accountReconciliation?.[accountId] ?? null;
  const status = !mark ? 'NEVER REVIEWED' : toCents(mark.balance) === toCents(tracked) ? 'RECONCILED' : 'NOT RECONCILED';
  return { tracked, liability: v.liability, status, on: mark?.on ?? null };
}

export function differenceOf(tracked: number, actual: number): number {
  return toCents(actual - tracked);
}

/**
 * Records the confirmed correction (canonical BALANCE CORRECTION, class ADJUSTMENT). Nothing is recorded for a zero
 * difference. The user's reason and notes travel on that single entry (its memo); the amount is the difference.
 */
export function adjustToActual(accountId: string, actual: number, today: CalendarDate = getTodayKey(), note?: { reason?: string; notes?: string }): Done<{ difference: number; entryId: string | null }> {
  const r = reconciliationOf(accountId, today);
  if (!r) return { ok: false, error: 'POCKET NOT FOUND.' };
  const difference = differenceOf(r.tracked, actual);
  if (difference === 0) return { ok: true, value: { difference, entryId: null } };
  const s = getRepository().getSnapshot();
  const built = buildBalanceCorrection(s.accounts, s.creditAttributes, s.transactions, accountId, actual, today);
  if (!built.ok) return built;
  const reason = note?.reason?.trim() ?? '';
  const notes = note?.notes?.trim() ?? '';
  const entry = built.value ? { ...built.value, memo: [built.value.memo, reason, notes].filter(Boolean).join(' · ') } : null;
  const done = applyOp(entry ? { ok: true, commit: { reason: 'BALANCE_CORRECTED', transactions: { upsert: [entry] } }, value: entry } : built);
  if (!done.ok) return done;
  return { ok: true, value: { difference, entryId: entry?.id ?? null } };
}

export function markReconciled(accountId: string, actual: number, today: CalendarDate = getTodayKey()): Done<null> {
  const r = reconciliationOf(accountId, today);
  if (!r) return { ok: false, error: 'POCKET NOT FOUND.' };
  const difference = differenceOf(r.tracked, actual);
  if (difference !== 0) return { ok: false, error: 'THERE IS STILL A DIFFERENCE. REVIEW IT OR RECORD AN ADJUSTMENT FIRST.' };
  const repo = getRepository();
  repo.patchSettings({ accountReconciliation: { ...(repo.getSettings().accountReconciliation ?? {}), [accountId]: { on: today, balance: r.tracked } } });
  return { ok: true, value: null };
}

export type ReviewIssueId = 'UNCONFIRMED_TRANSFER' | 'STALE_BALANCE' | 'NOT_RECONCILED' | 'NO_BALANCE';
export type ReviewIssue = { id: ReviewIssueId; label: string; detail: string; action: 'TRANSFERS' | 'BALANCE_REVIEW' | 'EDIT' };

const STALE_DAYS = 30;

/** Issues that genuinely need the user (each derived from records; nothing is guessed). */
export function reviewIssues(accountId: string, today: CalendarDate = getTodayKey()): ReviewIssue[] {
  const v = accountView(accountId, today);
  if (!v || v.archived) return [];
  const snap = getRepository().getSnapshot();
  const resolved = getRepository().getSettings().accountReviewResolved?.[accountId] ?? {};
  const out: ReviewIssue[] = [];
  const unconfirmed = transferViews(snap.transactions, today).filter((t) => t.state === 'NEEDS_RECONCILIATION' && (t.fromId === accountId || t.toId === accountId));
  if (unconfirmed.length) out.push({ id: 'UNCONFIRMED_TRANSFER', label: 'TRANSFER NEEDS CONFIRMATION', detail: `${unconfirmed.length} ${unconfirmed.length === 1 ? 'TRANSFER WAS' : 'TRANSFERS WERE'} NEVER CONFIRMED AS ARRIVED.`, action: 'TRANSFERS' });
  if (v.entered === 0 && v.entryCount === 0) out.push({ id: 'NO_BALANCE', label: 'MISSING BALANCE', detail: 'NO BALANCE HAS BEEN ENTERED FOR THIS POCKET.', action: 'EDIT' });
  if (v.daysSinceUpdate != null && v.daysSinceUpdate > STALE_DAYS) out.push({ id: 'STALE_BALANCE', label: 'BALANCE NOT UPDATED', detail: `LAST UPDATED ${v.daysSinceUpdate} DAYS AGO. CHECK IT AGAINST THE REAL BALANCE.`, action: 'BALANCE_REVIEW' });
  const rec = reconciliationOf(accountId, today);
  if (rec && rec.status === 'NOT RECONCILED') out.push({ id: 'NOT_RECONCILED', label: 'RECONCILIATION NEEDED', detail: `THE BALANCE CHANGED SINCE YOU CONFIRMED IT ON ${rec.on}.`, action: 'BALANCE_REVIEW' });
  return out.filter((i) => !resolved[i.id] || i.id === 'UNCONFIRMED_TRANSFER');
}

/** Hides an issue the user looked at (not for unconfirmed transfers: those are resolved by recording the step). */
export function markIssueResolved(accountId: string, issue: ReviewIssueId, today: CalendarDate = getTodayKey()): Done<null> {
  if (issue === 'UNCONFIRMED_TRANSFER') return { ok: false, error: 'RECORD WHAT HAPPENED TO THE TRANSFER TO RESOLVE THIS.' };
  const repo = getRepository();
  const all = repo.getSettings().accountReviewResolved ?? {};
  repo.patchSettings({ accountReviewResolved: { ...all, [accountId]: { ...(all[accountId] ?? {}), [issue]: today } } });
  return { ok: true, value: null };
}
