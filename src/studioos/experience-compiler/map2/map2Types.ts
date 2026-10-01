/** MAP2 — Creative experience architecture domain types (extends MAP1, project-agnostic). */

export type ProjectExperienceMode = 'GREENFIELD' | 'INGEST' | 'HYBRID';

export type ExperienceSurface = 'MOBILE_WEB' | 'TABLET_WEB' | 'DESKTOP_WEB' | 'APP';

export type AppRelationship =
  | 'NOT_REQUIRED'
  | 'FUTURE'
  | 'COMPANION'
  | 'PRIMARY'
  | 'FULL_PARITY'
  | 'APP_SPECIFIC_EXPERIENCE';

export type ExperienceUnitKind =
  | 'STANDARD_PAGE'
  | 'ENTRY'
  | 'HUB'
  | 'ROUTE_SELECTOR'
  | 'CONTENT'
  | 'WORKFLOW'
  | 'MULTI_STEP_FLOW'
  | 'CONFIGURATOR'
  | 'DIAGNOSTIC'
  | 'RECOMMENDATION_ENGINE'
  | 'INTERACTIVE_TOOL'
  | 'CUSTOM_EXPERIENCE'
  | 'IMMERSIVE_EXPERIENCE'
  | 'TRANSACTION_FLOW'
  | 'DASHBOARD'
  | 'PORTAL'
  | 'CONTENT_SYSTEM'
  | 'COMMERCE_EXPERIENCE'
  | 'BOOKING_EXPERIENCE'
  | 'MEMBERSHIP_EXPERIENCE'
  | 'INTEGRATION'
  | 'CAPABILITY_INSTALL'
  | 'REPAIR_WORKFLOW'
  | 'EXTERNAL_LOCATION'
  | 'SYSTEM_UTILITY';

export type GateStatus = 'PENDING' | 'APPROVED' | 'AMENDED' | 'DEFERRED' | 'REJECTED';

export type ConceptDirectionAction =
  | 'SELECT'
  | 'AMEND'
  | 'EXPAND'
  | 'PUSH_CONCEPTUALLY'
  | 'HYBRIDIZE'
  | 'REQUEST_ANOTHER'
  | 'REJECT'
  | 'DEFER';

export type ExperienceGraphAction =
  | 'APPROVE'
  | 'AMEND'
  | 'ADD'
  | 'REMOVE'
  | 'MERGE'
  | 'SPLIT'
  | 'EXPAND'
  | 'PUSH_CONCEPTUALLY'
  | 'DEFER';

export type AuthorityReviewStatus =
  | 'PLANNED'
  | 'PROMPT_READY'
  | 'GENERATING'
  | 'READY_FOR_REVIEW'
  | 'LOVE_IT'
  | 'REFINE'
  | 'REGENERATE'
  | 'WRONG_DIRECTION'
  | 'COMBINED'
  | 'APPROVED'
  | 'SUPERSEDED'
  | 'DEFERRED';

export type VisualAuthorityGateStatus = 'NOT_READY' | 'IN_REVIEW' | 'PARTIAL' | 'APPROVED';

export type CapabilityLifecycleStage =
  | 'PROJECT_LOCAL'
  | 'REUSABLE_CANDIDATE'
  | 'CATALOG_CAPABILITY'
  | 'INTEGRATION_READY';

export type ProjectExperienceIntelligence = {
  project_id: string;
  brand_name: string;
  business_model: string;
  audience: string[];
  products_services: string[];
  revenue_model: string;
  founder_goals: string[];
  creative_appetite: 'CONSERVATIVE' | 'BALANCED' | 'AMBITIOUS';
  competitive_context: string;
  constraints: string[];
  references: string[];
  boundaries: string[];
  app_intent: AppRelationship;
  raw_notes: string;
};

export type CreativeExperienceConcept = {
  concept_id: string;
  name: string;
  one_line_premise: string;
  experience_thesis: string;
  customer_entry_model: string;
  journey_model: string;
  primary_zones: string[];
  proposed_routes_high_level: string[];
  custom_experiences: string[];
  commerce_model: string;
  content_model: string;
  membership_model: string;
  interaction_model: string;
  spatial_model: string;
  mobile_premise: string;
  tablet_premise: string;
  desktop_premise: string;
  app_premise: string;
  integration_opportunities: string[];
  capability_opportunities: string[];
  brand_alignment: string;
  business_alignment: string;
  risks: string[];
  tradeoffs: string[];
  novelty: string;
  future_expansion: string[];
  status: 'DRAFT' | 'PUSHED_V2' | 'HYBRID' | 'SELECTED' | 'REJECTED';
  lineage_parent_id: string | null;
};

export type CreativeExperienceConceptSet = {
  project_id: string;
  concepts: CreativeExperienceConcept[];
  generated_at: string;
};

export type ConceptDirectionGate = {
  gate_id: 'GATE_0_CONCEPT_DIRECTION';
  status: GateStatus;
  selected_concept_id: string | null;
  hybrid?: {
    base_direction: string;
    borrowed_elements: string[];
    rejected_elements: string[];
    hybrid_reasoning: string;
    resulting_concept_id: string;
  };
  history: { action: ConceptDirectionAction; at: string; detail: string }[];
};

export type ExperienceRouteNode = {
  route_id: string;
  route: string;
  parent: string | null;
  children: string[];
  experience_unit: ExperienceUnitKind;
  family: string;
  purpose: string;
  primary_user: string;
  business_role: string;
  conversion_role: string;
  priority: 'P0' | 'P1' | 'P2' | 'FUTURE';
  launch_phase: 'LAUNCH' | 'PHASE_2' | 'EXPERIMENTAL';
};

export type CreativeExperienceGraph = {
  project_id: string;
  concept_id: string;
  nodes: ExperienceRouteNode[];
  custom_experiences: CustomExperienceDefinition[];
  integrations: IntegrationOpportunity[];
  expansion_proposals: ExpansionProposal[];
  approved: boolean;
};

export type ExpansionProposal = {
  id: string;
  title: string;
  classification: 'HIGH_VALUE_NOW' | 'HIGH_VALUE_LATER' | 'EXPERIMENTAL' | 'PREMIUM_ADD_ON' | 'CUSTOM_CAPABILITY' | 'APP_SPECIFIC' | 'FUTURE_IMMERSIVE';
  description: string;
};

export type ExperienceArchitectureGate = {
  gate_id: 'GATE_A_EXPERIENCE_ARCHITECTURE';
  status: GateStatus;
  history: { action: ExperienceGraphAction; at: string; detail: string }[];
};

export type ExperienceFamily = {
  family_id: string;
  name: string;
  grammar_description: string;
  experience_unit_kinds: ExperienceUnitKind[];
  route_ids: string[];
  inheritance_layers: Record<string, string>;
};

export type CustomExperienceDefinition = {
  custom_experience_id: string;
  name: string;
  description: string;
  business_purpose: string;
  states: string[];
  inherits_from: string[];
  new_family_id: string | null;
  capability_candidate: boolean;
};

export type FamilySurfaceExpression = {
  family_id: string;
  surface: ExperienceSurface;
  composition_model: string;
  navigation_model: string;
  information_density: 'LOW' | 'MEDIUM' | 'HIGH';
  interaction_model: string;
  responsive_relationship: 'SAME_EXPERIENCE_ADAPTED' | 'SAME_FAMILY_DIFFERENT_COMPOSITION' | 'DEVICE_SPECIFIC';
  mobile_authority_required: boolean;
  tablet_strategy: 'DERIVED_FROM_MOBILE' | 'DERIVED_FROM_DESKTOP' | 'HYBRID_LAYOUT' | 'TABLET_SPECIFIC';
  desktop_authority_required: boolean;
  app_relationship: AppRelationship;
};

export type FamilySurfaceGate = {
  gate_id: 'GATE_B_FAMILY_SURFACE';
  status: GateStatus;
  approved_family_ids: string[];
  history: { action: string; at: string; detail: string }[];
};

export type AuthorityPlanEntry = {
  authority_id: string;
  experience_unit: ExperienceUnitKind;
  family_id: string;
  archetype: string;
  surface: ExperienceSurface;
  screen_or_state: string;
  routes_unlocked: number;
  states_unlocked: number;
  surfaces_unlocked: ExperienceSurface[];
  inheritance: Record<string, string>;
  new_grammar: boolean;
  visual_objective: string;
  interaction_objective: string;
  generation_prompt: string;
  approval_status: AuthorityReviewStatus;
};

export type AuthorityReview = {
  authority_id: string;
  candidate_id: string;
  generation_id: string;
  version: number;
  surface: ExperienceSurface;
  status: AuthorityReviewStatus;
  founder_judgment: string | null;
  feedback: string | null;
  parent_candidate: string | null;
  combined_from: string[];
  approved_as_family_authority: boolean;
  approved_at: string | null;
  superseded_by: string | null;
};

export type VisualAuthorityGate = {
  gate_id: 'GATE_C_VISUAL_AUTHORITY';
  status: VisualAuthorityGateStatus;
};

export type OpenArtAuthorityBatch = {
  batch_id: string;
  project_id: string;
  family_id: string;
  surface: ExperienceSurface;
  authorities: string[];
  model: string;
  generation_mode: 'SEQUENTIAL_DEPENDENT' | 'PARALLEL_INDEPENDENT';
  prompts: Record<string, string>;
  aspect_ratios: Record<string, string>;
  expected_filenames: string[];
  dependency_order: string[];
};

export type AuthorityPackManifest = {
  project_id: string;
  pack_version: string;
  authorities: { authority_id: string; filename: string; surface: ExperienceSurface; family_id: string }[];
  lite_pack_target_mb: number;
};

export type CapabilityRecord = {
  capability_id: string;
  family_id: string;
  name: string;
  description: string;
  origin_project: string;
  origin_experience: string;
  interaction_grammar: string;
  maturity: CapabilityLifecycleStage;
  reusability: 'FUNCTIONAL_ONLY' | 'VISUAL_ISOLATED';
};

export type IntegrationOpportunity = {
  integration: string;
  reason: string;
  experience_enabled: string;
  routes_affected: string[];
  required_or_optional: 'REQUIRED' | 'OPTIONAL';
  launch_or_future: 'LAUNCH' | 'FUTURE';
};

export type Map2PipelineState = {
  mode: ProjectExperienceMode;
  intelligence: ProjectExperienceIntelligence | null;
  concept_set: CreativeExperienceConceptSet | null;
  gate_0: ConceptDirectionGate;
  graph: CreativeExperienceGraph | null;
  gate_a: ExperienceArchitectureGate;
  families: ExperienceFamily[];
  surface_expressions: FamilySurfaceExpression[];
  gate_b: FamilySurfaceGate;
  authority_plan: AuthorityPlanEntry[];
  gate_c: VisualAuthorityGate;
  openart_batches: OpenArtAuthorityBatch[];
  authority_pack: AuthorityPackManifest | null;
  capabilities: CapabilityRecord[];
};
