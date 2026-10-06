import type { SetupDraft } from '../f02/setupDraft';
import type { JurnlPlanIntention } from '../foundation/plan';
import type { JurnlGoal } from '../foundation/goals';

export function seedPlansFromSetup(setup: SetupDraft, existing: JurnlPlanIntention[]): JurnlPlanIntention[] {
  if (existing.length) return existing;
  const priorities = setup.priorities.filter((p) => p.trim().length > 0);
  if (!priorities.length) return existing;
  const now = new Date().toISOString();
  return priorities.slice(0, 3).map((title, i) => ({
    plan_id: `plan-seed-${i + 1}`,
    title: title.trim().toUpperCase(),
    assigned_amount: 0,
    target_amount: null,
    target_date: null,
    linked_goal_id: null,
    linked_obligation_id: null,
    sort_order: i,
    status: 'ACTIVE' as const,
    created_at: now,
    updated_at: now,
    archived_at: null,
  }));
}

export function seedGoalsFromSetup(setup: SetupDraft, existing: JurnlGoal[]): JurnlGoal[] {
  if (existing.length) return existing;
  if (!setup.goalName.trim()) return existing;
  const now = new Date().toISOString();
  return [
    {
      goal_id: 'goal-seed-1',
      title: setup.goalName.trim().toUpperCase(),
      target_amount: 0,
      set_aside_amount: 0,
      target_date: null,
      horizon: setup.goalHorizon,
      meaning: '',
      linked_plan_id: null,
      status: 'ACTIVE',
      created_at: now,
      updated_at: now,
      completed_at: null,
      archived_at: null,
    },
  ];
}
