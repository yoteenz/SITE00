/** Synthetic financial world for JURNL invariant suites (no real data). */
import type { JurnlAccountRecord } from '../../src/projects/jurnl/data/foundation/accounts';
import { getTodayKey } from '../../src/projects/jurnl/data/foundation/dates';
import { patchSetup } from '../../src/projects/jurnl/data/f02/setupDraft';
import { getRepository, resetRepositoryForDev, setRepositoryUserId } from '../../src/projects/jurnl/data/repository/deviceRepository';
import { resetCachedRepoViewsForTests } from '../../src/projects/jurnl/data/repository/cachedRepoView';
import { computeLedgerPositions } from '../../src/projects/jurnl/data/ledger/accounting';
import { upsertCreditTerms } from '../../src/projects/jurnl/data/f12/creditStore';

export const TODAY = getTodayKey();

export function acct(id: string, name: string, type: JurnlAccountRecord['account_type'], balance: number, extra: Partial<JurnlAccountRecord> = {}): JurnlAccountRecord {
  const now = new Date().toISOString();
  return {
    account_id: id,
    user_id: getRepository().userId,
    institution_id: null,
    display_name: name,
    account_type: type,
    subtype: null,
    currency: 'USD',
    balance,
    available_balance: balance,
    credit_limit: null,
    is_manual: true,
    is_connected: false,
    connection_id: null,
    status: 'ACTIVE',
    include_in_safe_to_spend: type !== 'CREDIT_CARD',
    include_in_net_worth: true,
    include_in_spending: true,
    masked_identifier: null,
    as_of: TODAY,
    created_at: now,
    updated_at: now,
    archived_at: null,
    ...extra,
  };
}

/**
 * Fresh user with only the given accounts (seeded sample accounts archived), setup complete, no buffer, no held
 * money, no seeded income. Default: RIDE (payout debit) $300 · BANK $100 · CASH $100 · VISA owes $400 of $2,000.
 */
export function world(opts: { user?: string; accounts?: JurnlAccountRecord[] } = {}) {
  setRepositoryUserId(opts.user ?? 'fin-stabilization@jurnl.test');
  resetRepositoryForDev();
  resetCachedRepoViewsForTests();
  const repo = getRepository();
  const seeded = repo.listAccounts().map((a) => ({ ...a, status: 'ARCHIVED' as const }));
  const accounts = opts.accounts ?? [
    acct('ride', 'RIDE', 'DEBIT_CARD', 300, { is_payout_card: true }),
    acct('bank', 'BANK', 'CHECKING', 100),
    acct('cash', 'CASH', 'CASH', 100),
    acct('visa', 'VISA', 'CREDIT_CARD', 400, { credit_limit: 2000, include_in_safe_to_spend: false }),
  ];
  repo.commit({ reason: 'TEST_WORLD', accounts: { upsert: [...seeded, ...accounts] } });
  if (accounts.some((a) => a.account_id === 'visa')) upsertCreditTerms('visa', { credit_limit: 2000, current_balance: 400, minimum_payment: null, payment_due_day: null, statement_day: null });
  // Income is stated (so Safe to Spend is COMPLETE); the expected-income source setup seeds is archived so each test
  // controls the income schedule itself.
  patchSetup({ started: true, accounts: 'NAMED', cadence: 'DAILY', amount: '200', obligations: [], protectedAmount: '', protectedSkipped: true, priorities: [], goalName: '' });
  for (const src of repo.listIncomeSources()) repo.deleteIncomeSource(src.income_id);
  repo.patchSettings({ safeToSpendBuffer: '' });
}

export function position(id: string): number {
  const s = getRepository().getSnapshot();
  return computeLedgerPositions(s.accounts, s.creditAttributes, s.transactions, TODAY).positions.find((p) => p.account_id === id)!.position;
}
