import type { DirectorialFinding, MusicCue, ProductionPlan } from './types.js';

const REQUIRED_MUSIC_FIELDS = ['title', 'genre', 'subgenre', 'mood', 'tempoRange', 'energy', 'dynamicArc', 'entry', 'exit', 'relationToDialogue', 'relationToSfx', 'relationToEditing'] as const;
const DESIGNED_HITS = /whoosh|riser|impact|boom|braam|swell hit/i;

/** Music supervision (sprint V2 §16). Silence is a cue; licensed or generated music records its dependency instead of being treated as cleared. */
export function validateMusicSupervision(plan: ProductionPlan): DirectorialFinding[] {
  const out: DirectorialFinding[] = [];
  const add = (severity: DirectorialFinding['severity'], code: string, subject: string, detail: string) => out.push({ severity, code, subject, detail });
  const ids = new Set<string>();
  for (const m of plan.music) {
    if (ids.has(m.cueId)) add('ERROR', 'MUSIC_DUPLICATE_ID', m.cueId, 'duplicate cue id');
    ids.add(m.cueId);
    if (m.cueType === 'SILENCE') {
      if (m.diegesis !== 'NONE' || m.vocal !== 'NONE' || m.rights.requirement !== 'NONE') add('ERROR', 'SILENCE_CUE', m.cueId, 'a silence cue has no diegesis, vocal or rights requirement');
      if (!m.relationToEditing.trim()) add('ERROR', 'SILENCE_REASON', m.cueId, 'silence is a decision; record why it serves the cut');
      continue;
    }
    for (const f of REQUIRED_MUSIC_FIELDS) if (!String(m[f] ?? '').trim()) add('ERROR', 'MUSIC_FIELD', m.cueId, `${f} is empty`);
    if (!m.functions.length) add('ERROR', 'MUSIC_FUNCTION', m.cueId, 'no dramatic function');
    if (!m.instrumentation.length) add('ERROR', 'MUSIC_FIELD', m.cueId, 'instrumentation is empty');
    if (m.diegesis === 'NONE') add('ERROR', 'MUSIC_DIEGESIS', m.cueId, 'a music cue is diegetic, non-diegetic or a declared transition between them');
    if (m.rights.requirement === 'LICENSED' && (!m.rights.dependency || m.rights.status === 'NOT_REQUIRED')) add('ERROR', 'LICENSING', m.cueId, 'licensed music records its clearance dependency');
    if (m.rights.requirement === 'ORIGINAL_COMPOSITION' && !m.rights.dependency) add('ERROR', 'LICENSING', m.cueId, 'an original cue records who or what composes it and on what terms');
    if (m.rights.status === 'CLEARED' && !m.rights.dependency) add('ERROR', 'LICENSING', m.cueId, 'CLEARED without evidence');
  }
  if (plan.dialogue.length) {
    const scored = plan.dialogue.filter((d) => plan.music.some((m) => m.cueType !== 'SILENCE' && m.diegesis === 'NON_DIEGETIC' && m.at < d.at + d.frames && d.at < m.at + m.frames));
    if (scored.length === plan.dialogue.length) add('ADVISORY', 'UNDERSCORE_EVERYWHERE', plan.unitId, 'every line plays under non-diegetic score; consider where silence or room tone serves better');
  }
  return out;
}

export function licensingDependencies(music: MusicCue[]) {
  return music
    .filter((m) => m.rights.requirement !== 'NONE')
    .map((m) => ({ cueId: m.cueId, title: m.title, requirement: m.rights.requirement, dependency: m.rights.dependency, status: m.rights.status, culturalReferences: m.culturalReferences }));
}

/** Sound design (sprint V2 §17): an ambience bed, perspective and reverb on every layer, and restraint with designed hits. */
export function validateSoundDesign(plan: ProductionPlan): DirectorialFinding[] {
  const out: DirectorialFinding[] = [];
  const add = (severity: DirectorialFinding['severity'], code: string, subject: string, detail: string) => out.push({ severity, code, subject, detail });
  const ids = new Set<string>();
  for (const c of plan.sound) {
    if (ids.has(c.cueId)) add('ERROR', 'SOUND_DUPLICATE_ID', c.cueId, 'duplicate cue id');
    ids.add(c.cueId);
    if (!c.description.trim()) add('ERROR', 'SOUND_FIELD', c.cueId, 'description is empty');
    if (c.layer !== 'SILENCE' && (!c.perspective.trim() || !c.reverb.trim())) add('ERROR', 'SOUND_PERSPECTIVE', c.cueId, 'perspective and reverb set the acoustic scale; both are required');
    if (c.track === 'AMBIENCE' && !['ROOM_TONE', 'AMBIENCE', 'CROWD', 'SILENCE'].includes(c.layer)) add('ERROR', 'SOUND_LAYER', c.cueId, `${c.layer} does not belong on the ambience track`);
    if (c.track !== 'AMBIENCE' && ['ROOM_TONE', 'AMBIENCE', 'CROWD'].includes(c.layer)) add('ERROR', 'SOUND_LAYER', c.cueId, `${c.layer} belongs on the ambience track`);
  }
  if (!plan.sound.some((c) => c.track === 'AMBIENCE')) add('ERROR', 'AMBIENCE_MISSING', plan.unitId, 'no ambience bed');
  const hits = plan.sound.filter((c) => DESIGNED_HITS.test(c.description));
  if (hits.length > 2) add('WARNING', 'DESIGNED_HITS', plan.unitId, `${hits.length} designed whooshes or impacts; keep transitions grounded`);
  return out;
}

export function audioSummary(plan: ProductionPlan) {
  const music = plan.music.filter((m) => m.cueType !== 'SILENCE');
  return {
    musicCues: music.length,
    silenceCues: plan.music.length - music.length,
    soundCues: plan.sound.length,
    byTrack: plan.sound.reduce<Record<string, number>>((a, c) => ({ ...a, [c.track]: (a[c.track] ?? 0) + 1 }), {}),
    dialogueEvents: plan.dialogue.length,
    licensing: licensingDependencies(plan.music),
  };
}
