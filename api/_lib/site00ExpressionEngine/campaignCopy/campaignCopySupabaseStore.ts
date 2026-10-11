/**
 * C1.8 — Supabase adapter for campaign copy persistence.
 */

import { getSupabaseAdmin, hasSupabaseServiceRole } from '../../supabase.js';
import { boundedListMeta, resolveBoundedListRange } from '../../supabase/boundedListQuery.js';
import type { BoundedListMeta } from '../../supabase/boundedListQuery.js';
import type { CampaignCopyPackageOutput } from '../../../shared/site00-expression-engine/campaign-copy/types.js';

export async function campaignCopySchemaExists(): Promise<boolean> {
  if (!hasSupabaseServiceRole()) return false;
  try {
    const { error } = await getSupabaseAdmin()
      .from('site00_campaign_copy_packages')
      .select('id')
      .limit(1);
    return !error;
  } catch {
    return false;
  }
}

export async function upsertCampaignCopyPackageToSupabase(
  output: CampaignCopyPackageOutput,
  projectId: string,
): Promise<void> {
  await getSupabaseAdmin()
    .from('site00_campaign_copy_packages')
    .upsert(
      {
        copy_package_key: output.copyPackageId,
        campaign_id: output.campaignId,
        project_id: projectId,
        package_copy_quality_tier: output.packageCopyQualityTier,
        package_copy_handholding_risk: output.packageCopyHandholdingRisk,
        record: output as unknown as Record<string, unknown>,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'copy_package_key' },
    );

  for (const unit of output.unitCopyDirections) {
    for (const version of unit.versions) {
      await getSupabaseAdmin()
        .from('site00_campaign_copy_versions')
        .insert({
          copy_direction_id: unit.copyPackage.copyDirectionId,
          content_unit_id: unit.unitId,
          version_label: version.versionLabel,
          copy_text: version.copyText,
          cta: version.cta,
          status: version.status,
          founder_judgment: version.founderJudgment ?? null,
          record: version as unknown as Record<string, unknown>,
        });
    }
  }
}

export async function loadCampaignCopyPackageFromSupabase(
  copyPackageId: string,
): Promise<CampaignCopyPackageOutput | null> {
  const { data, error } = await getSupabaseAdmin()
    .from('site00_campaign_copy_packages')
    .select('record')
    .eq('copy_package_key', copyPackageId)
    .maybeSingle();
  if (error || !data?.record) return null;
  return data.record as CampaignCopyPackageOutput;
}

export type CampaignCopyPackageSummary = {
  copyPackageKey: string;
  campaignId: string;
  projectId: string;
  packageCopyQualityTier: string;
  packageCopyHandholdingRisk: string;
  updatedAt: string;
};

export async function listCampaignCopyPackagesFromSupabasePage(options: {
  campaignId?: string;
  projectId?: string;
  page?: number;
  limit?: number;
}): Promise<{ items: CampaignCopyPackageSummary[]; meta: BoundedListMeta }> {
  const { page, limit, from, to } = resolveBoundedListRange({
    page: options.page,
    limit: options.limit,
    defaultLimit: 100,
    maxLimit: 500,
  });
  let query = getSupabaseAdmin()
    .from('site00_campaign_copy_packages')
    .select(
      'copy_package_key, campaign_id, project_id, package_copy_quality_tier, package_copy_handholding_risk, updated_at',
    )
    .order('updated_at', { ascending: false })
    .range(from, to);
  if (options.campaignId) query = query.eq('campaign_id', options.campaignId);
  if (options.projectId) query = query.eq('project_id', options.projectId);
  const { data, error } = await query;
  if (error) throw error;
  const items = (data ?? []).map((row) => ({
    copyPackageKey: String(row.copy_package_key),
    campaignId: String(row.campaign_id),
    projectId: String(row.project_id),
    packageCopyQualityTier: String(row.package_copy_quality_tier),
    packageCopyHandholdingRisk: String(row.package_copy_handholding_risk),
    updatedAt: String(row.updated_at),
  }));
  return { items, meta: boundedListMeta(items.length, page, limit) };
}
