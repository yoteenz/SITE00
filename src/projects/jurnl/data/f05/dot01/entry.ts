/**
 * F05 DOT 01 — recording a purchase (authorities 16, 18, 19, 28, 33). The review shows the balance impact the
 * canonical ledger would produce (positions recomputed with the built entry); saving goes through ledgerOps
 * (buildExpense → one atomic commit). A bank or cash purchase lowers money held; a card purchase raises what the card
 * owes and moves no cash. A receipt adds its provenance to the same single entry (never a second transaction).
 */
import { getTodayKey, type CalendarDate } from '../../foundation/dates';
import type { EntryReceipt, LedgerEntry } from '../../home/moneyTypes';
import { formatMoney as money } from '../../home/currency';
import { computeLedgerPositions, entryClass, legSettlement, toCents } from '../../ledger/accounting';
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

/** The user's own text, kept as typed when the canonical (uppercase) form differs. */
export function sourceValues(merchant: string, memo?: string): LedgerEntry['source_values'] | undefined {
  const m = merchant.trim();
  const n = (memo ?? '').trim();
  const out: NonNullable<LedgerEntry['source_values']> = {};
  if (m && m !== m.toUpperCase()) out.merchant = m;
  if (n && n !== n.toUpperCase()) out.memo = n;
  return out.merchant || out.memo ? out : undefined;
}

export type PurchasePreview = { entry: LedgerEntry; kind: 'SPENDING' | 'CREDIT PURCHASE'; impact: Impact[]; duplicates: DuplicateMatch[] };

export function previewPurchase(input: ExpenseInput, receipt?: EntryReceipt | null, today: CalendarDate = getTodayKey()): Done<PurchasePreview> {
  const s = getRepository().getSnapshot();
  const built = buildExpense(s.accounts, input);
  if (!built.ok) return built;
  const source = sourceValues(input.merchant, input.memo);
  const entry: LedgerEntry = { ...built.value, ...(receipt ? { receipt } : {}), ...(source ? { source_values: source } : {}) };
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

const OPEN_LEG = new Set(['SCHEDULED', 'PENDING', 'NEEDS_RECONCILIATION']);

export type TransferPreview = { linkId: string; kind: 'TRANSFER' | 'CARD_PAYMENT'; impact: Impact[]; input: TransferInput; warnings: string[] };

/**
 * What a transfer or card payment would do now (canonical #1706 settlement: unsettled legs move nothing yet).
 * DOT 01 adds two guards the canonical engine does not apply, because each would make the picture wrong:
 *   - paying a card more than it is tracked as owing (the position stops at 0, so the extra would vanish);
 *   - taking more cash out of CASH ON HAND than it holds (cash cannot go below 0).
 * A bank or card source that would go below 0 is allowed (overdrafts happen) but warned.
 */
export function previewTransfer(input: TransferInput, today: CalendarDate = getTodayKey()): Done<TransferPreview> {
  const s = getRepository().getSnapshot();
  const built = buildTransfer(s.accounts, s.transactions, input);
  if (!built.ok) return built;
  const ids = [input.from_account_id, input.to_account_id].filter(Boolean) as string[];
  const now = computeLedgerPositions(s.accounts, s.creditAttributes, s.transactions, today).positions;
  const from = now.find((p) => p.account_id === input.from_account_id);
  const to = now.find((p) => p.account_id === input.to_account_id);
  const amount = toCents(Math.abs(input.amount));
  const outstanding = (id: string) => toCents(s.transactions.filter((e) => e.link?.kind === 'CARD_PAYMENT' && e.account_id === id && OPEN_LEG.has(legSettlement(e, today))).reduce((t, e) => t + Math.abs(e.amount), 0));
  if (to?.nature === 'LIABILITY') {
    const left = toCents(to.owed - outstanding(to.account_id));
    if (amount > left) return { ok: false, error: left <= 0 ? `${to.account.display_name} HAS NOTHING LEFT TO PAY (PAYMENTS ALREADY RECORDED COVER WHAT IT OWES). REVIEW THE CARD BALANCE FIRST.` : `THIS IS MORE THAN ${to.account.display_name} OWES AFTER PAYMENTS ALREADY RECORDED (${money(left)}). RECORD UP TO ${money(left)}, OR REVIEW THE CARD BALANCE FIRST.` };
  }
  const warnings: string[] = [];
  if (from && from.nature === 'ASSET' && amount > from.held) {
    if (from.account.account_type === 'CASH') return { ok: false, error: `${from.account.display_name} HOLDS ONLY ${money(from.held)}.` };
    warnings.push(`THIS IS MORE THAN ${from.account.display_name} HOLDS (${money(from.held)}). IT WILL SHOW BELOW ZERO.`);
  }
  return { ok: true, value: { linkId: built.value.linkId, kind: built.value.kind, impact: impactOf(s.transactions, [...s.transactions, ...built.value.legs], ids, today), input: { ...input, link_id: built.value.linkId }, warnings } };
}

export function saveTransfer(p: TransferPreview): Done<string> {
  const s = getRepository().getSnapshot();
  if (s.transactions.some((e) => e.link?.id === p.linkId)) return { ok: false, error: 'THIS IS ALREADY RECORDED.' };
  const r = recordTransfer(p.input);
  if (!r.ok) return r;
  return { ok: true, value: r.value.linkId };
}
