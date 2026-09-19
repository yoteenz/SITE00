/**
 * C1.8 — Supabase adapter for campaign copy persistence.
 */

import { getSupabaseAdmin, hasSupabaseServiceRole } from '../../supabase.js';
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
