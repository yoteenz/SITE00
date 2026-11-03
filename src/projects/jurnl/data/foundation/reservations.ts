/**
 * Money set aside (DD.RESERVATIONS). A bookkeeping earmark of money already held in one account toward one upcoming
 * payment. It is not a payment, not a bank transfer, does not move money and does not create money.
 */

import type { CalendarDate } from './dates';

export type ReservationTargetKind = 'OBLIGATION' | 'CARD_PAYMENT';

export type ReservationStatus = 'ACTIVE' | 'APPLIED' | 'RELEASED';

export type ReservationChange = {
  at: string;
  action: 'SET' | 'ADDED' | 'REDUCED' | 'MOVED_IN' | 'MOVED_OUT' | 'RELEASED' | 'APPLIED' | 'CARRIED';
  amount: number;
  note?: string;
};

export type JurnlReservation = {
  reservation_id: string;
  target_kind: ReservationTargetKind;
  /** obligation_id for OBLIGATION, card account_id for CARD_PAYMENT. */
  target_id: string;
  /** Due date of the occurrence this money is for. */
  occurrence_date: CalendarDate | null;
  /** The account that actually holds the money. */
  account_id: string;
  amount: number;
  status: ReservationStatus;
  history: ReservationChange[];
  created_at: string;
  updated_at: string;
};
