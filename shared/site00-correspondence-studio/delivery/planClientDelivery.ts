import type { ClientDeliveryPlan, CorrespondenceWorkspaceManifest, ImplementationScope, ReviewState } from '../types.js';

const APPROVED_FOR_EXPORT: ReviewState[] = ['approved', 'approved_with_revisions', 'delivery_ready', 'delivered'];

export type DeliveryEmailRow = {
  template_id: string;
  version_id: string;
  folder_slug: string;
  scope: ImplementationScope;
  include_html: boolean;
  copy_ref?: string;
  preview_paths?: Partial<Record<'mobile' | 'tablet' | 'desktop', string>>;
};

export type ClientDeliveryInput = {
  manifest: CorrespondenceWorkspaceManifest;
  campaign_id: string;
  package_slug: string;
  /** Version review states from store or manifest defaults */
  version_states: Record<string, ReviewState>;
  /** Resolved filesystem paths for copy, previews, optional html */
  assets: Record<
    string,
    {
      copyPath?: string;
      htmlPath?: string;
      previews?: Partial<Record<'mobile' | 'tablet' | 'desktop', string>>;
    }
  >;
};

export function isApprovedForClientExport(state: ReviewState): boolean {
  return APPROVED_FOR_EXPORT.includes(state);
}

export function planClientDelivery(input: ClientDeliveryInput): {
  emails: DeliveryEmailRow[];
  plan: ClientDeliveryPlan;
  rejected_unapproved: string[];
} {
  const campaign = input.manifest.projects
    .flatMap((p) => p.campaigns)
    .find((c) => c.campaign_id === input.campaign_id);
  if (!campaign) throw new Error(`unknown campaign: ${input.campaign_id}`);

  const emails: DeliveryEmailRow[] = [];
  const rejected: string[] = [];

  for (const family of campaign.email_families) {
    for (const templateId of family.template_ids) {
      const t = input.manifest.templates[templateId];
      if (!t) continue;
      const version = t.versions.find((v) => v.version_id === t.current_version_id) ?? t.versions[0];
      const state = input.version_states[`${templateId}::${version.version_id}`] ?? version.review_state;
      if (!isApprovedForClientExport(state)) {
        rejected.push(templateId);
        continue;
      }
      const asset = input.assets[templateId] ?? {};
      const include_html = version.implementation_scope !== 'design_only' && Boolean(asset.htmlPath);
      emails.push({
        template_id: templateId,
        version_id: version.version_id,
        folder_slug: templateId.replace(/[^a-z0-9]+/gi, '_').toUpperCase(),
        scope: version.implementation_scope,
        include_html,
        copy_ref: version.copy_ref,
        preview_paths: asset.previews,
      });
    }
  }

  const scope: ImplementationScope = emails.some((e) => e.include_html) ? 'responsive_html' : 'design_only';

  const plan: ClientDeliveryPlan = {
    package_name: input.package_slug,
    scope,
    design_only_label: scope === 'design_only' ? 'DESIGN-ONLY REVIEW ARTIFACTS — NOT PRODUCTION ESP HTML' : undefined,
    folders: [],
    exclude_internal: true,
  };

  return { emails, plan, rejected_unapproved: rejected };
}

/** Strip internal-only comment bodies from export summaries. */
export function clientSafeCommentFilter<T extends { visibility: string }>(comments: T[]): T[] {
  return comments.filter((c) => c.visibility === 'client_safe');
}
