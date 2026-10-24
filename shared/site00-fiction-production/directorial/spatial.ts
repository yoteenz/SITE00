import { placeShots } from './timeline.js';
import type { ContinuityState, DirectorialFinding, ProductionPlan, SpatialAuthority } from './types.js';

export function validateSpatialAuthority(authorities: SpatialAuthority[]): DirectorialFinding[] {
  const out: DirectorialFinding[] = [];
  const add = (severity: DirectorialFinding['severity'], code: string, subject: string, detail: string) => out.push({ severity, code, subject, detail });
  for (const a of authorities) {
    const zones = new Set<string>();
    for (const z of a.zones) {
      if (zones.has(z.zoneId)) add('ERROR', 'ZONE_DUPLICATE', a.setId, `duplicate zone ${z.zoneId}`);
      zones.add(z.zoneId);
      if (!z.landmarks.length) add('WARNING', 'ZONE_LANDMARKS', z.zoneId, 'no landmark to hold geography across shots');
      if (!z.cameraSafe.length) add('WARNING', 'ZONE_CAMERA_SAFE', z.zoneId, 'no camera-safe position recorded');
    }
    for (const p of a.travelPaths) for (const z of [p.from, p.to]) if (!zones.has(z)) add('ERROR', 'TRAVEL_PATH', a.setId, `travel path names unknown zone ${z}`);
    for (const s of a.sightlines) for (const z of [s.from, s.to]) if (!zones.has(z)) add('ERROR', 'SIGHTLINE', a.setId, `sightline names unknown zone ${z}`);
    if (!a.immutable.length) add('WARNING', 'IMMUTABLE', a.setId, 'no immutable architecture recorded');
    if (a.status !== 'APPROVED') add('ADVISORY', 'SPATIAL_PROVISIONAL', a.setId, 'spatial authority is provisional until the founder approves the environment reference');
  }
  return out;
}

const describeChar = (s: ContinuityState['characters'][string]) => `${s.zone}|${s.wardrobeState}|${s.hair}`;
const describeProp = (s: ContinuityState['props'][string]) => `${s.holder ?? '-'}|${s.location}|${s.state}`;

/**
 * Physical continuity (sprint V2 §14): between two recorded states a character may not change zone, wardrobe or hair, and a prop may not change
 * holder, place or state, unless a declared transition covers the change. An off-screen change needs a shot in between where the subject is not seen.
 */
export function validatePhysicalContinuity(plan: ProductionPlan): DirectorialFinding[] {
  const out: DirectorialFinding[] = [];
  const add = (severity: DirectorialFinding['severity'], code: string, subject: string, detail: string) => out.push({ severity, code, subject, detail });
  const sequence = placeShots(plan.shots).filter((s) => !s.overlay).sort((a, b) => a.at - b.at);
  const index = new Map(sequence.map((s, i) => [s.shotId, i]));
  const zoneIds = new Set(plan.spatial.flatMap((a) => a.zones.map((z) => z.zoneId)));
  const landmarks = new Set(plan.spatial.flatMap((a) => a.zones.flatMap((z) => z.landmarks)));
  const states = [...plan.continuity].sort((a, b) => (index.get(a.shotId) ?? -1) - (index.get(b.shotId) ?? -1));
  for (const st of states) {
    if (!index.has(st.shotId)) add('ERROR', 'STATE_SHOT', st.shotId, 'continuity state for a shot that is not in the picture sequence');
    for (const [name, c] of Object.entries(st.characters)) if (!zoneIds.has(c.zone)) add('ERROR', 'STATE_ZONE', st.shotId, `${name} is in unknown zone ${c.zone}`);
  }
  for (const s of plan.shots) for (const l of s.landmarks) if (!landmarks.has(l)) add('WARNING', 'LANDMARK_UNKNOWN', s.shotId, `landmark "${l}" is not in the spatial authority`);
  const unseenBetween = (subject: string, kind: 'character' | 'prop', from: string, to: string) => {
    const a = index.get(from) ?? 0;
    const b = index.get(to) ?? 0;
    for (let i = a + 1; i < b; i += 1) {
      const shot = sequence[i];
      const st = plan.continuity.find((x) => x.shotId === shot.shotId);
      const recorded = kind === 'prop' ? st?.props[subject] : st?.characters[subject];
      if (recorded ? !recorded.visible : kind === 'prop' ? !(subject in shot.propState) : !shot.onScreen.includes(subject)) return true;
    }
    return false;
  };
  const check = (kind: 'character' | 'prop', subject: string, prev: ContinuityState, cur: ContinuityState, before: string, after: string) => {
    if (before === after) return;
    const a = index.get(prev.shotId) ?? 0;
    const b = index.get(cur.shotId) ?? 0;
    const t = plan.transitions.find((x) => x.subject === subject && (index.get(x.fromShot) ?? Infinity) >= a && (index.get(x.toShot) ?? -1) <= b && (index.get(x.fromShot) ?? 0) < (index.get(x.toShot) ?? 0));
    if (!t) {
      add('ERROR', kind === 'prop' ? 'PROP_TELEPORT' : 'CHARACTER_JUMP', subject, `${prev.shotId} → ${cur.shotId}: "${before}" became "${after}" with no declared transition`);
      return;
    }
    if (t.method === 'OFF_SCREEN_DECLARED' && !unseenBetween(subject, kind, t.fromShot, t.toShot)) {
      add('ERROR', 'OFF_SCREEN_VISIBLE', subject, `${t.fromShot} → ${t.toShot}: an off-screen change needs a shot in between where ${subject} is not seen`);
    }
  };
  const last = new Map<string, ContinuityState>();
  for (const st of states) {
    for (const [name, c] of Object.entries(st.characters)) {
      const prev = last.get(`c:${name}`);
      if (prev) check('character', name, prev, st, describeChar(prev.characters[name]), describeChar(c));
      last.set(`c:${name}`, st);
    }
    for (const [name, p] of Object.entries(st.props)) {
      const prev = last.get(`p:${name}`);
      if (prev) check('prop', name, prev, st, describeProp(prev.props[name]), describeProp(p));
      last.set(`p:${name}`, st);
    }
  }
  for (const t of plan.transitions) for (const id of [t.fromShot, t.toShot]) if (!index.has(id)) add('ERROR', 'TRANSITION_SHOT', t.subject, `transition names unknown shot ${id}`);
  return out;
}

/** Prop chain for the packet: every recorded state of one prop in picture order. */
export function propChain(plan: ProductionPlan, prop: string) {
  const order = new Map(placeShots(plan.shots).map((s) => [s.shotId, s.at]));
  return plan.continuity
    .filter((s) => s.props[prop])
    .sort((a, b) => (order.get(a.shotId) ?? 0) - (order.get(b.shotId) ?? 0))
    .map((s) => ({ shotId: s.shotId, ...s.props[prop] }));
}
