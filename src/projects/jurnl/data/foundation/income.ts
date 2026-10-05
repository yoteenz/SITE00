/** Canonical income sources (F06 / DD.INCOME_SOURCES). */

import type { CalendarDate, RecurrenceType } from './dates';

export type IncomeStatus = 'EXPECTED' | 'RECEIVED' | 'LATE' | 'PAUSED' | 'ARCHIVED';

export type JurnlIncomeSource = {
  income_id: string;
  source_name: string;
  amount: number;
  currency: 'USD';
  cadence: RecurrenceType;
  next_due_date: CalendarDate;
  account_id: string | null;
  status: IncomeStatus;
  linked_transaction_id: string | null;
  is_estimated: boolean;
  notes: string;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
};
