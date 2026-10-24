import * as X from '../../../shared/site00-fiction-production/index.js';
import { bullets, generatedNote, LABEL_KEY, table } from './md.js';
import { assetsSection, authorizationSection, costSection, decisionsSection, soundSection, timelineSection } from './packetDoc2.js';

export type Packet = X.Directorial.ScenePacket;
type Row = Packet['sections']['4_SHOT_STORYBOARD']['shots'][number];

const SHOT_FIELDS: Array<[string, keyof Row]> = [
  ['Track', 'track'], ['Time', 'start'], ['Screen time', 'intendedScreenTime'], ['Generation', 'generationDuration'], ['Beat', 'beatId'], ['Priority', 'priority'],
  ['Purpose', 'purpose'], ['Subject', 'subject'], ['Framing', 'framing'], ['Camera height', 'cameraHeight'], ['Camera angle', 'cameraAngle'], ['Lens intent', 'lensIntent'],
  ['Focal length', 'focalLength'], ['Depth of field', 'depthOfField'], ['Camera movement', 'cameraMovement'], ['Movement speed', 'movementSpeed'], ['Camera direction', 'cameraDirection'],
  ['Composition', 'composition'], ['Screen direction', 'screenDirection'], ['Eyeline', 'eyeline'], ['Blocking', 'blocking'], ['Performance', 'performance'], ['Landmarks', 'landmarks'],
  ['Lighting', 'lighting'], ['Wardrobe', 'wardrobe'], ['Prop state', 'propState'], ['Coverage', 'dialogueVisibility'], ['Lip-sync', 'lipSync'], ['Motion class', 'motionClass'],
  ['Primary action', 'primaryAction'], ['Start frame', 'startFrame'], ['End frame', 'endFrame'], ['Reference assets', 'referenceAssets'], ['Edit transition', 'editTransition'],
  ['Continuity risk', 'continuityRisk'], ['Generation model', 'generationModel'], ['Expected cost', 'expectedCost'], ['Founder approval', 'founderApprovalStatus'],
  ['Why this framing', 'whyFraming'], ['Why this distance', 'whyDistance'], ['Why this angle', 'whyAngle'], ['Why this movement', 'whyMovement'], ['Why this moment', 'whyMoment'], ['Why this long', 'whyDuration'],
];

function overview(p: Packet): string {
  const o = p.sections['1_SCENE_OVERVIEW'];
  return ['## 1. Scene overview', '', table(['', ''], [
    ['Where', o.where], ['What happens', o.what], ['Why it matters', o.why], ['Emotional objective', o.emotionalObjective],
    ['Duration', `${o.estimatedDuration} (${p.fps} fps, ${p.aspect})`], ['Screenplay', `${o.screenplay.path} v${o.screenplay.version} — ${o.screenplay.status}`],
  ])].join('\n');
}

function screenplay(p: Packet): string {
  const s = p.sections['2_SCREENPLAY'];
  return [
    '## 2. Screenplay',
    '',
    'Verbatim from the file on record. No narration and no dialogue are added.',
    '',
    '```fountain',
    s.text.trimEnd(),
    '```',
    '',
    '### Performance direction',
    '',
    table(['Character', 'Shots', 'Objective', 'State', 'Subtext', 'Emphasis', 'Restraint', 'Body', 'Eyes', 'Micro-expressions', 'Reaction timing', 'Avoid'],
      s.performance.map((d) => [d.character, d.shots.join(' '), d.objective, d.emotionalState, d.subtext, d.emphasis, d.restraint, d.physicalBehavior, d.eyes, d.microExpressions, d.reactionTiming, d.avoid.join('; ')])),
  ].join('\n');
}

function treatment(p: Packet): string {
  const t = p.sections['3_DIRECTORS_TREATMENT'];
  return [
    "## 3. Director's treatment",
    '',
    table(['', ''], [['Feel', t.treatment.feel], ['Perspective', t.treatment.perspective], ['Visual language', t.treatment.language], ['Atmosphere', t.treatment.atmosphere], ['Rhythm', t.treatment.rhythm]]),
    '',
    '### Intent A–K',
    '',
    table(['', 'Field', 'Direction'], X.Directorial.INTENT_FIELDS.map((f) => [f.letter, f.label, f.get(t.intent)])),
    '',
    '### Lighting states',
    '',
    table(['State', 'Name', 'Description', 'Key', 'Palette', 'Shots'], t.lighting.map((l) => [l.id, l.name, l.description, l.keyDirection, l.palette.join(', '), l.shots.map((s) => s.replace(`${p.unitId}-`, '')).join(' ')])),
    '',
    '### Embellishments',
    '',
    LABEL_KEY,
    '',
    table(['Id', 'Label', 'What', 'Source', 'Affects'], t.embellishments.map((e) => [e.id, e.label, e.description, e.source, e.affects.join(' ')])),
  ].join('\n');
}

function storyboard(p: Packet): string {
  const s = p.sections['4_SHOT_STORYBOARD'];
  const shots = s.shots.map((r) => [`### ${r.shotId} · ${r.start}–${r.end}`, '', table(['Field', 'Direction'], SHOT_FIELDS.map(([label, key]) => [label, String(r[key])]))].join('\n'));
  return [
    '## 4. Shot storyboard',
    '',
    `${s.shots.length} shots. Every field is filled; lens numbers are not invented (\`focalLength\` states intent where no lens is chosen).`,
    '',
    shots.join('\n\n'),
    '',
    '### Keyframes',
    '',
    `${s.counts.total} keyframes: ${s.counts.generate} to generate (${s.counts.imagesToGenerate} images with candidates), ${s.counts.extract} extracted from approved footage, ${s.counts.reuse} reused. ${s.counts.blocked} are blocked until a founder decision.`,
    '',
    table(['Keyframe', 'Kind', 'Source', 'Used by', 'Derives from', 'Candidates', 'Blocked by'], s.keyframes.map((k) => [k.keyframeId, k.kind, k.source, k.usedBy.join(' '), k.extractFrom ? `${k.extractFrom.shotId} ${k.extractFrom.position}` : k.derivesFrom.join(' ') || k.noReferenceJustification, k.candidates, k.effectiveBlockers.join(' ')])),
    '',
    '#### Keyframe specifications',
    '',
    table(['Keyframe', 'Angle', 'Scale', 'Placement', 'Expression', 'Wardrobe', 'Lighting', 'Architecture', 'Props', 'Visible', 'Hidden'],
      s.keyframes.filter((k) => k.spec).map((k) => { const x = k.spec!; return [k.keyframeId, x.cameraAngle, x.shotScale, x.characterPlacement, x.expression, x.wardrobe, x.lighting, x.architecture, x.propOwnership, x.visible.join('; '), x.hidden.join('; ')]; })),
    '',
    `Production order: ${s.keyframeOrder.join(' → ')}.`,
  ].join('\n');
}

export function packetDoc(p: Packet): string {
  const v = p.validation;
  return [
    `# 19 — ${p.unitId} Dusk: complete directorial packet`,
    '',
    generatedNote([X.scenePath(p.unitId, X.SCENE_FILES.packet)]),
    '',
    `**Packet:** \`${p.packetId}\` · **Status:** ${p.status} · **Validation:** ${v.errors} errors, ${v.warnings} warnings, ${v.advisories} advisories.`,
    '',
    bullets(v.findings.map((f) => `${f.severity} ${f.code} ${f.subject}: ${f.detail}`)),
    '',
    overview(p), '', screenplay(p), '', treatment(p), '', storyboard(p), '',
    timelineSection(p), '', assetsSection(p), '', soundSection(p), '', costSection(p), '', decisionsSection(p), '', authorizationSection(p),
  ].join('\n');
}
