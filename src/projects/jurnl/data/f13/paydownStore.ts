import { useSyncExternalStore } from 'react';
import type { JurnlPaydownPlan, PaydownStrategy } from '../foundation/paydown';
import { creditAccounts } from '../foundation/accounts';
import { creditSummary } from '../f12/creditStore';
import { nextPaymentDueDate } from '../f12/creditStore';
import { getTodayKey, type CalendarDate } from '../foundation/dates';
import { getRepository } from '../repository/deviceRepository';

export function usePaydownPlan(): JurnlPaydownPlan | null {
  return useSyncExternalStore((cb) => getRepository().subscribe(cb), () => getActivePaydownPlan(), () => null);
}

export function getActivePaydownPlan(): JurnlPaydownPlan | null {
  return getRepository().getPaydownPlan();
}

export function upsertPaydownPlan(patch: Partial<JurnlPaydownPlan> & { strategy_type?: PaydownStrategy }): JurnlPaydownPlan {
  const existing = getRepository().getPaydownPlan();
  const accounts = creditAccounts();
  const now = new Date().toISOString();
  const ids = accounts.map((a) => a.account_id);
  let order = patch.account_order ?? existing?.account_order ?? ids;
  const strategy = patch.strategy_type ?? existing?.strategy_type ?? 'MANUAL_ORDER';
  if (strategy === 'SNOWBALL') {
    order = [...accounts].sort((a, b) => creditSummary(a).used - creditSummary(b).used).map((a) => a.account_id);
  } else if (strategy === 'AVALANCHE') {
    order = [...accounts]
      .sort((a, b) => (creditSummary(b).attrs?.apr ?? 0) - (creditSummary(a).attrs?.apr ?? 0))
      .map((a) => a.account_id);
  }
  const plan: JurnlPaydownPlan = {
    paydown_plan_id: existing?.paydown_plan_id ?? `pd-${Date.now()}`,
    account_ids: patch.account_ids ?? existing?.account_ids ?? ids,
    strategy_type: strategy,
    extra_payment: patch.extra_payment ?? existing?.extra_payment ?? 0,
    account_order: order,
    status: 'ACTIVE',
    created_at: existing?.created_at ?? now,
    updated_at: now,
  };
  return getRepository().upsertPaydownPlan(plan);
}

export type PaydownSimLine = {
  account_id: string;
  label: string;
  amount: number;
  due_date: CalendarDate | null;
  certainty: 'KNOWN' | 'SIMULATED' | 'UNKNOWN';
};

export function simulatePaydownProjection(today: CalendarDate = getTodayKey(), extraOverride?: number): { lines: PaydownSimLine[]; partial: boolean } {
  const plan = getRepository().getPaydownPlan();
  const extra = extraOverride ?? plan?.extra_payment ?? 0;
  const lines: PaydownSimLine[] = [];
  let partial = false;
  const accounts = creditAccounts();
  if (!accounts.length) return { lines, partial: true };
  for (const acct of accounts) {
    const s = creditSummary(acct);
    const due = nextPaymentDueDate(s.dueDay, today);
    const minPay = s.minPay;
    if (minPay == null || minPay <= 0) {
      partial = true;
      continue;
    }
    lines.push({
      account_id: acct.account_id,
      label: `${acct.display_name} PAYDOWN`,
      amount: minPay + extra / Math.max(1, accounts.length),
      due_date: due,
      certainty: due ? 'KNOWN' : 'UNKNOWN',
    });
  }
  if (extra) {
    lines.push({
      account_id: 'sim-extra',
      label: 'EXTRA PAYMENT (SIMULATED)',
      amount: extra,
      due_date: null,
      certainty: 'SIMULATED',
    });
  }
  return { lines, partial };
}
