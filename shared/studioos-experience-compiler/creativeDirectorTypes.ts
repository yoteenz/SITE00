/** Studio OS Experience Compiler — CGPT Creative Director loop (MAP2 extension). */

export type CreativeDirectorTaskMode =
  | 'CONCEPT_TERRITORIES'
  | 'EXPERIENCE_ARCHITECTURE'
  | 'EXPERIENCE_GRAPH'
  | 'FAMILY_ARCHITECTURE'
  | 'SURFACE_EXPRESSION'
  | 'AUTHORITY_BRIEF'
  | 'CREATIVE_CRITIQUE'
  | 'FOUNDER_REVISION'
  | 'HYBRIDIZE_TERRITORIES'
  | 'AUTHORITY_GAP_ANALYSIS';

export type CreativeRunStatus =
  | 'READY'
  | 'COMPILING_CONTEXT'
  | 'RUNNING'
  | 'AWAITING_FOUNDER'
  | 'APPROVED'
  | 'REVISION_REQUESTED'
  | 'FAILED'
  | 'FAILED_VALIDATION'
  | 'SUPERSEDED';

export type CreativeArtifactApprovalState =
  | 'DRAFT'
  | 'AWAITING_FOUNDER'
  | 'APPROVED'
  | 'AMEND_REQUESTED'
  | 'REJECTED'
  | 'SUPERSEDED'
  | 'DEFERRED';

export type FounderJudgmentAction =
  | 'LOVE_IT'
  | 'PROMISING'
  | 'TOO_CLOSE'
  | 'WRONG_DIRECTION'
  | 'PUSH_FURTHER'
  | 'REGENERATE'
  | 'COMBINE_WITH'
  | 'MAKE_FAMILY_AUTHORITY'
  | 'NEEDS_ANOTHER_STATE'
  | 'REMOVE'
  | 'DEFER'
  | 'AMEND'
  | 'EXPAND'
  | 'HYBRIDIZE';

export type ExperienceSurfaceKind =
  | 'MOBILE_WEB'
  | 'TABLET_WEB'
  | 'DESKTOP_WEB'
  | 'CLIENT_APP_MOBILE'
  | 'CLIENT_APP_TABLET';

export type FounderJudgment = {
  judgment_id: string;
  artifact_id: string;
  thread_id: string;
  project_id: string;
  action: FounderJudgmentAction;
  founder_note: string;
  preserve: string[];
  reject: string[];
  combine_with: string | null;
  requested_change: string;
  created_at: string;
};

export type ContextManifestSection = {
  key: string;
  byte_estimate: number;
  source: string;
  locked: boolean;
};

export type CreativeContextPack = {
  context_pack_id: string;
  project_id: string;
  thread_id: string;
  compiled_at: string;
  core_context: Record<string, unknown>;
  task_relevant_context: Record<string, unknown>;
  current_creative_thread: Record<string, unknown>;
  locked_decisions: string[];
  recent_founder_feedback: FounderJudgment[];
  visual_authority_references: string[];
  rejected_directions: string[];
  manifest: ContextManifestSection[];
};

export type ConceptTerritoryArtifact = {
  territory_id: string;
  name: string;
  core_idea: string;
  spatial_metaphor: string;
  emotional_objective: string;
  experience_logic: string;
  information_architecture: string;
  interaction_language: string;
  visual_language: string;
  mobile_expression: string;
  tablet_expression: string;
  desktop_expression: string;
  app_expression: string;
  image_authority_needs: string[];
  live_code_needs: string[];
  risks: string[];
  failure_conditions: string[];
  project_alignment: string;
};

export type ConceptTerritoriesOutput = {
  task_mode: 'CONCEPT_TERRITORIES';
  territories: ConceptTerritoryArtifact[];
  creative_rationale: string;
};

export type CreativeArtifact = {
  artifact_id: string;
  thread_id: string;
  project_id: string;
  task_mode: CreativeDirectorTaskMode;
  context_pack_id: string;
  model: string;
  parent_artifact_ids: string[];
  founder_judgment_ids: string[];
  created_at: string;
  approval_state: CreativeArtifactApprovalState;
  superseded_by: string | null;
  payload: Record<string, unknown>;
};

export type CreativeThreadMessage = {
  message_id: string;
  role: 'founder' | 'system' | 'creative_director';
  text: string;
  created_at: string;
  run_id: string | null;
};

export type CreativeThread = {
  thread_id: string;
  project_id: string;
  project_slug: string;
  title: string;
  task_mode: CreativeDirectorTaskMode;
  created_at: string;
  updated_at: string;
  messages: CreativeThreadMessage[];
  artifacts: CreativeArtifact[];
  judgments: FounderJudgment[];
  active_artifact_id: string | null;
  run_status: CreativeRunStatus;
  last_context_pack_id: string | null;
  downstream_readiness: {
    visual_authority_model: boolean;
    sonnet: boolean;
    opus: boolean;
    asset_surgery: boolean;
    composer: boolean;
  };
};

export type CreativeDirectorRunRecord = {
  run_id: string;
  thread_id: string;
  project_id: string;
  task_mode: CreativeDirectorTaskMode;
  context_pack_id: string;
  model: string;
  reasoning_level: string | null;
  status: CreativeRunStatus;
  started_at: string;
  finished_at: string | null;
  input_token_estimate: number | null;
  output_token_estimate: number | null;
  run_count_for_thread: number;
  artifact_id: string | null;
  validation_error: string | null;
  raw_response_storage_key: string | null;
};

export type ModelRuntimeBlocked = {
  code: 'MODEL_RUNTIME_BLOCKED';
  missing: string[];
  message: string;
};

export type CreativeDirectorRunResult =
  | { ok: true; run: CreativeDirectorRunRecord; artifact: CreativeArtifact; context_pack: CreativeContextPack }
  | { ok: false; blocked: ModelRuntimeBlocked }
  | { ok: false; run: CreativeDirectorRunRecord; validation_error: string };

export type VisualAuthorityModelHandoff = {
  role: 'VISUAL_AUTHORITY_MODEL';
  intended_model_slot: 'GPT2';
  creative_direction_authority: Record<string, unknown>;
  approved_territory: ConceptTerritoryArtifact | null;
  approved_experience_graph: Record<string, unknown> | null;
  approved_family_architecture: Record<string, unknown> | null;
  surface_expression_brief: Record<string, unknown> | null;
  reference_images: string[];
  brand_assets: string[];
  composition_requirements: string[];
  continuity_requirements: string[];
  founder_constraints: string[];
};

export type SonnetImplementationHandoff = {
  route_state_graph: Record<string, unknown>;
  family_definitions: Record<string, unknown>;
  responsive_expressions: Record<string, unknown>;
  approved_visual_authorities: string[];
  functional_contracts: Record<string, unknown>;
  asset_slots: string[];
  live_code_ownership: string[];
  locked_founder_decisions: string[];
};

export type OpusVisualHandoff = {
  visual_authority_pack: Record<string, unknown>;
  sonnet_implementation: SonnetImplementationHandoff;
  family_rules: string[];
  responsive_rules: string[];
  locked_functionality: string[];
  allowed_visual_dom_css_changes: string[];
  prohibited_changes: string[];
};

export type WorkspaceCreativeDirectorSnapshot = {
  project_id: string;
  project_slug: string;
  project_name: string;
  mode: 'GREENFIELD' | 'INGEST' | 'HYBRID';
  phase_label: string;
  approved_authority_count: number;
  open_founder_gates: string[];
  active_experience_family: string | null;
  production_stage: string;
  intelligence_summary: Record<string, unknown>;
  pipeline_summary: Record<string, unknown>;
};
