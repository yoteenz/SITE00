/**
 * Foundations status views (OPUS2 STATUS_VIEWS) computed from the real lifecycle reading.
 * Raw artifact states remain valid filters too (OL-07 lifecycle_states), so nothing that worked before is lost.
 */
import type { FoundationAdminListRow, PipelineRow } from '../../services/foundationAdminApi';
import { age, readLifecycle, type LifecycleReading } from './lifecycle';

export type FoundationRow = FoundationAdminListRow & { name: string; life: LifecycleReading; last: string; lastIso: string };

export const FOUNDATION_VIEWS = [
  { id: 'ALL', label: 'ALL' },
  { id: 'VIEW:NEEDS_YOU', label: 'NEEDS YOU' },
  { id: 'VIEW:INVITED', label: 'INVITED' },
  { id: 'VIEW:INTAKE', label: 'INTAKE' },
  { id: 'VIEW:QUOTE', label: 'QUOTE' },
  { id: 'VIEW:ACTIVE', label: 'ACTIVE' },
  { id: 'VIEW:COMPLETE', label: 'COMPLETE' },
] as const;

export const nameOf = (a: Pick<FoundationAdminListRow, 'business_name' | 'artifact_id'>) =>
  a.business_name?.trim() ? a.business_name.trim().toUpperCase() : `FOUNDATION ${a.artifact_id.slice(0, 6).toUpperCase()}`;

export function toFoundationRows(artifacts: FoundationAdminListRow[], pipeline: PipelineRow[], now = Date.now()): FoundationRow[] {
  const pipeById = new Map(pipeline.map((p) => [p.artifact_id, p]));
  return artifacts.map((a) => {
    const lastIso = a.last_activity_at ?? a.created_at;
    return { ...a, name: nameOf(a), life: readLifecycle(a, pipeById.get(a.artifact_id)), last: age(lastIso, now), lastIso };
  });
}

export const needsFounder = (r: { life: LifecycleReading }) => r.life.kind === 'founder' || (r.life.kind === 'blocked' && r.life.owner === 'FOUNDER');

export function inView(r: FoundationRow, view: string): boolean {
  switch (view) {
    case 'ALL':
      return true;
    case 'VIEW:NEEDS_YOU':
      return needsFounder(r);
    case 'VIEW:INVITED':
      return r.life.phase === 0;
    case 'VIEW:INTAKE':
      return r.life.phase === 1 || r.life.phase === 2;
    case 'VIEW:QUOTE':
      return r.life.phase === 3 || r.life.phase === 4;
    case 'VIEW:ACTIVE':
      return (r.life.phase === 5 || r.life.phase === 6) && r.life.kind !== 'done';
    case 'VIEW:COMPLETE':
      return r.life.kind === 'done' || r.life.phase === 7;
    default:
      // Raw lifecycle state chosen in OL-07.
      return r.state === view;
  }
}

export function viewLabel(view: string): string {
  return FOUNDATION_VIEWS.find((v) => v.id === view)?.label ?? view.replace(/_/g, ' ');
}

export function sortFoundationRows(rows: FoundationRow[], key: 'name' | 'activity' | 'lifecycle'): FoundationRow[] {
  const copy = [...rows];
  copy.sort((a, b) => {
    if (key === 'name') return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    if (key === 'lifecycle') return Number(needsFounder(b)) - Number(needsFounder(a)) || a.life.phase - b.life.phase || a.name.localeCompare(b.name);
    return Date.parse(b.lastIso) - Date.parse(a.lastIso);
  });
  return copy;
}

export const SORT_LABEL: Record<'name' | 'activity' | 'lifecycle', string> = {
  activity: 'LAST ACTIVITY',
  name: 'CLIENT NAME',
  lifecycle: 'NEXT ACTION · FOUNDER FIRST',
};
