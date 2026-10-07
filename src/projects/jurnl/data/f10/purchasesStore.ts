import { useSyncExternalStore } from 'react';
import type { JurnlPurchase } from '../foundation/purchases';
import type { CalendarDate } from '../foundation/dates';
import { addLedgerEntry } from '../home/money';
import { cachedRepoView } from '../repository/cachedRepoView';
import { getRepository } from '../repository/deviceRepository';
import { computeSafeToSpend } from '../f09/safeToSpend';

let seq = 0;

export function usePurchases(): JurnlPurchase[] {
  return useSyncExternalStore((cb) => getRepository().subscribe(cb), () => listPurchases(), () => []);
}

export function listPurchases(): JurnlPurchase[] {
  return cachedRepoView('f10.listPurchases', () =>
    getRepository()
      .listPurchases()
      .filter((p) => p.status !== 'ARCHIVED'),
  );
}

export function purchaseById(id: string): JurnlPurchase | null {
  return getRepository().listPurchases().find((p) => p.purchase_id === id && p.status !== 'ARCHIVED') ?? null;
}

export function totalPurchaseReserved(): number {
  return listPurchases().filter((p) => p.status !== 'PURCHASED').reduce((s, p) => s + Math.max(0, p.reserved_amount), 0);
}

export function createPurchase(input: { title: string; target_amount: number; target_date?: CalendarDate | null }): JurnlPurchase {
  const now = new Date().toISOString();
  seq += 1;
  const purchase: JurnlPurchase = {
    purchase_id: `pur-${seq}-${Date.now()}`,
    title: input.title.trim().toUpperCase(),
    target_amount: Math.max(0, input.target_amount),
    target_date: input.target_date ?? null,
    status: 'PLANNING',
    reserved_amount: 0,
    linked_goal_id: null,
    linked_plan_id: null,
    linked_transaction_id: null,
    notes: '',
    created_at: now,
    updated_at: now,
    purchased_at: null,
    archived_at: null,
  };
  return getRepository().upsertPurchase(purchase);
}

export function updatePurchase(purchase: JurnlPurchase): JurnlPurchase {
  return getRepository().upsertPurchase(purchase);
}

export function archivePurchase(id: string): boolean {
  return getRepository().deletePurchase(id);
}

export function purchaseAffordability(purchase: JurnlPurchase): { after: number; verdict: 'NOW' | 'WAIT' | 'NOT_YET' } {
  return amountAffordability(purchase.target_amount);
}

/** The same verdict for an amount that is not saved as a purchase (CHECK A PURCHASE). */
export function amountAffordability(amount: number): { after: number; verdict: 'NOW' | 'WAIT' | 'NOT_YET' } {
  const sts = computeSafeToSpend();
  const after = sts.value - amount;
  if (after >= 0) return { after, verdict: 'NOW' };
  if (after > -amount * 0.25) return { after, verdict: 'WAIT' };
  return { after, verdict: 'NOT_YET' };
}

export function markPurchaseBought(purchaseId: string, account: string): JurnlPurchase | null {
  const purchase = purchaseById(purchaseId);
  if (!purchase || purchase.status === 'PURCHASED') return null;
  const tx = addLedgerEntry({
    merchant: purchase.title,
    amount: purchase.target_amount,
    direction: 'EXPENSE',
    when: 'TODAY',
    account,
    category: 'OTHER',
  });
  const next: JurnlPurchase = {
    ...purchase,
    status: 'PURCHASED',
    linked_transaction_id: tx.id,
    purchased_at: new Date().toISOString(),
    reserved_amount: 0,
  };
  return getRepository().upsertPurchase(next);
}
