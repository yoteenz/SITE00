/**
 * Supabase persistence for Brand Marketing Expression run.
 */

import { getSupabaseAdmin } from '../../../supabase.js';
import type { BrandMarketingExpressionRun } from '../../../../../shared/site00-brand-lore/brandMarketingExpression/types.js';
import {
  NDXBOOK_MARKETING_EXPRESSION_DB_ID,
  NDXBOOK_MARKETING_EXPRESSION_MODE,
} from '../../../../../shared/site00-brand-lore/brandMarketingExpression/constants.js';
import { NDXBOOK_ORG_ID } from '../creativeIntelligence/founderComparisonSet.js';
import { resolveProjectDbIdForSupabaseFk } from '../../../site00Projects/founderProjectDbId.js';

const TABLE = 'site00_methodology_validation_runs';

export async function brandMarketingExpressionTablesExist(): Promise<boolean> {
  const { error } = await getSupabaseAdmin().from(TABLE).select('id').limit(1);
  return !error;
}

export async function getBrandMarketingExpressionRun(
  projectId: string,
): Promise<BrandMarketingExpressionRun | null> {
  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .select('record')
    .eq('id', NDXBOOK_MARKETING_EXPRESSION_DB_ID)
    .maybeSingle();
  if (error || !data) return null;
  const rec = data.record as BrandMarketingExpressionRun;
  return rec.projectId === projectId ? rec : null;
}

export async function saveBrandMarketingExpressionRun(
  record: BrandMarketingExpressionRun,
): Promise<BrandMarketingExpressionRun> {
  const projectDbId = await resolveProjectDbIdForSupabaseFk(record.projectId, 'ndxbook');
  const row = {
    id: NDXBOOK_MARKETING_EXPRESSION_DB_ID,
    organization_id: record.organizationId || NDXBOOK_ORG_ID,
    project_id: projectDbId,
    mode: NDXBOOK_MARKETING_EXPRESSION_MODE,
    status: record.status,
    record,
    updated_at: new Date().toISOString(),
  };
  const { error } = await getSupabaseAdmin().from(TABLE).upsert(row, { onConflict: 'id' });
  if (error) throw new Error(error.message);
  return record;
}
