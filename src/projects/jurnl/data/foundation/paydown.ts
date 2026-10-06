/** F13 paydown strategy (DD.PAYOFF_PLANS). */

export type PaydownStrategy = 'MANUAL_ORDER' | 'SNOWBALL' | 'AVALANCHE';

export type JurnlPaydownPlan = {
  paydown_plan_id: string;
  account_ids: string[];
  strategy_type: PaydownStrategy;
  extra_payment: number;
  account_order: string[];
  status: 'ACTIVE' | 'ARCHIVED';
  created_at: string;
  updated_at: string;
};
