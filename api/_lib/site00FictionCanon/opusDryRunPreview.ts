import { FICTION_EVALUATION_OUTPUT_SECTIONS } from '../../../shared/site00-fiction-canon/types.js';
import { FOUNDER_BIBLE_COMPLETENESS_TYPES } from '../../../shared/site00-fiction-canon/constants.js';
import {
  isFictionOpusExecutionAuthorized,
  resolveFictionOpusModelId,
} from '../../../shared/site00-fiction-canon/opusModel.js';
import { isAnthropicConfigured } from '../site00Evolve/creativeDirection/creativeIntelligence/config.js';
import { assembleFictionEvaluationContext, buildStructuredContextPayload } from './contextAssembly.js';
import { getFictionPropertyBySlug, listFictionDocuments } from './fictionCanonStore.js';
import { assessOpusExecutionReadiness } from './readinessReport.js';
import { fictionCanonTablesExist } from './supabaseFictionStore.js';

export type OpusDryRunPreview = {
  propertySlug: string;
  propertyId: string;
  approvedBibleVersionFingerprint: string;
  sourceInventory: Array<{
    stableIdentifier: string;
    documentType: string;
    canonStatus: string;
    sourceId: string;
  }>;
  coverageSummary: {
    presentTypes: string[];
    missingTypes: string[];
    founderPackageDetected: boolean;
    orientationSeedOnly: boolean;
  };
  contextPartition: {
    documentCount: number;
    retrievalOmissions: string[];
    incompleteContext: boolean;
    payloadByteEstimate: number;
  };
  evaluationDimensions: string[];
  outputSchemaSections: readonly string[];
  missingSourceWarnings: string[];
  execution: {
    paidImplementationStatus: 'NOT_IMPLEMENTED_THIS_SPRINT';
    authorized: boolean;
    anthropicConfigured: boolean;
    modelResolved: string;
  };
  opusReadinessVerdict: 'READY_FOR_DRY_RUN' | 'BLOCKED_MISSING_SOURCE' | 'BLOCKED_NO_FOUNDER_PACKAGE';
};

const EVALUATION_DIMENSIONS = [
  'Originality',
  'Narrative coherence',
  'Character psychology',
  'Emotional depth',
  'Family mythology',
  'Alternate-history plausibility',
  'Speculative technology consistency',
  'Institutional credibility',
  'Episodic originality',
  'Three-part storytelling',
  'Serialized reveal pacing',
  'Humor and tonal range',
  'Romance progression',
  'Audience attachment',
  'Long-term narrative sustainability',
  'Production feasibility',
];

export async function buildOpusDryRunPreview(propertySlug: string): Promise<OpusDryRunPreview | null> {
  const property = await getFictionPropertyBySlug(propertySlug);
  if (!property) return null;

  const allDocs = await listFictionDocuments(property.id);
  const active = allDocs.filter((d) => d.canonStatus !== 'SUPERSEDED' && d.canonStatus !== 'REJECTED');
  const founderPackageDetected = active.some((d) =>
    d.sourceProvenance.sourceId.startsWith('founder-bible-v1'),
  );
  const orientationSeedOnly =
    active.length > 0 && active.every((d) => d.sourceProvenance.sourceKind === 'SEED_ORIENTATION');

  const assembly = await assembleFictionEvaluationContext(property.id);
  const payload = buildStructuredContextPayload(assembly);
  const payloadByteEstimate = Buffer.byteLength(JSON.stringify(payload), 'utf8');

  const presentTypes = [...new Set(active.map((d) => d.documentType))];
  const missingTypes = FOUNDER_BIBLE_COMPLETENESS_TYPES.filter((t) => !presentTypes.includes(t));

  const missingSourceWarnings = [...assembly.missingRequiredTypes.map((t) => `Missing minimum type: ${t}`)];
  if (!founderPackageDetected) {
    missingSourceWarnings.push('Founder bible package (founder-bible-v1) not detected in active documents.');
  }
  if (orientationSeedOnly) {
    missingSourceWarnings.push('Only orientation seed present — do not substitute for full bible.');
  }

  const exec = assessOpusExecutionReadiness();
  let verdict: OpusDryRunPreview['opusReadinessVerdict'] = 'READY_FOR_DRY_RUN';
  if (assembly.missingRequiredTypes.length > 0) verdict = 'BLOCKED_MISSING_SOURCE';
  else if (!founderPackageDetected) verdict = 'BLOCKED_NO_FOUNDER_PACKAGE';

  return {
    propertySlug: property.slug,
    propertyId: property.id,
    approvedBibleVersionFingerprint: assembly.approvedBibleVersionFingerprint,
    sourceInventory: active.map((d) => ({
      stableIdentifier: d.stableIdentifier,
      documentType: d.documentType,
      canonStatus: d.canonStatus,
      sourceId: d.sourceProvenance.sourceId,
    })),
    coverageSummary: {
      presentTypes,
      missingTypes,
      founderPackageDetected,
      orientationSeedOnly,
    },
    contextPartition: {
      documentCount: assembly.documents.length,
      retrievalOmissions: assembly.retrievalOmissions,
      incompleteContext: assembly.incompleteContext,
      payloadByteEstimate,
    },
    evaluationDimensions: EVALUATION_DIMENSIONS,
    outputSchemaSections: FICTION_EVALUATION_OUTPUT_SECTIONS,
    missingSourceWarnings,
    execution: {
      paidImplementationStatus: 'NOT_IMPLEMENTED_THIS_SPRINT',
      authorized: isFictionOpusExecutionAuthorized() && exec.paidExecutionAllowed,
      anthropicConfigured: isAnthropicConfigured(),
      modelResolved: resolveFictionOpusModelId(),
    },
    opusReadinessVerdict: verdict,
  };
}

export async function assessPersistenceLayer(): Promise<{
  localIngestValidated: boolean;
  stagingPersistenceValidated: boolean;
  productionPersistenceValidated: boolean;
  storeMode: string;
  fictionTablesExist: boolean | null;
  notes: string[];
}> {
  const notes: string[] = [];
  let tablesExist: boolean | null = null;
  try {
    tablesExist = await fictionCanonTablesExist();
    if (tablesExist) {
      notes.push('Supabase fiction canon tables reachable from this environment.');
    } else {
      notes.push('Supabase fiction canon tables not present — writes fall back to memory store.');
    }
  } catch {
    tablesExist = null;
    notes.push('Supabase admin unavailable in this environment.');
  }

  return {
    localIngestValidated: true,
    stagingPersistenceValidated: false,
    productionPersistenceValidated: false,
    storeMode: 'memory-unless-supabase-tables',
    fictionTablesExist: tablesExist,
    notes,
  };
}
