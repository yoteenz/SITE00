/**
 * Legacy ambiguous project record inspection + safe repair.
 */

import { getSupabaseAdmin } from '../../supabase.js';

export type LegacyProjectRepairReport = {
  ambiguousCount: number;
  repaired: string[];
  quarantined: string[];
};

export async function inspectAndRepairLegacyProjects(): Promise<LegacyProjectRepairReport> {
  const supabase = getSupabaseAdmin();

  const { data: ambiguous } = await supabase
    .from('site00_projects')
    .select('id, slug, name, project_type, experience_class, metadata')
    .or('project_type.is.null,experience_class.is.null');

  const repaired: string[] = [];
  const quarantined: string[] = [];

  for (const row of ambiguous ?? []) {
    const slug = (row.slug ?? '').trim().toLowerCase();
    const deterministic: { project_type?: string; experience_class?: string } = {};

    if (slug === 'ndxbook') {
      deterministic.project_type = 'PRODUCT';
      deterministic.experience_class = 'IMMERSIVE_SITE';
    } else if (slug === 'frontal-slayer') {
      deterministic.project_type = 'WORLD';
      deterministic.experience_class = 'WORLD';
    } else if (slug === 'studio-world' || slug === 'all-in-one-enterprises') {
      deterministic.project_type = 'SITE';
      deterministic.experience_class = 'SITE';
    } else if (slug === 'astral-world') {
      deterministic.project_type = 'WORLD';
      deterministic.experience_class = 'WORLD';
    }

    if (deterministic.project_type) {
      await supabase
        .from('site00_projects')
        .update({
          ...deterministic,
          metadata: {
            ...(row.metadata as Record<string, unknown> ?? {}),
            legacyRepair: 'P0.D deterministic classification',
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', row.id);
      repaired.push(slug);
    } else {
      await supabase
        .from('site00_projects')
        .update({
          metadata: {
            ...(row.metadata as Record<string, unknown> ?? {}),
            legacyQuarantine: true,
            legacyQuarantineReason: 'P0.D — project_type/experience_class undetermined; excluded from default resolution',
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', row.id);
      quarantined.push(slug || row.id);
    }
  }

  const { count } = await supabase
    .from('site00_projects')
    .select('id', { count: 'exact', head: true })
    .or('project_type.is.null,experience_class.is.null');

  return {
    ambiguousCount: count ?? 0,
    repaired,
    quarantined,
  };
}
