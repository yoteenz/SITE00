import { FOUNDER_ACTOR } from '../approvals.js';

/** Level B: exactly one production unit is in founder review at a time (sprint V2 §01, §27). */
export type UnitStatus = 'QUEUED' | 'ACTIVE' | 'PARKED' | 'ARCHIVED';
export type ProductionUnitEntry = { unitId: string; releaseId: string; status: UnitStatus; note: string | null };
export type ActiveProduction = {
  schemaVersion: string;
  rule: string;
  activeUnit: string | null;
  units: ProductionUnitEntry[];
  history: Array<{ unitId: string; from: UnitStatus; to: UnitStatus; actor: string; at: string; note: string | null }>;
};

export class ProgressionError extends Error {}

export const ONE_UNIT_RULE = 'One production unit in founder review at a time. The next unit becomes active only when the current one is archived after founder final approval, or the founder parks it.';

export function initialActiveProduction(releaseIds: string[], active: string): ActiveProduction {
  if (!releaseIds.includes(active)) throw new ProgressionError(`unknown unit ${active}`);
  return {
    schemaVersion: '2.0.0',
    rule: ONE_UNIT_RULE,
    activeUnit: active,
    units: releaseIds.map((id) => ({ unitId: id, releaseId: id, status: id === active ? 'ACTIVE' : 'QUEUED', note: null })),
    history: [],
  };
}

const move = (s: ActiveProduction, unitId: string, to: UnitStatus, actor: string, at: string, note: string | null): ActiveProduction => {
  const u = s.units.find((x) => x.unitId === unitId);
  if (!u) throw new ProgressionError(`unknown unit ${unitId}`);
  return { ...s, units: s.units.map((x) => (x.unitId === unitId ? { ...x, status: to, note } : x)), history: [...s.history, { unitId, from: u.status, to, actor, at, note }] };
};

export function nextQueued(s: ActiveProduction): string | null {
  return s.units.find((u) => u.status === 'QUEUED')?.unitId ?? null;
}

/** Archive needs the founder's final approval of the finished unit; parking is a founder choice that leaves the unit resumable. */
export function advanceProduction(s: ActiveProduction, how: { kind: 'ARCHIVE'; finalApprovedBy: string; archivePath: string } | { kind: 'PARK'; reason: string }, actor: string, at: string): ActiveProduction {
  if (actor !== FOUNDER_ACTOR) throw new ProgressionError(`only the founder advances production; got ${actor}`);
  if (!s.activeUnit) throw new ProgressionError('no active unit');
  if (how.kind === 'ARCHIVE' && how.finalApprovedBy !== FOUNDER_ACTOR) throw new ProgressionError('archive requires founder final approval');
  let next = move(s, s.activeUnit, how.kind === 'ARCHIVE' ? 'ARCHIVED' : 'PARKED', actor, at, how.kind === 'ARCHIVE' ? how.archivePath : how.reason);
  const following = nextQueued(next);
  next = { ...next, activeUnit: following };
  return following ? move(next, following, 'ACTIVE', actor, at, null) : next;
}

/** What the founder is asked to review now: the active unit only. */
export function founderReviewQueue(s: ActiveProduction): string[] {
  return s.activeUnit ? [s.activeUnit] : [];
}
