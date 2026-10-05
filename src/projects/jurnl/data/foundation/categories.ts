/**
 * Canonical domain / category registry (W0.2). Domains are taxonomic; categories are spend labels.
 */

export type DataDomainId =
  | 'ACCOUNT'
  | 'TRANSACTION'
  | 'INCOME'
  | 'BILL'
  | 'SUBSCRIPTION'
  | 'OBLIGATION'
  | 'BUDGET'
  | 'PURCHASE'
  | 'TRIP'
  | 'CREDIT'
  | 'DEBT'
  | 'GOAL'
  | 'FORECAST'
  | 'RECORD'
  | 'BUSINESS'
  | 'TAX'
  | 'TRANSFER'
  | 'REFUND'
  | 'OTHER';

export type AccountType = 'CHECKING' | 'SAVINGS' | 'CREDIT_CARD' | 'CASH' | 'INVESTMENT' | 'LOAN' | 'BUSINESS' | 'OTHER';
export type TransactionKind = 'EXPENSE' | 'INCOME' | 'TRANSFER';
export type ObligationKind = 'BILL' | 'SUBSCRIPTION';
export type IncomeType = 'WORK' | 'PRACTICE' | 'OTHER';
export type DebtType = 'CREDIT_CARD' | 'LOAN' | 'OTHER';
export type GoalType = 'SAVINGS' | 'PAYDOWN' | 'PURCHASE' | 'OTHER';
export type RecordType = 'STATEMENT' | 'RECEIPT' | 'TAX' | 'OTHER';
export type SourceType = 'MANUAL' | 'IMPORT' | 'CONNECTED' | 'MOCK';
export type RecurrenceType = 'NONE' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'ANNUAL' | 'IRREGULAR';

export type SpendCategoryId =
  | 'HOUSING'
  | 'FOOD'
  | 'CLOTHING'
  | 'MEMBERSHIP'
  | 'INCOME'
  | 'TRANSPORT'
  | 'UTILITIES'
  | 'HEALTH'
  | 'TRAVEL'
  | 'DEBT_PAYMENT'
  | 'TRANSFER'
  | 'OTHER';

export type CategoryEntry = {
  id: SpendCategoryId;
  label: string;
  domain: DataDomainId;
  iconMark: 'account' | 'money' | 'document' | 'clock' | 'download';
};

export const JURNL_SPEND_CATEGORIES: readonly CategoryEntry[] = [
  { id: 'HOUSING', label: 'HOUSING', domain: 'BILL', iconMark: 'account' },
  { id: 'FOOD', label: 'FOOD', domain: 'TRANSACTION', iconMark: 'money' },
  { id: 'CLOTHING', label: 'CLOTHING', domain: 'TRANSACTION', iconMark: 'document' },
  { id: 'MEMBERSHIP', label: 'MEMBERSHIP', domain: 'SUBSCRIPTION', iconMark: 'clock' },
  { id: 'INCOME', label: 'INCOME', domain: 'INCOME', iconMark: 'download' },
  { id: 'TRANSPORT', label: 'TRANSPORT', domain: 'TRANSACTION', iconMark: 'money' },
  { id: 'UTILITIES', label: 'UTILITIES', domain: 'BILL', iconMark: 'document' },
  { id: 'HEALTH', label: 'HEALTH', domain: 'TRANSACTION', iconMark: 'document' },
  { id: 'TRAVEL', label: 'TRAVEL', domain: 'TRIP', iconMark: 'document' },
  { id: 'DEBT_PAYMENT', label: 'DEBT PAYMENT', domain: 'DEBT', iconMark: 'account' },
  { id: 'TRANSFER', label: 'TRANSFER', domain: 'TRANSFER', iconMark: 'account' },
  { id: 'OTHER', label: 'OTHER', domain: 'OTHER', iconMark: 'document' },
] as const;

const byLabel = new Map(JURNL_SPEND_CATEGORIES.flatMap((c) => [[c.label, c] as const, [c.id, c] as const]));

export function normalizeCategory(input: string | null | undefined): SpendCategoryId {
  const raw = (input ?? '').trim().toUpperCase();
  if (!raw) return 'OTHER';
  const hit = byLabel.get(raw);
  if (hit) return hit.id;
  if (raw === 'GROCERIES') return 'FOOD';
  if (raw === 'PAY' || raw === 'REGULAR PAY') return 'INCOME';
  return 'OTHER';
}

export function categoryLabel(id: SpendCategoryId): string {
  return JURNL_SPEND_CATEGORIES.find((c) => c.id === id)?.label ?? 'OTHER';
}

export function categoryIconMark(id: SpendCategoryId): CategoryEntry['iconMark'] {
  return JURNL_SPEND_CATEGORIES.find((c) => c.id === id)?.iconMark ?? 'document';
}
