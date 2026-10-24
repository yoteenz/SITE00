import type * as X from '../../../shared/site00-fiction-production/index.js';
import { bullets, table } from './md.js';
import type { Packet } from './packetDoc.js';

type Person = { name: string; tier: string; releases: string[] };
type CastCtx = { people: Person[]; rule: string; registryCharacters: unknown[] };
type AssetsCtx = { sets: Array<{ setId: string; name: string; classification: string }>; props: Array<{ propId: string; name: string; status: string }>; approvedAssetIds: string[] };

const list = (xs: string[]) => xs.join('; ') || '—';

export function timelineSection(p: Packet): string {
  const t = p.sections['5_TIMELINE'];
  return [
    '## 5. Second-by-second timeline',
    '',
    `${t.events.length} picture events tile 00:00:00.000 to ${t.multitrack.sceneDuration.end} with no gap. Track activity: ${Object.entries(t.multitrack.trackDurations).map(([k, v]) => `${k} ${v.activeSec} s`).join(', ')}. The full record with every field is deliverable 20.`,
    '',
    table(['Event', 'Time', 'Shot', 'Beat', 'Visible action', 'Camera', 'Music', 'Sound', 'Keyframes', 'Cut'],
      t.events.map((e) => [e.eventId, `${e.start}–${e.end}`, e.shotId, e.narrativeBeat, e.visibleAction, `${e.cameraPosition}; ${e.cameraMovement}`, list(e.musicState), list([...e.audioSource, ...e.soundEffects]), list(e.keyframeRequirement), e.editTransition])),
  ].join('\n');
}

function stateCell(s: X.Directorial.ContinuityState): [string, string, string] {
  const chars = Object.entries(s.characters).map(([n, c]) => `${n}: ${c.zone}, ${c.posture}, ${c.wardrobeState}${c.visible ? '' : ' (unseen)'}`);
  const props = Object.entries(s.props).map(([n, r]) => `${n}: ${r.holder ?? 'nobody'} at ${r.location}, ${r.state}${r.visible ? '' : ' (unseen)'}`);
  return [s.shotId, list(chars), list(props)];
}

export function assetsSection(p: Packet): string {
  const a = p.sections['6_CHARACTERS_AND_ASSETS'];
  const cast = a.cast as CastCtx;
  const assets = a.assets as AssetsCtx;
  const sp = a.spatial.map((s) => [
    `### Spatial authority: ${s.setId} (${s.status})`,
    '',
    `${s.name}. Scale: ${s.scale}. Orientation: ${s.orientation}.`,
    '',
    table(['Zone', 'Name', 'Kind', 'Position', 'Landmarks', 'Camera-safe', 'Light'], s.zones.map((z) => [z.zoneId, z.name, z.kind, z.position, list(z.landmarks), list(z.cameraSafe), z.lightingDirection])),
    '',
    table(['From', 'To', 'Via'], s.travelPaths.map((t) => [t.from, t.to, t.via])),
    '',
    table(['Sightline from', 'To', 'Note'], s.sightlines.map((t) => [t.from, t.to, t.note])),
    '',
    '**Screen direction.**',
    '',
    bullets(s.screenDirectionRules),
    '',
    '**Never changes.**',
    '',
    bullets(s.immutable),
  ].join('\n'));
  return [
    '## 6. Characters and production assets',
    '',
    `**Rule.** ${cast.rule}`,
    '',
    table(['Person', 'Tier', 'Releases'], cast.people.map((x) => [x.name, x.tier, x.releases.join(' ')])),
    '',
    `Registered characters on screen: ${cast.registryCharacters.length}. Sets: ${assets.sets.map((s) => `${s.setId} (${s.classification})`).join(', ')}. Props: ${assets.props.map((x) => `${x.propId} (${x.status})`).join(', ')}.`,
    '',
    sp.join('\n\n'),
    '',
    '### Continuity states',
    '',
    table(['Shot', 'Characters', 'Props'], a.continuity.map(stateCell)),
    '',
    '### Declared transitions',
    '',
    table(['Subject', 'From', 'To', 'Change', 'Method', 'Note'], a.transitions.map((t) => [t.subject, t.fromShot, t.toShot, t.change, t.method, t.note])),
  ].join('\n');
}

export function soundSection(p: Packet): string {
  const s = p.sections['7_MUSIC_AND_SOUND'];
  return [
    '## 7. Music and sound',
    '',
    `${s.summary.musicCues} music cues, ${s.summary.silenceCues} declared silence, ${s.summary.soundCues} sound cues (${Object.entries(s.summary.byTrack).map(([k, v]) => `${k} ${v}`).join(', ')}), ${s.summary.dialogueEvents} dialogue events. Full direction: deliverables 14 and 15; sync map: 16; cue sheet: 23.`,
    '',
    table(['Cue', 'Track', 'Type', 'Time', 'What', 'Sync', 'Label'], s.cueSheet.map((c) => [c.cueId, c.track, c.type, `${c.start}–${c.end}`, c.description, c.sync, c.label])),
  ].join('\n');
}

export function costSection(p: Packet): string {
  const b = p.sections['8_PRODUCTION_COST'];
  return [
    '## 8. Production cost',
    '',
    `Base estimate ${b.estimated.credits.toLocaleString('en-US')} OpenArt credits and $${b.estimated.usd.toFixed(2)} on fal; expected with revisions ${b.expectedTotalCredits.toLocaleString('en-US')} credits; ceiling ${b.ceilingCredits.toLocaleString('en-US')}. Unknown: ${b.estimated.unknownLines.join(', ') || 'none'}. Authorized and spent: 0. Detail: deliverable 24.`,
  ].join('\n');
}

export function decisionsSection(p: Packet): string {
  const d = p.sections['9_FOUNDER_DECISIONS'];
  return [
    '## 9. Founder decisions',
    '',
    table(['Decision', 'Question', 'Why it matters', 'Options', 'Recommendation', 'Blocks', 'Status'], d.map((x) => [x.decisionId, x.question, x.why, x.options.join(' / '), x.recommendation, x.blocks.join(' '), x.status])),
  ].join('\n');
}

export function authorizationSection(p: Packet): string {
  const a = p.sections['10_PRODUCTION_AUTHORIZATION'];
  return [
    '## 10. Production authorization',
    '',
    table(['Step', 'State', 'By', 'At', 'Scope'], Object.entries(a.steps).map(([k, s]) => [k, s.state, s.actor, s.at, s.scope ? s.scope.join(' ') : null])),
    '',
    `${a.elementsPending} of ${a.elementsTotal} review elements are pending. No generation job can pass the gate until the matching steps are authorized by the founder.`,
  ].join('\n');
}
