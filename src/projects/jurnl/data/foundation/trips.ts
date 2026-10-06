/** F11 trips (DD.TRIPS). */

import type { CalendarDate } from './dates';

export type TripStatus = 'ACTIVE' | 'COMPLETE' | 'ARCHIVED';

export type JurnlTrip = {
  trip_id: string;
  title: string;
  destination: string;
  start_date: CalendarDate | null;
  end_date: CalendarDate | null;
  target_budget: number;
  reserved_amount: number;
  paid_amount: number;
  linked_goal_id: string | null;
  linked_plan_id: string | null;
  status: TripStatus;
  notes: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  archived_at: string | null;
};
