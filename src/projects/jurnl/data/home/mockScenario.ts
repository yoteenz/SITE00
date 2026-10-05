/** Preview scenario constants — seeded into the device repository, not a runtime source of truth. */

import type { LedgerEntry, UpcomingItem } from './moneyTypes';

export const MOCK_CASH = 8420;

export const MOCK_UPCOMING: UpcomingItem[] = [
  { id: 'up-rent', name: 'RENT', when: 'THURSDAY', amount: 1800, kind: 'BILL', source: 'MOCK' },
  { id: 'up-groceries', name: 'GROCERIES', when: 'FRIDAY', amount: 120, kind: 'BILL', source: 'MOCK' },
];

export const MOCK_ENTRIES: LedgerEntry[] = [
  { id: 'tx-atelier', merchant: 'ATELIER', amount: 86, direction: 'EXPENSE', when: 'YESTERDAY', account: 'CHECKING', category: 'CLOTHING', status: 'CLEARED', recurring: false, memo: 'A QUIET PURCHASE', source: 'MOCK', related: null },
  { id: 'tx-market', merchant: 'MARKET', amount: 42, direction: 'EXPENSE', when: 'YESTERDAY', account: 'CHECKING', category: 'FOOD', status: 'CLEARED', recurring: false, memo: '', source: 'MOCK', related: null },
  { id: 'tx-pay', merchant: 'PAY', amount: 3200, direction: 'INCOME', when: 'FRIDAY', account: 'CHECKING', category: 'INCOME', status: 'CLEARED', recurring: true, memo: 'REGULAR PAY', source: 'MOCK', related: null },
  { id: 'tx-rent', merchant: 'RENT', amount: 1800, direction: 'EXPENSE', when: 'THURSDAY', account: 'CHECKING', category: 'HOUSING', status: 'PENDING', recurring: true, memo: 'EXPECTED, NOT YET MOVED', source: 'MOCK', related: { kind: 'BILL', name: 'RENT' } },
  { id: 'tx-studio', merchant: 'STUDIO', amount: 64, direction: 'EXPENSE', when: 'MONDAY', account: 'CARD', category: 'MEMBERSHIP', status: 'CLEARED', recurring: true, memo: '', source: 'MOCK', related: { kind: 'SUBSCRIPTION', name: 'STUDIO' } },
  { id: 'tx-coffee', merchant: 'COFFEE', amount: 6, direction: 'EXPENSE', when: 'MONDAY', account: 'CARD', category: 'FOOD', status: 'CLEARED', recurring: false, memo: '', source: 'MOCK', related: null },
];
