export const GENERATION_MODES = ['REFERENCE_GUIDED', 'TEXT_TO_IMAGE_NET_NEW'] as const;
export type GenerationMode = (typeof GENERATION_MODES)[number];

export const GENERATION_INTENTS = [
  'DERIVED',
  'NEW_AUTHORITY_REQUIRED',
  'NEW_ASSET_REQUIRED',
  'RECOVERY',
  'LEGACY_UNKNOWN',
] as const;
export type GenerationIntent = (typeof GENERATION_INTENTS)[number];

export const AUTHORITY_STATUSES = [
  'CANONICAL',
  'APPROVED',
  'IN_REVIEW',
  'PROVISIONAL_DERIVED',
  'REFERENCE_ONLY',
  'SUPERSEDED',
  'INVALID',
] as const;
export type AuthorityStatus = (typeof AUTHORITY_STATUSES)[number];

export const BLOCKED_REASONS = [
  'REFERENCE_MISSING',
  'REFERENCE_BINDING_FAILURE_PREVENTED',
  'INVALID_GENERATION_MODE',
  'CROSS_PROJECT_REFERENCE_DENIED',
  'PROVIDER_REFERENCE_UNSUPPORTED',
  'REFERENCE_FILE_CORRUPT',
  'REFERENCE_RESOLUTION_FAILED',
  'SUPERSEDED_REFERENCE_WHEN_CANONICAL_EXISTS',
  'SILENT_FALLBACK_ATTEMPT',
  'FAMILY_PROJECT_REQUIRED',
  'FAMILY_PROJECT_MISMATCH',
  'CROSS_FAMILY_PLATE_REUSE_UNJUSTIFIED',
  'FAMILY_EXPRESSION_BRIEF_REQUIRED',
  'FAMILY_EXPRESSION_GATE_FAILED',
  'HIERARCHICAL_EXPRESSION_REQUIRED',
  'PLATE_OCCUPANCY_REQUIRED',
  'AUTHORITY_FIRST_REQUIRED',
] as const;
export type BlockedReason = (typeof BLOCKED_REASONS)[number];

export const GENERATION_CLASSES = [
  'SCREEN_PARENT',
  'SCREEN_CHILD',
  'SCREEN_GRANDCHILD',
  'STATE_AUTHORITY',
  'INTERACTION_AUTHORITY',
  'ENVIRONMENT_PLATE',
  'BOTANICAL',
  'BRAND_LOCKUP',
  'MATERIAL',
  'OBJECT',
  'ICON',
  'DECORATIVE',
  'ILLUSTRATION',
  'SPECIAL_PANEL',
  'SPECIAL_CONTROL',
  'SIDEKICK_DERIVED',
  'NET_NEW_AUTHORITY',
] as const;
export type GenerationClass = (typeof GENERATION_CLASSES)[number];

export type ReferenceBindingPolicyFlag = 'REQUIRED_WHEN_AVAILABLE';

export type ResolvedReference = {
  referenceAuthorityId: string;
  referencePath: string | null;
  referenceStatus: AuthorityStatus;
  referenceLineage: string[];
  projectId: string;
  sharedGlobal: boolean;
  referenceFound: true;
};

export type ReferenceFileHealth = {
  exists: boolean;
  readable: boolean;
  supportedFormat: boolean;
  nonZeroByte: boolean;
  ok: boolean;
};

export type GenerationRequest = {
  visualId: string;
  projectId: string;
  familyId: string;
  screenId?: string | null;
  assetId?: string | null;
  generationClass: GenerationClass;
  generationIntent: GenerationIntent;
  generationMode: GenerationMode;
  referenceAuthorityIdHint?: string | null;
  referenceInputAttached?: boolean;
  provider: string;
  model: string;
  /** Provider project this job must land in. One project per family. */
  providerProjectId?: string | null;
  estimatedCostCredits?: number | null;
  /** Same-session outputs that may bind as references after parent gate. */
  sessionReferences?: readonly SessionReferenceOutput[];
  /**
   * Set only when this environment plate is taken from another family.
   * A new family defaults to a new plate and leaves this empty.
   */
  sourcePlateFamilyId?: string | null;
  /** Required when sourcePlateFamilyId names a different family. Narrative, continuation, or budget. */
  crossFamilyReuseJustification?: string | null;
  /**
   * Environment plates are derived from a full page. A plate with no full-page
   * source is a standalone background and is blocked.
   */
  derivationSourceType?: 'FULL_PAGE' | null;
};

export type SessionReferenceOutput = {
  visualId: string;
  projectId: string;
  familyId: string;
  authorityId: string;
  path: string;
  status: AuthorityStatus;
};

export type ClassifiedGenerationRequest = GenerationRequest & {
  referenceRequired: boolean;
};

export type ReferenceBindingValidation = {
  status: 'PASS' | 'BLOCKED';
  dispatchAllowed: boolean;
  blockedReason: BlockedReason | null;
  referenceRequired: boolean;
  referenceFound: boolean;
  referenceAttached: boolean;
  generationMode: GenerationMode;
  resolvedReference: ResolvedReference | null;
  referencePath: string | null;
  referenceAuthorityId: string | null;
  referenceStatus: AuthorityStatus | null;
  creditsSpent: number;
};

export type PrecheckResult = ReferenceBindingValidation & {
  classification: ClassifiedGenerationRequest;
};

export type ProviderCapability = {
  supportsReferenceInput: boolean;
};

export type ReferenceRegistryEntry = {
  authorityId: string;
  projectId: string;
  status: AuthorityStatus;
  paths: readonly string[];
  sharedGlobal?: boolean;
  familyId?: string | null;
  screenId?: string | null;
  visualId?: string | null;
};
