/** THE EXCHANGE and future serialized-fiction properties — canon types. */

export const FICTION_CANON_SCHEMA_VERSION = '1.0.0' as const;

export const FICTION_PROPERTY_SLUG_THE_EXCHANGE = 'the-exchange' as const;

export type FictionPropertySlug = typeof FICTION_PROPERTY_SLUG_THE_EXCHANGE;

export type FictionPropertyType = 'SERIALIZED_FICTION';

export type FictionOwnership = 'FOUNDER_CONTROLLED';

export const FICTION_DOCUMENT_TYPES = [
  'SERIES_BIBLE',
  'WORLD_BIBLE',
  'CHARACTER_BIBLE',
  'FAMILY_HISTORY',
  'INSTITUTION_BIBLE',
  'TECHNOLOGY_BIBLE',
  'NARRATIVE_METHODOLOGY',
  'SEASON_ARCHITECTURE',
  'EPISODE_CONCEPT',
  'CONTINUITY_LEDGER',
  'AUDIENCE_KNOWLEDGE',
  'VISUAL_IDENTITY_REFERENCE',
  'COMMERCIAL_STRATEGY',
  'OPEN_QUESTIONS',
  'SOURCE_PACKAGE_README',
] as const;

export type FictionDocumentType = (typeof FICTION_DOCUMENT_TYPES)[number];

export const FICTION_CANON_STATUSES = [
  'APPROVED_CANON',
  'WORKING_CONCEPT',
  'PROPOSED',
  'UNRESOLVED',
  'REJECTED',
  'SUPERSEDED',
] as const;

export type FictionCanonStatus = (typeof FICTION_CANON_STATUSES)[number];

export const FICTION_APPROVAL_STATUSES = [
  'FOUNDER_APPROVED',
  'PENDING_REVIEW',
  'FOUNDER_REJECTED',
  'DEFERRED',
] as const;

export type FictionApprovalStatus = (typeof FICTION_APPROVAL_STATUSES)[number];

export const VISUAL_REFERENCE_STATUSES = [
  'CASTING_EXPLORATION',
  'WORKING_REFERENCE',
  'FOUNDER_APPROVED_IDENTITY',
  'SUPERSEDED_REFERENCE',
  'AWAITING_FOUNDER_ASSET',
  'FOUNDER_SELECTED_REFERENCE',
] as const;

export type VisualReferenceStatus = (typeof VISUAL_REFERENCE_STATUSES)[number];

export type FictionCanonDocumentRecord = {
  schemaVersion: typeof FICTION_CANON_SCHEMA_VERSION;
  id: string;
  propertyId: string;
  propertySlug: FictionPropertySlug | string;
  documentType: FictionDocumentType;
  stableIdentifier: string;
  version: number;
  title: string;
  content: Record<string, unknown>;
  sourceProvenance: {
    sourceId: string;
    sourceKind: 'FOUNDER_MARKDOWN' | 'FOUNDER_JSON' | 'SEED_ORIENTATION' | 'IMPORT_BATCH';
    importedAt: string;
    importer?: string;
  };
  canonStatus: FictionCanonStatus;
  approvalStatus: FictionApprovalStatus;
  supersededByDocumentId: string | null;
  supersedesDocumentId: string | null;
  characterReferences: string[];
  worldReferences: string[];
  /** Original imported text when normalized content differs. */
  sourceTextOriginal: string | null;
  contentHash: string;
  /** WORLD_TRUTH | CHARACTER_BELIEF | AUDIENCE_KNOWLEDGE when applicable */
  knowledgeLayer: 'WORLD_TRUTH' | 'CHARACTER_BELIEF' | 'AUDIENCE_KNOWLEDGE' | 'UNSPECIFIED';
  visualReferenceStatus?: VisualReferenceStatus;
  createdAt: string;
  updatedAt: string;
};

export type FictionPropertyRecord = {
  id: string;
  slug: FictionPropertySlug | string;
  displayName: string;
  propertyType: FictionPropertyType;
  ownership: FictionOwnership;
  productionIntegration: 'FUTURE_NDXBOOK_REUSE';
  registeredAt: string;
  metadata: Record<string, unknown>;
};

export type FictionIngestImportItem = {
  sourceId: string;
  documentType: FictionDocumentType;
  stableIdentifier: string;
  title?: string;
  format: 'json' | 'markdown';
  payload: string | Record<string, unknown>;
  canonStatus: FictionCanonStatus;
  approvalStatus: FictionApprovalStatus;
  knowledgeLayer?: FictionCanonDocumentRecord['knowledgeLayer'];
  characterReferences?: string[];
  worldReferences?: string[];
  visualReferenceStatus?: VisualReferenceStatus;
  /** When true, import fails if an APPROVED_CANON doc exists for same stable id. */
  allowSupersede?: boolean;
};

export type FictionIngestBatch = {
  propertySlug: string;
  imports: FictionIngestImportItem[];
  idempotencyKey?: string;
};

export type FictionIngestResult =
  | { ok: true; created: FictionCanonDocumentRecord[]; skipped: string[]; warnings: string[] }
  | { ok: false; error: string; blockedReason?: string };

export const FICTION_EVALUATION_OUTPUT_SECTIONS = [
  'EXECUTIVE_ASSESSMENT',
  'SERIES_STRENGTHS',
  'NARRATIVE_WEAKNESSES',
  'WORLD_CONSISTENCY_FINDINGS',
  'CHARACTER_FINDINGS',
  'FAMILY_MYSTERY_FINDINGS',
  'EPISODE_ARCHITECTURE_FINDINGS',
  'TECHNOLOGY_FINDINGS',
  'THREE_PART_FORMAT_FINDINGS',
  'AUDIENCE_EXPERIENCE_FINDINGS',
  'PROPOSED_IMPROVEMENTS',
  'ALTERNATIVE_DIRECTIONS',
  'CANON_CONFLICTS',
  'OPEN_CREATIVE_QUESTIONS',
  'PRODUCTION_IMPLICATIONS',
] as const;

export type FictionEvaluationOutputSection = (typeof FICTION_EVALUATION_OUTPUT_SECTIONS)[number];

export type FictionEvaluationRecommendation = {
  recommendationId: string;
  section: FictionEvaluationOutputSection;
  existingApprovedFact: string | null;
  evidenceFromBible: string;
  problemIdentified: string;
  proposedImprovement: string;
  expectedBenefit: string;
  tradeoffs: string;
  founderApprovalRequired: boolean;
  reviewDecision: 'PENDING' | 'APPROVE' | 'REJECT' | 'REQUEST_REVISION' | 'DEFER';
};

export type FictionPremiseEvaluationRecord = {
  evaluationId: string;
  propertyId: string;
  propertySlug: string;
  approvedBibleVersionFingerprint: string;
  modelRequested: string;
  modelResolved: string;
  dryRun: boolean;
  executed: boolean;
  status: 'READY' | 'BLOCKED_MISSING_SOURCE' | 'BLOCKED_UNAUTHORIZED' | 'COMPLETED' | 'DRY_RUN_PLAN';
  contextAssembly: {
    documentCount: number;
    missingRequiredTypes: FictionDocumentType[];
    retrievalOmissions: string[];
    incompleteContext: boolean;
  };
  output: Partial<Record<FictionEvaluationOutputSection, string>> | null;
  recommendations: FictionEvaluationRecommendation[];
  createdAt: string;
};

export type FictionEvaluationReviewInput = {
  evaluationId: string;
  recommendationId: string;
  decision: 'APPROVE' | 'REJECT' | 'REQUEST_REVISION' | 'DEFER';
  note?: string;
  actorId: string;
};
