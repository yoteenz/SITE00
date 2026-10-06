/** F14 goals (DD.GOALS). */

import type { CalendarDate } from './dates';

export type GoalStatus = 'ACTIVE' | 'COMPLETE' | 'ARCHIVED';

export type JurnlGoal = {
  goal_id: string;
  title: string;
  target_amount: number;
  set_aside_amount: number;
  target_date: CalendarDate | null;
  horizon: string | null;
  meaning: string;
  linked_plan_id: string | null;
  status: GoalStatus;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  archived_at: string | null;
};
