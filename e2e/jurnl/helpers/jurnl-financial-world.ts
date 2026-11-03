/** Synthetic E2E world for the financial OS journeys: BANK $500 · UBER CARD (payout debit) $240 · CASH $100 ·
 * VISA owes $400 of a $2,000 limit, minimum $45 due in 3 days, statement closed 10 days ago. No sample transactions. */
import { buildJurnlE2eBootstrap } from '../../../src/projects/jurnl/e2e/fixture';
import type { JurnlAccountRecord } from '../../../src/projects/jurnl/data/foundation/accounts';
import { addDays, getTodayKey } from '../../../src/projects/jurnl/data/foundation/dates';

const TODAY = getTodayKey();

function acct(id: string, name: string, type: JurnlAccountRecord['account_type'], balance: number, extra: Partial<JurnlAccountRecord> = {}): JurnlAccountRecord {
  const now = new Date().toISOString();
  return {
    account_id: id,
    user_id: 'E2E@JURNL.TEST',
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

export function financialWorld() {
  const base = buildJurnlE2eBootstrap();
  const now = new Date().toISOString();
  return {
    ...base,
    snapshot: {
      ...base.snapshot,
      accounts: [
        acct('bank', 'BANK', 'CHECKING', 500),
        acct('uber', 'UBER CARD', 'DEBIT_CARD', 240, { is_payout_card: true }),
        acct('cash', 'CASH', 'CASH', 100),
        acct('visa', 'VISA', 'CREDIT_CARD', 400, { credit_limit: 2000, available_balance: 1600, include_in_safe_to_spend: false }),
      ],
      creditAttributes: [
        {
          account_id: 'visa',
          credit_limit: 2000,
          current_balance: 400,
          minimum_payment: 45,
          payment_due_day: null,
          statement_day: null,
          apr: 24.9,
          statement_balance: 400,
          statement_closing_date: addDays(TODAY, -10),
          payment_due_date: addDays(TODAY, 3),
          carries_interest_balance: false,
          terms_entered_at: now,
          updated_at: now,
        },
      ],
      transactions: [],
      obligations: [],
      // The setup states income, which re-seeds an expected income source whenever this list is empty. Keep that
      // seed ARCHIVED so each journey starts with no next income date and adds one itself when needed.
      incomeSources: [
        {
          income_id: 'inc-setup-primary',
          source_name: 'PRIMARY INCOME',
          amount: 5000,
          currency: 'USD' as const,
          cadence: 'MONTHLY' as const,
          next_due_date: TODAY,
          account_id: null,
          status: 'ARCHIVED' as const,
          linked_transaction_id: null,
          is_estimated: false,
          notes: 'FROM SETUP',
          created_at: now,
          updated_at: now,
          archived_at: now,
        },
      ],
      planIntentions: [],
      goals: [],
      purchases: [],
      trips: [],
      dailyEarnings: [],
      reservations: [],
      settings: { ...base.snapshot.settings, safeToSpendBuffer: '' },
      setup: { ...base.snapshot.setup, protectedAmount: '', protectedSkipped: true, obligations: [] },
    },
  };
}

