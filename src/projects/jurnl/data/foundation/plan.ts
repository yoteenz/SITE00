/** F08 plan intentions (DD.PLAN_ALLOCATIONS). */

import type { CalendarDate } from './dates';

export type PlanIntentionStatus = 'ACTIVE' | 'ARCHIVED' | 'COMPLETE';

export type JurnlPlanIntention = {
  plan_id: string;
  title: string;
  assigned_amount: number;
  target_amount: number | null;
  target_date: CalendarDate | null;
  linked_goal_id: string | null;
  linked_obligation_id: string | null;
  sort_order: number;
  status: PlanIntentionStatus;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
};
