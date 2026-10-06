/** F10 purchase considerations (DD.PURCHASE_CONSIDERATIONS). */

import type { CalendarDate } from './dates';

export type PurchaseStatus = 'IDEA' | 'PLANNING' | 'READY' | 'PURCHASED' | 'ARCHIVED';

export type JurnlPurchase = {
  purchase_id: string;
  title: string;
  target_amount: number;
  target_date: CalendarDate | null;
  status: PurchaseStatus;
  reserved_amount: number;
  linked_goal_id: string | null;
  linked_plan_id: string | null;
  linked_transaction_id: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
  purchased_at: string | null;
  archived_at: string | null;
};
