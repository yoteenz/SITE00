import * as X from '../../../shared/site00-fiction-production/index.js';
import { bullets, generatedNote, range, table, tc } from './md.js';

type Plan = X.Directorial.ProductionPlan;
const D = X.Directorial;
const M = 'shared/site00-fiction-production/directorial';
const src = (plan: Plan) => [`${M}/audio.ts`, X.scenePath(plan.unitId, X.SCENE_FILES.cueSheet), X.scenePath(plan.unitId, X.SCENE_FILES.packet)];
const pk = (id: string) => D.PRODUCTION_KNOWLEDGE.find((k) => k.entryId === id)?.statement ?? id;

export function musicDoc(plan: Plan): string {
  const fps = plan.fps;
  const score = plan.music.filter((m) => m.cueType !== 'SILENCE');
  const silence = plan.music.filter((m) => m.cueType === 'SILENCE');
  return [
    '# 14 — Music supervision system',
    '',
    generatedNote(src(plan)),
    '',
    `**Season palette (PK-014, founder).** ${pk('PK-014')}`,
    '',
    '## Rules the engine enforces',
    '',
    bullets([
      'Every frame of a unit has a music decision: a cue or a declared SILENCE. An undecided frame is an error (`MUSIC_DECISION_GAP`).',
      'A silence cue has no diegesis, vocal or rights requirement, and records why it serves the cut.',
      'Every music cue records title, genre, subgenre, mood, tempo, energy, dynamic arc, entry, exit, its relation to dialogue, sound effects and editing, at least one dramatic function and its instrumentation.',
      'Diegesis is declared: diegetic, non-diegetic, or a declared move between them.',
      'An original cue names who or what composes it and on what terms; licensed music names its clearance dependency; nothing is CLEARED without evidence.',
      'Hit points sit inside their cue and are checked against picture (deliverable 16).',
      'If every line of a scene sits under non-diegetic score, the engine suggests where room tone or silence would serve better.',
    ]),
    '',
    `## ${plan.unitId} cues`,
    '',
    table(['Cue', 'Time', 'Type', 'Diegesis', 'Genre', 'Tempo', 'Instrumentation', 'Functions', 'Label'],
      score.map((m) => [m.cueId, range(m.at, m.frames, fps), m.cueType, m.diegesis, `${m.genre} / ${m.subgenre}`, m.tempoRange, m.instrumentation.join(', '), m.functions.join(', '), m.label])),
    '',
    score.map((m) => [
      `### ${m.cueId} — ${m.title}`,
      '',
      table(['Field', 'Direction'], [
        ['Mood', m.mood], ['Energy', m.energy], ['Dynamic arc', m.dynamicArc], ['Entry', m.entry], ['Exit', m.exit],
        ['Against dialogue', m.relationToDialogue], ['Against sound effects', m.relationToSfx], ['Against the edit', m.relationToEditing],
        ['Cultural reference', m.culturalReferences], ['Vocal', m.vocal],
        ['Hit points', m.hitPoints.map((h) => `${tc(h.frame, fps)} ${h.event}`).join('; ')],
      ]),
    ].join('\n')).join('\n\n'),
    '',
    '## Silence as a decision',
    '',
    table(['Cue', 'Time', 'What it is', 'Why'], silence.map((m) => [m.cueId, range(m.at, m.frames, fps), m.title, m.relationToEditing])),
    '',
    '## Rights and route',
    '',
    table(['Cue', 'Requirement', 'Status', 'Dependency'], D.licensingDependencies(plan.music).map((l) => [l.cueId, l.requirement, l.status, l.dependency])),
    '',
    'No cue is cleared. The composer route is founder decision FD-S101-02; generated-music commercial terms need founder review before release.',
  ].join('\n');
}

export function soundDoc(plan: Plan): string {
  const fps = plan.fps;
  const mt = D.buildMultitrack(plan);
  return [
    '# 15 — Sonic atmosphere and sound design system',
    '',
    generatedNote(src(plan)),
    '',
    '## Layers',
    '',
    table(['Track', 'Layers', 'Purpose'], [
      ['AMBIENCE', 'ROOM_TONE, AMBIENCE, CROWD, SILENCE', 'The bed under picture: where we are and how far away.'],
      ['FOLEY', 'FOLEY, SILENCE', 'Touch: fabric, metal, glass, feet. Synced to visible action.'],
      ['SFX', 'SFX, SILENCE', 'Designed effects, used sparingly. More than two designed whooshes or impacts in a unit is flagged.'],
    ]),
    '',
    bullets([
      'Every layer that makes sound records its perspective (distance and position) and its reverb (the space it sits in).',
      'Every generated shot has an ambience bed under it; a dropout is flagged.',
      'A sound linked to a shot must overlap that shot; sync points sit inside their cue.',
      'A SILENCE layer is a deliberate absence and is never generated or paid for.',
    ]),
    '',
    `## ${plan.unitId} atmosphere`,
    '',
    `Track coverage: ${(['AMBIENCE', 'FOLEY', 'SFX'] as const).map((t) => `${t} ${mt.trackDurations[t].events} events, ${mt.trackDurations[t].activeSec} s`).join('; ')}. Picture runs ${D.framesToSec(plan.durationFrames, fps)} s.`,
    '',
    table(['Cue', 'Track', 'Layer', 'Time', 'Sound', 'Perspective', 'Reverb', 'Linked shots', 'Under cut', 'Label'],
      plan.sound.map((c) => [c.cueId, c.track, c.layer, range(c.at, c.frames, fps), c.description, c.perspective, c.reverb, c.linkedShots.join(' '), c.continuesUnderCut ? 'yes' : 'no', c.label])),
  ].join('\n');
}

export function syncDoc(plan: Plan): string {
  const fps = plan.fps;
  const placed = D.placeShots(plan.shots).filter((s) => !s.overlay);
  const shotAt = (f: number) => placed.find((s) => f >= s.at && f < s.at + s.frames)?.shotId ?? (f === plan.durationFrames ? 'END' : 'NONE');
  const cutAt = (f: number) => placed.some((s) => s.at === f) || f === plan.durationFrames;
  const points = [
    ...plan.music.flatMap((m) => m.hitPoints.map((h) => ({ frame: h.frame, source: m.cueId, event: h.event }))),
    ...plan.sound.flatMap((c) => c.syncPoints.map((h) => ({ frame: h.frame, source: c.cueId, event: h.event }))),
  ].sort((a, b) => a.frame - b.frame || a.source.localeCompare(b.source));
  const mt = D.buildMultitrack(plan);
  return [
    '# 16 — Audio-visual synchronization system',
    '',
    generatedNote([`${M}/timeline.ts`, `${M}/events.ts`, X.scenePath(plan.unitId, X.SCENE_FILES.multitrack)]),
    '',
    '## Clock',
    '',
    `Frames are authoritative at ${fps} fps (provisional, FD-S101-09). Timecodes are derived, never typed. Tracks are measured separately and never summed: the unit runtime is the picture sequence.`,
    '',
    table(['Track', 'Events', 'Active'], D.TRACKS.map((t) => [t, mt.trackDurations[t].events, `${mt.trackDurations[t].activeSec} s`])),
    '',
    '## Dialogue and lip-sync rules',
    '',
    bullets([
      pk('PK-009'),
      'Lip-sync is required on a shot only when a speaking mouth is in frame (`LIPSYNC_MISSING` otherwise); lip-sync with no speaking mouth is `ARTIFICIAL_MOUTH_MOTION`; a listener reaction never carries it.',
      'A line that appears twice in the timeline has been split around a cutaway (`CUTAWAY_CONTINUITY`).',
      'Each line is classified as on camera, J-cut (heard before the speaker is seen), L-cut (heard after) or off-screen only.',
      'Dialogue subtitles share the exact span of their line; a mismatch is a warning.',
      'Dialogue audio is recorded and locked before any speaking shot is generated.',
    ]),
    '',
    `${plan.unitId} has ${plan.dialogue.length} dialogue events, so no lip-sync job and no edit join. Its ${plan.subtitles.length} subtitle events are accessibility descriptions.`,
    '',
    '## Sync map',
    '',
    'Every music hit point and sound sync point, with the picture under it.',
    '',
    table(['Frame', 'Timecode', 'Source', 'Event', 'Picture', 'On a cut'], points.map((p) => [p.frame, tc(p.frame, fps), p.source, p.event, shotAt(p.frame), cutAt(p.frame) ? 'yes' : ''])),
    '',
    '## Accessibility subtitles',
    '',
    table(['Event', 'Time', 'Text'], plan.subtitles.map((t) => [t.eventId, range(t.at, t.frames, fps), t.text])),
  ].join('\n');
}
