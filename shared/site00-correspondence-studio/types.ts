/** SITE 00 Correspondence Studio — versioned production contracts (repository-backed V1). */

export const CORRESPONDENCE_PIPELINE_STAGES = [
  'client_or_internal_project',
  'brand_intelligence',
  'campaign_brief',
  'editorial_strategy',
  'creative_territories',
  'founder_direction_selection',
  'email_family_architecture',
  'individual_compositions',
  'responsive_previews',
  'internal_creative_qa',
  'founder_review',
  'revision_or_approval',
  'production_export',
  'client_delivery_package',
  'archive',
] as const;

export type CorrespondencePipelineStage = (typeof CORRESPONDENCE_PIPELINE_STAGES)[number];

export const REVIEW_STATES = [
  'draft',
  'internal_qa',
  'founder_review',
  'revision_required',
  'approved',
  'approved_with_revisions',
  'delivery_ready',
  'delivered',
  'archived',
] as const;

export type ReviewState = (typeof REVIEW_STATES)[number];

export const EDITORIAL_REGISTERS = ['LETTER', 'RECORD', 'NOTICE', 'FEATURE', 'BRIEF'] as const;
export type EditorialRegister = (typeof EDITORIAL_REGISTERS)[number];

export const DEVICE_PREVIEW_MODES = ['mobile', 'tablet', 'desktop'] as const;
export type DevicePreviewMode = (typeof DEVICE_PREVIEW_MODES)[number];

export type ImplementationScope = 'design_only' | 'responsive_html' | 'production_esp_html';

export type EmailPreviewSource =
  | { kind: 'site00_email_template'; templateId: string }
  | { kind: 'repository_html'; repoPath: string; publicPreviewPath?: string }
  | { kind: 'external_url'; url: string };

export type BrandAuthorityContract = {
  brand_authority_id: string;
  display_name: string;
  /** When true, email canvas uses SITE 00 DNA; studio chrome may still be SITE 00-branded. */
  uses_site00_visual_dna: boolean;
  /** External client brands must not inherit SITE 00 palette/type by default. */
  colors?: Record<string, string>;
  typography?: { family: string; weights?: number[] };
  voice_ref?: string;
  logo_ref?: string;
  approval_requirements?: string[];
};

export type CorrespondenceComment = {
  id: string;
  version_id: string;
  created_at: string;
  author: 'founder' | 'studio' | 'system';
  body: string;
  /** Internal-only comments never ship in client ZIP. */
  visibility: 'internal' | 'client_safe';
};

export type VersionApprovalRecord = {
  version_id: string;
  review_state: ReviewState;
  decided_at: string;
  decided_by: string;
  note?: string;
};

export type EmailTemplateVersion = {
  version_id: string;
  label: string;
  created_at: string;
  implementation_scope: ImplementationScope;
  preview_source: EmailPreviewSource;
  editorial_register?: EditorialRegister;
  editorial_intent_ref?: string;
  copy_ref?: string;
  asset_provenance_ref?: string;
  review_state: ReviewState;
};

export type EmailFamilyDefinition = {
  family_id: string;
  label: string;
  description?: string;
  template_ids: string[];
};

export type CampaignDefinition = {
  campaign_id: string;
  name: string;
  project_id: string;
  brand_authority_id: string;
  primary_objective?: string;
  target_audience?: string;
  editorial_direction_ref?: string;
  visual_authority_ref?: string;
  email_families: EmailFamilyDefinition[];
  template_sequence?: string[];
};

export type ProjectDefinition = {
  project_id: string;
  name: string;
  organization_id: string;
  brand_authority_id: string;
  campaigns: CampaignDefinition[];
};

export type OrganizationDefinition = {
  organization_id: string;
  name: string;
};

export type CorrespondenceWorkspaceManifest = {
  schema_version: '1';
  product: 'SITE_00_CORRESPONDENCE_STUDIO';
  organization: OrganizationDefinition;
  brand_authorities: BrandAuthorityContract[];
  projects: ProjectDefinition[];
  /** Flat index for quick lookup */
  templates: Record<
    string,
    {
      template_id: string;
      display_name: string;
      campaign_id: string;
      family_id: string;
      classification: 'transactional' | 'operational' | 'marketing';
      versions: EmailTemplateVersion[];
      current_version_id: string;
    }
  >;
};

export type ServiceScopeContract = {
  service_scope_id: string;
  label: string;
  includes: ('copy' | 'design' | 'responsive_html' | 'esp_implementation' | 'campaign_strategy')[];
  delivery_package_profile: 'design_only' | 'design_and_previews' | 'full_implementation';
  provider_neutral: true;
};

export type ClientDeliveryPlan = {
  package_name: string;
  scope: ImplementationScope;
  design_only_label?: string;
  folders: { dest: string; sourcePath: string }[];
  exclude_internal: true;
};

export type NdxCreativeHandoff = {
  campaign_id: string;
  intention: string;
  audience: string;
  central_idea: string;
  editorial_strategy_ref: string;
  visual_direction_ref: string;
  narrative_rhythm: string;
  primary_action: string;
  per_email_purpose: Record<string, string>;
};
