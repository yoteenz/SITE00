import type { FictionDocumentType } from '../../../shared/site00-fiction-canon/types.js';
import { FOUNDER_BIBLE_COMPLETENESS_TYPES } from '../../../shared/site00-fiction-canon/constants.js';
import { getFictionPropertyBySlug, listFictionDocuments } from './fictionCanonStore.js';

export type FictionIngestionReadinessReport = {
  propertySlug: string;
  overallStatus: 'AWAITING_FOUNDER_SOURCE' | 'PARTIAL' | 'READY_FOR_OPUS_DRY_RUN' | 'UNKNOWN_PROPERTY';
  documentsPresent: FictionDocumentType[];
  documentsMissing: FictionDocumentType[];
  seedOnly: boolean;
  notes: string[];
};

export async function buildIngestionReadinessReport(propertySlug: string): Promise<FictionIngestionReadinessReport> {
  const property = await getFictionPropertyBySlug(propertySlug);
  if (!property) {
    return {
      propertySlug,
      overallStatus: 'UNKNOWN_PROPERTY',
      documentsPresent: [],
      documentsMissing: [...FOUNDER_BIBLE_COMPLETENESS_TYPES],
      seedOnly: false,
      notes: ['Property not registered.'],
    };
  }

  const docs = await listFictionDocuments(property.id);
  const activeTypes = new Set(
    docs.filter((d) => d.canonStatus !== 'SUPERSEDED' && d.canonStatus !== 'REJECTED').map((d) => d.documentType),
  );

  const documentsPresent = FOUNDER_BIBLE_COMPLETENESS_TYPES.filter((t) => activeTypes.has(t));
  const documentsMissing = FOUNDER_BIBLE_COMPLETENESS_TYPES.filter((t) => !activeTypes.has(t));

  const seedOnly = docs.every((d) => d.sourceProvenance.sourceKind === 'SEED_ORIENTATION');
  const approvedCanon = docs.some(
    (d) => d.canonStatus === 'APPROVED_CANON' && d.approvalStatus === 'FOUNDER_APPROVED',
  );

  const notes: string[] = [];
  if (seedOnly) {
    notes.push('Only orientation seed documents present — not the definitive founder bible.');
  }
  if (!approvedCanon) {
    notes.push('No FOUNDER_APPROVED APPROVED_CANON documents yet.');
  }
  if (documentsMissing.length > 0) {
    notes.push(`Missing document types: ${documentsMissing.join(', ')}`);
  }

  let overallStatus: FictionIngestionReadinessReport['overallStatus'] = 'AWAITING_FOUNDER_SOURCE';
  if (seedOnly) {
    overallStatus = 'AWAITING_FOUNDER_SOURCE';
  } else if (documentsMissing.length === 0 && approvedCanon) {
    overallStatus = 'READY_FOR_OPUS_DRY_RUN';
  } else if (documentsPresent.length > 0) {
    overallStatus = 'PARTIAL';
  }

  return {
    propertySlug,
    overallStatus,
    documentsPresent,
    documentsMissing,
    seedOnly,
    notes,
  };
}

export type OpusExecutionReadinessAssessment = {
  contextAssemblyAllowed: boolean;
  paidExecutionAllowed: boolean;
  blockers: string[];
};

export function assessOpusExecutionReadiness(): OpusExecutionReadinessAssessment {
  const blockers: string[] = [];
  if (process.env.SITE00_FICTION_OPUS_EXECUTION_AUTHORIZED !== '1') {
    blockers.push('SITE00_FICTION_OPUS_EXECUTION_AUTHORIZED not set');
  }
  if (!process.env.ANTHROPIC_API_KEY?.trim()) {
    blockers.push('ANTHROPIC_API_KEY not configured');
  }
  return {
    contextAssemblyAllowed: true,
    paidExecutionAllowed: blockers.length === 0,
    blockers,
  };
}
