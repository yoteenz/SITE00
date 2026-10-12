import {
  FNDATN01_ASSET_PROVENANCE,
  FNDATN01_AUTHORITY_MANIFEST,
  FNDATN01_EMAILS,
  FNDATN01_PACK_ID,
  FNDATN01_VERSION_CREATED_AT,
  FNDATN01_VERSION_LABEL,
  fndatn01PreviewPath,
  type Fndatn01Email,
} from '../fndatn01/pack.js';
import type { CorrespondenceWorkspaceManifest, EmailTemplateVersion } from '../types.js';

const FNDATN01_DOCS = 'docs/site00/correspondence/fndatn-01';

/**
 * FNDATN-01 founder visual authority: seven emails implemented as live HTML from 14 device references.
 * Appended after V1, V2, R2, R3 and R4, never replacing them. Every version enters at founder_review; the pack
 * registers templates and trigger contracts only and enables no delivery.
 */
export const FNDATN01_PACK_IMPORT_CONTRACT = {
  sprint: 'P0.SITE00.CORRESPONDENCE-STUDIO.FNDATN-FIRST-SEVEN-EMAILS-FOUNDER-VISUAL-AUTHORITY-IMPLEMENTATION1',
  pack_id: FNDATN01_PACK_ID,
  auto_approve: false,
  dispatch_enabled: false,
  authority_manifest: FNDATN01_AUTHORITY_MANIFEST,
  asset_provenance: FNDATN01_ASSET_PROVENANCE,
} as const;

export function fndatn01VersionId(templateId: string): string {
  return `${templateId}@fndatn-01`;
}

function fndatn01Version(email: Fndatn01Email): EmailTemplateVersion {
  const publicPreviewPath = fndatn01PreviewPath(email.slug);
  return {
    version_id: fndatn01VersionId(email.template_id),
    label: `${FNDATN01_VERSION_LABEL} · ${email.id} · ${email.title}`,
    created_at: FNDATN01_VERSION_CREATED_AT,
    implementation_scope: 'responsive_html',
    preview_source: { kind: 'repository_html', repoPath: `public${publicPreviewPath}`, publicPreviewPath },
    editorial_intent_ref: `${FNDATN01_DOCS}/FNDATN_01_TEMPLATE_EVENT_MAPPING.md#email-${email.id}`,
    copy_ref: `${FNDATN01_DOCS}/FNDATN_01_DATA_CONTRACTS.md#email-${email.id}`,
    asset_provenance_ref: FNDATN01_ASSET_PROVENANCE,
    review_state: 'founder_review',
    pack_id: FNDATN01_PACK_ID,
    reference_authority: { ...email.authority, manifest_ref: FNDATN01_AUTHORITY_MANIFEST },
    state_previews:
      email.id === '04'
        ? [
            { id: 'activation_confirmed', label: 'PAYMENT + ACTIVATION CONFIRMED', publicPreviewPath },
            {
              id: 'activation_pending',
              label: 'PAYMENT RECORDED · ACTIVATION PENDING',
              publicPreviewPath: fndatn01PreviewPath(email.slug, 'activation_pending'),
            },
          ]
        : undefined,
  };
}

/** Append the FNDATN-01 version to its seven templates and make it current for founder review. */
export function applyFndatn01PackImport(manifest: CorrespondenceWorkspaceManifest): CorrespondenceWorkspaceManifest {
  for (const email of FNDATN01_EMAILS) {
    const entry = manifest.templates[email.template_id];
    if (!entry) throw new Error(`FNDATN-01 template ${email.template_id} is not registered`);
    const v = fndatn01Version(email);
    entry.versions = [...entry.versions.filter((x) => x.version_id !== v.version_id), v];
    entry.current_version_id = v.version_id;
  }
  return manifest;
}

export function listFndatn01TemplateIds(): string[] {
  return FNDATN01_EMAILS.map((e) => e.template_id);
}
