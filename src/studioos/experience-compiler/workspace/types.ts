import type {
  AuthorityReview,
  CreativeExperienceConcept,
  CreativeExperienceConceptSet,
  CreativeExperienceGraph,
  Map2PipelineState,
  OpenArtAuthorityBatch,
  ProjectExperienceIntelligence,
  ProjectExperienceMode,
} from '../map2/map2Types';

export type { ProjectExperienceMode };

export type WorkspaceSection =
  | 'project'
  | 'concept'
  | 'experience'
  | 'families'
  | 'authority'
  | 'capabilities'
  | 'production'
  | 'history';

export type SonnetBatchStatus =
  | 'NOT_READY'
  | 'WAITING_FOR_ARCHITECTURE'
  | 'WAITING_FOR_FAMILY_APPROVAL'
  | 'WAITING_FOR_AUTHORITY'
  | 'WAITING_FOR_GENERATION'
  | 'WAITING_FOR_INGEST'
  | 'PACK_READY'
  | 'SONNET_READY'
  | 'SENT'
  | 'IMPLEMENTED';

export type HistoryEvent = {
  id: string;
  at: string;
  kind: string;
  detail: string;
};

export type IngestedAuthorityAsset = {
  asset_id: string;
  authority_id: string;
  candidate_id: string;
  generation_id: string;
  family_id: string;
  surface: string;
  version: number;
  canonical_filename: string;
  byte_length: number;
  storage_hint: string;
  superseded: boolean;
};

export type ExperienceCompilerWorkspaceState = {
  project_id: string;
  project_slug: string;
  project_name: string;
  mode: ProjectExperienceMode;
  pipeline: Map2PipelineState;
  concept_index: number;
  authority_review_index: number;
  custom_experiences_draft: CreativeExperienceGraph['custom_experiences'];
  authority_reviews: AuthorityReview[];
  ingested_assets: IngestedAuthorityAsset[];
  openart_emit_preview: OpenArtAuthorityBatch[] | null;
  history: HistoryEvent[];
  site00_authority_count: number | null;
  site00_authority_gaps: string[];
  sonnet_batch_status: Record<string, SonnetBatchStatus>;
};

export type WorkspaceMetrics = {
  experience_units: number;
  routes: number;
  families: number;
  custom_experiences: number;
  integrations: number;
  authorities_required: number;
  authorities_approved: number;
  screens_unlocked: number;
  sonnet_ready_batches: number;
  blocked_batches: number;
};

export type OpenArtEmitRecord = {
  batch_id: string;
  authority_id: string;
  family_id: string;
  surface: string;
  model_family: string;
  generation_mode: string;
  prompt: string;
  references: string[];
  aspect_ratio: string;
  resolution: string;
  output_format: string;
  dependency_order: number;
  expected_filename: string;
  candidate_version: number;
};

export type CompiledPackFile = {
  path: string;
  content: string;
  byte_length: number;
};

export type SonnetBatchEmit = {
  batch_id: string;
  json: Record<string, unknown>;
  markdown: string;
  sprint_prompt: string;
  status: SonnetBatchStatus;
};

export type PackSizeValidation = {
  total_bytes: number;
  total_mb: number;
  level: 'ok' | 'warn' | 'block';
  message: string;
};

export { type ProjectExperienceIntelligence, type CreativeExperienceConcept, type CreativeExperienceConceptSet };
