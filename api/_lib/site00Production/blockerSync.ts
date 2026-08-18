import type { StructuredBlocker } from './readinessTypes.js';

export type BlockerRow = StructuredBlocker & { metadata?: Record<string, unknown> };

function blockerKey(b: StructuredBlocker): string {
  return [
    b.type,
    b.deliverable_id ?? '',
    b.production_job_id ?? '',
    b.service_id ?? '',
    b.dependency_id ?? '',
  ].join(':');
}

/** Upsert open blockers; resolve stale ones when readiness clears. */
export async function syncProductionBlockers(
  supabase: ReturnType<typeof import('../supabase.js').getSupabaseAdmin>,
  projectId: string,
  activeBlockers: StructuredBlocker[],
): Promise<Map<string, string>> {
  const { data: existing } = await supabase
    .from('site00_production_blockers')
    .select('id, blocker_type, deliverable_id, production_job_id, service_id, dependency_key, resolved_at')
    .eq('project_id', projectId);

  const activeKeys = new Set(activeBlockers.map(blockerKey));
  const idByKey = new Map<string, string>();

  for (const row of existing ?? []) {
    const key = blockerKey({
      project_id: projectId,
      type: row.blocker_type as StructuredBlocker['type'],
      deliverable_id: row.deliverable_id ?? undefined,
      production_job_id: row.production_job_id ?? undefined,
      service_id: row.service_id ?? undefined,
      dependency_id: row.dependency_key ?? undefined,
      reason: '',
      owner: 'client',
      severity: 'high',
    });

    if (!activeKeys.has(key) && !row.resolved_at) {
      await supabase
        .from('site00_production_blockers')
        .update({ resolved_at: new Date().toISOString() })
        .eq('id', row.id);
    } else if (activeKeys.has(key)) {
      idByKey.set(key, row.id);
    }
  }

  for (const b of activeBlockers) {
    const key = blockerKey(b);
    if (idByKey.has(key)) {
      b.id = idByKey.get(key);
      continue;
    }

    const { data: inserted } = await supabase
      .from('site00_production_blockers')
      .insert({
        project_id: projectId,
        deliverable_id: b.deliverable_id ?? null,
        production_job_id: b.production_job_id ?? null,
        blocker_type: b.type,
        service_id: b.service_id ?? null,
        dependency_key: b.dependency_id ?? null,
        reason: b.reason,
        owner: b.owner.toUpperCase(),
        severity: b.severity.toUpperCase(),
        current_status: b.current_status ?? null,
        required_phase: b.required_phase ?? null,
        action_type: b.action_type ?? null,
        action_route: b.action_route ?? null,
        metadata: {},
      })
      .select('id')
      .single();

    if (inserted?.id) {
      b.id = inserted.id;
      idByKey.set(key, inserted.id);
    }
  }

  return idByKey;
}
