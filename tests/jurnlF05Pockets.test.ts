/**
 * P0.JURNL.F05-MONEY.DOT01.POCKET-CONTEXT-MANAGEMENT-AND-RENAME-DELETE.UX1 — Pocket rename / delete invariants.
 * Synthetic world (tests/helpers/jurnlFinancialWorld.ts). Rename is the canonical `renameAccount` (by id); DELETE POCKET is
 * the canonical archive (`archiveAccountSafely`): nothing is erased and the same blockers apply.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { getRepository } from '../src/projects/jurnl/data/repository/deviceRepository';
import { recordExpense, recordTransfer, renameAccount } from '../src/projects/jurnl/data/ledger/ledgerOps';
import { computeMoneyPicture } from '../src/projects/jurnl/data/ledger/moneyPicture';
import { accountView } from '../src/projects/jurnl/data/f05/dot01/accountView';
import { archiveAccountSafely, archiveBlockers } from '../src/projects/jurnl/data/f05/dot01/archive';
import { searchHistory } from '../src/projects/jurnl/data/f05/dot01/history';
import { checkPocketName, POCKET_NAME_MAX } from '../src/projects/jurnl/data/f05/dot01/pocketName';
import { computeMoneyParentReading } from '../src/projects/jurnl/data/f05/moneyParentReading';
import { listActiveAccounts } from '../src/projects/jurnl/data/foundation/accounts';
import { TODAY, world } from './helpers/jurnlFinancialWorld';

const snap = () => getRepository().getSnapshot();
const picture = () => { const s = snap(); return computeMoneyPicture(s.accounts, s.creditAttributes, s.transactions, TODAY); };

beforeEach(() => world({ user: 'f05-pockets@jurnl.test' }));

describe('RENAME POCKET (by id, canonical)', () => {
  it('P01 / T07 a rename persists in the stored snapshot under the same id', () => {
    const r = renameAccount('bank', 'Everyday Pocket');
    expect(r.ok).toBe(true);
    const a = snap().accounts.find((x) => x.account_id === 'bank')!;
    expect(a.display_name).toBe('EVERYDAY POCKET');
    expect(snap().accounts.filter((x) => x.display_name === 'EVERYDAY POCKET')).toHaveLength(1);
  });
  it('P02 / T08 every reader shows the new name: the Pocket view, the MONEY parent and the history rows', () => {
    recordExpense({ merchant: 'BAKERY', amount: 4, account_id: 'bank', category: 'FOOD', occurred_on: TODAY });
    renameAccount('bank', 'EVERYDAY POCKET');
    expect(accountView('bank', TODAY)!.account.display_name).toBe('EVERYDAY POCKET');
    expect(computeMoneyParentReading(TODAY).accounts.find((x) => x.account_id === 'bank')?.name).toBe('EVERYDAY POCKET');
    expect(searchHistory({ accountId: null }, TODAY).filter((r) => r.entry.account_id === 'bank').every((r) => r.account?.display_name === 'EVERYDAY POCKET')).toBe(true);
  });
  it('P03 / T09 a rename changes no balance, position, entry or ownership', () => {
    recordTransfer({ from_account_id: 'bank', to_account_id: 'cash', amount: 10, occurred_on: TODAY, start: 'COMPLETED' });
    const before = { pic: picture(), tx: JSON.stringify(snap().transactions.map((t) => ({ id: t.id, amount: t.amount, account_id: t.account_id }))), held: accountView('bank', TODAY)!.held };
    renameAccount('bank', 'EVERYDAY POCKET');
    const after = picture();
    expect(accountView('bank', TODAY)!.held).toBe(before.held);
    expect(after.trackedAssets).toBe(before.pic.trackedAssets);
    expect(after.availableInAccounts).toBe(before.pic.availableInAccounts);
    expect(JSON.stringify(snap().transactions.map((t) => ({ id: t.id, amount: t.amount, account_id: t.account_id })))).toBe(before.tx);
  });
  it('P04 / T10 invalid names are refused before anything is written', () => {
    expect(checkPocketName('', 'BANK').ok).toBe(false);
    expect(checkPocketName('   a  ', 'BANK').ok).toBe(false);
    expect(checkPocketName('x'.repeat(POCKET_NAME_MAX + 1), 'BANK').ok).toBe(false);
    expect(checkPocketName('BANK\u0007', 'BANK').ok).toBe(false);
    const ok = checkPocketName('  travel   fund  ', 'BANK');
    expect(ok.ok && ok.name).toBe('travel fund');
  });
  it('P05 / T10 a duplicate active name is refused by the canonical rename; nothing changes', () => {
    const cash = snap().accounts.find((a) => a.account_id === 'cash')!.display_name;
    const r = renameAccount('bank', cash.toLowerCase());
    expect(r.ok).toBe(false);
    expect(snap().accounts.find((a) => a.account_id === 'bank')!.display_name).not.toBe(cash);
  });
  it('P06 saving the same name is recognised as unchanged (idempotent)', () => {
    const cur = accountView('bank', TODAY)!.account.display_name;
    const c = checkPocketName(` ${cur.toLowerCase()} `, cur);
    expect(c.ok && c.unchanged).toBe(true);
  });
});

describe('DELETE POCKET = the canonical archive (authorities 25 / 36)', () => {
  it('P07 / T14 an unfinished transfer blocks the delete; the Pocket stays active', () => {
    recordTransfer({ from_account_id: 'bank', to_account_id: 'cash', amount: 10, occurred_on: TODAY, start: 'PENDING' });
    expect(archiveBlockers('bank', TODAY).map((b) => b.kind)).toContain('ACTIVE_TRANSFER');
    expect(archiveAccountSafely('bank', TODAY).ok).toBe(false);
    expect(listActiveAccounts().map((a) => a.account_id)).toContain('bank');
  });
  it('P08 / T14 a card that still owes cannot be deleted', () => {
    expect(archiveAccountSafely('visa', TODAY).ok).toBe(false);
    expect(snap().accounts.find((a) => a.account_id === 'visa')!.status).toBe('ACTIVE');
  });
  it('P09 / T13 / T15 a delete archives: the Pocket leaves active views, its entries and their amounts stay', () => {
    const e = recordExpense({ merchant: 'OLD', amount: 5, account_id: 'cash', category: 'FOOD', occurred_on: TODAY });
    if (!e.ok) throw new Error(e.error);
    // ZERO BALANCE BEFORE ARCHIVE: the rest is spent first, as a recorded entry
    const rest = recordExpense({ merchant: 'LAST OF THE CASH', amount: accountView('cash', TODAY)!.held, account_id: 'cash', category: 'FOOD', occurred_on: TODAY });
    if (!rest.ok) throw new Error(rest.error);
    const n = snap().transactions.length;
    expect(archiveAccountSafely('cash', TODAY).ok).toBe(true);
    expect(listActiveAccounts().map((a) => a.account_id)).not.toContain('cash');
    expect(snap().accounts.find((a) => a.account_id === 'cash')!.status).toBe('ARCHIVED');
    expect(snap().transactions).toHaveLength(n);
    expect(snap().transactions.find((t) => t.id === e.value.id)?.amount).toBe(e.value.amount);
    expect(computeMoneyParentReading(TODAY).accounts.map((a) => a.account_id)).not.toContain('cash');
  });
  it('P08b / T14 a Pocket that still holds money cannot be deleted (ZERO BALANCE BEFORE ARCHIVE); nothing is moved', () => {
    const held = accountView('cash', TODAY)!.held;
    expect(held).toBeGreaterThan(0);
    expect(archiveBlockers('cash', TODAY).map((b) => b.kind)).toContain('HELD_BALANCE');
    expect(archiveAccountSafely('cash', TODAY).ok).toBe(false);
    expect(accountView('cash', TODAY)!.held).toBe(held);
    expect(snap().accounts.find((a) => a.account_id === 'cash')!.status).toBe('ACTIVE');
  });
  it('P10 a deleted Pocket cannot be renamed (the canonical rename requires an active account)', () => {
    recordExpense({ merchant: 'LAST OF THE CASH', amount: accountView('cash', TODAY)!.held, account_id: 'cash', category: 'FOOD', occurred_on: TODAY });
    archiveAccountSafely('cash', TODAY);
    expect(renameAccount('cash', 'GHOST').ok).toBe(false);
  });
});

describe('RENAME POCKET reaches transfer titles (display only)', () => {
  it('P11 / T08 a transfer leg reads the other Pocket by its current name; the stored entry is not rewritten', () => {
    const r = recordTransfer({ from_account_id: 'bank', to_account_id: 'cash', amount: 10, occurred_on: TODAY, start: 'COMPLETED' });
    expect(r.ok).toBe(true);
    renameAccount('bank', 'EVERYDAY POCKET');
    const inLeg = searchHistory({ accountId: 'cash' }, TODAY).find((x) => x.entry.link?.leg === 'IN')!;
    expect(inLeg.label).toBe('TRANSFER FROM EVERYDAY POCKET');
    expect(snap().transactions.find((t) => t.id === inLeg.id)!.merchant).not.toBe('TRANSFER FROM EVERYDAY POCKET');
    expect(inLeg.entry.amount).toBe(10);
    // searching by the new name finds it
    expect(searchHistory({ accountId: 'cash', q: 'everyday' }, TODAY).map((x) => x.id)).toContain(inLeg.id);
  });
});
