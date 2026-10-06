/**
 * F09-owned safe-to-spend formula (W0.6 / W3). F03/F04 consume; they must not recompute independently.
 */

import type { SetupDraft } from '../f02/setupDraft';
import { getSetupDraft } from '../f02/setupDraft';
import { MOCK_CASH, MOCK_UPCOMING } from '../home/mockScenario';
import type { LedgerEntry, UpcomingItem } from '../home/moneyTypes';
import { safeToSpendEligibleAccounts } from '../foundation/accounts';
import { getRepository } from '../repository/deviceRepository';
import { totalPlanAssigned } from '../f08/planStore';
import { totalGoalSetAside } from '../f14/goalsStore';
import { totalPurchaseReserved } from '../f10/purchasesStore';
import { totalTripReserved } from '../f11/tripsStore';

export type SafeToSpendCompleteness = 'COMPLETE' | 'PARTIAL' | 'UNSTATED' | 'NEEDS_SETUP' | 'NEEDS_ACCOUNT';

export type SafeToSpendBreakdown = {
  cash: number;
  upcoming: number;
  protected: number;
  assigned: number;
  goalReserved: number;
  purchaseReserved: number;
  tripReserved: number;
  safetyBuffer: number;
  value: number;
  cashSource: 'MOCK' | 'ACCOUNTS' | 'DERIVED';
  upcomingSource: 'MOCK' | 'SETUP' | 'DERIVED';
  protectedSource: 'SETUP' | 'DERIVED';
  assignedSource: 'PLAN' | 'NONE';
  goalReservedSource: 'GOALS' | 'NONE';
  valueSource: 'DERIVED';
  completeness: SafeToSpendCompleteness;
  setupObligationCount: number;
  unknownUpcoming: boolean;
  /** @deprecated use safetyBuffer + protected — kept for transitional UI */
  userBuffer: number;
};

export function protectedAmountFromSetup(draft: SetupDraft): number {
  const raw = draft.protectedAmount.trim();
  if (!raw || draft.protectedSkipped) return 0;
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

export function safetyBufferFromSettings(): number {
  const raw = getRepository().getSettings().safeToSpendBuffer.trim();
  if (!raw) return 0;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function setupObligationsAsUpcoming(draft: SetupDraft): UpcomingItem[] {
  return draft.obligations.map((o, i) => ({
    id: `up-setup-${i}`,
    name: o.name,
    when: o.cadence,
    amount: 0,
    kind: 'BILL' as const,
    source: 'SETUP' as const,
  }));
}

export function cashForSafeToSpend(entries: LedgerEntry[]): { cash: number; source: SafeToSpendBreakdown['cashSource'] } {
  const eligible = safeToSpendEligibleAccounts();
  if (eligible.length) {
    const fromAccounts = eligible.reduce((sum, a) => sum + a.available_balance, 0);
    const addedDelta = entries.filter((e) => e.source === 'ADDED').reduce((sum, e) => sum + (e.direction === 'INCOME' ? e.amount : -e.amount), 0);
    return { cash: fromAccounts + addedDelta, source: 'ACCOUNTS' };
  }
  const addedDelta = entries.filter((e) => e.source === 'ADDED').reduce((sum, e) => sum + (e.direction === 'INCOME' ? e.amount : -e.amount), 0);
  return { cash: MOCK_CASH + addedDelta, source: 'MOCK' };
}

export function computeSafeToSpend(draft: SetupDraft = getSetupDraft(), entries: LedgerEntry[] = getRepository().listTransactions()): SafeToSpendBreakdown {
  const held = protectedAmountFromSetup(draft);
  const safetyBuffer = safetyBufferFromSettings();
  const assigned = totalPlanAssigned();
  const goalReserved = totalGoalSetAside();
  const purchaseReserved = totalPurchaseReserved();
  const tripReserved = totalTripReserved();
  const { cash, source: cashSource } = cashForSafeToSpend(entries);

  let upcoming = 0;
  let upcomingSource: SafeToSpendBreakdown['upcomingSource'] = 'DERIVED';
  let unknownUpcoming = false;
  const repoObligations = getRepository().listObligations();

  if (repoObligations.length) {
    upcomingSource = 'SETUP';
    for (const item of repoObligations) {
      if (item.amount > 0) upcoming += item.amount;
      else unknownUpcoming = true;
    }
  } else if (draft.obligations.length) {
    upcomingSource = 'SETUP';
    for (const item of setupObligationsAsUpcoming(draft)) {
      if (item.amount > 0) upcoming += item.amount;
      else unknownUpcoming = true;
    }
  } else {
    upcomingSource = 'MOCK';
    upcoming = MOCK_UPCOMING.reduce((sum, item) => sum + item.amount, 0);
  }

  let completeness: SafeToSpendCompleteness = 'COMPLETE';
  if (!draft.started) completeness = 'NEEDS_SETUP';
  else if (draft.accounts === 'SKIPPED' && cashSource === 'MOCK') completeness = 'NEEDS_ACCOUNT';
  else if (draft.accounts === 'SKIPPED' || (!draft.cadence && !draft.amount && draft.started)) completeness = 'UNSTATED';
  else if (unknownUpcoming || repoObligations.some((i) => i.amount <= 0)) completeness = 'PARTIAL';

  const deductions = upcoming + held + safetyBuffer + assigned + goalReserved + purchaseReserved + tripReserved;
  const value =
    completeness === 'UNSTATED'
      ? cash - held - safetyBuffer - assigned - goalReserved - purchaseReserved - tripReserved
      : cash - deductions;

  return {
    cash,
    upcoming,
    protected: held,
    assigned,
    goalReserved,
    purchaseReserved,
    tripReserved,
    safetyBuffer,
    value,
    cashSource,
    upcomingSource,
    protectedSource: held > 0 ? 'SETUP' : 'DERIVED',
    assignedSource: assigned > 0 ? 'PLAN' : 'NONE',
    goalReservedSource: goalReserved > 0 ? 'GOALS' : 'NONE',
    valueSource: 'DERIVED',
    completeness,
    setupObligationCount: repoObligations.length || draft.obligations.length,
    unknownUpcoming,
    userBuffer: held + safetyBuffer,
  };
}

/** @deprecated Import from f09/safeToSpend — kept for transitional imports via money.ts re-export. */
export type SafeToSpend = SafeToSpendBreakdown;

export function safeToSpend(draft?: SetupDraft, entries?: LedgerEntry[]): SafeToSpendBreakdown {
  return computeSafeToSpend(draft ?? getSetupDraft(), entries ?? getRepository().listTransactions());
}
