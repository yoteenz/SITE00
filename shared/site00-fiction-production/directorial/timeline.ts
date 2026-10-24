import { span, type Span } from './timecode.js';
import type { DirectorialFinding, ProductionPlan, ShotDesign } from './types.js';

export const TRACKS = ['VIDEO_A', 'VIDEO_B', 'DIALOGUE', 'AMBIENCE', 'FOLEY', 'SFX', 'MUSIC', 'SUBTITLES'] as const;
export type TrackId = (typeof TRACKS)[number];

export type PlacedShot = ShotDesign & { at: number; overlay: boolean };
export type TrackEvent = Span & { eventId: string; track: TrackId; ref: string; label: string; continuesUnderCut: boolean };

/** Shots without `at` play in order on the picture; a shot with `at` is a VIDEO_B overlay above a continuing VIDEO_A take. */
export function placeShots(shots: ShotDesign[]): PlacedShot[] {
  let cursor = 0;
  return shots.map((s) => {
    if (s.at !== undefined) return { ...s, at: s.at, overlay: true };
    const placed = { ...s, at: cursor, overlay: false };
    cursor += s.frames;
    return placed;
  });
}

const overlaps = (a: { at: number; frames: number }, b: { at: number; frames: number }) => a.at < b.at + b.frames && b.at < a.at + a.frames;

export function buildMultitrack(plan: ProductionPlan) {
  const fps = plan.fps;
  const tracks = Object.fromEntries(TRACKS.map((t) => [t, [] as TrackEvent[]])) as Record<TrackId, TrackEvent[]>;
  const push = (track: TrackId, ref: string, at: number, frames: number, label: string, continuesUnderCut = false) =>
    tracks[track].push({ eventId: `${track}-${String(tracks[track].length + 1).padStart(2, '0')}`, track, ref, label, continuesUnderCut, ...span(at, frames, fps) });
  const placed = placeShots(plan.shots);
  for (const s of placed) push(s.track, s.shotId, s.at, s.frames, s.primaryAction || s.purpose);
  const cuts = new Set(placed.filter((s) => !s.overlay).map((s) => s.at).filter((f) => f > 0));
  const crossesCut = (at: number, frames: number) => [...cuts].some((c) => c > at && c < at + frames);
  for (const d of plan.dialogue) push('DIALOGUE', d.lineId, d.at, d.frames, `${d.speaker}: ${d.text}`, crossesCut(d.at, d.frames));
  for (const m of plan.music) push('MUSIC', m.cueId, m.at, m.frames, m.cueType === 'SILENCE' ? `SILENCE — ${m.title}` : m.title, crossesCut(m.at, m.frames));
  for (const c of plan.sound) push(c.track, c.cueId, c.at, c.frames, c.description, c.continuesUnderCut);
  for (const t of plan.subtitles) push('SUBTITLES', t.eventId, t.at, t.frames, t.text);
  for (const t of TRACKS) tracks[t].sort((a, b) => a.startFrame - b.startFrame || a.eventId.localeCompare(b.eventId));
  const trackDurations = Object.fromEntries(
    TRACKS.map((t) => {
      const covered = new Set<number>();
      for (const e of tracks[t]) for (let f = e.startFrame; f < e.endFrame; f += 1) covered.add(f);
      return [t, { events: tracks[t].length, activeFrames: covered.size, activeSec: Math.round((covered.size / fps) * 1000) / 1000 }];
    }),
  ) as Record<TrackId, { events: number; activeFrames: number; activeSec: number }>;
  return { format: 'EXCHANGE_MULTITRACK_V1', unitId: plan.unitId, fps, durationFrames: plan.durationFrames, sceneDuration: span(0, plan.durationFrames, fps), tracks, trackDurations };
}
export type Multitrack = ReturnType<typeof buildMultitrack>;

/** Who speaks during a frame range, and whose mouths the shot shows. */
export function speakersDuring(plan: ProductionPlan, at: number, frames: number): string[] {
  return [...new Set(plan.dialogue.filter((d) => overlaps(d, { at, frames })).map((d) => d.speaker))];
}

export function validateTimeline(plan: ProductionPlan): DirectorialFinding[] {
  const out: DirectorialFinding[] = [];
  const add = (severity: DirectorialFinding['severity'], code: string, subject: string, detail: string) => out.push({ severity, code, subject, detail });
  const D = plan.durationFrames;
  const placed = placeShots(plan.shots);
  const all = [...placed.map((s) => ({ id: s.shotId, at: s.at, frames: s.frames })), ...plan.dialogue.map((d) => ({ id: d.lineId, at: d.at, frames: d.frames })),
    ...plan.music.map((m) => ({ id: m.cueId, at: m.at, frames: m.frames })), ...plan.sound.map((c) => ({ id: c.cueId, at: c.at, frames: c.frames })), ...plan.subtitles.map((t) => ({ id: t.eventId, at: t.at, frames: t.frames }))];
  for (const e of all) {
    if (!Number.isInteger(e.at) || !Number.isInteger(e.frames) || e.at < 0 || e.frames <= 0) add('ERROR', 'FRAME_ALIGNMENT', e.id, `at ${e.at}, frames ${e.frames} must be whole frames, frames > 0`);
    if (e.at + e.frames > D) add('ERROR', 'OUT_OF_BOUNDS', e.id, `ends at frame ${e.at + e.frames}, after the unit end ${D}`);
  }
  const sequenceEnd = placed.filter((s) => !s.overlay).reduce((a, s) => a + s.frames, 0);
  if (sequenceEnd !== D) add('ERROR', 'RUNTIME_RECONCILIATION', plan.unitId, `picture sequence is ${sequenceEnd} frames; unit runtime is ${D}`);
  const picture = new Uint8Array(D);
  for (const s of placed) for (let f = s.at; f < Math.min(D, s.at + s.frames); f += 1) picture[f] = 1;
  const gap = picture.indexOf(0);
  if (gap >= 0) add('ERROR', 'PICTURE_GAP', plan.unitId, `no picture at frame ${gap}`);
  for (const s of placed.filter((x) => x.overlay)) {
    if (s.track !== 'VIDEO_B') add('ERROR', 'OVERLAY_TRACK', s.shotId, 'only VIDEO_B shots may be placed over a continuing take');
    const under = placed.find((a) => !a.overlay && a.track === 'VIDEO_A' && a.at <= s.at && a.at + a.frames >= s.at + s.frames);
    if (!under) add('ERROR', 'OVERLAY_UNDERLAY', s.shotId, 'an overlay must sit inside one VIDEO_A take');
  }
  const noOverlap = (label: string, items: Array<{ id: string; at: number; frames: number }>) => {
    const sorted = [...items].sort((a, b) => a.at - b.at);
    for (let i = 1; i < sorted.length; i += 1) if (overlaps(sorted[i - 1], sorted[i])) add('ERROR', 'TRACK_OVERLAP', sorted[i].id, `${label}: overlaps ${sorted[i - 1].id}`);
  };
  noOverlap('VIDEO_A', placed.filter((s) => s.track === 'VIDEO_A').map((s) => ({ id: s.shotId, at: s.at, frames: s.frames })));
  noOverlap('VIDEO_B', placed.filter((s) => s.track === 'VIDEO_B').map((s) => ({ id: s.shotId, at: s.at, frames: s.frames })));
  noOverlap('MUSIC', plan.music.map((m) => ({ id: m.cueId, at: m.at, frames: m.frames })));
  noOverlap('SUBTITLES', plan.subtitles.map((t) => ({ id: t.eventId, at: t.at, frames: t.frames })));
  for (const sp of new Set(plan.dialogue.map((d) => d.speaker))) noOverlap(`DIALOGUE ${sp}`, plan.dialogue.filter((d) => d.speaker === sp).map((d) => ({ id: d.lineId, at: d.at, frames: d.frames })));
  const lineSeen = new Set<string>();
  for (const d of plan.dialogue) {
    if (lineSeen.has(d.lineId)) add('ERROR', 'CUTAWAY_CONTINUITY', d.lineId, 'a line is one continuous audio event; it must not be split around a cutaway');
    lineSeen.add(d.lineId);
    if (!plan.subtitles.some((t) => t.kind === 'DIALOGUE' && t.at === d.at && t.frames === d.frames)) add('WARNING', 'SUBTITLE_SYNC', d.lineId, 'no subtitle event with the same span');
  }
  const music = new Uint8Array(D);
  for (const m of plan.music) for (let f = m.at; f < Math.min(D, m.at + m.frames); f += 1) music[f] = 1;
  const mGap = music.indexOf(0);
  if (mGap >= 0) add('ERROR', 'MUSIC_DECISION_GAP', plan.unitId, `frame ${mGap} has no music cue and no declared SILENCE`);
  const amb = new Uint8Array(D);
  for (const c of plan.sound.filter((x) => x.track === 'AMBIENCE')) for (let f = c.at; f < Math.min(D, c.at + c.frames); f += 1) amb[f] = 1;
  for (const s of placed.filter((x) => x.generated)) {
    for (let f = s.at; f < s.at + s.frames && f < D; f += 1) {
      if (!amb[f]) {
        add('WARNING', 'AMBIENCE_DROPOUT', s.shotId, `no ambience bed under picture at frame ${f}`);
        break;
      }
    }
  }
  const shotIds = new Set(plan.shots.map((s) => s.shotId));
  for (const c of plan.sound) {
    for (const id of c.linkedShots) if (!shotIds.has(id)) add('ERROR', 'SOUND_LINK', c.cueId, `linked shot ${id} does not exist`);
    if (c.track !== 'AMBIENCE' && c.linkedShots.length && !placed.some((s) => c.linkedShots.includes(s.shotId) && overlaps(s, c))) add('ERROR', 'SFX_TIMING', c.cueId, 'cue does not overlap any linked shot');
    for (const p of c.syncPoints) if (p.frame < c.at || p.frame >= c.at + c.frames) add('ERROR', 'SYNC_POINT', c.cueId, `sync point ${p.frame} (${p.event}) is outside the cue`);
  }
  for (const m of plan.music) for (const p of m.hitPoints) if (p.frame < m.at || p.frame > m.at + m.frames) add('ERROR', 'HIT_POINT', m.cueId, `hit point ${p.frame} (${p.event}) is outside the cue`);
  out.push(...validateCoverage(plan, placed));
  return out;
}

/** Sprint V2 §20: lip-sync only on a visible speaking mouth; silent reactions never get mouth motion. */
export function validateCoverage(plan: ProductionPlan, placed = placeShots(plan.shots)): DirectorialFinding[] {
  const out: DirectorialFinding[] = [];
  const add = (severity: DirectorialFinding['severity'], code: string, subject: string, detail: string) => out.push({ severity, code, subject, detail });
  for (const s of placed) {
    const speakers = speakersDuring(plan, s.at, s.frames);
    const targets = s.mouthVisible.filter((c) => speakers.includes(c));
    if (s.lipSync === 'REQUIRED' && !targets.length) add('ERROR', 'ARTIFICIAL_MOUTH_MOTION', s.shotId, 'lip-sync requested but no visible mouth belongs to a speaker');
    if (s.lipSync === 'NONE' && targets.length) add('ERROR', 'LIPSYNC_MISSING', s.shotId, `${targets.join(', ')} speaks with the mouth in frame`);
    if (s.coverage === 'VISIBLE_SPEAKER' && !targets.length) add('ERROR', 'COVERAGE_MISMATCH', s.shotId, 'VISIBLE_SPEAKER without a visible speaking mouth');
    if (s.coverage === 'LISTENER_REACTION' && s.lipSync === 'REQUIRED') add('ERROR', 'ARTIFICIAL_MOUTH_MOTION', s.shotId, 'a listener reaction never carries lip-sync');
    if (speakers.length && s.coverage === 'SILENT_ACTION') add('WARNING', 'COVERAGE_MISMATCH', s.shotId, `dialogue plays (${speakers.join(', ')}) over a shot classed SILENT_ACTION`);
    if (!speakers.length && (s.coverage === 'OFFSCREEN_SPEAKER' || s.coverage === 'LISTENER_REACTION')) add('WARNING', 'COVERAGE_MISMATCH', s.shotId, `${s.coverage} with no dialogue playing`);
  }
  return out;
}

export type EditJoin = { lineId: string; speaker: string; kind: 'J_CUT' | 'L_CUT' | 'OFFSCREEN_ONLY' | 'ON_CAMERA'; shots: string[] };

/** Classifies each line against the shots where its speaker is seen: audio before the picture is a J-cut, audio after it an L-cut. */
export function editJoins(plan: ProductionPlan): EditJoin[] {
  const placed = placeShots(plan.shots);
  return plan.dialogue.map((d) => {
    const during = placed.filter((s) => overlaps(s, d));
    const seen = during.filter((s) => s.onScreen.includes(d.speaker));
    if (!seen.length) return { lineId: d.lineId, speaker: d.speaker, kind: 'OFFSCREEN_ONLY' as const, shots: during.map((s) => s.shotId) };
    const first = Math.min(...seen.map((s) => s.at));
    const last = Math.max(...seen.map((s) => s.at + s.frames));
    const kind = d.at < first ? 'J_CUT' : d.at + d.frames > last ? 'L_CUT' : 'ON_CAMERA';
    return { lineId: d.lineId, speaker: d.speaker, kind, shots: during.map((s) => s.shotId) };
  });
}
