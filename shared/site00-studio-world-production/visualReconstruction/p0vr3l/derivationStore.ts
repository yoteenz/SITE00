/**
 * P0.VR.3L — In-memory family derivation records (browser-safe).
 */

import type { FamilyDerivedMissingTargetRecord, FamilyDerivationReceipt } from './types.js';

const derivationRecords = new Map<string, FamilyDerivedMissingTargetRecord>();
const derivationReceipts: FamilyDerivationReceipt[] = [];

export function storeFamilyDerivedRecord(targetId: string, record: FamilyDerivedMissingTargetRecord): void {
  derivationRecords.set(targetId, record);
}

export function appendFamilyDerivationReceipt(receipt: FamilyDerivationReceipt): void {
  derivationReceipts.push(receipt);
}

export function getFamilyDerivedRecord(targetId: string): FamilyDerivedMissingTargetRecord | null {
  return derivationRecords.get(targetId) ?? null;
}

export function listFamilyDerivationReceipts(): FamilyDerivationReceipt[] {
  return [...derivationReceipts];
}

export function clearFamilyDerivationForTest(): void {
  derivationRecords.clear();
  derivationReceipts.length = 0;
}
