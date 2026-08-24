/**
 * Supabase persistence for Embodied Character Discovery run (P0.5E.3).
 */

import { getSupabaseAdmin } from '../../supabase.js';
import type { NdxEmbodiedCharacterDiscoveryRun } from '../../../../shared/site00-brand-lore/ndxEmbodiedCharacterDiscovery/types.js';
import {
  NDX_EMBODIED_CHARACTER_DISCOVERY_DB_ID,
  NDX_EMBODIED_CHARACTER_DISCOVERY_MODE,
} from '../../../../shared/site00-brand-lore/ndxEmbodiedCharacterDiscovery/constants.js';
import { isNdxEmbodiedCharacterDiscoveryRun } from '../../../../shared/site00-brand-lore/ndxEmbodiedCharacterDiscovery/recordValidation.js';
import { NDXBOOK_ORG_ID } from '../creativeDirection/creativeIntelligence/founderComparisonSet.js';
import { resolveProjectDbIdForSupabaseFk } from '../../site00Projects/founderProjectDbId.js';

const TABLE = 'site00_methodology_validation_runs';

function discoveryStatus(run: NdxEmbodiedCharacterDiscoveryRun): string {
  if (run.synthesis?.synthesizedAt) return 'SYNTHESIZED';
  return 'DISCOVERY_ACTIVE';
}

export async function embodiedCharacterDiscoveryTablesExist(): Promise<boolean> {
  const { error } = await getSupabaseAdmin().from(TABLE).select('id').limit(1);
  return !error;
}

export async function getEmbodiedCharacterDiscoveryRun(
  projectId: string,
): Promise<NdxEmbodiedCharacterDiscoveryRun | null> {
  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .select('record, mode')
    .eq('id', NDX_EMBODIED_CHARACTER_DISCOVERY_DB_ID)
    .eq('mode', NDX_EMBODIED_CHARACTER_DISCOVERY_MODE)
    .maybeSingle();
  if (error || !data) return null;
  const rec = data.record;
  return isNdxEmbodiedCharacterDiscoveryRun(rec, projectId) ? rec : null;
}

export async function saveEmbodiedCharacterDiscoveryRun(
  record: NdxEmbodiedCharacterDiscoveryRun,
): Promise<NdxEmbodiedCharacterDiscoveryRun> {
  const projectDbId = await resolveProjectDbIdForSupabaseFk(record.projectId, 'ndxbook');
  const row = {
    id: NDX_EMBODIED_CHARACTER_DISCOVERY_DB_ID,
    organization_id: NDXBOOK_ORG_ID,
    project_id: projectDbId,
    mode: NDX_EMBODIED_CHARACTER_DISCOVERY_MODE,
    status: discoveryStatus(record),
    record,
    updated_at: new Date().toISOString(),
  };
  const { error } = await getSupabaseAdmin().from(TABLE).upsert(row, { onConflict: 'id' });
  if (error) throw new Error(error.message);
  return record;
}
