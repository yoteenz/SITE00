/**
 * F08 PLAN view of money set aside for bills (D3).
 *
 * F08 and F07 are two entry points into ONE reservation model (data/f07/reservations.ts): the same records, the same
 * builders (buildSetAside / buildReduceReservation / buildReleaseReservations / buildReassignReservation) and the same
 * funding view (obligationFunding). This file only reads; it owns no reservation state of its own.
 */

import { useSyncExternalStore } from 'react';
import type { JurnlAccountRecord } from '../foundation/accounts';
import type { JurnlObligation } from '../foundation/obligations';
import type { JurnlReservation } from '../foundation/reservations';
import type { LedgerEntry } from '../home/moneyTypes';
import { sumCents } from '../ledger/accounting';
import { getRepository, getRepositoryPersistRevision } from '../repository/deviceRepository';
import { obligationFunding, type ObligationFunding } from '../f07/obligationLifecycle';
import { reservationsFor } from '../f07/reservations';

export type BillSetAsideRow = {
  obligation: JurnlObligation;
  funding: ObligationFunding;
  /** Per-account pieces of the set-aside (same records F07 shows). */
  pieces: { reservation: JurnlReservation; accountName: string }[];
};

/** Active bills with something still due, each with exactly the funding F07 shows. */
export function billSetAsideRows(obligations: JurnlObligation[], entries: LedgerEntry[], reservations: JurnlReservation[], accounts: JurnlAccountRecord[]): BillSetAsideRow[] {
  return obligations
    .filter((o) => o.status === 'ACTIVE' && o.amount > 0 && !o.linked_card_account_id)
    .map((o) => ({
      obligation: o,
      funding: obligationFunding(o, entries, reservations),
      pieces: reservationsFor(reservations, 'OBLIGATION', o.obligation_id, o.next_due_date).map((r) => ({
        reservation: r,
        accountName: accounts.find((a) => a.account_id === r.account_id)?.display_name ?? r.account_id,
      })),
    }))
    .filter((r) => r.funding.remaining > 0 || r.funding.reserved > 0)
    .sort((a, b) => a.obligation.next_due_date.localeCompare(b.obligation.next_due_date));
}

export function billSetAsideTotal(rows: BillSetAsideRow[]): number {
  return sumCents(rows.map((r) => r.funding.reserved));
}

export function currentBillSetAsideRows(): BillSetAsideRow[] {
  const s = getRepository().getSnapshot();
  return billSetAsideRows(s.obligations, s.transactions, s.reservations, s.accounts);
}

export function useBillSetAsideRows(): BillSetAsideRow[] {
  useSyncExternalStore((cb) => getRepository().subscribe(cb), getRepositoryPersistRevision, getRepositoryPersistRevision);
  return currentBillSetAsideRows();
}
