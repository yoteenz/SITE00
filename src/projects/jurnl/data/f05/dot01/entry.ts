/**
 * F05 DOT 01 — recording a purchase (authorities 16, 18, 19, 28, 33). The review shows the balance impact the
 * canonical ledger would produce (positions recomputed with the built entry); saving goes through ledgerOps
 * (buildExpense → one atomic commit). A bank or cash purchase lowers money held; a card purchase raises what the card
 * owes and moves no cash. A receipt adds its provenance to the same single entry (never a second transaction).
 */
import { getTodayKey, type CalendarDate } from '../../foundation/dates';
import type { EntryReceipt, LedgerEntry } from '../../home/moneyTypes';
import { computeLedgerPositions, entryClass } from '../../ledger/accounting';
import { applyOp, buildExpense, buildTransfer, recordTransfer, type ExpenseInput, type TransferInput } from '../../ledger/ledgerOps';
import { getRepository } from '../../repository/deviceRepository';
import { findDuplicatePurchase, type DuplicateMatch } from './receipt';
import type { Done } from './result';

export type Impact = { account_id: string; name: string; liability: boolean; before: number; after: number; label: string };

function impactOf(entries: LedgerEntry[], next: LedgerEntry[], ids: string[], today: CalendarDate): Impact[] {
  const s = getRepository().getSnapshot();
  const a = computeLedgerPositions(s.accounts, s.creditAttributes, entries, today).positions;
  const b = computeLedgerPositions(s.accounts, s.creditAttributes, next, today).positions;
  return ids.map((id) => {
    const p0 = a.find((p) => p.account_id === id);
    const p1 = b.find((p) => p.account_id === id);
    const liability = p0?.nature === 'LIABILITY';
    const before = liability ? (p0?.owed ?? 0) : (p0?.held ?? 0);
    const after = liability ? (p1?.owed ?? 0) : (p1?.held ?? 0);
    return { account_id: id, name: p0?.account.display_name ?? id, liability, before, after, label: liability ? 'OWED ON THE CARD' : 'MONEY HELD' };
  });
}

export type PurchasePreview = { entry: LedgerEntry; kind: 'SPENDING' | 'CREDIT PURCHASE'; impact: Impact[]; duplicates: DuplicateMatch[] };

export function previewPurchase(input: ExpenseInput, receipt?: EntryReceipt | null, today: CalendarDate = getTodayKey()): Done<PurchasePreview> {
  const s = getRepository().getSnapshot();
  const built = buildExpense(s.accounts, input);
  if (!built.ok) return built;
  const entry: LedgerEntry = receipt ? { ...built.value, receipt } : built.value;
  const cls = entryClass(entry, s.accounts.find((a) => a.account_id === entry.account_id) ?? null);
  const duplicates = findDuplicatePurchase(s.transactions, { amount: input.amount, date: input.occurred_on, merchant: input.merchant, account_id: input.account_id, image_sha256: receipt?.image_sha256 ?? null });
  return { ok: true, value: { entry, kind: cls === 'CREDIT_PURCHASE' ? 'CREDIT PURCHASE' : 'SPENDING', impact: impactOf(s.transactions, [...s.transactions, entry], [entry.account_id!].filter(Boolean), today), duplicates } };
}

/** Commits exactly the previewed entry (same id), once. A second call with the same entry id is refused. */
export function savePurchase(preview: PurchasePreview): Done<LedgerEntry> {
  const s = getRepository().getSnapshot();
  if (s.transactions.some((e) => e.id === preview.entry.id)) return { ok: false, error: 'THIS PURCHASE IS ALREADY SAVED.' };
  const account = s.accounts.find((a) => a.account_id === preview.entry.account_id);
  if (!account || account.status !== 'ACTIVE') return { ok: false, error: 'CHOOSE AN ACTIVE ACCOUNT FOR THIS PURCHASE.' };
  const r = applyOp({ ok: true, commit: { reason: preview.entry.receipt ? 'RECEIPT_PURCHASE_RECORDED' : 'EXPENSE_RECORDED', transactions: { upsert: [preview.entry] } }, value: preview.entry });
  if (!r.ok) return r;
  const saved = getRepository().getSnapshot().transactions.some((e) => e.id === preview.entry.id);
  return saved ? { ok: true, value: preview.entry } : { ok: false, error: 'THE PURCHASE COULD NOT BE SAVED. NOTHING WAS RECORDED. TRY AGAIN.' };
}

export function previewReversal(entryId: string, today: CalendarDate = getTodayKey()): Impact[] {
  const s = getRepository().getSnapshot();
  const e = s.transactions.find((x) => x.id === entryId);
  if (!e?.account_id) return [];
  return impactOf(s.transactions, s.transactions.filter((x) => x.id !== entryId), [e.account_id], today);
}

export type TransferPreview = { linkId: string; kind: 'TRANSFER' | 'CARD_PAYMENT'; impact: Impact[]; input: TransferInput };

/** What a transfer or card payment would do now (canonical #1706 settlement: unsettled legs move nothing yet). */
export function previewTransfer(input: TransferInput, today: CalendarDate = getTodayKey()): Done<TransferPreview> {
  const s = getRepository().getSnapshot();
  const built = buildTransfer(s.accounts, s.transactions, input);
  if (!built.ok) return built;
  const ids = [input.from_account_id, input.to_account_id].filter(Boolean) as string[];
  return { ok: true, value: { linkId: built.value.linkId, kind: built.value.kind, impact: impactOf(s.transactions, [...s.transactions, ...built.value.legs], ids, today), input: { ...input, link_id: built.value.linkId } } };
}

export function saveTransfer(p: TransferPreview): Done<string> {
  const s = getRepository().getSnapshot();
  if (s.transactions.some((e) => e.link?.id === p.linkId)) return { ok: false, error: 'THIS IS ALREADY RECORDED.' };
  const r = recordTransfer(p.input);
  if (!r.ok) return r;
  return { ok: true, value: r.value.linkId };
}
