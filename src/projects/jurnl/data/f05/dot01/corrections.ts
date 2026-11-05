/**
 * F05 DOT 01 — correcting and reversing an entry (authorities 24, 37).
 *
 * The existing ledger changes an entry in place or removes it (daily earnings edit, bill-payment undo, linked-event
 * removal); there are no reversal postings. DOT 01 follows that model and adds the trail it lacked:
 *   CORRECT   the entry is rebuilt through ledgerOps.buildExpense (same rules as a new purchase: a card makes it a
 *             credit purchase, an archived place is refused) and keeps its id; the values before the change are
 *             appended to entry.correction_history, which is shown on the transaction and never rewritten;
 *   REVERSE   (or MARK AS DUPLICATE) the entry leaves the ledger, so it no longer moves any balance; a full copy goes
 *             to settings.ledgerAudit with the reason. An entry that is already gone cannot be reversed again.
 * Only single spending entries are changed here. Transfers, card payments, bill payments, balance corrections and
 * income belong to their owners (DOT 02 transfer steps, F07, F06): the check says where to change them.
 * The balance impact shown before confirming is the canonical position recomputed with the change.
 */
import { getTodayKey, type CalendarDate } from '../../foundation/dates';
import type { LedgerEntry } from '../../home/moneyTypes';
import { computeLedgerPositions, entryClass, resolveEntryAccount, toCents } from '../../ledger/accounting';
import { applyOp, buildExpense, type OpResult } from '../../ledger/ledgerOps';
import { getRepository } from '../../repository/deviceRepository';
import type { Done } from './result';

export type CorrectionChange = { amount?: number; merchant?: string; category?: string; account_id?: string; occurred_on?: CalendarDate; memo?: string };
export type CorrectionCheck = { ok: true; entry: LedgerEntry } | { ok: false; reason: string; owner?: { label: string; route: string } };

export function correctionCheck(entryId: string): CorrectionCheck {
  const snap = getRepository().getSnapshot();
  const entry = snap.transactions.find((e) => e.id === entryId);
  if (!entry) return { ok: false, reason: 'THIS ENTRY IS NO LONGER IN YOUR RECORDS (IT MAY ALREADY HAVE BEEN REVERSED).' };
  if (entry.source !== 'ADDED') return { ok: false, reason: 'SAMPLE ENTRIES CANNOT BE CHANGED.' };
  const cls = entryClass(entry, resolveEntryAccount(entry, snap.accounts));
  if (entry.link?.kind === 'TRANSFER' || entry.link?.kind === 'CARD_PAYMENT') return { ok: false, reason: 'THIS IS PART OF A TRANSFER OR CARD PAYMENT. CHANGE IT FROM ITS STEPS SO BOTH SIDES STAY TOGETHER.', owner: { label: 'OPEN TRANSFERS', route: 'money/places' } };
  if (entry.obligation_id || entry.link?.kind === 'BILL_PAYMENT') return { ok: false, reason: 'THIS PAID A BILL. UNDO OR CHANGE IT ON THE BILL SO ITS DUE DATE STAYS RIGHT.', owner: { label: 'OPEN UPCOMING', route: 'upcoming' } };
  if (cls === 'ADJUSTMENT') return { ok: false, reason: 'THIS IS A BALANCE CORRECTION. REVIEW THE BALANCE INSTEAD.' };
  if (cls === 'INCOME' || entry.origin_family === 'F06') return { ok: false, reason: 'INCOME IS RECORDED IN INCOME. CHANGE IT THERE.', owner: { label: 'OPEN INCOME', route: 'income' } };
  if (cls !== 'EXPENSE' && cls !== 'CREDIT_PURCHASE' && cls !== 'REFUND') return { ok: false, reason: 'THIS ENTRY CANNOT BE CHANGED HERE.' };
  return { ok: true, entry };
}

function applyChange(entry: LedgerEntry, change: CorrectionChange): OpResult<LedgerEntry> {
  const snap = getRepository().getSnapshot();
  const built = buildExpense(snap.accounts, {
    merchant: change.merchant ?? entry.merchant,
    amount: change.amount ?? Math.abs(entry.amount),
    account_id: change.account_id ?? entry.account_id ?? resolveEntryAccount(entry, snap.accounts)?.account_id ?? null,
    category: change.category ?? entry.category,
    occurred_on: (change.occurred_on ?? entry.occurred_on ?? getTodayKey()) as CalendarDate,
    memo: change.memo ?? entry.memo,
    origin_family: entry.origin_family ?? 'F04',
  });
  if (!built.ok) return built;
  const typed = {
    merchant: change.merchant != null ? change.merchant.trim() : entry.source_values?.merchant,
    memo: change.memo != null ? change.memo.trim() : entry.source_values?.memo,
  };
  const source_values = typed.merchant && typed.merchant !== typed.merchant.toUpperCase() ? { merchant: typed.merchant } : {};
  if (typed.memo && typed.memo !== typed.memo.toUpperCase()) Object.assign(source_values, { memo: typed.memo });
  const revised: LedgerEntry = { ...built.value, id: entry.id, recorded_at: entry.recorded_at, receipt: entry.receipt, provenance: entry.provenance, correction_history: entry.correction_history, ...(Object.keys(source_values).length ? { source_values } : {}) };
  return { ok: true, commit: { reason: 'ENTRY_CORRECTED', transactions: { upsert: [revised] } }, value: revised };
}

export type CorrectionPreview = {
  original: LedgerEntry;
  revised: LedgerEntry;
  /** Balance (held, or owed for cards) of each place the change touches, before and after (canonical positions). */
  impact: { account_id: string; name: string; before: number; after: number; liability: boolean }[];
  changed: string[];
};

export function previewCorrection(entryId: string, change: CorrectionChange, today: CalendarDate = getTodayKey()): Done<CorrectionPreview> {
  const check = correctionCheck(entryId);
  if (!check.ok) return { ok: false, error: check.reason };
  const r = applyChange(check.entry, change);
  if (!r.ok) return r;
  const snap = getRepository().getSnapshot();
  const before = computeLedgerPositions(snap.accounts, snap.creditAttributes, snap.transactions, today).positions;
  const after = computeLedgerPositions(snap.accounts, snap.creditAttributes, snap.transactions.map((e) => (e.id === entryId ? r.value : e)), today).positions;
  const ids = [...new Set([check.entry.account_id, r.value.account_id].filter(Boolean) as string[])];
  const impact = ids.map((id) => {
    const b = before.find((p) => p.account_id === id);
    const a = after.find((p) => p.account_id === id);
    const liability = b?.nature === 'LIABILITY';
    return { account_id: id, name: b?.account.display_name ?? a?.account.display_name ?? id, before: liability ? b!.owed : (b?.held ?? 0), after: liability ? (a?.owed ?? 0) : (a?.held ?? 0), liability };
  });
  const o = check.entry;
  const v = r.value;
  const changed = [
    toCents(Math.abs(o.amount)) !== toCents(Math.abs(v.amount)) ? 'AMOUNT' : '',
    o.merchant !== v.merchant ? 'MERCHANT' : '',
    o.category !== v.category ? 'CATEGORY' : '',
    o.account_id !== v.account_id ? 'ACCOUNT' : '',
    o.occurred_on !== v.occurred_on ? 'DATE' : '',
    (o.memo ?? '') !== (v.memo ?? '') ? 'NOTES' : '',
  ].filter(Boolean);
  return { ok: true, value: { original: o, revised: v, impact, changed } };
}

export function applyCorrection(entryId: string, change: CorrectionChange, reason: string): Done<LedgerEntry> {
  const check = correctionCheck(entryId);
  if (!check.ok) return { ok: false, error: check.reason };
  const r = applyChange(check.entry, change);
  if (!r.ok) return r;
  const o = check.entry;
  const trail = { at: new Date().toISOString(), reason: reason.trim().toUpperCase() || 'CORRECTED', before: { amount: Math.abs(o.amount), merchant: o.merchant, category: o.category, account_id: o.account_id ?? null, occurred_on: o.occurred_on ?? null, memo: o.memo ?? '' } };
  const revised: LedgerEntry = { ...r.value, correction_history: [...(o.correction_history ?? []), trail] };
  const done = applyOp({ ok: true, commit: { reason: 'ENTRY_CORRECTED', transactions: { upsert: [revised] } }, value: revised });
  if (!done.ok) return done;
  return { ok: true, value: revised };
}

const AUDIT_MAX = 200;

/** Removes a single spending entry (after the user confirmed) and keeps a full copy in the audit trail. */
export function reverseEntry(entryId: string, action: 'REVERSED' | 'MARKED_DUPLICATE', reason: string): Done<LedgerEntry> {
  const check = correctionCheck(entryId);
  if (!check.ok) return { ok: false, error: check.reason };
  const done = applyOp({ ok: true, commit: { reason: action === 'MARKED_DUPLICATE' ? 'ENTRY_MARKED_DUPLICATE' : 'ENTRY_REVERSED', transactions: { remove: [entryId] } }, value: check.entry });
  if (!done.ok) return done;
  const repo = getRepository();
  const audit = repo.getSettings().ledgerAudit ?? [];
  repo.patchSettings({ ledgerAudit: [{ at: new Date().toISOString(), action, reason: reason.trim().toUpperCase() || action, entry: check.entry as unknown as Record<string, unknown> }, ...audit].slice(0, AUDIT_MAX) });
  return { ok: true, value: check.entry };
}

export function auditFor(accountId: string) {
  return (getRepository().getSettings().ledgerAudit ?? []).filter((a) => (a.entry as { account_id?: string }).account_id === accountId);
}
