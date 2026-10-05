/** Studio OS — Experience Compiler domain types (project-agnostic). */

export type DerivationClassification =
  | 'DIRECTLY_COVERED'
  | 'DERIVABLE'
  | 'COMPOSITE_DERIVABLE'
  | 'CREATIVE_AUTHORITY_REQUIRED';

export type DerivationConfidence = 'HIGH' | 'MEDIUM' | 'LOW';

export type AuthorityRole =
  | 'HOST_SHELL'
  | 'ENVIRONMENT'
  | 'PAGE_GEOMETRY'
  | 'MACHINE_LANGUAGE'
  | 'WORKING_SURFACE'
  | 'CONTROL_GRAMMAR'
  | 'NAVIGATION'
  | 'TYPOGRAPHY'
  | 'REVIEW_PATTERN'
  | 'VERIFICATION_PATTERN'
  | 'TRANSACTION_PATTERN'
  | 'RESPONSIVE_PATTERN'
  | 'ASSET_LANGUAGE';

export type PageNode = {
  page_id: string;
  route: string;
  route_pattern: string;
  parent_route: string | null;
  product_family: string;
  subfamily: string | null;
  component: string;
  source_file: string;
  route_status: 'LIVE' | 'REDIRECT' | 'ALIAS' | 'INTERNAL';
  public_or_internal: 'PUBLIC' | 'INTERNAL' | 'PROJECT';
  auth_requirement: 'NONE' | 'OPTIONAL' | 'REQUIRED';
  mobile_status: 'LIVE' | 'DESKTOP_ONLY' | 'UNKNOWN';
  desktop_status: 'LIVE' | 'MOBILE_ONLY' | 'UNKNOWN';
  screen_type: string;
  stateful: boolean;
  modal_or_overlay: boolean;
  wizard_or_flow: boolean;
  flow_id: string | null;
  step_index: number | null;
  conditional: boolean;
  data_dependencies: string[];
  existing_design_status: string;
  current_authority_status: string;
  primary_archetype: string;
  secondary_archetype: string | null;
  classification: DerivationClassification;
  derivation_confidence: DerivationConfidence;
  notes: string;
};

export type ArchetypeDefinition = {
  archetype_id: string;
  description: string;
  required_interaction_grammar: string[];
  required_layout_grammar: string[];
  common_controls: string[];
  responsive_implications: string;
  authority_requirements: string[];
  derivation_rules: string;
};

export type AuthorityRegistryEntry = {
  authority_id: string;
  family: string;
  subfamily: string;
  screen_name: string;
  source_path: string;
  route: string;
  archetype: string;
  viewport: string;
  status: string;
  approved: boolean;
  superseded: boolean;
  primary_visual_responsibilities: string[];
  interaction_grammar: string;
  machine_grammar: string;
  shell_grammar: string;
  panel_grammar: string;
  navigation_grammar: string;
  typography_grammar: string;
  responsive_grammar: string;
  known_limitations: string[];
  notes: string;
};

export type InheritanceMapEntry = {
  page_id: string;
  route: string;
  classification: DerivationClassification;
  derivation_confidence: DerivationConfidence;
  roles: Partial<Record<AuthorityRole, string>>;
  covered_roles: AuthorityRole[];
  missing_roles: AuthorityRole[];
  conflicting_roles: AuthorityRole[];
  new_interaction_required: boolean;
  new_visual_grammar_required: boolean;
  new_machine_required: boolean;
  founder_gate_required: boolean;
};

export type ProductionBatch = {
  batch_id: string;
  batch_name: string;
  product_family: string;
  routes: string[];
  screen_nodes: string[];
  archetypes: string[];
  authority_lineage: string[];
  classification: DerivationClassification;
  founder_gate_required: boolean;
  founder_gate_ids: string[];
  sonnet_ready: boolean;
  opus_strategy: string;
  grok_asset_dependencies: string[];
  composer_dependencies: string[];
  backend_dependencies: string[];
  risk_notes: string[];
  estimated_reuse_ratio: number;
};

export type FounderGate = {
  gate_id: string;
  family: string;
  archetype: string;
  routes_covered: string[];
  why_insufficient: string;
  must_decide: string;
  downstream_screens_unlocked: number;
};

export type CompilerReport = {
  total_routes: number;
  total_meaningful_screens: number;
  total_unique_archetypes: number;
  directly_covered: number;
  derivable: number;
  composite_derivable: number;
  creative_authority_required: number;
  total_founder_gates: number;
  representative_authorities_needed: number;
  downstream_screens_unlocked_by_gates: number;
  total_production_batches: number;
  sonnet_ready_batches: number;
  blocked_batches: number;
  authority_leverage_ratio: number;
  generated_at: string;
};
