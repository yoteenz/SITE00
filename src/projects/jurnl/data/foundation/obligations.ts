/** Canonical obligations (F07 / DD.OBLIGATIONS). */

import type { CalendarDate, RecurrenceType } from './dates';

export type ObligationKind = 'BILL' | 'SUBSCRIPTION';

/**
 * ACTIVE: tracked and counted. PAUSED: kept, not counted until resumed. CANCELLED: tracking stopped in JURNL (does not
 * cancel anything with the merchant); history is kept. COMPLETED: a one-time bill that was paid. ARCHIVED: legacy end.
 */
export type ObligationStatus = 'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'COMPLETED' | 'ARCHIVED';

/** What happened to one dated occurrence of a bill or subscription. */
export type ObligationOccurrenceOutcome = 'PAID' | 'SKIPPED' | 'RESCHEDULED' | 'PAYMENT_UNDONE';

export type ObligationOccurrenceLog = {
  due_date: CalendarDate;
  outcome: ObligationOccurrenceOutcome;
  /** For RESCHEDULED: the new date of this occurrence. */
  moved_to?: CalendarDate | null;
  at: string;
};

export type ObligationPriceChange = { at: string; from: number; to: number; effective: CalendarDate };

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
  /** Original day of month the bill is anchored to, so month-end dates survive short months (31 → Feb 28 → Mar 31). */
  anchor_day?: number | null;
  /** Spending category label (e.g. INSURANCE, STREAMING). */
  category?: string | null;
  /** For subscriptions on a free trial: the date the trial ends. */
  trial_end_date?: CalendarDate | null;
  notes?: string;
  price_history?: ObligationPriceChange[];
  occurrence_log?: ObligationOccurrenceLog[];
  cancelled_at?: string | null;
  paused_at?: string | null;
  /**
   * This bill IS a credit card's payment (stable card reference). While the card's minimum is known, the payment is
   * counted once, through the card (F12): the bill is not deducted again and "mark paid" records a card payment.
   */
  linked_card_account_id?: string | null;
};
