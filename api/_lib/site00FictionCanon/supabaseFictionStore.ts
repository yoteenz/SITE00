/**
 * Supabase persistence for fiction canon — used when service role + tables exist.
 */

import { getSupabaseAdmin } from '../supabase.js';
import type { FictionCanonDocumentRecord, FictionPropertyRecord } from '../../../shared/site00-fiction-canon/types.js';
import { memorySaveDocument, memorySaveProperty } from '../../../shared/site00-fiction-canon/memoryStore.js';

const PROPERTIES = 'site00_fiction_properties';
const DOCUMENTS = 'site00_fiction_canon_documents';

export async function fictionCanonTablesExist(): Promise<boolean> {
  const { error } = await getSupabaseAdmin().from(PROPERTIES).select('id').limit(1);
  return !error;
}

export async function supabaseSaveProperty(record: FictionPropertyRecord): Promise<FictionPropertyRecord> {
  if (!(await fictionCanonTablesExist())) return memorySaveProperty(record);
  const { error } = await getSupabaseAdmin().from(PROPERTIES).upsert({
    id: record.id,
    slug: record.slug,
    display_name: record.displayName,
    property_type: record.propertyType,
    ownership: record.ownership,
    production_integration: record.productionIntegration,
    metadata: record.metadata,
    registered_at: record.registeredAt,
  });
  if (error) return memorySaveProperty(record);
  return record;
}

function rowToDocument(row: Record<string, unknown>): FictionCanonDocumentRecord {
  return row as unknown as FictionCanonDocumentRecord;
}

export async function supabaseSaveDocument(record: FictionCanonDocumentRecord): Promise<FictionCanonDocumentRecord> {
  if (!(await fictionCanonTablesExist())) return memorySaveDocument(record);
  const { error } = await getSupabaseAdmin().from(DOCUMENTS).insert({
    id: record.id,
    property_id: record.propertyId,
    property_slug: record.propertySlug,
    document_type: record.documentType,
    stable_identifier: record.stableIdentifier,
    version: record.version,
    title: record.title,
    content: record.content,
    source_provenance: record.sourceProvenance,
    canon_status: record.canonStatus,
    approval_status: record.approvalStatus,
    superseded_by_document_id: record.supersededByDocumentId,
    supersedes_document_id: record.supersedesDocumentId,
    character_references: record.characterReferences,
    world_references: record.worldReferences,
    source_text_original: record.sourceTextOriginal,
    content_hash: record.contentHash,
    knowledge_layer: record.knowledgeLayer,
    visual_reference_status: record.visualReferenceStatus ?? null,
    schema_version: record.schemaVersion,
    created_at: record.createdAt,
    updated_at: record.updatedAt,
  });
  if (error) return memorySaveDocument(record);
  return record;
}

export async function supabaseListDocuments(propertyId: string): Promise<FictionCanonDocumentRecord[]> {
  if (!(await fictionCanonTablesExist())) {
    const { memoryListDocumentsForProperty } = await import('../../../shared/site00-fiction-canon/memoryStore.js');
    return memoryListDocumentsForProperty(propertyId);
  }
  const { data, error } = await getSupabaseAdmin()
    .from(DOCUMENTS)
    .select('*')
    .eq('property_id', propertyId)
    .order('updated_at', { ascending: false });
  if (error || !data) {
    const { memoryListDocumentsForProperty } = await import('../../../shared/site00-fiction-canon/memoryStore.js');
    return memoryListDocumentsForProperty(propertyId);
  }
  return data.map((row) => rowToDocument(row as Record<string, unknown>));
}

export async function supabaseFindLatestByStableId(
  propertyId: string,
  stableIdentifier: string,
): Promise<FictionCanonDocumentRecord | null> {
  const docs = await supabaseListDocuments(propertyId);
  const matches = docs
    .filter((d) => d.stableIdentifier === stableIdentifier)
    .sort((a, b) => b.version - a.version);
  return matches[0] ?? null;
}
