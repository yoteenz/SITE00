/**
 * Supabase persistence for Content Operations run.
 */

import { getSupabaseAdmin } from '../../supabase.js';
import type { ContentOperationsRun } from '../../../../shared/site00-brand-lore/contentOperations/types.js';
import {
  NDXBOOK_CONTENT_OPERATIONS_DB_ID,
  NDXBOOK_CONTENT_OPERATIONS_MODE,
} from '../../../../shared/site00-brand-lore/contentOperations/constants.js';
import { NDXBOOK_ORG_ID } from '../creativeDirection/creativeIntelligence/founderComparisonSet.js';
import { resolveProjectDbIdForSupabaseFk } from '../../site00Projects/founderProjectDbId.js';

const TABLE = 'site00_methodology_validation_runs';

export async function contentOperationsTablesExist(): Promise<boolean> {
  const { error } = await getSupabaseAdmin().from(TABLE).select('id').limit(1);
  return !error;
}

export async function getContentOperationsRun(projectId: string): Promise<ContentOperationsRun | null> {
  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .select('record')
    .eq('id', NDXBOOK_CONTENT_OPERATIONS_DB_ID)
    .maybeSingle();
  if (error || !data) return null;
  const rec = data.record as ContentOperationsRun;
  return rec.projectId === projectId ? rec : null;
}

export async function saveContentOperationsRun(record: ContentOperationsRun): Promise<ContentOperationsRun> {
  const projectDbId = await resolveProjectDbIdForSupabaseFk(record.projectId, 'ndxbook');
  const row = {
    id: NDXBOOK_CONTENT_OPERATIONS_DB_ID,
    organization_id: record.organizationId || NDXBOOK_ORG_ID,
    project_id: projectDbId,
    mode: NDXBOOK_CONTENT_OPERATIONS_MODE,
    status: record.status,
    record,
    updated_at: new Date().toISOString(),
  };
  const { error } = await getSupabaseAdmin().from(TABLE).upsert(row, { onConflict: 'id' });
  if (error) throw new Error(error.message);
  return record;
}
