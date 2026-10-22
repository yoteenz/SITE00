import type {
  FictionCanonDocumentRecord,
  FictionPremiseEvaluationRecord,
  FictionPropertyRecord,
} from '../../../shared/site00-fiction-canon/types.js';
import {
  memoryFindLatestByStableId,
  memoryGetEvaluation,
  memoryGetPropertyBySlug,
  memoryListDocumentsForProperty,
  memorySaveDocument,
  memorySaveEvaluation,
  memorySaveProperty,
} from '../../../shared/site00-fiction-canon/memoryStore.js';

export type FictionCanonStoreMode = 'memory' | 'supabase';

let storeMode: FictionCanonStoreMode = 'memory';

export function getFictionCanonStoreMode(): FictionCanonStoreMode {
  return storeMode;
}

export function setFictionCanonStoreModeForTests(mode: FictionCanonStoreMode): void {
  storeMode = mode;
}

export async function saveFictionProperty(record: FictionPropertyRecord): Promise<FictionPropertyRecord> {
  return memorySaveProperty(record);
}

export async function getFictionPropertyBySlug(slug: string): Promise<FictionPropertyRecord | null> {
  return memoryGetPropertyBySlug(slug);
}

export async function saveFictionDocument(record: FictionCanonDocumentRecord): Promise<FictionCanonDocumentRecord> {
  if (storeMode === 'supabase') {
    const { supabaseSaveDocument } = await import('./supabaseFictionStore.js');
    return supabaseSaveDocument(record);
  }
  return memorySaveDocument(record);
}

export async function listFictionDocuments(propertyId: string): Promise<FictionCanonDocumentRecord[]> {
  if (storeMode === 'supabase') {
    const { supabaseListDocuments } = await import('./supabaseFictionStore.js');
    return supabaseListDocuments(propertyId);
  }
  return memoryListDocumentsForProperty(propertyId);
}

export async function findLatestDocumentByStableId(
  propertyId: string,
  stableIdentifier: string,
): Promise<FictionCanonDocumentRecord | null> {
  if (storeMode === 'supabase') {
    const { supabaseFindLatestByStableId } = await import('./supabaseFictionStore.js');
    return supabaseFindLatestByStableId(propertyId, stableIdentifier);
  }
  return memoryFindLatestByStableId(propertyId, stableIdentifier);
}

export async function saveFictionEvaluation(
  record: FictionPremiseEvaluationRecord,
): Promise<FictionPremiseEvaluationRecord> {
  return memorySaveEvaluation(record);
}

export async function getFictionEvaluation(
  evaluationId: string,
): Promise<FictionPremiseEvaluationRecord | null> {
  return memoryGetEvaluation(evaluationId);
}
