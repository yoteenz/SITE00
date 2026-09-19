/**
 * P0.5E.4 — Supabase persistence for Founder Character Discovery run.
 */

import { getSupabaseAdmin } from '../../supabase.js';
import type { NdxFounderCharacterDiscoveryRun } from '../../../../shared/site00-brand-lore/ndxEmbodiedCharacterFounderDiscovery/types.js';
import {
  NDX_FOUNDER_CHARACTER_DISCOVERY_DB_ID,
  NDX_FOUNDER_CHARACTER_DISCOVERY_MODE,
} from '../../../../shared/site00-brand-lore/ndxEmbodiedCharacterFounderDiscovery/constants.js';
import { NDXBOOK_ORG_ID } from '../creativeDirection/creativeIntelligence/founderComparisonSet.js';
import { resolveProjectDbIdForSupabaseFk } from '../../site00Projects/founderProjectDbId.js';

const TABLE = 'site00_methodology_validation_runs';

export async function founderCharacterDiscoveryTablesExist(): Promise<boolean> {
  const { error } = await getSupabaseAdmin().from(TABLE).select('id').limit(1);
  return !error;
}

export async function getFounderCharacterDiscoveryRun(
  projectId: string,
): Promise<NdxFounderCharacterDiscoveryRun | null> {
  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .select('record')
    .eq('id', NDX_FOUNDER_CHARACTER_DISCOVERY_DB_ID)
    .maybeSingle();
  if (error || !data) return null;
  const rec = data.record as NdxFounderCharacterDiscoveryRun;
  return rec.projectId === projectId ? rec : null;
}

export async function saveFounderCharacterDiscoveryRun(
  record: NdxFounderCharacterDiscoveryRun,
): Promise<NdxFounderCharacterDiscoveryRun> {
  const projectDbId = await resolveProjectDbIdForSupabaseFk(record.projectId, 'ndxbook');
  const row = {
    id: NDX_FOUNDER_CHARACTER_DISCOVERY_DB_ID,
    organization_id: NDXBOOK_ORG_ID,
    project_id: projectDbId,
    mode: NDX_FOUNDER_CHARACTER_DISCOVERY_MODE,
    status: record.castingReadiness.state,
    record,
    updated_at: new Date().toISOString(),
  };
  const { error } = await getSupabaseAdmin().from(TABLE).upsert(row, { onConflict: 'id' });
  if (error) throw new Error(error.message);
  return record;
}
