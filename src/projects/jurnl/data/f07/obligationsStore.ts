import { useSyncExternalStore } from 'react';
import type { CalendarDate, RecurrenceType } from '../foundation/dates';
import type { JurnlObligation, ObligationKind } from '../foundation/obligations';
import { cachedRepoView } from '../repository/cachedRepoView';
import { getRepository } from '../repository/deviceRepository';

function subscribe(listener: () => void) {
  return getRepository().subscribe(listener);
}

export function listObligations(): JurnlObligation[] {
  return cachedRepoView('f07.listObligations', () => getRepository().listObligations());
}

export function useObligations(): JurnlObligation[] {
  return useSyncExternalStore(subscribe, listObligations, listObligations);
}

export function createObligation(input: {
  name: string;
  amount: number;
  cadence: RecurrenceType;
  next_due_date: CalendarDate;
  kind: ObligationKind;
}): JurnlObligation {
  const now = new Date().toISOString();
  const id = `obl-${Date.now()}`;
  return getRepository().upsertObligation({
    obligation_id: id,
    name: input.name.trim().toUpperCase(),
    amount: input.amount,
    currency: 'USD',
    cadence: input.cadence,
    next_due_date: input.next_due_date,
    kind: input.kind,
    account_id: null,
    status: 'ACTIVE',
    skipped_once: false,
    created_at: now,
    updated_at: now,
    archived_at: null,
  });
}

export function obligationById(id: string): JurnlObligation | null {
  return getRepository().getSnapshot().obligations.find((o) => o.obligation_id === id) ?? null;
}
