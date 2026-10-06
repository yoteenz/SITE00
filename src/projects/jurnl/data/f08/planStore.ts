import { useSyncExternalStore } from 'react';
import type { JurnlPlanIntention } from '../foundation/plan';
import { getRepository } from '../repository/deviceRepository';

let planSeq = 0;

export function usePlanIntentions(): JurnlPlanIntention[] {
  return useSyncExternalStore((cb) => getRepository().subscribe(cb), () => listPlanIntentions(), () => []);
}

export function listPlanIntentions(): JurnlPlanIntention[] {
  return getRepository()
    .listPlanIntentions()
    .filter((p) => p.status === 'ACTIVE')
    .sort((a, b) => a.sort_order - b.sort_order);
}

export function planById(id: string): JurnlPlanIntention | null {
  return getRepository().listPlanIntentions().find((p) => p.plan_id === id && p.status !== 'ARCHIVED') ?? null;
}

export function totalPlanAssigned(): number {
  return listPlanIntentions().reduce((s, p) => s + Math.max(0, p.assigned_amount), 0);
}

export function createPlanIntention(input: { title: string; assigned_amount?: number; linked_goal_id?: string | null }): JurnlPlanIntention {
  const now = new Date().toISOString();
  planSeq += 1;
  const plan: JurnlPlanIntention = {
    plan_id: `plan-${planSeq}-${Date.now()}`,
    title: input.title.trim().toUpperCase(),
    assigned_amount: input.assigned_amount ?? 0,
    target_amount: null,
    target_date: null,
    linked_goal_id: input.linked_goal_id ?? null,
    linked_obligation_id: null,
    sort_order: listPlanIntentions().length,
    status: 'ACTIVE',
    created_at: now,
    updated_at: now,
    archived_at: null,
  };
  return getRepository().upsertPlanIntention(plan);
}

export function updatePlanIntention(plan: JurnlPlanIntention): JurnlPlanIntention {
  return getRepository().upsertPlanIntention(plan);
}

export function archivePlanIntention(id: string): boolean {
  return getRepository().deletePlanIntention(id);
}
