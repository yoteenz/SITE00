import type {
  FictionCanonDocumentRecord,
  FictionPremiseEvaluationRecord,
  FictionPropertyRecord,
} from './types.js';

const properties = new Map<string, FictionPropertyRecord>();
const documents = new Map<string, FictionCanonDocumentRecord>();
const evaluations = new Map<string, FictionPremiseEvaluationRecord>();

export function resetFictionCanonMemoryStoreForTests(): void {
  properties.clear();
  documents.clear();
  evaluations.clear();
}

export function memorySaveProperty(record: FictionPropertyRecord): FictionPropertyRecord {
  properties.set(record.slug, record);
  return record;
}

export function memoryGetPropertyBySlug(slug: string): FictionPropertyRecord | null {
  return properties.get(slug.trim().toLowerCase()) ?? null;
}

export function memorySaveDocument(record: FictionCanonDocumentRecord): FictionCanonDocumentRecord {
  documents.set(record.id, record);
  return record;
}

export function memoryListDocumentsForProperty(propertyId: string): FictionCanonDocumentRecord[] {
  return [...documents.values()].filter((d) => d.propertyId === propertyId);
}

export function memoryFindLatestByStableId(
  propertyId: string,
  stableIdentifier: string,
): FictionCanonDocumentRecord | null {
  const matches = [...documents.values()]
    .filter((d) => d.propertyId === propertyId && d.stableIdentifier === stableIdentifier)
    .sort((a, b) => b.version - a.version);
  return matches[0] ?? null;
}

export function memorySaveEvaluation(record: FictionPremiseEvaluationRecord): FictionPremiseEvaluationRecord {
  evaluations.set(record.evaluationId, record);
  return record;
}

export function memoryGetEvaluation(evaluationId: string): FictionPremiseEvaluationRecord | null {
  return evaluations.get(evaluationId) ?? null;
}
