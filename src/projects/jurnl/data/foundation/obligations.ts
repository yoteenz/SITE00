/** Canonical obligations (F07 / DD.OBLIGATIONS). */

import type { CalendarDate, RecurrenceType } from './dates';

export type ObligationKind = 'BILL' | 'SUBSCRIPTION';

export type ObligationStatus = 'ACTIVE' | 'PAUSED' | 'ARCHIVED';

export type JurnlObligation = {
  obligation_id: string;
  name: string;
  amount: number;
  currency: 'USD';
  cadence: RecurrenceType;
  next_due_date: CalendarDate;
  kind: ObligationKind;
  account_id: string | null;
  status: ObligationStatus;
  skipped_once: boolean;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
};
