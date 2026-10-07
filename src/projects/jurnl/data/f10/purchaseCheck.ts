/** Purchase-check result tones. Live safe-to-spend and category history pick the state. */

import { computeSafeToSpend } from '../f09/safeToSpend';
import { ledgerEntries } from '../home/money';

export type PurchaseCheckTone = 'FIT' | 'CHECK_IN' | 'OVER';

/** Authority category labels on the check result. Ledger rows use the spend registry. */
const LEDGER_CATEGORY: Record<string, string> = {
  FASHION: 'CLOTHING',
  BEAUTY: 'OTHER',
  HOME: 'HOUSING',
  TRAVEL: 'TRAVEL',
  WELLNESS: 'HEALTH',
  DINING: 'FOOD',
  GROCERIES: 'FOOD',
  GIFTS: 'OTHER',
  TECH: 'OTHER',
  TRANSPORT: 'TRANSPORT',
  EVENTS: 'OTHER',
  OTHER: 'OTHER',
};

export function classifyPurchaseCheck(amount: number, category: string): {
  tone: PurchaseCheckTone;
  after: number;
  overBy: number;
  average: number | null;
} {
  const price = Number.isFinite(amount) ? Math.max(0, amount) : 0;
  const after = computeSafeToSpend().value - price;
  const overBy = after < 0 ? -after : 0;
  if (after < 0) return { tone: 'OVER', after, overBy, average: null };
  const key = LEDGER_CATEGORY[category.trim().toUpperCase()] ?? category.trim().toUpperCase();
  const rows = ledgerEntries().filter((entry) => entry.direction === 'EXPENSE' && entry.category === key);
  const average = rows.length ? rows.reduce((sum, entry) => sum + entry.amount, 0) / rows.length : null;
  if (average != null && price > average * 1.5) return { tone: 'CHECK_IN', after, overBy: 0, average };
  return { tone: 'FIT', after, overBy: 0, average };
}
