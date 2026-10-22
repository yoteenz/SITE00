import crypto from 'node:crypto';
import type { FictionCanonDocumentRecord, FictionDocumentType } from '../../../shared/site00-fiction-canon/types.js';
import { OPUS_EVALUATION_MINIMUM_DOCUMENT_TYPES } from '../../../shared/site00-fiction-canon/constants.js';
import { listFictionDocuments } from './fictionCanonStore.js';

export type FictionContextAssemblyResult = {
  propertyId: string;
  documents: FictionCanonDocumentRecord[];
  missingRequiredTypes: FictionDocumentType[];
  retrievalOmissions: string[];
  incompleteContext: boolean;
  approvedBibleVersionFingerprint: string;
};

function activeDocuments(docs: FictionCanonDocumentRecord[]): FictionCanonDocumentRecord[] {
  const byStable = new Map<string, FictionCanonDocumentRecord>();
  for (const doc of docs) {
    if (doc.canonStatus === 'SUPERSEDED' || doc.canonStatus === 'REJECTED') continue;
    const prev = byStable.get(doc.stableIdentifier);
    if (!prev || doc.version > prev.version) byStable.set(doc.stableIdentifier, doc);
  }
  return [...byStable.values()];
}

export function fingerprintApprovedCanon(docs: FictionCanonDocumentRecord[]): string {
  const approved = docs
    .filter((d) => d.canonStatus === 'APPROVED_CANON' && d.approvalStatus === 'FOUNDER_APPROVED')
    .map((d) => `${d.stableIdentifier}:${d.version}:${d.contentHash}`)
    .sort();
  if (approved.length === 0) {
    const working = docs
      .filter((d) => d.canonStatus !== 'SUPERSEDED' && d.canonStatus !== 'REJECTED')
      .map((d) => `${d.stableIdentifier}:${d.version}:${d.contentHash}`)
      .sort();
    return crypto.createHash('sha256').update(working.join('|')).digest('hex');
  }
  return crypto.createHash('sha256').update(approved.join('|')).digest('hex');
}

export async function assembleFictionEvaluationContext(propertyId: string): Promise<FictionContextAssemblyResult> {
  const all = await listFictionDocuments(propertyId);
  const documents = activeDocuments(all);

  const presentTypes = new Set(documents.map((d) => d.documentType));
  const missingRequiredTypes = OPUS_EVALUATION_MINIMUM_DOCUMENT_TYPES.filter((t) => !presentTypes.has(t));

  const retrievalOmissions: string[] = [];
  const approvedCount = documents.filter(
    (d) => d.canonStatus === 'APPROVED_CANON' && d.approvalStatus === 'FOUNDER_APPROVED',
  ).length;
  if (approvedCount === 0) {
    retrievalOmissions.push('No FOUNDER_APPROVED APPROVED_CANON documents — assembly uses working/unresolved concepts only.');
  }

  const unresolvedMother = documents.find(
    (d) => d.documentType === 'FAMILY_HISTORY' && d.canonStatus === 'UNRESOLVED',
  );
  if (!unresolvedMother) {
    retrievalOmissions.push('Family history unresolved mystery not present in active set.');
  }

  const incompleteContext = missingRequiredTypes.length > 0 || approvedCount === 0;

  return {
    propertyId,
    documents,
    missingRequiredTypes,
    retrievalOmissions,
    incompleteContext,
    approvedBibleVersionFingerprint: fingerprintApprovedCanon(documents),
  };
}

export function buildStructuredContextPayload(assembly: FictionContextAssemblyResult): Record<string, unknown> {
  return {
    propertyId: assembly.propertyId,
    fingerprint: assembly.approvedBibleVersionFingerprint,
    sections: assembly.documents.map((d) => ({
      documentType: d.documentType,
      stableIdentifier: d.stableIdentifier,
      version: d.version,
      canonStatus: d.canonStatus,
      approvalStatus: d.approvalStatus,
      knowledgeLayer: d.knowledgeLayer,
      sourceId: d.sourceProvenance.sourceId,
      content: d.content,
    })),
    missingRequiredTypes: assembly.missingRequiredTypes,
    retrievalOmissions: assembly.retrievalOmissions,
  };
}
