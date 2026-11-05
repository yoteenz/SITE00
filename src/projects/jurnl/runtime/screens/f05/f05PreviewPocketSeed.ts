/**
 * Design-preview only: idempotent pocket seeds for founder tunnel review (never production).
 * `?f05seed=cash-third` — re-add a CASH pocket when two or more pockets exist but none is CASH.
 * `?f05seed=three-pockets` — ensure at least three active pockets for accounts-rail scroll QA.
 */
import { createManualAccount } from '../../../data/foundation/accountMutations';
import { listActiveAccounts } from '../../../data/foundation/accounts';

const FILLERS: { name: string; type: 'CHECKING' | 'SAVINGS' | 'CASH'; balance: number }[] = [
  { name: 'PRIMARY CHECKING', type: 'CHECKING', balance: 4200 },
  { name: 'SECOND POCKET', type: 'SAVINGS', balance: 4220 },
  { name: 'CASH', type: 'CASH', balance: 0 },
];

export function applyF05PreviewPocketSeed(seed: string | null | undefined): void {
  if (!seed) return;
  if (seed === 'cash-third') {
    const active = listActiveAccounts();
    if (active.length >= 2 && !active.some((a) => a.account_type === 'CASH')) {
      createManualAccount('CASH', 'CASH', 0);
    }
    return;
  }
  if (seed === 'three-pockets') {
    let active = listActiveAccounts();
    for (const f of FILLERS) {
      if (active.length >= 3) break;
      if (active.some((a) => a.display_name === f.name || (f.type === 'CASH' && a.account_type === 'CASH'))) continue;
      createManualAccount(f.name, f.type, f.balance);
      active = listActiveAccounts();
    }
  }
}
