import { useSyncExternalStore } from 'react';
import type { CalendarDate, RecurrenceType } from '../foundation/dates';
import type { JurnlIncomeSource } from '../foundation/income';
import { getRepository } from '../repository/deviceRepository';

function subscribe(listener: () => void) {
  return getRepository().subscribe(listener);
}

export function listIncome(): JurnlIncomeSource[] {
  return getRepository().listIncomeSources();
}

export function useIncomeSources(): JurnlIncomeSource[] {
  return useSyncExternalStore(subscribe, listIncome, listIncome);
}

export function createIncomeSource(input: {
  source_name: string;
  amount: number;
  cadence: RecurrenceType;
  next_due_date: CalendarDate;
  account_id?: string | null;
}): JurnlIncomeSource {
  const now = new Date().toISOString();
  const id = `inc-${Date.now()}`;
  return getRepository().upsertIncomeSource({
    income_id: id,
    source_name: input.source_name.trim().toUpperCase(),
    amount: input.amount,
    currency: 'USD',
    cadence: input.cadence,
    next_due_date: input.next_due_date,
    account_id: input.account_id ?? null,
    status: 'EXPECTED',
    linked_transaction_id: null,
    is_estimated: false,
    notes: '',
    created_at: now,
    updated_at: now,
    archived_at: null,
  });
}

export function receiveIncome(incomeId: string, accountLabel: string): JurnlIncomeSource | null {
  const src = listIncome().find((s) => s.income_id === incomeId);
  if (!src) return null;
  const tx = getRepository().appendTransaction({
    merchant: src.source_name,
    amount: src.amount,
    direction: 'INCOME',
    when: 'TODAY',
    account: accountLabel,
    category: 'INCOME',
    memo: `RECEIVED · ${src.income_id}`,
  });
  return getRepository().markIncomeReceived(incomeId, tx.id);
}

export function incomeById(id: string): JurnlIncomeSource | null {
  return getRepository().getSnapshot().incomeSources.find((s) => s.income_id === id) ?? null;
}
