/**
 * Synthetic QA repository snapshot for live sync proof (identifiable marker, no founder data).
 */
import { EMPTY_SETUP } from '../../../src/projects/jurnl/data/f02/setupDraft';
import { seedAccountsFromSetup } from '../../../src/projects/jurnl/data/foundation/accountSeed';
import { defaultConsentRecords } from '../../../src/projects/jurnl/data/foundation/consent';
import { DEFAULT_JURNL_SETTINGS } from '../../../src/projects/jurnl/data/foundation/settings';
import type { JurnlGoal } from '../../../src/projects/jurnl/data/foundation/goals';
import type { JurnlPlanIntention } from '../../../src/projects/jurnl/data/foundation/plan';
import type { JurnlPurchase } from '../../../src/projects/jurnl/data/foundation/purchases';
import type { JurnlRecord } from '../../../src/projects/jurnl/data/foundation/records';
import type { JurnlTrip } from '../../../src/projects/jurnl/data/foundation/trips';
import { REPOSITORY_SCHEMA_VERSION, type RepositorySnapshot } from '../../../src/projects/jurnl/data/repository/types';
import { seedIncomeFromSetup, seedObligationsFromSetup } from '../../../src/projects/jurnl/data/repository/wave2Seed';

export const JURNL_QA_LIVE_MARKER = 'JURNL-QA-LIVE-SYNC-V1';

export function buildQaLiveSnapshot(userId: string): RepositorySnapshot {
  const now = new Date().toISOString();
  const day = now.slice(0, 10);
  const setup = {
    ...EMPTY_SETUP,
    started: true,
    resumeAt: 'F02.08',
    household: 'JUST_ME',
    accounts: 'NAMED',
    accountName: 'QA CHECKING',
    accountKind: 'CHECKING',
    cadence: 'MONTHLY',
    amount: '4200',
    obligations: [{ name: 'QA RENT', cadence: 'MONTHLY' }],
    obligationsSkipped: false,
    priorities: ['STABILITY'],
    goalName: JURNL_QA_LIVE_MARKER,
    goalHorizon: 'THIS YEAR',
    protectedAmount: '100',
    protectedSkipped: false,
    consentRemember: true,
    consentLinks: true,
    consentSale: false,
    voice: 'GUIDED',
  };
  const accounts = seedAccountsFromSetup(setup, userId);
  const incomeSources = seedIncomeFromSetup(setup, []);
  const obligations = seedObligationsFromSetup(setup, []);
  const planIntentions: JurnlPlanIntention[] = [
    {
      plan_id: 'qa-plan-1',
      title: JURNL_QA_LIVE_MARKER,
      assigned_amount: 200,
      target_amount: 500,
      target_date: day,
      linked_goal_id: 'qa-goal-1',
      linked_obligation_id: null,
      sort_order: 0,
      status: 'ACTIVE',
      created_at: now,
      updated_at: now,
      archived_at: null,
    },
  ];
  const goals: JurnlGoal[] = [
    {
      goal_id: 'qa-goal-1',
      title: JURNL_QA_LIVE_MARKER,
      target_amount: 500,
      set_aside_amount: 50,
      target_date: day,
      horizon: 'THIS_YEAR',
      meaning: 'QA',
      linked_plan_id: 'qa-plan-1',
      status: 'ACTIVE',
      created_at: now,
      updated_at: now,
      completed_at: null,
      archived_at: null,
    },
  ];
  const purchases: JurnlPurchase[] = [
    {
      purchase_id: 'qa-purchase-1',
      title: JURNL_QA_LIVE_MARKER,
      target_amount: 120,
      target_date: day,
      status: 'PLANNING',
      reserved_amount: 0,
      linked_goal_id: 'qa-goal-1',
      linked_plan_id: null,
      linked_transaction_id: null,
      notes: 'QA',
      created_at: now,
      updated_at: now,
      purchased_at: null,
      archived_at: null,
    },
  ];
  const trips: JurnlTrip[] = [
    {
      trip_id: 'qa-trip-1',
      title: JURNL_QA_LIVE_MARKER,
      destination: 'QA CITY',
      start_date: day,
      end_date: day,
      target_budget: 800,
      reserved_amount: 0,
      paid_amount: 0,
      linked_goal_id: 'qa-goal-1',
      linked_plan_id: 'qa-plan-1',
      status: 'ACTIVE',
      notes: 'QA',
      created_at: now,
      updated_at: now,
      completed_at: null,
      archived_at: null,
    },
  ];
  const records: JurnlRecord[] = [
    {
      record_id: 'qa-record-1',
      title: JURNL_QA_LIVE_MARKER,
      record_type: 'OTHER',
      file_ref: null,
      mime_type: null,
      size_bytes: null,
      source: 'DEVICE_METADATA',
      document_date: day,
      linked_domain_type: null,
      linked_domain_id: null,
      tags: ['QA'],
      status: 'READY',
      created_at: now,
      updated_at: now,
      archived_at: null,
    },
  ];

  return {
    schemaVersion: REPOSITORY_SCHEMA_VERSION,
    userId,
    setup,
    accounts,
    transactions: [
      {
        id: 'qa-txn-1',
        merchant: JURNL_QA_LIVE_MARKER,
        amount: 25,
        direction: 'EXPENSE',
        when: now,
        account: accounts[0]?.account_id ?? 'acct-checking',
        category: 'OTHER',
        source: 'ADDED',
        status: 'CLEARED',
        related: null,
        recurring: false,
        memo: 'QA',
      },
    ],
    settings: {
      ...DEFAULT_JURNL_SETTINGS,
      displayCurrency: 'USD',
      timezone: 'America/New_York',
      safeToSpendBuffer: '75',
    },
    consent: defaultConsentRecords().map((c) =>
      c.consent_type === 'ASK_JURNL_CONTEXT' ? { ...c, status: 'GRANTED' as const, granted_at: now } : c,
    ),
    incomeSources,
    obligations,
    planIntentions,
    goals,
    creditAttributes: [],
    purchases,
    trips,
    paydownPlan: null,
    records,
    updatedAt: now,
  };
}
