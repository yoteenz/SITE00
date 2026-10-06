/** F15 derived forward view — no source financial ownership. */

import { computeSafeToSpend } from '../f09/safeToSpend';
import { getRepository } from '../repository/deviceRepository';
import { projectUpcoming } from '../foundation/upcomingProjection';
import { listPlanIntentions } from '../f08/planStore';
import { listPurchases } from '../f10/purchasesStore';
import { listTrips } from '../f11/tripsStore';
import { simulatePaydownProjection } from '../f13/paydownStore';
import type { CalendarDate } from '../foundation/dates';
import { getTodayKey } from '../foundation/dates';

export type AheadCertainty = 'KNOWN' | 'EXPECTED' | 'PLANNED' | 'SIMULATED' | 'UNKNOWN';

export type AheadProjectionItem = {
  ahead_id: string;
  label: string;
  amount: number;
  direction: 'IN' | 'OUT';
  due_date: CalendarDate | null;
  certainty: AheadCertainty;
  source_family: string;
  source_id: string;
};

export type AheadProjection = {
  items: AheadProjectionItem[];
  safe_to_spend_now: number;
  projected_net_30: number | null;
  shortfall_risk: boolean;
  completeness: 'THIN' | 'PARTIAL' | 'READY';
};

export function projectAhead(today: CalendarDate = getTodayKey()): AheadProjection {
  const sts = computeSafeToSpend();
  const items: AheadProjectionItem[] = [];

  for (const u of projectUpcoming(getRepository().listIncomeSources(), getRepository().listObligations(), today)) {
    items.push({
      ahead_id: u.upcoming_id,
      label: u.label,
      amount: u.amount,
      direction: u.direction === 'MONEY_IN' ? 'IN' : 'OUT',
      due_date: u.due_date,
      certainty: u.is_estimated ? 'EXPECTED' : 'KNOWN',
      source_family: u.owner_family_id,
      source_id: u.source_id,
    });
  }

  for (const p of listPlanIntentions()) {
    if (p.assigned_amount > 0) {
      items.push({
        ahead_id: `ahead-plan-${p.plan_id}`,
        label: `PLAN · ${p.title}`,
        amount: p.assigned_amount,
        direction: 'OUT',
        due_date: p.target_date,
        certainty: 'PLANNED',
        source_family: 'F08',
        source_id: p.plan_id,
      });
    }
  }

  for (const pur of listPurchases().filter((p) => p.status !== 'PURCHASED' && p.status !== 'ARCHIVED')) {
    if (pur.target_amount > 0) {
      items.push({
        ahead_id: `ahead-pur-${pur.purchase_id}`,
        label: `PURCHASE · ${pur.title}`,
        amount: pur.target_amount,
        direction: 'OUT',
        due_date: pur.target_date,
        certainty: pur.reserved_amount > 0 ? 'PLANNED' : 'EXPECTED',
        source_family: 'F10',
        source_id: pur.purchase_id,
      });
    }
  }

  for (const trip of listTrips().filter((t) => t.status === 'ACTIVE')) {
    if (trip.target_budget > 0) {
      items.push({
        ahead_id: `ahead-trip-${trip.trip_id}`,
        label: `TRIP · ${trip.title}`,
        amount: trip.reserved_amount > 0 ? trip.reserved_amount : trip.target_budget,
        direction: 'OUT',
        due_date: trip.start_date,
        certainty: trip.reserved_amount > 0 ? 'PLANNED' : 'EXPECTED',
        source_family: 'F11',
        source_id: trip.trip_id,
      });
    }
  }

  const sim = simulatePaydownProjection();
  for (const line of sim.lines) {
    items.push({
      ahead_id: `ahead-pd-${line.account_id}`,
      label: line.label,
      amount: line.amount,
      direction: 'OUT',
      due_date: line.due_date,
      certainty: line.certainty,
      source_family: 'F13',
      source_id: line.account_id,
    });
  }

  const out30 = items.filter((i) => i.direction === 'OUT').reduce((s, i) => s + i.amount, 0);
  const in30 = items.filter((i) => i.direction === 'IN').reduce((s, i) => s + i.amount, 0);
  const projected = sts.cash + in30 - out30;
  const shortfall = projected < 0;

  let completeness: AheadProjection['completeness'] = 'READY';
  if (sts.completeness === 'UNSTATED' || sts.completeness === 'NEEDS_SETUP') completeness = 'THIN';
  else if (sts.completeness === 'PARTIAL') completeness = 'PARTIAL';

  return {
    items,
    safe_to_spend_now: sts.value,
    projected_net_30: items.length ? projected : null,
    shortfall_risk: shortfall,
    completeness,
  };
}
