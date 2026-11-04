/**
 * F05 DOT 01 — archiving a place (authorities 25, 36). Archiving is not deletion: the place leaves active tracking,
 * its history stays, and it can no longer be chosen for new entries (ledgerOps.activeAccount requires ACTIVE). It is
 * refused while anything still depends on the place.
 */
import { archiveAccount } from '../../foundation/accountMutations';
import { getTodayKey, type CalendarDate } from '../../foundation/dates';
import { PURPOSE_LABEL, type MoneyPurpose } from '../../ledger/purposes';
import { transferViews } from '../../ledger/transferSettlement';
import { getRepository } from '../../repository/deviceRepository';
import { accountView } from './accountView';
import type { Done } from './result';

export type ArchiveBlockerKind = 'ACTIVE_TRANSFER' | 'RESERVED_FUNDS' | 'DEFAULT_ACCOUNT' | 'RECURRING_PAYMENT' | 'EXPECTED_INCOME' | 'OPEN_BALANCE';
export type ArchiveBlocker = { kind: ArchiveBlockerKind; label: string; detail: string; route?: string };

const OPEN = new Set(['SCHEDULED', 'PENDING', 'IN_TRANSIT', 'RETURNING', 'NEEDS_RECONCILIATION']);

export function archiveBlockers(accountId: string, today: CalendarDate = getTodayKey()): ArchiveBlocker[] {
  const snap = getRepository().getSnapshot();
  const out: ArchiveBlocker[] = [];
  const open = transferViews(snap.transactions, today).filter((v) => OPEN.has(v.state) && (v.fromId === accountId || v.toId === accountId));
  if (open.length) out.push({ kind: 'ACTIVE_TRANSFER', label: 'ACTIVE TRANSFER', detail: `${open.length} ${open.length === 1 ? 'TRANSFER IS' : 'TRANSFERS ARE'} NOT FINISHED. RECORD WHAT HAPPENED FIRST.`, route: 'money/places' });
  const reserved = (snap.reservations ?? []).filter((r) => r.status === 'ACTIVE' && r.account_id === accountId);
  if (reserved.length) out.push({ kind: 'RESERVED_FUNDS', label: 'RESERVED FUNDS', detail: 'MONEY IS SET ASIDE IN THIS POCKET FOR A BILL OR CARD PAYMENT. MOVE OR RELEASE IT FIRST.', route: 'upcoming' });
  const purposes = Object.entries(getRepository().getSettings().purposeAccounts ?? {}).filter(([, id]) => id === accountId).map(([p]) => PURPOSE_LABEL[p as MoneyPurpose] ?? p);
  if (purposes.length) out.push({ kind: 'DEFAULT_ACCOUNT', label: 'DEFAULT PAYMENT ACCOUNT', detail: `USUAL ACCOUNT FOR ${purposes.join(', ')}. CHOOSE ANOTHER POCKET FIRST.` });
  const bills = snap.obligations.filter((o) => o.account_id === accountId && o.status === 'ACTIVE');
  if (bills.length) out.push({ kind: 'RECURRING_PAYMENT', label: 'RECURRING PAYMENT', detail: `${bills.map((b) => b.name).slice(0, 3).join(', ')} ${bills.length === 1 ? 'IS' : 'ARE'} PAID FROM THIS POCKET.`, route: 'upcoming' });
  const income = snap.incomeSources.filter((i) => i.account_id === accountId && (i.status === 'EXPECTED' || i.status === 'LATE'));
  if (income.length) out.push({ kind: 'EXPECTED_INCOME', label: 'EXPECTED INCOME', detail: `${income.map((i) => i.source_name).slice(0, 3).join(', ')} ${income.length === 1 ? 'IS' : 'ARE'} EXPECTED INTO THIS POCKET.`, route: 'income' });
  const v = accountView(accountId, today);
  if (v?.liability && v.owed > 0) out.push({ kind: 'OPEN_BALANCE', label: 'OPEN BALANCE', detail: 'THIS CARD STILL SHOWS MONEY OWED. ARCHIVING WOULD HIDE A DEBT.' });
  return out;
}

/** Archives only when nothing depends on the place; the check runs again at the moment of archiving. */
export function archiveAccountSafely(accountId: string, today: CalendarDate = getTodayKey()): Done<null> {
  const blockers = archiveBlockers(accountId, today);
  if (blockers.length) return { ok: false, error: `CANNOT ARCHIVE YET: ${blockers.map((b) => b.label).join(', ')}.` };
  const ok = archiveAccount(accountId);
  if (!ok) return { ok: false, error: 'POCKET NOT FOUND. NOTHING WAS CHANGED.' };
  // Archived places leave the saved order too (the order only lists active places).
  const s = getRepository().getSettings();
  if (s.accountOrder?.includes(accountId)) getRepository().patchSettings({ accountOrder: s.accountOrder.filter((id) => id !== accountId) });
  return { ok: true, value: null };
}
