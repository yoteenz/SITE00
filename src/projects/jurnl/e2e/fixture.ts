/**
 * Canonical JURNL E2E fixture — synthetic user + repository snapshot (device adapter only).
 * Provides data, not alternate business logic.
 */

import { EMPTY_SETUP, type SetupDraft } from '../data/f02/setupDraft';
import { seedAccountsFromSetup } from '../data/foundation/accountSeed';
import { getTodayKey, type CalendarDate } from '../data/foundation/dates';
import type { JurnlCreditAttributes } from '../data/foundation/creditAttributes';
import type { JurnlGoal } from '../data/foundation/goals';
import type { JurnlPlanIntention } from '../data/foundation/plan';
import { DEFAULT_JURNL_SETTINGS } from '../data/foundation/settings';
import { defaultConsentRecords } from '../data/foundation/consent';
import { MOCK_ENTRIES } from '../data/home/mockScenario';
import { seedIncomeFromSetup, seedObligationsFromSetup } from '../data/repository/wave2Seed';
import { seedGoalsFromSetup, seedPlansFromSetup } from '../data/repository/wave3Seed';
import { REPOSITORY_SCHEMA_VERSION, type RepositorySnapshot } from '../data/repository/types';

export const JURNL_E2E_USER_EMAIL = 'E2E@JURNL.TEST';
export const JURNL_E2E_USER_ID = JURNL_E2E_USER_EMAIL;

export const JURNL_E2E_STORAGE = {
  session: 'jurnl.runtime.v1.session',
  device: 'jurnl.runtime.v1.device',
  repositoryKey: `jurnl.repository.v${REPOSITORY_SCHEMA_VERSION}.${JURNL_E2E_USER_ID}`,
} as const;

export type JurnlE2eBootstrap = {
  session: {
    account: { firstName: string; lastName: string; email: string; emailVerified: boolean };
    status: 'ACTIVE';
    keepSignedIn: boolean;
    pendingEmail: null;
  };
  device: {
    remembered: { email: string; firstName: string; lastName: string }[];
    biometric: 'ENABLED';
    biometricMethod: 'FACE_ID';
    deviceTrust: 'TRUSTED';
    ai: Record<string, boolean>;
    exportRequested: boolean;
  };
  snapshot: RepositorySnapshot;
};

function completedSetup(): SetupDraft {
  return {
    ...EMPTY_SETUP,
    started: true,
    resumeAt: 'F02.08',
    household: 'JUST_ME',
    accounts: 'NAMED',
    accountName: 'CHECKING',
    accountKind: 'CHECKING',
    cadence: 'MONTHLY',
    amount: '5000',
    obligations: [{ name: 'RENT', cadence: 'MONTHLY' }],
    obligationsSkipped: false,
    priorities: ['STABILITY'],
    goalName: 'BUFFER',
    goalHorizon: 'THIS YEAR',
    protectedAmount: '200',
    protectedSkipped: false,
    consentRemember: true,
    consentLinks: true,
    consentSale: false,
    voice: 'GUIDED',
  };
}

export function buildJurnlE2eBootstrap(_today: CalendarDate = getTodayKey()): JurnlE2eBootstrap {
  const now = new Date().toISOString();
  const setup = completedSetup();
  const userId = JURNL_E2E_USER_ID;
  const accounts = seedAccountsFromSetup(setup, userId);
  const incomeSources = seedIncomeFromSetup(setup, []);
  const obligations = seedObligationsFromSetup(setup, []);
  const planIntentions: JurnlPlanIntention[] = seedPlansFromSetup(setup, []);
  const goals: JurnlGoal[] = seedGoalsFromSetup(setup, []);
  const creditAttributes: JurnlCreditAttributes[] = [
    {
      account_id: 'acct-card',
      credit_limit: 5000,
      current_balance: 1200,
      apr: 19.9,
      minimum_payment: 45,
      payment_due_day: 15,
      statement_day: 1,
      updated_at: now,
    },
  ];

  const snapshot: RepositorySnapshot = {
    schemaVersion: REPOSITORY_SCHEMA_VERSION,
    userId,
    setup,
    accounts,
    transactions: [...MOCK_ENTRIES],
    settings: { ...DEFAULT_JURNL_SETTINGS, safeToSpendBuffer: '50', displayCurrency: 'USD' },
    consent: defaultConsentRecords(),
    incomeSources,
    obligations,
    planIntentions,
    goals,
    creditAttributes,
    purchases: [],
    trips: [],
    paydownPlan: null,
    records: [],
    updatedAt: now,
  };

  return {
    session: {
      account: { firstName: 'E2E', lastName: 'USER', email: JURNL_E2E_USER_EMAIL, emailVerified: true },
      status: 'ACTIVE',
      keepSignedIn: true,
      pendingEmail: null,
    },
    device: {
      remembered: [{ email: JURNL_E2E_USER_EMAIL, firstName: 'E2E', lastName: 'USER' }],
      biometric: 'ENABLED',
      biometricMethod: 'FACE_ID',
      deviceTrust: 'TRUSTED',
      ai: {
        personalizedInsights: true,
        smartCategorization: false,
        budgetRecommendations: false,
        naturalLanguage: true,
        marketTrends: false,
      },
      exportRequested: false,
    },
    snapshot,
  };
}

/** Empty domains for create-flow suites (still signed-in with accounts). */
export function buildJurnlE2eEmptyDomainsBootstrap(): JurnlE2eBootstrap {
  const base = buildJurnlE2eBootstrap();
  return {
    ...base,
    snapshot: {
      ...base.snapshot,
      planIntentions: [],
      goals: [],
      purchases: [],
      trips: [],
      records: [],
      paydownPlan: null,
    },
  };
}
