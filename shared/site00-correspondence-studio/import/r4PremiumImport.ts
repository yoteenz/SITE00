import type { CorrespondenceWorkspaceManifest, EditorialRegister, EmailTemplateVersion } from '../types.js';

const R4_DOCS = 'docs/site00/idnty/visual-authority/email-v2/r4';
const R4_PREVIEWS = '/site00-correspondence-studio/previews/r4/emails';

type VisualClass = 'P1' | 'P2' | 'P3';
type R4Row = {
  code: string;
  template_id: string;
  editorial_register: EditorialRegister;
  r4_title: string;
  visual_class: VisualClass;
  premium_assets: string[];
};

/**
 * Email V2 R4 premium editorial pack: all 20 Digital Foundation templates. Appended after every earlier version
 * (V2 benchmark, R2 territories, R3 editorial), never replacing them. Agent selection is not approval: every
 * version enters at founder_review. P1 = unique premium hero, P2 = shared family art, P3 = utility (drawn only).
 */
export const R4_PREMIUM_PACK_ID = 'R4-PREMIUM' as const;

export const R4_PREMIUM_IMPORT_CONTRACT = {
  sprint: 'P0.SITE00.IDNTY.EMAIL-V2-R4-PREMIUM-EDITORIAL-ASSET-PASS-AND-FULL-PACK-COMPOSITION-REBUILD1',
  branch: 'cursor/df-email-v2-r4-premium-a9f7',
  pack_id: R4_PREMIUM_PACK_ID,
  auto_approve: false,
  review_artifact: '/site00-correspondence-studio/previews/r4/review/index.html',
  asset_matrix: `${R4_DOCS}/PREMIUM_ASSET_MATRIX.json`,
  provenance: `${R4_DOCS}/OPENART_PROVENANCE.json`,
  creative_authority: `${R4_DOCS}/CREATIVE_AUTHORITY_R4.md`,
  emails: [
    { code: 'TR-01', template_id: 'personal-foundation-invitation', editorial_register: 'LETTER', r4_title: 'THE INVITATION', visual_class: 'P1', premium_assets: ['R4-G01'] },
    { code: 'TR-02', template_id: 'intake-started', editorial_register: 'LETTER', r4_title: 'THE DOOR, AJAR', visual_class: 'P2', premium_assets: ['R4-G01'] },
    { code: 'TR-03', template_id: 'intake-completed', editorial_register: 'RECORD', r4_title: 'RECEIVED', visual_class: 'P3', premium_assets: [] },
    { code: 'TR-04', template_id: 'quote-ready', editorial_register: 'BRIEF', r4_title: 'THE WORK, MEASURED', visual_class: 'P1', premium_assets: ['R4-G04'] },
    { code: 'TR-05', template_id: 'quote-updated', editorial_register: 'BRIEF', r4_title: 'REVISION', visual_class: 'P2', premium_assets: ['R4-G04'] },
    { code: 'TR-06', template_id: 'quote-accepted', editorial_register: 'RECORD', r4_title: 'AGREED', visual_class: 'P3', premium_assets: [] },
    { code: 'TR-07', template_id: 'checkout-link-ready', editorial_register: 'NOTICE', r4_title: 'CHECKOUT IS OPEN', visual_class: 'P2', premium_assets: ['R4-G05'] },
    { code: 'TR-08', template_id: 'payment-confirmed', editorial_register: 'RECORD', r4_title: 'RECEIPT', visual_class: 'P1', premium_assets: ['R4-G05'] },
    { code: 'TR-09', template_id: 'payment-failed', editorial_register: 'NOTICE', r4_title: 'ATTENTION', visual_class: 'P3', premium_assets: [] },
    { code: 'TR-10', template_id: 'project-activated', editorial_register: 'FEATURE', r4_title: 'THE GROUND IS MARKED OUT', visual_class: 'P1', premium_assets: ['R4-G06'] },
    { code: 'TR-11', template_id: 'foundation-complete', editorial_register: 'RECORD', r4_title: 'THE RECORD', visual_class: 'P1', premium_assets: ['R4-G02'] },
    { code: 'TR-12', template_id: 'records-available', editorial_register: 'RECORD', r4_title: 'THE ARCHIVE', visual_class: 'P1', premium_assets: ['R4-G07'] },
    { code: 'OP-01', template_id: 'client-action-required', editorial_register: 'NOTICE', r4_title: 'ONE THING NEEDS YOU', visual_class: 'P3', premium_assets: [] },
    { code: 'OP-02', template_id: 'approval-requested', editorial_register: 'BRIEF', r4_title: 'YOUR SIGN-OFF, PLEASE', visual_class: 'P3', premium_assets: [] },
    { code: 'OP-03', template_id: 'approval-completed', editorial_register: 'RECORD', r4_title: 'DONE. THANK YOU', visual_class: 'P3', premium_assets: [] },
    { code: 'MK-01', template_id: 'foundation-credit-issued', editorial_register: 'FEATURE', r4_title: 'SET ASIDE, IN YOUR NAME', visual_class: 'P1', premium_assets: ['R4-G08'] },
    { code: 'MK-02', template_id: 'bldr-discovery', editorial_register: 'LETTER', r4_title: 'YOU MENTIONED YOU MIGHT BUILD', visual_class: 'P2', premium_assets: ['R4-G03'] },
    { code: 'MK-03', template_id: 'M01', editorial_register: 'FEATURE', r4_title: "WHAT'S UNDER THE FLOOR", visual_class: 'P1', premium_assets: ['R4-G09'] },
    { code: 'MK-04', template_id: 'M06', editorial_register: 'FEATURE', r4_title: 'THE ISSUE', visual_class: 'P1', premium_assets: ['R4-G03'] },
    { code: 'MK-05', template_id: 'M13', editorial_register: 'FEATURE', r4_title: 'AFTER HOURS', visual_class: 'P1', premium_assets: ['R4-G10'] },
  ] satisfies R4Row[],
};

export function r4VersionId(templateId: string): string {
  return `${templateId}@r4-premium`;
}

function r4Version(row: R4Row): EmailTemplateVersion {
  return {
    version_id: r4VersionId(row.template_id),
    label: `R4 PREMIUM · ${row.code} · ${row.r4_title} · ${row.visual_class}`,
    created_at: '2026-10-11T22:00:00.000Z',
    implementation_scope: 'responsive_html',
    preview_source: {
      kind: 'repository_html',
      repoPath: `scripts/df-email-v2-benchmark/r4/emails/${row.template_id}.html`,
      publicPreviewPath: `${R4_PREVIEWS}/${row.template_id}.html`,
    },
    editorial_register: row.editorial_register,
    editorial_intent_ref: `${R4_DOCS}/CREATIVE_AUTHORITY_R4.md#${row.code.toLowerCase()}`,
    copy_ref: 'docs/site00/idnty/visual-authority/email-pack/DF_V2_EMAIL_COPY_AND_TOKEN_CONTRACTS.md',
    asset_provenance_ref: `${R4_DOCS}/PREMIUM_ASSET_MATRIX.json`,
    review_state: 'founder_review',
    pack_id: R4_PREMIUM_PACK_ID,
  };
}

/** Append the R4 version to every Digital Foundation template; R4 becomes the current version for review. */
export function applyR4PremiumImport(manifest: CorrespondenceWorkspaceManifest): CorrespondenceWorkspaceManifest {
  for (const row of R4_PREMIUM_IMPORT_CONTRACT.emails) {
    const entry = manifest.templates[row.template_id];
    if (!entry) continue;
    const v = r4Version(row);
    entry.versions = [...entry.versions.filter((x) => x.version_id !== v.version_id), v];
    entry.current_version_id = v.version_id;
  }
  return manifest;
}

export function listR4TemplateIds(): string[] {
  return R4_PREMIUM_IMPORT_CONTRACT.emails.map((e) => e.template_id);
}
