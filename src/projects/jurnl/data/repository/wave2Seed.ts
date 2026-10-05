/** Seed income + obligations from setup draft once (Wave 2 migration). */

import type { SetupDraft } from '../f02/setupDraft';
import { getTodayKey, type CalendarDate } from '../foundation/dates';
import type { JurnlIncomeSource } from '../foundation/income';
import type { JurnlObligation } from '../foundation/obligations';
import { MOCK_UPCOMING } from '../home/mockScenario';

function cadenceFromSetup(raw: string | null): JurnlIncomeSource['cadence'] {
  const u = (raw ?? '').toUpperCase();
  if (u.includes('WEEK') && u.includes('TWO')) return 'BIWEEKLY';
  if (u.includes('WEEK')) return 'WEEKLY';
  if (u.includes('MONTH')) return 'MONTHLY';
  if (u.includes('YEAR')) return 'ANNUAL';
  return 'MONTHLY';
}

export function seedIncomeFromSetup(draft: SetupDraft, existing: JurnlIncomeSource[]): JurnlIncomeSource[] {
  if (existing.length) return existing;
  const now = new Date().toISOString();
  const today = getTodayKey();
  const amount = Number(draft.amount);
  if (draft.cadence && Number.isFinite(amount) && amount > 0) {
    return [
      {
        income_id: 'inc-setup-primary',
        source_name: 'PRIMARY INCOME',
        amount,
        currency: 'USD',
        cadence: cadenceFromSetup(draft.cadence),
        next_due_date: today,
        account_id: null,
        status: 'EXPECTED',
        linked_transaction_id: null,
        is_estimated: false,
        notes: 'FROM SETUP',
        created_at: now,
        updated_at: now,
        archived_at: null,
      },
    ];
  }
  return [];
}

export function seedObligationsFromSetup(draft: SetupDraft, existing: JurnlObligation[]): JurnlObligation[] {
  if (existing.length) return existing;
  const now = new Date().toISOString();
  const today = getTodayKey();
  if (draft.obligations.length) {
    return draft.obligations.map((o, i) => {
      const mock = MOCK_UPCOMING.find((m) => m.name.toUpperCase() === o.name.toUpperCase());
      return {
        obligation_id: `obl-setup-${i + 1}`,
        name: o.name.toUpperCase(),
        amount: mock?.amount ?? 0,
        currency: 'USD' as const,
        cadence: cadenceFromSetup(o.cadence),
        next_due_date: offsetDate(today, i + 3),
        kind: mock?.kind ?? 'BILL',
        account_id: null,
        status: 'ACTIVE' as const,
        skipped_once: false,
        created_at: now,
        updated_at: now,
        archived_at: null,
      };
    });
  }
  return [];
}

function offsetDate(base: CalendarDate, days: number): CalendarDate {
  const d = new Date(`${base}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10) as CalendarDate;
}
