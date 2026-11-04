/** F06 daily earnings (DD.DAILY_EARNINGS). One record per work day and income source; its ledger legs live in F04. */

import type { CalendarDate } from './dates';

/**
 * INCLUDED (mode A): the digital earnings figure already includes digital tips (tips are shown for reference only).
 * SEPARATE (mode B): the digital earnings figure excludes digital tips; the tips are added on top.
 */
export type TipsMode = 'INCLUDED' | 'SEPARATE';

export type EarningsSourceKind = 'RIDESHARE' | 'DELIVERY' | 'HOURLY' | 'HOME_HEALTHCARE' | 'OTHER';

export type DailyEarningsStatus = 'RECORDED' | 'DELETED';

export type DailyEarningsRevision = {
  at: string;
  action: 'CREATED' | 'EDITED' | 'DELETED';
  total_earned: number;
  digital_received: number;
  cash_received: number;
};

export type JurnlDailyEarnings = {
  earnings_id: string;
  work_date: CalendarDate;
  /** User-facing source name (UBER, LYFT, HOME HEALTHCARE, ...). */
  income_source: string;
  source_kind: EarningsSourceKind;
  tips_mode: TipsMode;
  /** As entered (meaning depends on tips_mode). */
  digital_earnings: number;
  digital_tips: number;
  cash_tips: number;
  /** Account that received digital money instantly. Required when digital money > 0. */
  digital_account_id: string | null;
  /** Cash location that received cash tips. Required when cash tips > 0. */
  cash_account_id: string | null;
  notes: string;
  status: DailyEarningsStatus;
  /** Ledger legs created for this record (one per receiving account). */
  ledger_entry_ids: string[];
  revisions: DailyEarningsRevision[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};
