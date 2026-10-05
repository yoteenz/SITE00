import type { QuickAddQuote } from './currency';

export type MoneySource = 'MOCK' | 'ADDED' | 'SETUP' | 'DERIVED';
export type Direction = 'INCOME' | 'EXPENSE';
export type Clearance = 'PENDING' | 'CLEARED';
export type ObligationKind = 'BILL' | 'SUBSCRIPTION';

export type UpcomingItem = {
  id: string;
  name: string;
  when: string;
  amount: number;
  kind: ObligationKind;
  source: 'MOCK' | 'SETUP';
};

export type LedgerEntry = {
  id: string;
  merchant: string;
  amount: number;
  direction: Direction;
  when: string;
  account: string;
  category: string;
  status: Clearance;
  recurring: boolean;
  memo: string;
  source: 'MOCK' | 'ADDED';
  related: { kind: ObligationKind; name: string } | null;
  provenance?: QuickAddQuote;
};
