import * as X from '../../../shared/site00-fiction-production/index.js';
import { bullets, generatedNote, range, table } from './md.js';
import type { Packet } from './packetDoc.js';

const n = (v: number) => v.toLocaleString('en-US');

export function founderReviewDoc(p: Packet, index: X.SceneIndex): string {
  const o = p.sections['1_SCENE_OVERVIEW'];
  const t = p.sections['3_DIRECTORS_TREATMENT'];
  const s = p.sections['4_SHOT_STORYBOARD'];
  const m = p.sections['7_MUSIC_AND_SOUND'];
  const b = p.sections['8_PRODUCTION_COST'];
  const plan = X.S1_01_PLAN;
  const fps = p.fps;
  const labels = t.embellishments.reduce<Record<string, number>>((a, e) => ({ ...a, [e.label]: (a[e.label] ?? 0) + 1 }), {});
  const shotById = new Map(s.shots.map((r) => [r.shotId, r]));
  const short = (at: number, frames: number) => range(at, frames, fps).replace(/(^|–)00:/g, '$1');
  const seen = (e: (typeof p.sections)['5_TIMELINE']['events'][number]) => {
    const action = shotById.get(e.shotId)?.primaryAction;
    return action && action !== 'NONE' ? action : e.narrativeBeat.replace(/^[^:]+:\s*/, '');
  };
  return [
    `# THE EXCHANGE — founder review: ${p.unitId} Dusk`,
    '',
    generatedNote([X.scenePath(p.unitId, X.SCENE_FILES.packet), `${X.EXCHANGE_PATHS.season}/SEASON1_SCENE_INDEX_V1.json`]),
    '',
    'One scene is in review. Everything else in the season is tracked silently. Deep evidence is in deliverables 01–27 beside this file.',
    '',
    '## A. What changed in the production engine',
    '',
    bullets([
      'Scenes are now planned to the frame (24 fps) on eight tracks: two picture, dialogue, ambience, foley, effects, music, subtitles. Gaps, overlaps and drift are caught before anything is generated.',
      'Shot length follows the motion in the shot; each shot carries one main action and answers why this framing, distance, angle, movement, moment and length.',
      'Keyframes record where they come from, and inherit any founder decision that blocks their source.',
      'Rooms, people and props keep their positions and states from shot to shot; any change must be shown or declared.',
      'Silence is a music decision. Every cue records its rights and route; nothing is treated as cleared.',
      'Costs come only from recorded quotes. Anything unquoted is UNKNOWN. A pre-spend gate needs your step-by-step approval and never spends by itself.',
      'You can approve part of a scene and change one thing in plain language; only what depends on that change is reopened.',
      'One cast registry over the existing ones. The ElevenLabs voices for Sloane, Gideon and Kai are linked as you verified them through your connector; this environment did not verify them independently and cannot edit the voice library.',
    ]),
    '',
    '## B. What is already complete',
    '',
    bullets([
      `All ${index.totals.releases} releases are indexed with writing briefs from the approved master; ${index.totals.drafted} screenplays are drafted (DRAFT, not approved); ${index.totals.plannedFromMaster} are planned from the master.`,
      `${p.unitId} is fully directed: ${s.shots.length} shots, ${s.counts.total} keyframes, ${m.summary.musicCues} music cues and ${m.summary.silenceCues} declared silence, ${m.summary.soundCues} sound cues, ${plan.subtitles.length} accessibility subtitles.`,
      `Validation: ${p.validation.errors} errors, ${p.validation.warnings} warnings, ${p.validation.advisories} advisories (reasons on record).`,
      'No credits spent. Nothing published or deployed.',
    ]),
    '',
    '## C. What can now be automated',
    '',
    bullets([
      'From a directed plan: timecodes, multitrack, second-by-second events, shot list, cue sheet, keyframe manifest, budget and the ten-section packet.',
      'Checks: timing, sync, motion bands, lip-sync need, keyframe provenance, spatial and prop continuity, music rights, sound restraint.',
      'Change impact, partial approvals, the spend gate, and silent tracking of future cast and asset needs.',
      'Still by hand: writing each directed scene (the engine checks it), dispatching paid jobs after your approval, recording voices (no ElevenLabs credential here), composing, and the final edit.',
    ]),
    '',
    '## D. The current production scene',
    '',
    table(['', ''], [['Release', `${p.unitId} Dusk — first release of Season 1`], ['Length', `${o.estimatedDuration}, ${p.aspect}, wordless`], ['Where', o.where], ['What', o.what], ['Why', o.why], ['Feeling', o.emotionalObjective], ['Screenplay', `v${o.screenplay.version}, ${o.screenplay.status}`]]),
    '',
    '## E. Directorial treatment',
    '',
    table(['', ''], [
      ['Feel', t.treatment.feel], ['Point of view', t.intent.cinematicPointOfView], ['Emotional center', t.intent.emotionalCenter], ['Camera', t.intent.visualDramaturgy.camera],
      ['Light', t.intent.visualDramaturgy.light], ['Sound', t.intent.sonicIdentity], ['Ending', t.intent.endingImpression],
    ]),
    '',
    `Creative choices are labelled: ${Object.entries(labels).map(([k, v]) => `${v} ${k}`).join(', ')}. The inhabitants are directed as people with lives and get no permanent packages. The Ember look and Halcyon House exterior are not invented: both wait for you (FD-S101-03, FD-S101-04).`,
    '',
    '## F. Timeline',
    '',
    table(['Time', 'Shot', 'What we see', 'Music', 'Cut'], p.sections['5_TIMELINE'].events.map((e) => [`${e.start.slice(3)}–${e.end.slice(3)}`, e.shotId.replace(`${p.unitId}-`, ''), seen(e), e.musicState.map((x) => x.split(' — ')[0]).join(', '), e.editTransition])),
    '',
    '## G. Music and sound',
    '',
    table(['Cue', 'Time', 'What', 'Label'], [
      ...plan.music.map((c) => [c.cueId.replace(`${p.unitId}-`, ''), short(c.at, c.frames), c.cueType === 'SILENCE' ? `Silence: ${c.title}` : `${c.title}: ${c.genre}, ${c.tempoRange}, ${c.instrumentation.slice(0, 4).join(', ')}`, c.label]),
      ...plan.sound.filter((c) => c.track !== 'FOLEY').map((c) => [c.cueId.replace(`${p.unitId}-`, ''), short(c.at, c.frames), c.description, c.label]),
    ]),
    '',
    `Plus ${plan.sound.filter((c) => c.track === 'FOLEY').length} foley cues synced to hands, fabric and glass (deliverable 15).`,
    '',
    '## H. Decisions needed from you',
    '',
    'Reply with the decision id and your choice, for example "FD-S101-01 approve v2". Nothing moves until you do.',
    '',
    table(['Decision', 'Question', 'Recommendation', 'Unblocks'], p.sections['9_FOUNDER_DECISIONS'].map((d) => [d.decisionId, d.question, d.recommendation, d.blocks.join(' ')])),
    '',
    '## I. Expected cost',
    '',
    table(['', 'OpenArt credits', 'fal'], [
      ['Base estimate', n(b.estimated.credits), `$${b.estimated.usd.toFixed(2)}`],
      ['Expected with retakes', n(b.expectedTotalCredits), `$${b.estimated.usd.toFixed(2)}`],
      ['Ceiling', n(b.ceilingCredits), '—'],
      ['Authorized / spent', '0 / 0', '$0.00 / $0.00'],
    ]),
    '',
    `Balance at quote: ${n(b.balanceCreditsAtQuote)} credits. OpenArt credits have no published dollar rate, so they are not converted. Assembly (${b.estimated.unknownLines.join(', ')}) and a commissioned score are UNKNOWN. Recommended: authorize references and keyframes first, then video once you approve the frames.`,
  ].join('\n');
}
