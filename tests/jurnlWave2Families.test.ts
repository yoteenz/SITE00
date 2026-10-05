import { describe, expect, it, beforeEach } from 'vitest';
import { createManualAccount, archiveAccount } from '../src/projects/jurnl/data/foundation/accountMutations';
import { listActiveAccounts } from '../src/projects/jurnl/data/foundation/accounts';
import { createIncomeSource, receiveIncome } from '../src/projects/jurnl/data/f06/incomeStore';
import { createObligation } from '../src/projects/jurnl/data/f07/obligationsStore';
import { projectUpcoming, groupUpcoming } from '../src/projects/jurnl/data/foundation/upcomingProjection';
import { getTodayKey } from '../src/projects/jurnl/data/foundation/dates';
import { computeSafeToSpend } from '../src/projects/jurnl/data/f09/safeToSpend';
import { getRepository, resetRepositoryForDev, setRepositoryUserId } from '../src/projects/jurnl/data/repository/deviceRepository';
import { JURNL_QUICK_ADD_TYPES } from '../src/projects/jurnl/data/foundation/quickAddRegistry';

describe('JURNL Wave 2 F05/F06/F07', () => {
  beforeEach(() => {
    setRepositoryUserId('wave2-test@example.com');
    resetRepositoryForDev();
  });

  it('repository schema v3 includes income and obligations', () => {
    const snap = getRepository().getSnapshot();
    expect(snap.schemaVersion).toBe(3);
    expect(Array.isArray(snap.incomeSources)).toBe(true);
    expect(Array.isArray(snap.obligations)).toBe(true);
  });

  it('F05 account create and archive', () => {
    const before = listActiveAccounts().length;
    const acct = createManualAccount('STUDIO CASH', 'CHECKING', 500);
    expect(listActiveAccounts().length).toBe(before + 1);
    expect(archiveAccount(acct.account_id)).toBe(true);
    expect(listActiveAccounts().length).toBe(before);
  });

  it('F06 income create and receive links ledger once', () => {
    const inc = createIncomeSource({ source_name: 'CLIENT PAY', amount: 1200, cadence: 'MONTHLY', next_due_date: getTodayKey() });
    const txsBefore = getRepository().listTransactions().length;
    receiveIncome(inc.income_id, 'CHECKING');
    expect(getRepository().listTransactions().length).toBe(txsBefore + 1);
    const updated = getRepository().getSnapshot().incomeSources.find((s) => s.income_id === inc.income_id);
    expect(updated?.status).toBe('RECEIVED');
    expect(updated?.linked_transaction_id).toBeTruthy();
  });

  it('F07 upcoming projection derives from canonical sources', () => {
    createObligation({ name: 'RENT', amount: 1800, cadence: 'MONTHLY', next_due_date: getTodayKey(), kind: 'BILL' });
    createIncomeSource({ source_name: 'PAY', amount: 3200, cadence: 'MONTHLY', next_due_date: getTodayKey() });
    const items = projectUpcoming(getRepository().listIncomeSources(), getRepository().listObligations());
    expect(items.length).toBeGreaterThanOrEqual(2);
    const groups = groupUpcoming(items);
    expect(groups.TODAY.length + groups.OVERDUE.length + groups.THIS_WEEK.length + groups.LATER.length).toBe(items.length);
  });

  it('safe to spend uses repository obligations', () => {
    createObligation({ name: 'UTIL', amount: 120, cadence: 'MONTHLY', next_due_date: getTodayKey(), kind: 'BILL' });
    const signal = computeSafeToSpend();
    expect(signal.upcoming).toBeGreaterThan(0);
  });

  it('quick add supports income type', () => {
    expect(JURNL_QUICK_ADD_TYPES.filter((t) => t.enabled && t.type_id === 'INCOME').length).toBe(1);
  });
});
