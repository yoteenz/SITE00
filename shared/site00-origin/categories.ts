/**
 * Generic Origin intake categories — project-type agnostic.
 * Client truth is stored with category in payload; not auto-promoted to canon.
 */

export const ORIGIN_CATEGORIES = [
  'PROJECT_OVERVIEW',
  'PROJECT_TYPE',
  'CURRENT_BRAND_STATE',
  'CLIENT_GOALS',
  'CLIENT_CONCEPT',
  'TARGET_USERS',
  'BUSINESS_MODEL',
  'ENVIRONMENT_CONCEPTS',
  'PLATFORM_CONCEPTS',
  'READER_MODEL',
  'CLIENT_FLOW',
  'PRODUCT_IDEAS',
  'MERCHANDISE_IDEAS',
  'SOURCE_REFERENCES',
  'CONSTRAINTS',
  'UNRESOLVED_DECISIONS',
] as const;

export type OriginCategory = (typeof ORIGIN_CATEGORIES)[number];

export const ORIGIN_SUMMARY_LABELS = [
  'CLIENT_CONFIRMED',
  'CLIENT_PROPOSED',
  'UNRESOLVED',
  'NOT_YET_EXPLORED',
] as const;

export type OriginSummaryLabel = (typeof ORIGIN_SUMMARY_LABELS)[number];

export const ORIGIN_INGESTION_SESSION_STATUSES = ['NOT_STARTED', 'IN_PROGRESS', 'INGESTED'] as const;
export type OriginIngestionSessionStatus = (typeof ORIGIN_INGESTION_SESSION_STATUSES)[number];

export const SOURCE_REFERENCE_TYPES = [
  'CLIENT_CREATED_CONCEPT_ART',
  'UPLOADED_DOCUMENT',
  'UPLOADED_IMAGE',
  'EXTERNAL_REFERENCE',
  'FOUNDER_NOTE',
  'CONVERSATION_TRANSCRIPT',
] as const;

export type SourceReferenceType = (typeof SOURCE_REFERENCE_TYPES)[number];
