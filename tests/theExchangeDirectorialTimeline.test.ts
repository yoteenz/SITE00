import { describe, expect, it } from 'vitest';
import * as X from '../shared/site00-fiction-production/index.js';

const D = X.Directorial;
const plan = X.S1_01_PLAN;
const clone = (): X.Directorial.ProductionPlan => JSON.parse(JSON.stringify(plan));
const codes = (f: X.Directorial.DirectorialFinding[], severity?: string) => f.filter((x) => !severity || x.severity === severity).map((x) => `${x.code}:${x.subject}`);
const shot = (p: X.Directorial.ProductionPlan, n: number) => p.shots.find((s) => s.shotId === `S1-01-SH${String(n).padStart(2, '0')}`)!;
const W = 'WOMAN ON THE BALCONY';
const withLine = (p: X.Directorial.ProductionPlan, at: number, frames: number, lineId = 'FX-L001') => {
  p.dialogue.push({ eventId: `EV-${lineId}-${at}`, lineId, speaker: W, text: 'A test line that S1-01 does not contain', at, frames, takeRef: null });
  p.subtitles.push({ eventId: `SUB-${lineId}-${at}`, at, frames, text: 'A test line', kind: 'DIALOGUE' });
  return p;
};

describe('THE EXCHANGE directorial timeline (S1-01 and synthetic fixtures)', () => {
  it('tiles the release frame by frame with no gap and reconciles every track to 45 s', () => {
    expect(D.validateTimeline(plan)).toEqual([]);
    const placed = D.placeShots(plan.shots);
    placed.reduce((cursor, s) => (expect(s.at).toBe(cursor), cursor + s.frames), 0);
    expect(placed.at(-1)!.at + placed.at(-1)!.frames).toBe(1080);
    const events = D.deriveTimelineEvents(plan);
    expect(events).toHaveLength(19);
    expect(events[0].start).toBe('00:00:00.000');
    expect(events.at(-1)!.end).toBe('00:00:45.000');
    for (let i = 1; i < events.length; i += 1) expect(events[i].start).toBe(events[i - 1].end);
    const mt = D.buildMultitrack(plan);
    expect(mt.sceneDuration.frames).toBe(1080);
    expect(mt.trackDurations.VIDEO_A.activeFrames).toBe(1080);
    expect(mt.trackDurations.MUSIC.activeFrames).toBe(1080);
    expect(mt.trackDurations.AMBIENCE.activeFrames).toBe(1056);
    expect(mt.trackDurations.SUBTITLES.activeFrames).toBe(240);
    expect(mt.trackDurations.DIALOGUE.events).toBe(0);
  });

  it('flags gaps, runtime drift, overlaps and misplaced overlays', () => {
    const gap = clone();
    gap.shots.splice(5, 1);
    expect(codes(D.validateTimeline(gap), 'ERROR')).toEqual(expect.arrayContaining(['RUNTIME_RECONCILIATION:S1-01', 'PICTURE_GAP:S1-01']));
    const overlay = clone();
    overlay.shots.push({ ...shot(overlay, 6), shotId: 'FX-B1', track: 'VIDEO_B', at: 120, frames: 12 });
    expect(D.validateTimeline(overlay)).toEqual([]);
    overlay.shots.push({ ...shot(overlay, 6), shotId: 'FX-B2', track: 'VIDEO_B', at: 126, frames: 24 });
    expect(codes(D.validateTimeline(overlay))).toEqual(expect.arrayContaining(['OVERLAY_UNDERLAY:FX-B2', 'TRACK_OVERLAP:FX-B2']));
    overlay.shots.push({ ...shot(overlay, 6), shotId: 'FX-A1', track: 'VIDEO_A', at: 10, frames: 10 });
    expect(codes(D.validateTimeline(overlay))).toContain('OVERLAY_TRACK:FX-A1');
    const music = clone();
    music.music[1].frames -= 12;
    expect(codes(D.validateTimeline(music))).toContain('MUSIC_DECISION_GAP:S1-01');
    const tail = clone();
    tail.sound[0].frames = 2000;
    expect(codes(D.validateTimeline(tail))).toContain('OUT_OF_BOUNDS:S1-01-AMB01');
  });

  it('keeps picture, music and sound in sync at the planned frames', () => {
    const at = (n: number) => D.placeShots(plan.shots).find((s) => s.shotId === `S1-01-SH${String(n).padStart(2, '0')}`)!.at;
    const hit = (cue: string, event: RegExp) => plan.music.find((m) => m.cueId === cue)!.hitPoints.find((h) => event.test(h.event))!.frame;
    expect(hit('S1-01-MX02', /Thins/)).toBe(at(13));
    expect(hit('S1-01-MX02', /Hard stop/)).toBe(at(14));
    expect(plan.music.find((m) => m.cueType === 'SILENCE')!.at).toBe(at(14));
    expect(hit('S1-01-MX03', /black/)).toBe(at(19));
    expect(plan.sound.find((c) => c.cueId === 'S1-01-FL03')!.syncPoints[0].frame).toBe(hit('S1-01-MX02', /Downbeat/));
    expect(plan.sound.find((c) => c.cueId === 'S1-01-FL04')!.syncPoints[0].frame).toBe(hit('S1-01-MX02', /dress/));
    const bad = clone();
    bad.sound.find((c) => c.cueId === 'S1-01-FL01')!.syncPoints[0].frame = 200;
    bad.music[1].hitPoints.push({ frame: 900, event: 'misplaced' });
    bad.sound.find((c) => c.cueId === 'S1-01-FL05')!.at = 900;
    expect(codes(D.validateTimeline(bad), 'ERROR')).toEqual(expect.arrayContaining(['SYNC_POINT:S1-01-FL01', 'HIT_POINT:S1-01-MX02', 'SFX_TIMING:S1-01-FL05']));
  });

  it('reconciles shot durations with the screenplay, scene by scene', () => {
    const doc = X.loadScreenplays().find((d) => d.meta.identity.releaseId === 'S1-01')!;
    expect(doc.meta.identity.version).toBe(plan.screenplay.version);
    for (const sc of doc.scenes) {
      const frames = plan.shots.filter((s) => s.sceneId === sc.sceneId).reduce((a, s) => a + s.frames, 0);
      expect(frames, sc.sceneId).toBe(Math.round(X.sceneSec(sc.elements) * plan.fps));
    }
    expect(plan.durationFrames).toBe(X.durationToSec(doc.meta.identity.runtimeTarget) * plan.fps);
    for (const s of plan.shots.filter((x) => x.generated)) expect(D.generationSeconds(s.frames, plan.fps)).toBeGreaterThanOrEqual(D.framesToSec(s.frames, plan.fps));
    expect(D.motionSummary(plan.shots, plan.fps)).toMatchObject({ generatedShots: 18, editOnlyShots: 1, screenSec: 43.5, generationSec: 64 });
  });

  it('classifies motion and keeps exceptions on record', () => {
    expect(D.motionSummary(plan.shots, plan.fps).byClass).toEqual({ ENVIRONMENT: 3, HIGH: 9, MODERATE: 4, LOW: 2 });
    const f = D.validateMotion(plan.shots, plan.fps);
    expect(f.every((x) => x.severity === 'ADVISORY')).toBe(true);
    expect(codes(f)).toEqual(['MOTION_BAND:S1-01-SH14', 'MOTION_BAND:S1-01-SH19']);
    expect(f[0].detail).toContain('Reason on record');
    expect([D.generationSeconds(12, 24), D.generationSeconds(114, 24), D.generationSeconds(1000, 24)]).toEqual([3, 6, 15]);
    const p = clone();
    shot(p, 2).actionCount = 2;
    shot(p, 3).why.duration = '';
    expect(codes(D.validateMotion(p.shots, 24))).toEqual(expect.arrayContaining(['MULTIPLE_ACTIONS:S1-01-SH02', 'DURATION_UNJUSTIFIED:S1-01-SH03']));
    const flat = p.shots.filter((s) => s.generated).map((s) => ({ ...s, frames: 48, motionClass: 'HIGH' as const, actionCount: 1, why: { ...s.why, duration: 'fixture' } }));
    expect(codes(D.validateMotion(flat, 24))).toEqual(expect.arrayContaining(['UNIFORM_RHYTHM:plan', 'MONTAGE_ONLY:plan']));
  });

  it('puts lip-sync only on a visible speaking mouth and keeps a line whole across cutaways', () => {
    expect(D.validateCoverage(plan)).toEqual([]);
    const p = withLine(clone(), 500, 160);
    expect(codes(D.validateCoverage(p))).toEqual(expect.arrayContaining(['COVERAGE_MISMATCH:S1-01-SH11', 'COVERAGE_MISMATCH:S1-01-SH12']));
    shot(p, 12).mouthVisible = [W];
    expect(codes(D.validateCoverage(p), 'ERROR')).toContain('LIPSYNC_MISSING:S1-01-SH12');
    Object.assign(shot(p, 12), { lipSync: 'REQUIRED', coverage: 'VISIBLE_SPEAKER' });
    Object.assign(shot(p, 13), { lipSync: 'REQUIRED', coverage: 'LISTENER_REACTION', mouthVisible: ['NEIGHBOUR'] });
    const f = codes(D.validateCoverage(p), 'ERROR');
    expect(f).not.toContain('LIPSYNC_MISSING:S1-01-SH12');
    expect(f).toContain('ARTIFICIAL_MOUTH_MOTION:S1-01-SH13');
    expect(D.editJoins(p)[0]).toMatchObject({ kind: 'J_CUT', shots: ['S1-01-SH10', 'S1-01-SH11', 'S1-01-SH12', 'S1-01-SH13'] });
    expect(D.editJoins(withLine(clone(), 600, 60))[0].kind).toBe('L_CUT');
    expect(D.buildMultitrack(p).tracks.DIALOGUE[0].continuesUnderCut).toBe(true);
    const split = withLine(withLine(clone(), 528, 40), 600, 30);
    expect(codes(D.validateTimeline(split), 'ERROR')).toContain('CUTAWAY_CONTINUITY:FX-L001');
    const nosub = withLine(clone(), 528, 40);
    nosub.subtitles = nosub.subtitles.filter((s) => s.kind !== 'DIALOGUE');
    expect(codes(D.validateTimeline(nosub), 'WARNING')).toContain('SUBTITLE_SYNC:FX-L001');
  });

  it('traces keyframe provenance and inherited blockers', () => {
    expect(D.validateKeyframes(plan, new Set())).toEqual([]);
    expect(D.keyframeCounts(plan)).toMatchObject({ total: 22, generate: 20, extract: 2, reuse: 0, imagesToGenerate: 29 });
    for (const s of plan.shots.filter((x) => x.generated)) expect(plan.keyframes.find((k) => k.keyframeId === s.startFrameRef)!.usedBy).toContain(s.shotId);
    const blockers = D.effectiveBlockers(plan);
    expect(blockers.get('KF-SF-SH07')!.join(' ')).toContain('FD-S101-08');
    expect(blockers.get('KF-SF-SH14')!.join(' ')).toContain('FD-S101-03');
    const order = D.keyframeProductionOrder(plan);
    for (const k of plan.keyframes) for (const d of k.derivesFrom) expect(order.indexOf(d)).toBeLessThan(order.indexOf(k.keyframeId));
    const p = clone();
    const k = (id: string) => p.keyframes.find((x) => x.keyframeId === id)!;
    delete k('KF-ENV-CITY-DUSK-A').noReferenceJustification;
    k('KF-SF-SH03').derivesFrom = ['an-invented-asset'];
    k('KF-SF-SH07').candidates = 2;
    k('KF-ENV-CITY-DUSK-B').derivesFrom = ['KF-SF-SH05'];
    (k('KF-SF-SH04') as { output: unknown }).output = 'https://example.invalid/fake.png';
    p.keyframes.push({ ...k('KF-SF-SH04'), keyframeId: 'FX-REUSE', source: 'REUSE_APPROVED', reuseOf: 'richard-refinement-v1-oct22', output: null });
    expect(codes(D.validateKeyframes(p, new Set()), 'ERROR')).toEqual(expect.arrayContaining([
      'KEYFRAME_PROVENANCE:KF-ENV-CITY-DUSK-A', 'KEYFRAME_PROVENANCE:KF-SF-SH03', 'KEYFRAME_CANDIDATES:KF-SF-SH07', 'KEYFRAME_CYCLE:KF-ENV-CITY-DUSK-B', 'KEYFRAME_OUTPUT:KF-SF-SH04', 'KEYFRAME_REUSE:FX-REUSE',
    ]));
    shot(p, 9).startFrameRef = 'KF-SF-SH10';
    expect(codes(D.validateKeyframes(p, new Set()), 'ERROR')).toContain('START_FRAME_LINK:S1-01-SH09');
  });

  it('holds geography, characters and props across cuts', () => {
    expect(D.validateSpatialAuthority(plan.spatial).map((f) => f.severity)).toEqual(['ADVISORY']);
    expect(D.validatePhysicalContinuity(plan)).toEqual([]);
    expect(D.propChain(plan, 'Wine glass').map((s) => [s.shotId, s.holder, s.visible])).toEqual([['S1-01-SH11', null, true], ['S1-01-SH12', null, false], ['S1-01-SH16', W, true]]);
    const p = clone();
    p.transitions = p.transitions.filter((t) => t.subject !== 'Wine glass');
    p.transitions.find((t) => t.toShot === 'S1-01-SH14')!.method = 'OFF_SCREEN_DECLARED';
    p.continuity.find((s) => s.shotId === 'S1-01-SH03')!.characters.TAILOR.zone = 'Z-BUS-STOP';
    p.continuity.find((s) => s.shotId === 'S1-01-SH05')!.characters.TEENAGER.zone = 'Z-NOWHERE';
    shot(p, 4).landmarks = ['a landmark nobody recorded'];
    expect(codes(D.validatePhysicalContinuity(p))).toEqual(expect.arrayContaining([
      'PROP_TELEPORT:Wine glass', "OFF_SCREEN_VISIBLE:Neighbour's phone", 'CHARACTER_JUMP:TAILOR', 'STATE_ZONE:S1-01-SH05', 'LANDMARK_UNKNOWN:S1-01-SH04',
    ]));
  });

  it('treats silence as a decision and tracks music rights and sound restraint', () => {
    expect(D.validateMusicSupervision(plan)).toEqual([]);
    expect(D.validateSoundDesign(plan)).toEqual([]);
    const lic = D.licensingDependencies(plan.music);
    expect(lic.map((l) => l.cueId)).toEqual(['S1-01-MX01', 'S1-01-MX02', 'S1-01-MX03']);
    expect(lic.every((l) => l.status === 'NOT_CLEARED' && l.dependency!.includes('FD-S101-02'))).toBe(true);
    const p = clone();
    p.music.find((m) => m.cueType === 'SILENCE')!.relationToEditing = '';
    p.music[0].rights = { requirement: 'ORIGINAL_COMPOSITION', dependency: null, status: 'NOT_CLEARED' };
    p.music[1].rights = { requirement: 'LICENSED', dependency: null, status: 'CLEARED' };
    expect(codes(D.validateMusicSupervision(p), 'ERROR')).toEqual(expect.arrayContaining(['SILENCE_REASON:S1-01-MXS1', 'LICENSING:S1-01-MX01', 'LICENSING:S1-01-MX02']));
    for (const c of p.sound.filter((x) => x.track === 'FOLEY').slice(0, 3)) c.description = 'A whoosh into the next shot';
    p.sound[3].layer = 'AMBIENCE';
    expect(codes(D.validateSoundDesign(p))).toEqual(expect.arrayContaining(['DESIGNED_HITS:S1-01', 'SOUND_LAYER:S1-01-FL01']));
  });
});
