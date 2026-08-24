/**
 * Brand Character Readiness memory store — tests only.
 */

import type { BrandCharacterReadinessRecord } from '../../../../../shared/site00-brand-lore/brandCharacterReadiness/types.js';
import { NDXBOOK_CHARACTER_READINESS_DB_ID } from '../../../../../shared/site00-brand-lore/brandCharacterReadiness/constants.js';

let record: BrandCharacterReadinessRecord | null = null;

export async function getBrandCharacterReadinessRecord(
  _projectId: string,
): Promise<BrandCharacterReadinessRecord | null> {
  return record;
}

export async function saveBrandCharacterReadinessRecord(
  next: BrandCharacterReadinessRecord,
): Promise<BrandCharacterReadinessRecord> {
  record = next;
  return next;
}

export function resetBrandCharacterReadinessMemory(): void {
  record = null;
}

export function seedReadinessRecordId(): string {
  return NDXBOOK_CHARACTER_READINESS_DB_ID;
}
