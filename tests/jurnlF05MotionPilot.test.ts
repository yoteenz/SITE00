/**
 * P0.JURNL.F05-MONEY.PARENT-ANIMATED-COLLAGE-RECONSTRUCTION-AND-FIDELITY-PILOT — data binding, layout and assets.
 * Synthetic world only (tests/helpers/jurnlFinancialWorld.ts).
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { artFor, computeMoneyParentReading, nameLines, OPEN_TRANSFER_STATES, pageAccounts } from '../src/projects/jurnl/data/f05/moneyParentReading';
import { computeSafeToSpend } from '../src/projects/jurnl/data/f09/safeToSpend';
import { recordTransfer, recordTransferStep } from '../src/projects/jurnl/data/ledger/ledgerOps';
import { getRepository } from '../src/projects/jurnl/data/repository/deviceRepository';
import { upsertCreditTerms } from '../src/projects/jurnl/data/f12/creditStore';
import { addDays } from '../src/projects/jurnl/data/foundation/dates';
import { accountItems, APPROVED_SLOTS, capacityFor, computeF05MotionLayout, CROP, SRC_H, SRC_W } from '../src/projects/jurnl/runtime/screens/f05/f05MotionLayout';
import { resolveF05ParentVariant } from '../src/projects/jurnl/runtime/screens/f05/MoneyParentRoute';
import { TODAY, acct, position, world } from './helpers/jurnlFinancialWorld';

const ASSET_DIR = path.resolve('src/projects/jurnl/families/F05_MONEY/MOTION_PILOT');
const snap = () => getRepository().getSnapshot();

function approvedWorld() {
  world({
    user: 'f05-pilot@jurnl.test',
    accounts: [
      acct('bank', 'BANK ACCOUNT', 'CHECKING', 1260),
      acct('ride', 'RIDESHARE CARD', 'DEBIT_CARD', 840, { is_payout_card: true }),
      acct('cash', 'CASH ON HAND', 'CASH', 350),
      acct('visa', 'CREDIT CARD', 'CREDIT_CARD', 780, { credit_limit: 2000, include_in_safe_to_spend: false }),
    ],
  });
  upsertCreditTerms('visa', { credit_limit: 2000, current_balance: 780, minimum_payment: 35, payment_due_date: addDays(TODAY, 5), statement_closing_date: addDays(TODAY, -10) });
}

describe('F05 parent figures come from the canonical model', () => {
  beforeEach(() => approvedWorld());

  it('HELD is money in asset accounts, OWED is card and loan debt; they are never netted', () => {
    const r = computeMoneyParentReading(TODAY);
    expect(r.held).toBe(1260 + 840 + 350);
    expect(r.owed).toBe(780);
    expect(r.accounts.find((a) => a.account_id === 'visa')).toMatchObject({ nature: 'LIABILITY', amount: 780, art: 'credit' });
    expect(r.accounts.filter((a) => a.nature === 'ASSET').map((a) => a.amount)).toEqual([1260, 840, 350]);
  });

  it('AVAILABLE is F09 Safe to Spend (30 days) and COMMITTED is exactly what Safe to Spend holds back', () => {
    const r = computeMoneyParentReading(TODAY);
    const sts = computeSafeToSpend();
    expect(r.available).toBe(sts.value);
    expect(r.availableBasis).toBe('SAFE_TO_SPEND_NEXT_30_DAYS');
    const heldBack = sts.protected + sts.safetyBuffer + sts.assigned + sts.goalReserved + sts.purchaseReserved + sts.tripReserved;
    expect(r.committed).toBeCloseTo(sts.upcoming + sts.cardPayments + sts.committedTransfers + heldBack, 2);
    // AVAILABLE = Safe to Spend cash − COMMITTED (the one formula), not HELD − OWED − COMMITTED.
    expect(r.available).toBeCloseTo(sts.cash - r.committed, 2);
    expect(r.committedParts.cardMinimums).toBe(35);
  });

  it('a transfer on its way is shown as on its way: the destination is not credited, HELD drops by the amount in transit', () => {
    const t = recordTransfer({ from_account_id: 'ride', to_account_id: 'bank', amount: 80, occurred_on: TODAY, start: 'IN_TRANSIT' });
    expect(t.ok).toBe(true);
    const r = computeMoneyParentReading(TODAY);
    const bank = r.accounts.find((a) => a.account_id === 'bank')!;
    const ride = r.accounts.find((a) => a.account_id === 'ride')!;
    expect(bank).toMatchObject({ amount: 1260, incoming: 80 });
    expect(ride).toMatchObject({ amount: 760, inTransitOut: 80 });
    expect(r.held).toBe(2450 - 80);
    expect(r.inTransit).toBe(80);
    recordTransferStep(t.ok ? t.value.linkId : '', 'RECEIVED');
    const after = computeMoneyParentReading(TODAY);
    expect(after.accounts.find((a) => a.account_id === 'bank')).toMatchObject({ amount: 1340, incoming: 0 });
    expect(after.held).toBe(2450);
  });

  it('reading the page changes no record', () => {
    const before = JSON.stringify(snap());
    computeMoneyParentReading(TODAY);
    computeMoneyParentReading(TODAY);
    expect(JSON.stringify(snap())).toBe(before);
    expect(position('bank')).toBe(1260);
  });

  it('accounts keep their own ids, names and order; art follows the kind of place', () => {
    const r = computeMoneyParentReading(TODAY);
    expect(r.accounts.map((a) => [a.account_id, a.name, a.art])).toEqual([
      ['bank', 'BANK ACCOUNT', 'bank'],
      ['ride', 'RIDESHARE CARD', 'payout'],
      ['cash', 'CASH ON HAND', 'cash'],
      ['visa', 'CREDIT CARD', 'credit'],
    ]);
    expect(artFor('SAVINGS', false)).toBe('bank');
    expect(artFor('CHECKING', true)).toBe('payout');
    expect(artFor('LOAN', false)).toBe('credit');
    expect(artFor('OTHER', false)).toBe('bank');
  });

  it('zero accounts: no figures are invented', () => {
    world({ user: 'f05-empty@jurnl.test', accounts: [] });
    const r = computeMoneyParentReading(TODAY);
    expect(r.accounts).toEqual([]);
    expect(r.held).toBe(0);
    expect(r.owed).toBe(0);
    expect(r.cashSource).toBe('MOCK');
  });
});

describe('Transfer and card-payment states on the page follow the #1706 settlement model', () => {
  beforeEach(() => approvedWorld());
  const linkOf = (r: ReturnType<typeof recordTransfer>) => (r.ok ? r.value.linkId : '');
  const read = () => computeMoneyParentReading(TODAY);
  const acc = (id: string) => read().accounts.find((a) => a.account_id === id)!;

  it('scheduled: a planned connection, no money moved', () => {
    recordTransfer({ from_account_id: 'ride', to_account_id: 'bank', amount: 80, occurred_on: addDays(TODAY, 2), start: 'SCHEDULED' });
    const r = read();
    expect(r.transfers).toMatchObject([{ state: 'SCHEDULED', amount: 80, fromId: 'ride', toId: 'bank', label: 'PLANNED', confirmation: 'RECORDED_BY_YOU' }]);
    expect([acc('ride').amount, acc('bank').amount, r.held]).toEqual([840, 1260, 2450]);
    expect(acc('ride').transferLine).toBe('→ $80 PLANNED');
    expect(acc('bank').transferLine).toBe('← $80 PLANNED');
  });

  it('pending (source not debited): balances unchanged', () => {
    recordTransfer({ from_account_id: 'ride', to_account_id: 'bank', amount: 80, occurred_on: TODAY, start: 'PENDING' });
    expect([acc('ride').amount, acc('bank').amount, read().held]).toEqual([840, 1260, 2450]);
    expect(acc('bank').transferLine).toBe('← $80 NOT LEFT YET');
  });

  it('in transit → completed → the line disappears; failed and cancelled close with balances from the ledger', () => {
    const t = linkOf(recordTransfer({ from_account_id: 'ride', to_account_id: 'bank', amount: 80, occurred_on: TODAY, start: 'IN_TRANSIT' }));
    expect(read().transfers[0]).toMatchObject({ state: 'IN_TRANSIT', label: 'IN TRANSIT' });
    expect([acc('ride').amount, acc('bank').amount]).toEqual([760, 1260]);
    recordTransferStep(t, 'RECEIVED');
    expect(read().transfers).toEqual([]);
    expect(read().transferStates[t]).toBe('COMPLETED');
    expect([acc('ride').amount, acc('bank').amount, acc('bank').transferLine]).toEqual([760, 1340, null]);

    const f = linkOf(recordTransfer({ from_account_id: 'cash', to_account_id: 'bank', amount: 50, occurred_on: TODAY, start: 'IN_TRANSIT' }));
    recordTransferStep(f, 'FAIL');
    expect(read().transfers[0]).toMatchObject({ state: 'RETURNING', label: 'FAILED · MONEY COMING BACK' });
    expect(acc('cash').amount).toBe(300); // not restored until the money is recorded as back
    recordTransferStep(f, 'MONEY_RETURNED');
    expect(read().transferStates[f]).toBe('FAILED');
    expect(acc('cash').amount).toBe(350);

    const c = linkOf(recordTransfer({ from_account_id: 'bank', to_account_id: 'cash', amount: 20, occurred_on: TODAY, start: 'PENDING' }));
    recordTransferStep(c, 'CANCEL');
    expect(read().transferStates[c]).toBe('CANCELLED');
    expect(read().transfers).toEqual([]);
    expect([acc('bank').amount, acc('cash').amount]).toEqual([1340, 350]);
  });

  it('card payment: submitted and paid-not-confirmed never lower the debt; issuer confirmation does; never spending', () => {
    const p = linkOf(recordTransfer({ from_account_id: 'bank', to_account_id: 'visa', amount: 35, occurred_on: TODAY, start: 'PENDING' }));
    expect(read().transfers[0]).toMatchObject({ kind: 'CARD_PAYMENT', state: 'PENDING', label: 'PAYMENT SUBMITTED' });
    expect([acc('bank').amount, acc('visa').amount, read().owed]).toEqual([1260, 780, 780]);
    expect(acc('visa').transferLine).toBe('← $35 PAYMENT SUBMITTED');
    recordTransferStep(p, 'LEFT_SOURCE');
    expect(read().transfers[0]).toMatchObject({ state: 'IN_TRANSIT', label: 'PAID FROM ACCOUNT · CARD NOT CONFIRMED' });
    expect([acc('bank').amount, acc('visa').amount, read().owed]).toEqual([1225, 780, 780]);
    expect(acc('visa').transferLine).toBe('← $35 CARD NOT CONFIRMED');
    recordTransferStep(p, 'RECEIVED');
    expect(read().transferStates[p]).toBe('COMPLETED');
    expect([acc('visa').amount, read().owed]).toEqual([745, 745]);
    const legs = snap().transactions.filter((x) => x.link?.id === p);
    expect(legs.every((l) => l.txn_class !== 'EXPENSE' && l.txn_class !== 'CREDIT_PURCHASE')).toBe(true);
    // reversal goes through the accounting operation, and the debt returns
    recordTransferStep(p, 'REVERSE');
    expect(read().transferStates[p]).toBe('REVERSED');
    expect(read().owed).toBe(780);
  });

  it('legacy unconfirmed records show as NEEDS CONFIRMATION and move nothing', () => {
    const now = new Date().toISOString();
    const leg = (id: string, account: string, counter: string, dir: 'INCOME' | 'EXPENSE', side: 'OUT' | 'IN') => ({
      id, merchant: 'OLD TRANSFER', amount: 40, direction: dir, when: TODAY, account: account.toUpperCase(), account_id: account, category: 'TRANSFER',
      status: 'PENDING' as const, recurring: false, memo: '', source: 'ADDED' as const, related: null, txn_class: 'TRANSFER' as const, occurred_on: TODAY, recorded_at: now,
      confirmation: 'PENDING_CONFIRMATION' as const, origin_family: 'F05', link: { kind: 'TRANSFER' as const, id: 'legacy-1', leg: side }, counterparty_account_id: counter,
    });
    getRepository().commit({ reason: 'LEGACY', transactions: { upsert: [leg('l-out', 'ride', 'bank', 'EXPENSE', 'OUT'), leg('l-in', 'bank', 'ride', 'INCOME', 'IN')] as never } });
    expect(read().transfers[0]).toMatchObject({ state: 'NEEDS_RECONCILIATION', label: 'NEEDS CONFIRMATION' });
    expect([acc('ride').amount, acc('bank').amount]).toEqual([840, 1260]);
    expect(OPEN_TRANSFER_STATES).toEqual(['SCHEDULED', 'PENDING', 'IN_TRANSIT', 'RETURNING', 'NEEDS_RECONCILIATION']);
  });
});

describe('Single financial-state owner', () => {
  it('the pilot page, layout and reading never write or compute balances themselves', () => {
    const files = ['src/projects/jurnl/runtime/screens/f05/MoneyMotionParent.tsx', 'src/projects/jurnl/runtime/screens/f05/f05MotionLayout.ts', 'src/projects/jurnl/data/f05/moneyParentReading.ts', 'src/projects/jurnl/runtime/screens/f05/MoneyParentRoute.tsx'];
    for (const f of files) {
      const src = readFileSync(path.resolve(f), 'utf8');
      // no write operations (the existing TransferSheet / TransferDetailSheet / AddPlaceSheet do every write)
      expect(src, f).not.toMatch(/\b(recordTransfer|recordTransferStep|buildTransferAction|createManualAccount|setAccountBalance|renameAccount|archiveAccount|applyOp)\s*\(/);
      expect(src, f).not.toMatch(/\.commit\(|localStorage|upsert/);
      // no balance arithmetic outside the canonical selectors
      expect(src, f).not.toMatch(/available_balance\s*[-+]|\.balance\s*[-+]/);
    }
  });
});

describe('Name lines', () => {
  it('keeps the approved breaks and balances other names', () => {
    expect(nameLines('BANK ACCOUNT')).toEqual(['BANK', 'ACCOUNT']);
    expect(nameLines('RIDESHARE CARD')).toEqual(['RIDESHARE', 'CARD']);
    expect(nameLines('CASH ON HAND')).toEqual(['CASH', 'ON HAND']);
    expect(nameLines('CREDIT CARD')).toEqual(['CREDIT', 'CARD']);
    expect(nameLines('savings')).toEqual(['SAVINGS']);
    expect(nameLines('  my   bank of america account ')).toEqual(['MY BANK OF', 'AMERICA ACCOUNT']);
  });
});

describe('Layout', () => {
  it('at 9:16 the four papers sit exactly on the reference card rects', () => {
    const L = computeF05MotionLayout(471, 836, 4);
    expect(L.u).toBeCloseTo(0.5, 5);
    expect(Math.abs(L.ox)).toBeLessThan(1);
    expect(L.extra).toBe(0);
    expect(L.sliced).toBe(false);
    expect(L.slots.map(({ x, y, w, h }) => ({ x, y, w, h }))).toEqual(APPROVED_SLOTS);
  });

  it('phones fit the width with at most the crop allowance; the extra height is elastic, never stretched', () => {
    for (const [w, h] of [[360, 780], [393, 852]] as const) {
      const L = computeF05MotionLayout(w, h, 6);
      expect(L.u).toBeCloseTo(w / (SRC_W - 2 * CROP), 5);
      expect(L.visibleX[0]).toBeCloseTo(CROP, 3);
      expect(L.boardH * L.u).toBeCloseTo(h, 3);
      expect(L.sliced).toBe(true);
      // 9:16 composition: phones keep the reference's two rows of papers (4 per page)
      expect(L.capacityRows).toBe(2);
      for (const s of L.slots) {
        expect(s.x).toBeGreaterThanOrEqual(L.visibleX[0]);
        expect(s.x + s.w).toBeLessThanOrEqual(L.visibleX[1]);
        expect((s.y + s.h) * L.u).toBeLessThan(L.navZone.y * L.u);
      }
    }
  });

  it('tablet and desktop keep the 2:3 composition at full height, centred', () => {
    for (const [w, h] of [[834, 1194], [1440, 900]] as const) {
      const L = computeF05MotionLayout(w, h, 4);
      expect(L.u).toBeCloseTo(h / SRC_H, 5);
      expect(L.extra).toBe(0);
      expect(L.ox).toBeGreaterThan(0);
      expect(L.ox * 2 + SRC_W * L.u).toBeCloseTo(w, 3);
    }
  });

  it('collections: always the 2 x 2 grid; ADD and MOVE fill free slots; more than four places open the full list', () => {
    // Carousel sprint design change: every collection is four papers in the same places. A taller screen grows the
    // gaps (elastic panel), never adds a third row, and extra places never add pages (the dots are the collections).
    for (const [w, h] of [[512, 768], [393, 852], [360, 780], [360, 900], [834, 1194], [1440, 900]] as const) {
      expect(capacityFor(w, h)).toBe(4);
      expect(computeF05MotionLayout(w, h, 4).rows).toBe(2);
    }
    expect(accountItems(0)).toEqual([{ kind: 'empty' }]);
    expect(accountItems(1).map((i) => i.kind)).toEqual(['account', 'add']);
    expect(accountItems(2).map((i) => i.kind)).toEqual(['account', 'account', 'add', 'move']);
    expect(accountItems(3).map((i) => i.kind)).toEqual(['account', 'account', 'account', 'add']);
    expect(accountItems(4).map((i) => i.kind)).toEqual(['account', 'account', 'account', 'account']);
    // DOT 01 authority 01: four places, then VIEW ALL ACCOUNTS (a strip under the papers) opens the rest
    expect(accountItems(7)).toEqual([{ kind: 'account', index: 0 }, { kind: 'account', index: 1 }, { kind: 'account', index: 2 }, { kind: 'account', index: 3 }]);
    expect(pageAccounts([1, 2, 3, 4, 5], 4)).toEqual([[1, 2, 3, 4], [5]]);
  });
});

describe('Opt-in route and assets', () => {
  it('the cabinet hub stays the default; ?parent=motion opts in for the session', () => {
    const mem = new Map<string, string>();
    vi.stubGlobal('sessionStorage', { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => void mem.set(k, v), removeItem: (k: string) => void mem.delete(k), clear: () => mem.clear() });
    expect(resolveF05ParentVariant(null)).toBe('cabinet');
    expect(resolveF05ParentVariant('motion')).toBe('motion');
    expect(resolveF05ParentVariant(null)).toBe('motion');
    expect(resolveF05ParentVariant('cabinet')).toBe('cabinet');
    expect(resolveF05ParentVariant(null)).toBe('cabinet');
    expect(resolveF05ParentVariant('anything')).toBe('cabinet');
    vi.unstubAllGlobals();
    // Storage unavailable (private mode): the query alone decides, and the default stays the cabinet.
    vi.stubGlobal('sessionStorage', undefined);
    expect(resolveF05ParentVariant('motion')).toBe('motion');
    expect(resolveF05ParentVariant(null)).toBe('cabinet');
    vi.unstubAllGlobals();
  });

  it('every runtime layer exists and the geometry matches the layer sizes', () => {
    const geo = JSON.parse(readFileSync(path.join(ASSET_DIR, 'F05_MOTION_GEOMETRY.json'), 'utf8'));
    for (const f of ['SIDEKICK', 'PANEL_TILE', 'PAPER_TILE', 'TORN_EDGE', 'TITLE_PAPER', 'WAX_SEAL', 'CARD_BANK', 'CARD_PAYOUT', 'CARD_CASH', 'CARD_CREDIT']) {
      expect(existsSync(path.join(ASSET_DIR, `F05_MOTION_${f}.webp`)), f).toBe(true);
    }
    // DOT 01: the founder's SK01 SIDEKICK (it carries its own JURNL tag paper, so no tag layer is lifted)
    expect(geo.source).toMatchObject({ w: SRC_W, h: SRC_H, profile: 'SK01' });
    expect([SRC_W, SRC_H]).toEqual([941, 1672]);
    expect(geo.envelopes.title_paper.rotate_deg).toBe(0);
    expect(geo.envelopes.title_paper.scale).toBeGreaterThan(1);
  });

  it('the stylesheet keeps the scale-only envelopes it was verified with, and honours reduced motion', () => {
    const geo = JSON.parse(readFileSync(path.join(ASSET_DIR, 'F05_MOTION_GEOMETRY.json'), 'utf8'));
    const css = readFileSync(path.resolve('src/projects/jurnl/runtime/screens/f05/jurnl-f05-motion.css'), 'utf8');
    expect(css).toContain(`from { transform: scale(${geo.envelopes.title_paper.scale}); `);
    expect(css).toContain(`from { transform: scale(${geo.envelopes.wax_seal.scale}) rotate(${geo.envelopes.wax_seal.rotate_deg}deg); }`);
    expect(css).toContain('transform-origin: 18% 70%;');
    expect(css).toMatch(/@media \(prefers-reduced-motion: no-preference\) \{[\s\S]*f05m-paper/);
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)/);
    // numbers never count up
    expect(css).not.toMatch(/counter|@property --num/);
  });
});
