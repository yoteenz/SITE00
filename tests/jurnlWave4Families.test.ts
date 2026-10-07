import { describe, expect, it, beforeEach } from 'vitest';
import { createPurchase, markPurchaseBought, updatePurchase } from '../src/projects/jurnl/data/f10/purchasesStore';
import { classifyPurchaseCheck } from '../src/projects/jurnl/data/f10/purchaseCheck';
import { createTrip, updateTrip } from '../src/projects/jurnl/data/f11/tripsStore';
import { upsertPaydownPlan, simulatePaydownProjection } from '../src/projects/jurnl/data/f13/paydownStore';
import { projectAhead } from '../src/projects/jurnl/data/f15/aheadProjection';
import { createRecord } from '../src/projects/jurnl/data/f16/recordsStore';
import { computeSafeToSpend } from '../src/projects/jurnl/data/f09/safeToSpend';
import { upsertCreditTerms } from '../src/projects/jurnl/data/f12/creditStore';
import { creditAccounts } from '../src/projects/jurnl/data/foundation/accounts';
import { getRepository, resetRepositoryForDev, setRepositoryUserId } from '../src/projects/jurnl/data/repository/deviceRepository';
import { JURNL_QUICK_ADD_TYPES } from '../src/projects/jurnl/data/foundation/quickAddRegistry';

describe('JURNL Wave 4 F10/F11/F13/F15/F16', () => {
  beforeEach(() => {
    setRepositoryUserId('wave4-test@example.com');
    resetRepositoryForDev();
  });

  it('repository schema v5 includes wave4 domains', () => {
    const snap = getRepository().getSnapshot();
    expect(snap.schemaVersion).toBe(5);
    expect(Array.isArray(snap.purchases)).toBe(true);
    expect(Array.isArray(snap.trips)).toBe(true);
    expect(Array.isArray(snap.records)).toBe(true);
  });

  it('F10 mark purchased links canonical transaction', () => {
    const p = createPurchase({ title: 'CHAIR', target_amount: 120 });
    const bought = markPurchaseBought(p.purchase_id, 'CHECKING');
    expect(bought?.status).toBe('PURCHASED');
    expect(bought?.linked_transaction_id).toBeTruthy();
    expect(getRepository().listTransactions().some((t) => t.id === bought?.linked_transaction_id)).toBe(true);
  });

  it('F10 purchase check picks fit, check-in, and over from live money', () => {
    const sts = computeSafeToSpend().value;
    expect(classifyPurchaseCheck(125, 'FASHION').tone).toBe('FIT');
    expect(classifyPurchaseCheck(125, 'DINING').tone).toBe('CHECK_IN');
    const over = classifyPurchaseCheck(sts + 275, 'TRAVEL');
    expect(over.tone).toBe('OVER');
    expect(over.overBy).toBe(275);
    expect(over.after).toBe(-275);
  });

  it('F10 reserved purchase reduces safe to spend', () => {
    const base = computeSafeToSpend().value;
    const p = createPurchase({ title: 'LAMP', target_amount: 50 });
    updatePurchase({ ...p, reserved_amount: 40 });
    expect(computeSafeToSpend().purchaseReserved).toBe(40);
    expect(computeSafeToSpend().value).toBeLessThan(base);
  });

  it('F11 reserved trip reduces safe to spend not target alone', () => {
    const base = computeSafeToSpend().value;
    const t = createTrip({ title: 'COAST', destination: 'COAST', target_budget: 2000 });
    expect(computeSafeToSpend().value).toBe(base);
    updateTrip({ ...t, reserved_amount: 300 });
    expect(computeSafeToSpend().tripReserved).toBe(300);
    expect(computeSafeToSpend().value).toBeLessThan(base);
  });

  it('F13 paydown simulation does not mutate credit balances', () => {
    const card = creditAccounts()[0]!;
    upsertCreditTerms(card.account_id, { minimum_payment: 35, payment_due_day: 10, current_balance: 500 });
    const before = getRepository().getCreditAttributes(card.account_id)?.current_balance;
    upsertPaydownPlan({ extra_payment: 100, strategy_type: 'SNOWBALL' });
    simulatePaydownProjection();
    const after = getRepository().getCreditAttributes(card.account_id)?.current_balance;
    expect(after).toBe(before);
  });

  it('F15 ahead is derived and includes certainty', () => {
    createPurchase({ title: 'BOOK', target_amount: 20 });
    const ahead = projectAhead();
    expect(ahead.safe_to_spend_now).toBe(computeSafeToSpend().value);
    expect(ahead.items.some((i) => i.source_family === 'F10')).toBe(true);
    expect(ahead.items.every((i) => ['KNOWN', 'EXPECTED', 'PLANNED', 'SIMULATED', 'UNKNOWN'].includes(i.certainty))).toBe(true);
  });

  it('F16 record metadata without fake verification', () => {
    const r = createRecord({ title: 'RECEIPT ONE', record_type: 'RECEIPT' });
    expect(r.status).toBe('READY');
    expect(r.file_ref).toBeNull();
    expect(r.source).toBe('DEVICE_METADATA');
  });

  it('quick add supports purchase and trip', () => {
    const enabled = JURNL_QUICK_ADD_TYPES.filter((t) => t.enabled);
    expect(enabled.some((t) => t.type_id === 'PURCHASE')).toBe(true);
    expect(enabled.some((t) => t.type_id === 'TRIP')).toBe(true);
    expect(enabled.length).toBe(5);
  });
});
