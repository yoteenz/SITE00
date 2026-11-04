/**
 * P0.JURNL.F05-MONEY.DOT01-ACCOUNTS — financial invariants of the ACCOUNTS dot (D01–D60).
 * Synthetic world (tests/helpers/jurnlFinancialWorld.ts): RIDE $300 · BANK $100 · CASH $100 · VISA owes $400 / $2,000.
 * Every mutation goes through the canonical ledger (ledgerOps); nothing here builds a second ledger.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { addDays, type CalendarDate } from '../src/projects/jurnl/data/foundation/dates';
import { getRepository } from '../src/projects/jurnl/data/repository/deviceRepository';
import { applyOp, recordExpense, recordTransfer } from '../src/projects/jurnl/data/ledger/ledgerOps';
import { entryClass, resolveEntryAccount } from '../src/projects/jurnl/data/ledger/accounting';
import { computeMoneyPicture } from '../src/projects/jurnl/data/ledger/moneyPicture';
import { setPurposeAccount } from '../src/projects/jurnl/data/ledger/moneyPositions';
import { buildSetAside } from '../src/projects/jurnl/data/f07/reservations';
import { computeLedgerPositions } from '../src/projects/jurnl/data/ledger/accounting';
import { createBillOrSubscription } from '../src/projects/jurnl/data/f07/obligationLifecycle';
import { createIncomeSource } from '../src/projects/jurnl/data/f06/incomeStore';
import type { EntryReceipt, LedgerEntry } from '../src/projects/jurnl/data/home/moneyTypes';
import { moveInOrder, orderAccounts, setAccountOrder } from '../src/projects/jurnl/data/f05/dot01/accountOrder';
import { accountView, kindOf } from '../src/projects/jurnl/data/f05/dot01/accountView';
import { archiveAccountSafely, archiveBlockers } from '../src/projects/jurnl/data/f05/dot01/archive';
import { applyCorrection, auditFor, correctionCheck, previewCorrection, reverseEntry } from '../src/projects/jurnl/data/f05/dot01/corrections';
import { previewPurchase, previewReversal, previewTransfer, savePurchase, saveTransfer, sourceValues } from '../src/projects/jurnl/data/f05/dot01/entry';
import { categoriesIn, searchHistory } from '../src/projects/jurnl/data/f05/dot01/history';
import { checkReceiptFile, findDuplicatePurchase, parseReceiptText } from '../src/projects/jurnl/data/f05/dot01/receipt';
import { adjustToActual, differenceOf, markIssueResolved, markReconciled, reconciliationOf, reviewIssues } from '../src/projects/jurnl/data/f05/dot01/reconciliation';
import { listActiveAccounts } from '../src/projects/jurnl/data/foundation/accounts';
import { computeMoneyParentReading } from '../src/projects/jurnl/data/f05/moneyParentReading';
import { TODAY, position, world } from './helpers/jurnlFinancialWorld';

const snap = () => getRepository().getSnapshot();
const tx = () => snap().transactions;
const owed = (id: string) => accountView(id, TODAY)!.owed;
const held = (id: string) => accountView(id, TODAY)!.held;

function spend(merchant: string, amount: number, account: string, daysAgo = 0, category = 'DINING'): LedgerEntry {
  const r = recordExpense({ merchant, amount, account_id: account, category, occurred_on: addDays(TODAY, -daysAgo) });
  if (!r.ok) throw new Error(r.error);
  return r.value;
}

function receipt(sha: string, over: Partial<EntryReceipt> = {}): EntryReceipt {
  return { receipt_id: `rcpt-${sha}`, stored: 'DEVICE', source: 'UPLOAD', mime: 'image/jpeg', captured_at: new Date().toISOString(), image_sha256: sha, extracted: { merchant: 'TRATTORIA LUCIA', date: TODAY, total: 84.2, subtotal: 78, tax: 6.2, tip: null, items: [] }, edited: [], ocr_confidence: 91, ...over };
}

beforeEach(() => world({ user: 'f05-dot01@jurnl.test' }));

describe('Account order (06 / 32) — a display preference only', () => {
  it('D01 with no saved order the natural order is kept', () => {
    const ids = listActiveAccounts().map((a) => a.account_id);
    expect(orderAccounts(listActiveAccounts()).map((a) => a.account_id)).toEqual(ids);
  });
  it('D02 a saved order is applied to ALL ACCOUNTS and the MONEY parent', () => {
    expect(setAccountOrder(['visa', 'cash', 'bank', 'ride']).ok).toBe(true);
    expect(orderAccounts(listActiveAccounts()).map((a) => a.account_id)).toEqual(['visa', 'cash', 'bank', 'ride']);
    expect(getRepository().getSettings().accountOrder?.slice(0, 4)).toEqual(['visa', 'cash', 'bank', 'ride']);
  });
  it('D03 an order that misses, repeats or invents a place is refused and nothing is saved', () => {
    expect(setAccountOrder(['visa', 'cash', 'bank']).ok).toBe(false);
    expect(setAccountOrder(['visa', 'visa', 'bank', 'ride']).ok).toBe(false);
    expect(setAccountOrder(['visa', 'cash', 'bank', 'nope']).ok).toBe(false);
    expect(getRepository().getSettings().accountOrder).toBeUndefined();
  });
  it('D04 reordering changes no balance, id or entry', () => {
    spend('LUNCH', 12, 'bank');
    const before = JSON.stringify({ a: snap().accounts.map((a) => [a.account_id, a.balance]), t: tx() });
    setAccountOrder(['cash', 'visa', 'ride', 'bank']);
    expect(JSON.stringify({ a: snap().accounts.map((a) => [a.account_id, a.balance]), t: tx() })).toBe(before);
    expect([position('ride'), position('bank'), position('cash'), owed('visa')]).toEqual([300, 88, 100, 400]);
  });
  it('D05 keyboard moves swap neighbours and stop at the ends', () => {
    expect(moveInOrder(['a', 'b', 'c'], 'b', -1)).toEqual(['b', 'a', 'c']);
    expect(moveInOrder(['a', 'b', 'c'], 'a', -1)).toEqual(['a', 'b', 'c']);
    expect(moveInOrder(['a', 'b', 'c'], 'c', 1)).toEqual(['a', 'b', 'c']);
  });
  it('D06 a place added after the order was saved appears after the ordered ones', () => {
    setAccountOrder(['visa', 'cash', 'bank', 'ride']);
    const extra = { ...snap().accounts.find((a) => a.account_id === 'bank')!, account_id: 'save', display_name: 'SAVINGS', account_type: 'SAVINGS' as const };
    getRepository().upsertAccount(extra);
    expect(orderAccounts(listActiveAccounts()).map((a) => a.account_id)).toEqual(['visa', 'cash', 'bank', 'ride', 'save']);
  });
  it('D07 the MONEY parent shows the first four places of the saved order', () => {
    setAccountOrder(['cash', 'visa', 'ride', 'bank']);
    const p = computeMoneyParentReading(TODAY);
    expect(p.accounts.slice(0, 4).map((a) => a.account_id)).toEqual(['cash', 'visa', 'ride', 'bank']);
  });
});

describe('Account views (02–05)', () => {
  it('D08 assets show money held; the card shows what is owed, never as money held', () => {
    expect(held('bank')).toBe(100);
    const v = accountView('visa', TODAY)!;
    expect(v.liability).toBe(true);
    expect(v.owed).toBe(400);
    expect(v.held).toBe(0);
  });
  it('D09 available credit = limit − owed; a card without a limit shows none (never invented)', () => {
    expect(accountView('visa', TODAY)!.availableCredit).toBe(1600);
    const noLimit = { ...snap().accounts.find((a) => a.account_id === 'visa')!, account_id: 'card2', display_name: 'STORE CARD', credit_limit: null, balance: 50, available_balance: 50 };
    getRepository().upsertAccount(noLimit);
    expect(accountView('card2', TODAY)!.creditLimit).toBeNull();
    expect(accountView('card2', TODAY)!.availableCredit).toBeNull();
  });
  it('D10 kinds follow the account type (bank · payout · cash · credit)', () => {
    const k = (id: string) => kindOf(snap().accounts.find((a) => a.account_id === id)!);
    expect([k('bank'), k('ride'), k('cash'), k('visa')]).toEqual(['bank', 'payout', 'cash', 'credit']);
  });
  it('D11 money on its way in or waiting to leave is shown apart, not as held', () => {
    recordTransfer({ from_account_id: 'ride', to_account_id: 'bank', amount: 80, occurred_on: TODAY, start: 'IN_TRANSIT' });
    recordTransfer({ from_account_id: 'bank', to_account_id: 'cash', amount: 20, occurred_on: TODAY, start: 'PENDING' });
    const b = accountView('bank', TODAY)!;
    expect(b.held).toBe(100);
    expect(b.incoming).toBe(80);
    expect(b.waitingToLeave).toBe(20);
    expect(accountView('ride', TODAY)!.held).toBe(220);
  });
});

describe('Transaction histories (07–10, 31)', () => {
  beforeEach(() => {
    spend('TRATTORIA LUCIA', 84.2, 'bank', 5, 'DINING');
    spend('GROCER', 42.5, 'bank', 1, 'GROCERIES');
    spend('MARKET STALL', 12, 'cash', 2, 'FOOD');
    spend('CAFFE VESUVIO', 42.5, 'visa', 3, 'DINING');
  });
  it('D12 a place history lists only that place, newest first', () => {
    const rows = searchHistory({ accountId: 'bank' }, TODAY);
    expect(rows.map((r) => r.label)).toEqual(['GROCER', 'TRATTORIA LUCIA']);
  });
  it('D13 search matches merchant, category and notes (any case)', () => {
    expect(searchHistory({ q: 'trattoria' }, TODAY).map((r) => r.label)).toEqual(['TRATTORIA LUCIA']);
    expect(searchHistory({ q: 'dining' }, TODAY).length).toBe(2);
  });
  it('D14 filters: dates, category, type, largest first', () => {
    expect(searchHistory({ from: addDays(TODAY, -2) }, TODAY).map((r) => r.label).sort()).toEqual(['GROCER', 'MARKET STALL']);
    expect(searchHistory({ category: 'DINING', accountId: 'visa' }, TODAY).map((r) => r.label)).toEqual(['CAFFE VESUVIO']);
    expect(searchHistory({ sort: 'LARGEST' }, TODAY)[0]!.label).toBe('TRATTORIA LUCIA');
    expect(searchHistory({ kind: 'TRANSFER' }, TODAY)).toEqual([]);
  });
  it('D15 a card purchase raises what is owed (effect on the card is +), a bank purchase lowers money held', () => {
    const v = searchHistory({ accountId: 'visa' }, TODAY)[0]!;
    expect(v.cls).toBe('CREDIT_PURCHASE');
    expect(v.effect).toBe(42.5);
    expect(searchHistory({ accountId: 'bank' }, TODAY)[0]!.effect).toBe(-42.5);
  });
  it('D16 unsettled transfer legs are listed with their state and move nothing', () => {
    recordTransfer({ from_account_id: 'bank', to_account_id: 'cash', amount: 20, occurred_on: TODAY, start: 'PENDING' });
    const r = searchHistory({ accountId: 'bank', kind: 'TRANSFER' }, TODAY);
    expect(r.length).toBe(1);
    expect(r[0]!.settled).toBe(false);
    expect(r[0]!.effect).toBe(0);
  });
  it('D17 category choices come from the records', () => {
    expect(categoriesIn(searchHistory({}, TODAY))).toEqual(['DINING', 'FOOD', 'GROCERIES']);
  });
});

describe('Recording purchases (16, 18, 19, 28, 33) — one entry, saved once', () => {
  it('D18 preview writes nothing; save writes exactly the previewed entry', () => {
    const before = tx().length;
    const p = previewPurchase({ merchant: 'Osteria del Porto', amount: 84.2, account_id: 'bank', category: 'DINING', occurred_on: TODAY }, null, TODAY);
    expect(p.ok).toBe(true);
    if (!p.ok) return;
    expect(tx().length).toBe(before);
    expect(p.value.impact).toEqual([expect.objectContaining({ account_id: 'bank', before: 100, after: 15.8, liability: false })]);
    const s = savePurchase(p.value);
    expect(s.ok).toBe(true);
    expect(tx().length).toBe(before + 1);
    expect(tx().find((e) => e.id === p.value.entry.id)).toBeTruthy();
    expect(position('bank')).toBe(15.8);
  });
  it('D19 saving the same preview twice is refused (no double entry)', () => {
    const p = previewPurchase({ merchant: 'X', amount: 10, account_id: 'cash', category: 'FOOD', occurred_on: TODAY }, null, TODAY);
    if (!p.ok) throw new Error(p.error);
    expect(savePurchase(p.value).ok).toBe(true);
    const again = savePurchase(p.value);
    expect(again.ok).toBe(false);
    expect(tx().filter((e) => e.merchant === 'X').length).toBe(1);
    expect(position('cash')).toBe(90);
  });
  it('D20 a card purchase raises what the card owes and moves no cash', () => {
    const p = previewPurchase({ merchant: 'FUEL', amount: 55, account_id: 'visa', category: 'FUEL', occurred_on: TODAY }, null, TODAY);
    if (!p.ok) throw new Error(p.error);
    expect(p.value.kind).toBe('CREDIT PURCHASE');
    savePurchase(p.value);
    expect(owed('visa')).toBe(455);
    expect([position('bank'), position('cash'), position('ride')]).toEqual([100, 100, 300]);
  });
  it('D21 a cash purchase lowers cash on hand only', () => {
    const p = previewPurchase({ merchant: 'COFFEE', amount: 4.5, account_id: 'cash', category: 'DINING', occurred_on: TODAY }, null, TODAY);
    if (!p.ok) throw new Error(p.error);
    expect(p.value.kind).toBe('SPENDING');
    savePurchase(p.value);
    expect([position('cash'), position('bank'), owed('visa')]).toEqual([95.5, 100, 400]);
  });
  it('D22 a receipt attaches to that single entry (never a second transaction)', () => {
    const before = tx().length;
    const p = previewPurchase({ merchant: 'TRATTORIA LUCIA', amount: 84.2, account_id: 'bank', category: 'DINING', occurred_on: TODAY }, receipt('abc'), TODAY);
    if (!p.ok) throw new Error(p.error);
    savePurchase(p.value);
    expect(tx().length).toBe(before + 1);
    const e = tx().find((x) => x.id === p.value.entry.id)!;
    expect(e.receipt?.image_sha256).toBe('abc');
    expect(e.receipt?.stored).toBe('DEVICE');
    expect(e.receipt?.extracted.total).toBe(84.2);
  });
  it('D23 an archived place cannot take new purchases', () => {
    const a = snap().accounts.find((x) => x.account_id === 'cash')!;
    getRepository().upsertAccount({ ...a, status: 'ARCHIVED' });
    expect(previewPurchase({ merchant: 'X', amount: 5, account_id: 'cash', category: 'FOOD', occurred_on: TODAY }, null, TODAY).ok).toBe(false);
  });
  it('D24 the user text is kept as typed beside the canonical display form', () => {
    expect(sourceValues('Caffè Vesuvio', 'with Anna')).toEqual({ merchant: 'Caffè Vesuvio', memo: 'with Anna' });
    expect(sourceValues('GROCER')).toBeUndefined();
    const p = previewPurchase({ merchant: 'Caffè Vesuvio', amount: 9, account_id: 'bank', category: 'DINING', occurred_on: TODAY }, null, TODAY);
    if (!p.ok) throw new Error(p.error);
    savePurchase(p.value);
    const e = tx().find((x) => x.id === p.value.entry.id)!;
    expect(e.source_values?.merchant).toBe('Caffè Vesuvio');
  });
  it('D25 invalid amounts and empty merchants are refused before anything is written', () => {
    const before = tx().length;
    expect(previewPurchase({ merchant: 'X', amount: 0, account_id: 'bank', category: 'FOOD', occurred_on: TODAY }, null, TODAY).ok).toBe(false);
    expect(previewPurchase({ merchant: ' ', amount: 5, account_id: 'bank', category: 'FOOD', occurred_on: TODAY }, null, TODAY).ok).toBe(false);
    expect(tx().length).toBe(before);
  });
});

describe('Duplicate detection (29)', () => {
  it('D26 the same receipt image is a duplicate whatever the amount', () => {
    const p = previewPurchase({ merchant: 'A', amount: 10, account_id: 'bank', category: 'FOOD', occurred_on: TODAY }, receipt('same'), TODAY);
    if (!p.ok) throw new Error(p.error);
    savePurchase(p.value);
    const m = findDuplicatePurchase(tx(), { amount: 99, date: TODAY, merchant: 'B', account_id: 'cash', image_sha256: 'same' });
    expect(m.map((x) => x.reason)).toEqual(['SAME_RECEIPT']);
  });
  it('D27 same amount within a day at the same merchant is a likely duplicate', () => {
    spend('TRATTORIA LUCIA', 84.2, 'bank', 1);
    expect(findDuplicatePurchase(tx(), { amount: 84.2, date: TODAY, merchant: 'Trattoria Lucia', account_id: 'visa' }).map((x) => x.reason)).toEqual(['SAME_AMOUNT_DATE_MERCHANT']);
  });
  it('D28 a different amount, or more than a day apart, is not a duplicate', () => {
    spend('TRATTORIA LUCIA', 84.2, 'bank', 3);
    expect(findDuplicatePurchase(tx(), { amount: 84.2, date: TODAY, merchant: 'TRATTORIA LUCIA', account_id: 'bank' })).toEqual([]);
    expect(findDuplicatePurchase(tx(), { amount: 80, date: addDays(TODAY, -3), merchant: 'TRATTORIA LUCIA', account_id: 'bank' })).toEqual([]);
  });
  it('D29 a duplicate is only flagged in the preview; nothing is blocked or saved automatically', () => {
    spend('GROCER', 42.5, 'bank');
    const before = tx().length;
    const p = previewPurchase({ merchant: 'GROCER', amount: 42.5, account_id: 'bank', category: 'GROCERIES', occurred_on: TODAY }, null, TODAY);
    if (!p.ok) throw new Error(p.error);
    expect(p.value.duplicates.length).toBe(1);
    expect(tx().length).toBe(before);
  });
});

describe('Receipt reading (26–28, 34) — uncertainty is preserved', () => {
  const RECEIPT = ['OSTERIA DEL PORTO', 'VIA DEL MARE 12', '11/03/2026 19:42', 'ANTIPASTO 18.00', 'PASTA 28.00', 'VINO 32.00', 'SUBTOTAL 78.00', 'TAX 6.20', 'TOTAL 84.20', 'VISA ****4242 84.20'].join('\n');
  it('D30 merchant, date, total, subtotal, tax and items are read', () => {
    const r = parseReceiptText(RECEIPT, 91);
    expect(r).toMatchObject({ merchant: 'OSTERIA DEL PORTO', date: '2026-11-03', total: 84.2, subtotal: 78, tax: 6.2 });
    expect(r.items.map((i) => i.name)).toEqual(['ANTIPASTO', 'PASTA', 'VINO']);
    expect(r.warnings).toEqual([]);
  });
  it('D31 a total that cannot be read stays empty (never guessed) and is flagged', () => {
    const r = parseReceiptText(RECEIPT.replace('TOTAL 84.20', 'T0TAI 8A.2O'), 80);
    expect(r.total).toBeNull();
    expect(r.warnings).toContain('NO_TOTAL');
  });
  it('D32 totals that do not add up are flagged', () => {
    expect(parseReceiptText(RECEIPT.replace('TOTAL 84.20', 'TOTAL 94.20'), 90).warnings).toContain('CONFLICTING_TOTALS');
  });
  it('D33 low engine confidence and empty text are flagged', () => {
    expect(parseReceiptText(RECEIPT, 40).warnings).toContain('LOW_CONFIDENCE');
    expect(parseReceiptText('', 0).warnings).toContain('NO_TEXT');
  });
  it('D34 ISO, US and written dates are read; impossible dates are not', () => {
    expect(parseReceiptText('SHOP\n2026-10-30\nTOTAL 5.00').date).toBe('2026-10-30');
    expect(parseReceiptText('SHOP\nOCT 30, 2026\nTOTAL 5.00').date).toBe('2026-10-30');
    expect(parseReceiptText('SHOP\n30/10/2026\nTOTAL 5.00').date).toBe('2026-10-30');
    expect(parseReceiptText('SHOP\n13/13/2026\nTOTAL 5.00').date).toBeNull();
  });
  it('D35 only photos up to 12 MB are accepted; PDFs get an honest message', () => {
    expect(checkReceiptFile({ type: 'image/jpeg', size: 1_000_000 })).toBeNull();
    expect(checkReceiptFile({ type: 'image/heic', size: 1_000_000 })).toBeNull();
    expect(checkReceiptFile({ type: 'application/pdf', size: 1000 })).toMatch(/PDF/);
    expect(checkReceiptFile({ type: 'image/png', size: 13 * 1024 * 1024 })).toMatch(/12 MB/);
    expect(checkReceiptFile({ type: 'text/plain', size: 10 })).toMatch(/NOT SUPPORTED/);
  });
});

describe('Corrections and reversals (24, 37) — the trail is kept', () => {
  it('D36 a correction keeps the entry id, applies the new amount and appends what it replaced', () => {
    const e = spend('CAFFE VESUVIO', 42.5, 'bank');
    const p = previewCorrection(e.id, { amount: 35 }, TODAY);
    expect(p.ok).toBe(true);
    if (!p.ok) return;
    expect(p.value.changed).toEqual(['AMOUNT']);
    expect(p.value.impact).toEqual([expect.objectContaining({ account_id: 'bank', before: 57.5, after: 65 })]);
    expect(position('bank')).toBe(57.5); // preview wrote nothing
    expect(applyCorrection(e.id, { amount: 35 }, 'typo').ok).toBe(true);
    const after = tx().find((x) => x.id === e.id)!;
    expect(after.amount).toBe(35);
    expect(after.correction_history).toEqual([expect.objectContaining({ reason: 'TYPO', before: expect.objectContaining({ amount: 42.5, merchant: 'CAFFE VESUVIO' }) })]);
    expect(position('bank')).toBe(65);
    expect(tx().filter((x) => x.merchant === 'CAFFE VESUVIO').length).toBe(1);
  });
  it('D37 reassigning a bank purchase to the card makes it a credit purchase (cash back, card owes more)', () => {
    const e = spend('BOOKSHOP', 20, 'bank');
    expect(applyCorrection(e.id, { account_id: 'visa' }, '').ok).toBe(true);
    const after = tx().find((x) => x.id === e.id)!;
    expect(entryClass(after, resolveEntryAccount(after, snap().accounts))).toBe('CREDIT_PURCHASE');
    expect([position('bank'), owed('visa')]).toEqual([100, 420]);
  });
  it('D38 two corrections keep both earlier versions in order', () => {
    const e = spend('X', 10, 'bank');
    applyCorrection(e.id, { amount: 12 }, 'one');
    applyCorrection(e.id, { category: 'FOOD' }, 'two');
    const h = tx().find((x) => x.id === e.id)!.correction_history!;
    expect(h.map((c) => c.reason)).toEqual(['ONE', 'TWO']);
    expect(h[1]!.before.amount).toBe(12);
  });
  it('D39 a reversal removes the entry from every balance and keeps a full copy in the audit', () => {
    const e = spend('DOUBLE CHARGE', 30, 'bank');
    expect(previewReversal(e.id, TODAY)).toEqual([expect.objectContaining({ before: 70, after: 100 })]);
    expect(reverseEntry(e.id, 'REVERSED', 'charged twice').ok).toBe(true);
    expect(tx().some((x) => x.id === e.id)).toBe(false);
    expect(position('bank')).toBe(100);
    const audit = auditFor('bank');
    expect(audit[0]).toMatchObject({ action: 'REVERSED', reason: 'CHARGED TWICE' });
    expect((audit[0]!.entry as { id: string }).id).toBe(e.id);
  });
  it('D40 an entry cannot be reversed twice', () => {
    const e = spend('ONCE', 5, 'cash');
    expect(reverseEntry(e.id, 'MARKED_DUPLICATE', '').ok).toBe(true);
    const again = reverseEntry(e.id, 'REVERSED', '');
    expect(again.ok).toBe(false);
    expect(position('cash')).toBe(100);
    expect(auditFor('cash').length).toBe(1);
  });
  it('D41 transfer legs, income and balance corrections are changed by their owners, not here', () => {
    const t = recordTransfer({ from_account_id: 'bank', to_account_id: 'cash', amount: 10, occurred_on: TODAY });
    if (!t.ok) throw new Error(t.error);
    const leg = tx().find((x) => x.link?.id === t.value.linkId)!;
    expect(correctionCheck(leg.id)).toMatchObject({ ok: false, owner: { route: 'money/places' } });
    expect(reverseEntry(leg.id, 'REVERSED', '').ok).toBe(false);
    const adj = adjustToActual('bank', 50, TODAY);
    if (!adj.ok || !adj.value.entryId) throw new Error('adjustment');
    expect(correctionCheck(adj.value.entryId).ok).toBe(false);
  });
  it('D42 a correction that changes nothing reports no change', () => {
    const e = spend('SAME', 7, 'bank');
    const p = previewCorrection(e.id, { amount: 7 }, TODAY);
    expect(p.ok && p.value.changed).toEqual([]);
  });
});

describe('Balance review and reconciliation (13, 23, 35)', () => {
  it('D43 tracked, actual and difference are separate numbers; nothing is stored for the actual', () => {
    const r = reconciliationOf('bank', TODAY)!;
    expect(r.tracked).toBe(100);
    expect(r.status).toBe('NEVER REVIEWED');
    expect(differenceOf(100, 92.5)).toBe(-7.5);
    expect(position('bank')).toBe(100);
  });
  it('D44 a place with a difference can never be marked reconciled', () => {
    const r = markReconciled('bank', 92.5, TODAY);
    expect(r.ok).toBe(false);
    expect(reconciliationOf('bank', TODAY)!.status).toBe('NEVER REVIEWED');
  });
  it('D45 the adjustment is one balance correction (ADJUSTMENT: not income, not spending), with the reason', () => {
    const before = tx().length;
    const r = adjustToActual('bank', 92.5, TODAY, { reason: 'BANK FEE NOT RECORDED', notes: 'monthly fee' });
    expect(r.ok && r.value.difference).toBe(-7.5);
    expect(tx().length).toBe(before + 1);
    const e = tx().find((x) => x.id === (r.ok ? r.value.entryId : ''))!;
    expect(e.link?.kind).toBe('BALANCE_CORRECTION');
    expect(entryClass(e, resolveEntryAccount(e, snap().accounts))).toBe('ADJUSTMENT');
    expect(e.memo).toContain('BANK FEE NOT RECORDED');
    expect(position('bank')).toBe(92.5);
    const pic = computeMoneyPicture(snap().accounts, snap().creditAttributes, tx(), TODAY);
    expect(pic).toBeTruthy();
  });
  it('D46 after the adjustment the place can be marked reconciled; the mark goes stale when the balance moves', () => {
    adjustToActual('bank', 92.5, TODAY);
    expect(markReconciled('bank', 92.5, TODAY).ok).toBe(true);
    expect(reconciliationOf('bank', TODAY)!.status).toBe('RECONCILED');
    spend('LATER', 2.5, 'bank');
    expect(reconciliationOf('bank', TODAY)!.status).toBe('NOT RECONCILED');
    expect(reviewIssues('bank', TODAY).map((i) => i.id)).toContain('NOT_RECONCILED');
  });
  it('D47 a zero difference records nothing', () => {
    const before = tx().length;
    expect(adjustToActual('bank', 100, TODAY).ok).toBe(true);
    expect(tx().length).toBe(before);
  });
  it('D48 cards reconcile on what is owed (an actual owed above tracked raises the debt)', () => {
    const r = adjustToActual('visa', 410, TODAY);
    expect(r.ok && r.value.difference).toBe(10);
    expect(owed('visa')).toBe(410);
    expect([position('bank'), position('cash')]).toEqual([100, 100]);
  });
  it('D49 an unconfirmed old transfer is a review issue that cannot just be dismissed', () => {
    recordTransfer({ from_account_id: 'bank', to_account_id: 'cash', amount: 10, occurred_on: addDays(TODAY, -20) as CalendarDate, start: 'IN_TRANSIT' });
    const ids = reviewIssues('bank', TODAY).map((i) => i.id);
    if (ids.includes('UNCONFIRMED_TRANSFER')) expect(markIssueResolved('bank', 'UNCONFIRMED_TRANSFER', TODAY).ok).toBe(false);
    expect(markIssueResolved('bank', 'STALE_BALANCE', TODAY).ok).toBe(true);
  });
});

describe('Archiving (25, 36) — dependencies first', () => {
  it('D50 a card that still owes cannot be archived', () => {
    expect(archiveBlockers('visa', TODAY).map((b) => b.kind)).toContain('OPEN_BALANCE');
    expect(archiveAccountSafely('visa', TODAY).ok).toBe(false);
    expect(snap().accounts.find((a) => a.account_id === 'visa')!.status).toBe('ACTIVE');
  });
  it('D51 an unfinished transfer blocks both places', () => {
    recordTransfer({ from_account_id: 'bank', to_account_id: 'cash', amount: 10, occurred_on: TODAY, start: 'PENDING' });
    expect(archiveBlockers('bank', TODAY).map((b) => b.kind)).toContain('ACTIVE_TRANSFER');
    expect(archiveBlockers('cash', TODAY).map((b) => b.kind)).toContain('ACTIVE_TRANSFER');
  });
  it('D52 a default purpose, a recurring bill, expected income and reserved money each block', () => {
    setPurposeAccount('BILLS', 'cash');
    expect(archiveBlockers('cash', TODAY).map((b) => b.kind)).toContain('DEFAULT_ACCOUNT');
    const bill = createBillOrSubscription({ name: 'PHONE', amount: 50, cadence: 'MONTHLY', next_due_date: addDays(TODAY, 6), kind: 'BILL', account_id: 'ride' });
    expect(bill.ok).toBe(true);
    expect(archiveBlockers('ride', TODAY).map((b) => b.kind)).toContain('RECURRING_PAYMENT');
    createIncomeSource({ source_name: 'PAYCHECK', amount: 500, cadence: 'MONTHLY', next_due_date: addDays(TODAY, 4), account_id: 'bank' } as Parameters<typeof createIncomeSource>[0]);
    expect(archiveBlockers('bank', TODAY).map((b) => b.kind)).toContain('EXPECTED_INCOME');
    const s = snap();
    const pos = computeLedgerPositions(s.accounts, s.creditAttributes, s.transactions, TODAY).positions;
    if (!bill.ok) return;
    const set = applyOp(buildSetAside(s.accounts, pos, s.reservations, { target: { kind: 'OBLIGATION', id: bill.value.obligation_id, occurrence_date: bill.value.next_due_date, name: 'PHONE', cap: 50 }, account_id: 'ride', amount: 20 }));
    expect(set.ok).toBe(true);
    expect(archiveBlockers('ride', TODAY).map((b) => b.kind)).toContain('RESERVED_FUNDS');
  });
  it('D53 a place with nothing depending on it is archived; its history stays and it leaves the order', () => {
    const e = spend('OLD', 5, 'cash');
    setAccountOrder(['cash', 'bank', 'ride', 'visa']);
    expect(archiveBlockers('cash', TODAY)).toEqual([]);
    expect(archiveAccountSafely('cash', TODAY).ok).toBe(true);
    expect(listActiveAccounts().map((a) => a.account_id)).not.toContain('cash');
    expect(tx().some((x) => x.id === e.id)).toBe(true);
    expect(getRepository().getSettings().accountOrder).not.toContain('cash');
    expect(previewPurchase({ merchant: 'X', amount: 1, account_id: 'cash', category: 'FOOD', occurred_on: TODAY }, null, TODAY).ok).toBe(false);
  });
});

describe('Card payments and transfers (17, 20) — recorded, scheduled, in transit, completed', () => {
  it('D54 preview writes nothing', () => {
    const before = tx().length;
    expect(previewTransfer({ from_account_id: 'bank', to_account_id: 'visa', amount: 35, occurred_on: TODAY, start: 'COMPLETED' }, TODAY).ok).toBe(true);
    expect(tx().length).toBe(before);
  });
  it('D55 a completed card payment lowers the bank and what the card owes by the same amount', () => {
    const p = previewTransfer({ from_account_id: 'bank', to_account_id: 'visa', amount: 35, occurred_on: TODAY, start: 'COMPLETED' }, TODAY);
    if (!p.ok) throw new Error(p.error);
    expect(p.value.kind).toBe('CARD_PAYMENT');
    expect(saveTransfer(p.value).ok).toBe(true);
    expect([position('bank'), owed('visa')]).toEqual([65, 365]);
  });
  it('D56 a submitted or scheduled payment moves nothing yet (never treated as settled)', () => {
    for (const start of ['PENDING', 'SCHEDULED'] as const) {
      const p = previewTransfer({ from_account_id: 'bank', to_account_id: 'visa', amount: start === 'PENDING' ? 35 : 36, occurred_on: start === 'SCHEDULED' ? addDays(TODAY, 2) : TODAY, start }, TODAY);
      if (!p.ok) throw new Error(p.error);
      expect(p.value.impact.every((i) => i.before === i.after)).toBe(true);
      expect(saveTransfer(p.value).ok).toBe(true);
    }
    expect([position('bank'), owed('visa')]).toEqual([100, 400]);
  });
  it('D57b the canonical guard refuses recording the same payment twice the same day', () => {
    const a = previewTransfer({ from_account_id: 'bank', to_account_id: 'visa', amount: 35, occurred_on: TODAY, start: 'PENDING' }, TODAY);
    if (!a.ok) throw new Error(a.error);
    saveTransfer(a.value);
    expect(previewTransfer({ from_account_id: 'bank', to_account_id: 'visa', amount: 35, occurred_on: TODAY, start: 'COMPLETED' }, TODAY).ok).toBe(false);
  });
  it('D57 saving the same transfer twice is refused', () => {
    const p = previewTransfer({ from_account_id: 'bank', to_account_id: 'cash', amount: 40, occurred_on: TODAY, start: 'COMPLETED' }, TODAY);
    if (!p.ok) throw new Error(p.error);
    expect(saveTransfer(p.value).ok).toBe(true);
    expect(saveTransfer(p.value).ok).toBe(false);
    expect([position('bank'), position('cash')]).toEqual([60, 140]);
  });
  it('D58 cash withdrawn from the bank is a transfer, not income', () => {
    const p = previewTransfer({ from_account_id: 'bank', to_account_id: 'cash', amount: 40, occurred_on: TODAY, start: 'COMPLETED' }, TODAY);
    if (!p.ok) throw new Error(p.error);
    saveTransfer(p.value);
    const legs = tx().filter((e) => e.link?.id === p.value.linkId);
    expect(legs.length).toBe(2);
    expect(legs.every((e) => entryClass(e, resolveEntryAccount(e, snap().accounts)) === 'TRANSFER')).toBe(true);
  });
  it('D59 a card cannot be paid more than it owes, and cash cannot go below zero (nothing would vanish from the picture)', () => {
    const over = previewTransfer({ from_account_id: 'bank', to_account_id: 'visa', amount: 450, occurred_on: TODAY, start: 'COMPLETED' }, TODAY);
    expect(over.ok).toBe(false);
    expect(over.ok ? '' : over.error).toMatch(/MORE THAN VISA OWES/);
    const pending = previewTransfer({ from_account_id: 'bank', to_account_id: 'visa', amount: 300, occurred_on: TODAY, start: 'PENDING' }, TODAY);
    if (!pending.ok) throw new Error(pending.error);
    saveTransfer(pending.value);
    // 300 is already on its way: only 100 more can be recorded
    expect(previewTransfer({ from_account_id: 'ride', to_account_id: 'visa', amount: 150, occurred_on: TODAY, start: 'COMPLETED' }, TODAY).ok).toBe(false);
    expect(previewTransfer({ from_account_id: 'ride', to_account_id: 'visa', amount: 100, occurred_on: TODAY, start: 'COMPLETED' }, TODAY).ok).toBe(true);
    const cash = previewTransfer({ from_account_id: 'cash', to_account_id: 'bank', amount: 150, occurred_on: TODAY, start: 'COMPLETED' }, TODAY);
    expect(cash.ok ? '' : cash.error).toMatch(/HOLDS ONLY/);
    const bank = previewTransfer({ from_account_id: 'bank', to_account_id: 'cash', amount: 150, occurred_on: TODAY, start: 'COMPLETED' }, TODAY);
    expect(bank.ok && bank.value.warnings[0]).toMatch(/BELOW ZERO/);
  });
  it('D60 the money picture still balances after DOT 01 entries (tracked = held + in transit)', () => {
    spend('A', 10, 'bank');
    recordTransfer({ from_account_id: 'ride', to_account_id: 'bank', amount: 80, occurred_on: TODAY, start: 'IN_TRANSIT' });
    adjustToActual('cash', 95, TODAY);
    const pic = computeMoneyPicture(snap().accounts, snap().creditAttributes, tx(), TODAY);
    expect(pic.inTransit).toBe(80);
    expect(pic.trackedAssets).toBe(pic.availableInAccounts + pic.inTransit);
  });
});
