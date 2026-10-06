import { describe, expect, it, beforeEach } from 'vitest';
import { createPlanIntention, totalPlanAssigned, updatePlanIntention } from '../src/projects/jurnl/data/f08/planStore';
import { createGoal, setGoalAside, totalGoalSetAside } from '../src/projects/jurnl/data/f14/goalsStore';
import { upsertCreditTerms, creditPaymentProjections } from '../src/projects/jurnl/data/f12/creditStore';
import { creditAccounts } from '../src/projects/jurnl/data/foundation/accounts';
import { creditUtilizationPercent } from '../src/projects/jurnl/data/foundation/creditAttributes';
import { computeSafeToSpend } from '../src/projects/jurnl/data/f09/safeToSpend';
import { projectUpcoming } from '../src/projects/jurnl/data/foundation/upcomingProjection';
import { getRepository, resetRepositoryForDev, setRepositoryUserId } from '../src/projects/jurnl/data/repository/deviceRepository';
import { JURNL_QUICK_ADD_TYPES } from '../src/projects/jurnl/data/foundation/quickAddRegistry';

describe('JURNL Wave 3 F08/F09/F12/F14', () => {
  beforeEach(() => {
    setRepositoryUserId('wave3-test@example.com');
    resetRepositoryForDev();
  });

  it('repository schema v5 includes plan, goals, credit attributes', () => {
    const snap = getRepository().getSnapshot();
    expect(snap.schemaVersion).toBe(5);
    expect(Array.isArray(snap.planIntentions)).toBe(true);
    expect(Array.isArray(snap.goals)).toBe(true);
    expect(Array.isArray(snap.creditAttributes)).toBe(true);
  });

  it('F08 plan assign reduces safe to spend', () => {
    const base = computeSafeToSpend().value;
    const plan = createPlanIntention({ title: 'RENT PIECE', assigned_amount: 200 });
    updatePlanIntention({ ...plan, assigned_amount: 200 });
    expect(totalPlanAssigned()).toBe(200);
    expect(computeSafeToSpend().value).toBeLessThan(base);
    expect(computeSafeToSpend().assigned).toBe(200);
  });

  it('F14 goal set aside reduces safe to spend without target alone', () => {
    createGoal({ title: 'TRIP', target_amount: 5000 });
    const base = computeSafeToSpend().value;
    const goal = getRepository().listGoals()[0]!;
    setGoalAside(goal.goal_id, 300);
    expect(totalGoalSetAside()).toBe(300);
    expect(computeSafeToSpend().goalReserved).toBe(300);
    expect(computeSafeToSpend().value).toBeLessThan(base);
  });

  it('F12 utilization from manual terms only', () => {
    const card = creditAccounts()[0];
    expect(card).toBeTruthy();
    upsertCreditTerms(card!.account_id, { credit_limit: 1000, current_balance: 250 });
    const util = creditUtilizationPercent(card!, getRepository().getCreditAttributes(card!.account_id));
    expect(util).toBe(25);
  });

  it('credit minimum payment projects into upcoming', () => {
    const card = creditAccounts()[0]!;
    upsertCreditTerms(card.account_id, { minimum_payment: 40, payment_due_day: 15 });
    const items = projectUpcoming([], []);
    expect(items.some((i) => i.source_domain === 'CREDIT_PAYMENT' && i.source_id === card.account_id)).toBe(true);
    expect(creditPaymentProjections().length).toBeGreaterThan(0);
  });

  it('quick add supports goal type', () => {
    expect(JURNL_QUICK_ADD_TYPES.filter((t) => t.enabled && t.type_id === 'GOAL').length).toBe(1);
  });

  it('single safe-to-spend formula includes plan and goal lines', () => {
    const signal = computeSafeToSpend();
    expect(signal.assignedSource).toBeDefined();
    expect(signal.goalReservedSource).toBeDefined();
    expect(typeof signal.safetyBuffer).toBe('number');
  });
});
