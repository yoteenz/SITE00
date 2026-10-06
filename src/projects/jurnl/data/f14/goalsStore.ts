import { useSyncExternalStore } from 'react';
import type { JurnlGoal } from '../foundation/goals';
import type { CalendarDate } from '../foundation/dates';
import { cachedRepoView } from '../repository/cachedRepoView';
import { getRepository } from '../repository/deviceRepository';

let goalSeq = 0;

export function useGoals(): JurnlGoal[] {
  return useSyncExternalStore((cb) => getRepository().subscribe(cb), () => listGoals(), () => []);
}

export function listGoals(): JurnlGoal[] {
  return cachedRepoView('f14.listGoals', () =>
    getRepository()
      .listGoals()
      .filter((g) => g.status === 'ACTIVE' || g.status === 'COMPLETE')
      .sort((a, b) => a.title.localeCompare(b.title)),
  );
}

export function goalById(id: string): JurnlGoal | null {
  return getRepository().listGoals().find((g) => g.goal_id === id && g.status !== 'ARCHIVED') ?? null;
}

export function totalGoalSetAside(): number {
  return listGoals().filter((g) => g.status === 'ACTIVE').reduce((s, g) => s + Math.max(0, g.set_aside_amount), 0);
}

export function createGoal(input: {
  title: string;
  target_amount: number;
  target_date?: CalendarDate | null;
  horizon?: string | null;
  meaning?: string;
}): JurnlGoal {
  const now = new Date().toISOString();
  goalSeq += 1;
  const goal: JurnlGoal = {
    goal_id: `goal-${goalSeq}-${Date.now()}`,
    title: input.title.trim().toUpperCase(),
    target_amount: Math.max(0, input.target_amount),
    set_aside_amount: 0,
    target_date: input.target_date ?? null,
    horizon: input.horizon ?? null,
    meaning: input.meaning ?? '',
    linked_plan_id: null,
    status: 'ACTIVE',
    created_at: now,
    updated_at: now,
    completed_at: null,
    archived_at: null,
  };
  return getRepository().upsertGoal(goal);
}

export function updateGoal(goal: JurnlGoal): JurnlGoal {
  return getRepository().upsertGoal(goal);
}

export function setGoalAside(goalId: string, amount: number): JurnlGoal | null {
  const goal = goalById(goalId);
  if (!goal) return null;
  const next = { ...goal, set_aside_amount: Math.max(0, amount) };
  if (next.target_amount > 0 && next.set_aside_amount >= next.target_amount) {
    next.status = 'COMPLETE';
    next.completed_at = new Date().toISOString();
  }
  return getRepository().upsertGoal(next);
}

export function archiveGoal(id: string): boolean {
  return getRepository().deleteGoal(id);
}
