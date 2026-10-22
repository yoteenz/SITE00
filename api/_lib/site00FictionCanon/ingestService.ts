import crypto from 'node:crypto';
import type {
  FictionCanonDocumentRecord,
  FictionIngestBatch,
  FictionIngestImportItem,
  FictionIngestResult,
} from '../../../shared/site00-fiction-canon/types.js';
import { FICTION_CANON_SCHEMA_VERSION } from '../../../shared/site00-fiction-canon/types.js';
import { hashCanonContent } from '../../../shared/site00-fiction-canon/contentHash.js';
import {
  findLatestDocumentByStableId,
  getFictionPropertyBySlug,
  saveFictionDocument,
} from './fictionCanonStore.js';

function normalizeContent(item: FictionIngestImportItem): {
  content: Record<string, unknown>;
  sourceTextOriginal: string | null;
} {
  if (item.format === 'markdown') {
    const text = String(item.payload);
    return {
      content: { markdown: text, documentType: item.documentType, stableIdentifier: item.stableIdentifier },
      sourceTextOriginal: text,
    };
  }
  const payload = item.payload;
  if (typeof payload === 'string') {
    return {
      content: { raw: payload, documentType: item.documentType },
      sourceTextOriginal: payload,
    };
  }
  return { content: payload, sourceTextOriginal: null };
}

export async function ingestFictionCanonBatch(batch: FictionIngestBatch): Promise<FictionIngestResult> {
  const slug = batch.propertySlug.trim().toLowerCase();
  const property = await getFictionPropertyBySlug(slug);
  if (!property) {
    return { ok: false, error: 'Unknown property', blockedReason: 'PROPERTY_NOT_REGISTERED' };
  }

  const created: FictionCanonDocumentRecord[] = [];
  const skipped: string[] = [];
  const warnings: string[] = [];

  for (const item of batch.imports) {
    const { content, sourceTextOriginal } = normalizeContent(item);
    const contentHash = hashCanonContent(sourceTextOriginal ?? content);

    const latest = await findLatestDocumentByStableId(property.id, item.stableIdentifier);
    if (latest && latest.contentHash === contentHash) {
      skipped.push(`${item.stableIdentifier}:duplicate_hash`);
      continue;
    }

    if (
      latest &&
      latest.canonStatus === 'APPROVED_CANON' &&
      latest.approvalStatus === 'FOUNDER_APPROVED' &&
      !item.allowSupersede
    ) {
      return {
        ok: false,
        error: `Silent overwrite blocked for approved canon: ${item.stableIdentifier}`,
        blockedReason: 'APPROVED_CANON_PROTECTED',
      };
    }

    const now = new Date().toISOString();
    const version = (latest?.version ?? 0) + 1;
    const id = `fdoc_${crypto.randomBytes(12).toString('hex')}`;

    if (latest && item.allowSupersede) {
      await saveFictionDocument({
        ...latest,
        canonStatus: 'SUPERSEDED',
        supersededByDocumentId: id,
        updatedAt: now,
      });
    }

    const record: FictionCanonDocumentRecord = {
      schemaVersion: FICTION_CANON_SCHEMA_VERSION,
      id,
      propertyId: property.id,
      propertySlug: property.slug,
      documentType: item.documentType,
      stableIdentifier: item.stableIdentifier,
      version,
      title: item.title ?? item.stableIdentifier,
      content,
      sourceProvenance: {
        sourceId: item.sourceId,
        sourceKind:
          item.sourceId.includes('seed') || item.sourceId.includes('orientation')
            ? 'SEED_ORIENTATION'
            : item.format === 'markdown'
              ? 'FOUNDER_MARKDOWN'
              : 'FOUNDER_JSON',
        importedAt: now,
      },
      canonStatus: item.canonStatus,
      approvalStatus: item.approvalStatus,
      supersededByDocumentId: null,
      supersedesDocumentId: latest?.id ?? null,
      characterReferences: item.characterReferences ?? [],
      worldReferences: item.worldReferences ?? [],
      sourceTextOriginal,
      contentHash,
      knowledgeLayer: item.knowledgeLayer ?? 'UNSPECIFIED',
      visualReferenceStatus: item.visualReferenceStatus,
      createdAt: now,
      updatedAt: now,
    };

    if (item.canonStatus === 'UNRESOLVED') {
      warnings.push(`${item.stableIdentifier}: stored as UNRESOLVED — will not promote to approved canon automatically.`);
    }

    await saveFictionDocument(record);
    created.push(record);
  }

  return { ok: true, created, skipped, warnings };
}
