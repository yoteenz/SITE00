/**
 * Reusable dependency resolver. NOT a rigid wizard: every station is always inspectable.
 * It answers (a) what blocks a decision at a station, (b) what a change invalidates downstream,
 * (c) display status, (d) downstream impact of revising a station.
 */
import { STATION_LABEL, STATION_ORDER, type Blocker, type FabricationState, type PendingFounderDecision, type StationId, type StationStatus } from './types.js';

/** direct upstream authorities each station is built on */
export const STATION_DEPENDS_ON: Record<StationId, readonly StationId[]> = {
  identity: [],
  body: ['identity'],
  look: ['body'],
  appearance: ['body', 'look'],
  character: ['appearance'],
  performance: ['body', 'character'],
  simulation: ['look', 'appearance', 'performance'],
  authority: ['identity', 'body', 'look', 'appearance', 'character', 'performance', 'simulation'],
};

export const isDone = (d: FabricationState['authority'][StationId]): boolean => d === 'APPROVED' || d === 'LOCKED';

export function directDownstream(s: StationId): StationId[] {
  return STATION_ORDER.filter((x) => STATION_DEPENDS_ON[x].includes(s));
}

export function transitiveDownstream(s: StationId): StationId[] {
  const seen = new Set<StationId>();
  const walk = (x: StationId) => {
    for (const d of directDownstream(x)) if (!seen.has(d)) { seen.add(d); walk(d); }
  };
  walk(s);
  return STATION_ORDER.filter((x) => seen.has(x));
}

/** Mark every downstream station whose authority was granted as STALE (needs revalidation). Pure. */
export function invalidateDownstream(state: FabricationState, changed: StationId): FabricationState {
  const stale = { ...state.stale };
  for (const d of transitiveDownstream(changed)) if (isDone(state.authority[d]) || state.touched[d]) stale[d] = true;
  return { ...state, stale };
}

export function openRevisions(state: FabricationState, station: StationId) {
  return state.revisionRequests.filter((r) => r.station === station && r.status === 'OPEN');
}

export function stationBlockers(state: FabricationState, station: StationId): Blocker[] {
  const out: Blocker[] = [];
  for (const up of STATION_DEPENDS_ON[station]) {
    if (station === 'authority') continue; // authority reports its own aggregate blockers below
    if (!isDone(state.authority[up]) || state.stale[up])
      out.push({ blockerId: `${station}.needs.${up}`, station, message: `${STATION_LABEL[up]} ${state.stale[up] ? 'NEEDS REVALIDATION' : 'NOT APPROVED'}` });
  }
  if (station === 'simulation') {
    const open = state.motionRequests.filter((r) => r.blocksSimulation && r.stage !== 'PUBLISH_ASSET');
    for (const r of open) out.push({ blockerId: `simulation.motion.${r.requestId}`, station, message: `MOTION ASSET ${r.name || 'REQUEST'} NOT PUBLISHED` });
  }
  if (station === 'authority') {
    for (const up of STATION_ORDER.filter((s) => s !== 'authority'))
      if (!isDone(state.authority[up]) || state.stale[up])
        out.push({ blockerId: `authority.needs.${up}`, station, message: `${STATION_LABEL[up]} ${state.stale[up] ? 'NEEDS REVALIDATION' : 'NOT APPROVED'}` });
  }
  return out;
}

export function stationStatus(state: FabricationState, station: StationId): StationStatus {
  if (openRevisions(state, station).length) return 'REVISION_REQUIRED';
  if (state.stale[station]) return 'STALE';
  const d = state.authority[station];
  if (d === 'LOCKED') return 'LOCKED';
  if (d === 'APPROVED') return 'APPROVED';
  if (stationBlockers(state, station).length && !state.touched[station]) return 'BLOCKED';
  return state.touched[station] ? 'IN_PROGRESS' : 'NOT_STARTED';
}

/** Is the station's founder decision ready to be made (all upstream satisfied and work complete)? */
export function stationReadyForDecision(state: FabricationState, station: StationId): boolean {
  if (stationBlockers(state, station).length) return false;
  switch (station) {
    case 'identity': return !!state.selectedActorCandidateId;
    case 'body': return state.bodyCalibrated && Object.values(state.bodyChecks).filter(Boolean).length === 7;
    case 'look': return state.lookDecision !== 'REJECTED';
    case 'appearance': return state.appearanceDecision !== 'REVISION_REQUESTED';
    case 'character': return state.behaviorLayers.length > 0 && !!state.selectedBehaviorCompositionId;
    case 'performance': return state.motionUsedIds.length > 0;
    case 'simulation': return state.results.some((r) => r.accepted || r.failed === 0);
    case 'authority': return true;
  }
}

export function stepsRemaining(state: FabricationState): number {
  return STATION_ORDER.filter((s) => !isDone(state.authority[s]) || state.stale[s]).length;
}

export type ImpactLevel = 'LOW' | 'MEDIUM' | 'HIGH';
/** Impact of revising `revised` on each other station, from the real graph and current approvals. */
export function downstreamImpact(state: FabricationState, revised: StationId): { station: StationId; level: ImpactLevel }[] {
  const direct = new Set(directDownstream(revised));
  const trans = new Set(transitiveDownstream(revised));
  return STATION_ORDER.filter((s) => s !== 'authority' && s !== revised).map((s) => {
    const affected = trans.has(s) && (isDone(state.authority[s]) || state.touched[s]);
    return { station: s, level: !affected ? 'LOW' : direct.has(s) ? 'HIGH' : 'MEDIUM' };
  });
}

export function pendingFounderDecisions(state: FabricationState): PendingFounderDecision[] {
  const out: PendingFounderDecision[] = [];
  const push = (station: StationId, title: string, detail: string) => out.push({ decisionId: `pfd.${station}`, station, title, detail });
  const done = (s: StationId) => isDone(state.authority[s]) && !state.stale[s];
  if (!done('identity')) push('identity', 'LOCK IDENTITY', 'ACTOR AUTHORITY AWAITING CONFIRMATION');
  if (done('identity') && !done('body')) push('body', 'BODY ANALYSIS REQUIRED', state.bodyCalibrated ? 'BODY CONTINUITY AWAITING FOUNDER LOCK' : 'RUN CONTINUITY CALIBRATION');
  if (done('body') && !done('look')) push('look', 'LOOK SELECTION PENDING', 'APPROVE A WARDROBE CANDIDATE');
  if (done('look') && !done('appearance')) push('appearance', 'APPEARANCE LOCK PENDING', 'COMPARE AND LOCK HAIR + MAKEUP');
  if (done('appearance') && !done('character')) push('character', 'CHARACTER BRIEF', 'COMPOSE AND LOCK BEHAVIORAL SKINS');
  const open = state.motionRequests.filter((r) => r.stage !== 'PUBLISH_ASSET');
  for (const r of open) push('performance', 'MOTION ASSET REQUIRED', `${r.name || 'MOTION REQUEST'} · ${r.stage.replace(/_/g, ' ')}`);
  const last = state.results[0];
  if (last && last.failed > 0 && !last.accepted) push('simulation', 'SIMULATION VARIANCE', `${last.failed} OF ${last.checks.length} CHECKS FAILED`);
  for (const r of state.revisionRequests.filter((x) => x.status === 'OPEN')) push(r.station, 'REVISION OPEN', `${STATION_LABEL[r.station]} · ${r.note.slice(0, 60)}`);
  if (STATION_ORDER.slice(0, 7).every((s) => done(s)) && !state.finalSignedOff) push('authority', 'AUTHORITY SIGN-OFF', 'ALL LAYERS APPROVED — AWAITING FINAL SIGN-OFF');
  return out;
}
