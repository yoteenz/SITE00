/**
 * In-process runtime snapshots keyed by intake / commercial record id (tests + API hydration).
 */

import type { IdentityProductionSnapshot } from './types.js';

const snapshots = new Map<string, IdentityProductionSnapshot>();

export function getIdentityProductionSnapshot(commercialRecordId: string): IdentityProductionSnapshot | null {
  return snapshots.get(commercialRecordId) ?? null;
}

export function setIdentityProductionSnapshot(commercialRecordId: string, snapshot: IdentityProductionSnapshot): void {
  snapshots.set(commercialRecordId, snapshot);
}

export function clearIdentityRuntimeStore(): void {
  snapshots.clear();
}
