import type { CorrespondenceWorkspaceManifest, EmailTemplateVersion } from '../types.js';

const DF_TEMPLATE_ROWS: {
  id: string;
  name: string;
  family: 'transactional' | 'operational' | 'marketing';
  familyId: string;
}[] = [
  { id: 'personal-foundation-invitation', name: 'PERSONAL FOUNDATION INVITATION', family: 'transactional', familyId: 'transactional' },
  { id: 'intake-started', name: 'INTAKE STARTED', family: 'transactional', familyId: 'transactional' },
  { id: 'intake-resume-reminder', name: 'INTAKE RESUME REMINDER', family: 'transactional', familyId: 'transactional' },
  { id: 'intake-completed', name: 'INTAKE COMPLETED', family: 'transactional', familyId: 'transactional' },
  { id: 'quote-ready', name: 'QUOTE READY', family: 'transactional', familyId: 'transactional' },
  { id: 'quote-updated', name: 'QUOTE UPDATED', family: 'transactional', familyId: 'transactional' },
  { id: 'quote-expiry-reminder', name: 'QUOTE EXPIRY REMINDER', family: 'transactional', familyId: 'transactional' },
  { id: 'quote-accepted', name: 'QUOTE ACCEPTED', family: 'transactional', familyId: 'transactional' },
  { id: 'checkout-link-ready', name: 'CHECKOUT LINK READY', family: 'transactional', familyId: 'transactional' },
  { id: 'payment-confirmed', name: 'PAYMENT CONFIRMED', family: 'transactional', familyId: 'transactional' },
  { id: 'payment-failed', name: 'PAYMENT FAILED / RECOVERY', family: 'transactional', familyId: 'transactional' },
  { id: 'project-activated', name: 'PROJECT ACTIVATED', family: 'transactional', familyId: 'transactional' },
  { id: 'foundation-complete', name: 'FOUNDATION COMPLETE', family: 'transactional', familyId: 'transactional' },
  { id: 'records-available', name: 'RECORDS AVAILABLE', family: 'transactional', familyId: 'transactional' },
  { id: 'client-action-required', name: 'CLIENT ACTION REQUIRED', family: 'operational', familyId: 'operational' },
  { id: 'approval-requested', name: 'APPROVAL REQUESTED', family: 'operational', familyId: 'operational' },
  { id: 'approval-completed', name: 'APPROVAL COMPLETED', family: 'operational', familyId: 'operational' },
  { id: 'foundation-credit-issued', name: 'FOUNDATION CREDIT ISSUED', family: 'marketing', familyId: 'marketing' },
  { id: 'bldr-discovery', name: 'BLDR DISCOVERY', family: 'marketing', familyId: 'marketing' },
  { id: 'M01', name: 'M01 — DIGITAL FOUNDATION EDUCATION', family: 'marketing', familyId: 'marketing' },
  { id: 'M06', name: 'M06 — BLDR INTRODUCTION', family: 'marketing', familyId: 'marketing' },
  { id: 'M13', name: 'M13 — POST-COMPLETION FOLLOW-UP', family: 'marketing', familyId: 'marketing' },
];

function packVersion(templateId: string): EmailTemplateVersion {
  return {
    version_id: `${templateId}@v1-pack-registry`,
    label: 'V1 PACK REGISTRY',
    created_at: '2026-10-11T00:00:00.000Z',
    implementation_scope: 'design_only',
    preview_source: { kind: 'site00_email_template', templateId },
    review_state: 'draft',
  };
}

/** Digital Foundation client lifecycle — 22 registered template IDs (14 + 3 + 5). The two reminders arrive with FNDATN-01. */
export function buildDigitalFoundationWorkspaceManifest(): CorrespondenceWorkspaceManifest {
  const templates: CorrespondenceWorkspaceManifest['templates'] = {};
  for (const row of DF_TEMPLATE_ROWS) {
    templates[row.id] = {
      template_id: row.id,
      display_name: row.name,
      campaign_id: 'client-lifecycle',
      family_id: row.familyId,
      classification: row.family,
      current_version_id: `${row.id}@v1-pack-registry`,
      versions: [packVersion(row.id)],
    };
  }

  return {
    schema_version: '1',
    product: 'SITE_00_CORRESPONDENCE_STUDIO',
    organization: { organization_id: 'site00', name: 'SITE 00' },
    brand_authorities: [
      {
        brand_authority_id: 'site00-dna',
        display_name: 'SITE 00',
        uses_site00_visual_dna: true,
        voice_ref: 'docs/site00/idnty/visual-authority/email-v2/authority/EDITORIAL_VOICE_SYSTEM.md',
      },
      {
        brand_authority_id: 'client-brand-example',
        display_name: 'CLIENT BRAND (EXAMPLE)',
        uses_site00_visual_dna: false,
        approval_requirements: ['Founder + client brand steward'],
      },
    ],
    projects: [
      {
        project_id: 'digital-foundation',
        name: 'DIGITAL FOUNDATION',
        organization_id: 'site00',
        brand_authority_id: 'site00-dna',
        campaigns: [
          {
            campaign_id: 'client-lifecycle',
            name: 'CLIENT LIFECYCLE',
            project_id: 'digital-foundation',
            brand_authority_id: 'site00-dna',
            primary_objective: 'Guide a client from invitation through foundation completion and optional discovery.',
            target_audience: 'Digital Foundation prospects and clients',
            editorial_direction_ref: 'docs/site00/idnty/visual-authority/email-v2/authority/EDITORIAL_VOICE_SYSTEM.md',
            visual_authority_ref: 'docs/site00/idnty/visual-authority/email-v2/authority/COMPOSITION_AUTHORITY.md',
            email_families: [
              {
                family_id: 'transactional',
                label: 'TRANSACTIONAL',
                description: 'Lifecycle messages tied to artifact and project state.',
                template_ids: DF_TEMPLATE_ROWS.filter((r) => r.familyId === 'transactional').map((r) => r.id),
              },
              {
                family_id: 'operational',
                label: 'OPERATIONAL',
                description: 'Decisions and actions that need a clear response.',
                template_ids: DF_TEMPLATE_ROWS.filter((r) => r.familyId === 'operational').map((r) => r.id),
              },
              {
                family_id: 'marketing',
                label: 'MARKETING',
                description: 'Opt-in education and discovery — never masquerading as transactional.',
                template_ids: DF_TEMPLATE_ROWS.filter((r) => r.familyId === 'marketing').map((r) => r.id),
              },
            ],
            template_sequence: DF_TEMPLATE_ROWS.map((r) => r.id),
          },
        ],
      },
    ],
    templates,
  };
}

export const DIGITAL_FOUNDATION_TEMPLATE_COUNT = DF_TEMPLATE_ROWS.length;
